'use client'

import { useState, useEffect } from 'react'
import { X, BookOpen, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

export interface JournalEntry {
  id: string
  type: 'insight' | 'reflection' | 'action'
  content: string
  context?: string
  timestamp: Date
}

interface UserProfile {
  name: string
  currentAge: number
  interests: string[]
  currentGoals: string
}

interface JournalProps {
  entries: JournalEntry[]
  isOpen: boolean
  onClose: () => void
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void
  onDeleteEntry: (id: string) => void
  profile?: UserProfile
}

// Generate personalized prompts based on user profile
function getPersonalizedPrompt(profile?: UserProfile): string {
  if (!profile) {
    return "What's on your mind today?"
  }

  const prompts = [
    `${profile.name}, what made you smile today?`,
    `What's something you learned about yourself recently?`,
    `How are you feeling about ${profile.currentGoals || 'your goals'}?`,
    `What's one thing you're proud of this week?`,
    `If you could tell your future self one thing, what would it be?`,
    `What's challenging you right now, and how are you handling it?`,
    `What's something you want to remember about today?`,
    `How have you grown since you started using NPC?`,
    `What's one small win you had recently?`,
    `What would make tomorrow amazing?`,
  ]

  // Add interest-based prompts
  if (profile.interests && profile.interests.length > 0) {
    const interest = profile.interests[Math.floor(Math.random() * profile.interests.length)]
    prompts.push(`How has ${interest} been going lately?`)
    prompts.push(`What's something new you discovered about ${interest}?`)
  }

  return prompts[Math.floor(Math.random() * prompts.length)]
}

export default function Journal({
  entries,
  isOpen,
  onClose,
  onAddEntry,
  onDeleteEntry,
  profile,
}: JournalProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState<{ type: 'insight' | 'reflection' | 'action'; content: string }>({ type: 'insight', content: '' })
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [personalizedPrompt, setPersonalizedPrompt] = useState('')

  // Generate a new prompt when journal opens
  useEffect(() => {
    if (isOpen) {
      setPersonalizedPrompt(getPersonalizedPrompt(profile))
    }
  }, [isOpen, profile])

  const handleAdd = () => {
    if (newEntry.content.trim()) {
      onAddEntry(newEntry)
      setNewEntry({ type: 'insight', content: '' })
      setShowAddForm(false)
    }
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedEntries(newExpanded)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const typeLabels = {
    insight: { label: 'Insight', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
    reflection: { label: 'Reflection', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    action: { label: 'Action Item', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-96 bg-slate-900/95 backdrop-blur-lg border-l border-white/10 z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold">My Journal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Personalized Prompt */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <p className="text-sm text-indigo-300 italic text-center">
            💭 {personalizedPrompt}
          </p>
        </div>

        {/* Add Entry Button */}
        <div className="p-4 border-b border-white/10">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-gray-300"
            >
              <Plus className="w-4 h-4" />
              Add a reflection
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                {(['insight', 'reflection', 'action'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewEntry({ ...newEntry, type })}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      newEntry.type === type
                        ? typeLabels[type].color
                        : 'border-white/10 text-gray-400'
                    }`}
                  >
                    {typeLabels[type].label}
                  </button>
                ))}
              </div>
              <textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                placeholder={
                  newEntry.type === 'insight' ? "Something I realized..."
                  : newEntry.type === 'reflection' ? "I'm thinking about..."
                  : "Something I want to do..."
                }
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newEntry.content.trim()}
                  className="flex-1 px-3 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Entries */}
        <div className="p-4 overflow-y-auto h-[calc(100%-280px)]">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Your journal is empty</p>
              <p className="text-sm text-gray-500 mt-2">
                Save insights, reflections, and action items from your conversations
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const isExpanded = expandedEntries.has(entry.id)
                const shouldTruncate = entry.content.length > 150

                return (
                  <div
                    key={entry.id}
                    className="glass rounded-lg p-4 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${typeLabels[entry.type].color}`}>
                        {typeLabels[entry.type].label}
                      </span>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-sm text-white/90 leading-relaxed">
                      {shouldTruncate && !isExpanded
                        ? entry.content.slice(0, 150) + '...'
                        : entry.content}
                    </p>

                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpand(entry.id)}
                        className="flex items-center gap-1 mt-2 text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        {isExpanded ? (
                          <>Show less <ChevronUp className="w-3 h-3" /></>
                        ) : (
                          <>Show more <ChevronDown className="w-3 h-3" /></>
                        )}
                      </button>
                    )}

                    {entry.context && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        From: {entry.context}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-slate-900/95">
          <button
            onClick={onClose}
            className="w-full mb-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Close Journal
          </button>
          <p className="text-xs text-gray-500 text-center">
            Your journal stays on this device
          </p>
        </div>
      </div>
    </>
  )
}

// Quick save component for chat messages
interface QuickSaveProps {
  content: string
  onSave: (type: 'insight' | 'reflection' | 'action', content: string) => void
}

export function QuickSavePopover({ content, onSave }: QuickSaveProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSave = (type: 'insight' | 'reflection' | 'action') => {
    onSave(type, content)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all"
        title="Save to journal"
      >
        <BookOpen className="w-3 h-3" />
      </button>
    )
  }

  return (
    <div className="absolute bottom-full right-0 mb-2 p-2 glass rounded-lg shadow-lg z-10 animate-fadeIn">
      <p className="text-xs text-gray-400 mb-2">Save as:</p>
      <div className="flex gap-1">
        <button
          onClick={() => handleSave('insight')}
          className="px-2 py-1 rounded text-xs bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
        >
          Insight
        </button>
        <button
          onClick={() => handleSave('reflection')}
          className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
        >
          Reflection
        </button>
        <button
          onClick={() => handleSave('action')}
          className="px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
        >
          Action
        </button>
      </div>
    </div>
  )
}
