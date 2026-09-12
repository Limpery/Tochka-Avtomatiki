import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Почему отдельный модуль: вся работа с секретами и хешами в одном месте,
// чтобы роутеры не трогали process.env и crypto напрямую.

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    // Почему throw, а не дефолт: иначе в проде тихо подпишем токены мусорным ключом.
    throw new Error('Переменная окружения JWT_SECRET не задана')
  }
  return secret
}

// Почему async+await в одну строку: eslint требует и async-функции, и тело без блока.
export const hashPassword = async (plain: string): Promise<string> => await bcrypt.hash(plain, 10)

export const verifyPassword = async (plain: string, hash: string): Promise<boolean> => await bcrypt.compare(plain, hash)

interface JwtPayload {
  userId: number
}

const isJwtPayload = (v: unknown): v is JwtPayload =>
  typeof v === 'object' && v !== null && 'userId' in v && typeof v.userId === 'number'

export const signJwt = (userId: number): string => {
  // Почему userId в payload, а не email: id стабилен, email пользователь может сменить.
  // Почему секунды числом: @types/jsonwebtoken принимает number | StringValue, число проходит tsc без assertion.
  const rawExpiresIn = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 604800)
  const expiresInSeconds = Number.isFinite(rawExpiresIn) && rawExpiresIn > 0 ? rawExpiresIn : 604800
  const options: jwt.SignOptions = { expiresIn: expiresInSeconds }
  return jwt.sign({ userId } satisfies JwtPayload, getJwtSecret(), options)
}

export const verifyJwt = (token: string): number | null => {
  try {
    // Почему проверка shape вместо assertion: битый токен может декодироваться во что угодно.
    const decoded: unknown = jwt.verify(token, getJwtSecret())
    return isJwtPayload(decoded) ? decoded.userId : null
  } catch {
    // Почему null вместо throw: истёкший/битый токен — штатная ситуация, ответит 401 выше по стеку.
    return null
  }
}

export const extractBearerToken = (header: string | undefined): string | null => {
  if (!header) {
    return null
  }
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return null
  }
  return token
}
