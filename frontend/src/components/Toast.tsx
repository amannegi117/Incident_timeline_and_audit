import { useEffect, useState } from 'react'

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="toast">{message}</div>
  )
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const show = (m: string) => setMsg(m)
  const hide = () => setMsg(null)
  const node = msg ? <Toast message={msg} onClose={hide} /> : null
  return { show, node }
}