import axios from 'axios'
import { getAuthToken } from './authToken'

// Почему отдельный REST-клиент рядом с tRPC: контракт ТЗ требует /api/*
// (проекты, сравнения, matches, economics), tRPC покрывает каталог и витрину.
export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL ?? 'http://localhost:3000/api',
})

api.interceptors.request.use((config) => {
  // Почему interceptor, а не ручной header: токен подставляется во все запросы,
  // включая будущие, и исчезает после logout без правок call-сайтов.
  // Почему метод .set: headers в axios v1 — класс AxiosHeaders, spread терял бы прототип.
  const token = getAuthToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})
