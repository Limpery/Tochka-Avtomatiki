import type { Response } from 'express'

// Почему единый формат: фронт и внешние клиенты разбирают ошибки одинаково,
// независимо от того, пришёл ответ из REST или из tRPC.
// eslint-disable-next-line @typescript-eslint/max-params -- единый формат требует все 5 полей в одном месте
export const sendApiError = (res: Response, status: number, code: string, message: string, details?: unknown) => {
  res.status(status).json({ error: { code, message, ...(details === undefined ? {} : { details }) } })
}
