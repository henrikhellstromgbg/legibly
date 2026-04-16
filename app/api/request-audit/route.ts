import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY missing')
  return new Resend(key)
}

const RISK_LABELS = { low: 'Low risk', medium: 'Medium risk', high: 'High risk' }

export async function POST(req: NextRequest) {
  try {
    const { email, url, message, risk } = await req.json()
    if (!email || !url) return NextResponse.json({ error: 'Email and URL required' }, { status: 400 })

    const resend = getResend()
    const riskLabel = RISK_LABELS[risk as keyof typeof RISK_LABELS] || 'Unknown'

    // Bekräftelse till kunden
    await resend.emails.send({
      from: 'Henrik Hellström <henrik@legibly.se>',
      to: email,
      subject: `Your audit request for ${url}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:12px;overflow:hidden;border:1px solid #eaeaea;">
  <tr><td style="background:#000;padding:20px 32px;">
    <span style="color:white;font-size:16px;font-weight:600;">Legibly</span>
  </td></tr>
  <tr><td style="padding:32px;">
    <h2 style="font-size:20px;font-weight:600;color:#000;margin:0 0 8px;letter-spacing:-0.3px;">You're on the list</h2>
    <p style="font-size:15px;color:#4d4d4d;line-height:22px;margin:0 0 24px;">I'll review your site and get back to you shortly.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eaeaea;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr style="border-bottom:1px solid #eaeaea;">
        <td style="padding:10px 14px;font-size:12px;color:#999;font-weight:500;width:100px;">Website</td>
        <td style="padding:10px 14px;font-size:13px;color:#171717;">${url}</td>
      </tr>
      <tr style="border-bottom:1px solid #eaeaea;">
        <td style="padding:10px 14px;font-size:12px;color:#999;font-weight:500;">Risk level</td>
        <td style="padding:10px 14px;font-size:13px;color:#171717;font-weight:600;">${riskLabel}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-size:12px;color:#999;font-weight:500;">Price</td>
        <td style="padding:10px 14px;font-size:13px;color:#171717;">9 900 kr — delivery within 5 days</td>
      </tr>
    </table>

    <p style="font-size:14px;color:#4d4d4d;line-height:20px;margin:0 0 24px;">
      I'll take a first look at your site and confirm the scope before sending a payment link. You won't be charged until we've agreed on the details.
    </p>
    <p style="font-size:16px;color:#333;font-style:italic;margin:0;">/ Henrik</p>
  </td></tr>
  <tr><td style="padding:16px 32px;border-top:1px solid #f3f4f6;">
    <p style="font-size:11px;color:#999;margin:0;">
      You agreed to receive this email and follow-up messages about accessibility and compliance.
      <a href="mailto:henrik@legibly.se?subject=Unsubscribe" style="color:#999;">Unsubscribe</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
    })

    // Notis till Henrik
    await resend.emails.send({
      from: 'Legibly System <henrik@legibly.se>',
      to: 'henrik@legibly.se',
      subject: `New audit request: ${url}`,
      html: `
        <p><strong>URL:</strong> ${url}</p>
        <p><strong>Customer:</strong> ${email}</p>
        <p><strong>Risk level:</strong> ${riskLabel}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
        <p><a href="mailto:${email}">Reply to customer →</a></p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
