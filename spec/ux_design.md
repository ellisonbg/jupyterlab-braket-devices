# UX Design: JupyterLab Braket Devices Extension

## Overview

This document describes the user experience design for the JupyterLab Braket Devices extension, including information architecture, interaction patterns, and layouts. The design uses Material-UI (MUI) with a custom theme and follows JupyterLab design patterns.

---

## Design Principles

1. **Consistency with JupyterLab**: Follow JupyterLab's design language and interaction patterns
2. **Information Clarity**: Present complex quantum device data in an understandable hierarchy
3. **Progressive Disclosure**: Show essential information first, detailed specs on demand
4. **Quick Access**: Enable rapid device discovery and selection workflows
5. **Performance**: Handle 10-20+ devices efficiently with fast filtering and search
6. **Responsive**: Adapt to different panel sizes using MUI's responsive layout system

---

## Information Architecture

### Primary Navigation Flow

```
JupyterLab Launcher
  └─> Braket Devices Card (in "Other" section)
        └─> Device Explorer Panel (Main Area)
              ├─> Device List View (Default)
              │     ├─> Filter & Sort Bar
              │     └─> Device List
              │
              └─> Device Detail View (Click on device)
                    ├─> Device Header & Summary
                    ├─> Action Bar
                    └─> Tabbed Detail Sections
                          ├─> Details
                          ├─> Calibration (QPUs only)
                          └─> Native Gates (Gate Model)
```

### Information Hierarchy

**Device List (Overview)**
- Essential: Name, Provider, Type (QPU/Simulator), Status, Qubit Count
- Secondary: Description, Location

**Device Detail (Comprehensive)**
- Summary: Status, ARN, Queue Depths, Key Specs
- Technical: Full capabilities, supported operations, paradigm details
- Calibration: T1/T2, gate fidelities, error rates, topology graph (if not fully connected)
- Documentation: External links, provider information

---

## Layout Specifications

### Device Explorer Panel (Main Container)

```
┌────────────────────────────────────────────────────┐
│ Toolbar: Braket Devices [⟳ Refresh]               │
├────────────────────────────────────────────────────┤
│ Filter Bar: [🔍 Search] [Filters] [Sort ▼]        │
├────────────────────────────────────────────────────┤
│                                                    │
│               Content Area                         │
│         (Device List or Detail View)               │
│                                                    │
├────────────────────────────────────────────────────┤
│ Status Bar: 11 devices • 8 online • 3 offline     │
└────────────────────────────────────────────────────┘
```

**Components:**
- **Toolbar**: Title and refresh button
- **Filter Bar**: Search input, filter controls, sort dropdown
- **Content Area**: Scrollable, displays list or detail view
- **Status Bar**: Device count and status summary

---

### Device List View

**Table Layout**
```
┌─────────────────────────────────────────────────────┐
│ Provider    Device         Status    Description    │
├─────────────────────────────────────────────────────┤
│ Rigetti     Ankaa-3        ● ONLINE  82 qubit...   │
│ IonQ        Forte Ent. 1   ● ONLINE  36 qubit...   │
│ QuEra       Aquila         ● ONLINE  256 qubit...  │
│ IonQ        Aria 1         ○ OFFLINE 25 qubit...   │
└─────────────────────────────────────────────────────┘
```

**Columns:**
- Provider (logo + name)
- Device (name, clickable)
- Status (indicator + text)
- Qubits (count for QPUs)
- Type (QPU/Simulator badge)
- Description (truncated)

**Interactions:**
- Click row to view device details
- Hover shows row highlight
- Sortable columns (name, provider, status, qubits)

---

### Device Detail View

```
┌───────────────────────────────────────────────────┐
│ ← Back to List                                    │
├───────────────────────────────────────────────────┤
│ [Provider Logo]  Provider - Device Name          │
│                  Device description               │
│                                                   │
│ Summary                    [⟳] [Open Notebook]   │
│                                                   │
│ Status                  Tasks queue depth        │
│ ● ONLINE                0                        │
│                                                   │
│ Device ARN              Priority queue depth     │
│ [Copy] arn:aws:...      0                        │
│                                                   │
│ Qubits: 82              Hybrid queue depth       │
│ Location: CA, USA       0                        │
│                                                   │
│ [Details] [Calibration] [Native Gates]           │
│ ──────────                                        │
│                                                   │
│ (Tab content)                                     │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Header:**
- Back button to return to list
- Provider logo
- Provider name + Device name
- Device description

**Summary Section:**
- Status with indicator
- Device ARN with copy button
- Queue depths (tasks, priority, hybrid)
- Key specs (qubits, location, region)
- Action buttons (refresh, open notebook)

**Tabs:**
1. **Details**: Full specifications and capabilities
2. **Calibration**: Calibration data and topology (QPUs only, hide topology if fully connected)
3. **Native Gates**: Supported gate operations

---

## Component Specifications

### Device Status Indicator

**Visual:**
- Circle icon + text label
- Colors: Online (green), Offline (gray), Maintenance (orange)
- Not color-dependent alone (includes text)

### Provider Logo/Badge

- Display provider logo if available
- Fallback: Provider name in styled badge
- Standard size maintained via MUI Box

### Device Type Badge

- Chip component from MUI
- QPU: Contained style
- Simulator: Outlined style

### Copy ARN Button

**Interaction:**
1. Click copies ARN to clipboard
2. Shows "Copied!" confirmation
3. Returns to default state after brief delay

### Topology Graph

**For devices with partial connectivity:**
- Visual graph showing qubit connections
- Nodes: Qubits (numbered)
- Edges: Physical connections
- Interactive: Hover for details
- Zoom/pan controls

**For fully connected devices:**
- Hide the topology graph entirely
- Show "Fully connected" text instead

---

## Interaction Patterns

### Search and Filter

**Search:**
- Placeholder: "Search devices..."
- Searches: Name, provider, description
- Real-time filtering with debounce

**Filters:**
- Type: All, QPU, Simulator
- Provider: Dropdown with checkboxes
- Status: All, Online, Offline
- Active filters shown as removable chips

**Sort:**
- Options: Name, Provider, Status, Qubits
- Direction toggle (ascending/descending)
- Visual indicator for active sort

### Navigation

**List to Detail:**
- Click device row
- Slide transition
- Back button appears

**Detail to List:**
- Click back button
- Reverse transition
- Restores scroll position

### Loading States

- Skeleton screens while loading
- Spinner for refresh actions
- Progress indicators for long operations

### Error States

**Error Messages:**
- Clear, user-friendly text
- Action buttons (Retry, Settings)
- No technical stack traces

**Empty States:**
- When no devices match filters
- Icon + message + clear filters button

---

## Responsive Behavior

### MUI Layout System

**Use MUI components for responsive layouts:**
- `Box` with responsive props for containers
- `Grid` or `Stack` for multi-column layouts
- Breakpoints: xs, sm, md, lg, xl
- Automatic adaptation to panel size

**Layout Adaptations:**
- Large panels: Full multi-column layout
- Medium panels: Reduced columns, adapted spacing
- Small panels: Single column, stacked elements

**Specific Responsive Behaviors:**
- Summary section: Multi-column → single column
- Tables: Horizontal scroll on narrow widths
- Tabs: Scrollable if too many for width
- Action buttons: Stack or icon-only on small screens

---

## Theme Integration

### MUI Theme

For now, use the default MUI theme.

---

## Implementation Notes

### MUI Components to Use

- `Box`: Primary layout container
- `Stack`: Vertical/horizontal stacking
- `Grid`: Multi-column responsive layouts
- `TextField`: Search input
- `Button`: All buttons
- `IconButton`: Icon-only buttons
- `Chip`: Badges and filter chips
- `Table`/`TableContainer`: Device list
- `Tabs`/`Tab`: Detail view tabs
- `CircularProgress`: Loading spinners
- `Skeleton`: Loading placeholders
- `Alert`: Error messages
- `Tooltip`: Info tooltips
- `Menu`/`MenuItem`: Dropdowns

### State Management

- React Context for filters and preferences
- Local state for UI interactions
- React Query or similar for device data
- Cache device data with reasonable TTL

### Navigation

- Use JupyterLab widget state for view management
- Track: list view vs detail view
- Store current device ARN for detail view
- Maintain scroll position for list view

---

## Tab Content Details

### Details Tab

**Sections:**
1. About: Device description and overview
2. Hardware Specifications:
   - Qubit count and technology
   - Connectivity type
   - Coherence times (T1, T2)
   - Gate times
3. Operational Details:
   - Execution windows
   - Shots range
   - Maximum circuit depth
4. Documentation Links

### Calibration Tab (QPUs Only)

**Content:**
1. Calibration timestamp and status
2. Topology graph (only if NOT fully connected)
   - If fully connected: Show "Fully connected" text
   - Otherwise: Interactive connectivity visualization
3. Calibration data tables:
   - Per-qubit metrics (T1, T2, readout errors)
   - Per-gate metrics (fidelities, durations)
   - Sortable and searchable tables

### Native Gates Tab

**Content:**
- List or table of supported gates
- Gate name, description, and type
- Indication of native vs derived gates
- Standard gate notation

---

