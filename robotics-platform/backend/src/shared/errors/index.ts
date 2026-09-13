// Единый набор ошибок приложения. Глобальный обработчик (plugins/error-handler.ts)
// превращает их в ответ формата { error: { code, message, details? } }.

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = new.target.name
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Ошибка валидации', details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Требуется авторизация', code = 'UNAUTHORIZED') {
    super(401, code, message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Доступ запрещён') {
    super(403, 'FORBIDDEN', message)
  }
}

export class NotFoundError extends AppError {
  constructor(entity = 'Объект', message?: string) {
    super(404, 'NOT_FOUND', message ?? `${entity} не найден`)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Конфликт данных', code = 'CONFLICT') {
    super(409, code, message)
  }
}
