/**
 * Scrollytelling Story Data
 * Defines the narrative sequence from microchip to national grid
 */

export interface MapLocation {
    lng: number;
    lat: number;
    zoom: number;
    pitch: number;
    bearing: number;
}

export interface StoryStep {
    id: string;
    mode: 'micro' | 'map';
    visualState?: string;
    location?: MapLocation;
    title: string;
    text: string;
    layerColor?: string;
}

export const steps: StoryStep[] = [
    // --- PHASE 1: THE MICRO VIEW (SVG/Canvas) ---
    {
        id: 'chip',
        mode: 'micro',
        visualState: 'chip-glow',
        title: "The Spark",
        text: "It begins here. A single NVIDIA H100 GPU. It demands 700 watts of constant power—more than an average home uses in an hour, condensed into a silicon wafer.",
    },
    {
        id: 'rack',
        mode: 'micro',
        visualState: 'rack-zoom',
        title: "The Density",
        text: "Multiply that by thousands. A single server rack consumes 100kW. It generates immense heat, requiring massive cooling systems that also demand power. This is not a factory; it's a furnace.",
    },
    {
        id: 'facility',
        mode: 'micro',
        visualState: 'building-iso',
        title: "The Fortress",
        text: "Zoom out to the facility. Backup diesel generators line the perimeter. This single building consumes as much electricity as 50,000 homes. It requires 100% uptime, 24/7.",
    },

    // --- PHASE 2: THE MACRO VIEW (Mapbox Flyover) ---
    {
        id: 'substation',
        mode: 'map',
        location: { lng: -77.46, lat: 39.03, zoom: 16, pitch: 60, bearing: -45 }, // Ashburn Substation
        title: "The Connection",
        text: "To feed this fortress, we must build massive substations. These are the physical gateways to the grid. Who pays for this infrastructure? That is the billion-dollar question.",
        layerColor: '#EF4444', // Red (Warning)
    },
    {
        id: 'nova',
        mode: 'map',
        location: { lng: -77.48, lat: 39.04, zoom: 11, pitch: 45, bearing: 0 }, // Loudoun County
        title: "The Epicenter: Northern Virginia",
        text: "Data Center Alley. 70% of the world's internet traffic flows through here (PJM). The grid is nearing a breaking point. Prices are spiking 13%+ because we are treating these like 'Firm Loads' requiring expensive new power plants.",
        layerColor: '#EF4444', // Red (High Risk)
    },
    {
        id: 'ohio',
        mode: 'map',
        location: { lng: -82.99, lat: 40.10, zoom: 9, pitch: 30, bearing: 20 }, // Columbus
        title: "The Frontier: Ohio",
        text: "The demand is spreading. Columbus, Ohio (AEP) is seeing exponential growth. Without flexibility, homeowners here will subsidize the infrastructure upgrades needed for Big Tech.",
        layerColor: '#F59E0B', // Amber (Emerging Risk)
    },
    {
        id: 'oklahoma',
        mode: 'map',
        location: { lng: -95.99, lat: 36.15, zoom: 8, pitch: 40, bearing: 0 }, // Tulsa/PSO
        title: "The Protection: Oklahoma",
        text: "In regulated markets like PSO, policy is our shield. We must structure tariffs to 'ring-fence' these costs. If a data center wants massive power, they must pay for the specific transmission upgrades they trigger.",
        layerColor: '#3B82F6', // Blue (Regulated/Protected)
    },
    {
        id: 'texas',
        mode: 'map',
        location: { lng: -96.79, lat: 32.77, zoom: 7, pitch: 20, bearing: 0 }, // Dallas
        title: "The Solution: Texas",
        text: "The blueprint for the future. In ERCOT, '4CP' tariffs incentivize data centers to shut down during peak grid stress. They act as a 'Virtual Power Plant,' stabilizing the grid and keeping rates lower (+4% vs +13%).",
        layerColor: '#10B981', // Green (Optimized)
    },
    {
        id: 'usa',
        mode: 'map',
        location: { lng: -98.57, lat: 39.82, zoom: 3.5, pitch: 0, bearing: 0 }, // USA View
        title: "The National Network",
        text: "By 2030, this infrastructure will span the continent. We have two choices: Build a rigid grid that bankrupts homeowners, or build a flexible grid that lowers rates for everyone.",
        visualState: 'network-lines',
        layerColor: '#6366F1', // Indigo (Vision)
    },
];

// Color mapping for risk levels
export const riskColors = {
    danger: '#EF4444',    // Red
    warning: '#F59E0B',   // Amber
    protected: '#3B82F6', // Blue
    optimized: '#10B981', // Green
    vision: '#6366F1',    // Indigo
};
