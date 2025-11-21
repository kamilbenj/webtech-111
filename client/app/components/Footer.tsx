export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-800 bg-slate-950/90 py-5 text-center text-xs text-slate-500">
      © {new Date().getFullYear()} Gabriel DALIBERT · Rayan GAAD · Kamil
      BENJELLOUN · Built with Next.js &amp; TypeScript
    </footer>
  )
}