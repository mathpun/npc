import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const size = parseInt(searchParams.get('size') || '512')

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FF69B4',
          borderRadius: size * 0.2,
        }}
      >
        <svg
          width={size * 0.7}
          height={size * 0.7}
          viewBox="0 0 60 70"
        >
          {/* Body */}
          <ellipse cx="30" cy="50" rx="22" ry="28" fill="#FFD700" stroke="black" strokeWidth="3"/>
          {/* Head */}
          <circle cx="30" cy="22" r="20" fill="white" stroke="black" strokeWidth="3"/>
          {/* Eyes */}
          <circle cx="23" cy="20" r="5" fill="black"/>
          <circle cx="37" cy="20" r="5" fill="black"/>
          {/* Eye highlights */}
          <circle cx="24" cy="18" r="2" fill="white"/>
          <circle cx="38" cy="18" r="2" fill="white"/>
          {/* Mouth */}
          <ellipse cx="30" cy="32" rx="4" ry="3" fill="black"/>
        </svg>
      </div>
    ),
    {
      width: size,
      height: size,
    }
  )
}
