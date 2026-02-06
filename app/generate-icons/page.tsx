'use client'

import { useState } from 'react'

export default function GenerateIcons() {
  const [status, setStatus] = useState<string>('')

  const downloadIcon = async (size: number) => {
    setStatus(`Downloading ${size}x${size}...`)
    try {
      const response = await fetch(`/api/icon?size=${size}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `icon-${size}.png`
      a.click()
      URL.revokeObjectURL(url)
      setStatus(`Downloaded icon-${size}.png!`)
    } catch (err) {
      setStatus(`Error: ${err}`)
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FFB6C1' }}>
      <div
        className="max-w-md mx-auto p-6"
        style={{
          backgroundColor: 'white',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '8px 8px 0 black',
        }}
      >
        <h1 className="text-2xl font-bold mb-4">Download Icons for PWABuilder</h1>
        <p className="mb-4 text-sm">Click each button to download the required icon sizes:</p>

        <div className="space-y-3">
          {[192, 512].map((size) => (
            <button
              key={size}
              onClick={() => downloadIcon(size)}
              className="w-full py-3 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: '#90EE90',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '4px 4px 0 black',
              }}
            >
              Download {size}x{size} icon
            </button>
          ))}
        </div>

        {status && (
          <p className="mt-4 text-center text-sm font-bold">{status}</p>
        )}

        <div className="mt-6 p-3 text-xs" style={{ backgroundColor: '#FFFACD', border: '2px dashed black', borderRadius: '8px' }}>
          <p className="font-bold mb-1">Then in PWABuilder:</p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>Click "Add a 192x192 PNG icon"</li>
            <li>Upload the downloaded icon-192.png</li>
            <li>Click "Add a 512x512 PNG icon"</li>
            <li>Upload the downloaded icon-512.png</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
