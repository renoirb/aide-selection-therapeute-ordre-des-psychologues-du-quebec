/**
 * Sort function predicate.
 *
 * To help memory, here is the gist of how it should work;
 *
 * - If compareFunction(left, right) returns a value > than 0, sort right before left.
 * - If compareFunction(left, right) returns a value < than 0, sort left before b.
 * - If compareFunction(left, right) returns 0, left and right are considered equal.
 *
 * Source:
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 */
export type ISortFnPredicate<T> = (left: T, right: T) => -1 | 1 | 0

/**
 * Bucket in which to keep the decisions taken.
 *
 * One LocalStorage key per grouping.
 */
export interface ILocalStorageAdapter<T = string | number> {
  readonly storageKey: string
  readonly items: T[]
  add(item: T): void
  remove(item: T): void
}

export const fromPsyIdToUrl = (id: string): string =>
  `https://www.ordrepsy.qc.ca/voir/psychologue/${id}`

export const fromUrlToPsyId = (url: string): string =>
  url.replace('https://www.ordrepsy.qc.ca/voir/psychologue/', '')

export const localStorageAdapter = <T = unknown>(
  storageKey: string,
  w: WindowProxy,
): ILocalStorageAdapter<T> => {
  const initially = w.localStorage.getItem(storageKey)
  const initiallyEmpty = initially === null
  const duplicates = (items: T[]): T[] => {
    const unique = new Set(items)
    const collected = items.filter((k: T) => {
      if (unique.has(k)) {
        unique.delete(k)
        return false
      } else {
        return true
      }
    })
    return collected
  }
  const getItems = (k: string): T[] => {
    const stringified = w.localStorage.getItem(k) ?? '[]'
    const items: T[] = []
    if (initiallyEmpty === false) {
      try {
        const parsed = JSON.parse(stringified) as T[]
        items.push(...parsed)
      } catch (e) {
        console.log(
          `Something went wrong on LocalStorage.getItem("${storageKey}")`,
          e,
        )
      }
    }
    return items
  }
  // initial state at call time
  const _initialStateItems: T[] = getItems(storageKey)
  if (initiallyEmpty) {
    w.localStorage.setItem(storageKey, JSON.stringify(_initialStateItems))
  }

  const out: ILocalStorageAdapter<T> = {
    storageKey,
    get items(): T[] {
      const items = getItems(storageKey)
      return items
    },
    add(item: T) {
      const before = getItems(storageKey)
      const items = before.filter((k: T) => k !== item).sort()
      const foundDuplicates = duplicates(items)
      if (foundDuplicates.includes(item)) {
        console.log(`${storageKey} add(${item}), found duplicate, not adding`, {
          foundDuplicates,
        })
      } else {
        items.push(item)
        w.localStorage.setItem(storageKey, JSON.stringify(items))
      }
    },
    remove(item: T) {
      const before = getItems(storageKey)
      const items = before.filter((k: T) => k !== item).sort()
      const foundDuplicates = duplicates(items)
      if (foundDuplicates.includes(item)) {
        console.log(`${storageKey} remove(${item}), found duplicate`, {
          foundDuplicates,
        })
      }
      w.localStorage.setItem(storageKey, JSON.stringify(items))
    },
  }
  Object.freeze(out.storageKey)
  return out
}

export const VALID_VERDICTS = ['candidate', 'no', 'maybe', 'maybe_not'] as const

const VERDICTS = new Set(VALID_VERDICTS)

/**
 * Cette clé va dire dans quel {@link ILocalStorageAdapter.storageKey | clée ILocalStorageAdapter.storageKey} mettre.
 */
export type IVerdict = typeof VALID_VERDICTS[number]

export const isVerdict = (v: unknown): v is IVerdict =>
  VERDICTS.has(v as IVerdict)

/**
 * Pour cette option, quelle décision sera prise.
 *
 * Ajoutons-nous comme un candidat?
 * Est-ce qu'il ne répond pas a ce que nous recherchons (no-match)?
 */
export interface IPriseDeDecision {
  id: string
  decision: IVerdict
  /**
   * When checking a box, this is maybe to consider because of experience in
   */
  domain?: string
}

export const dispatchPriseDeDecisionEvent = (
  host: HTMLElement,
  detail: IPriseDeDecision,
) => {
  host.dispatchEvent(
    new CustomEvent<IPriseDeDecision>('prise-de-decision', {
      bubbles: true,
      composed: true,
      detail,
    }),
  )
}
