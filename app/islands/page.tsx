'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import IslandsOfYou from '@/components/IslandsOfYou'

export default function IslandsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem('npc_user_id')
    if (!storedUserId) {
      router.push('/dashboard')
      return
    }
    setUserId(storedUserId)
  }, [router])

  if (!userId) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #4a2c7a 50%, #c77dba 100%)',
        }}
      >
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <IslandsOfYou
      userId={userId}
      onClose={() => router.push('/chat?tab=growth')}
    />
  )
}
