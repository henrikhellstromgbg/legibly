'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ScanFormClient() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let cleanUrl = url.trim()
    if (!cleanUrl.startsWith('http')) cleanUrl = `https://${cleanUrl}`

    try {
      new URL(cleanUrl)
    } catch {
      setError('Enter a valid URL')
      setLoading(false)
      return
    }

    router.push(`/results?url=${encodeURIComponent(cleanUrl)}`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: '8px', maxWidth: '480px', margin: '0 auto' }}>
        <input
          type="text"
          required
          placeholder="https://yourwebsite.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            flex: 1,
            height: '48px',
            padding: '0 16px',
            fontSize: '15px',
            border: '1px solid var(--color-border)',
            borderRadius: '9999px',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-black)',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            height: '48px',
            padding: '0 24px',
            background: 'var(--color-black)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Scanning...' : 'Scan site'}
        </button>
      </div>
      {error && <p style={{ fontSize: '13px', color: 'var(--color-error)', marginTop: '8px', textAlign: 'center' }}>{error}</p>}
    </form>
  )
}
