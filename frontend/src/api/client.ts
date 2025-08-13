const getBaseUrl = () => {
  return (
    import.meta.env.VITE_API_URL ||
    (import.meta as any).env?.REACT_APP_API_URL ||
    'http://localhost:3001'
  )
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(errText || `Request failed with status ${res.status}`)
  }

  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return res.json()
  }
  // @ts-expect-error allow empty
  return null
}


