import { create } from 'zustand'

// Выбор решений для сравнения на шаге 2. Живёт только в памяти: после перезагрузки
// пользователь начинает подбор заново, что для MVP приемлемо.
interface SelectionState {
  selectedByProject: Record<number, number[]>
  toggle: (projectId: number, solutionId: number) => void
  clear: (projectId: number) => void
  getSelected: (projectId: number) => number[]
}

export const useSelectionStore = create<SelectionState>()((set, get) => ({
  selectedByProject: {},
  toggle: (projectId, solutionId) =>
    set((state) => {
      const current = state.selectedByProject[projectId] ?? []
      const next = current.includes(solutionId)
        ? current.filter((id) => id !== solutionId)
        : [...current, solutionId]
      return { selectedByProject: { ...state.selectedByProject, [projectId]: next } }
    }),
  clear: (projectId) =>
    set((state) => ({ selectedByProject: { ...state.selectedByProject, [projectId]: [] } })),
  getSelected: (projectId) => get().selectedByProject[projectId] ?? [],
}))
