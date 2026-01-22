// Utility data compiled from public sources including EIA, utility filings, and annual reports
// Data reflects 2024 figures where available

export interface UtilityProfile {
  id: string;
  name: string;
  shortName: string;
  state: string;
  region: string;
  // Rate base data
  residentialCustomers: number;
  totalCustomers: number;
  // System characteristics
  systemPeakMW: number;
  // Billing data
  averageMonthlyBill: number;
  averageMonthlyUsageKWh: number;
  // Data center context
  hasDataCenterActivity: boolean;
  dataCenterNotes?: string;
  // Default data center size for this utility (MW)
  defaultDataCenterMW: number;
  // Sources
  sources: string[];
}

export const UTILITY_PROFILES: UtilityProfile[] = [
  {
    id: 'pso-oklahoma',
    name: 'Public Service Company of Oklahoma (PSO)',
    shortName: 'PSO Oklahoma',
    state: 'Oklahoma',
    region: 'Southwest',
    residentialCustomers: 460000, // ~80% of 575K total
    totalCustomers: 575000,
    systemPeakMW: 4400,
    averageMonthlyBill: 130,
    averageMonthlyUsageKWh: 1100,
    hasDataCenterActivity: true,
    dataCenterNotes: 'Meta proposed 2GW facility; PSO facing 31% power deficit by 2031 with 779MW of new large load requests',
    defaultDataCenterMW: 2000,
    sources: [
      'PSO 2024 IRP Report',
      'Oklahoma Corporation Commission filings',
      'AEP annual reports'
    ]
  },
  {
    id: 'dominion-virginia',
    name: 'Dominion Energy Virginia',
    shortName: 'Dominion Virginia',
    state: 'Virginia',
    region: 'Mid-Atlantic',
    residentialCustomers: 2500000,
    totalCustomers: 2800000,
    systemPeakMW: 18000, // Current system peak, with DC growth projecting +9GW in 10 years
    averageMonthlyBill: 145,
    averageMonthlyUsageKWh: 1050,
    hasDataCenterActivity: true,
    dataCenterNotes: 'Data center capital of the world; 933MW connected in 2023, forecasting 9GW DC peak in 10 years (25% system increase)',
    defaultDataCenterMW: 1500,
    sources: [
      'Dominion Energy 2024 IRP',
      'Virginia SCC filings',
      'JLARC Virginia Data Center Study 2024'
    ]
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
    hasDataCenterActivity: true,
    dataCenterNotes: 'Growing data center presence in Charlotte metro area',
    defaultDataCenterMW: 1000,
    sources: [
      'Duke Energy 2024 annual report',
      'NC Utilities Commission filings'
    ]
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
    hasDataCenterActivity: true,
    dataCenterNotes: 'Serves Raleigh area with growing tech sector',
    defaultDataCenterMW: 800,
    sources: [
      'Duke Energy 2024 annual report',
      'NC Utilities Commission filings'
    ]
  },
  {
    id: 'georgia-power',
    name: 'Georgia Power',
    shortName: 'Georgia Power',
    state: 'Georgia',
    region: 'Southeast',
    residentialCustomers: 2400000, // ~85% of 2.8M total
    totalCustomers: 2804000,
    systemPeakMW: 17100,
    averageMonthlyBill: 153, // GA average higher than national
    averageMonthlyUsageKWh: 1150,
    hasDataCenterActivity: true,
    dataCenterNotes: 'Projecting 8,200 MW of load growth by 2030, including significant data center demand in Atlanta metro',
    defaultDataCenterMW: 1200,
    sources: [
      'Georgia Power 2024 Facts & Figures',
      'Georgia PSC filings',
      'Southern Company annual reports'
    ]
  },
  {
    id: 'aps-arizona',
    name: 'Arizona Public Service (APS)',
    shortName: 'APS Arizona',
    state: 'Arizona',
    region: 'Southwest',
    residentialCustomers: 1200000, // ~85% of 1.4M
    totalCustomers: 1400000,
    systemPeakMW: 8212, // 2024 record
    averageMonthlyBill: 140,
    averageMonthlyUsageKWh: 1050,
    hasDataCenterActivity: true,
    dataCenterNotes: 'Phoenix metro data center growth; projecting 40% peak demand growth to 13,000 MW by 2031',
    defaultDataCenterMW: 800,
    sources: [
      'APS 2024 peak demand records',
      'Arizona Corporation Commission filings'
    ]
  },
  {
    id: 'nv-energy',
    name: 'NV Energy',
    shortName: 'NV Energy Nevada',
    state: 'Nevada',
    region: 'West',
    residentialCustomers: 610000, // Based on 505K non-solar + 105K solar
    totalCustomers: 2400000, // Total electric customers
    systemPeakMW: 9000,
    averageMonthlyBill: 125,
    averageMonthlyUsageKWh: 900,
    hasDataCenterActivity: true,
    dataCenterNotes: 'Data centers requesting to triple peak demand; Switch and Novva planning 4,000 MW of AI data centers in Reno area',
    defaultDataCenterMW: 1500,
    sources: [
      'NV Energy company facts',
      'Nevada PUC filings',
      'Greenlink transmission project documents'
    ]
  },
  {
    id: 'xcel-colorado',
    name: 'Xcel Energy Colorado',
    shortName: 'Xcel Colorado',
    state: 'Colorado',
    region: 'Mountain West',
    residentialCustomers: 1400000, // ~87% of 1.6M
    totalCustomers: 1600000,
    systemPeakMW: 7200, // Current, projecting 8,600 MW by 2031
    averageMonthlyBill: 105, // Below national average
    averageMonthlyUsageKWh: 700,
    hasDataCenterActivity: true,
    dataCenterNotes: 'Data centers expected to drive 2/3 of new demand; 19% peak increase projected by 2031',
    defaultDataCenterMW: 600,
    sources: [
      'Xcel Energy Colorado rate filings',
      'Colorado PUC documents'
    ]
  },
  {
    id: 'ercot-texas',
    name: 'ERCOT (Texas Grid)',
    shortName: 'ERCOT Texas',
    state: 'Texas',
    region: 'Texas',
    residentialCustomers: 12000000, // Rough estimate of residential portion of 26M customers
    totalCustomers: 26000000,
    systemPeakMW: 85508, // 2023 record
    averageMonthlyBill: 140,
    averageMonthlyUsageKWh: 1100,
    hasDataCenterActivity: true,
    dataCenterNotes: 'Data centers account for 46% of projected load growth; demand projected to grow from 87 GW to 145 GW by 2031',
    defaultDataCenterMW: 3000,
    sources: [
      'ERCOT load forecasts',
      'EIA Texas electricity data',
      'Texas PUC filings'
    ]
  },
  {
    id: 'custom',
    name: 'Custom / Enter Your Own',
    shortName: 'Custom',
    state: '',
    region: '',
    residentialCustomers: 500000,
    totalCustomers: 600000,
    systemPeakMW: 4000,
    averageMonthlyBill: 144, // National average
    averageMonthlyUsageKWh: 865, // National average
    hasDataCenterActivity: false,
    dataCenterNotes: 'Enter your own utility parameters',
    defaultDataCenterMW: 1000,
    sources: ['EIA national averages']
  }
];

// Helper to get utility by ID
export function getUtilityById(id: string): UtilityProfile | undefined {
  return UTILITY_PROFILES.find(u => u.id === id);
}

// Get utilities grouped by region
export function getUtilitiesByRegion(): Record<string, UtilityProfile[]> {
  return UTILITY_PROFILES.reduce((acc, utility) => {
    const region = utility.region || 'Other';
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(utility);
    return acc;
  }, {} as Record<string, UtilityProfile[]>);
}
