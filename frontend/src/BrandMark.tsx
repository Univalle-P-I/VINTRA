export default function BrandMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M19.5 4.5c-6.2 0-11.9 1.2-14.2 4.8-2.1 3.2-.4 7.2 3.5 7.2 4.8 0 8.6-5.2 10.7-12Z"
        fill="currentColor"
      />
      <path
        d="M5.5 19c2.4-4 5.5-6.8 9.4-9"
        stroke="var(--brand-mark-cutout, #f5faf7)"
        strokeWidth="1.5"
      />
    </svg>
  )
}
