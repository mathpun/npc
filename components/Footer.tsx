'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t-3 border-black border-dashed py-6 px-4"
      style={{
        background: 'linear-gradient(180deg, #fff 0%, #f9f9f9 100%)',
        borderTop: '3px dashed black',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Main footer content */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <span className="text-2xl">👻</span>
            <span className="font-bold">npc</span>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/about"
              className="font-bold hover:scale-105 transition-transform"
              style={{ color: '#666' }}
            >
              about us
            </Link>
            <a
              href="https://forms.gle/iWyp8pUumivZDMxr7"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:scale-105 transition-transform"
              style={{ color: '#666' }}
            >
              roast us 🔥
            </a>
            <Link
              href="/privacy"
              className="font-bold hover:scale-105 transition-transform"
              style={{ color: '#666' }}
            >
              privacy
            </Link>
            <Link
              href="/chat?tab=growth&subtab=co-design"
              className="font-bold hover:scale-105 transition-transform"
              style={{ color: '#666' }}
            >
              co-design
            </Link>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-4 pt-4 border-t border-black/10 text-center">
          <p className="text-xs text-gray-500">
            made with 💚 for teens, by teens
          </p>
        </div>
      </div>
    </footer>
  )
}
