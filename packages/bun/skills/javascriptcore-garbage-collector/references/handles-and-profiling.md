## `JSRef` — the native↔wrapper reference pattern

When a native object needs to hold a reference back to its own JS wrapper, **use `JSRef`** (`src/jsc/JSRef.rs`), not `gcProtect`, not a raw `JSValue` field, and usually not `Strong` directly.

`JSRef` is a tagged union with three states:

- `Weak` — a bare `JSValue`. Does **not** keep the wrapper alive. Valid only because the wrapper's `finalize()` will flip this to `Finalized` before the cell is freed, so `try_get()` returns `None` instead of a dangling pointer. (This is _not_ a `JSC::Weak`; it's cheaper — no `WeakImpl` allocation.)
- `Strong` — wraps `bun_jsc::Strong` (a `JSC::Strong<Unknown>` root). Keeps the wrapper alive.
- `Finalized` — terminal; `try_get()` returns `None`.

Pattern: **strong while busy, weak while idle.**

```rust
this_value: JSRef, // initialized with JSRef::empty()

// On construction / when work starts:
self.this_value.set_strong(js_wrapper, global);   // or .upgrade(global)

// When the last in-flight operation completes:
self.this_value.downgrade();                      // Strong -> Weak, GC may now collect

// In any callback that needs the wrapper:
let Some(js_this) = self.this_value.try_get() else { return };

// In the codegen'd finalize():
self.this_value.finalize();
```

See `ServerWebSocket`, `UDPSocket`, `MySQLConnection`, `ValkeyClient` for real examples.

**`JSRef` requires a finalizer.** The `Weak` state is only sound because the codegen'd `finalize()` flips it to `Finalized` before the cell is reused. If your `.classes.ts` entry has `finalize: true` (almost all native-backed classes do), `JSRef` is the default choice for self-references.

**`JSRef` vs `hasPendingActivity`:** prefer `JSRef`. `hasPendingActivity: true` is a GC-thread-polled atomic predicate; its only real justification is when **many concurrent operations** independently keep the wrapper alive and there's no single place to call `upgrade()`/`downgrade()` — i.e., refcount-style liveness where the count is touched from multiple threads. That's uncommon. If you can identify "work started" / "work finished" edges, use `JSRef`. Don't add `hasPendingActivity` reflexively; it costs a constraint-fixpoint poll on every GC.

## `gcProtect` / `JSValueProtect` — almost never

`gcProtect()` / `JSValueProtect()` push into `Heap::m_protectedValues` (a ref-counted root map, visited by the `Msr` constraint). It's the legacy C-API mechanism. **Avoid it in Bun:**

- It's a raw global root with manual unprotect — easy to leak.
- It has no owner, so heap snapshots can't attribute the retention.
- `bun_jsc::Strong` / `JSRef` give the same guarantee with RAII and a destructor.

The only legitimate uses are inside the JSC C API shims themselves, or one-off debugging.

## Extra-memory reporting — `reportExtraMemoryAllocated` / `reportExtraMemoryVisited`

The GC schedules itself by bytes-allocated-since-last-GC. It only sees JSCell allocations, so a 32-byte wrapper around a 50MB native buffer looks like 32 bytes → GC never triggers → OOM.

**Contract — both halves are required:**

```cpp
// 1) When the native memory is allocated (or the wrapper takes ownership):
vm.heap.reportExtraMemoryAllocated(ownerCell, byteCount);

// 2) In visitChildren, every time the cell is visited:
visitor.reportExtraMemoryVisited(thisObject->wrapped().byteSize());
```

- `reportExtraMemoryAllocated` adds to the "since last GC" counter and may **immediately trigger a GC** (it's a safepoint). Call it _after_ the cell is fully constructed.
- `reportExtraMemoryVisited` adds to the "live bytes after this GC" counter, which sets the next trigger threshold. **If you forget this half**, the heap's high-water mark drifts down each cycle and you get back-to-back full GCs (the "GC death spiral").
- If the size changes over time, report the delta on growth (`reportExtraMemoryAllocated(cell, newSize - oldSize)`) and report the current size in `visitChildren`.
- `deprecatedReportExtraMemory` exists for callers that can't satisfy the visit-side half — avoid it.

In `.classes.ts`, `estimatedSize: true` generates the `reportExtraMemoryVisited` side; you implement `estimated_size()` in Rust. You still call `reportExtraMemoryAllocated` (or the binding's helper) at allocation time.

## `HeapAnalyzer` — heap snapshots and labelling

`vendor/WebKit/Source/JavaScriptCore/heap/HeapAnalyzer.h` is the abstract visitor used to build heap snapshots (Web Inspector "Heap Snapshot", and Bun's V8-compatible `BunV8HeapSnapshotBuilder`). When a snapshot is requested, marking runs with an analyzer attached and each cell's `analyzeHeap` static is called:

```cpp
void JSFoo::analyzeHeap(JSCell* cell, HeapAnalyzer& analyzer) {
    auto* thisObject = jsCast<JSFoo*>(cell);
    Base::analyzeHeap(cell, analyzer);
    analyzer.setWrappedObjectForCell(cell, &thisObject->wrapped());
    analyzer.setLabelForCell(cell, thisObject->wrapped().url().string());
    if (auto* child = thisObject->m_callback.get())
        analyzer.analyzePropertyNameEdge(cell, child, vm.propertyNames->callback.impl());
}
```

API (`HeapAnalyzer`):

- `analyzeNode(cell)` — record a node
- `analyzeEdge(from, to, RootMarkReason)` / `analyzePropertyNameEdge` / `analyzeVariableNameEdge` / `analyzeIndexEdge` — record a labelled edge
- `setWrappedObjectForCell(cell, void*)` — link wrapper → native pointer
- `setLabelForCell(cell, String)` — human-readable name in the snapshot
- `setOpaqueRootReachabilityReasonForCell` — why a weakly-held wrapper survived

If your class shows up as an opaque blob in heap snapshots, implement `analyzeHeap`.

