'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Comparison, ComparisonSummary } from '@/types'

export const comparisonKeys = {
  list: (projectId?: number) => ['comparisons', projectId ?? 'all'] as const,
  detail: (id: number) => ['comparisons', 'detail', id] as const,
}

interface CreateComparisonInput {
  name?: string
  projectId?: number
  solutionIds?: number[]
}

export function useComparisons(projectId?: number) {
  return useQuery({
    queryKey: comparisonKeys.list(projectId),
    queryFn: async () =>
      (await api.get<ComparisonSummary[]>('/comparisons', { params: projectId ? { projectId } : undefined })).data,
  })
}

export function useComparison(id: number | null) {
  return useQuery({
    queryKey: comparisonKeys.detail(id ?? 0),
    queryFn: async () => (await api.get<Comparison>(`/comparisons/${id}`)).data,
    enabled: Boolean(id),
  })
}

export function useCreateComparison() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateComparisonInput) => (await api.post<Comparison>('/comparisons', input)).data,
    onSuccess: (comparison) => {
      queryClient.setQueryData(comparisonKeys.detail(comparison.id), comparison)
      void queryClient.invalidateQueries({ queryKey: ['comparisons'] })
    },
  })
}

export function useDeleteComparison() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => (await api.delete<{ success: boolean }>(`/comparisons/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comparisons'] }),
  })
}

export function useAddComparisonItem(comparisonId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (solutionId: number) =>
      (await api.post<Comparison>(`/comparisons/${comparisonId}/items`, { solutionId })).data,
    onSuccess: (comparison) => {
      queryClient.setQueryData(comparisonKeys.detail(comparisonId), comparison)
      void queryClient.invalidateQueries({ queryKey: ['comparisons'] })
    },
  })
}

export function useRemoveComparisonItem(comparisonId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (itemId: number) =>
      (await api.delete<Comparison>(`/comparisons/${comparisonId}/items/${itemId}`)).data,
    onSuccess: (comparison) => {
      queryClient.setQueryData(comparisonKeys.detail(comparisonId), comparison)
      void queryClient.invalidateQueries({ queryKey: ['comparisons'] })
    },
  })
}
