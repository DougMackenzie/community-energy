/**
 * Community Energy Cost Calculator - Calculation Engine (TypeScript)
 * 
 * Core calculation logic migrated from React app with TypeScript types
 */

import {
    DEFAULT_UTILITY,
    DEFAULT_DATA_CENTER,
    INFRASTRUCTURE_COSTS,
    TIME_PARAMS,
    DC_RATE_STRUCTURE,
    calculateDCRevenueOffset,
    type Utility,
    type DataCenter,
} from './constants';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TrajectoryPoint {
    year: number;
    yearIndex: number;
    monthlyBill: number;
    annualBill: number;
    scenario: string;
    dcOnline?: boolean;
    components: {
        baseline?: number;
        dcImpact?: number;
        base?: number;
        inflation?: number;
        annualIncreaseRate?: number;
    };
    parameters?: {
        loadFactor?: number;
        peakCoincidence?: number;
        residentialAllocation?: number;
        curtailablePercent?: number;
        onsiteGenerationMW?: number;
    };
    metrics?: any;
}

export interface SummaryStats {
    currentMonthlyBill: number;
    finalYearBills: {
        baseline: number;
        unoptimized: number;
        flexible: number;
        dispatchable: number;
    };
    finalYearDifference: {
        unoptimized: number;
        flexible: number;
        dispatchable: number;
    };
    benefitsRatepayers: {
        unoptimized: boolean;
        flexible: boolean;
        dispatchable: boolean;
    };
    savingsVsBaseline: {
        unoptimized: number;
        flexible: number;
        dispatchable: number;
    };
    savingsVsUnoptimized: {
        flexible: number;
        dispatchable: number;
    };
    cumulativeHouseholdCosts: {
        baseline: number;
        unoptimized: number;
        flexible: number;
        dispatchable: number;
    };
    cumulativeCommunitySavings: {
        unoptimized: number;
        flexible: number;
        dispatchable: number;
    };
    percentChange: {
        baseline: number;
        unoptimized: number;
        flexible: number;
        dispatchable: number;
    };
}

// ============================================
// RESIDENTIAL ALLOCATION MODEL
// ============================================

const calculateResidentialAllocation = (
    utility: Utility,
    dcCapacityMW: number,
    dcLoadFactor: number,
    dcPeakCoincidence: number,
    yearsOnline: number = 0
) => {
    const preDCSystemEnergyMWh = utility.preDCSystemEnergyGWh * 1000;
    const residentialEnergyMWh = preDCSystemEnergyMWh * utility.residentialEnergyShare;
    const dcAnnualEnergyMWh = dcCapacityMW * dcLoadFactor * 8760;
    const phaseInFactor = Math.min(1.0, yearsOnline / 3);
    const postDCSystemEnergyMWh = preDCSystemEnergyMWh + (dcAnnualEnergyMWh * phaseInFactor);
    const residentialVolumetricShare = residentialEnergyMWh / postDCSystemEnergyMWh;

    const estimatedSystemLF = 0.55;
    const preDCPeakMW = utility.systemPeakMW || (preDCSystemEnergyMWh / 8760 / estimatedSystemLF);
    const residentialPeakShare = 0.45;
    const residentialPeakMW = preDCPeakMW * residentialPeakShare;
    const dcPeakContribution = dcCapacityMW * dcPeakCoincidence * phaseInFactor;
    const postDCPeakMW = preDCPeakMW + dcPeakContribution;
    const residentialDemandShare = residentialPeakMW / postDCPeakMW;

    const totalCustomers = utility.residentialCustomers + utility.commercialCustomers + utility.industrialCustomers + 1;
    const residentialCustomerShare = utility.residentialCustomers / totalCustomers;

    const weightedAllocation =
        residentialVolumetricShare * 0.40 +
        residentialDemandShare * 0.40 +
        residentialCustomerShare * 0.20;

    const regulatoryLagFactor = Math.min(1.0, yearsOnline / 5);
    const baseAllocation = utility.baseResidentialAllocation;
    const adjustedAllocation = baseAllocation * (1 - regulatoryLagFactor) + weightedAllocation * regulatoryLagFactor;

    return {
        allocation: Math.max(0.15, Math.min(0.50, adjustedAllocation)),
        volumetricShare: residentialVolumetricShare,
        demandShare: residentialDemandShare,
        customerShare: residentialCustomerShare,
        weightedRaw: weightedAllocation,
        dcEnergyShareOfSystem: dcAnnualEnergyMWh * phaseInFactor / postDCSystemEnergyMWh,
        dcPeakShareOfSystem: dcPeakContribution / postDCPeakMW,
    };
};

// ============================================
// NET IMPACT CALCULATIONS
// ============================================

const calculateNetResidentialImpact = (
    dcCapacityMW: number,
    loadFactor: number,
    peakCoincidence: number,
    residentialCustomers: number,
    residentialAllocation: number,
    includeCapacityCredit: boolean = false,
    onsiteGenMW: number = 0,
    utility?: Utility
) => {
    const effectivePeakMW = dcCapacityMW * peakCoincidence - onsiteGenMW;
    const transmissionCost = Math.max(0, effectivePeakMW) * INFRASTRUCTURE_COSTS.transmissionCostPerMW;
    const distributionCost = Math.max(0, effectivePeakMW) * INFRASTRUCTURE_COSTS.distributionCostPerMW;
    const totalInfraCost = transmissionCost + distributionCost;
    const annualizedInfraCost = totalInfraCost / 20;

    const demandChargeAnnual = DC_RATE_STRUCTURE.demandChargePerMWMonth * 12;

    // Market-specific capacity cost calculation
    let baseCapacityCost = INFRASTRUCTURE_COSTS.capacityCostPerMWYear;
    let capacityCostPassThrough = utility?.capacityCostPassThrough ?? 0.40;

    // In capacity markets (PJM), use actual 2024 capacity price if available
    if (utility?.hasCapacityMarket && utility?.capacityPrice2024) {
        // Convert $/MW-day to $/MW-year
        const capacityPriceAnnual = utility.capacityPrice2024 * 365;
        // Blend the capacity cost with market price based on pass-through rate
        baseCapacityCost = INFRASTRUCTURE_COSTS.capacityCostPerMWYear * 0.5 +
                          capacityPriceAnnual * capacityCostPassThrough * 0.5;
    }

    // In energy-only markets (ERCOT), capacity costs are lower (no capacity market)
    if (utility?.marketType === 'ercot') {
        baseCapacityCost = INFRASTRUCTURE_COSTS.capacityCostPerMWYear * 0.60;
    }

    const netCapacityCostPerMW = Math.max(0, baseCapacityCost - demandChargeAnnual);
    let capacityCostOrCredit = Math.max(0, effectivePeakMW) * netCapacityCostPerMW;

    let capacityCredit = 0;
    if (includeCapacityCredit) {
        const curtailableMW = dcCapacityMW * (1 - peakCoincidence);
        // Capacity credits are more valuable in capacity markets
        const creditMultiplier = utility?.hasCapacityMarket ? 0.90 : 0.80;
        const drCreditValue = curtailableMW * baseCapacityCost * creditMultiplier;
        const genCreditValue = onsiteGenMW * baseCapacityCost * 0.95;
        capacityCredit = drCreditValue + genCreditValue;
        capacityCostOrCredit = capacityCostOrCredit - capacityCredit;
    }

    const dcRevenue = calculateDCRevenueOffset(dcCapacityMW, loadFactor, peakCoincidence);
    const grossAnnualInfraCost = annualizedInfraCost + capacityCostOrCredit;

    // Energy-only markets have more direct price signals, so energy margin benefit is higher
    const energyMarginFlowThrough = utility?.marketType === 'ercot' ? 0.90 : 0.85;
    const fixedCostSpreadingBenefit = dcRevenue.demandRevenue * 0.15;
    const revenueOffset = (dcRevenue.energyMargin * energyMarginFlowThrough) + fixedCostSpreadingBenefit;

    const netAnnualImpact = grossAnnualInfraCost - revenueOffset;

    // Apply market-adjusted residential allocation
    let adjustedAllocation = residentialAllocation;
    if (utility?.marketType === 'ercot') {
        // ERCOT: Large loads face market prices more directly, lower allocation to residential
        adjustedAllocation = residentialAllocation * 0.85;
    } else if (utility?.hasCapacityMarket && utility?.capacityPrice2024 && utility.capacityPrice2024 > 100) {
        // High capacity market prices increase allocation as costs spread
        const priceMultiplier = Math.min(1.15, 1 + (utility.capacityPrice2024 - 100) / 1000);
        adjustedAllocation = residentialAllocation * priceMultiplier;
    }

    const residentialImpact = netAnnualImpact * adjustedAllocation;
    const perCustomerMonthly = residentialImpact / residentialCustomers / 12;

    return {
        perCustomerMonthly,
        annualResidentialImpact: residentialImpact,
        grossCost: grossAnnualInfraCost,
        revenueOffset,
        netImpact: netAnnualImpact,
        metrics: {
            effectivePeakMW: Math.max(0, effectivePeakMW),
            transmissionCost,
            distributionCost,
            dcRevenuePerYear: dcRevenue.perYear,
            capacityCostOrCredit,
            revenueOffset,
            energyMarginFlowThrough,
            marketType: utility?.marketType ?? 'regulated',
            adjustedAllocation,
        },
    };
};

// ============================================
// TRAJECTORY CALCULATIONS
// ============================================

export const calculateBaselineTrajectory = (
    utility: Utility = DEFAULT_UTILITY,
    years: number = TIME_PARAMS.projectionYears
): TrajectoryPoint[] => {
    const trajectory: TrajectoryPoint[] = [];
    const baseYear = TIME_PARAMS.baseYear;
    let currentBill = utility.averageMonthlyBill;

    const baselineIncreaseRate =
        TIME_PARAMS.generalInflation +
        INFRASTRUCTURE_COSTS.annualBaselineUpgradePercent +
        0.005;

    for (let year = 0; year <= years; year++) {
        if (year > 0) {
            currentBill = utility.averageMonthlyBill * Math.pow(1 + baselineIncreaseRate, year);
        }

        trajectory.push({
            year: baseYear + year,
            yearIndex: year,
            monthlyBill: currentBill,
            annualBill: currentBill * 12,
            scenario: 'baseline',
            components: {
                base: utility.averageMonthlyBill,
                inflation: currentBill - utility.averageMonthlyBill,
                annualIncreaseRate: baselineIncreaseRate,
            },
        });
    }

    return trajectory;
};

export const calculateUnoptimizedTrajectory = (
    utility: Utility = DEFAULT_UTILITY,
    dataCenter: DataCenter = DEFAULT_DATA_CENTER,
    years: number = TIME_PARAMS.projectionYears
): TrajectoryPoint[] => {
    const trajectory: TrajectoryPoint[] = [];
    const baseYear = TIME_PARAMS.baseYear;
    const baseline = calculateBaselineTrajectory(utility, years);

    const firmLF = dataCenter.firmLoadFactor || 0.80;
    const firmPeakCoincidence = dataCenter.firmPeakCoincidence || 1.0;

    for (let year = 0; year <= years; year++) {
        let dcImpact = 0;
        let currentAllocation = utility.baseResidentialAllocation;
        let yearMetrics = null;

        if (year >= 2) {
            const phaseIn = year === 2 ? 0.5 : 1.0;
            const yearsOnline = year - 2;

            const allocationResult = calculateResidentialAllocation(
                utility,
                dataCenter.capacityMW,
                firmLF,
                firmPeakCoincidence,
                yearsOnline
            );
            currentAllocation = allocationResult.allocation;

            const yearImpact = calculateNetResidentialImpact(
                dataCenter.capacityMW,
                firmLF,
                firmPeakCoincidence,
                utility.residentialCustomers,
                currentAllocation,
                false,
                0,
                utility
            );

            yearMetrics = yearImpact.metrics;
            dcImpact = yearImpact.perCustomerMonthly * phaseIn;

            if (dcImpact > 0) {
                dcImpact *= Math.pow(1 + TIME_PARAMS.generalInflation, yearsOnline);
            } else {
                dcImpact *= Math.pow(1 + TIME_PARAMS.generalInflation * 0.8, yearsOnline);
            }
        }

        const monthlyBill = baseline[year].monthlyBill + dcImpact;

        trajectory.push({
            year: baseYear + year,
            yearIndex: year,
            monthlyBill,
            annualBill: monthlyBill * 12,
            scenario: 'unoptimized',
            dcOnline: year >= 2,
            components: {
                baseline: baseline[year].monthlyBill,
                dcImpact,
            },
            parameters: {
                loadFactor: firmLF,
                peakCoincidence: firmPeakCoincidence,
                residentialAllocation: year >= 2 ? currentAllocation : utility.baseResidentialAllocation,
            },
            metrics: yearMetrics,
        });
    }

    return trajectory;
};

export const calculateFlexibleTrajectory = (
    utility: Utility = DEFAULT_UTILITY,
    dataCenter: DataCenter = DEFAULT_DATA_CENTER,
    years: number = TIME_PARAMS.projectionYears
): TrajectoryPoint[] => {
    const trajectory: TrajectoryPoint[] = [];
    const baseYear = TIME_PARAMS.baseYear;
    const baseline = calculateBaselineTrajectory(utility, years);

    const flexLF = dataCenter.flexLoadFactor || 0.95;
    const flexPeakCoincidence = dataCenter.flexPeakCoincidence || 0.80;

    for (let year = 0; year <= years; year++) {
        let dcImpact = 0;
        let currentAllocation = utility.baseResidentialAllocation;
        let yearMetrics = null;

        if (year >= 2) {
            const phaseIn = year === 2 ? 0.5 : 1.0;
            const yearsOnline = year - 2;

            const allocationResult = calculateResidentialAllocation(
                utility,
                dataCenter.capacityMW,
                flexLF,
                flexPeakCoincidence,
                yearsOnline
            );
            currentAllocation = allocationResult.allocation;

            const yearImpact = calculateNetResidentialImpact(
                dataCenter.capacityMW,
                flexLF,
                flexPeakCoincidence,
                utility.residentialCustomers,
                currentAllocation,
                true,
                0,
                utility
            );

            yearMetrics = yearImpact.metrics;
            dcImpact = yearImpact.perCustomerMonthly * phaseIn;

            if (dcImpact > 0) {
                dcImpact *= Math.pow(1 + TIME_PARAMS.generalInflation, yearsOnline);
            } else {
                dcImpact *= Math.pow(1 + TIME_PARAMS.generalInflation * 0.9, yearsOnline);
            }
        }

        const monthlyBill = baseline[year].monthlyBill + dcImpact;

        trajectory.push({
            year: baseYear + year,
            yearIndex: year,
            monthlyBill,
            annualBill: monthlyBill * 12,
            scenario: 'flexible',
            dcOnline: year >= 2,
            components: {
                baseline: baseline[year].monthlyBill,
                dcImpact,
            },
            parameters: {
                loadFactor: flexLF,
                peakCoincidence: flexPeakCoincidence,
                residentialAllocation: year >= 2 ? currentAllocation : utility.baseResidentialAllocation,
                curtailablePercent: 1 - flexPeakCoincidence,
            },
            metrics: yearMetrics,
        });
    }

    return trajectory;
};

export const calculateDispatchableTrajectory = (
    utility: Utility = DEFAULT_UTILITY,
    dataCenter: DataCenter = DEFAULT_DATA_CENTER,
    years: number = TIME_PARAMS.projectionYears
): TrajectoryPoint[] => {
    const trajectory: TrajectoryPoint[] = [];
    const baseYear = TIME_PARAMS.baseYear;
    const baseline = calculateBaselineTrajectory(utility, years);

    const flexLF = dataCenter.flexLoadFactor || 0.95;
    const flexPeakCoincidence = dataCenter.flexPeakCoincidence || 0.80;
    const onsiteGenMW = dataCenter.onsiteGenerationMW || dataCenter.capacityMW * 0.2;

    for (let year = 0; year <= years; year++) {
        let dcImpact = 0;
        let currentAllocation = utility.baseResidentialAllocation;
        let yearMetrics = null;

        if (year >= 2) {
            const phaseIn = year === 2 ? 0.5 : 1.0;
            const yearsOnline = year - 2;

            const effectivePeakCoincidence = Math.max(0, flexPeakCoincidence - (onsiteGenMW / dataCenter.capacityMW));
            const allocationResult = calculateResidentialAllocation(
                utility,
                dataCenter.capacityMW,
                flexLF,
                effectivePeakCoincidence,
                yearsOnline
            );
            currentAllocation = allocationResult.allocation;

            const yearImpact = calculateNetResidentialImpact(
                dataCenter.capacityMW,
                flexLF,
                flexPeakCoincidence,
                utility.residentialCustomers,
                currentAllocation,
                true,
                onsiteGenMW,
                utility
            );

            yearMetrics = {
                ...yearImpact.metrics,
                onsiteGenMW,
                netPeakDraw: yearImpact.metrics.effectivePeakMW,
            };

            dcImpact = yearImpact.perCustomerMonthly * phaseIn;

            if (dcImpact > 0) {
                dcImpact *= Math.pow(1 + TIME_PARAMS.generalInflation, yearsOnline);
            } else {
                dcImpact *= Math.pow(1 + TIME_PARAMS.generalInflation * 0.95, yearsOnline);
            }
        }

        const monthlyBill = baseline[year].monthlyBill + dcImpact;

        trajectory.push({
            year: baseYear + year,
            yearIndex: year,
            monthlyBill,
            annualBill: monthlyBill * 12,
            scenario: 'dispatchable',
            dcOnline: year >= 2,
            components: {
                baseline: baseline[year].monthlyBill,
                dcImpact,
            },
            parameters: {
                loadFactor: flexLF,
                peakCoincidence: flexPeakCoincidence,
                onsiteGenerationMW: onsiteGenMW,
                residentialAllocation: year >= 2 ? currentAllocation : utility.baseResidentialAllocation,
            },
            metrics: yearMetrics,
        });
    }

    return trajectory;
};

// ============================================
// COMBINED FUNCTIONS
// ============================================

export const generateAllTrajectories = (
    utility: Utility = DEFAULT_UTILITY,
    dataCenter: DataCenter = DEFAULT_DATA_CENTER,
    years: number = TIME_PARAMS.projectionYears
) => {
    return {
        baseline: calculateBaselineTrajectory(utility, years),
        unoptimized: calculateUnoptimizedTrajectory(utility, dataCenter, years),
        flexible: calculateFlexibleTrajectory(utility, dataCenter, years),
        dispatchable: calculateDispatchableTrajectory(utility, dataCenter, years),
    };
};

export const formatTrajectoriesForChart = (trajectories: ReturnType<typeof generateAllTrajectories>) => {
    const years = trajectories.baseline.length;
    const chartData = [];

    for (let i = 0; i < years; i++) {
        chartData.push({
            year: trajectories.baseline[i].year,
            baseline: trajectories.baseline[i].monthlyBill,
            unoptimized: trajectories.unoptimized[i].monthlyBill,
            flexible: trajectories.flexible[i].monthlyBill,
            dispatchable: trajectories.dispatchable[i].monthlyBill,
        });
    }

    return chartData;
};

export const calculateSummaryStats = (
    trajectories: ReturnType<typeof generateAllTrajectories>,
    utility: Utility = DEFAULT_UTILITY
): SummaryStats => {
    const finalYear = trajectories.baseline.length - 1;

    const baselineFinal = trajectories.baseline[finalYear].monthlyBill;
    const unoptimizedFinal = trajectories.unoptimized[finalYear].monthlyBill;
    const flexibleFinal = trajectories.flexible[finalYear].monthlyBill;
    const dispatchableFinal = trajectories.dispatchable[finalYear].monthlyBill;

    const cumulativeCosts = {
        baseline: trajectories.baseline.reduce((sum, y) => sum + y.annualBill, 0),
        unoptimized: trajectories.unoptimized.reduce((sum, y) => sum + y.annualBill, 0),
        flexible: trajectories.flexible.reduce((sum, y) => sum + y.annualBill, 0),
        dispatchable: trajectories.dispatchable.reduce((sum, y) => sum + y.annualBill, 0),
    };

    const finalYearDifference = {
        unoptimized: unoptimizedFinal - baselineFinal,
        flexible: flexibleFinal - baselineFinal,
        dispatchable: dispatchableFinal - baselineFinal,
    };

    return {
        currentMonthlyBill: utility.averageMonthlyBill,

        finalYearBills: {
            baseline: baselineFinal,
            unoptimized: unoptimizedFinal,
            flexible: flexibleFinal,
            dispatchable: dispatchableFinal,
        },

        finalYearDifference,

        benefitsRatepayers: {
            unoptimized: finalYearDifference.unoptimized < 0,
            flexible: finalYearDifference.flexible < 0,
            dispatchable: finalYearDifference.dispatchable < 0,
        },

        savingsVsBaseline: {
            unoptimized: -finalYearDifference.unoptimized,
            flexible: -finalYearDifference.flexible,
            dispatchable: -finalYearDifference.dispatchable,
        },

        savingsVsUnoptimized: {
            flexible: unoptimizedFinal - flexibleFinal,
            dispatchable: unoptimizedFinal - dispatchableFinal,
        },

        cumulativeHouseholdCosts: cumulativeCosts,

        cumulativeCommunitySavings: {
            unoptimized: (cumulativeCosts.baseline - cumulativeCosts.unoptimized) * utility.residentialCustomers,
            flexible: (cumulativeCosts.baseline - cumulativeCosts.flexible) * utility.residentialCustomers,
            dispatchable: (cumulativeCosts.baseline - cumulativeCosts.dispatchable) * utility.residentialCustomers,
        },

        percentChange: {
            baseline: (baselineFinal - utility.averageMonthlyBill) / utility.averageMonthlyBill,
            unoptimized: (unoptimizedFinal - utility.averageMonthlyBill) / utility.averageMonthlyBill,
            flexible: (flexibleFinal - utility.averageMonthlyBill) / utility.averageMonthlyBill,
            dispatchable: (dispatchableFinal - utility.averageMonthlyBill) / utility.averageMonthlyBill,
        },
    };
};
