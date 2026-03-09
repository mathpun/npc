'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface JournalPrompt {
  id: string
  prompt: string
  emoji: string
}

interface JournalEntry {
  id: number
  entry_type: string
  prompt_id: string | null
  content: string
  voice_url: string | null
  mood: string | null
  created_at: string
}

interface GratitudeJournalProps {
  userId: string
}

export default function GratitudeJournal({ userId }: GratitudeJournalProps) {
  const { theme } = useTheme()
  const [mode, setMode] = useState<'home' | 'write' | 'history'>('home')
  const [currentPrompt, setCurrentPrompt] = useState<JournalPrompt | null>(null)
  const [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [streak, setStreak] = useState({ currentStreak: 0, totalEntries: 0, journaledToday: false })
  const [prompts, setPrompts] = useState<JournalPrompt[]>([])
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const moods = [
    { emoji: '😊', label: 'happy' },
    { emoji: '😌', label: 'calm' },
    { emoji: '🥰', label: 'grateful' },
    { emoji: '😔', label: 'sad' },
    { emoji: '😤', label: 'frustrated' },
    { emoji: '😴', label: 'tired' },
    { emoji: '🤔', label: 'thoughtful' },
    { emoji: '✨', label: 'inspired' },
  ]

  useEffect(() => {
    fetchJournalData()
  }, [userId])

  const fetchJournalData = async () => {
    try {
      const res = await fetch(`/api/journal?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data.entries || [])
        setStreak(data.streak || { currentStreak: 0, totalEntries: 0, journaledToday: false })
        setPrompts(data.prompts || [])
      }
    } catch (err) {
      console.error('Failed to fetch journal:', err)
    }
  }

  const getRandomPrompt = () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
    setCurrentPrompt(randomPrompt)
    setMode('write')
  }

  const startFreeWrite = () => {
    setCurrentPrompt(null)
    setMode('write')
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Failed to start recording:', err)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
  }

  const handleSubmit = async () => {
    if (!content.trim() && !audioBlob) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          entryType: currentPrompt ? 'prompt' : 'free',
          promptId: currentPrompt?.id || null,
          content: content.trim() || '[Voice entry]',
          mood: selectedMood,
          voiceUrl: audioBlob ? 'voice_recorded' : null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSuccessMessage(data.message)
        setShowSuccess(true)
        setStreak(data.streak)

        // Reset form
        setContent('')
        setAudioBlob(null)
        setAudioUrl(null)
        setSelectedMood(null)
        setCurrentPrompt(null)

        // Refresh entries
        fetchJournalData()

        // Show success briefly then go home
        setTimeout(() => {
          setShowSuccess(false)
          setMode('home')
        }, 2000)
      }
    } catch (err) {
      console.error('Failed to save entry:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  // Success screen
  if (showSuccess) {
    return (
      <div className="max-w-sm mx-auto px-3 py-8 text-center">
        <div className="text-6xl mb-4 animate-bounce">📝</div>
        <h2 className="text-2xl font-black mb-2">saved!</h2>
        <p className="text-sm opacity-80">{successMessage}</p>
        {streak.currentStreak > 1 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold"
            style={{ backgroundColor: theme.colors.accent2, border: '2px solid black' }}>
            🔥 {streak.currentStreak} day streak
          </div>
        )}
      </div>
    )
  }

  // Home screen
  if (mode === 'home') {
    return (
      <div className="max-w-sm mx-auto px-3 py-4">
        {/* Main Card */}
        <div
          className="rounded-2xl overflow-hidden mb-4"
          style={{
            border: '4px solid black',
            boxShadow: '6px 6px 0 black',
            background: `linear-gradient(180deg, #FFE4EC 0%, #E8D5FF 50%, #D5E8FF 100%)`,
          }}
        >
          {/* Header */}
          <div className="text-center py-4 px-4">
            <div className="text-4xl mb-2">📓</div>
            <h1 className="text-2xl font-black">my journal</h1>
            <p className="text-xs opacity-70">your private space to reflect</p>
          </div>

          {/* Streak & Stats */}
          <div className="grid grid-cols-3 gap-2 px-3 pb-3">
            <div
              className="p-2.5 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.6)', border: '2px solid black' }}
            >
              <div className="text-xl font-black">{streak.currentStreak}🔥</div>
              <div className="text-[10px] font-bold opacity-70">streak</div>
            </div>
            <div
              className="p-2.5 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.6)', border: '2px solid black' }}
            >
              <div className="text-xl font-black">{streak.totalEntries}</div>
              <div className="text-[10px] font-bold opacity-70">entries</div>
            </div>
            <div
              className="p-2.5 rounded-xl text-center"
              style={{ backgroundColor: streak.journaledToday ? theme.colors.accent3 : 'rgba(255,255,255,0.6)', border: '2px solid black' }}
            >
              <div className="text-xl">{streak.journaledToday ? '✅' : '📝'}</div>
              <div className="text-[10px] font-bold opacity-70">today</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-3 pb-3 space-y-2">
            <button
              onClick={getRandomPrompt}
              className="w-full p-3.5 font-black text-base rounded-xl hover:scale-[1.02] active:scale-100 transition-transform flex items-center justify-center gap-2"
              style={{
                backgroundColor: theme.colors.accent1,
                border: '3px solid black',
                boxShadow: '4px 4px 0 black',
              }}
            >
              <span className="text-xl">🙏</span>
              gratitude prompt
            </button>

            <button
              onClick={startFreeWrite}
              className="w-full p-3.5 font-black text-base rounded-xl hover:scale-[1.02] active:scale-100 transition-transform flex items-center justify-center gap-2"
              style={{
                backgroundColor: theme.colors.accent4,
                border: '3px solid black',
                boxShadow: '4px 4px 0 black',
              }}
            >
              <span className="text-xl">✍️</span>
              free write
            </button>
          </div>

          {/* Footer */}
          <div
            className="text-center py-2 px-3 text-[10px] font-bold"
            style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
          >
            your thoughts are private · npc.chat
          </div>
        </div>

        {/* View History Button */}
        {entries.length > 0 && (
          <button
            onClick={() => setMode('history')}
            className="w-full p-3 font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            style={{
              backgroundColor: theme.colors.backgroundAlt,
              border: '3px solid black',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <span>📚</span>
            view past entries ({entries.length})
          </button>
        )}
      </div>
    )
  }

  // Write screen
  if (mode === 'write') {
    return (
      <div className="max-w-sm mx-auto px-3 py-4">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: '4px solid black',
            boxShadow: '6px 6px 0 black',
            backgroundColor: theme.colors.backgroundAlt,
          }}
        >
          {/* Header */}
          <div className="p-4 border-b-2 border-dashed border-black/30">
            <button
              onClick={() => { setMode('home'); setContent(''); setAudioBlob(null); setAudioUrl(null); }}
              className="text-sm font-bold opacity-60 hover:opacity-100 mb-2"
            >
              ← back
            </button>
            {currentPrompt ? (
              <div className="text-center">
                <span className="text-3xl mb-2 block">{currentPrompt.emoji}</span>
                <p className="font-bold text-lg leading-tight">{currentPrompt.prompt}</p>
                <button
                  onClick={getRandomPrompt}
                  className="mt-2 text-xs font-bold opacity-60 hover:opacity-100"
                >
                  🔄 different prompt
                </button>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-3xl mb-2 block">✍️</span>
                <p className="font-bold text-lg">free write</p>
                <p className="text-xs opacity-60">write whatever's on your mind</p>
              </div>
            )}
          </div>

          {/* Mood selector */}
          <div className="p-3 border-b-2 border-dashed border-black/30">
            <p className="text-xs font-bold mb-2 opacity-70">how are you feeling?</p>
            <div className="flex flex-wrap gap-1.5">
              {moods.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(selectedMood === mood.label ? null : mood.label)}
                  className={`px-2.5 py-1 text-sm rounded-lg transition-transform hover:scale-105 ${selectedMood === mood.label ? 'scale-110' : ''}`}
                  style={{
                    backgroundColor: selectedMood === mood.label ? theme.colors.accent2 : 'rgba(0,0,0,0.05)',
                    border: selectedMood === mood.label ? '2px solid black' : '2px solid transparent',
                  }}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Text input */}
          <div className="p-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              className="w-full h-40 p-3 text-sm rounded-xl resize-none"
              style={{ border: '2px solid black', backgroundColor: 'white' }}
            />
          </div>

          {/* Voice recording */}
          <div className="px-3 pb-3">
            <p className="text-xs font-bold mb-2 opacity-70">or record your thoughts</p>

            {!audioUrl ? (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full p-3 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${isRecording ? 'animate-pulse' : ''}`}
                style={{
                  backgroundColor: isRecording ? '#FF6B6B' : theme.colors.accent3,
                  border: '2px solid black',
                  boxShadow: '3px 3px 0 black',
                  color: isRecording ? 'white' : 'black',
                }}
              >
                <span className="text-lg">{isRecording ? '⏹️' : '🎙️'}</span>
                {isRecording ? 'stop recording' : 'start voice note'}
              </button>
            ) : (
              <div className="space-y-2">
                <audio src={audioUrl} controls className="w-full h-10" />
                <button
                  onClick={deleteRecording}
                  className="w-full p-2 text-xs font-bold rounded-lg opacity-60 hover:opacity-100"
                  style={{ border: '2px solid black' }}
                >
                  🗑️ delete recording
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="p-3 border-t-2 border-dashed border-black/30">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && !audioBlob)}
              className="w-full p-3.5 font-black text-base rounded-xl hover:scale-[1.02] active:scale-100 transition-transform disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.accent2,
                border: '3px solid black',
                boxShadow: '4px 4px 0 black',
              }}
            >
              {isSubmitting ? 'saving...' : '💾 save entry'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // History screen
  if (mode === 'history') {
    return (
      <div className="max-w-sm mx-auto px-3 py-4">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: '4px solid black',
            boxShadow: '6px 6px 0 black',
            backgroundColor: theme.colors.backgroundAlt,
          }}
        >
          {/* Header */}
          <div className="p-4 border-b-2 border-dashed border-black/30">
            <button
              onClick={() => setMode('home')}
              className="text-sm font-bold opacity-60 hover:opacity-100 mb-2"
            >
              ← back
            </button>
            <h2 className="text-xl font-black text-center">📚 past entries</h2>
          </div>

          {/* Entries list */}
          <div className="max-h-96 overflow-y-auto">
            {entries.map((entry) => {
              const prompt = prompts.find(p => p.id === entry.prompt_id)
              return (
                <div
                  key={entry.id}
                  className="p-3 border-b border-black/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{prompt?.emoji || '✍️'}</span>
                    <span className="text-xs font-bold opacity-60">{formatDate(entry.created_at)}</span>
                    {entry.mood && <span className="text-sm">{moods.find(m => m.label === entry.mood)?.emoji}</span>}
                    {entry.voice_url && <span className="text-sm">🎙️</span>}
                  </div>
                  {prompt && (
                    <p className="text-xs font-bold opacity-70 mb-1">{prompt.prompt}</p>
                  )}
                  <p className="text-sm leading-relaxed">{entry.content}</p>
                </div>
              )
            })}
          </div>

          {entries.length === 0 && (
            <div className="p-8 text-center opacity-60">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm">no entries yet - start writing!</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
