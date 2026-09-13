'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  CreateProcessInput,
  CreateProjectInput,
  EconomicCalculation,
  Project,
  ProjectMatch,
  ProjectProcess,
  UpdateProjectInput,
} from '@/types'

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: number) => ['projects', id] as const,
  matches: (id: number) => ['projects', id, 'matches'] as const,
  economics: (id: number, solutionId: number) => ['projects', id, 'economics', solutionId] as const,
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: async () => (await api.get<Project[]>('/projects')).data,
  })
}

export function useProject(id: number) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => (await api.get<Project>(`/projects/${id}`)).data,
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => (await api.post<Project>('/projects', input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export function useUpdateProject(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateProjectInput) => (await api.patch<Project>(`/projects/${id}`, input)).data,
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(id), project)
      void queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => (await api.delete<{ success: boolean }>(`/projects/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export function useAddProcess(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateProcessInput) =>
      (await api.post<ProjectProcess>(`/projects/${projectId}/processes`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
  })
}

export function useDeleteProcess(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (processId: number) =>
      (await api.delete<{ success: boolean }>(`/projects/${projectId}/processes/${processId}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
  })
}

export function useMatches(projectId: number) {
  return useQuery({
    queryKey: projectKeys.matches(projectId),
    queryFn: async () => (await api.get<ProjectMatch[]>(`/projects/${projectId}/matches`)).data,
    enabled: Number.isFinite(projectId) && projectId > 0,
  })
}

export function useGenerateMatches(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => (await api.post<ProjectMatch[]>(`/projects/${projectId}/matches`)).data,
    onSuccess: (matches) => {
      queryClient.setQueryData(projectKeys.matches(projectId), matches)
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

export function useEconomics(projectId: number, solutionId: number | null) {
  return useQuery({
    queryKey: projectKeys.economics(projectId, solutionId ?? 0),
    queryFn: async () =>
      (await api.get<EconomicCalculation>(`/projects/${projectId}/economics/${solutionId}`)).data,
    enabled: Boolean(solutionId) && projectId > 0,
  })
}
