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
    if (res.status === 401) {
      try { localStorage.removeItem('auth') } catch {}
      if (typeof window !== 'undefined') {
        const current = window.location.pathname + window.location.search
        window.location.replace(`/login?from=${encodeURIComponent(current)}`)
      }
      // Throw an empty error to avoid flashing error text while redirecting
      throw new Error('')
    }

    if (res.status === 403) {
      let message = ''
      try {
        const data = await res.clone().json()
        message = (data && (data.error || data.message)) || ''
      } catch {
        try {
          message = await res.clone().text()
        } catch {}
      }
      if (/invalid|expired/i.test(message)) {
        try { localStorage.removeItem('auth') } catch {}
        if (typeof window !== 'undefined') {
          const current = window.location.pathname + window.location.search
          window.location.replace(`/login?from=${encodeURIComponent(current)}`)
        }
        throw new Error('')
      }
    }

    let message = ''
    try {
      const data = await res.json()
      message = (data && (data.error || data.message)) || ''
    } catch {
      console.log("Not a good response")
    }
    if (!message) {
      message = await res.text().catch(() => '')
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