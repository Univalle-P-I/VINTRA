import { useEffect, useRef, useState } from "react"

const showAtOnce = () =>
  typeof IntersectionObserver === "undefined" ||
  (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)

/** Marca un elemento como visible al entrar en pantalla. Sin animación si el usuario prefiere menos movimiento. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(showAtOnce)

  useEffect(() => {
    if (visible || !ref.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.18 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [visible])

  return [ref, visible] as const
}
