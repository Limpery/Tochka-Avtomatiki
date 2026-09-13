'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRegister } from '@/hooks/use-auth'
import { getApiErrorMessage } from '@/lib/api'

const schema = z
  .object({
    name: z.string().min(1, 'Укажите имя').max(100),
    company: z.string().max(200).optional(),
    email: z.string().email('Некорректный email'),
    password: z.string().min(8, 'Пароль не короче 8 символов'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Пароли не совпадают' })
type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const register = useRegister()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', company: '', email: '', password: '', confirm: '' },
  })
  const errors = form.formState.errors

  return (
    <Card>
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>Создайте аккаунт, чтобы сохранять проекты и сравнения</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(({ confirm: _confirm, company, ...values }) =>
            register.mutate({ ...values, company: company || undefined }),
          )}
          className="space-y-4"
        >
          <FormField label="Имя" htmlFor="name" error={errors.name?.message}>
            <Input id="name" autoComplete="name" {...form.register('name')} />
          </FormField>
          <FormField label="Компания" htmlFor="company" error={errors.company?.message}>
            <Input id="company" autoComplete="organization" {...form.register('company')} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          </FormField>
          <FormField label="Пароль" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="new-password" {...form.register('password')} />
          </FormField>
          <FormField label="Повторите пароль" htmlFor="confirm" error={errors.confirm?.message}>
            <Input id="confirm" type="password" autoComplete="new-password" {...form.register('confirm')} />
          </FormField>
          {register.isError && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{getApiErrorMessage(register.error)}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" loading={register.isPending}>
            Создать аккаунт
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Войти
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
