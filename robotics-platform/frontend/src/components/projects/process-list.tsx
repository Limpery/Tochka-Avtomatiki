'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAddProcess, useDeleteProcess } from '@/hooks/use-projects'
import { FREQUENCY_LABELS, formatMoney, formatNumber } from '@/lib/utils'
import type { ProjectProcess } from '@/types'

const schema = z.object({
  processName: z.string().trim().min(1, 'Укажите название').max(200),
  currentCost: z.string().trim(),
  currentHours: z.string().trim(),
  employeeCount: z.string().trim(),
  frequency: z.enum(['', 'hourly', 'daily', 'weekly', 'monthly']),
})
type FormValues = z.infer<typeof schema>

const toNumber = (v: string): number | null => (v === '' ? null : Number(v))

// Бизнес-процессы объекта: то, что планируется роботизировать. Пока используются только как описание.
export function ProcessList({ projectId, processes }: { projectId: number; processes: ProjectProcess[] }) {
  const [open, setOpen] = useState(false)
  const addProcess = useAddProcess(projectId)
  const deleteProcess = useDeleteProcess(projectId)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { processName: '', currentCost: '', currentHours: '', employeeCount: '', frequency: 'daily' },
  })

  const submit = (values: FormValues) => {
    addProcess.mutate(
      {
        processName: values.processName,
        currentCost: toNumber(values.currentCost),
        currentHours: toNumber(values.currentHours),
        employeeCount: toNumber(values.employeeCount),
        frequency: values.frequency || null,
      },
      {
        onSuccess: () => {
          form.reset()
          setOpen(false)
        },
      },
    )
  }

  return (
    <div className="space-y-4">
      {processes.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Процесс</TableHead>
              <TableHead>Стоимость / мес</TableHead>
              <TableHead>Часов / день</TableHead>
              <TableHead>Людей</TableHead>
              <TableHead>Частота</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.processName}</TableCell>
                <TableCell>{formatMoney(p.currentCost)}</TableCell>
                <TableCell>{formatNumber(p.currentHours, 1)}</TableCell>
                <TableCell>{p.employeeCount ?? '—'}</TableCell>
                <TableCell>{p.frequency ? (FREQUENCY_LABELS[p.frequency] ?? p.frequency) : '—'}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Удалить процесс"
                    onClick={() => deleteProcess.mutate(p.id)}
                    disabled={deleteProcess.isPending}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">Процессы не добавлены.</p>
      )}

      {open ? (
        <form onSubmit={form.handleSubmit(submit)} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
          <FormField
            label="Название"
            htmlFor="processName"
            error={form.formState.errors.processName?.message}
            className="sm:col-span-2"
          >
            <Input id="processName" placeholder="Комплектация заказов" {...form.register('processName')} />
          </FormField>
          <FormField label="Стоимость в месяц, ₽" htmlFor="currentCost">
            <Input id="currentCost" type="number" min={0} step="any" {...form.register('currentCost')} />
          </FormField>
          <FormField label="Часов в день" htmlFor="currentHours">
            <Input id="currentHours" type="number" min={0} step="any" {...form.register('currentHours')} />
          </FormField>
          <FormField label="Занято сотрудников" htmlFor="employeeCount">
            <Input id="employeeCount" type="number" min={0} step={1} {...form.register('employeeCount')} />
          </FormField>
          <FormField label="Частота" htmlFor="frequency">
            <Select id="frequency" {...form.register('frequency')}>
              <option value="">Не указано</option>
              {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" size="sm" loading={addProcess.isPending}>
              Добавить
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus />
          Добавить процесс
        </Button>
      )}
    </div>
  )
}
