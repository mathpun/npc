'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t-3 border-black border-dashed py-4 px-4"
      style={{
        background: 'linear-gradient(180deg, #fff 0%, #f9f9f9 100%)',
        borderTop: '3px dashed black',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Main footer content */}
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <span className="text-2xl">👻</span>
            <span className="font-bold">npc</span>
          </Link>

          {/* Links - Row 1: Main links */}
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link
              href="/about"
              className="font-bold hover:scale-105 transition-transform px-2 py-1"
              style={{ color: '#666' }}
            >
              about
            </Link>
            <Link
              href="/chat?tab=growth&subtab=co-design"
              className="font-bold hover:scale-105 transition-transform px-2 py-1"
              style={{ color: '#666' }}
            >
              teen board
            </Link>
            <a
              href="https://forms.gle/iWyp8pUumivZDMxr7"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:scale-105 transition-transform px-2 py-1"
              style={{ color: '#FF6B6B' }}
            >
              roast us 🔥
            </a>
            <Link
              href="/privacy"
              className="font-bold hover:scale-105 transition-transform px-2 py-1"
              style={{ color: '#666' }}
            >
              privacy
            </Link>
            <Link
              href="/delete-account"
              className="font-bold hover:scale-105 transition-transform px-2 py-1"
              style={{ color: '#999' }}
            >
              delete account
            </Link>
          </div>

          {/* Social links */}
          <div className="flex justify-center gap-4">
            <a
              href="https://www.tiktok.com/@npcforme"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl hover:scale-110 transition-transform"
              title="TikTok"
            >
              📱
            </a>
            <a
              href="https://www.instagram.com/npcforme"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl hover:scale-110 transition-transform"
              title="Instagram"
            >
              📸
            </a>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-4 pt-3 border-t border-black/10 text-center">
          <p className="text-xs text-gray-500">
            made with 💚 for teens, by teens
          </p>
        </div>
      </div>
    </footer>
  )
}
