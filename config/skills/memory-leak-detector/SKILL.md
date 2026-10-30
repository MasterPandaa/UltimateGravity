---
name: memory-leak-detector
description: "[Windows Native & Desktop Memory Leak Profiler] Diagnoses memory leaks, GDI/USER handle exhaustion, VirtualAlloc bloat, and Electron/Node.js heap growth using Sysinternals VMMap, Process Explorer, UMDH, and heap snapshot analysis."
allowed-tools: run_command, read_file
tags: [performance, memory, leaks, debugging, profiling, windows, native, electron]
---

# Memory Leak Detector (Windows Native & Desktop)

Comprehensive memory leak detection, heap growth analysis, and resource exhaustion diagnostics for desktop applications across both managed (Electron, Node.js, Chromium) and Windows native runtimes (C, C++, Rust, Win32/Qt).

## Capabilities

- **V8 / Electron / Node.js**: Heap snapshot capture & comparison, detached DOM tree tracking, closure retention analysis.
- **Windows Native (C/C++/Rust)**: Heap allocation diffing via UMDH (User-Mode Dump Heap), MSVC CRT Debug Heap instrumentation, and Dr. Memory.
- **OS & Kernel Resource Tracking**: Sysinternals VMMap (Private Bytes, Working Set, Committed VirtualAlloc) and Process Explorer (GDI/USER Handle leaks, Thread exhaustion).
- **Event Tracing for Windows (ETW)**: WPR/WPA heap and virtual allocation profiling.
- **Root Cause & Fix Guidance**: Deterministic remediation steps with verification gates.

---

## 1. Windows Native Diagnostics (C / C++ / Rust / Win32)

When diagnosing leaks in native Windows binaries or unmanaged DLLs, choose the tool based on access to source and debug symbols (`.pdb`):

### A. UMDH (User-Mode Dump Heap — Windows SDK / Debugging Tools)
*Best for: Native processes in test or production environments where symbols (`.pdb`) are available.*

1. **Enable User Stack Tracing (UST)** via GFlags (requires Admin):
   ```cmd
   gflags.exe /i myapp.exe +ust
   ```
2. **Set Symbol Path**:
   ```cmd
   set _NT_SYMBOL_PATH=srv*C:\Symbols*https://msdl.microsoft.com/download/symbols;C:\path\to\myapp\out\pdb
   ```
3. **Capture Baseline Snapshot (Snapshot 1)** after warm-up:
   ```cmd
   umdh.exe -pn:myapp.exe -f:snap1.txt
   ```
4. **Trigger workload / test scenario multiple times**, then capture Snapshot 2:
   ```cmd
   umdh.exe -pn:myapp.exe -f:snap2.txt
   ```
5. **Generate Diff Analysis**:
   ```cmd
   umdh.exe snap1.txt snap2.txt -f:diff.txt
   ```
6. **Interpret `diff.txt`**: Look for allocations with high positive byte counts (`+xxxxx bytes by yyyy allocations`) and examine the call stack pointing to exact file and line numbers.

### B. MSVC CRT Debug Heap (Source-Level Instrumentation)
*Best for: Local debug builds in Visual Studio / MSVC.*

Add CRT leak detection macros to the main application entry point:
```cpp
#define _CRTDBG_MAP_ALLOC
#include <stdlib.h>
#include <crtdbg.h>

int main(int argc, char* argv[]) {
    // Enable automatic memory leak check on process termination
    _CrtSetDbgFlag(_CRTDBG_ALLOC_MEM_DF | _CRTDBG_LEAK_CHECK_DF);

    // Optional: Break at specific allocation number reported in previous runs
    // _CrtSetBreakAlloc(1234);

    run_app();
    return 0;
}
```

### C. Sysinternals VMMap & Process Explorer (Process-Level Windows Inspection)
*Best for: Immediate black-box leak diagnosis without rebuilding.*

- **Process Explorer**:
  1. Add columns: `Private Bytes`, `Working Set`, `GDI Handles`, `USER Handles`, `Handle Count`.
  2. If `GDI Handles` steadily climbs towards 10,000 (Win32 hard limit), application leaks Bitmaps/DC/Fonts (`CreateCompatibleDC`, `SelectObject` without restoration, `DeleteObject` omitted).
  3. If `USER Handles` climbs, application leaks Window hooks, HWNDs, or timers.

- **VMMap**:
  1. Attach to running target or launch under VMMap.
  2. Inspect memory classification:
     - **Heap**: General `malloc`/`new` accumulation.
     - **Managed Heap**: .NET / CLR garbage collection retention.
     - **Virtual Memory / Committed**: Direct `VirtualAlloc` leaks (often in custom allocators or media engines).
  3. Use `Trace Snapshot` -> run workload -> `Compare Snapshot` to view diff by allocation type.

### D. ETW / Windows Performance Recorder (WPR) & Analyzer (WPA)
*Best for: System-level non-intrusive profiling of memory growth.*
```powershell
# Start Heap tracing
wpr.exe -start Heap -filemode

# Perform application actions
# ...

# Stop and save trace
wpr.exe -stop heap_trace.etl
```

---

## 2. Electron / Node.js / V8 Heap Diagnostics

### Heap Snapshot Diffing Pattern
```javascript
const v8 = require('v8');
const fs = require('fs');

function writeHeapSnapshot(prefix) {
  const file = `${prefix}_${Date.now()}.heapsnapshot`;
  const stream = v8.getHeapSnapshot();
  const writeStream = fs.createWriteStream(file);
  stream.pipe(writeStream);
  console.log(`Heap snapshot written to ${file}`);
}

// Workflow:
// 1. Initial warm-up -> writeHeapSnapshot('baseline');
// 2. Perform repeated UI/API workload (3-5 cycles)
// 3. Force GC: if (global.gc) global.gc();
// 4. Capture second snapshot -> writeHeapSnapshot('after_load');
// 5. Open Chrome DevTools -> Memory -> Load both snapshots -> Select "Objects allocated between Snapshot 1 and 2"
```

### Common Electron / Web Desktop Leak Root Causes

1. **Detached DOM Nodes**:
   - Elements removed from DOM but still referenced in JavaScript closures, arrays, or event listeners.
   - *Fix*: Ensure references are cleared (`element = null`) when component unmounts.
2. **IPC Listener Accumulation**:
   - `ipcRenderer.on('channel', handler)` registered on every render/mount without `ipcRenderer.removeListener(...)`.
   - *Fix*: Use clean lifecycle hooks (`useEffect` cleanup or EventEmitter removeListener).
3. **Uncleared Timers & Intervals**:
   - `setInterval` holding references to component closures.
4. **V8 Context & Node Buffer Leaks**:
   - Retaining unmanaged `Buffer` allocations or Node C++ addon memory across Webview reloads.

---

## 3. Related Capabilities in Antigravity

- `diagnosing-bugs`: Systematic 4-step root cause loop.
- `verification-before-completion`: Evidence-based verification proving heap stability after remediation.
- `chrome-devtools`: Live heap snapshot inspection and memory profiling via Chrome DevTools MCP.
