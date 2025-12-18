# QPU Device Details Page Specification

This document specifies the scalar metrics and simple data to display in the Summary/Details section of the device detail page for Amazon Braket QPUs.

## Data Organization by Section

### 1. Basic Device Information

**Always Available (All Devices):**
- **Device Name** - Display name (e.g., "Ankaa-3", "Forte Enterprise 1")
- **Provider** - Provider name (e.g., "Rigetti", "IonQ", "QuEra", "IQM", "AQT")
- **Device Type** - QPU or Simulator
- **Status** - ONLINE/OFFLINE (with visual indicator)
- **Region** - Physical location (e.g., "California, USA", "Basel, Switzerland")
- **Last Updated** - Timestamp of last calibration/update

### 2. Hardware Specifications

**Gate Model QPUs:**
- **Qubit Count** - Total number of qubits
- **Topology** - "Fully Connected" or "Limited Connectivity"
- **Native Gate Set** - List of native gates (e.g., "rx, rz, iswap" or "GPI, GPI2, ZZ")

**Analog Devices (QuEra Aquila):**
- **Atom Sites** - Maximum number of atom sites (e.g., 256)
- **Lattice Area** - Width × Height in micrometers
- **C6 Coefficient** - Rydberg C6 coefficient value

### 3. Performance Metrics

**IonQ Devices (Simple Scalars):**
- **Single-Qubit Fidelity** - Mean 1Q gate fidelity (e.g., 99.98%)
- **Two-Qubit Fidelity** - Mean 2Q gate fidelity (e.g., 98.95%)
- **SPAM Fidelity** - State preparation and measurement fidelity (e.g., 99.45%)
- **T1 (Coherence)** - Relaxation time in microseconds (e.g., 188 µs)
- **T2 (Dephasing)** - Dephasing time in microseconds (e.g., 950 ns)
- **Readout Error** - Measurement error rate (calculated as 1 - fRO if available)

**Rigetti Devices (Aggregated Statistics):**
- **T1 (median)** - Median qubit relaxation time across all qubits
- **T2 (median)** - Median qubit dephasing time across all qubits
- **Readout Fidelity (median)** - Median fRO across all qubits
- **Readout Error (median)** - Calculated as 1 - fRO (median)
- **Single-Qubit Fidelity (median)** - Median fRB from 1Q benchmarks
- **Two-Qubit Fidelity (median)** - Median fISWAP or similar 2Q gate fidelity
- **2Q Error (median)** - Calculated as 1 - 2Q fidelity (median)
- **2Q Error (best)** - Best 2Q error across all edges
- **Gate-Specific Errors** - If available, median errors for specific gates (e.g., CZ, SX)

**QuEra Aquila:**
- **Atom Loss (typical)** - Typical atom loss probability
- **Filling Error (typical)** - Typical filling error
- **Position Error** - Absolute position error in meters

### 4. Operational Information

**All Devices:**
- **Queue Depth** - Current tasks in queue
  - Normal priority tasks
  - Priority tasks (if > 0)
  - Jobs (if > 0)
- **Pending Jobs** - Total jobs pending (sum of queue types)

**Execution Windows:**
- Display as human-readable schedule (e.g., "Weekdays: 12:00-03:00 UTC")
- If multiple windows, show all or summarize (e.g., "Everyday: 09:00-19:00, 21:00-23:59")

### 5. Cost and Limits

**All Devices:**
- **Cost per Shot** - Price and unit (e.g., "$0.0009/shot" or "$0.075/minute")
- **Shots Range** - Min and max shots per task (e.g., "10 - 50,000")
- **Max Shots** - Maximum shots per task (extracted from shotsRange[1])

**For Program Set Actions (if available):**
- **Max Executables** - Maximum number of programs in a program set (e.g., 100)
- **Max Total Shots** - Maximum total shots across all programs (e.g., 200,000)

### 6. Supported Operations (Summary)

**All Gate Model Devices:**
- **Number of Supported Gates** - Count of supported operations
- **Basis Gates** - Native gate set (already shown in Hardware Specifications, but can repeat for emphasis)
- **Supported Result Types** - List of available result types (Sample, Expectation, Variance, Probability, Amplitude)

### 7. Device Capabilities (Flags)

**Gate Model QPUs:**
- **Physical Qubits Support** - Yes/No
- **Qubit Rewiring** - Enabled/Disabled
- **Partial Verbatim Box** - Supported/Not Supported
- **All Qubits Measurement Required** - Yes/No

---

## Data Mapping Reference

### From API Response to Display Fields

#### Universal Fields (from device object root):
```
deviceName → Device Name
providerName → Provider
deviceType → Device Type
deviceStatus → Status
```

#### From properties.service:
```
deviceLocation → Region
updatedAt → Last Updated
deviceCost.price + deviceCost.unit → Cost per Shot
shotsRange[0] and shotsRange[1] → Shots Range
executionWindows[] → Execution Windows
```

#### From properties.paradigm (Gate Model):
```
qubitCount → Qubit Count
nativeGateSet[] → Native Gate Set (join with ", ")
connectivity.fullyConnected → Topology
```

#### From queueDepth:
```
quantumTasks.NORMAL → Queue Depth (Normal)
quantumTasks.PRIORITY → Queue Depth (Priority)
jobs → Queue Depth (Jobs)
(sum all) → Pending Jobs
```

#### From properties.provider (IonQ):
```
fidelity.1Q.mean → Single-Qubit Fidelity (%)
fidelity.2Q.mean → Two-Qubit Fidelity (%)
fidelity.spam.mean → SPAM Fidelity (%)
timing.T1 → T1 (convert to µs)
timing.T2 → T2 (convert to µs or ms)
timing.readout → Readout Time (convert to µs)
```

#### From properties.provider.specs.benchmarks (Rigetti):
```
Filter benchmarks by name:
- "FreeInversionRecovery" → Extract T1 values from characteristics
- "FreeInductionDecay" → Extract T2 values from characteristics
- "randomized_benchmark_1q" → Extract fRB values (single-qubit fidelity)
- "MEASURE" → Extract fRO values (readout fidelity)
- "ISWAP" or similar 2Q gates → Extract gate fidelity

For each characteristic array:
- Calculate median across all sites[].characteristics[].value
- Show as primary metric
- Optionally show min/max or range
```

#### From properties.action:
```
supportedOperations[] → count → Number of Supported Gates
supportedResultTypes[] → map to names → Supported Result Types
```

---

## Display Recommendations

### Layout Structure

**The detail page uses a vertical sectioned layout (no tabs):**

The page consists of:
1. **Header** - Device name with back button
2. **Summary Bar** - Key status info (status, provider, region, queue)
3. **Scrollable Sections Container** - Vertically stacked sections

Each section is a direct child of the detail page container with:
- **Section Title** (Typography variant="h6")
- **Parameter Grid** - Responsive grid showing label-value pairs

**Section Order:**
1. **Essential Metrics** (Phase 1) - Always visible
2. **Performance Metrics** (Phase 2) - Always visible for QPUs
3. **Operational Details** (Phase 3) - Always visible
4. **Advanced Metrics** (Phase 4) - Future/optional

**Grid Layout:**
- Responsive columns: 2-4 columns depending on viewport width
- Each grid item shows: **Label** (bold) + Value
- Consistent spacing (gap: 2-3 Material-UI spacing units)
- Use Material-UI Grid or Box with flexbox

### Formatting Guidelines

**Numbers:**
- **Fidelities**: Display as percentages with 2-3 decimal places (e.g., "99.98%")
- **Error rates**: Display in scientific notation if < 0.01 (e.g., "1.24E-3") or as percentage (e.g., "0.124%")
- **Times**: Display with appropriate units (e.g., "280.85 µs", "341.32 µs", "188 µs")
- **Prices**: Display with currency and unit (e.g., "$0.0009/shot")
- **Counts**: Display as integers with comma separators for large numbers (e.g., "340,000")

**Status Indicators:**
- Use visual indicators (colored dots or badges) for ONLINE/OFFLINE status
- Use icons or badges for boolean flags

**Lists:**
- For gate sets, show as comma-separated inline list
- For result types, show as badges or chips
- For execution windows, show as human-readable schedule

### Comparison with IBM

**IBM shows:**
- Qubits, Status, Region, Processor Type, QPU Version
- CLOPS, Basis Gates, Pending Jobs
- Various error metrics (2Q median/layered/best, readout, gate-specific)
- T1/T2 medians

**We should show similar data:**
- Map to equivalent Braket fields where available
- For Rigetti: Calculate median T1, T2, error rates from benchmarks
- For IonQ: Use provider-level timing and fidelity data
- Add Braket-specific fields like execution windows, cost, native gate set

---

## Notes on Data Availability

### What Braket Provides vs. IBM

**Braket IonQ has:**
- Simple scalar T1/T2 values (device-level averages)
- Mean fidelities for 1Q, 2Q, SPAM
- Gate timing values

**Braket Rigetti has:**
- Per-qubit T1, T2, readout fidelity measurements (requires aggregation)
- Per-edge gate fidelity measurements (requires aggregation)
- Detailed benchmark data with timestamps

**Braket does NOT have (compared to IBM):**
- CLOPS (Circuit Layer Operations Per Second) metric
- "Layered" error measurements
- Processor version numbers (some devices have this in external docs)

**Braket DOES have (that IBM doesn't show as prominently):**
- Execution windows / availability schedule
- Queue depth by priority level
- Device location
- Cost per shot
- Max shots limits
- Native gate set emphasis

### Recommendations for Missing Data

**For metrics not directly available:**
- Calculate from available data where possible (e.g., median error = 1 - median fidelity)
- Use "N/A" or hide fields that aren't applicable to device type
- Consider adding tooltips to explain Braket-specific metrics

**For device-specific differences:**
- Create provider-specific detail sections that show unique metrics
- Use consistent labels even if underlying data sources differ
- Document mapping in this spec file

---

## Implementation Priority & UX Sections

Each phase below corresponds to a **UX section** on the detail page. Sections are direct children of the detail page container (no tabs), each with a title and parameter grid.

### Phase 1: Essential Metrics (MVP)
**Section Title:** "Essential Metrics"

**Parameters to display:**
- Device Name (already in header, can repeat here)
- Provider
- Device Type (QPU/Simulator)
- Status (with visual indicator)
- Region/Location
- Qubit Count
- Native Gate Set (comma-separated list)
- Topology (Fully Connected / Limited Connectivity)
- Pending Jobs (sum of queue depths)
- Cost per Shot (with unit)
- Shots Range (min - max)

**Grid Layout:** 2-3 columns on desktop, 1-2 on mobile

### Phase 2: Performance Metrics
**Section Title:** "Performance Metrics"

**Parameters to display (device-specific):**

**IonQ Devices:**
- Single-Qubit Fidelity (%)
- Two-Qubit Fidelity (%)
- SPAM Fidelity (%)
- T1 Coherence Time (µs)
- T2 Dephasing Time (µs/ms)
- Readout Error (calculated from fidelity if available)

**Rigetti Devices:**
- T1 median (µs)
- T2 median (µs)
- Single-Qubit Fidelity median (%)
- Two-Qubit Fidelity median (%)
- 2Q Error median (scientific notation)
- 2Q Error best (scientific notation)
- Readout Fidelity median (%)
- Readout Error median (scientific notation)

**QuEra Aquila:**
- Atom Loss typical (%)
- Filling Error typical (%)
- Position Error (µm)

**Grid Layout:** 2-4 columns depending on viewport, highlight important metrics

### Phase 3: Operational Details
**Section Title:** "Operational Details"

**Parameters to display:**
- Execution Windows (human-readable schedule)
- Last Updated (formatted timestamp)
- Queue Depth breakdown:
  - Normal Priority
  - Priority (if > 0)
  - Jobs (if > 0)
- Max Executables (if available)
- Max Total Shots (if available)
- Supported Result Types (badges/chips)

**Grid Layout:** 2-3 columns, may use full-width rows for lists

### Phase 4: Advanced Metrics (Future)
**Section Title:** "Advanced Metrics"

**Optional/Future content:**
- Per-qubit detailed statistics (expandable/collapsible)
- Per-gate error rates table
- Benchmark history trends (if caching implemented)
- Device capabilities flags (compact display)

**Note:** This section may be implemented later or made collapsible/expandable

---

## UX Implementation Notes

### Section Component Structure

Each section component should:
1. Accept `device` and `properties` props
2. Extract relevant metrics using utility functions
3. Render section title (Typography variant="h6")
4. Render ParameterGrid with label-value pairs
5. Handle missing data gracefully (show "N/A" or hide parameter)

### Reusable Components

**ParameterGrid Component:**
- Props: `parameters: Array<{label: string, value: string | number | ReactNode}>`
- Renders responsive grid of label-value pairs
- Handles wrapping and spacing automatically

**Example Usage:**
```tsx
<ParameterGrid
  parameters={[
    { label: 'Qubit Count', value: 82 },
    { label: 'Status', value: <StatusChip status="ONLINE" /> },
    { label: 'Cost per Shot', value: '$0.0009/shot' }
  ]}
/>
```

### Responsive Behavior

- **Desktop (>900px):** 3-4 columns per section
- **Tablet (600-900px):** 2-3 columns per section
- **Mobile (<600px):** 1-2 columns per section
- Sections stack vertically with consistent spacing (gap: 3-4 units)
