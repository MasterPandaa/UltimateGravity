---
name: frontend-api-integration
description: "[Frontend Data Fetching & Server State Engine] TanStack Query v5 / SWR patterns, optimistic updates with deterministic rollbacks, and type-safe API client wrappers. DO NOT USE for backend database ORM logic (use clean-code-fullstack)."
---

# Frontend API Integration Patterns

The comprehensive frontend data-fetching and server state management suite. Designed to bridge client interfaces and backend endpoints with zero layout jank, robust network resilience, type-safe contract bindings, and seamless optimistic interactions.

---

## Non-Negotiable Core Rules & Data Fetching Gates

### 1. The Optimistic Rollback Gate
- **Never Mutate Without Rollback**: Every optimistic UI mutation (e.g. toggling a like, reordering items, quick submit) must preserve the previous state snapshot in `onMutate`.
- **Guaranteed Revert on Failure**: If the network request fails or returns an error status, the cache must be rolled back deterministically to the snapshot and a user-facing toast/error state must be displayed.

### 2. The Type-Safe Client Contract Gate
- **Zero Untyped Fetch Calls**: Never use bare `fetch('/api/...')` without typing the response payload. Wrap all network calls in dedicated API client modules with Zod/Valibot schema parsers or strongly typed TypeScript interfaces.
- **Query Key Factory Pattern**: Always define query keys as structured tuple constants using a Query Key Factory to prevent cache invalidation collisions.

### 3. The Doherty Threshold Gate (< 400ms Perceived Response)
- **400ms Psychological Cliff**: Doherty & Thadani (IBM) research proves that user productivity and perceived performance peak when system feedback occurs under 400 milliseconds. Beyond 400ms, the user's flow state is disrupted.
- **Mandatory Three Fast-Response Layers**:
  1. *Optimistic Mutations*: Mutate the UI immediately (0-50ms) before server response completes.
  2. *Hover-Triggered Prefetching*: Attach queryClient.prefetchQuery when the cursor hovers over navigation buttons or list item links.
  3. *Zero-Latency Skeletons*: Render instant layout skeletons (< 100ms) rather than blank white screens or centered spinning loaders.

---

## Operating Modes

| Mode | Domain | Primary Focus | Key Techniques |
|---|---|---|---|
| **Mode 1: Query Key & Cache Architecture** | Server state caching | Define hierarchical, predictable cache keys and stale-time policies. | Query Key Factories, `staleTime`, `gcTime` |
| **Mode 2: Optimistic Mutation & Rollback** | Instant UI responsiveness | Apply instant UI updates before server confirmation with bulletproof fallback. | `onMutate`, `onError`, `onSettled` |
| **Mode 3: Type-Safe API Client Abstraction** | Network layer | Build resilient HTTP client wrappers with interceptors and error normalization. | Fetch/Axios wrappers, Zod validation |
| **Mode 4: Infinite Scroll & Pagination** | Large list fetching | Manage cursor-based and offset pagination without duplicate items or layout shift. | `useInfiniteQuery`, cursor pagination |

---

## Standard Reference Implementation Patterns

### 1. Query Key Factory Pattern
```typescript
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters: { status?: string }) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
};
```

### 2. Robust Optimistic Mutation Pattern (TanStack Query v5)
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todoKeys } from "./todoKeys";
import { updateTodoApi, Todo } from "./api";

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTodoApi,
    onMutate: async (newTodo: Todo) => {
      // 1. Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: todoKeys.detail(newTodo.id) });

      // 2. Snapshot previous value
      const previousTodo = queryClient.getQueryData<Todo>(todoKeys.detail(newTodo.id));

      // 3. Optimistically update cache
      queryClient.setQueryData<Todo>(todoKeys.detail(newTodo.id), newTodo);

      // 4. Return context with snapshot
      return { previousTodo, newTodo };
    },
    onError: (err, newTodo, context) => {
      // 5. Rollback on failure!
      if (context?.previousTodo) {
        queryClient.setQueryData(todoKeys.detail(newTodo.id), context.previousTodo);
      }
    },
    onSettled: (newTodo) => {
      // 6. Invalidate to refetch fresh server truth
      if (newTodo) {
        queryClient.invalidateQueries({ queryKey: todoKeys.detail(newTodo.id) });
      }
    },
  });
}
```
