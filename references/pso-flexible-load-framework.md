# PSO Flexible Load Framework Analysis

## Community Energy Calculator - Technical Reference

**Date:** January 2026  
**Utility:** Public Service Company of Oklahoma (PSO)  
**Tariff Reference:** PSO Tariff Package Complete Jan 2026  

---

## Executive Summary

Flexible data center operations can increase grid infrastructure utilization by 33-67% without increasing peak demand. This creates a dual benefit:

1. **Utilities** earn more revenue on existing rate base
2. **Ratepayers** benefit from fixed costs spread over more kWh sales

The key insight: **Same grid peak, more installed capacity, higher energy throughput.**

---

## PSO Large Power & Light (LPL) Tariff Structure

### Base Rates (Service Level 1 - Transmission, 69kV+)

| Component | Rate | Unit |
|-----------|------|------|
| Base Service Charge | $280.00 | /month |
| Energy Charge | $0.001708 | /kWh ($1.71/MWh) |
| Peak Demand Charge | $7.05 | /kW |
| Maximum Demand Charge | $2.47 | /kW |

### Applicable Riders (SL 1)

| Rider | Rate | Unit | Notes |
|-------|------|------|-------|
| FCA (Fuel Cost Adjustment) | $0.019438 | /kWh | Passthrough - no ratepayer impact |
| SPPTC (SPP Transmission) | $0.18 | /kW | Demand-based |
| TCR (Tax Change) | 2.614% | of base charges | |
| WSC (Winter Storm) | $453.81 | /block/month | Based on event kWh |
| RRR (Renewable Resources) | $1.95 | /kW | |
| DRR (Dispatchable Resource) | $1.73 | /kW | |
| RA (Regulatory Assessment) | $0.29 | /account/month | Negligible |
| GEAR | $0.00 | | Does not apply to SL 1 |
| DSM | $0.006507 | /kWh | High-volume opt-out available |

### Blended All-In Rate Estimate

**~$43-45/MWh** at published tariff rates for 600MW transmission service.

---

## PSO Demand Ratchet Mechanics

### On-Peak Period Definition
- Hours: 2:00 PM - 9:00 PM local time
- Days: Monday - Friday
- Months: June 1 - September 30
- Excludes: Juneteenth, Independence Day, Labor Day
- **~600 hours/year**

### Ratchet Rules (Sheet 20-3)

**Summer (June 1 - Sept 30):**
```
Peak Demand = MAX(current month on-peak demand, 90% × highest on-peak in prior 11 months)
```

**Shoulder/Winter (Oct 1 - May 31):**
```
Peak Demand = 90% × highest on-peak demand in prior 11 months
```

### Ratchet Implications

- Once a DC hits peak in summer, they pay **at least 90%** of that for 11 months
- Shoulder season flexibility value is **capped at 10%** of peak reduction
- Strategic approach: Minimize summer peak, then run at 90%+ year-round

---

## Three-Scenario Framework

### Core Concept

Flexibility doesn't just reduce one DC's costs—it increases the **carrying capacity** of grid infrastructure.

**Constraint:** Fixed grid capacity (generation + transmission + interconnection)  
**Variable:** How much data center capacity can operate within that constraint

### Scenario Definitions

| Parameter | Firm Load DC | Flexible DC | Optimized DC |
|-----------|-------------|-------------|--------------|
| **Capacity multiplier** | 1.0x | 1.33x | 1.67x |
| **Summer peak grid draw (% of installed)** | 100% | 75% | 50% |
| **Onsite dispatchable generation** | None | None | Yes (peak shaving) |
| **Off-peak load factor** | 80% | 95% | 95% |
| **Energy vs. firm baseline** | 1.0x | 1.56x | 1.93x |
| **Demand charge ratio vs. firm** | 1.0x | 0.75x | 0.625x |

### Example: 600 MW Grid Interconnection

| Scenario | Installed Capacity | Peak Grid Draw | Onsite Gen | Compute at Peak |
|----------|-------------------|----------------|------------|-----------------|
| Firm | 600 MW | 600 MW | 0 | 600 MW |
| Flexible | 800 MW | 600 MW | 0 | 600 MW (curtailed) |
| Optimized | 1,000 MW | 500 MW | 200 MW | 700 MW |

---

## Energy & Revenue Analysis

### Annual Energy Production (600 MW Grid Constraint)

| Metric | Firm 600 MW | Flexible 800 MW | Optimized 1,000 MW |
|--------|-------------|-----------------|-------------------|
| On-peak hours (600 hrs) | 600 MW | 600 MW | 500 MW grid + 200 MW onsite |
| Off-peak hours (8,160 hrs) | 480 MW avg | 760 MW avg | 950 MW avg |
| **Annual Energy** | **4,205 GWh** | **6,562 GWh** | **8,100 GWh** |
| **vs. Firm Baseline** | 1.0x | 1.56x | 1.93x |

### Revenue to PSO

| Component | Firm 600 MW | Flexible 800 MW | Delta |
|-----------|-------------|-----------------|-------|
| Peak Demand Charges | $50.8M | $50.8M | $0 |
| Max Demand Charges | $17.8M | $22.5M | +$4.7M |
| Base Energy | $7.2M | $11.2M | +$4.0M |
| FCA (fuel passthrough) | $81.7M | $127.6M | +$45.9M |
| Non-fuel Riders | $42.1M | $65.6M | +$23.5M |
| **Total Annual** | **$199.6M** | **$277.7M** | **+$78.1M** |

### Revenue Breakdown by Beneficiary

| Category | Amount | Beneficiary |
|----------|--------|-------------|
| FCA (fuel passthrough) | +$45.9M | Generators (no ratepayer impact) |
| Non-fuel riders | +$23.5M | Utility fixed cost recovery |
| Base energy + demand | +$8.7M | Utility margin |
| **Net Utility/Ratepayer Benefit** | **+$32.2M** | Flows to ratepayers at rate case |

---

## Ratepayer Benefit Calculations

### Benefit Source 1: Fixed Cost Spread

PSO's non-fuel revenue requirement is fixed between rate cases. More kWh sold = lower $/kWh.

| Metric | Without Flex DC | With Flex DC |
|--------|-----------------|--------------|
| PSO Retail Sales | 15,000 GWh | 17,357 GWh |
| Fixed Cost Pool | ~$500M | ~$500M |
| Residential Share (~53%) | $265M | $265M |
| Residential $/MWh | $44.17 | $38.14 |
| **Savings per household** (12 MWh/yr) | — | **$72/year** |

### Benefit Source 2: Avoided Infrastructure

Without flexibility, serving 800 MW of DC requires:
- ~200 MW new peaking capacity: $200M capex → ~$25M/year revenue requirement
- Transmission upgrades: $50-100M capex → ~$8M/year revenue requirement
- **Total avoided: ~$33M/year**

Allocated to ~460,000 residential customers: **~$72/household/year**

### Combined Ratepayer Benefit

| Benefit Source | Annual $/Household |
|---------------|-------------------|
| Fixed cost spread | $72 |
| Avoided infrastructure | $59 |
| **Total** | **$131/year (~$10.90/month)** |

> **Note on customer counts:** PSO serves approximately 575,000 total retail customers, of which ~460,000 are residential (~80%). The calculations above use 560,000 as a rounded estimate that may include some small commercial accounts typically grouped with residential for rate analysis purposes.

---

## Two Framings for Different Audiences

### For Utilities (Revenue Story)

> "Flexible data centers let you serve 33% more load on existing infrastructure. That's $78M/year in additional revenue with zero incremental peak capacity. Your shareholders earn return on existing rate base while serving more customers."

### For Regulators/Community (Cost Story)

> "Flexible data centers avoid $33M/year in infrastructure costs that would otherwise be socialized to ratepayers. By curtailing during peak hours, they use the grid more efficiently and reduce bills by ~$11/month for the average household."

### For Data Centers (Economics Story)

> "Flexibility lets you build 33% more capacity on the same interconnection. Your effective $/MW of installed capacity drops significantly, and you qualify for economic development incentives."

---

## What Optimized DC Unlocks (Onsite Dispatchable)

Adding onsite generation (gas turbines, fuel cells, batteries) enables:

1. **Higher capacity multiplier** — More MW of DC on same grid interconnection
2. **Lower grid peak** — Onsite gen absorbs peak, further reducing demand charges
3. **Grid services revenue** — Export during stress events, frequency response, capacity payments
4. **Insurance against curtailment** — Critical workloads stay running during peaks

### Cost-Benefit Question

What's the $/kW cost of onsite generation vs. the incremental capacity it unlocks?

| Onsite Option | Capex $/kW | Use Case |
|---------------|-----------|----------|
| Gas turbines (peaker) | $400-600 | 200-400 hrs/year peak shaving |
| Fuel cells | $3,000-5,000 | Baseload + peak, clean |
| Battery (4-hr) | $300-400/kWh | Short duration peaks |

---

## Model Parameters for Community Energy Calculator

### Recommended Defaults

```javascript
const scenarios = {
  firm: {
    capacityMultiplier: 1.0,
    summerPeakPct: 1.0,      // 100% of installed capacity
    offPeakLF: 0.80,
    onsiteGen: 0,
    energyMultiplier: 1.0,
    demandChargeRatio: 1.0,
  },
  flexible: {
    capacityMultiplier: 1.33,
    summerPeakPct: 0.75,     // 75% of installed (25% curtailment)
    offPeakLF: 0.95,
    onsiteGen: 0,
    energyMultiplier: 1.56,
    demandChargeRatio: 0.75,
  },
  optimized: {
    capacityMultiplier: 1.67,
    summerPeakPct: 0.50,     // 50% of installed from grid
    offPeakLF: 0.95,
    onsiteGen: 0.20,         // 20% of installed capacity
    energyMultiplier: 1.93,
    demandChargeRatio: 0.625,
  }
};
```

### Key Formulas

**Annual Energy (GWh):**
```
onPeakEnergy = gridPeakMW × onPeakHours (600)
offPeakEnergy = installedCapacity × offPeakLF × offPeakHours (8,160)
totalEnergy = onPeakEnergy + offPeakEnergy
```

**Demand Charges (annual):**
```
peakDemandCharge = gridPeakMW × $7.05 × 12
maxDemandCharge = gridPeakMW × $2.47 × 12
```

**Ratepayer Benefit ($/household/year):**
```
fixedCostSpread = (additionalEnergy × nonFuelRate) / residentialCustomers
avoidedInfra = (avoidedCapacityMW × $100-150/kW) / residentialCustomers
totalBenefit = fixedCostSpread + avoidedInfra
```

---

## Cost Categories by Ratepayer Impact

### High Impact (Socialized via Rate Base)
- New generation capacity
- Transmission upgrades
- Substation capacity (SL2/SL3)

### No Direct Ratepayer Impact (Passthrough)
- FCA (fuel) — dollar-for-dollar
- SPP IM charges

### Moderate Impact (Rate Case Reallocation)
- Base energy charges
- Non-fuel riders (RRR, DRR, WSC, etc.)
- Class allocation factor shifts

---

## Special Rate Schedules to Consider

### Economic Development Rate (EDR)
- 30-35% demand charge credit for 36 months
- Requires 1,000+ kW demand, 15+ FTE jobs (100+ for higher tier)
- Must demonstrate load would locate elsewhere without incentive

### Customized Contract Rate (CCR)
- Negotiated rates for loads 250+ kW
- Requires non-regulated economic alternative
- Up to 10-year terms

### Voluntary Curtailment Service (VCS)
- 1,000+ kW curtailable load
- Compensation for curtailment during events
- Compatible with flexible DC operations

---

## References

- PSO Tariff Package Complete January 2026
- EPRI DCFlex Initiative (25% curtailment validation)
- PSO IRP 2024 (capacity constraints)
- OCC Case No. PUD 2023-000086 (rate case)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 2026 | Initial analysis |

---

*This document supports the Community Energy Calculator open source project.*  
*Repository: github.com/dougmackenzie/community-energy*
