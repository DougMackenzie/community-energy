import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, BarChart, Bar, Cell, LabelList } from 'recharts';

// =============================================================================
// GRID & RATE CONSTANTS (PSO LPL 242)
// =============================================================================
const GRID_PEAK_CAPACITY = 8500;
const BASE_PEAK_TARGET = 4500;
const BASE_MIN_TARGET = 1800;

const FIRM_DC_SIZE = 4000;
const FLEX_DC_SIZE = 5000;
const LOAD_FACTOR = 0.95;

const RATE_DEMAND = 9050;
const RATE_MARGIN = 4.88;

// =============================================================================
// ECONOMIC DEVELOPMENT ASSUMPTIONS
// =============================================================================
const ECONOMIC = {
  // Investment
  capexPerMW: 8000000,           // $8M/MW all-in (land, building, equipment)

  // Jobs
  constructionJobsPerGW: 2500,   // Peak construction jobs per GW
  constructionDuration: 3,       // Years of major construction
  permanentJobsPerGW: 75,        // Ongoing operations jobs per GW
  avgConstructionWage: 65000,    // Annual
  avgPermanentWage: 85000,       // Annual (mix of tech + facilities)
  jobMultiplier: 1.5,            // Induced/indirect jobs multiplier

  // Tax Revenue
  propertyTaxRate: 0.012,        // 1.2% of assessed value
  assessmentRatio: 0.11,         // Oklahoma assessment ratio for commercial
  salesTaxOnConstruction: 0.045, // 4.5% state + local
  constructionMaterialsPct: 0.60, // % of capex that's taxable materials
};

// =============================================================================
// INDUSTRIAL COMPARISON
// =============================================================================
const INDUSTRIAL_COMPARISONS = {
  flexDataCenter: { name: 'Flex Data Center', loadFactor: 0.95, peakReduction: 0.20, color: '#16a34a' },
  firmDataCenter: { name: 'Firm Data Center', loadFactor: 0.95, peakReduction: 0, color: '#4ade80' },
  semiconductor: { name: 'Semiconductor Fab', loadFactor: 0.85, peakReduction: 0, color: '#60a5fa' },
  autoManufacturing: { name: 'Auto Manufacturing', loadFactor: 0.55, peakReduction: 0, color: '#f59e0b' },
  steelMill: { name: 'Steel Mill', loadFactor: 0.50, peakReduction: 0, color: '#ef4444' },
  generalManufacturing: { name: 'General Manufacturing', loadFactor: 0.45, peakReduction: 0, color: '#a855f7' },
};

// =============================================================================
// AVOIDED INFRASTRUCTURE COSTS
// =============================================================================
const AVOIDED_COSTS = {
  transmissionPerMW: 350000,     // $/MW of avoided transmission upgrade
  peakerCapacityPerMW: 150000,   // $/MW-year capacity cost avoided
  peakerAvoidanceFactor: 0.5,    // % of flex capacity that displaces peakers
};

// =============================================================================
// RESIDENTIAL CONTEXT
// =============================================================================
const RESIDENTIAL = {
  customersPreDC: 560000,
  avgMonthlyBill: 130,
  preDCSystemEnergy: 20000000,
  preDCResidentialShare: 0.35,
};

// =============================================================================
// WORKLOAD FLEXIBILITY MODEL
// =============================================================================
const IT_LOAD_FRACTION = 0.769;
const COOLING_LOAD_FRACTION = 0.231;

const WORKLOAD_MIX = {
  preTraining: { pctOfIT: 0.45, flexibility: 0.30, name: 'Pre-Training' },
  fineTuning: { pctOfIT: 0.20, flexibility: 0.50, name: 'Fine-Tuning' },
  batchInference: { pctOfIT: 0.15, flexibility: 0.90, name: 'Batch Inference' },
  realTimeInference: { pctOfIT: 0.20, flexibility: 0.05, name: 'Real-Time' }
};

const IT_FLEXIBILITY = Object.values(WORKLOAD_MIX).reduce(
  (sum, w) => sum + (w.pctOfIT * w.flexibility), 0
);
const IT_FACILITY_CONTRIBUTION = IT_LOAD_FRACTION * IT_FLEXIBILITY;
const COOLING_FLEXIBILITY = 0.12;
const COOLING_FACILITY_CONTRIBUTION = COOLING_LOAD_FRACTION * COOLING_FLEXIBILITY;
const TOTAL_FLEXIBILITY = IT_FACILITY_CONTRIBUTION + COOLING_FACILITY_CONTRIBUTION;

const BACKUP_GEN_PCT = 0.10;

// =============================================================================
// 8760 SIMULATION
// =============================================================================
const generateFullYearData = () => {
  const hourlyData = [];
  const monthlyBase = [0.45, 0.42, 0.35, 0.30, 0.45, 0.75, 0.95, 0.92, 0.70, 0.35, 0.38, 0.45];
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  for (let month = 0; month < 12; month++) {
    const seasonFactor = monthlyBase[month];
    for (let day = 1; day <= daysPerMonth[month]; day++) {
      const dailyWeatherFactor = 1 + (Math.random() * 0.15 - 0.075);
      for (let hour = 0; hour < 24; hour++) {
        let dailyProfile;
        if (month >= 5 && month <= 8) {
          const hNorm = (hour - 16) / 4;
          dailyProfile = Math.exp(-0.5 * hNorm * hNorm);
        } else {
          dailyProfile = 0.5 - 0.5 * Math.cos((hour - 4) * Math.PI / 10);
        }
        dailyProfile = Math.max(0, dailyProfile);

        const randomVar = Math.random() * 0.05 - 0.025;
        const normalizedLoad = (seasonFactor * 0.7) + (dailyProfile * 0.3 * seasonFactor * dailyWeatherFactor) + randomVar;
        let currentLoad = BASE_MIN_TARGET + (BASE_PEAK_TARGET - BASE_MIN_TARGET) * normalizedLoad;
        currentLoad = Math.min(BASE_PEAK_TARGET, Math.max(BASE_MIN_TARGET, currentLoad));

        hourlyData.push({ month, day, hour, baseLoad: Math.round(currentLoad), id: hourlyData.length });
      }
    }
  }
  return hourlyData;
};

const processScenarios = (rawData) => {
  let stats = {
    firmMWh: 0, flexGridMWh: 0, shiftedWorkloadMWh: 0, shiftedCoolingMWh: 0,
    backupGenMWh: 0, curtailmentEvents: 0,
    firmCPDemand: Array(12).fill(0), flexCPDemand: Array(12).fill(0),
    systemPeakHours: Array(12).fill({ hour: -1, load: 0 })
  };

  rawData.forEach(d => {
    const systemLoad = d.baseLoad + FIRM_DC_SIZE;
    if (systemLoad > stats.systemPeakHours[d.month].load) {
      stats.systemPeakHours[d.month] = { hour: d.id, load: systemLoad };
    }
  });

  const processedData = rawData.map(d => {
    const base = d.baseLoad;
    const isSystemPeakHour = (d.id === stats.systemPeakHours[d.month].hour);

    const firmActual = FIRM_DC_SIZE * LOAD_FACTOR;
    stats.firmMWh += firmActual;
    if (isSystemPeakHour) stats.firmCPDemand[d.month] = firmActual;

    const flexNominal = FLEX_DC_SIZE * LOAD_FACTOR;
    const gridAvailable = GRID_PEAK_CAPACITY - base;
    const gridShortfall = Math.max(0, flexNominal - gridAvailable);

    let response = { gridServed: Math.min(flexNominal, gridAvailable), shiftedWorkload: 0, shiftedCooling: 0, backupGen: 0 };

    if (gridShortfall > 0) {
      stats.curtailmentEvents++;
      let remaining = gridShortfall;

      const maxWorkloadShift = flexNominal * IT_FACILITY_CONTRIBUTION;
      response.shiftedWorkload = Math.min(remaining, maxWorkloadShift);
      remaining -= response.shiftedWorkload;
      stats.shiftedWorkloadMWh += response.shiftedWorkload;

      if (remaining > 0) {
        const maxCoolingShift = flexNominal * COOLING_FACILITY_CONTRIBUTION;
        response.shiftedCooling = Math.min(remaining, maxCoolingShift);
        remaining -= response.shiftedCooling;
        stats.shiftedCoolingMWh += response.shiftedCooling;
      }

      if (remaining > 0) {
        const maxBackup = FLEX_DC_SIZE * BACKUP_GEN_PCT * LOAD_FACTOR;
        response.backupGen = Math.min(remaining, maxBackup);
        stats.backupGenMWh += response.backupGen;
      }
    }

    stats.flexGridMWh += response.gridServed;
    if (isSystemPeakHour) stats.flexCPDemand[d.month] = response.gridServed;

    const totalShifted = response.shiftedWorkload + response.shiftedCooling;

    return {
      ...d, firmLoad: firmActual,
      flexGridBonus: Math.max(0, response.gridServed - firmActual),
      backupGen: response.backupGen, shiftedWorkload: totalShifted,
      response, isConstrained: gridShortfall > 0, totalShifted
    };
  });

  const firmAnnualDemandBilling = stats.firmCPDemand.reduce((a, b) => a + b, 0);
  const flexAnnualDemandBilling = stats.flexCPDemand.reduce((a, b) => a + b, 0);

  const ldcData = [...processedData].sort((a, b) => b.baseLoad - a.baseLoad).map((d, i) => ({ ...d, rank: i }));

  const peakHourIndex = rawData.reduce((maxIdx, d, i, arr) => d.baseLoad > arr[maxIdx].baseLoad ? i : maxIdx, 0);
  const peakDayStart = Math.floor(peakHourIndex / 24) * 24;
  const peakDayData = processedData.slice(peakDayStart, peakDayStart + 24).map(d => ({
    ...d, label: d.hour === 0 ? '12AM' : d.hour === 12 ? '12PM' : d.hour > 12 ? `${d.hour - 12}PM` : `${d.hour}AM`
  }));

  return { ldcData, peakDayData, stats: { ...stats, firmAnnualDemandBilling, flexAnnualDemandBilling } };
};

// =============================================================================
// COMPONENT
// =============================================================================
export default function RatepayerBenefitCalculator() {
  const [activeTab, setActiveTab] = useState('summary');
  const [viewMode, setViewMode] = useState('year');
  const [isZoomed, setIsZoomed] = useState(false);
  const [showShifted, setShowShifted] = useState(true);
  const [showAssumptions, setShowAssumptions] = useState(false);

  const { ldcData, peakDayData, stats } = useMemo(() => {
    const raw = generateFullYearData();
    return processScenarios(raw);
  }, []);

  const chartData = useMemo(() => {
    let data = viewMode === 'day'
      ? peakDayData
      : ldcData.slice(0, isZoomed ? 600 : 8760).filter((_, i) => i % (isZoomed ? 5 : 40) === 0).map(d => ({ ...d, hours: d.rank }));
    return data;
  }, [viewMode, isZoomed, ldcData, peakDayData]);

  // =============================================================================
  // COMPREHENSIVE ECONOMICS
  // =============================================================================
  const econ = useMemo(() => {
    // --- UTILITY REVENUE ---
    const firmDemandRev = stats.firmAnnualDemandBilling * RATE_DEMAND;
    const firmEnergyMargin = stats.firmMWh * RATE_MARGIN;
    const firmNetContribution = firmDemandRev + firmEnergyMargin;

    const flexDemandRev = stats.flexAnnualDemandBilling * RATE_DEMAND;
    const flexEnergyMargin = stats.flexGridMWh * RATE_MARGIN;
    const flexNetContribution = flexDemandRev + flexEnergyMargin;

    const deltaContribution = flexNetContribution - firmNetContribution;
    const energyDelta = flexEnergyMargin - firmEnergyMargin;

    // --- RESIDENTIAL_CONTEXT IMPACT ---
    const dcAnnualMWh = stats.firmMWh;
    const legacyAnnualMWh = RESIDENTIAL_CONTEXT.preDCSystemEnergy;
    const totalPostDCMWh = dcAnnualMWh + legacyAnnualMWh;

    const dcEnergyShare = dcAnnualMWh / totalPostDCMWh;
    const legacyEnergyShare = 1 - dcEnergyShare;
    const residentialShareOfLegacy = RESIDENTIAL_CONTEXT.preDCResidentialShare;

    const benefitToLegacyCustomers = deltaContribution;
    const benefitToResidential = benefitToLegacyCustomers * residentialShareOfLegacy;

    const perCustomerAnnual = benefitToResidential / RESIDENTIAL_CONTEXT.customersPreDC;
    const perCustomerMonthly = perCustomerAnnual / 12;
    const billPercentImpact = (perCustomerMonthly / RESIDENTIAL_CONTEXT.avgMonthlyBill) * 100;

    // Sensitivity
    const conservativeMonthly = (deltaContribution * 0.25 / RESIDENTIAL_CONTEXT.customersPreDC / 12);
    const aggressiveMonthly = (deltaContribution * 0.50 / RESIDENTIAL_CONTEXT.customersPreDC / 12);

    // --- ECONOMIC DEVELOPMENT ---
    const totalCapex = FLEX_DC_SIZE * ECONOMIC.capexPerMW;
    const constructionJobs = (FLEX_DC_SIZE / 1000) * ECONOMIC.constructionJobsPerGW;
    const permanentJobs = (FLEX_DC_SIZE / 1000) * ECONOMIC.permanentJobsPerGW;
    const totalJobsWithMultiplier = permanentJobs * ECONOMIC.jobMultiplier;

    const annualConstructionPayroll = constructionJobs * ECONOMIC.avgConstructionWage;
    const annualPermanentPayroll = permanentJobs * ECONOMIC.avgPermanentWage;

    // Tax revenue
    const assessedValue = totalCapex * ECONOMIC.assessmentRatio;
    const annualPropertyTax = assessedValue * ECONOMIC.propertyTaxRate;
    const constructionSalesTax = totalCapex * ECONOMIC.constructionMaterialsPct * ECONOMIC.salesTaxOnConstruction;
    const totalConstructionTax = constructionSalesTax; // One-time during construction

    // --- AVOIDED INFRASTRUCTURE ---
    const avoidedTransmissionMW = FLEX_DC_SIZE * TOTAL_FLEXIBILITY;
    const avoidedTransmissionCost = avoidedTransmissionMW * AVOIDED_COSTS.transmissionPerMW;
    const avoidedPeakerCapacity = FLEX_DC_SIZE * TOTAL_FLEXIBILITY * AVOIDED_COSTS.peakerAvoidanceFactor;
    const annualAvoidedPeakerCost = avoidedPeakerCapacity * AVOIDED_COSTS.peakerCapacityPerMW;

    // --- INDUSTRIAL COMPARISON ---
    const industrialComparison = Object.entries(INDUSTRIAL_COMPARISONS).map(([key, ind]) => {
      const effectivePeakMW = 1000 * (1 - ind.peakReduction); // Per GW nameplate
      const annualMWh = 1000 * 8760 * ind.loadFactor;
      const demandRev = effectivePeakMW * 12 * RATE_DEMAND;
      const energyMargin = annualMWh * RATE_MARGIN;
      const totalContribution = demandRev + energyMargin;
      const contributionPerPeakMW = totalContribution / effectivePeakMW;

      return {
        key, ...ind,
        annualMWh: annualMWh / 1e6,
        totalContribution: totalContribution / 1e6,
        contributionPerPeakMW: contributionPerPeakMW / 1000,
        effectivePeakMW
      };
    });

    // --- COUNTERFACTUAL ---
    const counterfactual = {
      withDC: {
        jobs: Math.round(totalJobsWithMultiplier),
        annualTaxRevenue: annualPropertyTax,
        utilityContribution: flexNetContribution,
        totalInvestment: totalCapex,
        constructionPayroll: annualConstructionPayroll * ECONOMIC.constructionDuration,
      },
      withoutDC: {
        jobs: 0,
        annualTaxRevenue: 0,
        utilityContribution: 0,
        totalInvestment: 0,
        constructionPayroll: 0,
      }
    };

    const fmtB = (v) => `$${(v / 1e9).toFixed(1)}B`;
    const fmtM = (v) => `$${(v / 1e6).toFixed(0)}M`;
    const fmtMSigned = (v) => v >= 0 ? `+$${(v / 1e6).toFixed(0)}M` : `-$${(Math.abs(v) / 1e6).toFixed(0)}M`;
    const fmtK = (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toString();

    return {
      // Utility
      firmNetCont: fmtB(firmNetContribution),
      flexNetCont: fmtB(flexNetContribution),
      deltaContribution: fmtMSigned(deltaContribution),
      deltaRaw: deltaContribution,
      energyDelta: fmtMSigned(energyDelta),

      // Residential
      dcEnergyShare: (dcEnergyShare * 100).toFixed(0),
      legacyEnergyShare: (legacyEnergyShare * 100).toFixed(0),
      benefitToResidential: fmtM(benefitToResidential),
      perCustomerMonthly: perCustomerMonthly.toFixed(2),
      billPercentImpact: billPercentImpact.toFixed(1),
      conservativeMonthly: conservativeMonthly.toFixed(2),
      aggressiveMonthly: aggressiveMonthly.toFixed(2),

      // Economic Development
      totalCapex: fmtB(totalCapex),
      totalCapexRaw: totalCapex,
      constructionJobs: fmtK(constructionJobs),
      constructionJobsRaw: constructionJobs,
      permanentJobs: Math.round(permanentJobs),
      totalJobsWithMultiplier: Math.round(totalJobsWithMultiplier),
      annualConstructionPayroll: fmtM(annualConstructionPayroll),
      annualPermanentPayroll: fmtM(annualPermanentPayroll),
      annualPropertyTax: fmtM(annualPropertyTax),
      annualPropertyTaxRaw: annualPropertyTax,
      constructionSalesTax: fmtM(constructionSalesTax),

      // Avoided Infrastructure
      avoidedTransmissionMW: Math.round(avoidedTransmissionMW),
      avoidedTransmissionCost: fmtM(avoidedTransmissionCost),
      avoidedTransmissionCostRaw: avoidedTransmissionCost,
      annualAvoidedPeakerCost: fmtM(annualAvoidedPeakerCost),
      annualAvoidedPeakerCostRaw: annualAvoidedPeakerCost,

      // Industrial Comparison
      industrialComparison,

      // Counterfactual
      counterfactual,

      // Operational
      totalFlexPct: (TOTAL_FLEXIBILITY * 100).toFixed(1),
      curtailmentPct: ((stats.curtailmentEvents / 8760) * 100).toFixed(1),
    };
  }, [stats]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white p-2 border border-gray-300 shadow-lg rounded text-xs min-w-[200px]">
        <p className="font-bold mb-1 border-b pb-1">{viewMode === 'day' ? d.label : `Hour #${d.rank}`}</p>
        <div className="space-y-0.5">
          <div className="flex justify-between"><span className="text-gray-500">Base Grid:</span><span>{d.baseLoad.toLocaleString()} MW</span></div>
          <div className="flex justify-between text-green-600"><span>Firm DC:</span><span>+{Math.round(d.firmLoad).toLocaleString()} MW</span></div>
          {d.flexGridBonus > 0 && <div className="flex justify-between text-green-800 font-medium"><span>Flex Bonus:</span><span>+{Math.round(d.flexGridBonus).toLocaleString()} MW</span></div>}
        </div>
        {d.isConstrained && (
          <div className="border-t mt-1 pt-1">
            <div className="text-purple-700 font-bold text-[10px]">SHIFTED WORKLOAD</div>
            <div className="flex justify-between text-purple-600"><span>Deferred:</span><span className="font-bold">{Math.round(d.totalShifted).toLocaleString()} MW</span></div>
          </div>
        )}
      </div>
    );
  };

  // =============================================================================
  // TAB CONTENT
  // =============================================================================
  const renderExecutiveSummary = () => (
    <div className="space-y-4">
      {/* Hero Stats */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 text-white">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-300">Flexible Data Center Campus</h3>
          <div className="text-5xl font-bold text-white mt-1">{FLEX_DC_SIZE.toLocaleString()} MW</div>
          <div className="text-sm text-gray-400 mt-1">AI/HPC Campus with {econ.totalFlexPct}% Load Flexibility</div>
        </div>

        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{econ.totalCapex}</div>
            <div className="text-xs text-gray-400">Total Investment</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{econ.constructionJobs}</div>
            <div className="text-xs text-gray-400">Construction Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-300">{econ.permanentJobs}</div>
            <div className="text-xs text-gray-400">Permanent Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">{econ.annualPropertyTax}</div>
            <div className="text-xs text-gray-400">Annual Property Tax</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{econ.deltaContribution}</div>
            <div className="text-xs text-gray-400">Added Rate Contribution</div>
          </div>
        </div>
      </div>

      {/* Key Messages */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="text-green-800 font-bold mb-2">Ratepayer Benefit</div>
          <div className="text-2xl font-bold text-green-900">${econ.perCustomerMonthly}/mo</div>
          <div className="text-sm text-green-700">downward rate pressure per household</div>
          <div className="text-xs text-green-600 mt-2">
            {econ.billPercentImpact}% of typical bill - Range: ${econ.conservativeMonthly}-${econ.aggressiveMonthly}/mo
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="text-blue-800 font-bold mb-2">Grid Reliability</div>
          <div className="text-2xl font-bold text-blue-900">{econ.avoidedTransmissionMW} MW</div>
          <div className="text-sm text-blue-700">of demand response capacity</div>
          <div className="text-xs text-blue-600 mt-2">
            Curtails during peaks - No new infrastructure needed
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="text-purple-800 font-bold mb-2">Economic Impact</div>
          <div className="text-2xl font-bold text-purple-900">{econ.totalJobsWithMultiplier}</div>
          <div className="text-sm text-purple-700">total jobs (direct + induced)</div>
          <div className="text-xs text-purple-600 mt-2">
            ${(econ.annualPropertyTaxRaw / 1e6).toFixed(0)}M annual tax revenue
          </div>
        </div>
      </div>

      {/* The Counterfactual */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
        <div className="text-amber-900 font-bold mb-3">The Alternative: What If This Project Goes Elsewhere?</div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-bold text-green-700 mb-2">With Flexible DC in Oklahoma</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Total Investment:</span><span className="font-bold">{econ.totalCapex}</span></div>
              <div className="flex justify-between"><span>Jobs Created:</span><span className="font-bold">{econ.totalJobsWithMultiplier}</span></div>
              <div className="flex justify-between"><span>Annual Tax Revenue:</span><span className="font-bold">{econ.annualPropertyTax}</span></div>
              <div className="flex justify-between"><span>Utility Contribution:</span><span className="font-bold">{econ.flexNetCont}/year</span></div>
              <div className="flex justify-between"><span>Rate Benefit:</span><span className="font-bold text-green-700">${econ.perCustomerMonthly}/mo savings</span></div>
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-red-700 mb-2">Without DC (Goes to Texas/Kansas)</div>
            <div className="space-y-1 text-sm text-gray-500">
              <div className="flex justify-between"><span>Total Investment:</span><span className="font-bold">$0</span></div>
              <div className="flex justify-between"><span>Jobs Created:</span><span className="font-bold">0</span></div>
              <div className="flex justify-between"><span>Annual Tax Revenue:</span><span className="font-bold">$0</span></div>
              <div className="flex justify-between"><span>Utility Contribution:</span><span className="font-bold">$0</span></div>
              <div className="flex justify-between"><span>Rate Benefit:</span><span className="font-bold text-red-600">$0 (no change)</span></div>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-amber-800 bg-amber-100 p-2 rounded">
          <b>Key Point:</b> Oklahoma is competing with other states for this investment. The question isn't
          "is this a good deal?" but "do we want this economic development or not?"
        </div>
      </div>
    </div>
  );

  const renderIndustrialComparison = () => (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4">
        <div className="text-sm font-bold text-gray-700 mb-1">Utility Contribution Efficiency: Data Centers vs Other Industrial</div>
        <div className="text-xs text-gray-500 mb-4">
          Contribution to utility fixed cost recovery per MW of peak grid impact (higher is better for ratepayers)
        </div>

        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={econ.industrialComparison}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 200]} tickFormatter={(v) => `$${v}k`} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <Tooltip
                formatter={(value) => [`$${value.toFixed(0)}k/MW`, 'Contribution']}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="contributionPerPeakMW" radius={[0, 4, 4, 0]}>
                {econ.industrialComparison.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList dataKey="contributionPerPeakMW" position="right" formatter={(v) => `$${v.toFixed(0)}k`} style={{ fontSize: 10 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <div className="font-bold text-green-800">Why Flex DC is Best for Ratepayers</div>
            <ul className="mt-2 space-y-1 text-green-700">
              <li>- <b>95% load factor</b> vs 45-55% for typical manufacturing</li>
              <li>- Generates <b>2x more energy margin</b> per MW of peak demand</li>
              <li>- <b>Curtails during peaks</b>, reducing effective grid impact</li>
              <li>- Net result: <b>40%+ higher contribution</b> per MW than general manufacturing</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <div className="font-bold text-blue-800">Load Factor Matters</div>
            <div className="mt-2 text-blue-700">
              A factory that runs one shift (45% LF) uses peak grid capacity but pays demand charges
              for infrastructure it only uses part-time. A data center at 95% LF pays the same demand
              charges but generates <b>2x the energy margin</b>—effectively subsidizing other ratepayers.
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white border rounded-lg p-4">
        <div className="text-sm font-bold text-gray-700 mb-3">Detailed Comparison (per GW of Nameplate Capacity)</div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-2 px-2">Industrial Type</th>
              <th className="text-center py-2 px-2">Load Factor</th>
              <th className="text-center py-2 px-2">Effective Peak</th>
              <th className="text-center py-2 px-2">Annual Energy</th>
              <th className="text-center py-2 px-2">Contribution</th>
              <th className="text-center py-2 px-2">$/MW Peak</th>
            </tr>
          </thead>
          <tbody>
            {econ.industrialComparison.map((ind, i) => (
              <tr key={ind.key} className={`border-b ${ind.key.includes('flex') ? 'bg-green-50' : ''}`}>
                <td className="py-2 px-2 font-medium" style={{ color: ind.color }}>{ind.name}</td>
                <td className="py-2 px-2 text-center">{(ind.loadFactor * 100).toFixed(0)}%</td>
                <td className="py-2 px-2 text-center">{ind.effectivePeakMW.toLocaleString()} MW</td>
                <td className="py-2 px-2 text-center">{ind.annualMWh.toFixed(1)}M MWh</td>
                <td className="py-2 px-2 text-center">${ind.totalContribution.toFixed(0)}M</td>
                <td className="py-2 px-2 text-center font-bold">${ind.contributionPerPeakMW.toFixed(0)}k</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAvoidedCosts = () => (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4">
        <div className="text-sm font-bold text-gray-700 mb-3">Avoided Infrastructure Costs</div>
        <div className="text-xs text-gray-500 mb-4">
          Benefits not captured in direct utility revenue but reduce costs for all ratepayers
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-800 font-bold mb-2">Avoided Transmission Investment</div>
            <div className="text-3xl font-bold text-blue-900">{econ.avoidedTransmissionCost}</div>
            <div className="text-sm text-blue-600 mt-1">one-time capital deferral</div>
            <div className="mt-3 text-xs text-blue-700">
              The grid doesn't need to be built for {FLEX_DC_SIZE.toLocaleString()} MW peak if the DC curtails
              to {FIRM_DC_SIZE.toLocaleString()} MW during system peaks. This defers {econ.avoidedTransmissionMW} MW
              of transmission upgrades at ~$350k/MW.
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-green-800 font-bold mb-2">Avoided Peaker Capacity</div>
            <div className="text-3xl font-bold text-green-900">{econ.annualAvoidedPeakerCost}</div>
            <div className="text-sm text-green-600 mt-1">annual capacity cost avoided</div>
            <div className="mt-3 text-xs text-green-700">
              Flex DC provides {econ.avoidedTransmissionMW} MW of demand response capability.
              This displaces the need for peaker plants or purchased capacity at ~$150k/MW-year.
            </div>
          </div>
        </div>

        <div className="mt-4 bg-amber-50 p-3 rounded border border-amber-200">
          <div className="text-xs text-amber-800">
            <b>Total Additional Benefit:</b> {econ.avoidedTransmissionCost} one-time + {econ.annualAvoidedPeakerCost}/year ongoing.
            These benefits are <b>in addition to</b> the {econ.deltaContribution}/year in direct utility contribution shown elsewhere.
          </div>
        </div>
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="space-y-3">
      {[
        {
          q: "Will my power go out so the data center can keep running?",
          a: "No. The data center curtails FIRST during grid stress. Residential customers are protected—the DC reduces its load before any rolling blackouts would affect homes. This is contractually required and technically enforced.",
          color: "green"
        },
        {
          q: "Is the data center getting a sweetheart deal?",
          a: `No. The flexible data center actually contributes MORE per MW of grid impact than typical industrial customers. At 95% load factor vs 45-55% for manufacturing, DCs generate roughly 2x the energy margin while using the same peak infrastructure. The flex strategy makes this even better—they pay for 5 GW of energy but only use 4 GW of peak capacity.`,
          color: "blue"
        },
        {
          q: "What about water usage?",
          a: "Modern AI data centers increasingly use advanced cooling (immersion cooling, indirect evaporative) that dramatically reduces water consumption compared to traditional facilities. Specific water commitments should be part of any development agreement.",
          color: "cyan"
        },
        {
          q: "Will they leave in 10 years?",
          a: `Data centers represent massive infrastructure investments ($${(ECONOMIC_ASSUMPTIONS.capexPerMW * FLEX_DC_SIZE / 1e9).toFixed(0)}B+ for this campus) with 20-30 year useful lives. Unlike manufacturing that can relocate equipment, data center infrastructure is permanent. Long-term commitments can be contractually required.`,
          color: "purple"
        },
        {
          q: "Why should we believe the jobs numbers?",
          a: `Construction jobs (${econ.constructionJobs}) are typical for infrastructure projects of this scale. Permanent jobs (${econ.permanentJobs}) reflect industry standards of 15-20 jobs per 100 MW for operations, security, and maintenance. These are verifiable against other data center projects.`,
          color: "amber"
        },
        {
          q: "What if electricity rates go up anyway?",
          a: "Rates are affected by many factors (fuel costs, other infrastructure needs, regulatory decisions). The data center's contribution creates DOWNWARD pressure—rates would be ~" + econ.billPercentImpact + "% HIGHER without this contribution. The benefit is real even if other factors cause overall rates to change.",
          color: "gray"
        },
      ].map((faq, i) => (
        <div key={i} className={`bg-${faq.color}-50 border border-${faq.color}-200 rounded-lg p-4`}>
          <div className={`font-bold text-${faq.color}-900 mb-2`}>Q: {faq.q}</div>
          <div className={`text-sm text-${faq.color}-800`}>{faq.a}</div>
        </div>
      ))}
    </div>
  );

  const renderRateAnalysis = () => (
    <div className="space-y-4">
      {/* Core comparison */}
      <div className="bg-white border-2 border-green-200 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold mb-2">Standard Firm Load</div>
            <div className="text-3xl font-bold text-gray-700">{FIRM_DC_SIZE.toLocaleString()} MW</div>
            <div className="text-sm text-gray-500">Fixed capacity, 24/7</div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between text-sm font-bold">
                <span>Net Contribution:</span>
                <span>{econ.firmNetCont}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 -m-4 p-4 rounded-lg border-l-4 border-green-500">
            <div className="text-xs text-green-700 uppercase font-bold mb-2">Flexible Load</div>
            <div className="text-3xl font-bold text-green-800">{FLEX_DC_SIZE.toLocaleString()} MW</div>
            <div className="text-sm text-green-600">{econ.totalFlexPct}% inherently flexible</div>
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-green-800">Net Contribution:</span>
                <span className="text-green-900">{econ.flexNetCont}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center bg-slate-800 -m-4 p-4 rounded-r-lg text-white">
            <div className="text-xs text-gray-400 uppercase font-bold mb-1">Additional Contribution</div>
            <div className="text-4xl font-bold text-green-400">{econ.deltaContribution}</div>
            <div className="text-xs text-gray-400 mt-1">per year</div>
          </div>
        </div>
      </div>

      {/* Residential Impact */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="text-sm font-bold text-blue-900 mb-3">Residential Bill Impact</div>

        <div className="grid grid-cols-4 gap-3 mb-3">
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-xs text-gray-500">Incremental Contribution</div>
            <div className="text-xl font-bold text-gray-800">{econ.deltaContribution}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-blue-600">To Legacy Customers</div>
            <div className="text-xl font-bold text-blue-700">{econ.deltaContribution}</div>
            <div className="text-[10px] text-blue-500">100% (DC provides benefit)</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="text-xs text-green-600">To Residential</div>
            <div className="text-xl font-bold text-green-700">{econ.benefitToResidential}</div>
            <div className="text-[10px] text-green-500">35% of legacy benefit</div>
          </div>
          <div className="bg-green-100 rounded-lg p-3 border-2 border-green-400">
            <div className="text-xs text-green-700">Per Household</div>
            <div className="text-xl font-bold text-green-900">${econ.perCustomerMonthly}/mo</div>
            <div className="text-[10px] text-green-600">{econ.billPercentImpact}% of avg bill</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border text-xs text-gray-700">
          <b>Interpretation:</b> Rates would need to be ~{econ.billPercentImpact}% <b>higher</b> without the flexible load strategy.
          Range: ${econ.conservativeMonthly}-${econ.aggressiveMonthly}/month depending on regulatory allocation.
        </div>
      </div>

      {/* Chart */}
      <div className="flex justify-between items-center">
        <div className="flex bg-gray-200 p-0.5 rounded-lg">
          <button onClick={() => setViewMode('day')} className={`px-3 py-1 rounded text-xs font-medium ${viewMode === 'day' ? 'bg-white shadow' : ''}`}>Peak Day</button>
          <button onClick={() => { setViewMode('year'); setIsZoomed(false); }} className={`px-3 py-1 rounded text-xs font-medium ${viewMode === 'year' ? 'bg-white shadow' : ''}`}>Annual LDC</button>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-[10px]">
            <input type="checkbox" checked={showShifted} onChange={(e) => setShowShifted(e.target.checked)} className="w-3 h-3" />
            <span className="text-purple-700 font-medium">Show Shifted Workload</span>
          </label>
          {viewMode === 'year' && (
            <button onClick={() => setIsZoomed(!isZoomed)} className={`text-[10px] px-2 py-0.5 rounded border ${isZoomed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white'}`}>
              {isZoomed ? "Full Year" : "Peak Hours"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-lg p-2" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
            <defs>
              <pattern id="shiftedPattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <rect width="8" height="8" fill="#f3e8ff" />
                <rect width="2" height="8" fill="#a855f7" />
              </pattern>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis dataKey={viewMode === 'day' ? 'label' : 'hours'} tick={{ fontSize: 9 }} />
            <YAxis domain={[0, 11000]} tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 9 }} />
            <Tooltip content={<CustomTooltip />} />

            <Area type="monotone" dataKey="baseLoad" stackId="1" stroke="#9ca3af" fill="#e5e7eb" isAnimationActive={false} />
            <Area type="monotone" dataKey="firmLoad" stackId="1" stroke="#4ade80" fill="#86efac" isAnimationActive={false} />
            <Area type="monotone" dataKey="flexGridBonus" stackId="1" stroke="#15803d" fill="#16a34a" isAnimationActive={false} />
            {showShifted && (
              <Area type="monotone" dataKey="shiftedWorkload" stackId="1" stroke="#9333ea" strokeWidth={2} strokeDasharray="6 3" fill="url(#shiftedPattern)" isAnimationActive={false} />
            )}
            <ReferenceLine y={GRID_PEAK_CAPACITY} stroke="#dc2626" strokeWidth={2} strokeDasharray="8 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-[10px] text-gray-600">
        <span className="flex items-center gap-1"><span className="w-3 h-2 bg-gray-200 border border-gray-400"></span>Base Grid</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 bg-green-300 border border-green-500"></span>Firm DC</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 bg-green-600"></span>Flex Bonus</span>
        {showShifted && <span className="flex items-center gap-1"><span className="w-4 h-2 bg-purple-100 border-2 border-purple-500 border-dashed"></span>Shifted</span>}
        <span className="flex items-center gap-1"><span className="w-6 border-t-2 border-red-600 border-dashed"></span>Grid Cap</span>
      </div>
    </div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================
  return (
    <div className="w-full bg-slate-50 p-4 font-sans text-sm">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Community Impact Analysis: Flexible Data Center Development</h2>
        <p className="text-xs text-gray-600 mt-1">
          Comprehensive analysis of economic development, ratepayer impact, and grid benefits
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 bg-gray-200 p-1 rounded-lg">
        {[
          { id: 'summary', label: 'Executive Summary' },
          { id: 'rates', label: 'Rate Analysis' },
          { id: 'comparison', label: 'Industrial Comparison' },
          { id: 'infrastructure', label: 'Avoided Costs' },
          { id: 'faq', label: 'FAQ / Objections' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === tab.id ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'summary' && renderExecutiveSummary()}
        {activeTab === 'rates' && renderRateAnalysis()}
        {activeTab === 'comparison' && renderIndustrialComparison()}
        {activeTab === 'infrastructure' && renderAvoidedCosts()}
        {activeTab === 'faq' && renderFAQ()}
      </div>

      {/* Assumptions Toggle */}
      <div className="mt-4">
        <button
          onClick={() => setShowAssumptions(!showAssumptions)}
          className={`text-xs px-3 py-1.5 rounded border transition-colors ${showAssumptions ? 'bg-slate-100 border-slate-400' : 'bg-white border-gray-300'}`}
        >
          {showAssumptions ? 'Hide' : 'Show'} Key Assumptions & Methodology
        </button>
      </div>

      {showAssumptions && (
        <div className="mt-3 bg-white border rounded-lg p-4 text-xs">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="font-bold text-gray-700 mb-2">Rate Structure (PSO LPL 242)</div>
              <ul className="space-y-1 text-gray-600">
                <li>- Demand: ${RATE_DEMAND.toLocaleString()}/MW-mo</li>
                <li>- Energy margin: ${RATE_MARGIN}/MWh</li>
                <li>- Coincident peak billing</li>
                <li>- Load factor: {(LOAD_FACTOR * 100)}%</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-gray-700 mb-2">Economic Development</div>
              <ul className="space-y-1 text-gray-600">
                <li>- CapEx: ${(ECONOMIC_ASSUMPTIONS.capexPerMW / 1e6)}M/MW</li>
                <li>- Construction: {ECONOMIC_ASSUMPTIONS.constructionJobsPerGW}/GW</li>
                <li>- Permanent: {ECONOMIC_ASSUMPTIONS.permanentJobsPerGW}/GW</li>
                <li>- Job multiplier: {ECONOMIC_ASSUMPTIONS.jobMultiplier}x</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-gray-700 mb-2">Flexibility Model</div>
              <ul className="space-y-1 text-gray-600">
                <li>- IT flexibility: {(IT_FACILITY_CONTRIBUTION * 100).toFixed(1)}% of facility</li>
                <li>- Cooling flex: {(COOLING_FACILITY_CONTRIBUTION * 100).toFixed(1)}% of facility</li>
                <li>- Total: {(TOTAL_FLEXIBILITY * 100).toFixed(1)}%</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
