import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  const apiKey = process.env.GOOGLE_PSI_API_KEY
  
  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=accessibility${apiKey ? `&key=${apiKey}` : ''}`
  
  const raw = await new Promise<string>((resolve, reject) => {
    https.get(psiUrl, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => resolve(body))
      res.on('error', reject)
    }).on('error', reject)
  })
  
  const data = JSON.parse(raw)
  const topKeys = Object.keys(data)
  
  return NextResponse.json({
    topKeys,
    hasAudits: 'audits' in data,
    hasCategories: 'categories' in data,
    errorIfAny: data.error || null,
    auditCount: Object.keys(data.audits || {}).length,
    categoryKeys: Object.keys(data.categories || {}),
  })
}
