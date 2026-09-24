export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-[var(--line)] px-4 pb-14 pt-10 text-[var(--sea-ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">
          &copy; {year} MMO
        </p>
        
      </div>
      <div className="mt-4 flex justify-center gap-4">
        <a
          href="https://hockey.nl"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
        >
          <span className="sr-only">Details op hockey.nl</span>
          
<svg width="40" height="40" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
  <path fill="#00a651" d="M60 4 C40 4 24 8 16 12 L16 62 C16 90 33 112 60 132 C87 112 104 90 104 62 L104 12 C96 8 80 4 60 4 Z"/>
  <circle cx="60" cy="60" r="35" fill="#ffffff"/>
<path
  fill="#00a651"
  d="
    M90 25
    L95 30
    L60 65
    Q50 75 40 75
    L30 75
    Q25 75 25 70
    L25 65
    L35 65
    L35 70
    Q35 71 36 71
    L40 71
    Q48 71 55 64
    L90 25
    Z"
/>

</svg>






        </a>
        
      </div>
    </footer>
  )
}
