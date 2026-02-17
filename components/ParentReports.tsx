'use client'

import { useState, useEffect } from 'react'

interface ParentConnection {
  id: number
  parent_email: string
  parent_name: string | null
  connection_status: string
  verified_at: string | null
  created_at: string
}

interface ParentReport {
  id: number
  parent_connection_id: number | null
  report_type: string
  week_start: string
  week_end: string
  themes_discussed: string
  mood_summary: string
  growth_highlights: string
  engagement_stats: string
  teen_note: string | null
  status: string
  generated_at: string
  approved_at: string | null
  sent_at: string | null
  parent_email?: string
  parent_name?: string
}

interface ParentReportsProps {
  userId: string
  userName: string
}

export default function ParentReports({ userId, userName }: ParentReportsProps) {
  const [connections, setConnections] = useState<ParentConnection[]>([])
  const [reports, setReports] = useState<ParentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddParent, setShowAddParent] = useState(false)
  const [newParentEmail, setNewParentEmail] = useState('')
  const [newParentName, setNewParentName] = useState('')
  const [selectedReport, setSelectedReport] = useState<ParentReport | null>(null)
  const [editedReport, setEditedReport] = useState<Partial<ParentReport>>({})
  const [generating, setGenerating] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      const [connRes, repRes] = await Promise.all([
        fetch(`/api/parent/connect?userId=${userId}`),
        fetch(`/api/parent/report?userId=${userId}`)
      ])
      const connData = await connRes.json()
      const repData = await repRes.json()
      setConnections(connData.connections || [])
      setReports(repData.reports || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
    setLoading(false)
  }

  const addParentConnection = async () => {
    if (!newParentEmail) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/parent/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          parentEmail: newParentEmail,
          parentName: newParentName || null
        })
      })
      const data = await res.json()
      if (data.success) {
        setNewParentEmail('')
        setNewParentName('')
        setShowAddParent(false)
        fetchData()
      }
    } catch (err) {
      console.error('Failed to add parent:', err)
    }
    setActionLoading(false)
  }

  const removeConnection = async (connectionId: number) => {
    if (!confirm('Remove this parent connection?')) return
    try {
      await fetch(`/api/parent/connect?connectionId=${connectionId}&userId=${userId}`, {
        method: 'DELETE'
      })
      fetchData()
    } catch (err) {
      console.error('Failed to remove connection:', err)
    }
  }

  const generateReport = async (connectionId?: number) => {
    setGenerating(true)
    try {
      const res = await fetch('/api/parent/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, parentConnectionId: connectionId })
      })
      const data = await res.json()
      if (data.success) {
        fetchData()
        setSelectedReport(data.report)
        setEditedReport({})
      }
    } catch (err) {
      console.error('Failed to generate report:', err)
    }
    setGenerating(false)
  }

  const updateReport = async (action: string) => {
    console.log('[ParentReports] updateReport called with action:', action)
    console.log('[ParentReports] selectedReport:', selectedReport)
    console.log('[ParentReports] userId:', userId)

    if (!selectedReport) {
      console.error('[ParentReports] No selected report!')
      alert('Error: No report selected')
      return
    }
    if (!userId) {
      console.error('[ParentReports] No userId!')
      alert('Error: Not logged in')
      return
    }

    setActionLoading(true)
    try {
      console.log('[ParentReports] Making PATCH request to:', `/api/parent/report/${selectedReport.id}`)
      const res = await fetch(`/api/parent/report/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action,
          updates: Object.keys(editedReport).length > 0 ? editedReport : undefined
        })
      })
      const data = await res.json()
      console.log('[ParentReports] Response:', data)

      if (data.success) {
        alert(data.message || 'Success!')
        if (action === 'approve' || action === 'reject') {
          setSelectedReport(null)
        }
        fetchData()
      } else {
        alert('Error: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('[ParentReports] Failed to update report:', err)
      alert('Failed to update report: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
    setActionLoading(false)
  }

  const parseEngagementStats = (stats: string) => {
    try {
      return JSON.parse(stats)
    } catch {
      return { checkins: 0, sessions: 0, messages: 0 }
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-2xl animate-bounce">📊</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Parent Connections Section */}
      <div
        className="p-6"
        style={{
          backgroundColor: '#87CEEB',
          border: '4px solid black',
          borderRadius: '20px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">👨‍👩‍👧</span>
            <h2 className="text-xl font-bold">parent connections</h2>
          </div>
          <button
            onClick={() => setShowAddParent(!showAddParent)}
            className="px-4 py-2 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: '#90EE90',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            + add parent
          </button>
        </div>

        {/* Add Parent Form */}
        {showAddParent && (
          <div
            className="mb-4 p-4"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '12px',
            }}
          >
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold">parent&apos;s email</label>
                <input
                  type="email"
                  value={newParentEmail}
                  onChange={(e) => setNewParentEmail(e.target.value)}
                  placeholder="parent@email.com"
                  className="w-full p-2 mt-1"
                  style={{
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-bold">their name (optional)</label>
                <input
                  type="text"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  placeholder="Mom, Dad, Guardian..."
                  className="w-full p-2 mt-1"
                  style={{
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                />
              </div>
              <button
                onClick={addParentConnection}
                disabled={actionLoading || !newParentEmail}
                className="w-full py-2 font-bold hover:scale-105 transition-transform disabled:opacity-50"
                style={{
                  backgroundColor: '#FFD700',
                  border: '3px solid black',
                  borderRadius: '9999px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                {actionLoading ? 'adding...' : 'add connection'}
              </button>
            </div>
          </div>
        )}

        {/* Existing Connections */}
        {connections.length === 0 ? (
          <p className="text-sm opacity-70 p-3 bg-white/50 rounded-lg">
            no parents connected yet. add a parent to share reports with them!
          </p>
        ) : (
          <div className="space-y-2">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="flex items-center justify-between p-3"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <div>
                  <div className="font-bold">{conn.parent_name || 'Parent'}</div>
                  <div className="text-sm opacity-70">{conn.parent_email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-1 text-xs font-bold rounded-full"
                    style={{
                      backgroundColor: conn.connection_status === 'active' ? '#90EE90' : '#FFD700',
                      border: '2px solid black',
                    }}
                  >
                    {conn.connection_status}
                  </span>
                  <button
                    onClick={() => removeConnection(conn.id)}
                    className="text-red-500 hover:scale-110 transition-transform"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Report Section */}
      <div
        className="p-6"
        style={{
          backgroundColor: '#DDA0DD',
          border: '4px solid black',
          borderRadius: '20px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">📝</span>
          <h2 className="text-xl font-bold">generate weekly report</h2>
        </div>

        <p className="text-sm mb-4 p-3 bg-white/50 rounded-lg">
          create a summary of your week to share with parents. you&apos;ll review
          and approve everything before it&apos;s sent - nothing goes out without
          your okay!
        </p>

        <button
          onClick={() => generateReport(connections[0]?.id)}
          disabled={generating}
          className="w-full py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50"
          style={{
            backgroundColor: '#FFD700',
            border: '3px solid black',
            borderRadius: '12px',
            boxShadow: '4px 4px 0 black',
          }}
        >
          {generating ? '✨ generating...' : '✨ generate this week\'s report'}
        </button>
      </div>

      {/* Reports List */}
      {reports.length > 0 && (
        <div
          className="p-6"
          style={{
            backgroundColor: '#98FB98',
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">📊</span>
            <h2 className="text-xl font-bold">your reports</h2>
          </div>

          <div className="space-y-3">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => {
                  setSelectedReport(report)
                  setEditedReport({})
                }}
                className="w-full p-4 text-left hover:scale-[1.02] transition-transform"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">
                      {formatDate(report.week_start)} - {formatDate(report.week_end)}
                    </div>
                    <div className="text-sm opacity-70">
                      {report.parent_name || report.parent_email || 'No parent assigned'}
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 text-sm font-bold rounded-full"
                    style={{
                      backgroundColor:
                        report.status === 'sent' ? '#90EE90' :
                        report.status === 'approved' ? '#87CEEB' :
                        report.status === 'rejected' ? '#FFB6C1' :
                        '#FFD700',
                      border: '2px solid black',
                    }}
                  >
                    {report.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedReport(null)}
          />
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            style={{
              backgroundColor: 'white',
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '8px 8px 0 black',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center font-bold text-xl hover:scale-110 transition-transform"
              style={{
                backgroundColor: '#FFB6C1',
                border: '3px solid black',
                borderRadius: '50%',
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📊</div>
              <h2 className="text-2xl font-bold">weekly report preview</h2>
              <p className="text-sm opacity-70">
                {formatDate(selectedReport.week_start)} - {formatDate(selectedReport.week_end)}
              </p>
              <span
                className="inline-block mt-2 px-3 py-1 text-sm font-bold rounded-full"
                style={{
                  backgroundColor:
                    selectedReport.status === 'sent' ? '#90EE90' :
                    selectedReport.status === 'approved' ? '#87CEEB' :
                    '#FFD700',
                  border: '2px solid black',
                }}
              >
                {selectedReport.status}
              </span>
            </div>

            {/* Report Content */}
            <div className="space-y-4">
              {/* Stats */}
              <div
                className="p-4"
                style={{
                  backgroundColor: '#E6E6FA',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <div className="font-bold mb-2">📈 this week&apos;s activity</div>
                {(() => {
                  const stats = parseEngagementStats(selectedReport.engagement_stats)
                  return (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold">{stats.checkins || 0}</div>
                        <div className="text-xs">check-ins</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats.sessions || 0}</div>
                        <div className="text-xs">sessions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats.avgMood || '-'}</div>
                        <div className="text-xs">avg mood</div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Themes */}
              <div
                className="p-4"
                style={{
                  backgroundColor: '#FFFACD',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <div className="font-bold mb-2">💭 themes explored</div>
                {selectedReport.status === 'draft' ? (
                  <textarea
                    value={editedReport.themes_discussed ?? selectedReport.themes_discussed}
                    onChange={(e) => setEditedReport({ ...editedReport, themes_discussed: e.target.value })}
                    className="w-full p-2 text-sm"
                    style={{ border: '2px solid black', borderRadius: '8px' }}
                    rows={2}
                  />
                ) : (
                  <p className="text-sm">{selectedReport.themes_discussed}</p>
                )}
              </div>

              {/* Mood */}
              <div
                className="p-4"
                style={{
                  backgroundColor: '#FFB6C1',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <div className="font-bold mb-2">😊 mood summary</div>
                {selectedReport.status === 'draft' ? (
                  <textarea
                    value={editedReport.mood_summary ?? selectedReport.mood_summary}
                    onChange={(e) => setEditedReport({ ...editedReport, mood_summary: e.target.value })}
                    className="w-full p-2 text-sm"
                    style={{ border: '2px solid black', borderRadius: '8px' }}
                    rows={2}
                  />
                ) : (
                  <p className="text-sm">{selectedReport.mood_summary}</p>
                )}
              </div>

              {/* Growth */}
              <div
                className="p-4"
                style={{
                  backgroundColor: '#98FB98',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <div className="font-bold mb-2">🌱 growth highlights</div>
                {selectedReport.status === 'draft' ? (
                  <textarea
                    value={editedReport.growth_highlights ?? selectedReport.growth_highlights}
                    onChange={(e) => setEditedReport({ ...editedReport, growth_highlights: e.target.value })}
                    className="w-full p-2 text-sm"
                    style={{ border: '2px solid black', borderRadius: '8px' }}
                    rows={2}
                  />
                ) : (
                  <p className="text-sm">{selectedReport.growth_highlights}</p>
                )}
              </div>

              {/* Teen Note */}
              <div
                className="p-4"
                style={{
                  backgroundColor: '#87CEEB',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <div className="font-bold mb-2">✏️ add a note for your parent (optional)</div>
                {selectedReport.status === 'draft' ? (
                  <textarea
                    value={editedReport.teen_note ?? selectedReport.teen_note ?? ''}
                    onChange={(e) => setEditedReport({ ...editedReport, teen_note: e.target.value })}
                    placeholder="Hey! Here's what I want you to know about my week..."
                    className="w-full p-2 text-sm"
                    style={{ border: '2px solid black', borderRadius: '8px' }}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm">{selectedReport.teen_note || '(no note added)'}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            {selectedReport.status === 'draft' && (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-center opacity-70">
                  review and edit the report above, then approve to send
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateReport('reject')}
                    disabled={actionLoading}
                    className="flex-1 py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50"
                    style={{
                      backgroundColor: '#FFB6C1',
                      border: '3px solid black',
                      borderRadius: '12px',
                      boxShadow: '3px 3px 0 black',
                    }}
                  >
                    🚫 don&apos;t send
                  </button>
                  <button
                    onClick={() => updateReport('approve')}
                    disabled={actionLoading}
                    className="flex-1 py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50"
                    style={{
                      backgroundColor: '#90EE90',
                      border: '3px solid black',
                      borderRadius: '12px',
                      boxShadow: '3px 3px 0 black',
                    }}
                  >
                    ✅ approve & send
                  </button>
                </div>
              </div>
            )}

            {selectedReport.status === 'approved' && (
              <div className="mt-6">
                <button
                  onClick={() => updateReport('send')}
                  disabled={actionLoading}
                  className="w-full py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50"
                  style={{
                    backgroundColor: '#90EE90',
                    border: '3px solid black',
                    borderRadius: '12px',
                    boxShadow: '4px 4px 0 black',
                  }}
                >
                  📤 send to parent now
                </button>
              </div>
            )}

            {selectedReport.status === 'sent' && (
              <div className="mt-6 text-center">
                <span className="text-2xl">✅</span>
                <p className="font-bold mt-2">report sent!</p>
                <p className="text-sm opacity-70">
                  sent on {new Date(selectedReport.sent_at!).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
