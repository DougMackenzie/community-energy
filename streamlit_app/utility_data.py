"""
Utility data compiled from public sources including EIA, utility filings, and annual reports.
Data reflects 2024 figures where available.
"""

UTILITY_PROFILES = [
    {
        'id': 'pso-oklahoma',
        'name': 'Public Service Company of Oklahoma (PSO)',
        'short_name': 'PSO Oklahoma',
        'state': 'Oklahoma',
        'region': 'Southwest',
        'residential_customers': 460000,
        'total_customers': 575000,
        'system_peak_mw': 4400,
        'avg_monthly_bill': 130,
        'avg_monthly_usage_kwh': 1100,
        'has_dc_activity': True,
        'dc_notes': 'Meta proposed 2GW facility; PSO facing 31% power deficit by 2031',
        'default_dc_mw': 2000,
    },
    {
        'id': 'dominion-virginia',
        'name': 'Dominion Energy Virginia',
        'short_name': 'Dominion Virginia',
        'state': 'Virginia',
        'region': 'Mid-Atlantic',
        'residential_customers': 2500000,
        'total_customers': 2800000,
        'system_peak_mw': 18000,
        'avg_monthly_bill': 145,
        'avg_monthly_usage_kwh': 1050,
        'has_dc_activity': True,
        'dc_notes': 'Data center capital of the world; forecasting 9GW DC peak in 10 years',
        'default_dc_mw': 1500,
    },
    {
        'id': 'duke-carolinas',
        'name': 'Duke Energy Carolinas',
        'short_name': 'Duke Carolinas',
        'state': 'NC / SC',
        'region': 'Southeast',
        'residential_customers': 2507000,
        'total_customers': 2926000,
        'system_peak_mw': 20700,
        'avg_monthly_bill': 135,
        'avg_monthly_usage_kwh': 1000,
        'has_dc_activity': True,
        'dc_notes': 'Growing data center presence in Charlotte metro',
        'default_dc_mw': 1000,
    },
    {
        'id': 'duke-progress',
        'name': 'Duke Energy Progress',
        'short_name': 'Duke Progress',
        'state': 'NC / SC',
        'region': 'Southeast',
        'residential_customers': 1400000,
        'total_customers': 1700000,
        'system_peak_mw': 13800,
        'avg_monthly_bill': 132,
        'avg_monthly_usage_kwh': 1000,
        'has_dc_activity': True,
        'dc_notes': 'Serves Raleigh area with growing tech sector',
        'default_dc_mw': 800,
    },
    {
        'id': 'georgia-power',
        'name': 'Georgia Power',
        'short_name': 'Georgia Power',
        'state': 'Georgia',
        'region': 'Southeast',
        'residential_customers': 2400000,
        'total_customers': 2804000,
        'system_peak_mw': 17100,
        'avg_monthly_bill': 153,
        'avg_monthly_usage_kwh': 1150,
        'has_dc_activity': True,
        'dc_notes': 'Projecting 8,200 MW load growth by 2030 including data centers',
        'default_dc_mw': 1200,
    },
    {
        'id': 'aps-arizona',
        'name': 'Arizona Public Service (APS)',
        'short_name': 'APS Arizona',
        'state': 'Arizona',
        'region': 'Southwest',
        'residential_customers': 1200000,
        'total_customers': 1400000,
        'system_peak_mw': 8212,
        'avg_monthly_bill': 140,
        'avg_monthly_usage_kwh': 1050,
        'has_dc_activity': True,
        'dc_notes': 'Phoenix metro data center growth; 40% peak growth by 2031',
        'default_dc_mw': 800,
    },
    {
        'id': 'nv-energy',
        'name': 'NV Energy',
        'short_name': 'NV Energy Nevada',
        'state': 'Nevada',
        'region': 'West',
        'residential_customers': 610000,
        'total_customers': 2400000,
        'system_peak_mw': 9000,
        'avg_monthly_bill': 125,
        'avg_monthly_usage_kwh': 900,
        'has_dc_activity': True,
        'dc_notes': 'Data centers requesting to triple peak demand',
        'default_dc_mw': 1500,
    },
    {
        'id': 'xcel-colorado',
        'name': 'Xcel Energy Colorado',
        'short_name': 'Xcel Colorado',
        'state': 'Colorado',
        'region': 'Mountain West',
        'residential_customers': 1400000,
        'total_customers': 1600000,
        'system_peak_mw': 7200,
        'avg_monthly_bill': 105,
        'avg_monthly_usage_kwh': 700,
        'has_dc_activity': True,
        'dc_notes': 'Data centers to drive 2/3 of new demand',
        'default_dc_mw': 600,
    },
    {
        'id': 'ercot-texas',
        'name': 'ERCOT (Texas Grid)',
        'short_name': 'ERCOT Texas',
        'state': 'Texas',
        'region': 'Texas',
        'residential_customers': 12000000,
        'total_customers': 26000000,
        'system_peak_mw': 85508,
        'avg_monthly_bill': 140,
        'avg_monthly_usage_kwh': 1100,
        'has_dc_activity': True,
        'dc_notes': 'Data centers account for 46% of projected load growth',
        'default_dc_mw': 3000,
    },
    {
        'id': 'custom',
        'name': 'Custom / Enter Your Own',
        'short_name': 'Custom',
        'state': '',
        'region': '',
        'residential_customers': 500000,
        'total_customers': 600000,
        'system_peak_mw': 4000,
        'avg_monthly_bill': 144,
        'avg_monthly_usage_kwh': 865,
        'has_dc_activity': False,
        'dc_notes': 'Enter your own utility parameters',
        'default_dc_mw': 1000,
    }
]


def get_utility_by_id(utility_id):
    """Get utility profile by ID."""
    for profile in UTILITY_PROFILES:
        if profile['id'] == utility_id:
            return profile
    return None


def get_utility_options():
    """Get list of (display_name, id) tuples for dropdown."""
    return [
        (f"{p['short_name']} ({p['state']})" if p['state'] else p['short_name'], p['id'])
        for p in UTILITY_PROFILES
    ]
