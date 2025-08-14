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
    // Try to extract a meaningful error message first
    let message = ''
    try {
      const data = await res.clone().json()
      message = (data && (data.error || data.message)) || ''
    } catch {
      // ignore
    }
    if (!message) {
      try { message = await res.text() } catch {}
    }

    // Auto-logout only for 401, or 403 specifically indicating invalid/expired token
    const isAuthExpired = res.status === 401 || (res.status === 403 && /invalid|expired token/i.test(message))
    if (isAuthExpired) {
      try { localStorage.removeItem('auth') } catch {}
      if (typeof window !== 'undefined') {
        const current = window.location.pathname + window.location.search
        window.location.replace(`/login?from=${encodeURIComponent(current)}`)
      }
      throw new Error('')
    }

    throw new Error(message || `Request failed with status ${res.status}`)
  }

  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return res.json()
  }
  // @ts-expect-error allow empty
  return null
}


