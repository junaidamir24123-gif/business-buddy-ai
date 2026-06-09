import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Zap, Target, BookOpen, Megaphone, Check, ArrowRight, Menu, X, Users, ChartBar as BarChart3, Rocket, Clock, Crown, ChevronRight, Calendar, Hash, TrendingUp, Video, Copy, FileText } from 'lucide-react'
import './App.css'

const BUSINESS_TYPES = [
  'Digital Products',
  'Affiliate Marketing',
  'E-commerce',
  'Agency',
  'Content Creator',
  'Local Business',
]

const GOALS = ['More Sales', 'More Followers', 'More Leads']

const LOADING_STEPS = [
  'Understanding your business',
  'Analyzing your audience',
  'Creating your marketing strategy',
  'Optimizing for conversions',
]

type FormValues = { businessType: string; productName: string; targetAudience: string; goal: string }

const GOAL_VERBS: Record<string, { action: string; noun: string; verb: string }> = {
  'More Sales': { action: 'drive more sales for', noun: 'buyers', verb: 'converting' },
  'More Followers': { action: 'grow your audience for', noun: 'followers', verb: 'growing' },
  'More Leads': { action: 'attract more leads for', noun: 'prospects', verb: 'attracting' },
}

type CalendarRow = { day: number; platform: string; idea: string }

function generateCalendar(form: FormValues): CalendarRow[] {
  const p = form.productName || 'your product'
  const a = form.targetAudience || 'your audience'
  const g = form.goal || 'More Sales'
  const gv = GOAL_VERBS[g] || GOAL_VERBS['More Sales']
  const aud = a.split(',')[0].trim()

  const platforms = [
    'Instagram Reel', 'Carousel', 'TikTok', 'Story Poll',
    'Facebook Post', 'Instagram Reel', 'Carousel', 'TikTok',
    'Story Poll', 'Facebook Post', 'Instagram Reel', 'Carousel',
    'TikTok', 'Story Poll', 'Facebook Post',
  ]

  const ideaTemplates = [
    `How I built my ${p} business from zero`,
    `3 mistakes ${aud} make with ${p}`,
    `Why ${aud} are switching to ${p}`,
    `The #1 strategy to ${gv.action} ${p}`,
    `Behind the scenes of ${p}`,
    `Day in my life running ${p}`,
    `Quick tip: ${gv.verb} ${gv.noun} with ${p}`,
    `${p} review — honest take after 30 days`,
    `How I got my first ${gv.noun} for ${p}`,
    `The tool stack behind ${p}`,
    `What nobody tells you about ${p}`,
    `How ${p} saves me 3 hours a day`,
    `My exact ${p} launch strategy`,
    `Results update: ${p} after one month`,
    `Top 5 features of ${p} that ${aud} love`,
    `How to start with ${p} — step by step`,
    `The math behind ${p}'s growth`,
    `Packing an order for ${p}`,
    `Why I quit my job to build ${p}`,
    `3 ways ${aud} use ${p} differently`,
    `My morning routine with ${p}`,
    `How ${p} helped me ${gv.action.replace('drive more sales for', 'hit $10K').replace('grow your audience for', 'gain 10K').replace('attract more leads for', 'get 500')}  `,
    `The real reason ${p} works for ${aud}`,
    `Unboxing / demo of ${p}`,
    `FAQ: What ${aud} always ask about ${p}`,
    `How I plan content for ${p} in 10 min`,
    `This one tweak doubled my ${gv.noun} for ${p}`,
    `Client win: How ${aud.split(' ')[0]} used ${p} to succeed`,
    `What's next for ${p} — roadmap reveal`,
    `30-day recap: Everything I learned building ${p}`,
  ]

  return ideaTemplates.map((tpl, i) => ({
    day: i + 1,
    platform: platforms[i % platforms.length],
    idea: tpl,
  }))
}

const OUTPUT_CARDS = [
  { key: 'Viral Reel Idea', icon: Video, gradient: 'purple' },
  { key: 'Scroll-Stopping Hook', icon: Zap, gradient: 'cyan' },
  { key: 'Instagram Caption', icon: BookOpen, gradient: 'purple' },
  { key: 'Facebook/TikTok Ad Copy', icon: Megaphone, gradient: 'cyan' },
  { key: 'Best Time To Post', icon: Calendar, gradient: 'purple' },
  { key: 'Suggested Hashtags', icon: Hash, gradient: 'cyan' },
  { key: 'Bonus Growth Tip', icon: TrendingUp, gradient: 'purple' },
]

const OUTPUT_KEYS = OUTPUT_CARDS.map(c => c.key)

async function callGemini(form: FormValues): Promise<Record<string, string>> {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
  if (!API_KEY) throw new Error('No API key')

  const prompt = `You are a world-class marketing strategist. Generate a personalized daily marketing plan for the following business:

Business Type: ${form.businessType}
Product or Service Name: ${form.productName}
Target Audience: ${form.targetAudience}
Goal: ${form.goal}

Generate exactly these 7 sections. Each section must start with the exact label in brackets on its own line, followed by the content. Do not add any other sections or text.

[Viral Reel Idea]
Write a specific, actionable 60-second reel concept that uses the product name and target audience. Include format, hook, structure, and why it works.

[Scroll-Stopping Hook]
Write a powerful opening hook for a short-form video that directly names the target audience and product. Make it impossible to scroll past.

[Instagram Caption]
Write a full Instagram caption with line breaks, emojis where appropriate, and a clear CTA. Personalize it with the product name, audience, and goal.

[Facebook/TikTok Ad Copy]
Write a short-form ad (4-6 short paragraphs) personalized with the product name, audience, and goal. End with a strong call to action.

[Best Time To Post]
Provide a realistic weekly posting schedule across Instagram, TikTok, and Facebook, tailored to the audience and business type. Include specific days, times, and a peak engagement window.

[Suggested Hashtags]
Provide 12-15 relevant hashtags that combine product-specific, niche, audience, and trending tags. Format as a single line separated by spaces, each starting with #.

[Bonus Growth Tip]
Give one specific, actionable marketing growth tip personalized to this product, audience, and goal. Make it practical and implementable today.`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048,
        },
      }),
    },
  )

  if (!res.ok) throw new Error(`API error: ${res.status}`)

  const data = await res.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text) throw new Error('Empty response')

  const result: Record<string, string> = {}
  for (const key of OUTPUT_KEYS) {
    const regex = new RegExp(`\\[${key}\\]\\s*([\\s\\S]*?)(?=\\[(?:${OUTPUT_KEYS.join('|')})\\]|$)`, 'i')
    const match = text.match(regex)
    result[key] = match ? match[1].trim() : ''
    if (!result[key]) {
      const lineStart = text.indexOf(`[${key}]`)
      if (lineStart !== -1) {
        const afterLabel = text.slice(lineStart + key.length + 2)
        const nextLabel = OUTPUT_KEYS.reduce((earliest, k) => {
          const idx = afterLabel.indexOf(`[${k}]`)
          return idx > 0 && (earliest === -1 || idx < earliest) ? idx : earliest
        }, -1)
        result[key] = (nextLabel > 0 ? afterLabel.slice(0, nextLabel) : afterLabel).trim()
      }
    }
  }

  return result
}

const FEATURES = [
  { icon: Sparkles, title: 'AI Content Engine', desc: 'Generate viral ideas, hooks, and full copy in seconds — not hours.' },
  { icon: Users, title: 'Audience-First', desc: 'Every output is tailored to your specific audience and goal.' },
  { icon: BarChart3, title: 'Conversion-Focused', desc: 'Content engineered to drive clicks, sign-ups, and sales.' },
  { icon: Rocket, title: 'Instant Results', desc: 'No blank page. No brainstorming. Just publish-ready content.' },
  { icon: Clock, title: 'Save Hours Daily', desc: 'Replace your content calendar struggles with one-click generation.' },
  { icon: Crown, title: 'Pro Templates', desc: 'Unlock premium templates used by top-performing creators.' },
]

function App() {
  const [formData, setFormData] = useState({
    businessType: '',
    productName: '',
    targetAudience: '',
    goal: '',
  })
  const [outputs, setOutputs] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(-1)
  const [dashboardReady, setDashboardReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedCard, setCopiedCard] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [generateError, setGenerateError] = useState(false)
  const [calendarRows, setCalendarRows] = useState<CalendarRow[]>([])
  const [calendarReady, setCalendarReady] = useState(false)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [calendarCopied, setCalendarCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleGenerate = useCallback(() => {
    if (isGenerating) return
    const snapshot = { ...formData }
    setIsGenerating(true)
    setOutputs({})
    setDashboardReady(false)
    setGenerateError(false)
    setLoadingStep(0)

    // Step through loading phases
    LOADING_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setLoadingStep(i)
      }, 500 * (i + 1))
    })

    // Call Gemini API
    callGemini(snapshot)
      .then(filled => {
        setOutputs(filled)
        setLoadingStep(-1)
        setIsGenerating(false)
        setDashboardReady(true)
      })
      .catch(() => {
        setLoadingStep(-1)
        setIsGenerating(false)
        setGenerateError(true)
      })
  }, [isGenerating, formData])

  const handleCopyFullPlan = useCallback(() => {
    const text = OUTPUT_CARDS.map(c => `--- ${c.key} ---\n${outputs[c.key] ?? ''}`).join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [outputs])

  const handleCopyCard = useCallback((key: string) => {
    navigator.clipboard.writeText(outputs[key] ?? '').then(() => {
      setCopiedCard(key)
      setTimeout(() => setCopiedCard(null), 2000)
    })
  }, [outputs])

  const handleDownloadPdf = useCallback(() => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  const handleGenerateCalendar = useCallback(() => {
    if (calendarLoading) return
    const snapshot = { ...formData }
    setCalendarLoading(true)
    setCalendarReady(false)
    setTimeout(() => {
      setCalendarRows(generateCalendar(snapshot))
      setCalendarLoading(false)
      setCalendarReady(true)
    }, 1500)
  }, [calendarLoading, formData])

  const handleCopyCalendar = useCallback(() => {
    const text = calendarRows.map(r => `Day ${r.day}\t${r.platform}\t${r.idea}`).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCalendarCopied(true)
      setTimeout(() => setCalendarCopied(false), 2000)
    })
  }, [calendarRows])

  return (
    <div className="app">
      {/* ===== NAVBAR ===== */}
      <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav__inner">
          <a href="#" className="nav__logo">
            <div className="nav__logo-mark">
              <Sparkles size={16} />
            </div>
            Business Buddy AI
          </a>
          <div className={`nav__menu ${mobileMenuOpen ? 'nav__menu--open' : ''}`}>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#generator" className="nav__btn">Get Started</a>
          </div>
          <button className="nav__toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__grid" />
        <div className="hero__content">
          <div className="hero__pill">
            <Sparkles size={13} />
            <span>AI-Powered Marketing</span>
          </div>
          <h1 className="hero__title">
            Generate Marketing Content<br />
            For Your Business In <span className="hero__gradient">Seconds</span>.
          </h1>
          <p className="hero__sub">
            Business Buddy AI helps creators, digital sellers, affiliate marketers, and small businesses generate viral ideas, captions, ad copy, and CTAs instantly.
          </p>
          <a href="#generator" className="hero__cta">
            Generate Content
            <ArrowRight size={17} />
          </a>
          <div className="hero__proof">
            <div className="hero__proof-item">
              <span className="hero__proof-num">10K+</span>
              <span className="hero__proof-label">Active Users</span>
            </div>
            <div className="hero__proof-sep" />
            <div className="hero__proof-item">
              <span className="hero__proof-num">500K+</span>
              <span className="hero__proof-label">Generations</span>
            </div>
            <div className="hero__proof-sep" />
            <div className="hero__proof-item">
              <span className="hero__proof-num">4.9</span>
              <span className="hero__proof-label">Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features" id="features">
        <div className="features__inner">
          <div className="section-label">
            <Target size={14} />
            Features
          </div>
          <h2 className="section-title">Everything You Need To Create Content That Converts</h2>
          <p className="section-desc">From ideation to publication — AI handles the heavy lifting.</p>
          <div className="features__grid">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div className="feature-card__icon"><Icon size={18} /></div>
                <h3 className="feature-card__title">{title}</h3>
                <p className="feature-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GENERATOR ===== */}
      <section className="generator" id="generator">
        <div className="generator__bg-orb" />
        <div className="generator__inner">
          <div className="section-label">
            <Zap size={14} />
            AI Content Studio
          </div>
          <h2 className="section-title">Generate Your Marketing Content</h2>
          <p className="section-desc">Fill in your business details and let AI build a complete daily marketing plan — personalized to your audience and goals.</p>

          <div className="gen-card">
            <div className="gen-card__glow" />
            <div className="gen-card__top-bar" />
            <div className="gen-card__header">
              <div className="gen-card__header-icon"><Sparkles size={15} /></div>
              <span>Business Details</span>
            </div>
            <div className="gen-card__fields">
              <div className="field">
                <label className="field__label">Business Type</label>
                <div className="field__select-wrap">
                  <select className="field__select" value={formData.businessType} onChange={e => setFormData(p => ({ ...p, businessType: e.target.value }))}>
                    <option value="" disabled>Select your business type</option>
                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronRight size={14} className="field__select-arrow" />
                </div>
              </div>
              <div className="field">
                <label className="field__label">Product or Service Name</label>
                <input className="field__input" placeholder="e.g. Business Buddy AI" value={formData.productName} onChange={e => setFormData(p => ({ ...p, productName: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field__label">Target Audience</label>
                <input className="field__input" placeholder="e.g. Small business owners, creators" value={formData.targetAudience} onChange={e => setFormData(p => ({ ...p, targetAudience: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field__label">Goal</label>
                <div className="field__select-wrap">
                  <select className="field__select" value={formData.goal} onChange={e => setFormData(p => ({ ...p, goal: e.target.value }))}>
                    <option value="" disabled>Select your goal</option>
                    {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ChevronRight size={14} className="field__select-arrow" />
                </div>
              </div>
            </div>
            <button className={`gen-btn ${isGenerating ? 'gen-btn--loading' : ''}`} onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <div className="gen-btn__spinner" />
                  Building Your Plan...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Build My Daily Marketing Plan
                </>
              )}
            </button>
          </div>

          {/* ===== LOADING SCREEN ===== */}
          {isGenerating && (
            <div className="loader">
              <div className="loader__card">
                <div className="loader__icon-wrap">
                  <Sparkles size={20} />
                </div>
                <p className="loader__message">
                  <Sparkles size={14} className="loader__sparkle" />
                  Business Buddy AI is analyzing your business...
                </p>
                <div className="loader__progress">
                  <div className="loader__progress-bar">
                    <div className="loader__progress-fill" style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }} />
                  </div>
                </div>
                <ul className="loader__steps">
                  {LOADING_STEPS.map((step, i) => (
                    <li key={step} className={`loader__step ${i <= loadingStep ? 'loader__step--done' : ''}`}>
                      <span className="loader__step-check">
                        {i <= loadingStep ? <Check size={12} /> : <span className="loader__step-dot" />}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ===== SKELETON PLACEHOLDER (before generation) ===== */}
          {!isGenerating && !dashboardReady && !generateError && (
            <div className="results">
              {OUTPUT_CARDS.map(({ key, icon: Icon, gradient }) => (
                <div key={key} className={`result-card result-card--${gradient}`}>
                  <div className="result-card__head">
                    <div className={`result-card__icon result-card__icon--${gradient}`}><Icon size={14} /></div>
                    <span className="result-card__name">{key}</span>
                  </div>
                  <div className="result-card__body">
                    <div className="result-card__skeleton">
                      <div className="result-card__line" />
                      <div className="result-card__line" />
                      <div className="result-card__line result-card__line--short" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===== ERROR MESSAGE ===== */}
          {generateError && (
            <div className="error-message">
              <div className="error-message__icon">
                <X size={20} />
              </div>
              <p className="error-message__text">AI generation failed. Please try again.</p>
              <button className="error-message__btn" onClick={handleGenerate}>
                <Sparkles size={15} />
                Try Again
              </button>
            </div>
          )}

          {/* ===== DASHBOARD (after generation) ===== */}
          {dashboardReady && (
            <div className="dashboard">
              <div className="dashboard__badge">
                <Sparkles size={12} />
                Personalized AI Strategy Generated
              </div>
              <h3 className="dashboard__title">Today's Marketing Plan</h3>
              <p className="dashboard__subtitle">Tailored to your business, audience, and goals — ready to publish.</p>
              <div className="dashboard__grid">
                {OUTPUT_CARDS.map(({ key, icon: Icon, gradient }, idx) => (
                  <div
                    key={key}
                    className={`dash-card dash-card--active dash-card--enter dash-card--${gradient}`}
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    <div className="dash-card__head">
                      <div className={`dash-card__icon dash-card__icon--${gradient}`}><Icon size={15} /></div>
                      <span className="dash-card__name">{key}</span>
                      <span className={`dash-card__tag dash-card__tag--${gradient}`}>AI</span>
                    </div>
                    <div className="dash-card__body">
                      <p className="dash-card__text">{outputs[key]}</p>
                    </div>
                    <button className="dash-card__copy" onClick={() => handleCopyCard(key)}>
                      {copiedCard === key ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="dashboard__actions">
                <button className={`action-btn action-btn--copy ${copied ? 'action-btn--copied' : ''}`} onClick={handleCopyFullPlan}>
                  {copied ? (
                    <>Copied Successfully <Check size={15} /></>
                  ) : (
                    <><Copy size={15} /> Copy Full Plan</>
                  )}
                </button>
                <button className="action-btn action-btn--pdf" onClick={handleDownloadPdf}>
                  <FileText size={15} />
                  Download PDF
                </button>
              </div>
            </div>
          )}

          {/* ===== 30-DAY CALENDAR ===== */}
          {dashboardReady && (
            <div className="calendar-section">
              <div className="calendar-section__header">
                <div className="calendar-section__badge">
                  <Calendar size={12} />
                  30-Day AI Content Calendar
                </div>
                <h3 className="calendar-section__title">Your Full Month of Content</h3>
                <p className="calendar-section__subtitle">30 personalized content ideas — one for every day. Never stare at a blank page again.</p>
                <button
                  className={`gen-btn gen-btn--calendar ${calendarLoading ? 'gen-btn--loading' : ''}`}
                  onClick={handleGenerateCalendar}
                  disabled={calendarLoading}
                >
                  {calendarLoading ? (
                    <>
                      <div className="gen-btn__spinner" />
                      Generating Calendar...
                    </>
                  ) : (
                    <>
                      <Calendar size={17} />
                      Generate 30-Day Calendar
                    </>
                  )}
                </button>
              </div>

              {/* Calendar loading skeleton */}
              {calendarLoading && (
                <div className="calendar-skeleton">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="calendar-skeleton__row">
                      <div className="calendar-skeleton__day" />
                      <div className="calendar-skeleton__platform" />
                      <div className="calendar-skeleton__idea" />
                    </div>
                  ))}
                </div>
              )}

              {/* Calendar table */}
              {calendarReady && (
                <div className="calendar-wrap">
                  <div className="calendar-table-scroll">
                    <table className="calendar-table">
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Platform</th>
                          <th>Content Idea</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calendarRows.map((row, idx) => (
                          <tr key={row.day} className="calendar-table__row" style={{ animationDelay: `${idx * 0.03}s` }}>
                            <td className="calendar-table__day">{row.day}</td>
                            <td className="calendar-table__platform">
                              <span className={`calendar-table__platform-tag calendar-table__platform-tag--${row.platform.includes('Reel') ? 'reel' : row.platform === 'Carousel' ? 'carousel' : row.platform === 'TikTok' ? 'tiktok' : row.platform.includes('Story') ? 'story' : 'facebook'}`}>
                                {row.platform}
                              </span>
                            </td>
                            <td className="calendar-table__idea">{row.idea}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="calendar-section__actions">
                    <button className={`action-btn action-btn--copy ${calendarCopied ? 'action-btn--copied' : ''}`} onClick={handleCopyCalendar}>
                      {calendarCopied ? (
                        <>Copied Successfully <Check size={15} /></>
                      ) : (
                        <><Copy size={15} /> Copy Calendar</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="pricing" id="pricing">
        <div className="pricing__inner">
          <div className="section-label section-label--cyan">
            <Crown size={14} />
            Pricing
          </div>
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-desc">Start free. Upgrade when you need more power.</p>
          <div className="pricing__grid">
            <div className="plan-card">
              <div className="plan-card__header">
                <h3 className="plan-card__tier">Free</h3>
                <div className="plan-card__price">
                  <span className="plan-card__amount">$0</span>
                  <span className="plan-card__period">/month</span>
                </div>
              </div>
              <p className="plan-card__tagline">Perfect for trying out AI content generation.</p>
              <ul className="plan-card__list">
                <li><Check size={15} /> 3 generations per day</li>
                <li><Check size={15} /> All 5 content types</li>
                <li><Check size={15} /> Standard AI outputs</li>
              </ul>
              <button className="plan-card__btn plan-card__btn--outline">Get Started Free</button>
            </div>
            <div className="plan-card plan-card--pro">
              <div className="plan-card__badge">Most Popular</div>
              <div className="plan-card__top-line" />
              <div className="plan-card__header">
                <h3 className="plan-card__tier">Pro</h3>
                <div className="plan-card__price">
                  <span className="plan-card__amount">$19</span>
                  <span className="plan-card__period">/month</span>
                </div>
              </div>
              <p className="plan-card__tagline">For creators who need unlimited content.</p>
              <ul className="plan-card__list">
                <li><Check size={15} /> Unlimited generations</li>
                <li><Check size={15} /> All 5 content types</li>
                <li><Check size={15} /> Premium templates</li>
                <li><Check size={15} /> History &amp; exports</li>
                <li><Check size={15} /> Priority support</li>
              </ul>
              <button className="plan-card__btn plan-card__btn--pro">
                Start Pro Trial
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="about" id="about">
        <div className="about__inner">
          <div className="section-label section-label--purple">
            <Sparkles size={14} />
            About
          </div>
          <h2 className="section-title">Built For Creators Who Ship Fast</h2>
          <p className="section-desc" style={{ maxWidth: 600, margin: '0 auto 40px' }}>
            Business Buddy AI was born from a simple truth: most creators spend more time staring at a blank page than actually creating. We built an AI that understands your business, your audience, and your goals — so you can focus on what matters.
          </p>
          <div className="about__grid">
            <div className="about__stat"><span className="about__stat-num">50ms</span><span className="about__stat-label">Avg. Generation Time</span></div>
            <div className="about__stat"><span className="about__stat-num">7</span><span className="about__stat-label">Content Types</span></div>
            <div className="about__stat"><span className="about__stat-num">99.9%</span><span className="about__stat-label">Uptime</span></div>
            <div className="about__stat"><span className="about__stat-num">24/7</span><span className="about__stat-label">AI Availability</span></div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="nav__logo-mark nav__logo-mark--sm"><Sparkles size={13} /></div>
            <span>Business Buddy AI</span>
          </div>
          <p className="footer__tagline">Your Daily AI Marketing Assistant.</p>
          <p className="footer__copy">&copy; 2026 Business Buddy AI. All rights reserved.</p>
        </div>
      </footer>

      {/* ===== TOAST ===== */}
      {showToast && (
        <div className="toast">
          <FileText size={15} />
          PDF Export coming soon.
        </div>
      )}
    </div>
  )
}

export default App
