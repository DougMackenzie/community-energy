/**
 * Market-level data center growth forecasts
 *
 * Based on:
 * - SemiAnalysis large load queue data (2025)
 * - Utility IRPs and load forecasts
 * - PJM/ERCOT/MISO resource adequacy reports
 *
 * Two scenarios provided:
 * - Conservative: Based on utility IRPs and documented forecasts
 * - Aggressive (default): Based on queue data with utility-specific assumptions
 */

import { MarketType } from './utilityData';

export interface MarketForecast {
    marketId: MarketType;
    marketName: string;
    currentCapacityGW: number;
    // Dual projections
    conservativeGrowthGW: number;
    aggressiveGrowthGW: number;
    // Growth timeline
    growthStartYear: number;  // 2027 (12-month lag from 2026)
    growthEndYear: number;    // 2035
    // Market characteristics for share calculation
    totalMarketPeakMW: number;
    sources: string[];
    notes: string;
}

export type ForecastScenario = 'conservative' | 'aggressive';

/**
 * Market forecasts based on SemiAnalysis large load queue data + realistic completion rates
 * Default: Aggressive scenario (higher but achievable based on queue depth)
 */
export const MARKET_FORECASTS: Record<MarketType, MarketForecast> = {
    pjm: {
        marketId: 'pjm',
        marketName: 'PJM Interconnection',
        currentCapacityGW: 8.5,
        conservativeGrowthGW: 16.5,     // Based on utility IRPs
        aggressiveGrowthGW: 30,         // ~60 GW queue, 50% completion
        growthStartYear: 2027,
        growthEndYear: 2035,
        totalMarketPeakMW: 150000,
        sources: [
            'PJM Load Forecast 2024',
            'Dominion IRP 2024 (9 GW forecast)',
            'SemiAnalysis queue data 2025'
        ],
        notes: 'Dominated by NoVA. Dominion alone forecasts 9 GW. PJM capacity prices at $270/MW-day.'
    },
    ercot: {
        marketId: 'ercot',
        marketName: 'ERCOT (Texas)',
        currentCapacityGW: 2.1,
        conservativeGrowthGW: 15,       // 46% of load growth estimate
        aggressiveGrowthGW: 25,         // 200+ GW queue, ~12% completion realistic
        growthStartYear: 2027,
        growthEndYear: 2035,
        totalMarketPeakMW: 85000,
        sources: [
            'ERCOT Load Forecast',
            'SemiAnalysis (200+ GW queue)',
            'Grid Strategies 2025'
        ],
        notes: 'Massive queue but land/power constraints. 15-25 GW realistic. 46% of load growth from DCs.'
    },
    spp: {
        marketId: 'spp',
        marketName: 'Southwest Power Pool',
        currentCapacityGW: 0.8,
        conservativeGrowthGW: 3,
        aggressiveGrowthGW: 8,          // PSO alone 6 GW + other SPP utilities
        growthStartYear: 2027,
        growthEndYear: 2035,
        totalMarketPeakMW: 55000,
        sources: [
            'SPP resource adequacy',
            'PSO large load queue (6+ GW)',
            'SemiAnalysis Oklahoma data'
        ],
        notes: 'Oklahoma emerging as major hub. PSO facing 31% power deficit by 2031.'
    },
    miso: {
        marketId: 'miso',
        marketName: 'MISO',
        currentCapacityGW: 1.2,
        conservativeGrowthGW: 5,
        aggressiveGrowthGW: 10,
        growthStartYear: 2027,
        growthEndYear: 2035,
        totalMarketPeakMW: 127000,
        sources: [
            'MISO resource adequacy reports',
            'Entergy IRP'
        ],
        notes: 'Moderate growth. Midwest emerging as secondary market.'
    },
    nyiso: {
        marketId: 'nyiso',
        marketName: 'NYISO',
        currentCapacityGW: 1.0,
        conservativeGrowthGW: 2,
        aggressiveGrowthGW: 4,
        growthStartYear: 2027,
        growthEndYear: 2035,
        totalMarketPeakMW: 32000,
        sources: [
            'NYISO load forecast',
            'ConEd capacity planning'
        ],
        notes: 'Upstate NY growth; NYC constrained by grid capacity.'
    },
    regulated: {
        marketId: 'regulated',
        marketName: 'Other Regulated Markets',
        currentCapacityGW: 4.0,
        conservativeGrowthGW: 8,
        aggressiveGrowthGW: 15,
        growthStartYear: 2027,
        growthEndYear: 2035,
        totalMarketPeakMW: 200000,
        sources: [
            'Regional utility IRPs',
            'APS Arizona 40% growth forecast',
            'NV Energy Reno projects'
        ],
        notes: 'AZ, NV, GA growing significantly. Includes Georgia Power 8.2 GW load growth.'
    },
    tva: {
        marketId: 'tva',
        marketName: 'Tennessee Valley Authority',
        currentCapacityGW: 0.5,
        conservativeGrowthGW: 1.5,
        aggressiveGrowthGW: 3,
        growthStartYear: 2027,
        growthEndYear: 2035,
        totalMarketPeakMW: 30000,
        sources: [
            'TVA IRP',
            'Tennessee economic development'
        ],
        notes: 'TVA region emerging. Low power costs attracting interest.'
    },
    caiso: {
        marketId: 'caiso',
        marketName: 'California ISO',
        currentCapacityGW: 1.5,
        conservativeGrowthGW: 2.5,
        aggressiveGrowthGW: 5,
        growthStartYear: 2027,
        growthEndYear: 2035,
        totalMarketPeakMW: 52000,
        sources: [
            'CAISO resource adequacy',
            'California energy planning'
        ],
        notes: 'Limited by power costs, land availability, and renewable mandates.'
    }
};

/**
 * Calculate a utility's share of market-level DC growth
 *
 * @param utilitySystemPeakMW - Utility's system peak demand
 * @param marketForecast - Market forecast data
 * @param scenario - 'conservative' or 'aggressive' (default: aggressive)
 * @returns Share percentage, utility growth in MW, and annual growth rate
 */
export function calculateUtilityMarketShare(
    utilitySystemPeakMW: number,
    marketForecast: MarketForecast,
    scenario: ForecastScenario = 'aggressive'
): {
    sharePercent: number;
    utilityNetGrowthMW: number;
    annualGrowthMW: number;
} {
    const sharePercent = utilitySystemPeakMW / marketForecast.totalMarketPeakMW;
    const marketGrowthGW = scenario === 'aggressive'
        ? marketForecast.aggressiveGrowthGW
        : marketForecast.conservativeGrowthGW;
    const utilityNetGrowthMW = marketGrowthGW * 1000 * sharePercent;
    const growthYears = marketForecast.growthEndYear - marketForecast.growthStartYear + 1;
    const annualGrowthMW = utilityNetGrowthMW / growthYears;

    return {
        sharePercent,
        utilityNetGrowthMW,
        annualGrowthMW
    };
}

/**
 * Get the market forecast for a given market type
 */
export function getMarketForecast(marketType: MarketType): MarketForecast | undefined {
    return MARKET_FORECASTS[marketType];
}

/**
 * Get total national DC growth projection
 */
export function getNationalGrowthProjection(scenario: ForecastScenario = 'aggressive'): {
    totalGrowthGW: number;
    annualGrowthGW: number;
} {
    const totalGrowthGW = Object.values(MARKET_FORECASTS).reduce((sum, market) => {
        return sum + (scenario === 'aggressive'
            ? market.aggressiveGrowthGW
            : market.conservativeGrowthGW);
    }, 0);

    // 9 years of growth (2027-2035)
    const annualGrowthGW = totalGrowthGW / 9;

    return { totalGrowthGW, annualGrowthGW };
}
