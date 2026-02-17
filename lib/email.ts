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
    const appName = 'FutureMe'

    // Format the date range nicely
    const dateRange = `${formatDate(data.weekStart)} - ${formatDate(data.weekEnd)}`

    // Build the email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Report for ${data.teenName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Weekly Report</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${data.teenName}'s ${appName} Journey</p>
    <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0 0; font-size: 14px;">${dateRange}</p>
  </div>

  <div style="background: white; border-radius: 0 0 16px 16px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="color: #666; margin-top: 0;">Hi ${data.parentName || 'there'},</p>

    <p style="color: #666;">Here's a summary of ${data.teenName}'s activities and growth this week on ${appName}.</p>

    ${data.engagementStats ? `
    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Activity Overview</h3>
      <div style="display: flex; justify-content: space-around; text-align: center;">
        ${data.engagementStats.chatCount !== undefined ? `
        <div style="flex: 1;">
          <div style="font-size: 28px; font-weight: bold; color: #667eea;">${data.engagementStats.chatCount}</div>
          <div style="font-size: 12px; color: #666; text-transform: uppercase;">Conversations</div>
        </div>
        ` : ''}
        ${data.engagementStats.journalCount !== undefined ? `
        <div style="flex: 1;">
          <div style="font-size: 28px; font-weight: bold; color: #764ba2;">${data.engagementStats.journalCount}</div>
          <div style="font-size: 12px; color: #666; text-transform: uppercase;">Journal Entries</div>
        </div>
        ` : ''}
        ${data.engagementStats.checkinCount !== undefined ? `
        <div style="flex: 1;">
          <div style="font-size: 28px; font-weight: bold; color: #f093fb;">${data.engagementStats.checkinCount}</div>
          <div style="font-size: 12px; color: #666; text-transform: uppercase;">Check-ins</div>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    ${data.themesDiscussed ? `
    <div style="margin: 25px 0;">
      <h3 style="color: #333; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">💭</span> Topics Explored
      </h3>
      <p style="color: #555; margin: 0; padding-left: 28px;">${data.themesDiscussed}</p>
    </div>
    ` : ''}

    ${data.moodSummary ? `
    <div style="margin: 25px 0;">
      <h3 style="color: #333; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">🌈</span> Mood & Wellbeing
      </h3>
      <p style="color: #555; margin: 0; padding-left: 28px;">${data.moodSummary}</p>
    </div>
    ` : ''}

    ${data.growthHighlights ? `
    <div style="margin: 25px 0;">
      <h3 style="color: #333; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">🌱</span> Growth Highlights
      </h3>
      <p style="color: #555; margin: 0; padding-left: 28px;">${data.growthHighlights}</p>
    </div>
    ` : ''}

    ${data.teenNote ? `
    <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 12px; padding: 20px; margin: 25px 0;">
      <h3 style="color: #333; font-size: 16px; margin: 0 0 10px 0; display: flex; align-items: center;">
        <span style="margin-right: 8px;">💌</span> A Note from ${data.teenName}
      </h3>
      <p style="color: #555; margin: 0; font-style: italic;">"${data.teenNote}"</p>
    </div>
    ` : ''}

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="color: #888; font-size: 14px; text-align: center; margin-bottom: 0;">
      This report was approved by ${data.teenName} before being sent to you.<br>
      <a href="https://npc-app.com" style="color: #667eea; text-decoration: none;">${appName}</a> helps teens explore their thoughts and grow.
    </p>
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
