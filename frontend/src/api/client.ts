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
  if (res.status === 401 || res.status === 403) {
    try { localStorage.removeItem('auth') } catch {}
    if (typeof window !== 'undefined') {
      const current = window.location.pathname + window.location.search
      window.location.replace(`/login?from=${encodeURIComponent(current)}`)
    }
  }
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


