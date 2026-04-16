import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

interface PSIResult {
  lighthouseResult: {
    categories: {
      accessibility?: { score: number | null }
      performance?: { score: number | null }
    }
    audits: Record<string, {
      id: string
      score: number | null
      scoreDisplayMode: string
      displayValue?: string
    }>
  }
}

interface AxeViolation {
  id: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string
  help: string
  helpUrl: string
  count: number
  nodes: {
    html: string
    target: string[]
    failureSummary: string
  }[]
}

interface AxeResult {
  violations: AxeViolation[]
  violationCount: number
  criticalCount: number
  seriousCount: number
  moderateCount: number
  minorCount: number
}

const PERFORMANCE_MAP: Record<string, string> = {
  'speed-index':              'Pages may load slower than recommended',
  'total-blocking-time':      'The page may feel unresponsive during loading',
  'cumulative-layout-shift':  'Layout shifts may impact usability',
  'largest-contentful-paint': 'Main content may take too long to appear',
  'first-contentful-paint':   'First content appears slowly',
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 0.9) return 'low'
  if (score >= 0.6) return 'medium'
  return 'high'
}

async function fetchPSI(url: string, apiKey: string | undefined): Promise<PSIResult> {
  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=accessibility&category=performance${apiKey ? `&key=${apiKey}` : ''}`
  return new Promise((resolve, reject) => {
    https.get(psiUrl, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch (e) { reject(e) }
      })
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function fetchAxe(url: string): Promise<AxeResult> {
  const scannerUrl = process.env.SCANNER_URL || 'https://legibly-scanner.onrender.com'
  const res = await fetch(`${scannerUrl}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) throw new Error(`Scanner returned ${res.status}`)
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    // Run both in parallel
    const [psiResult, axeResult] = await Promise.allSettled([
      fetchPSI(url, process.env.GOOGLE_PSI_API_KEY),
      fetchAxe(url),
    ])

    const psi = psiResult.status === 'fulfilled' ? psiResult.value : null
    const axe = axeResult.status === 'fulfilled' ? axeResult.value : null

    if (!psi && !axe) {
      return NextResponse.json({ error: 'Could not reach this website. Please check the URL and try again.' }, { status: 422 })
    }

    const lhr = psi?.lighthouseResult
    const a11yScore = lhr?.categories?.accessibility?.score ?? 0.5
    const perfScore = lhr?.categories?.performance?.score ?? 0.5
    const risk = getRiskLevel(a11yScore)

    // Map axe violations to our issue format
    const issues = (axe?.violations || []).map(v => ({
      id: v.id,
      title: v.help,
      description: v.description,
      impact: v.impact,
      count: v.count,
      helpUrl: v.helpUrl,
      examples: v.nodes.slice(0, 3).map(n => n.html),
    })).sort((a, b) => {
      const order = { critical: 0, serious: 1, moderate: 2, minor: 3 }
      return order[a.impact] - order[b.impact]
    })

    // Performance signals from PSI
    const performanceSignals = Object.entries(lhr?.audits || {})
      .filter(([id, a]) => PERFORMANCE_MAP[id] && a.score !== null && a.score < 0.7)
      .slice(0, 3)
      .map(([id, a]) => ({
        text: PERFORMANCE_MAP[id],
        value: a.displayValue || null,
      }))

    return NextResponse.json({
      url,
      risk,
      a11yScore: Math.round(a11yScore * 100),
      perfScore: Math.round(perfScore * 100),
      issueCount: issues.length,
      criticalCount: issues.filter(i => i.impact === 'critical').length,
      seriousCount: issues.filter(i => i.impact === 'serious').length,
      moderateCount: issues.filter(i => i.impact === 'moderate').length,
      minorCount: issues.filter(i => i.impact === 'minor').length,
      issues,
      performanceSignals,
      scanners: {
        psi: psiResult.status === 'fulfilled',
        axe: axeResult.status === 'fulfilled',
      }
    })

  } catch (err) {
    console.error('Scan error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
