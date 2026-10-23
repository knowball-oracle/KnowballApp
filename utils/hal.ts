import type { HalCollection } from '@/types/api';

/**
 * Lê `_embedded[key]` de uma lista HAL. A API omite `_embedded` quando a lista
 * está vazia, então devolve [] nesse caso.
 */
export function embedded<T, K extends string>(res: HalCollection<K, T> | null | undefined, key: K): T[] {
  return res?._embedded?.[key] ?? [];
}

/** Remove `_links` de uma entidade HAL (EntityModel). */
export function stripLinks<T extends object>(entity: T & { _links?: unknown }): T {
  const { _links, ...rest } = entity;
  return rest as T;
}
