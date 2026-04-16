import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  const apiKey = process.env.GOOGLE_PSI_API_KEY
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=accessibility${apiKey ? `&key=${apiKey}` : ''}`
  
  const res = await fetch(endpoint, { next: { revalidate: 0 } })
  const data = await res.json()
  
  const audits = Object.values(data.audits || {}) as { id: string; score: number | null; scoreDisplayMode: string; title: string }[]
  const failed = audits.filter(a => a.score !== null && a.score < 1)
  
  return NextResponse.json({
    a11yScore: data.categories?.accessibility?.score,
    totalAudits: audits.length,
    failedCount: failed.length,
    failed: failed.map(a => ({ id: a.id, score: a.score, mode: a.scoreDisplayMode, title: a.title }))
  })
}
