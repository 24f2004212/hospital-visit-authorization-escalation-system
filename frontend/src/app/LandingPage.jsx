import { useState, useEffect, useRef } from 'react';
import { FiShield, FiMapPin, FiAlertTriangle, FiMessageSquare, FiBarChart2, FiArrowRight, FiCheckCircle, FiClock, FiUsers, FiHeart } from 'react-icons/fi';

export default function LandingPage({ onGetStarted }) {
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [heroReady, setHeroReady] = useState(false);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    setTimeout(() => setHeroReady(true), 200);
  }, []);

  // Animated counters
  useEffect(() => {
    if (!heroReady) return;
    const dur = 2000;
    const steps = 40;
    const interval = dur / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount1(Math.round(ease * 500));
      setCount2(Math.round(ease * 98));
      setCount3(Math.round(ease * 24));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [heroReady]);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.dataset.section]));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <FiShield />,
      title: 'Digital Approvals',
      desc: 'Students submit requests instantly. Wardens approve digitally and assign hostel guards — no paperwork needed.',
      color: '#00d4aa',
      bg: 'rgba(0,212,170,0.08)',
    },
    {
      icon: <FiMapPin />,
      title: 'Real-Time Tracking',
      desc: 'Track guard assignments and student hospital visits in real time with a live progress tracker.',
      color: '#3b9eff',
      bg: 'rgba(59,158,255,0.08)',
    },
    {
      icon: <FiAlertTriangle />,
      title: 'Auto-Escalation',
      desc: 'Smart escalation alerts parents, proctors, and wardens automatically if approvals are delayed or emergencies arise.',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
    },
    {
      icon: <FiMessageSquare />,
      title: 'Post-Visit Feedback',
      desc: 'Students provide feedback after each visit — rate hospitals, guard behavior, and suggest improvements.',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
    },
    {
      icon: <FiBarChart2 />,
      title: 'Analytics Dashboard',
      desc: 'Comprehensive analytics for hostel management — visit trends, guard utilization, escalation rates, and more.',
      color: '#a855f7',
      bg: 'rgba(168,85,247,0.08)',
    },
    {
      icon: <FiHeart />,
      title: 'Student Well-being',
      desc: 'Designed to ensure student safety with proper communication between students, wardens, and parents.',
      color: '#ec4899',
      bg: 'rgba(236,72,153,0.08)',
    },
  ];

  const steps = [
    { num: '01', title: 'Submit Request', desc: 'Student fills out a simple form with visit reason, urgency, preferred date & hospital.', icon: '📝' },
    { num: '02', title: 'Warden Approves', desc: 'Warden reviews the request, approves digitally, and assigns a hostel guard.', icon: '✅' },
    { num: '03', title: 'Live Tracking', desc: 'Guard accompanies the student. Real-time progress updates from departure to return.', icon: '📍' },
    { num: '04', title: 'Feedback & Analytics', desc: 'Post-visit feedback collected. Analytics dashboard generated for hostel management.', icon: '📊' },
  ];

  const addRef = (el, index) => {
    sectionRefs.current[index] = el;
  };

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="animated-bg"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="landing-orb landing-orb-3"></div>

      {/* Navbar */}
      <nav className={`landing-nav ${heroReady ? 'landing-nav-visible' : ''}`}>
        <div className="landing-nav-brand">
          <div className="landing-nav-logo">🏥</div>
          <span className="landing-nav-name">Care<span>Sync</span></span>
        </div>
        <button className="landing-nav-cta" onClick={onGetStarted}>
          Get Started <FiArrowRight />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className={`hero-content ${heroReady ? 'hero-content-visible' : ''}`}>
          <div className="hero-badge">
            <FiShield size={14} />
            <span>Student Well-being & Counselling</span>
          </div>
          <h1 className="hero-title">
            Hospital Visit
            <br />
            <span className="hero-title-gradient">Authorization & Escalation</span>
            <br />
            System
          </h1>
          <p className="hero-description">
            A simple, low-cost, and user-friendly solution for hostel students to request hospital visits, 
            track guard assignments in real time, and ensure student safety with automated escalation alerts.
          </p>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={onGetStarted}>
              Launch Dashboard <FiArrowRight />
            </button>
            <a href="#features" className="hero-btn-secondary">
              Explore Features
            </a>
          </div>

          {/* Live Stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{count1}+</div>
              <div className="hero-stat-label">Visits Managed</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-value">{count2}%</div>
              <div className="hero-stat-label">On-Time Returns</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-value">{count3}/7</div>
              <div className="hero-stat-label">Active Monitoring</div>
            </div>
          </div>
        </div>

        {/* Hero Visual — Floating Cards */}
        <div className={`hero-visual ${heroReady ? 'hero-visual-visible' : ''}`}>
          <div className="floating-card fc-1 glass-card">
            <div className="fc-icon" style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa' }}><FiCheckCircle /></div>
            <div>
              <div className="fc-title">Request Approved</div>
              <div className="fc-sub">Ananya V. — Fever/Flu</div>
            </div>
          </div>
          <div className="floating-card fc-2 glass-card">
            <div className="fc-icon" style={{ background: 'rgba(59,158,255,0.1)', color: '#3b9eff' }}><FiMapPin /></div>
            <div>
              <div className="fc-title">🟢 At Hospital</div>
              <div className="fc-sub">Guard: Rajesh K.</div>
            </div>
          </div>
          <div className="floating-card fc-3 glass-card">
            <div className="fc-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><FiAlertTriangle /></div>
            <div>
              <div className="fc-title">⚠️ Auto-Escalated</div>
              <div className="fc-sub">Parent & Proctor notified</div>
            </div>
          </div>
          <div className="floating-card fc-4 glass-card">
            <div className="fc-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><FiClock /></div>
            <div>
              <div className="fc-title">Avg. Response</div>
              <div className="fc-sub" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>4.2 min</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="landing-section"
        id="features"
        data-section="features"
        ref={(el) => addRef(el, 0)}
      >
        <div className={`section-inner ${visibleSections.has('features') ? 'section-visible' : ''}`}>
          <div className="landing-section-header">
            <span className="landing-section-badge">Features</span>
            <h2>Everything You Need for<br /><span className="text-gradient">Safe Hospital Visits</span></h2>
            <p>A complete workflow from request submission to analytics — ensuring student safety and proper communication.</p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div
                className="feature-card glass-card"
                key={i}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="feature-card-icon" style={{ background: f.bg, color: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        className="landing-section"
        data-section="workflow"
        ref={(el) => addRef(el, 1)}
      >
        <div className={`section-inner ${visibleSections.has('workflow') ? 'section-visible' : ''}`}>
          <div className="landing-section-header">
            <span className="landing-section-badge">Workflow</span>
            <h2>How It <span className="text-gradient">Works</span></h2>
            <p>Four simple steps from request to completion — ensuring student safety and transparent communication at every stage.</p>
          </div>

          <div className="workflow-grid">
            {steps.map((step, i) => (
              <div className="workflow-step" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="workflow-step-number">{step.num}</div>
                <div className="workflow-step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < steps.length - 1 && <div className="workflow-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section
        className="landing-section"
        data-section="problem"
        ref={(el) => addRef(el, 2)}
      >
        <div className={`section-inner ${visibleSections.has('problem') ? 'section-visible' : ''}`}>
          <div className="landing-section-header">
            <span className="landing-section-badge">Problem</span>
            <h2>Why <span className="text-gradient">CareSync</span>?</h2>
          </div>

          <div className="problem-grid">
            <div className="problem-card glass-card problem-before">
              <h3>❌ Without CareSync</h3>
              <ul>
                <li>No proper online request and approval system</li>
                <li>No structured method to assign and track guards</li>
                <li>No automated alerts for parents during emergencies</li>
                <li>No mechanism to record feedback or visit history</li>
                <li>Delayed medical attention in urgent situations</li>
              </ul>
            </div>
            <div className="problem-card glass-card problem-after">
              <h3>✅ With CareSync</h3>
              <ul>
                <li>Online request and digital approval workflow</li>
                <li>Real-time guard assignment and visit tracking</li>
                <li>Auto-escalation with parent & proctor notifications</li>
                <li>Post-visit feedback and analytics dashboard</li>
                <li>Immediate emergency request auto-approval</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section
        className="landing-section"
        data-section="roles"
        ref={(el) => addRef(el, 3)}
      >
        <div className={`section-inner ${visibleSections.has('roles') ? 'section-visible' : ''}`}>
          <div className="landing-section-header">
            <span className="landing-section-badge">User Roles</span>
            <h2>Built for <span className="text-gradient">Everyone</span></h2>
            <p>Role-based access for students, wardens, proctors, guards, and administrators.</p>
          </div>

          <div className="roles-grid">
            {[
              { emoji: '🎓', role: 'Student', desc: 'Submit visit requests, track status, provide feedback', color: '#00d4aa' },
              { emoji: '🛡️', role: 'Warden', desc: 'Approve requests, assign guards, manage hostel blocks', color: '#3b9eff' },
              { emoji: '👨‍🏫', role: 'Proctor', desc: 'Handle escalations, oversee student safety protocols', color: '#a855f7' },
              { emoji: '💂', role: 'Guard', desc: 'Accompany students, update tracking status in real time', color: '#f59e0b' },
            ].map((r, i) => (
              <div className="role-card glass-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="role-card-emoji">{r.emoji}</div>
                <h3 style={{ color: r.color }}>{r.role}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="landing-section landing-cta-section"
        data-section="cta"
        ref={(el) => addRef(el, 4)}
      >
        <div className={`section-inner ${visibleSections.has('cta') ? 'section-visible' : ''}`}>
          <div className="landing-cta glass-card">
            <div className="landing-cta-glow"></div>
            <h2>Ready to Transform Hospital Visit Management?</h2>
            <p>Start using CareSync today — simple, practical, and designed for hostel environments.</p>
            <button className="hero-btn-primary" onClick={onGetStarted} style={{ margin: '0 auto' }}>
              Get Started Now <FiArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <span>🏥 Care<span className="text-gradient">Sync</span></span>
            <p>Hospital Visit Authorization & Escalation System</p>
          </div>
          <div className="landing-footer-links">
            <span>Theme 5: Student Well-being & Counselling</span>
            <span>P11 — Problem Statement</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
