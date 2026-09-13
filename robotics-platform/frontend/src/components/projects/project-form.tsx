'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { useBenchmarks } from '@/hooks/use-catalog'
import type { BenchmarkObject, CreateProjectInput, Project } from '@/types'

// Почему строки: input всегда отдаёт строку, конвертируем в число один раз на submit.
const numericString = z
  .string()
  .trim()
  .refine((v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Введите неотрицательное число')

const schema = z.object({
  name: z.string().trim().min(1, 'Укажите название проекта').max(200),
  description: z.string().max(2000),
  benchmarkObjectId: z.string(),
  areaSqm: numericString,
  employeeCount: numericString,
  shiftCount: numericString,
  operatingHours: numericString,
  monthlyFund: numericString,
})
type FormValues = z.infer<typeof schema>

const toNumber = (v: string): number | null => (v === '' ? null : Number(v))
const toStr = (v: string | number | null | undefined): string => (v === null || v === undefined ? '' : String(v))

interface ProjectFormProps {
  objectTypeId: number
  initial?: Project
  submitLabel?: string
  loading?: boolean
  onSubmit: (input: Omit<CreateProjectInput, 'objectTypeId'>) => void
}

function readBenchmarkNumber(data: Record<string, unknown>, key: string): string {
  const value = data[key]
  return typeof value === 'number' ? String(value) : ''
}

export function ProjectForm({ objectTypeId, initial, submitLabel = 'Создать проект', loading, onSubmit }: ProjectFormProps) {
  const benchmarks = useBenchmarks(objectTypeId)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      benchmarkObjectId: toStr(initial?.benchmarkObjectId),
      areaSqm: toStr(initial?.areaSqm),
      employeeCount: toStr(initial?.employeeCount),
      shiftCount: toStr(initial?.shiftCount),
      operatingHours: toStr(initial?.operatingHours),
      monthlyFund: toStr(initial?.monthlyFund),
    },
  })
  const errors = form.formState.errors
  const benchmarkId = form.watch('benchmarkObjectId')
  // Почему ref: при редактировании проекта эффект не должен затирать сохранённые значения на маунте.
  const prevBenchmarkId = useRef(benchmarkId)

  // Выбор эталона подставляет его параметры — пользователь может их поправить.
  useEffect(() => {
    if (prevBenchmarkId.current === benchmarkId) {
      return
    }
    prevBenchmarkId.current = benchmarkId
    if (!benchmarkId || !benchmarks.data) {
      return
    }
    const benchmark: BenchmarkObject | undefined = benchmarks.data.find((b) => String(b.id) === benchmarkId)
    if (!benchmark) {
      return
    }
    form.setValue('areaSqm', readBenchmarkNumber(benchmark.data, 'area_sqm'))
    form.setValue('employeeCount', readBenchmarkNumber(benchmark.data, 'employee_count'))
    form.setValue('shiftCount', readBenchmarkNumber(benchmark.data, 'shifts'))
    form.setValue('operatingHours', readBenchmarkNumber(benchmark.data, 'operating_hours'))
    form.setValue('monthlyFund', readBenchmarkNumber(benchmark.data, 'monthly_fund'))
  }, [benchmarkId, benchmarks.data, form])

  const submit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      description: values.description || undefined,
      benchmarkObjectId: values.benchmarkObjectId ? Number(values.benchmarkObjectId) : null,
      useBenchmark: Boolean(values.benchmarkObjectId),
      areaSqm: toNumber(values.areaSqm),
      employeeCount: toNumber(values.employeeCount),
      shiftCount: toNumber(values.shiftCount),
      operatingHours: toNumber(values.operatingHours),
      monthlyFund: toNumber(values.monthlyFund),
    })
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
      <FormField label="Название проекта" htmlFor="name" error={errors.name?.message}>
        <Input id="name" placeholder="Например: Склад в Казани" {...form.register('name')} />
      </FormField>

      <FormField label="Описание" htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" placeholder="Какие процессы хотите роботизировать" {...form.register('description')} />
      </FormField>

      <FormField
        label="Эталонный объект"
        htmlFor="benchmarkObjectId"
        hint="Подставит типовые параметры для этого типа объекта. Можно скорректировать вручную."
      >
        <Select id="benchmarkObjectId" {...form.register('benchmarkObjectId')} disabled={benchmarks.isLoading}>
          <option value="">Не использовать — введу параметры сам</option>
          {benchmarks.data?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Площадь, м²" htmlFor="areaSqm" error={errors.areaSqm?.message}>
          <Input id="areaSqm" type="number" min={0} step="any" {...form.register('areaSqm')} />
        </FormField>
        <FormField label="Численность персонала" htmlFor="employeeCount" error={errors.employeeCount?.message}>
          <Input id="employeeCount" type="number" min={0} step={1} {...form.register('employeeCount')} />
        </FormField>
        <FormField label="Количество смен" htmlFor="shiftCount" error={errors.shiftCount?.message}>
          <Input id="shiftCount" type="number" min={1} max={4} step={1} {...form.register('shiftCount')} />
        </FormField>
        <FormField label="Часов работы в сутки" htmlFor="operatingHours" error={errors.operatingHours?.message}>
          <Input id="operatingHours" type="number" min={0} max={24} step="any" {...form.register('operatingHours')} />
        </FormField>
        <FormField
          label="Месячный фонд оплаты труда, ₽"
          htmlFor="monthlyFund"
          error={errors.monthlyFund?.message}
          className="sm:col-span-2"
        >
          <Input id="monthlyFund" type="number" min={0} step="any" {...form.register('monthlyFund')} />
        </FormField>
      </div>

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  )
}
