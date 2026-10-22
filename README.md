# 🌊 ResQMesh — Disaster Coordination & SignalMesh Survivability Platform

> **Surakshit Bharat → Track A: Product & Technology**  
> An emergency response coordination platform that keeps people informed, connects needs with available resources, and helps responders prioritize action even when normal communication becomes unreliable.

---

## 🌟 The Core Vision

During floods, cyclones, and earthquakes, the platform resolves four critical questions:
1. **Who needs help?** (Multi-channel & offline-first citizen SOS with priority triage)
2. **What do they need?** (Potable water, trauma medicine, rescue boats, food rations)
3. **Who can provide it?** (Warehouses, NGOs, volunteer fleets, specialized equipment)
4. **Can we still communicate with them?** (**SignalMesh Engine** models multi-protocol survivability)

```
                 ResQMesh
                    │
       ┌────────────┼─────────────┐
       │            │             │
       ▼            ▼             ▼
 COMMUNICATION    PEOPLE       RESOURCES
    NETWORK       NETWORK        NETWORK
  (SignalMesh)  (Volunteers)  (Warehouses)
       │            │             │
       └────────────┼─────────────┘
                    ▼
              TRANSPORTATION
                 NETWORK
           (Safe Relief Routing)
                    │
                    ▼
            RESPONSE DECISIONS
```

---

## 🚀 Key Modules & Highlights

### 1. 📡 SignalMesh — Emergency Message Survivability Engine
- **Graph Reachability Algorithm**: Breadth-First Search (BFS) & Multi-protocol Dijkstra path discovery.
- **Failover Hierarchy**: Fiber Internet ➔ Cellular SMS ➔ HF/VHF Community Radio ➔ Volunteer Physical Mesh Relay.
- **Dynamic Decision Support**: Calculates live **Emergency Message Coverage %** and recommends actionable path restoration (e.g. *"Deploy tactical volunteer communication relay from Patamata to Kanuru"*).

### 2. 📴 Offline-First Citizen SOS (Progressive Web App)
- Operates seamlessly with or without internet.
- Submissions are cached safely in browser **LocalStorage & IndexedDB**.
- **Live Hackathon Demo Switch**: Toggle "Simulated Offline Mode" right in the UI, submit an SOS, re-enable the network, and watch it automatically flush and triage into the Emergency Command Center.

### 3. 📦 ResourceMatch — Logistics & Supply Optimizer
- Matches relief camp shortages (e.g., Camp Krishna: 86% full, critical water/medicine shortage) directly with warehouse inventories.
- Automatically pairs shipments with available volunteer vehicle capacities (Motorcycle, 4x4 Tractor, Inflatable Boat, Heavy Truck).

### 4. 🛣️ Safe Relief Routing
- Dispatches emergency supplies along viable corridors, not just the shortest path.
- Avoids submerged highways and structurally compromised culverts:
  - *Route A (2.9 km)*: ❌ Flooded / Submerged under 110cm water
  - *Route B (5.9 km)*: ⚠️ Partially affected by drainage backflow
  - *Route C (8.5 km)*: ✅ Recommended high-elevation ridge route

### 5. 🗺️ Live Disaster Command Map
- High-contrast interactive Leaflet map centered on the Vijayawada / Krishna Basin flood zone.
- Visual markers for critical SOS, cell towers, radio repeaters, relief shelters, supply depots, and submerged road polylines.

### 6. ⚖️ Algorithmic Priority Engine (0–100)
- Transparent emergency triage formula:
  $$\text{Score} = \text{Hazard Level} + \text{Headcount Multiplier} + \text{Medical Urgency} + \text{Isolation Factor}$$
- Full explainability breakdown visible to commanders.

### 7. 🛡️ Pre-Disaster Resilience Radar & SPOF Detection
- Community resilience scores calculated before disaster strikes:
  - Telecom redundancy
  - Road evacuation accessibility
  - Relief depot proximity
  - Single Point of Failure (SPOF) diagnosis (e.g. *"Bridge B2 is the solitary egress causeway"*).

---

## 📁 Project Directory Structure

```
resqmesh/
├── public/
│   ├── manifest.json              # PWA Web App Manifest
│   └── sw.js                      # Service Worker for offline asset caching
├── src/
│   ├── types/
│   │   └── index.ts               # Core TypeScript data contracts
│   ├── data/
│   │   └── disasterScenario.ts    # Vijayawada Krishna basin flood dataset (12 villages, towers, roads)
│   ├── utils/
│   │   ├── signalMeshEngine.ts    # Multi-hop graph reachability & recommendation algorithm
│   │   ├── routingEngine.ts       # Safe relief routing & flood avoidance engine
│   │   ├── resourceMatchEngine.ts # Supply-demand matching & vehicle pairing optimizer
│   │   ├── priorityEngine.ts      # Transparent 0-100 emergency priority scorer
│   │   ├── resilienceEngine.ts    # Pre-disaster vulnerability & SPOF analysis
│   │   └── offlineQueue.ts        # Offline PWA LocalStorage queue & auto-sync event listener
│   ├── components/
│   │   ├── Header.tsx             # Command ticker, disaster simulator trigger, offline switch
│   │   ├── CommandMap.tsx         # Leaflet interactive map with custom SVG markers
│   │   ├── SignalMeshGraph.tsx    # Interactive SVG network topology visualizer
│   │   ├── SignalMeshPanel.tsx    # SignalMesh decision support & reachability tracer
│   │   ├── CitizenSosPortal.tsx   # Offline PWA SOS form & priority preview
│   │   ├── DamageReportPortal.tsx # AI hazard vision classifier & duplicate report clustering
│   │   ├── ResourceMatchView.tsx  # Relief camp shortages vs warehouse supply optimizer
│   │   ├── VolunteersView.tsx     # Volunteer responder pool & tactical comm relays
│   │   ├── MissingPersonsView.tsx # Privacy-safe missing persons registry & sightings
│   │   ├── ResilienceAuditsView.tsx # Pre-disaster resilience radar & vulnerability report cards
│   │   └── DisasterSimulator.tsx  # Interactive telecom and road failure toggles
│   ├── App.tsx                    # Master coordinator & centralized reactive state
│   ├── index.css                  # Tailwind CSS & emergency pulse radar animations
│   └── main.tsx                   # Entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚡ Quick Start & Running the Project

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Navigate to project folder
cd C:\Users\admin\.gemini\antigravity\scratch\resqmesh

# Install dependencies (already installed)
npm install

# Start development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🎬 Step-by-Step Hackathon Judges Demo

1. **The Baseline Standby**:
   - Open the app. The Command Map displays 12 Vijayawada communities, 3 cell towers, and 100% communication reachability.
2. **Trigger Disaster Surge**:
   - Click the red **"Simulate Disaster Surge"** button in the top navigation.
   - Watch Tower T3 fail, Kanuru Feeder Road A submerge under floodwaters, and internet to eastern villages disappear.
   - SignalMesh alerts: **Message Coverage drops to 75%** with 2 communities isolated!
3. **Examine SignalMesh Alternative Pathing**:
   - Switch to the **SignalMesh Engine** tab.
   - Inspect the path tracer: Villages receive alerts via SMS or VHF Radio.
   - Click **"Authorize Tactical Relay Dispatch"** on the recommendation card. Volunteer HAM operator Rajesh Kumar is deployed, restoring coverage to **92%**!
4. **Offline PWA SOS Submission**:
   - Switch to **Citizen SOS (PWA)**.
   - Click **"Simulate Turn Off Wi-Fi"** (or disconnect real internet).
   - Fill in an SOS (e.g. 5 trapped people, flood water entering ground floor, medical emergency).
   - Click **"Submit SOS to Offline Queue"**. Notice the request is safely cached in LocalStorage.
   - Click **"Reconnect Wi-Fi"**. The request instantly synchronizes, priority score 94/100 is assigned, and it appears on the Command Map!
5. **ResourceMatch & Safe Relief Routing**:
   - Switch to **ResourceMatch Logistics**.
   - Camp Krishna needs 250 water bottles.
   - Engine evaluates routes: Route A is flooded (❌), but Route C is high-elevation (✅).
   - Click **"Authorize & Dispatch Convoy"** to confirm allocation.
6. **Pre-Disaster Resilience Radar**:
   - Switch to **Resilience Radar** to demonstrate pre-disaster usefulness, diagnosing single points of failure (SPOFs) before disasters strike.
