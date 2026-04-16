'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'

type RiskLevel = 'low' | 'medium' | 'high'
type Impact = 'critical' | 'serious' | 'moderate' | 'minor'

interface Issue {
  id: string
  title: string
  description: string
  impact: Impact
  count: number | null
  helpUrl: string
  examples: string[]
}

interface PerformanceSignal {
  text: string
  value: string | null
}

interface ScanResult {
  url: string
  risk: RiskLevel
  a11yScore: number
  perfScore: number
  issueCount: number
  criticalCount: number
  seriousCount: number
  moderateCount: number
  minorCount: number
  issues: Issue[]
  performanceSignals: PerformanceSignal[]
  scanners: { psi: boolean; axe: boolean }
}

const LOADING_MESSAGES = [
  'Scanning for accessibility issues…',
  'Running WCAG checks…',
  'Analysing your site…',
  'Almost done…',
]

const RISK_CONFIG = {
  low:    { label: 'Low risk',    bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  medium: { label: 'Medium risk', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  high:   { label: 'High risk',   bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
}

const IMPACT_CONFIG = {
  critical: { label: 'Critical', bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', dot: '#dc2626' },
  serious:  { label: 'Serious',  bg: '#FEF3C7', color: '#92400E', border: '#FDE68A', dot: '#d97706' },
  moderate: { label: 'Moderate', bg: '#F5F5F5', color: '#444',    border: '#E5E5E5', dot: '#888' },
  minor:    { label: 'Minor',    bg: '#F5F5F5', color: '#666',    border: '#E5E5E5', dot: '#aaa' },
}

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 6px' }}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#f0f0f0" strokeWidth="5" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 36 36)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color }}>{score}</span>
        </div>
      </div>
      <p style={{ fontSize: '11px', color: '#999', fontWeight: 500 }}>{label}</p>
    </div>
  )
}

function Nav() {
  return (
    <nav style={{ borderBottom: '1px solid #eaeaea', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/" style={{ fontSize: '17px', fontWeight: 600, color: '#000', letterSpacing: '-0.3px', textDecoration: 'none' }}>Legibly</Link>
      <a href="mailto:henrik@legibly.se" style={{ fontSize: '13px', color: '#999', textDecoration: 'none' }}>henrik@legibly.se</a>
    </nav>
  )
}

function ResultsContent() {
  const params = useSearchParams()
  const url = params.get('url') || ''

  const [state, setState] = useState<'loading' | 'result' | 'gate' | 'requested'>('loading')
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<Impact | 'all'>('all')

  useEffect(() => {
    if (!url) { setState('result'); setError('No URL provided.'); return }
    const interval = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 1400)
    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
      .then(r => r.json())
      .then(data => {
        clearInterval(interval)
        if (data.error) setError(data.error)
        else setResult(data)
        setState('result')
      })
      .catch(() => {
        clearInterval(interval)
        setError('Could not scan this site. Please check the URL and try again.')
        setState('result')
      })
    return () => clearInterval(interval)
  }, [url])

  const handleAuditRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/request-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, url, message, risk: result?.risk }),
      })
      if (!res.ok) throw new Error('Failed')
      setState('requested')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (state === 'loading') {
    return (
      <main style={{ background: '#fff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        <Nav />
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '120px 48px', textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #eaeaea', borderTopColor: '#000', borderRadius: '50%', margin: '0 auto 28px', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '18px', fontWeight: 500, color: '#000', marginBottom: '8px' }}>{LOADING_MESSAGES[loadingMsg]}</p>
          <p style={{ fontSize: '13px', color: '#999' }}>{url}</p>
        </div>
      </main>
    )
  }

  const riskConfig = result ? RISK_CONFIG[result.risk] : null
  const filteredIssues = result?.issues.filter(i => filter === 'all' || i.impact === filter) || []

  if (state === 'result') {
    return (
      <main style={{ background: '#fafafa', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        <Nav />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 48px' }}>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: '#991B1B', marginBottom: '8px' }}>{error}</p>
              <Link href="/" style={{ fontSize: '13px', color: '#555', textDecoration: 'underline' }}>← Try again</Link>
            </div>
          )}

          {result && riskConfig && (
            <>
              {/* Header */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: '#999', marginBottom: '6px' }}>{result.url}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' as const }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, background: riskConfig.bg, color: riskConfig.color, border: `1px solid ${riskConfig.border}`, padding: '4px 12px', borderRadius: '9999px' }}>
                    {riskConfig.label}
                  </span>
                  <span style={{ fontSize: '13px', color: '#4d4d4d' }}>
                    {result.issueCount} issue{result.issueCount !== 1 ? 's' : ''} found
                    {result.criticalCount > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> — {result.criticalCount} critical</span>}
                  </span>
                </div>
              </div>

              {/* Score dashboard */}
              <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '28px', marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' as const, color: '#999', marginBottom: '24px' }}>Scores</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '32px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <ScoreRing score={result.a11yScore} label="Accessibility" color={result.a11yScore >= 90 ? '#16a34a' : result.a11yScore >= 60 ? '#d97706' : '#dc2626'} />
                    <ScoreRing score={result.perfScore} label="Performance" color={result.perfScore >= 90 ? '#16a34a' : result.perfScore >= 60 ? '#d97706' : '#dc2626'} />
                  </div>
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                      {[
                        { label: 'Critical', count: result.criticalCount, color: '#dc2626', bg: '#FEF2F2' },
                        { label: 'Serious',  count: result.seriousCount,  color: '#d97706', bg: '#FEF3C7' },
                        { label: 'Moderate', count: result.moderateCount, color: '#555',    bg: '#F5F5F5' },
                        { label: 'Minor',    count: result.minorCount,    color: '#888',    bg: '#F5F5F5' },
                      ].map(s => (
                        <div key={s.label} style={{ background: s.bg, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '22px', fontWeight: 700, color: s.color, letterSpacing: '-0.5px', marginBottom: '2px' }}>{s.count}</div>
                          <div style={{ fontSize: '11px', color: s.color, fontWeight: 500 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: '#fafafa', border: '1px solid #eaeaea', borderRadius: '8px', padding: '12px 14px' }}>
                      <p style={{ fontSize: '12px', color: '#4d4d4d', lineHeight: '1.6', margin: 0 }}>
                        <strong style={{ color: '#000' }}>EU Accessibility Act (EAA)</strong> applies from 28 June 2025. Automated checks detect ~30% of issues — a manual audit finds the rest.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance */}
              {result.performanceSignals.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' as const, color: '#999', marginBottom: '16px' }}>Performance</p>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${result.performanceSignals.length}, 1fr)`, gap: '12px' }}>
                    {result.performanceSignals.map(s => (
                      <div key={s.text} style={{ background: '#fafafa', border: '1px solid #eaeaea', borderRadius: '8px', padding: '14px' }}>
                        <p style={{ fontSize: '20px', fontWeight: 700, color: '#000', marginBottom: '4px', letterSpacing: '-0.5px' }}>{s.value || '—'}</p>
                        <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.4', margin: 0 }}>{s.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {result.issues.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap' as const, gap: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' as const, color: '#999', margin: 0 }}>
                      Accessibility issues ({result.issueCount})
                    </p>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(['all', 'critical', 'serious', 'moderate', 'minor'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                          padding: '3px 10px', fontSize: '11px', fontWeight: 500,
                          borderRadius: '9999px', border: '1px solid', cursor: 'pointer',
                          fontFamily: 'system-ui, sans-serif',
                          background: filter === f ? '#000' : '#fff',
                          color: filter === f ? '#fff' : '#555',
                          borderColor: filter === f ? '#000' : '#eaeaea',
                        }}>
                          {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filteredIssues.map(issue => {
                      const ic = IMPACT_CONFIG[issue.impact]
                      const isOpen = expanded === issue.id
                      return (
                        <div key={issue.id} style={{ border: '1px solid #eaeaea', borderRadius: '8px', overflow: 'hidden' }}>
                          <button
                            onClick={() => setExpanded(isOpen ? null : issue.id)}
                            style={{ width: '100%', padding: '12px 14px', background: isOpen ? '#fafafa' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' as const, fontFamily: 'system-ui, sans-serif' }}
                          >
                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: ic.dot, flexShrink: 0 }} />
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#000', flex: 1 }}>{issue.title}</span>
                            {issue.count && issue.count > 1 && <span style={{ fontSize: '11px', color: '#999', flexShrink: 0 }}>{issue.count} instances</span>}
                            <span style={{ fontSize: '11px', fontWeight: 600, background: ic.bg, color: ic.color, border: `1px solid ${ic.border}`, padding: '2px 8px', borderRadius: '9999px', flexShrink: 0 }}>{ic.label}</span>
                            <span style={{ fontSize: '10px', color: '#ccc', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                          </button>
                          {isOpen && (
                            <div style={{ padding: '14px 16px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                              <p style={{ fontSize: '13px', color: '#4d4d4d', lineHeight: '1.6', marginBottom: '12px' }}>{issue.description}</p>
                              {issue.examples.length > 0 && (
                                <div style={{ marginBottom: '12px' }}>
                                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#999', marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }}>Found in</p>
                                  {issue.examples.map((ex, i) => (
                                    <code key={i} style={{ display: 'block', fontSize: '11px', background: '#efefef', padding: '8px 10px', borderRadius: '4px', marginBottom: '4px', color: '#333', wordBreak: 'break-all' as const, lineHeight: '1.5' }}>{ex}</code>
                                  ))}
                                </div>
                              )}
                              <a href={issue.helpUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#000', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid #eaeaea', paddingBottom: '1px' }}>
                                How to fix this →
                              </a>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {filteredIssues.length === 0 && (
                    <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '16px' }}>No {filter} issues found.</p>
                  )}
                </div>
              )}

              {/* What scan misses */}
              <div style={{ background: '#fafafa', border: '1px solid #eaeaea', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#000', marginBottom: '6px' }}>What this scan may miss</p>
                <p style={{ fontSize: '13px', color: '#4d4d4d', lineHeight: '1.6', margin: 0 }}>
                  Automated checks detect ~30% of accessibility issues. A manual audit covers keyboard navigation, screen reader usability, readability, and how your site works for real users with disabilities.
                </p>
              </div>

              {/* CTA */}
              <div style={{ background: '#000', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Request a verified audit</p>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px', lineHeight: '1.6' }}>
                  Manual WCAG review, readability analysis, cross-browser check. Fixed price: 9 900 kr. Delivery within 5 days.
                </p>
                <button onClick={() => setState('gate')} style={{ height: '44px', padding: '0 28px', background: '#fff', color: '#000', border: 'none', borderRadius: '9999px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>
                  Request audit →
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    )
  }

  if (state === 'gate') {
    return (
      <main style={{ background: '#fafafa', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        <Nav />
        <div style={{ maxWidth: '460px', margin: '0 auto', padding: '48px' }}>
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '32px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' as const, color: '#999', marginBottom: '12px' }}>Request a verified audit</p>
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#000', letterSpacing: '-0.3px', marginBottom: '8px' }}>Get a manual review</h2>
            <p style={{ fontSize: '14px', color: '#4d4d4d', lineHeight: '20px', marginBottom: '20px' }}>
              Clear, prioritised actions. Fixed price: <strong style={{ color: '#000' }}>9 900 kr</strong>. Delivery within 5 days.
            </p>
            {result && riskConfig && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fafafa', borderRadius: '8px', border: '1px solid #eaeaea', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, background: riskConfig.bg, color: riskConfig.color, border: `1px solid ${riskConfig.border}`, padding: '2px 8px', borderRadius: '9999px' }}>{riskConfig.label}</span>
                <span style={{ fontSize: '12px', color: '#4d4d4d' }}>— {result.issueCount} issues found</span>
              </div>
            )}
            <form onSubmit={handleAuditRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' as const, color: '#999', marginBottom: '5px' }}>Email</label>
                <input type="email" required placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', border: '1px solid #eaeaea', borderRadius: '6px', background: '#fff', color: '#000', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' as const }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' as const, color: '#999', marginBottom: '5px' }}>Website</label>
                <input type="text" value={url} readOnly style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', border: '1px solid #eaeaea', borderRadius: '6px', background: '#fafafa', color: '#999', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' as const, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' as const, color: '#999', marginBottom: '5px' }}>Message (optional)</label>
                <textarea placeholder="Any specific concerns?" value={message} onChange={e => setMessage(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #eaeaea', borderRadius: '6px', background: '#fff', color: '#000', fontFamily: 'system-ui, sans-serif', resize: 'none' as const, boxSizing: 'border-box' as const }} />
              </div>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#4d4d4d', lineHeight: '18px' }}>I agree to receive my report and follow-up emails about accessibility and compliance.</span>
              </label>
              {error && <p style={{ fontSize: '12px', color: '#dc2626' }}>{error}</p>}
              <button type="submit" disabled={submitting} style={{ height: '44px', background: '#000', color: '#fff', border: 'none', borderRadius: '9999px', fontSize: '14px', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, fontFamily: 'system-ui, sans-serif' }}>
                {submitting ? 'Sending...' : 'Request audit'}
              </button>
            </form>
            <button onClick={() => setState('result')} style={{ display: 'block', width: '100%', marginTop: '12px', background: 'none', border: 'none', fontSize: '13px', color: '#999', cursor: 'pointer', textAlign: 'center' as const, fontFamily: 'system-ui, sans-serif' }}>
              ← Back to results
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#fff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '400px', textAlign: 'center', padding: '48px' }}>
        <div style={{ width: '48px', height: '48px', background: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#000', letterSpacing: '-0.3px', marginBottom: '12px' }}>{"You're on the list"}</h2>
        <p style={{ fontSize: '15px', color: '#4d4d4d', lineHeight: '22px', marginBottom: '32px' }}>{"I'll review your site and get back to you shortly."}</p>
        <p style={{ fontSize: '16px', color: '#555', fontStyle: 'italic', marginBottom: '32px' }}>/ Henrik</p>
        <Link href="/" style={{ fontSize: '13px', color: '#999', textDecoration: 'none', borderBottom: '1px solid #eaeaea', paddingBottom: '1px' }}>← Back to home</Link>
      </div>
    </main>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main style={{ background: '#fff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #eaeaea', borderTopColor: '#000', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '16px', color: '#4d4d4d' }}>Loading…</p>
        </div>
      </main>
    }>
      <ResultsContent />
    </Suspense>
  )
}
