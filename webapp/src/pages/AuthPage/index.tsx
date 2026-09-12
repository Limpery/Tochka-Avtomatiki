import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import z from 'zod'
import { useAuthStore } from '../../stores/authStore'
import { getLoginRoute, getRegisterRoute } from '../../lib/routes'
import { Segment } from '../../components/Segment'
import { Button } from '../../components/Button'

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
      <div>
        {mode === 'register' && (
          <label>
            Имя{' '}
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
            />
          </label>
        )}{' '}
        <label>
          Email{' '}
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
            }}
          />
        </label>{' '}
        <label>
          Пароль{' '}
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
          />
        </label>
      </div>
      {(formError ?? error) && <div style={{ color: 'red' }}>{formError ?? error}</div>}
      <div style={{ marginTop: 12 }}>
        <Button
          loading={pending}
          onClick={() => {
            void submit()
          }}
        >
          {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
        </Button>{' '}
        {mode === 'login' ? (
          <Link to={getRegisterRoute()}>Нет аккаунта? Зарегистрироваться</Link>
        ) : (
          <Link to={getLoginRoute()}>Уже есть аккаунт? Войти</Link>
        )}
      </div>
    </Segment>
  )
}
