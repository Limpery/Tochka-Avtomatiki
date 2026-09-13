import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Prisma Decimal приходит строкой — поэтому принимаем string | number | null.
export function formatMoney(value: string | number | null | undefined, currency = 'RUB'): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) {
    return '—'
  }
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(num)
}

export function formatNumber(value: string | number | null | undefined, fractionDigits = 0): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) {
    return '—'
  }
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: fractionDigits }).format(num)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(new Date(value))
}

export const PRICING_MODEL_LABELS: Record<string, string> = {
  purchase: 'Покупка',
  lease: 'Аренда',
  raas: 'RaaS (робот как сервис)',
}

export const FREQUENCY_LABELS: Record<string, string> = {
  hourly: 'Ежечасно',
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
}
