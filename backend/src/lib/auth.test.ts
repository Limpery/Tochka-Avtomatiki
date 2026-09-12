import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { extractBearerToken, hashPassword, signJwt, verifyJwt, verifyPassword } from './auth'

// Почему node:test + tsx: нулевые зависимости (раннер встроен в Node 24),
// запуск через `tsx --test` без отдельного конфига vitest/jest.

void describe('password hashing', () => {
  void it('хеш проверяется верным паролем и отвергает неверный', async () => {
    const hash = await hashPassword('Test1234!')
    assert.equal(await verifyPassword('Test1234!', hash), true)
    assert.equal(await verifyPassword('wrong-pass', hash), false)
  })

  void it('два хеша одного пароля различаются (соль)', async () => {
    const [a, b] = await Promise.all([hashPassword('same-pass'), hashPassword('same-pass')])
    assert.notEqual(a, b)
  })
})

void describe('JWT', () => {
  void it('sign/verify возвращают исходный userId', () => {
    const token = signJwt(42)
    assert.equal(verifyJwt(token), 42)
  })

  void it('битый и чужой токены дают null, а не throw', () => {
    assert.equal(verifyJwt('not-a-token'), null)
    assert.equal(verifyJwt(''), null)
    const foreign = signJwt(7)
    // Почему портим подпись вручную: проверяем, что verify не доверяет структуре без секрета.
    const tampered = `${foreign.slice(0, -1)}x`
    assert.equal(verifyJwt(tampered), null)
  })

  void it('токен, подписанный другим секретом, отвергается', () => {
    const saved = process.env.JWT_SECRET
    const token = signJwt(9)
    try {
      process.env.JWT_SECRET = 'totally-different-secret'
      assert.equal(verifyJwt(token), null)
    } finally {
      // Почему restore в finally: падение assert не должно травить остальные тесты.
      process.env.JWT_SECRET = saved
    }
  })

  void it('sign без секрета бросает понятную ошибку', () => {
    const saved = process.env.JWT_SECRET
    try {
      delete process.env.JWT_SECRET
      assert.throws(() => {
        signJwt(1)
      }, /JWT_SECRET/v)
    } finally {
      process.env.JWT_SECRET = saved
    }
  })
})

void describe('extractBearerToken', () => {
  void it('разбирает корректный заголовок и отвергает мусор', () => {
    assert.equal(extractBearerToken('Bearer abc.def.ghi'), 'abc.def.ghi')
    assert.equal(extractBearerToken(undefined), null)
    assert.equal(extractBearerToken(''), null)
    assert.equal(extractBearerToken('Token abc'), null)
    assert.equal(extractBearerToken('Bearer'), null)
    assert.equal(extractBearerToken('Bearer '), null)
  })
})
