"""
Community Energy Calculator - Calculation Engine (Python)

Ported from the JavaScript implementation.
Calculates residential electricity bill impacts from data center development.
"""

import numpy as np
from typing import Dict, Any, List

# ============================================
# CONSTANTS
# ============================================

SCENARIOS = {
    'baseline': {
        'id': 'baseline',
        'name': 'Baseline',
        'color': '#6B7280',
    },
    'unoptimized': {
        'id': 'unoptimized',
        'name': 'Firm Load',
        'color': '#DC2626',
    },
    'flexible': {
        'id': 'flexible',
        'name': 'Flexible Load',
        'color': '#F59E0B',
    },
    'dispatchable': {
        'id': 'dispatchable',
        'name': 'Flex + Generation',
        'color': '#10B981',
    },
}

DEFAULT_UTILITY = {
    'residential_customers': 560000,
    'commercial_customers': 85000,
    'industrial_customers': 5000,
    'avg_monthly_bill': 130,
    'pre_dc_system_energy_gwh': 20000,
    'residential_energy_share': 0.35,
    'system_peak_mw': 4000,
    'base_residential_allocation': 0.40,
}

# Based on EPRI DCFlex research (2024): 25% sustained reduction achievable,
# up to 40% while maintaining AI quality of service
# Sources: IEEE Spectrum, arXiv:2507.00909, Latitude Media/Databricks
DEFAULT_DATA_CENTER = {
    'capacity_mw': 1000,
    'firm_load_factor': 0.80,
    'firm_peak_coincidence': 1.0,
    'flex_load_factor': 0.95,
    'flex_peak_coincidence': 0.75,  # 25% curtailable (DCFlex validated)
    'onsite_generation_mw': 200,
}

INFRASTRUCTURE_COSTS = {
    'transmission_cost_per_mw': 350000,
    'distribution_cost_per_mw': 150000,
    'capacity_cost_per_mw_year': 150000,
    'annual_baseline_upgrade_pct': 0.015,
}

DC_RATE_STRUCTURE = {
    # Split demand charges into coincident peak (CP) and non-coincident peak (NCP) components
    # CP charges are based on contribution during system peak hours
    # NCP charges are based on customer's own monthly peak (any time)
    'coincident_peak_charge_per_mw_month': 5430,  # ~60% of total demand charge
    'non_coincident_peak_charge_per_mw_month': 3620,  # ~40% of total demand charge
    'demand_charge_per_mw_month': 9050,  # Total for backwards compatibility
    'energy_margin_per_mwh': 4.88,
    # ERCOT 4CP transmission allocation rate
    'ercot_4cp_transmission_rate': 5.50,  # $/kW-month based on 4CP contribution
}

TIME_PARAMS = {
    'base_year': 2025,
    'general_inflation': 0.025,
    'projection_years': 10,
}

# ============================================
# TARIFF STRUCTURE PRESETS
# Based on actual utility rate schedules
# ============================================

# Demand charge structure types
DEMAND_CHARGE_TYPES = {
    'TOU_PEAK_NCP': 'Time-of-use peak demand + Non-coincident peak',
    'COINCIDENT_PEAK': 'Based on contribution to system peak',
    'CP_1_5': '1CP transmission + 5CP capacity (PJM)',
    'CP_4': 'Four coincident peak (ERCOT)',
    'ROLLING_RATCHET': 'NCP with rolling ratchet',
}

# PSO Large Power & Light (LPL) - Schedule 242/244/246
PSO_TARIFF = {
    'demand_charge_type': 'TOU_PEAK_NCP',
    'peak_demand_charge': 7050,  # $7.05/kW at Transmission level
    'max_demand_charge': 2470,   # $2.47/kW at Transmission level
    'energy_charge': 1.708,      # $0.001708/kWh at Transmission level
    'ratchet_percent': 0.90,
    'ratchet_months': 11,
    'on_peak_definition': '2pm-9pm Mon-Fri, June 1 - September 30',
    'flexibility_benefit_multiplier': 1.4,
    'tariff_source': 'PSO LPL Schedule 242/244/246, effective 1/30/2025',
}

# Dominion Virginia GS-4 (Large General Service)
DOMINION_TARIFF = {
    'demand_charge_type': 'TOU_PEAK_NCP',
    'peak_demand_charge': 8769,  # $8.769/kW on-peak (transmission voltage)
    'max_demand_charge': 515,    # $0.515/kW off-peak
    'energy_charge': 27.0,
    'ratchet_percent': 0.90,
    'ratchet_months': 11,
    'on_peak_definition': 'Seasonal TOU periods defined by Dominion',
    'flexibility_benefit_multiplier': 1.6,
    'tariff_source': 'Dominion Virginia GS-4 Schedule, effective 1/1/2025',
}

# Duke Energy Carolinas LGS (Large General Service)
DUKE_TARIFF = {
    'demand_charge_type': 'COINCIDENT_PEAK',
    'peak_demand_charge': 5200,
    'max_demand_charge': 3500,   # Distribution component
    'energy_charge': 35.0,
    'ratchet_percent': 0.70,
    'ratchet_months': 12,
    'on_peak_definition': 'System coincident peak hours',
    'flexibility_benefit_multiplier': 1.2,
    'tariff_source': 'Duke Energy Carolinas LGS Schedule',
}

# Georgia Power PLL-18 (Power and Light Large)
GEORGIA_POWER_TARIFF = {
    'demand_charge_type': 'ROLLING_RATCHET',
    'peak_demand_charge': 13270,  # $13.27/kW of billing demand
    'max_demand_charge': 0,       # Included in peak (rolling max)
    'energy_charge': 14.27,
    'ratchet_percent': 0.95,
    'ratchet_months': 12,
    'on_peak_definition': 'Summer months weighted at 95%, Winter at 60%',
    'flexibility_benefit_multiplier': 1.3,
    'tariff_source': 'Georgia Power PLL-18 Schedule, 2025',
}

# AEP Ohio GS-4 with PJM market overlay
AEP_OHIO_TARIFF = {
    'demand_charge_type': 'CP_1_5',
    'peak_demand_charge': 6500,   # Base demand + transmission
    'max_demand_charge': 2000,    # Distribution
    'energy_charge': 45.0,
    'ratchet_percent': 0.85,
    'ratchet_months': 12,
    'on_peak_definition': '1CP for transmission, 5CP for PJM capacity',
    'flexibility_benefit_multiplier': 1.5,
    'tariff_source': 'AEP Ohio GS-4 + PJM capacity charges',
}

# ERCOT - 4CP transmission allocation
ERCOT_TARIFF = {
    'demand_charge_type': 'CP_4',
    'peak_demand_charge': 5500,   # 4CP-based transmission (~$5.50/kW-month)
    'max_demand_charge': 1500,    # Distribution/local charges
    'energy_charge': 50.0,
    'ratchet_percent': None,
    'ratchet_months': 0,
    'on_peak_definition': '4 highest system peak hours per year (one per season)',
    'flexibility_benefit_multiplier': 1.8,
    'tariff_source': 'ERCOT 4CP transmission allocation methodology',
}

# Generic regulated utility tariff
GENERIC_TARIFF = {
    'demand_charge_type': 'COINCIDENT_PEAK',
    'peak_demand_charge': 5430,
    'max_demand_charge': 3620,
    'energy_charge': 30.0,
    'ratchet_percent': 0.80,
    'ratchet_months': 12,
    'on_peak_definition': 'Utility-defined peak periods',
    'flexibility_benefit_multiplier': 1.0,
    'tariff_source': 'Generic regulated utility assumptions',
}


# ============================================
# RESIDENTIAL ALLOCATION MODEL
# ============================================

def calculate_residential_allocation(
    utility: Dict,
    dc_capacity_mw: float,
    dc_load_factor: float,
    dc_peak_coincidence: float,
    years_online: int = 0
) -> Dict:
    """
    Calculate residential cost allocation based on tariff structure.
    Uses weighted blend: 40% volumetric, 40% demand, 20% customer.
    """
    # Pre-DC system energy (convert GWh to MWh)
    pre_dc_system_energy_mwh = utility['pre_dc_system_energy_gwh'] * 1000
    residential_energy_mwh = pre_dc_system_energy_mwh * utility['residential_energy_share']

    # DC annual energy contribution
    dc_annual_energy_mwh = dc_capacity_mw * dc_load_factor * 8760

    # Post-DC system energy (phases in over time)
    phase_in_factor = min(1.0, years_online / 3)
    post_dc_system_energy_mwh = pre_dc_system_energy_mwh + (dc_annual_energy_mwh * phase_in_factor)

    # Residential volumetric share
    residential_volumetric_share = residential_energy_mwh / post_dc_system_energy_mwh

    # System peak calculations
    pre_dc_peak_mw = utility['system_peak_mw']
    residential_peak_share = 0.45
    residential_peak_mw = pre_dc_peak_mw * residential_peak_share

    # DC contribution to peak
    dc_peak_contribution = dc_capacity_mw * dc_peak_coincidence * phase_in_factor
    post_dc_peak_mw = pre_dc_peak_mw + dc_peak_contribution

    # Residential demand share
    residential_demand_share = residential_peak_mw / post_dc_peak_mw

    # Customer-based share
    total_customers = (utility['residential_customers'] +
                      utility['commercial_customers'] +
                      utility['industrial_customers'] + 1)
    residential_customer_share = utility['residential_customers'] / total_customers

    # Weighted blend (40% volumetric, 40% demand, 20% customer)
    weighted_allocation = (
        residential_volumetric_share * 0.40 +
        residential_demand_share * 0.40 +
        residential_customer_share * 0.20
    )

    # Regulatory lag (5-year phase-in)
    regulatory_lag_factor = min(1.0, years_online / 5)
    base_allocation = utility['base_residential_allocation']
    adjusted_allocation = (base_allocation * (1 - regulatory_lag_factor) +
                          weighted_allocation * regulatory_lag_factor)

    return {
        'allocation': max(0.15, min(0.50, adjusted_allocation)),
        'volumetric_share': residential_volumetric_share,
        'demand_share': residential_demand_share,
        'customer_share': residential_customer_share,
    }


# ============================================
# TARIFF-BASED DEMAND CHARGE CALCULATIONS
# ============================================

def calculate_tariff_based_demand_charges(
    dc_capacity_mw: float,
    load_factor: float,
    peak_coincidence: float,
    tariff: Dict
) -> Dict:
    """
    Calculate demand charges and revenue based on utility-specific tariff structure.

    Different utilities have very different demand charge structures:
    - TOU_PEAK_NCP: PSO/Dominion style - separate peak (TOU) and max (NCP) charges
    - COINCIDENT_PEAK: Duke style - based on system coincident peak
    - CP_1_5: AEP Ohio/PJM style - 1CP transmission + 5CP capacity
    - CP_4: ERCOT style - 4 coincident peaks determine transmission costs
    - ROLLING_RATCHET: Georgia Power style - 12-month rolling maximum
    """
    is_flexible = peak_coincidence < 1.0
    annual_mwh = dc_capacity_mw * load_factor * 8760
    demand_type = tariff.get('demand_charge_type', 'COINCIDENT_PEAK')

    if demand_type == 'TOU_PEAK_NCP':
        # PSO/Dominion style: Peak demand based on on-peak usage, Max based on any-time peak
        peak_demand_mw = dc_capacity_mw * peak_coincidence
        max_demand_mw = dc_capacity_mw  # NCP is based on installed capacity

        # Apply ratchet if defined
        if tariff.get('ratchet_percent') and tariff.get('ratchet_months'):
            ratchet_multiplier = 1.0 if is_flexible else 1.05
            peak_demand_mw *= ratchet_multiplier

    elif demand_type == 'COINCIDENT_PEAK':
        # Duke style: Both charges based on coincident peak contribution
        peak_demand_mw = dc_capacity_mw * peak_coincidence
        max_demand_mw = dc_capacity_mw * peak_coincidence * 0.85

        if tariff.get('ratchet_percent'):
            peak_demand_mw = max(peak_demand_mw, dc_capacity_mw * tariff['ratchet_percent'])

    elif demand_type == 'CP_1_5':
        # AEP Ohio/PJM style: 1CP for transmission, 5CP for capacity
        cp_avoidance_multiplier = 0.65 if is_flexible else 1.0
        peak_demand_mw = dc_capacity_mw * peak_coincidence * cp_avoidance_multiplier
        max_demand_mw = dc_capacity_mw * 0.3

    elif demand_type == 'CP_4':
        # ERCOT style: 4 coincident peaks determine transmission costs
        four_cp_avoidance = 0.50 if is_flexible else 1.0
        peak_demand_mw = dc_capacity_mw * peak_coincidence * four_cp_avoidance
        max_demand_mw = dc_capacity_mw * 0.25

    elif demand_type == 'ROLLING_RATCHET':
        # Georgia Power style: 12-month rolling maximum
        peak_demand_mw = dc_capacity_mw * peak_coincidence
        max_demand_mw = 0

        if tariff.get('ratchet_percent'):
            summer_multiplier = 0.85 if is_flexible else 1.0
            peak_demand_mw *= (1 + (tariff['ratchet_percent'] - 1) * summer_multiplier)

    else:
        # Fallback to simple CP/NCP split
        peak_demand_mw = dc_capacity_mw * peak_coincidence
        max_demand_mw = dc_capacity_mw

    # Calculate annual revenues
    peak_demand_revenue = peak_demand_mw * tariff['peak_demand_charge'] * 12
    max_demand_revenue = max_demand_mw * tariff['max_demand_charge'] * 12
    total_demand_revenue = peak_demand_revenue + max_demand_revenue
    energy_revenue = annual_mwh * tariff['energy_charge']
    total_revenue = total_demand_revenue + energy_revenue

    # Calculate flexibility benefit (savings vs firm load)
    firm_peak_revenue = dc_capacity_mw * tariff['peak_demand_charge'] * 12
    firm_max_revenue = dc_capacity_mw * tariff['max_demand_charge'] * 12
    firm_total_demand = firm_peak_revenue + firm_max_revenue
    flexibility_benefit = (firm_total_demand - total_demand_revenue) if is_flexible else 0

    return {
        'peak_demand_revenue': peak_demand_revenue,
        'max_demand_revenue': max_demand_revenue,
        'total_demand_revenue': total_demand_revenue,
        'energy_revenue': energy_revenue,
        'total_revenue': total_revenue,
        'flexibility_benefit': flexibility_benefit,
        'peak_demand_mw': peak_demand_mw,
        'max_demand_mw': max_demand_mw,
        'annual_mwh': annual_mwh,
        'tariff_type': demand_type,
    }


# ============================================
# CORE ECONOMIC MODEL
# ============================================

def calculate_dc_revenue_offset(
    dc_capacity_mw: float,
    load_factor: float,
    peak_coincidence: float,
    effective_capacity_mw: float = None,
    market_type: str = 'regulated'
) -> Dict:
    """
    Calculate revenue contribution from data center.

    Key insight: Demand charges have two components:
    1. Coincident Peak (CP): Based on usage during system peak hours
       - Flexible DCs pay LESS because they curtail during system peaks
    2. Non-Coincident Peak (NCP): Based on customer's own monthly peak
       - Both firm and flexible DCs pay similar NCP charges
    """
    # Effective capacity for NCP charges (may be higher for flexible DCs)
    if effective_capacity_mw is None:
        effective_capacity_mw = dc_capacity_mw

    # Coincident peak demand charges - based on contribution during system peak
    coincident_peak_mw = dc_capacity_mw * peak_coincidence
    annual_cp_demand_revenue = (coincident_peak_mw *
                                DC_RATE_STRUCTURE['coincident_peak_charge_per_mw_month'] * 12)

    # Non-coincident peak demand charges - based on customer's own monthly peak
    ncp_peak_mw = effective_capacity_mw
    annual_ncp_demand_revenue = (ncp_peak_mw *
                                 DC_RATE_STRUCTURE['non_coincident_peak_charge_per_mw_month'] * 12)

    annual_demand_revenue = annual_cp_demand_revenue + annual_ncp_demand_revenue

    # Energy margin - based on actual energy consumption
    annual_mwh = effective_capacity_mw * load_factor * 8760
    annual_energy_margin = annual_mwh * DC_RATE_STRUCTURE['energy_margin_per_mwh']

    return {
        'cp_demand_revenue': annual_cp_demand_revenue,
        'ncp_demand_revenue': annual_ncp_demand_revenue,
        'demand_revenue': annual_demand_revenue,
        'energy_margin': annual_energy_margin,
        'per_year': annual_demand_revenue + annual_energy_margin,
    }


def calculate_net_residential_impact(
    dc_capacity_mw: float,
    load_factor: float,
    peak_coincidence: float,
    residential_customers: int,
    residential_allocation: float,
    include_capacity_credit: bool = False,
    onsite_gen_mw: float = 0,
    utility: Dict = None,
    tariff: Dict = None
) -> Dict:
    """
    Calculate net impact on residential bills from data center load.

    Key improvements:
    1. Split demand charges into CP (coincident peak) and NCP (non-coincident peak)
    2. ERCOT 4CP transmission allocation - huge benefit for flexible loads
    3. More accurate market-specific adjustments
    """
    is_flexible = peak_coincidence < 1.0
    effective_peak_mw = dc_capacity_mw * peak_coincidence - onsite_gen_mw
    market_type = utility.get('market_type', 'regulated') if utility else 'regulated'

    # ============================================
    # TRANSMISSION COSTS - Market-specific allocation
    # ============================================
    if market_type == 'ercot':
        # ERCOT uses 4CP (four coincident peak) methodology
        # Transmission costs are allocated based on usage during 4 specific peak hours per year
        four_cp_contribution_mw = dc_capacity_mw * peak_coincidence - onsite_gen_mw
        ercot_4cp_rate = DC_RATE_STRUCTURE.get('ercot_4cp_transmission_rate', 5.50)
        annual_transmission_cost = max(0, four_cp_contribution_mw) * 1000 * ercot_4cp_rate * 12

        # Also include some base transmission cost (interconnection facilities)
        base_transmission_cost = (max(0, effective_peak_mw) *
                                 INFRASTRUCTURE_COSTS['transmission_cost_per_mw'] * 0.3)
        annualized_transmission_cost = annual_transmission_cost + (base_transmission_cost / 20)
    else:
        # Traditional embedded cost allocation
        transmission_cost = max(0, effective_peak_mw) * INFRASTRUCTURE_COSTS['transmission_cost_per_mw']
        annualized_transmission_cost = transmission_cost / 20

    distribution_cost = max(0, effective_peak_mw) * INFRASTRUCTURE_COSTS['distribution_cost_per_mw']
    annualized_distribution_cost = distribution_cost / 20
    annualized_infra_cost = annualized_transmission_cost + annualized_distribution_cost

    # ============================================
    # CAPACITY COSTS - Market-specific
    # ============================================
    base_capacity_cost = INFRASTRUCTURE_COSTS['capacity_cost_per_mw_year']
    capacity_cost_pass_through = utility.get('capacity_cost_pass_through', 0.40) if utility else 0.40

    if utility and utility.get('has_capacity_market') and utility.get('capacity_price_2024'):
        capacity_price_annual = utility['capacity_price_2024'] * 365
        base_capacity_cost = (INFRASTRUCTURE_COSTS['capacity_cost_per_mw_year'] * 0.5 +
                             capacity_price_annual * capacity_cost_pass_through * 0.5)

    if market_type == 'ercot':
        # No capacity market in ERCOT
        base_capacity_cost = INFRASTRUCTURE_COSTS['capacity_cost_per_mw_year'] * 0.50

    # ============================================
    # DEMAND CHARGE REVENUE - Tariff-specific or generic
    # ============================================
    tariff_based_revenue = None
    flexibility_benefit_from_tariff = 0

    if tariff:
        # Use utility-specific tariff calculations
        tariff_based_revenue = calculate_tariff_based_demand_charges(
            dc_capacity_mw, load_factor, peak_coincidence, tariff
        )
        flexibility_benefit_from_tariff = tariff_based_revenue['flexibility_benefit']

        # Create compatible dc_revenue structure
        dc_revenue = {
            'cp_demand_revenue': tariff_based_revenue['peak_demand_revenue'],
            'ncp_demand_revenue': tariff_based_revenue['max_demand_revenue'],
            'demand_revenue': tariff_based_revenue['total_demand_revenue'],
            'energy_margin': tariff_based_revenue['energy_revenue'],
            'per_year': tariff_based_revenue['total_revenue'],
        }
    else:
        # Use generic split demand charge calculation
        dc_revenue = calculate_dc_revenue_offset(
            dc_capacity_mw, load_factor, peak_coincidence,
            effective_capacity_mw=dc_capacity_mw,
            market_type=market_type
        )

    # Net capacity cost after CP demand charge offset
    if tariff:
        peak_demand_charge_annual = tariff['peak_demand_charge'] * 12
    else:
        peak_demand_charge_annual = DC_RATE_STRUCTURE['coincident_peak_charge_per_mw_month'] * 12
    net_capacity_cost_per_mw = max(0, base_capacity_cost - peak_demand_charge_annual)
    capacity_cost_or_credit = max(0, effective_peak_mw) * net_capacity_cost_per_mw

    # ============================================
    # CAPACITY CREDITS for flexible operation
    # ============================================
    capacity_credit = 0
    if include_capacity_credit and is_flexible:
        curtailable_mw = dc_capacity_mw * (1 - peak_coincidence)
        credit_multiplier = 0.90 if (utility and utility.get('has_capacity_market')) else 0.80
        dr_credit = curtailable_mw * base_capacity_cost * credit_multiplier
        gen_credit = onsite_gen_mw * base_capacity_cost * 0.95
        capacity_credit = dr_credit + gen_credit
        capacity_cost_or_credit = capacity_cost_or_credit - capacity_credit

    gross_annual_infra_cost = annualized_infra_cost + capacity_cost_or_credit

    # ============================================
    # REVENUE OFFSET CALCULATION
    # ============================================
    energy_margin_flow_through = 0.90 if market_type == 'ercot' else 0.85
    ncp_demand_benefit = dc_revenue['ncp_demand_revenue'] * 0.20
    revenue_offset = (dc_revenue['energy_margin'] * energy_margin_flow_through) + ncp_demand_benefit

    # Apply tariff-specific flexibility benefit if using tariff-based calculations
    if tariff and is_flexible and flexibility_benefit_from_tariff > 0:
        flex_multiplier = tariff.get('flexibility_benefit_multiplier', 1.0)
        scaled_flex_benefit = flexibility_benefit_from_tariff * flex_multiplier * 0.15
        revenue_offset += scaled_flex_benefit

    net_annual_impact = gross_annual_infra_cost - revenue_offset

    # ============================================
    # RESIDENTIAL ALLOCATION - Market-adjusted
    # ============================================
    adjusted_allocation = residential_allocation
    if market_type == 'ercot':
        # ERCOT 4CP methodology means DC pays more directly for transmission
        adjusted_allocation = residential_allocation * 0.70
    elif utility and utility.get('has_capacity_market') and utility.get('capacity_price_2024', 0) > 100:
        price_multiplier = min(1.15, 1 + (utility['capacity_price_2024'] - 100) / 1000)
        adjusted_allocation = residential_allocation * price_multiplier

    residential_impact = net_annual_impact * adjusted_allocation
    per_customer_monthly = residential_impact / residential_customers / 12

    return {
        'per_customer_monthly': per_customer_monthly,
        'gross_cost': gross_annual_infra_cost,
        'revenue_offset': revenue_offset,
        'net_impact': net_annual_impact,
        'market_type': market_type,
        'adjusted_allocation': adjusted_allocation,
        'capacity_credit': capacity_credit,
        'is_flexible': is_flexible,
    }


# ============================================
# TRAJECTORY CALCULATIONS
# ============================================

def calculate_baseline_trajectory(
    utility: Dict,
    years: int = 10
) -> Dict:
    """Calculate baseline cost trajectory without data center."""
    base_year = TIME_PARAMS['base_year']
    avg_bill = utility['avg_monthly_bill']

    baseline_increase_rate = (
        TIME_PARAMS['general_inflation'] +
        INFRASTRUCTURE_COSTS['annual_baseline_upgrade_pct'] +
        0.005  # Grid modernization
    )

    years_list = []
    monthly_bills = []

    for year in range(years + 1):
        years_list.append(base_year + year)
        if year == 0:
            monthly_bills.append(avg_bill)
        else:
            bill = avg_bill * ((1 + baseline_increase_rate) ** year)
            monthly_bills.append(bill)

    return {
        'years': years_list,
        'monthly_bills': monthly_bills,
        'scenario': 'baseline',
    }


def calculate_unoptimized_trajectory(
    utility: Dict,
    datacenter: Dict,
    years: int = 10,
    tariff: Dict = None
) -> Dict:
    """Calculate trajectory for firm load scenario."""
    base_year = TIME_PARAMS['base_year']
    baseline = calculate_baseline_trajectory(utility, years)

    firm_lf = datacenter.get('firm_load_factor', 0.80)
    firm_peak = datacenter.get('firm_peak_coincidence', 1.0)

    years_list = []
    monthly_bills = []

    for year in range(years + 1):
        years_list.append(base_year + year)

        if year < 2:
            monthly_bills.append(baseline['monthly_bills'][year])
        else:
            phase_in = 0.5 if year == 2 else 1.0
            years_online = year - 2

            allocation_result = calculate_residential_allocation(
                utility, datacenter['capacity_mw'], firm_lf, firm_peak, years_online
            )

            impact_result = calculate_net_residential_impact(
                datacenter['capacity_mw'],
                firm_lf,
                firm_peak,
                utility['residential_customers'],
                allocation_result['allocation'],
                False,
                0,
                utility,
                tariff
            )

            dc_impact = impact_result['per_customer_monthly'] * phase_in

            # Escalate with inflation
            if dc_impact > 0:
                dc_impact *= (1 + TIME_PARAMS['general_inflation']) ** years_online
            else:
                dc_impact *= (1 + TIME_PARAMS['general_inflation'] * 0.8) ** years_online

            monthly_bills.append(baseline['monthly_bills'][year] + dc_impact)

    return {
        'years': years_list,
        'monthly_bills': monthly_bills,
        'scenario': 'unoptimized',
    }


def calculate_flexible_trajectory(
    utility: Dict,
    datacenter: Dict,
    years: int = 10,
    tariff: Dict = None
) -> Dict:
    """Calculate trajectory for flexible load scenario."""
    base_year = TIME_PARAMS['base_year']
    baseline = calculate_baseline_trajectory(utility, years)

    flex_lf = datacenter.get('flex_load_factor', 0.95)
    flex_peak = datacenter.get('flex_peak_coincidence', 0.75)  # 25% curtailable (DCFlex validated)

    years_list = []
    monthly_bills = []

    for year in range(years + 1):
        years_list.append(base_year + year)

        if year < 2:
            monthly_bills.append(baseline['monthly_bills'][year])
        else:
            phase_in = 0.5 if year == 2 else 1.0
            years_online = year - 2

            allocation_result = calculate_residential_allocation(
                utility, datacenter['capacity_mw'], flex_lf, flex_peak, years_online
            )

            impact_result = calculate_net_residential_impact(
                datacenter['capacity_mw'],
                flex_lf,
                flex_peak,
                utility['residential_customers'],
                allocation_result['allocation'],
                True,  # Include capacity credit
                0,
                utility,
                tariff
            )

            dc_impact = impact_result['per_customer_monthly'] * phase_in

            if dc_impact > 0:
                dc_impact *= (1 + TIME_PARAMS['general_inflation']) ** years_online
            else:
                dc_impact *= (1 + TIME_PARAMS['general_inflation'] * 0.9) ** years_online

            monthly_bills.append(baseline['monthly_bills'][year] + dc_impact)

    return {
        'years': years_list,
        'monthly_bills': monthly_bills,
        'scenario': 'flexible',
    }


def calculate_dispatchable_trajectory(
    utility: Dict,
    datacenter: Dict,
    years: int = 10,
    tariff: Dict = None
) -> Dict:
    """Calculate trajectory for flexible + generation scenario."""
    base_year = TIME_PARAMS['base_year']
    baseline = calculate_baseline_trajectory(utility, years)

    flex_lf = datacenter.get('flex_load_factor', 0.95)
    flex_peak = datacenter.get('flex_peak_coincidence', 0.75)  # 25% curtailable (DCFlex validated)
    onsite_gen = datacenter.get('onsite_generation_mw', datacenter['capacity_mw'] * 0.2)

    years_list = []
    monthly_bills = []

    for year in range(years + 1):
        years_list.append(base_year + year)

        if year < 2:
            monthly_bills.append(baseline['monthly_bills'][year])
        else:
            phase_in = 0.5 if year == 2 else 1.0
            years_online = year - 2

            # Effective peak with onsite generation
            effective_peak = max(0, flex_peak - (onsite_gen / datacenter['capacity_mw']))

            allocation_result = calculate_residential_allocation(
                utility, datacenter['capacity_mw'], flex_lf, effective_peak, years_online
            )

            impact_result = calculate_net_residential_impact(
                datacenter['capacity_mw'],
                flex_lf,
                flex_peak,
                utility['residential_customers'],
                allocation_result['allocation'],
                True,
                onsite_gen,
                utility,
                tariff
            )

            dc_impact = impact_result['per_customer_monthly'] * phase_in

            if dc_impact > 0:
                dc_impact *= (1 + TIME_PARAMS['general_inflation']) ** years_online
            else:
                dc_impact *= (1 + TIME_PARAMS['general_inflation'] * 0.95) ** years_online

            monthly_bills.append(baseline['monthly_bills'][year] + dc_impact)

    return {
        'years': years_list,
        'monthly_bills': monthly_bills,
        'scenario': 'dispatchable',
    }


# ============================================
# COMBINED FUNCTIONS
# ============================================

def generate_all_trajectories(utility: Dict, datacenter: Dict, years: int = None, tariff: Dict = None) -> Dict:
    """Generate all four scenario trajectories."""
    if years is None:
        years = TIME_PARAMS.get('projection_years', 10)

    return {
        'baseline': calculate_baseline_trajectory(utility, years),
        'unoptimized': calculate_unoptimized_trajectory(utility, datacenter, years, tariff),
        'flexible': calculate_flexible_trajectory(utility, datacenter, years, tariff),
        'dispatchable': calculate_dispatchable_trajectory(utility, datacenter, years, tariff),
    }


# ============================================
# SUMMARY STATISTICS
# ============================================

def calculate_summary_stats(trajectories: Dict, utility: Dict) -> Dict:
    """Calculate summary statistics from trajectories."""
    final_idx = -1

    baseline_final = trajectories['baseline']['monthly_bills'][final_idx]
    unoptimized_final = trajectories['unoptimized']['monthly_bills'][final_idx]
    flexible_final = trajectories['flexible']['monthly_bills'][final_idx]
    dispatchable_final = trajectories['dispatchable']['monthly_bills'][final_idx]

    return {
        'current_monthly_bill': utility['avg_monthly_bill'],

        'final_year_bills': {
            'baseline': baseline_final,
            'unoptimized': unoptimized_final,
            'flexible': flexible_final,
            'dispatchable': dispatchable_final,
        },

        'final_year_difference': {
            'unoptimized': unoptimized_final - baseline_final,
            'flexible': flexible_final - baseline_final,
            'dispatchable': dispatchable_final - baseline_final,
        },

        'savings_vs_unoptimized': {
            'flexible': unoptimized_final - flexible_final,
            'dispatchable': unoptimized_final - dispatchable_final,
        },

        'cumulative_costs': {
            'baseline': sum(b * 12 for b in trajectories['baseline']['monthly_bills']),
            'unoptimized': sum(b * 12 for b in trajectories['unoptimized']['monthly_bills']),
            'flexible': sum(b * 12 for b in trajectories['flexible']['monthly_bills']),
            'dispatchable': sum(b * 12 for b in trajectories['dispatchable']['monthly_bills']),
        },
    }
