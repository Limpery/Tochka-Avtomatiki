import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import z from 'zod'
import { useAuthStore } from '../../stores/authStore'
import { getLoginRoute, getRegisterRoute } from '../../lib/routes'
import { Segment } from '../../components/Segment'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Field } from '../../components/Field'
import css from './index.module.scss'

const zCredentials = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Пароль: минимум 8 символов'),
  name: z.string().max(100).optional(),
})

export const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const navigate = useNavigate()
  const { login, register, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const submit = async () => {
    // Почему Zod на клиенте дублирует сервер: мгновенная подсказка без round-trip,
    // сервер всё равно перепроверяет (доверять клиенту нельзя).
    const parsed = zCredentials.safeParse({ email, password, name: name || undefined })
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Проверьте форму')
      return
    }
    setFormError(null)
    setPending(true)
    const ok = mode === 'login' ? await login(email, password) : await register(email, password, name || undefined)
    setPending(false)
    if (ok) {
      void navigate('/projects')
    }
  }

  return (
    <Segment title={mode === 'login' ? 'Вход' : 'Регистрация'}>
      <Card className={css.authCard}>
        <div className={css.form}>
          {mode === 'register' && (
            <Field label="Имя">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
              />
            </Field>
          )}
          <Field label="Email">
            <input
              value={email}
              inputMode="email"
              onChange={(e) => {
                setEmail(e.target.value)
              }}
            />
          </Field>
          <Field label="Пароль">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
            />
          </Field>
        </div>
        {(formError ?? error) && <div className={css.error}>{formError ?? error}</div>}
        <div className={css.actions}>
          <Button
            loading={pending}
            onClick={() => {
              void submit()
            }}
          >
            {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </Button>
          {mode === 'login' ? (
            <Link className={css.link} to={getRegisterRoute()}>
              Нет аккаунта? Зарегистрироваться
            </Link>
          ) : (
            <Link className={css.link} to={getLoginRoute()}>
              Уже есть аккаунт? Войти
            </Link>
          )}
        </div>
      </Card>
    </Segment>
  )
}
