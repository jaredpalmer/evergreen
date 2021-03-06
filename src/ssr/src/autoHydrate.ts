import { rehydrate } from 'glamor'
import { hydrate as boxHydrate } from 'ui-box'

interface IHydration {
  uiBoxCache?: ReadonlyArray<ReadonlyArray<[string, string]>>
  glamorIds?: string[]
}

/**
 * You shouldn't have to manually run this.
 * This is mainly an export for testing purposes.
 */
export function hydrate(hydration: IHydration) {
  if (hydration.uiBoxCache) {
    boxHydrate(hydration.uiBoxCache)
  }

  if (hydration.glamorIds) {
    rehydrate(hydration.glamorIds)
  }
}

export default function autoHydrate() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const hydration = document.querySelector('#evergreen-hydrate')

    if (hydration) {
      try {
        const hydrationObject = JSON.parse(hydration.innerHTML)
        hydrate(hydrationObject)
      } catch (error) {
        console.error(
          'Evergreen automatic hydration object is invalid JSON',
          error
        )
      }
    }
  }
}
