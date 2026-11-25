import { useEffect, useState } from "react"
import { Icon } from "./ui"

export function useToast() {
  const [message, setMessage] = useState("")
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(""), 4000)
    return () => clearTimeout(t)
  }, [message])
  const toast = message ? (
    <div className="toast" role="status"><Icon name="check" />{message}</div>
  ) : null
  return { show: setMessage, toast }
}
