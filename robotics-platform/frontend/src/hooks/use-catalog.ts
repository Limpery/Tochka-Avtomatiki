'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  BenchmarkObject,
  Industry,
  ObjectType,
  Solution,
  SolutionCategory,
  SolutionDetail,
  SolutionFilters,
  Tag,
  Vendor,
} from '@/types'

export const catalogKeys = {
  industries: ['industries'] as const,
  objectTypes: (industryId?: number) => ['object-types', industryId ?? 'all'] as const,
  categories: ['solution-categories'] as const,
  tags: ['tags'] as const,
  vendors: ['vendors'] as const,
  solutions: (filters: SolutionFilters) => ['solutions', filters] as const,
  solution: (id: number) => ['solutions', id] as const,
  benchmarks: (objectTypeId?: number) => ['benchmarks', objectTypeId ?? 'all'] as const,
}

export function useIndustries() {
  return useQuery({
    queryKey: catalogKeys.industries,
    queryFn: async () => (await api.get<Industry[]>('/industries')).data,
    staleTime: 10 * 60 * 1000,
  })
}

export function useObjectTypes(industryId?: number) {
  return useQuery({
    queryKey: catalogKeys.objectTypes(industryId),
    queryFn: async () =>
      (await api.get<ObjectType[]>('/object-types', { params: industryId ? { industryId } : undefined })).data,
    staleTime: 10 * 60 * 1000,
  })
}

export function useSolutionCategories() {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: async () => (await api.get<SolutionCategory[]>('/solution-categories')).data,
    staleTime: 10 * 60 * 1000,
  })
}

export function useTags() {
  return useQuery({
    queryKey: catalogKeys.tags,
    queryFn: async () => (await api.get<Tag[]>('/tags')).data,
    staleTime: 10 * 60 * 1000,
  })
}

export function useVendors() {
  return useQuery({
    queryKey: catalogKeys.vendors,
    queryFn: async () => (await api.get<Vendor[]>('/vendors')).data,
    staleTime: 10 * 60 * 1000,
  })
}

export function useSolutions(filters: SolutionFilters, enabled = true) {
  return useQuery({
    queryKey: catalogKeys.solutions(filters),
    queryFn: async () => {
      // tagIds backend ждёт строкой "1,2,3"
      const params = {
        ...filters,
        tagIds: filters.tagIds && filters.tagIds.length > 0 ? filters.tagIds.join(',') : undefined,
        search: filters.search || undefined,
      }
      return (await api.get<Solution[]>('/solutions', { params })).data
    },
    enabled,
  })
}

export function useSolution(id: number | null) {
  return useQuery({
    queryKey: catalogKeys.solution(id ?? 0),
    queryFn: async () => (await api.get<SolutionDetail>(`/solutions/${id}`)).data,
    enabled: Boolean(id),
  })
}

export function useBenchmarks(objectTypeId?: number) {
  return useQuery({
    queryKey: catalogKeys.benchmarks(objectTypeId),
    queryFn: async () =>
      (await api.get<BenchmarkObject[]>('/benchmarks', { params: objectTypeId ? { objectTypeId } : undefined })).data,
    enabled: objectTypeId !== undefined,
  })
}
