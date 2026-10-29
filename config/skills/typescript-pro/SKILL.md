---
name: typescript-pro
description: "[Advanced TypeScript Type-Level Engineering] Zero-runtime overhead contracts, branded/nominal types, conditional types, and discriminated union exhaustiveness. DO NOT USE for simple vanilla JavaScript scripting."
---

# TypeScript Pro

The definitive type-level engineering and advanced TypeScript design suite. Designed to enforce compile-time correctness, eliminate `any`/`as` assertions, build expressive type contracts, and guarantee runtime safety with zero runtime performance penalty.

---

## Non-Negotiable TypeScript Rules & Type Safety Gates

### 1. The Zero Unsafe Cast Gate
- **Ban `any` Escapes**: Never introduce `any` in application code. Use `unknown` with runtime type narrowing or user-defined type guards (`is`).
- **Ban `as` Type Assertions for Invariant Bypass**: Never cast away a type mismatch using `value as unknown as TargetType`. Fix the underlying domain model or write an explicit validator (Zod, Valibot, or custom type guard).

### 2. Exhaustiveness Checking & Nominal Invariants
- **Exhaustive Pattern Matching**: All `switch` or `if/else` ladders over discriminated unions must include an exhaustive `never` assertion check.
- **Branded Types for Identifiers**: Never represent domain entity IDs as naked `string` or `number`. Use branded types to prevent accidental cross-entity ID swaps (e.g. passing a `UserId` where an `OrderId` is expected).

---

## Operating Modes

| Mode | Domain | Primary Focus | Key Techniques |
|---|---|---|---|
| **Mode 1: Branded & Nominal Types** | Entity modeling | Creating compile-time distinct types for primitives. | `type Brand<K, T> = K & { __brand: T }` |
| **Mode 2: Generic & Conditional Contracts** | API interfaces & libraries | Designing flexible, type-safe functions that adapt output types based on input arguments. | `T extends U ? X : Y`, `infer R` |
| **Mode 3: Mapped & Template Literal Types** | String & schema routing | Deriving event names, route parameters, and object key mutations at compile time. | `` `on${Capitalize<string>}` ``, `[K in keyof T]` |
| **Mode 4: Type Guards & Safe Narrowing** | Runtime-to-compile boundary | Verifying untrusted inputs from network/JSON and safely narrowing to strongly typed structs. | `arg is T`, custom assertion functions (`asserts x`) |

---

## Advanced Reference Patterns

### 1. Nominal Branded Types
```typescript
declare const __brand: unique symbol;
type Brand<B> = { readonly [__brand]: B };

export type Branded<T, B> = T & Brand<B>;

export type UserId = Branded<string, "UserId">;
export type OrderId = Branded<string, "OrderId">;

export function makeUserId(raw: string): UserId {
    if (!raw.startsWith("usr_")) throw new Error("Invalid User ID format");
    return raw as UserId;
}

// Compile Error: Cannot assign UserId to OrderId
// const orderId: OrderId = makeUserId("usr_123");
```

### 2. Exhaustive Switch Checking
```typescript
type Action = 
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: string }
  | { type: "FETCH_ERROR"; error: Error };

function assertUnreachable(x: never): never {
  throw new Error(`Unhandled union member: ${JSON.stringify(x)}`);
}

function reducer(action: Action) {
  switch (action.type) {
    case "FETCH_START": return "loading";
    case "FETCH_SUCCESS": return action.payload;
    case "FETCH_ERROR": return "error";
    default: return assertUnreachable(action); // Compile error if Action union adds a new case!
  }
}
```

### 3. Deep Readonly & Immutability Helpers
```typescript
export type DeepReadonly<T> = T extends Function | boolean | number | string | symbol | null | undefined
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : { readonly [P in keyof T]: DeepReadonly<T[P]> };
```
