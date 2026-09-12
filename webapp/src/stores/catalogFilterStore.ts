import { create } from 'zustand'

export interface CatalogFilters {
  search: string
  industrySlug: string
  objectTypeSlug: string
  categorySlug: string
  tagSlugs: string[]
  priceMin: string
  priceMax: string
}

const emptyFilters: CatalogFilters = {
  search: '',
  industrySlug: '',
  objectTypeSlug: '',
  categorySlug: '',
  tagSlugs: [],
  priceMin: '',
  priceMax: '',
}

interface CatalogFilterState {
  // Почему два слоя: drawer правит draft, а список запрашивает только applied —
  // иначе каждый клик по пилюле дёргал бы API до нажатия «Применить».
  // Поиск — исключение: применяется сразу, так удобнее.
  draft: CatalogFilters
  applied: CatalogFilters
  drawerOpen: boolean
  setDraft: (patch: Partial<CatalogFilters>) => void
  toggleTag: (slug: string) => void
  setSearch: (search: string) => void
  apply: () => void
  reset: () => void
  setDrawerOpen: (open: boolean) => void
}

export const useCatalogFilterStore = create<CatalogFilterState>()((set) => ({
  draft: emptyFilters,
  applied: emptyFilters,
  drawerOpen: false,

  setDraft: (patch) => {
    set((s) => ({ draft: { ...s.draft, ...patch } }))
  },

  toggleTag: (slug) => {
    set((s) => ({
      draft: {
        ...s.draft,
        tagSlugs: s.draft.tagSlugs.includes(slug)
          ? s.draft.tagSlugs.filter((t) => t !== slug)
          : [...s.draft.tagSlugs, slug],
      },
    }))
  },

  setSearch: (search) => {
    // Почему search сразу в applied: живой поиск без лишнего клика,
    // остальные фильтры по-прежнему требуют «Применить».
    set((s) => ({
      draft: { ...s.draft, search },
      applied: { ...s.applied, search },
    }))
  },

  apply: () => {
    set((s) => ({ applied: { ...s.draft }, drawerOpen: false }))
  },

  reset: () => {
    set({ draft: emptyFilters, applied: emptyFilters })
  },

  setDrawerOpen: (open) => {
    set({ drawerOpen: open })
  },
}))

// Сколько фильтров (кроме поиска) применено — для бейджа на кнопке-бургере.
export const countActiveFilters = (f: CatalogFilters): number => {
  let n = 0
  if (f.industrySlug) {
    n += 1
  }
  if (f.objectTypeSlug) {
    n += 1
  }
  if (f.categorySlug) {
    n += 1
  }
  if (f.tagSlugs.length > 0) {
    n += 1
  }
  if (f.priceMin || f.priceMax) {
    n += 1
  }
  return n
}
