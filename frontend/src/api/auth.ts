import { apiFetch } from './client'

type LoginResponse = {
  token: string
  user: {
    id: string
    email: string
    role: 'REPORTER' | 'REVIEWER' | 'ADMIN'
  }
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}


