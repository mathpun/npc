import { Resend } from 'resend'

// Initialize Resend client
let resend: Resend | null = null
function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }
    resend = new Resend(apiKey)
  }
  return resend
}

export interface ParentReportEmailData {
  parentName: string
  parentEmail: string
  teenName: string
  weekStart: string
  weekEnd: string
  themesDiscussed: string
  moodSummary: string
  growthHighlights: string
  teenNote?: string
  engagementStats?: {
    chatCount?: number
    journalCount?: number
    checkinCount?: number
  }
}

export async function sendParentReportEmail(data: ParentReportEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getResendClient()

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'reports@npc-app.com'
    const appName = 'npc'

    // Format the date range nicely
    const dateRange = `${formatDate(data.weekStart)} - ${formatDate(data.weekEnd)}`

    // Build the email HTML with playful npc styling
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Report for ${data.teenName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF9E6;">

  <!-- Header -->
  <div style="background: #FFD700; border: 3px solid #000; border-radius: 20px; padding: 25px; text-align: center; margin-bottom: 20px;">
    <h1 style="color: #000; margin: 0; font-size: 28px; font-weight: 800;">weekly report ✨</h1>
    <p style="color: #000; margin: 10px 0 0 0; font-size: 18px; font-weight: 600;">${data.teenName}'s ${appName} journey</p>
    <p style="color: #333; margin: 5px 0 0 0; font-size: 14px;">${dateRange}</p>
  </div>

  <!-- Main Content -->
  <div style="background: #fff; border: 3px solid #000; border-radius: 20px; padding: 25px;">
    <p style="color: #333; margin-top: 0; font-size: 16px;">hi ${data.parentName || 'there'}! 👋</p>

    <p style="color: #333; font-size: 16px;">here's what ${data.teenName} has been up to this week on ${appName}:</p>

    ${data.engagementStats ? `
    <!-- Activity Stats -->
    <div style="background: #E8F5E9; border: 3px solid #000; border-radius: 16px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #000; font-size: 16px; font-weight: 700;">📊 activity overview</h3>
      <table style="width: 100%; text-align: center;">
        <tr>
          ${data.engagementStats.chatCount !== undefined ? `
          <td style="padding: 10px;">
            <div style="background: #90EE90; border: 2px solid #000; border-radius: 12px; padding: 15px;">
              <div style="font-size: 32px; font-weight: 800; color: #000;">${data.engagementStats.chatCount}</div>
              <div style="font-size: 12px; color: #333; font-weight: 600;">chats</div>
            </div>
          </td>
          ` : ''}
          ${data.engagementStats.journalCount !== undefined ? `
          <td style="padding: 10px;">
            <div style="background: #FFB6C1; border: 2px solid #000; border-radius: 12px; padding: 15px;">
              <div style="font-size: 32px; font-weight: 800; color: #000;">${data.engagementStats.journalCount}</div>
              <div style="font-size: 12px; color: #333; font-weight: 600;">journals</div>
            </div>
          </td>
          ` : ''}
          ${data.engagementStats.checkinCount !== undefined ? `
          <td style="padding: 10px;">
            <div style="background: #87CEEB; border: 2px solid #000; border-radius: 12px; padding: 15px;">
              <div style="font-size: 32px; font-weight: 800; color: #000;">${data.engagementStats.checkinCount}</div>
              <div style="font-size: 12px; color: #333; font-weight: 600;">check-ins</div>
            </div>
          </td>
          ` : ''}
        </tr>
      </table>
    </div>
    ` : ''}

    ${data.themesDiscussed ? `
    <!-- Topics -->
    <div style="background: #E3F2FD; border: 3px solid #000; border-radius: 16px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #000; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">
        💭 topics explored
      </h3>
      <p style="color: #333; margin: 0; font-size: 15px;">${data.themesDiscussed}</p>
    </div>
    ` : ''}

    ${data.moodSummary ? `
    <!-- Mood -->
    <div style="background: #FCE4EC; border: 3px solid #000; border-radius: 16px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #000; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">
        🌈 mood & wellbeing
      </h3>
      <p style="color: #333; margin: 0; font-size: 15px;">${data.moodSummary}</p>
    </div>
    ` : ''}

    ${data.growthHighlights ? `
    <!-- Growth -->
    <div style="background: #FFF3E0; border: 3px solid #000; border-radius: 16px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #000; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">
        🌱 growth highlights
      </h3>
      <p style="color: #333; margin: 0; font-size: 15px;">${data.growthHighlights}</p>
    </div>
    ` : ''}

    ${data.teenNote ? `
    <!-- Teen Note -->
    <div style="background: #FFD700; border: 3px solid #000; border-radius: 16px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #000; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">
        💌 a note from ${data.teenName}
      </h3>
      <p style="color: #000; margin: 0; font-size: 15px; font-style: italic;">"${data.teenNote}"</p>
    </div>
    ` : ''}

    <div style="border-top: 3px solid #000; margin: 25px 0; padding-top: 20px; text-align: center;">
      <p style="color: #666; font-size: 14px; margin: 0;">
        this report was approved by ${data.teenName} before being sent 💜
      </p>
      <p style="color: #333; font-size: 14px; margin: 10px 0 0 0; font-weight: 600;">
        <a href="https://npc-app.com" style="color: #000; text-decoration: none; background: #FFB6C1; padding: 5px 12px; border-radius: 20px; border: 2px solid #000;">${appName}</a>
        <span style="margin-left: 8px;">helps teens explore their thoughts and grow ✨</span>
      </p>
    </div>
  </div>
</body>
</html>
`

    // Send the email
    const { data: result, error } = await client.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: data.parentEmail,
      subject: `${data.teenName}'s Weekly ${appName} Report (${dateRange})`,
      html: emailHtml,
    })

    if (error) {
      console.error('[EMAIL] Failed to send parent report:', error)
      return { success: false, error: error.message }
    }

    console.log(`[EMAIL] Successfully sent parent report to ${data.parentEmail}, id: ${result?.id}`)
    return { success: true }
  } catch (error) {
    console.error('[EMAIL] Error sending parent report:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}
