import bcrypt from 'bcryptjs'

// Почему bcryptjs, а не bcrypt: чистый JS без нативной сборки — pnpm 10 по умолчанию блокирует
// postinstall-скрипты, и на Windows нативный bcrypt регулярно ломает установку. Алгоритм тот же.
const SALT_ROUNDS = 10

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
