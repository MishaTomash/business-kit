/**
 * Minimal typed reactive store (no dependencies).
 *
 * - Immutable snapshots: `setState` produces a new object; listeners
 *   receive `(next, prev)` and can diff cheaply.
 * - Notifies only when a patched key actually changed (Object.is).
 *
 * Used per component instance (e.g. each calculator owns its own store),
 * so pages stay independent and nothing leaks between routes.
 */

export type Listener<T> = (next: T, prev: T) => void;
export type Patch<T> = Partial<T> | ((state: T) => Partial<T>);

export interface Store<T> {
  getState(): T;
  setState(patch: Patch<T>): void;
  subscribe(listener: Listener<T>): () => void;
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener<T>>();

  return {
    getState: () => state,

    setState(patch) {
      const partial = typeof patch === 'function' ? patch(state) : patch;
      const next = { ...state, ...partial };
      const changed = (Object.keys(partial) as (keyof T)[]).some((key) => !Object.is(state[key], next[key]));
      if (!changed) return;
      const prev = state;
      state = next;
      listeners.forEach((listener) => listener(state, prev));
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
