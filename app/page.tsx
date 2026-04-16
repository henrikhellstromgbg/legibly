import ScanFormClient from '@/components/ScanFormClient'

export default function Home() {
  return (
    <main style={{ background: 'var(--color-bg-primary)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--color-border)', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-black)', letterSpacing: '-0.3px' }}>Legibly</span>
        <a href="mailto:henrik@legibly.se" style={{ fontSize: '13px', color: 'var(--color-neutral-400)', textDecoration: 'none' }}>henrik@legibly.se</a>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '640px', margin: '0 auto', padding: '120px 48px 80px', textAlign: 'center' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '9999px', padding: '4px 12px', marginBottom: '32px' }}>
          <div style={{ width: '6px', height: '6px', background: 'var(--color-black)', borderRadius: '50%' }} />
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-neutral-500)', letterSpacing: '0.2px' }}>EU directive applies from 28 June 2025</span>
        </div>

        <h1 style={{ fontSize: '48px', fontWeight: 700, lineHeight: '52px', letterSpacing: '-1.5px', color: 'var(--color-black)', marginBottom: '20px' }}>
          Check if your website may break EU accessibility law
        </h1>

        <p style={{ fontSize: '18px', lineHeight: '28px', color: 'var(--color-neutral-500)', marginBottom: '48px' }}>
          New EU rules apply from June 2025. Most websites are not fully compliant. Check yours in seconds.
        </p>

        <ScanFormClient />

        {/* Trust signals */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px' }}>
          {['No signup required', 'Results in seconds', 'Based on automated checks'].map((t) => (
            <span key={t} style={{ fontSize: '12px', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4.5" stroke="var(--color-border)"/><path d="M3 5l1.5 1.5 3-3" stroke="var(--color-neutral-400)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {t}
            </span>
          ))}
        </div>

        {/* Preview example */}
        <div style={{ marginTop: '64px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px 24px', textAlign: 'left' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--color-neutral-400)', marginBottom: '12px' }}>Example result</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: '9999px' }}>Medium risk</span>
            <span style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>Your site may not meet EU requirements</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['Some buttons may be hard to read', 'Form fields may be difficult to use', 'Images may be missing descriptions'].map((i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#F59E0B', marginTop: '1px', flexShrink: 0 }}>—</span>
                <span style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>{i}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--color-neutral-400)' }}>
          <a href="#vad-ar-eaa" style={{ color: 'var(--color-neutral-500)', textDecoration: 'underline', textDecorationColor: 'var(--color-border)' }}>What is the EU Accessibility Act?</a>
        </p>
      </section>

      {/* EAA förklaring */}
      <section id="vad-ar-eaa" style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 48px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--color-neutral-400)', marginBottom: '16px' }}>What is the EU Accessibility Act?</p>
          <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-black)', letterSpacing: '-0.5px', lineHeight: '36px', marginBottom: '16px' }}>New EU rules apply from June 2025</h2>
          <p style={{ fontSize: '16px', color: 'var(--color-neutral-500)', lineHeight: '24px', marginBottom: '24px' }}>
            The European Accessibility Act (EAA) requires businesses to make their websites and digital services accessible to people with disabilities. It applies to private companies across the EU from 28 June 2025.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
            {[
              { label: 'Applies from', value: '28 June 2025' },
              { label: 'Standard', value: 'WCAG 2.1 AA' },
              { label: 'Max fine', value: '10M SEK' },
            ].map((r, i) => (
              <div key={r.label} style={{ padding: '16px 20px', background: 'var(--color-bg-primary)', borderRight: i < 2 ? '1px solid var(--color-border)' : 'none', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-black)', letterSpacing: '-0.5px', marginBottom: '2px' }}>{r.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-neutral-400)', fontWeight: 500 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-neutral-400)', marginTop: '16px', lineHeight: '20px' }}>
            Micro-enterprises with fewer than 10 employees and under €2M in annual revenue are exempt.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-900)' }}>Legibly</span>
        <p style={{ fontSize: '12px', color: 'var(--color-neutral-400)', maxWidth: '400px', textAlign: 'right', lineHeight: '18px' }}>
          All audits include a personal follow-up email explaining what you can fix yourself, what needs a developer, and what to prioritise.
        </p>
      </footer>

    </main>
  )
}
