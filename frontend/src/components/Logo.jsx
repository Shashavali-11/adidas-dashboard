export default function Logo({ dark = true }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-300 text-slate-900 shadow-[0_0_24px_-4px_rgba(190,242,100,.6)]">
        <svg viewBox="0 0 32 32" className="h-6 w-6"><path d="M4 25l7-12 4 6 6-11 4 7 3-5" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div>
        <p className={`text-base font-black leading-none tracking-[.12em] ${dark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>ADIDAS</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-widest text-slate-400">Sales Analytics</p>
      </div>
    </div>
  )
}
