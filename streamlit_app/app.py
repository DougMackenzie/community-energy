"""
Community Energy Calculator - Streamlit App

Analyzes the impact of data center development on residential electricity bills.
Compares four scenarios: Baseline, Firm Load, Flexible Load, and Flex + Generation.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from calculations import (
    calculate_baseline_trajectory,
    calculate_unoptimized_trajectory,
    calculate_flexible_trajectory,
    calculate_dispatchable_trajectory,
    calculate_summary_stats,
    DEFAULT_UTILITY,
    DEFAULT_DATA_CENTER,
    SCENARIOS,
)

# Page config
st.set_page_config(
    page_title="Community Energy Calculator",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .metric-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 20px;
        text-align: center;
        border: 1px solid #e9ecef;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: bold;
    }
    .metric-label {
        font-size: 0.9rem;
        color: #6c757d;
    }
    .scenario-baseline { color: #6B7280; }
    .scenario-firm { color: #DC2626; }
    .scenario-flex { color: #F59E0B; }
    .scenario-dispatch { color: #10B981; }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'utility' not in st.session_state:
    st.session_state.utility = DEFAULT_UTILITY.copy()
if 'datacenter' not in st.session_state:
    st.session_state.datacenter = DEFAULT_DATA_CENTER.copy()
if 'projection_years' not in st.session_state:
    st.session_state.projection_years = 15

# Sidebar for inputs
with st.sidebar:
    st.title("⚡ Calculator Settings")

    st.header("Utility Parameters")

    st.session_state.utility['residential_customers'] = st.number_input(
        "Residential Customers",
        min_value=10000,
        max_value=5000000,
        value=st.session_state.utility['residential_customers'],
        step=10000,
        format="%d"
    )

    st.session_state.utility['system_peak_mw'] = st.slider(
        "System Peak (MW)",
        min_value=1000,
        max_value=50000,
        value=st.session_state.utility['system_peak_mw'],
        step=500
    )

    st.session_state.utility['avg_monthly_bill'] = st.slider(
        "Avg Monthly Bill ($)",
        min_value=50,
        max_value=300,
        value=st.session_state.utility['avg_monthly_bill'],
        step=5
    )

    st.divider()
    st.header("Data Center Parameters")

    st.session_state.datacenter['capacity_mw'] = st.slider(
        "Data Center Capacity (MW)",
        min_value=500,
        max_value=10000,
        value=st.session_state.datacenter['capacity_mw'],
        step=100
    )

    # Auto-scale onsite generation
    max_onsite = st.session_state.datacenter['capacity_mw']
    default_onsite = min(
        st.session_state.datacenter.get('onsite_generation_mw', int(max_onsite * 0.2)),
        max_onsite
    )

    st.session_state.datacenter['onsite_generation_mw'] = st.slider(
        "Onsite Generation (MW)",
        min_value=0,
        max_value=max_onsite,
        value=default_onsite,
        step=max(10, max_onsite // 100)
    )

    onsite_pct = (st.session_state.datacenter['onsite_generation_mw'] /
                  st.session_state.datacenter['capacity_mw'] * 100)
    st.caption(f"{onsite_pct:.0f}% of DC capacity")

    st.divider()
    st.header("Projection")

    st.session_state.projection_years = st.slider(
        "Projection Years",
        min_value=5,
        max_value=25,
        value=st.session_state.projection_years,
        step=1
    )

    if st.button("Reset to Defaults", type="secondary"):
        st.session_state.utility = DEFAULT_UTILITY.copy()
        st.session_state.datacenter = DEFAULT_DATA_CENTER.copy()
        st.session_state.projection_years = 15
        st.rerun()

# Calculate trajectories
trajectories = {
    'baseline': calculate_baseline_trajectory(
        st.session_state.utility,
        st.session_state.projection_years
    ),
    'unoptimized': calculate_unoptimized_trajectory(
        st.session_state.utility,
        st.session_state.datacenter,
        st.session_state.projection_years
    ),
    'flexible': calculate_flexible_trajectory(
        st.session_state.utility,
        st.session_state.datacenter,
        st.session_state.projection_years
    ),
    'dispatchable': calculate_dispatchable_trajectory(
        st.session_state.utility,
        st.session_state.datacenter,
        st.session_state.projection_years
    ),
}

summary = calculate_summary_stats(trajectories, st.session_state.utility)

# Main content
st.title("Community Energy Calculator")
st.markdown("""
Analyze how data center development affects residential electricity bills.
Compare scenarios from traditional "firm" load to flexible operations with demand response and onsite generation.
""")

# Navigation tabs
tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
    "📊 Overview",
    "📈 Baseline",
    "🔴 Firm Load",
    "🟡 Flexible Load",
    "🟢 Flex + Generation",
    "📚 Methodology"
])

# Tab 1: Overview
with tab1:
    st.header("Scenario Comparison")

    # Key metrics
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric(
            "Current Bill",
            f"${st.session_state.utility['avg_monthly_bill']}/mo",
            delta=None
        )

    with col2:
        firm_diff = summary['final_year_difference']['unoptimized']
        st.metric(
            f"Firm Load ({st.session_state.projection_years}yr)",
            f"${summary['final_year_bills']['unoptimized']:.0f}/mo",
            delta=f"{'+' if firm_diff >= 0 else ''}{firm_diff:.2f} vs baseline",
            delta_color="inverse"
        )

    with col3:
        flex_savings = summary['savings_vs_unoptimized']['flexible']
        st.metric(
            f"Flexible ({st.session_state.projection_years}yr)",
            f"${summary['final_year_bills']['flexible']:.0f}/mo",
            delta=f"Save ${flex_savings:.2f}/mo vs firm",
            delta_color="normal"
        )

    with col4:
        dispatch_savings = summary['savings_vs_unoptimized']['dispatchable']
        st.metric(
            f"Flex + Gen ({st.session_state.projection_years}yr)",
            f"${summary['final_year_bills']['dispatchable']:.0f}/mo",
            delta=f"Save ${dispatch_savings:.2f}/mo vs firm",
            delta_color="normal"
        )

    st.divider()

    # Chart
    st.subheader("Projected Monthly Bills")

    # Create DataFrame for plotting
    df = pd.DataFrame({
        'Year': trajectories['baseline']['years'],
        'Baseline (No DC)': trajectories['baseline']['monthly_bills'],
        'Firm Load': trajectories['unoptimized']['monthly_bills'],
        'Flexible Load': trajectories['flexible']['monthly_bills'],
        'Flex + Generation': trajectories['dispatchable']['monthly_bills'],
    })

    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=df['Year'], y=df['Baseline (No DC)'],
        name='Baseline (No DC)',
        line=dict(color=SCENARIOS['baseline']['color'], dash='dash'),
        mode='lines'
    ))

    fig.add_trace(go.Scatter(
        x=df['Year'], y=df['Firm Load'],
        name='Firm Load',
        line=dict(color=SCENARIOS['unoptimized']['color'], width=2),
        mode='lines'
    ))

    fig.add_trace(go.Scatter(
        x=df['Year'], y=df['Flexible Load'],
        name='Flexible Load',
        line=dict(color=SCENARIOS['flexible']['color'], width=2),
        mode='lines'
    ))

    fig.add_trace(go.Scatter(
        x=df['Year'], y=df['Flex + Generation'],
        name='Flex + Generation',
        line=dict(color=SCENARIOS['dispatchable']['color'], width=3),
        mode='lines'
    ))

    # Add reference line for current bill
    fig.add_hline(
        y=st.session_state.utility['avg_monthly_bill'],
        line_dash="dot",
        line_color="gray",
        annotation_text="Current",
        annotation_position="right"
    )

    fig.update_layout(
        xaxis_title="Year",
        yaxis_title="Monthly Bill ($)",
        hovermode='x unified',
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        height=450
    )

    st.plotly_chart(fig, use_container_width=True)

    # Key findings
    st.subheader("Key Findings")

    col1, col2 = st.columns(2)

    with col1:
        firm_diff = summary['final_year_difference']['unoptimized']
        if firm_diff >= 0:
            st.error(f"""
            **Firm Load Impact:** +${firm_diff:.2f}/mo
            Additional cost per household vs baseline
            """)
        else:
            st.success(f"""
            **Firm Load Savings:** -${abs(firm_diff):.2f}/mo
            Savings per household vs baseline
            """)

    with col2:
        st.success(f"""
        **Best Case (Flex + Gen):** Save ${dispatch_savings:.2f}/mo
        Savings vs firm load per household
        """)

    # Community impact
    annual_community_savings = dispatch_savings * 12 * st.session_state.utility['residential_customers']
    st.info(f"""
    **Community-Wide Impact:** If the utility requires flexible operations with dispatchable generation,
    the {st.session_state.utility['residential_customers']:,} residential customers could collectively save
    **${annual_community_savings/1e6:.1f}M per year** compared to allowing unoptimized firm load.
    """)

# Tab 2: Baseline
with tab2:
    st.header("Baseline: No Data Center")
    st.markdown("""
    This scenario projects your electricity costs without any new large industrial load.
    Even without data centers, bills increase due to:
    - **General inflation:** ~2.5%/year
    - **Infrastructure aging:** ~1.5%/year for replacement and upgrades
    - **Grid modernization:** ~0.5%/year for smart grid investments
    """)

    baseline_final = trajectories['baseline']['monthly_bills'][-1]
    baseline_start = trajectories['baseline']['monthly_bills'][0]
    total_increase = baseline_final - baseline_start
    pct_increase = (total_increase / baseline_start) * 100

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Starting Bill", f"${baseline_start:.0f}/mo")
    with col2:
        st.metric(f"Bill in {st.session_state.projection_years} Years", f"${baseline_final:.0f}/mo")
    with col3:
        st.metric("Total Increase", f"+${total_increase:.0f}", f"+{pct_increase:.1f}%")

    # Simple baseline chart
    fig_baseline = go.Figure()
    fig_baseline.add_trace(go.Scatter(
        x=trajectories['baseline']['years'],
        y=trajectories['baseline']['monthly_bills'],
        fill='tozeroy',
        line=dict(color=SCENARIOS['baseline']['color']),
        name='Monthly Bill'
    ))
    fig_baseline.update_layout(
        xaxis_title="Year",
        yaxis_title="Monthly Bill ($)",
        height=350
    )
    st.plotly_chart(fig_baseline, use_container_width=True)

# Tab 3: Firm Load
with tab3:
    st.header("Firm Load: Traditional Data Center")
    st.markdown(f"""
    When a **{st.session_state.datacenter['capacity_mw']:,} MW** data center operates as "firm" load:
    - Runs at **80% load factor** (less efficient scheduling)
    - **100%** of capacity adds to system peak
    - Requires full infrastructure buildout
    - No flexibility for grid support
    """)

    firm_final = summary['final_year_bills']['unoptimized']
    firm_diff = summary['final_year_difference']['unoptimized']

    col1, col2, col3 = st.columns(3)
    with col1:
        if firm_diff >= 0:
            st.metric("Additional Monthly Cost", f"+${firm_diff:.2f}", "vs baseline")
        else:
            st.metric("Monthly Savings", f"-${abs(firm_diff):.2f}", "vs baseline")
    with col2:
        st.metric("Peak Demand Added", f"{st.session_state.datacenter['capacity_mw']:,} MW", "100% to peak")
    with col3:
        infra_cost = st.session_state.datacenter['capacity_mw'] * 500000  # Approx T&D cost
        st.metric("Infrastructure Required", f"${infra_cost/1e6:.0f}M", "transmission & distribution")

    st.warning("""
    **Why Firm Load is Less Optimal:**
    1. Adds 100% of capacity to peak demand
    2. Triggers expensive infrastructure investments
    3. Lower load factor = less energy revenue per MW
    4. Cannot help during grid emergencies
    """)

# Tab 4: Flexible Load
with tab4:
    st.header("Flexible Load: Demand Response")
    st.markdown(f"""
    With demand response capability, the **{st.session_state.datacenter['capacity_mw']:,} MW** data center:
    - Operates at **95% load factor** (higher efficiency)
    - Only **80%** at peak (20% curtailable)
    - Provides capacity value through DR
    - Can reduce load during grid stress
    """)

    flex_final = summary['final_year_bills']['flexible']
    flex_diff = summary['final_year_difference']['flexible']
    flex_vs_firm = summary['savings_vs_unoptimized']['flexible']

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("vs Baseline", f"${flex_diff:+.2f}/mo")
    with col2:
        st.metric("vs Firm Load", f"Save ${flex_vs_firm:.2f}/mo")
    with col3:
        curtailable = st.session_state.datacenter['capacity_mw'] * 0.2
        st.metric("Curtailable Capacity", f"{curtailable:.0f} MW", "DR resource")

    st.success("""
    **Benefits of Flexible Load:**
    - Higher load factor = more energy revenue
    - Lower peak contribution = less infrastructure
    - DR capacity credit = additional value
    - Grid support during emergencies
    """)

# Tab 5: Flex + Generation
with tab5:
    st.header("Flex + Generation: Best Case")
    st.markdown(f"""
    Adding **{st.session_state.datacenter['onsite_generation_mw']:,} MW** of onsite generation to flexible operations:
    - All benefits of flexible load
    - Onsite generation reduces grid draw at peak
    - Can export power during emergencies
    - Maximum capacity credit value
    """)

    dispatch_final = summary['final_year_bills']['dispatchable']
    dispatch_diff = summary['final_year_difference']['dispatchable']
    dispatch_vs_firm = summary['savings_vs_unoptimized']['dispatchable']

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("vs Baseline", f"${dispatch_diff:+.2f}/mo")
    with col2:
        st.metric("vs Firm Load", f"Save ${dispatch_vs_firm:.2f}/mo")
    with col3:
        net_peak = max(0, st.session_state.datacenter['capacity_mw'] * 0.8 -
                      st.session_state.datacenter['onsite_generation_mw'])
        st.metric("Net Peak Draw", f"{net_peak:.0f} MW", "after onsite gen")

    st.success(f"""
    **This is the best outcome for ratepayers!**
    With {st.session_state.datacenter['onsite_generation_mw']:,} MW of onsite generation plus demand response,
    the data center provides maximum value to the grid while minimizing infrastructure costs.
    """)

# Tab 6: Methodology
with tab6:
    st.header("Methodology & Sources")

    with st.expander("Core Calculation Logic", expanded=True):
        st.markdown("""
        **Basic Formula:**
        ```
        Monthly Impact = (Infrastructure Costs - DC Revenue Offset) × Residential Share / Customers / 12
        ```

        **Key Parameters:**
        - **Firm load:** 80% load factor, 100% peak contribution
        - **Flexible load:** 95% load factor, 80% peak contribution (20% curtailable)
        - **Demand charges:** $9,050/MW-month
        - **Energy margin:** $4.88/MWh
        """)

    with st.expander("Residential Allocation (Calculated)"):
        st.markdown("""
        Rather than assuming a fixed decline rate, we **calculate** residential allocation based on tariff structure:

        | Component | Weight | Calculation |
        |-----------|--------|-------------|
        | Volumetric | 40% | Residential energy ÷ total system energy |
        | Demand | 40% | Residential peak ÷ total system peak |
        | Customer | 20% | Residential customers ÷ total customers |

        **When a DC comes online:**
        - System energy increases → residential volumetric share decreases
        - System peak increases → residential demand share decreases
        - Customer count essentially unchanged

        **Regulatory lag:** Changes phase in over ~5 years through rate cases.
        """)

    with st.expander("Infrastructure Cost Assumptions"):
        st.markdown("""
        | Component | Cost | Source |
        |-----------|------|--------|
        | Transmission | $350,000/MW | EIA, FERC filings |
        | Distribution | $150,000/MW | Utility rate cases |
        | Capacity | $150,000/MW-year | PJM, MISO auctions |
        | DR Credit | 80% of capacity value | Industry standard |
        | Generation Credit | 95% of capacity value | Higher reliability |
        """)

    with st.expander("Capacity Markets"):
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("""
            **Regulated Territories (PSO/SPP):**
            - Utility owns generation
            - Cost recovery through rate base
            - ~$80-120/kW-year embedded cost
            - Must maintain 12-15% reserve margins
            """)
        with col2:
            st.markdown("""
            **Market Territories (PJM, MISO):**
            - Competitive capacity auctions
            - Recent: $29-269/MW-day
            - Prices rising due to retirements
            - DCs with generation get priority
            """)

    with st.expander("Data Sources"):
        st.markdown("""
        - [EIA Electricity Data](https://www.eia.gov/electricity/data.php)
        - [NREL Annual Technology Baseline](https://atb.nrel.gov/)
        - [FERC Electric Industry Data](https://www.ferc.gov/industries-data/electric)
        - [PJM Capacity Markets](https://www.pjm.com/markets-and-operations/rpm)
        - [MISO Resource Adequacy](https://www.misoenergy.org/markets-and-operations/resource-adequacy/)
        """)

    st.divider()
    st.markdown("""
    **Disclaimer:** This tool provides order-of-magnitude estimates for educational purposes.
    Actual utility planning involves more detailed engineering and economic modeling.
    Results vary significantly by region and regulatory environment.
    """)

# Footer
st.divider()
st.markdown("""
<div style="text-align: center; color: #6c757d; font-size: 0.8rem;">
    Community Energy Calculator | MIT License |
    <a href="https://github.com/DougMackenzie/community-energy">GitHub</a>
</div>
""", unsafe_allow_html=True)
