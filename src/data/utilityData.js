/**
 * Utility data compiled from public sources including EIA, utility filings, and annual reports
 * Data reflects 2024 figures where available
 *
 * Market Structure Types:
 * - 'regulated': Vertically integrated utility with state PUC oversight
 * - 'pjm': PJM Interconnection (capacity market, 2024 prices ~$270/MW-day)
 * - 'ercot': ERCOT Texas (energy-only market, no capacity market)
 * - 'miso': MISO (capacity market, lower prices than PJM)
 * - 'spp': Southwest Power Pool (energy market, no mandatory capacity market)
 *
 * Cost Allocation Notes:
 * - Regulated markets: Infrastructure costs allocated through rate base, ~40% residential
 * - PJM markets: Capacity costs flow through retail suppliers, high volatility
 * - ERCOT: No capacity market, transmission costs allocated, more direct price signals
 */

// Market structure presets
const REGULATED_MARKET = {
  type: 'regulated',
  hasCapacityMarket: false,
  baseResidentialAllocation: 0.40,
  capacityCostPassThrough: 0.40,
  transmissionAllocation: 0.35,
  utilityOwnsGeneration: true,
  notes: 'Vertically integrated utility. Infrastructure costs allocated through traditional rate base.'
};

const PJM_MARKET = {
  type: 'pjm',
  hasCapacityMarket: true,
  baseResidentialAllocation: 0.35,
  capacityCostPassThrough: 0.50,
  transmissionAllocation: 0.35,
  utilityOwnsGeneration: false,
  capacityPrice2024: 269.92,
  notes: 'PJM capacity market. 2024 auction cleared at $269.92/MW-day (10x increase).'
};

const ERCOT_MARKET = {
  type: 'ercot',
  hasCapacityMarket: false,
  baseResidentialAllocation: 0.30,
  capacityCostPassThrough: 0.25,
  transmissionAllocation: 0.35,
  utilityOwnsGeneration: false,
  notes: 'Energy-only market with no capacity payments. Price signals drive investment.'
};

const MISO_MARKET = {
  type: 'miso',
  hasCapacityMarket: true,
  baseResidentialAllocation: 0.38,
  capacityCostPassThrough: 0.35,
  transmissionAllocation: 0.35,
  utilityOwnsGeneration: true,
  capacityPrice2024: 30.00,
  notes: 'MISO capacity market with lower clearing prices than PJM.'
};

const SPP_MARKET = {
  type: 'spp',
  hasCapacityMarket: false,
  baseResidentialAllocation: 0.40,
  capacityCostPassThrough: 0.40,
  transmissionAllocation: 0.35,
  utilityOwnsGeneration: true,
  notes: 'Southwest Power Pool. Energy market but no mandatory capacity market.'
};

export const UTILITY_PROFILES = [
  // ============================================
  // REGULATED / VERTICALLY INTEGRATED UTILITIES
  // ============================================
  {
    id: 'pso-oklahoma',
    name: 'Public Service Company of Oklahoma (PSO)',
    shortName: 'PSO Oklahoma',
    state: 'Oklahoma',
    region: 'Southwest',
    residentialCustomers: 460000,
    totalCustomers: 575000,
    systemPeakMW: 4400,
    averageMonthlyBill: 130,
    averageMonthlyUsageKWh: 1100,
    market: { ...SPP_MARKET },
    hasDataCenterActivity: true,
    dataCenterNotes: 'Proposed 2GW hyperscale facility; PSO facing 31% power deficit by 2031',
    defaultDataCenterMW: 2000,
  },
  {
    id: 'duke-carolinas',
    name: 'Duke Energy Carolinas',
    shortName: 'Duke Carolinas',
    state: 'North Carolina / South Carolina',
    region: 'Southeast',
    residentialCustomers: 2507000,
    totalCustomers: 2926000,
    systemPeakMW: 20700,
    averageMonthlyBill: 135,
    averageMonthlyUsageKWh: 1000,
    market: { ...REGULATED_MARKET },
    hasDataCenterActivity: true,
    dataCenterNotes: 'Growing data center presence in Charlotte metro area',
    defaultDataCenterMW: 1000,
  },
  {
    id: 'duke-progress',
    name: 'Duke Energy Progress',
    shortName: 'Duke Progress',
    state: 'North Carolina / South Carolina',
    region: 'Southeast',
    residentialCustomers: 1400000,
    totalCustomers: 1700000,
    systemPeakMW: 13800,
    averageMonthlyBill: 132,
    averageMonthlyUsageKWh: 1000,
    market: { ...REGULATED_MARKET },
    hasDataCenterActivity: true,
    dataCenterNotes: 'Serves Raleigh area with growing tech sector',
    defaultDataCenterMW: 800,
  },
  {
    id: 'georgia-power',
    name: 'Georgia Power',
    shortName: 'Georgia Power',
    state: 'Georgia',
    region: 'Southeast',
    residentialCustomers: 2400000,
    totalCustomers: 2804000,
    systemPeakMW: 17100,
    averageMonthlyBill: 153,
    averageMonthlyUsageKWh: 1150,
    market: { ...REGULATED_MARKET },
    hasDataCenterActivity: true,
    dataCenterNotes: 'Projecting 8,200 MW load growth by 2030 including data centers',
    defaultDataCenterMW: 1200,
  },
  {
    id: 'aps-arizona',
    name: 'Arizona Public Service (APS)',
    shortName: 'APS Arizona',
    state: 'Arizona',
    region: 'Southwest',
    residentialCustomers: 1200000,
    totalCustomers: 1400000,
    systemPeakMW: 8212,
    averageMonthlyBill: 140,
    averageMonthlyUsageKWh: 1050,
    market: { ...REGULATED_MARKET },
    hasDataCenterActivity: true,
    dataCenterNotes: 'Phoenix metro data center growth; 40% peak growth by 2031',
    defaultDataCenterMW: 800,
  },
  {
    id: 'nv-energy',
    name: 'NV Energy',
    shortName: 'NV Energy Nevada',
    state: 'Nevada',
    region: 'West',
    residentialCustomers: 610000,
    totalCustomers: 2400000,
    systemPeakMW: 9000,
    averageMonthlyBill: 125,
    averageMonthlyUsageKWh: 900,
    market: { ...REGULATED_MARKET },
    hasDataCenterActivity: true,
    dataCenterNotes: 'Data centers requesting to triple peak demand',
    defaultDataCenterMW: 1500,
  },
  {
    id: 'xcel-colorado',
    name: 'Xcel Energy Colorado',
    shortName: 'Xcel Colorado',
    state: 'Colorado',
    region: 'Mountain West',
    residentialCustomers: 1400000,
    totalCustomers: 1600000,
    systemPeakMW: 7200,
    averageMonthlyBill: 105,
    averageMonthlyUsageKWh: 700,
    market: { ...REGULATED_MARKET },
    hasDataCenterActivity: true,
    dataCenterNotes: 'Data centers to drive 2/3 of new demand',
    defaultDataCenterMW: 600,
  },

  // ============================================
  // AEP UTILITIES
  // ============================================
  {
    id: 'aep-ohio',
    name: 'AEP Ohio',
    shortName: 'AEP Ohio',
    state: 'Ohio',
    region: 'Midwest',
    residentialCustomers: 1200000,
    totalCustomers: 1500000,
    systemPeakMW: 12000,
    averageMonthlyBill: 135,
    averageMonthlyUsageKWh: 900,
    market: {
      ...PJM_MARKET,
      notes: 'AEP Ohio operates in PJM. Ohio is deregulated but AEP owns transmission.'
    },
    hasDataCenterActivity: true,
    dataCenterNotes: 'Ohio seeing significant data center growth; AEP proposed new rate class',
    defaultDataCenterMW: 1000,
  },
  {
    id: 'aep-indiana-michigan',
    name: 'Indiana Michigan Power (I&M)',
    shortName: 'AEP I&M',
    state: 'Indiana / Michigan',
    region: 'Midwest',
    residentialCustomers: 480000,
    totalCustomers: 600000,
    systemPeakMW: 5500,
    averageMonthlyBill: 130,
    averageMonthlyUsageKWh: 950,
    market: {
      ...PJM_MARKET,
      utilityOwnsGeneration: true,
      baseResidentialAllocation: 0.38,
      notes: 'I&M operates in PJM but owns generation including Cook Nuclear.'
    },
    hasDataCenterActivity: true,
    dataCenterNotes: 'Northeast Indiana seeing industrial and data center growth',
    defaultDataCenterMW: 500,
  },
  {
    id: 'aep-appalachian',
    name: 'Appalachian Power (APCo)',
    shortName: 'AEP Appalachian',
    state: 'Virginia / West Virginia',
    region: 'Appalachian',
    residentialCustomers: 800000,
    totalCustomers: 1000000,
    systemPeakMW: 7000,
    averageMonthlyBill: 125,
    averageMonthlyUsageKWh: 1000,
    market: {
      ...PJM_MARKET,
      utilityOwnsGeneration: true,
      baseResidentialAllocation: 0.40,
      notes: 'Appalachian Power operates in PJM but WV remains traditionally regulated.'
    },
    hasDataCenterActivity: true,
    dataCenterNotes: 'Virginia portion seeing data center interest as NoVA constrained',
    defaultDataCenterMW: 600,
  },
  {
    id: 'aep-swepco',
    name: 'Southwestern Electric Power (SWEPCO)',
    shortName: 'AEP SWEPCO',
    state: 'Arkansas / Louisiana / Texas',
    region: 'Southwest',
    residentialCustomers: 400000,
    totalCustomers: 540000,
    systemPeakMW: 4800,
    averageMonthlyBill: 120,
    averageMonthlyUsageKWh: 1100,
    market: {
      ...SPP_MARKET,
      notes: 'SWEPCO operates in SPP. Vertically integrated with state PUC regulation.'
    },
    hasDataCenterActivity: false,
    dataCenterNotes: 'Less data center activity than other AEP territories',
    defaultDataCenterMW: 400,
  },

  // ============================================
  // PJM / ISO MARKET UTILITIES
  // ============================================
  {
    id: 'dominion-virginia',
    name: 'Dominion Energy Virginia',
    shortName: 'Dominion Virginia',
    state: 'Virginia',
    region: 'Mid-Atlantic',
    residentialCustomers: 2500000,
    totalCustomers: 2800000,
    systemPeakMW: 18000,
    averageMonthlyBill: 145,
    averageMonthlyUsageKWh: 1050,
    market: {
      ...PJM_MARKET,
      utilityOwnsGeneration: true,
      baseResidentialAllocation: 0.35,
      notes: 'Dominion operates in PJM. Data center capital of the world.'
    },
    hasDataCenterActivity: true,
    dataCenterNotes: 'Data center capital of the world; forecasting 9GW DC peak in 10 years',
    defaultDataCenterMW: 1500,
  },

  // ============================================
  // ENERGY-ONLY MARKETS
  // ============================================
  {
    id: 'ercot-texas',
    name: 'ERCOT (Texas Grid)',
    shortName: 'ERCOT Texas',
    state: 'Texas',
    region: 'Texas',
    residentialCustomers: 12000000,
    totalCustomers: 26000000,
    systemPeakMW: 85508,
    averageMonthlyBill: 140,
    averageMonthlyUsageKWh: 1100,
    market: {
      ...ERCOT_MARKET,
      notes: 'Energy-only market. 46% of projected load growth from data centers.'
    },
    hasDataCenterActivity: true,
    dataCenterNotes: 'Data centers account for 46% of projected load growth',
    defaultDataCenterMW: 3000,
  },

  // ============================================
  // CUSTOM OPTION
  // ============================================
  {
    id: 'custom',
    name: 'Custom / Enter Your Own',
    shortName: 'Custom',
    state: '',
    region: '',
    residentialCustomers: 500000,
    totalCustomers: 600000,
    systemPeakMW: 4000,
    averageMonthlyBill: 144,
    averageMonthlyUsageKWh: 865,
    market: { ...REGULATED_MARKET },
    hasDataCenterActivity: false,
    dataCenterNotes: 'Enter your own utility parameters',
    defaultDataCenterMW: 1000,
  }
];

export function getUtilityById(id) {
  return UTILITY_PROFILES.find(u => u.id === id);
}

export function getUtilitiesByRegion() {
  return UTILITY_PROFILES.reduce((acc, utility) => {
    const region = utility.region || 'Other';
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(utility);
    return acc;
  }, {});
}

export function getUtilitiesByMarketType() {
  return UTILITY_PROFILES.reduce((acc, utility) => {
    const marketType = utility.market.type;
    if (!acc[marketType]) {
      acc[marketType] = [];
    }
    acc[marketType].push(utility);
    return acc;
  }, {});
}
