"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  FileText, Presentation, Sheet, File,
  Sparkles, Zap, Shield, Globe, Download,
  Star, ArrowRight, Check,
} from "lucide-react";

/* ─── Data ─── */

const DOC_TYPES = [
  { icon: File,         label: "PDF Reports",  color: "#ef4444", grad: "linear-gradient(135deg,#ef4444,#f97316)", desc: "Professional reports with rich formatting" },
  { icon: FileText,     label: "Word Docs",    color: "#3b82f6", grad: "linear-gradient(135deg,#3b82f6,#06b6d4)", desc: "Editable documents with styling" },
  { icon: Presentation, label: "PowerPoint",   color: "#8b5cf6", grad: "linear-gradient(135deg,#8b5cf6,#a855f7)", desc: "Stunning slide decks" },
  { icon: Sheet,        label: "Excel Sheets", color: "#10b981", grad: "linear-gradient(135deg,#10b981,#14b8a6)", desc: "Data-rich spreadsheets with charts" },
];

const FEATURES = [
  { icon: Sparkles, title: "AI-Powered",         desc: "GPT-4o generates publication-ready content in seconds",   iconBg: "rgba(59,130,246,0.12)",  iconColor: "#60a5fa" },
  { icon: Zap,      title: "Instant Generation",  desc: "From idea to download in under 30 seconds",               iconBg: "rgba(234,179,8,0.12)",   iconColor: "#facc15" },
  { icon: Shield,   title: "ATS Optimizer",       desc: "Resume scoring and keyword optimization built-in",        iconBg: "rgba(16,185,129,0.12)",  iconColor: "#34d399" },
  { icon: Globe,    title: "12+ Templates",        desc: "Business, academic, career, and creative templates",      iconBg: "rgba(139,92,246,0.12)",  iconColor: "#a78bfa" },
  { icon: Download, title: "4 File Formats",       desc: "PDF, Word, PowerPoint, and Excel — all from one prompt", iconBg: "rgba(236,72,153,0.12)",  iconColor: "#f472b6" },
  { icon: Star,     title: "Version History",      desc: "Never lose work — restore any previous version",         iconBg: "rgba(249,115,22,0.12)",  iconColor: "#fb923c" },
];

const PLANS = [
  {
    name: "Free",    price: "$0",  tokens: "10 tokens/mo",
    grad: "linear-gradient(135deg,#64748b,#475569)",
    features: ["10 generations/month","PDF & Word only","5 templates","Basic editor"],
    cta: "Get Started", popular: false,
  },
  {
    name: "Pro",     price: "$19", tokens: "100 tokens/mo",
    grad: "linear-gradient(135deg,#2563eb,#7c3aed)",
    features: ["100 generations/month","All 4 formats","All templates","Advanced editor","Version history","AI suggestions"],
    cta: "Start Pro", popular: true,
  },
  {
    name: "Premium", price: "$49", tokens: "Unlimited",
    grad: "linear-gradient(135deg,#f59e0b,#f97316)",
    features: ["Unlimited generations","All 4 formats","Custom templates","AI Slides Designer","ATS Optimizer","Excel Charts","Priority AI","Share links"],
    cta: "Go Premium", popular: false,
  },
];

const STEPS = [
  { n: "01", title: "Describe Your Document", desc: "Enter your topic, tone, and any specific requirements."         },
  { n: "02", title: "AI Generates Content",   desc: "GPT-4o crafts structured, high-quality content instantly."      },
  { n: "03", title: "Edit & Download",        desc: "Refine in the rich editor, then download in your chosen format."},
];

/* ─── Animation ─── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.09, ease: "easeOut" },
  }),
};

/* ─── Component ─── */

export default function LandingPage() {
  return (
    <>
      {/* Global base styles injected inline so no Tailwind config dependency */}
      <style>{`
        .dg-page { min-height:100vh; background:#07070f; color:#fff; overflow-x:hidden; font-family:inherit; }

        /* NAV */
        .dg-nav { position:fixed; top:0; left:0; right:0; z-index:50; height:68px; background:rgba(7,7,15,0.88); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,0.07); display:flex; align-items:center; }
        .dg-nav-inner { max-width:1200px; margin:0 auto; padding:0 24px; width:100%; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .dg-nav-logo { display:flex; align-items:center; gap:10px; flex-shrink:0; }
        .dg-nav-icon { width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg,#2563eb,#7c3aed); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .dg-nav-name { font-size:17px; font-weight:800; letter-spacing:-0.3px; white-space:nowrap; }
        .dg-nav-name span { color:#60a5fa; }
        .dg-nav-links { display:flex; gap:28px; }
        .dg-nav-links a { font-size:13px; font-weight:500; color:rgba(255,255,255,0.5); text-decoration:none; transition:color 0.2s; }
        .dg-nav-links a:hover { color:#fff; }
        .dg-nav-actions { display:flex; align-items:center; gap:16px; flex-shrink:0; }
        .dg-signin { font-size:13px; font-weight:500; color:rgba(255,255,255,0.5); text-decoration:none; white-space:nowrap; transition:color 0.2s; }
        .dg-signin:hover { color:#fff; }
        .dg-btn-nav { background:#fff; color:#000; font-size:13px; font-weight:700; padding:9px 20px; border-radius:999px; text-decoration:none; white-space:nowrap; transition:opacity 0.2s; }
        .dg-btn-nav:hover { opacity:0.88; }

        /* HERO */
        .dg-hero { padding-top:140px; padding-bottom:80px; padding-left:24px; padding-right:24px; text-align:center; position:relative; overflow:hidden; }
        .dg-hero-glow { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:800px; height:600px; background:radial-gradient(ellipse,rgba(37,99,235,0.16) 0%,transparent 68%); pointer-events:none; z-index:0; }
        .dg-hero-grid { position:absolute; inset:0; pointer-events:none; z-index:0; background-image:linear-gradient(rgba(92,124,250,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(92,124,250,0.12) 1px,transparent 1px); background-size:56px 56px; }
        .dg-hero-content { position:relative; z-index:1; max-width:900px; margin:0 auto; }
        .dg-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); padding:7px 18px; border-radius:999px; font-size:13px; font-weight:500; color:#93c5fd; margin-bottom:32px; }
        .dg-h1 { font-size:clamp(40px,6vw,80px); font-weight:800; letter-spacing:-2px; line-height:1.07; margin:0 0 20px; }
        .dg-h1-grad { background:linear-gradient(90deg,#60a5fa,#a78bfa,#f472b6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .dg-hero-sub { font-size:clamp(15px,1.8vw,19px); color:rgba(255,255,255,0.5); max-width:560px; margin:0 auto 36px; line-height:1.75; font-weight:400; }
        .dg-hero-btns { display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap; margin-bottom:64px; }
        .dg-btn-primary { background:#fff; color:#000; font-size:15px; font-weight:700; padding:14px 32px; border-radius:999px; text-decoration:none; display:inline-flex; align-items:center; gap:8px; transition:transform 0.2s,opacity 0.2s; }
        .dg-btn-primary:hover { transform:scale(1.02); opacity:0.9; }
        .dg-btn-ghost { color:rgba(255,255,255,0.65); font-size:15px; font-weight:600; padding:14px 32px; border-radius:999px; text-decoration:none; border:1px solid rgba(255,255,255,0.1); transition:background 0.2s,color 0.2s; }
        .dg-btn-ghost:hover { background:rgba(255,255,255,0.06); color:#fff; }

        /* DOC CARDS */
        .dg-doc-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        .dg-doc-card { background:rgba(18,18,28,0.92); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:24px 16px; text-align:center; display:flex; flex-direction:column; align-items:center; transition:transform 0.2s,background 0.2s; }
        .dg-doc-card:hover { transform:translateY(-6px); background:rgba(26,26,40,0.95); }
        .dg-doc-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; flex-shrink:0; }
        .dg-doc-title { font-size:14px; font-weight:700; margin-bottom:6px; }
        .dg-doc-desc { font-size:12px; color:rgba(255,255,255,0.42); line-height:1.55; }

        /* SECTION */
        .dg-section { padding:80px 24px; }
        .dg-section-alt { background:#0a0a14; }
        .dg-divider { border:none; border-top:1px solid rgba(255,255,255,0.06); margin:0; }
        .dg-inner { max-width:1120px; margin:0 auto; }
        .dg-inner-sm { max-width:840px; margin:0 auto; }
        .dg-section-head { text-align:center; margin-bottom:52px; }
        .dg-h2 { font-size:clamp(26px,4vw,48px); font-weight:800; letter-spacing:-1px; line-height:1.12; margin:0 0 12px; }
        .dg-h2-sub { font-size:15px; color:rgba(255,255,255,0.45); max-width:360px; margin:0 auto; line-height:1.6; }
        .dg-grad-blue  { background:linear-gradient(90deg,#60a5fa,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .dg-grad-vp    { background:linear-gradient(90deg,#a78bfa,#f472b6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .dg-grad-green { background:linear-gradient(90deg,#34d399,#2dd4bf); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        /* FEATURES */
        .dg-features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .dg-feature-card { background:rgba(18,18,28,0.7); border:1px solid rgba(255,255,255,0.07); border-radius:18px; padding:26px; transition:transform 0.2s,background 0.2s; }
        .dg-feature-card:hover { transform:translateY(-4px); background:rgba(26,26,40,0.85); }
        .dg-feature-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; flex-shrink:0; }
        .dg-feature-title { font-size:15px; font-weight:700; margin-bottom:7px; }
        .dg-feature-desc { font-size:13px; color:rgba(255,255,255,0.45); line-height:1.65; }

        /* STEPS */
        .dg-steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:48px; }
        .dg-step { text-align:center; display:flex; flex-direction:column; align-items:center; }
        .dg-step-num { width:76px; height:76px; border-radius:22px; background:rgba(37,99,235,0.1); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; margin-bottom:20px; font-size:30px; font-weight:800; color:#60a5fa; transition:transform 0.25s,background 0.25s; }
        .dg-step:hover .dg-step-num { transform:scale(1.1); background:rgba(37,99,235,0.18); }
        .dg-step-title { font-size:16px; font-weight:700; margin-bottom:10px; }
        .dg-step-desc { font-size:13px; color:rgba(255,255,255,0.45); line-height:1.65; max-width:200px; }

        /* PRICING */
        .dg-plans-wrap { display:flex; align-items:stretch; gap:0; }
        .dg-plan { background:rgba(18,18,28,0.85); border:1px solid rgba(255,255,255,0.07); border-radius:22px; padding:32px 28px; display:flex; flex-direction:column; flex:1; transition:transform 0.2s; }
        .dg-plan:hover { transform:translateY(-6px); }
        .dg-plan.popular { background:#13132b; border:2px solid rgba(37,99,235,0.65); box-shadow:0 0 50px rgba(37,99,235,0.14); transform:scaleY(1.025); z-index:2; border-radius:26px; }
        .dg-plan.popular:hover { transform:scaleY(1.025) translateY(-6px); }
        .dg-pop-badge { position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:#2563eb; color:#fff; font-size:10px; font-weight:700; letter-spacing:1.5px; padding:5px 16px; border-radius:999px; white-space:nowrap; text-transform:uppercase; }
        .dg-plan-wrap { position:relative; flex:1; display:flex; }
        .dg-plan-icon { width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center; margin-bottom:18px; flex-shrink:0; }
        .dg-plan-name { font-size:26px; font-weight:800; margin-bottom:4px; }
        .dg-plan-price { font-size:52px; font-weight:800; line-height:1; display:inline; }
        .dg-plan-per { font-size:15px; color:rgba(255,255,255,0.35); font-weight:400; }
        .dg-plan-tokens { font-size:12px; font-weight:700; color:#60a5fa; margin-top:6px; margin-bottom:22px; }
        .dg-plan-features { list-style:none; padding:0; margin:0 0 24px; flex:1; }
        .dg-plan-feature { display:flex; align-items:flex-start; gap:10px; padding:6px 0; font-size:14px; color:rgba(255,255,255,0.62); }
        .dg-check { width:18px; height:18px; border-radius:50%; background:rgba(16,185,129,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
        .dg-plan-btn { display:block; width:100%; text-align:center; padding:14px; border-radius:13px; font-size:14px; font-weight:700; text-decoration:none; transition:opacity 0.2s,background 0.2s; }
        .dg-plan-btn.white { background:#fff; color:#000; }
        .dg-plan-btn.white:hover { opacity:0.88; }
        .dg-plan-btn.outline { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); color:#fff; }
        .dg-plan-btn.outline:hover { background:rgba(255,255,255,0.1); }

        /* CTA */
        .dg-cta-box { max-width:640px; margin:0 auto; text-align:center; background:rgba(18,18,28,0.92); border:1px solid rgba(37,99,235,0.18); border-radius:40px; padding:64px 48px; position:relative; z-index:1; }
        .dg-cta-h2 { font-size:clamp(28px,4.5vw,54px); font-weight:800; letter-spacing:-1.5px; margin:0 0 14px; }
        .dg-cta-sub { font-size:16px; color:rgba(255,255,255,0.45); margin:0 0 32px; max-width:420px; margin-left:auto; margin-right:auto; line-height:1.7; }

        /* FOOTER */
        .dg-footer { background:#07070f; border-top:1px solid rgba(255,255,255,0.06); padding:32px 24px; text-align:center; color:rgba(255,255,255,0.3); font-size:12px; }
        .dg-footer-logo { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px; font-size:15px; font-weight:800; color:rgba(255,255,255,0.5); }

        /* ── RESPONSIVE ── */
        @media (max-width:900px) {
          .dg-doc-grid { grid-template-columns:repeat(2,1fr); }
          .dg-features-grid { grid-template-columns:repeat(2,1fr); }
          .dg-steps-grid { grid-template-columns:1fr; gap:32px; }
          .dg-step-desc { max-width:100%; }
          .dg-plans-wrap { flex-direction:column; gap:16px; }
          .dg-plan.popular { transform:none; }
          .dg-plan.popular:hover { transform:translateY(-6px); }
          .dg-nav-links { display:none; }
          .dg-cta-box { padding:48px 28px; }
        }
        @media (max-width:600px) {
          .dg-doc-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
          .dg-features-grid { grid-template-columns:1fr; }
          .dg-hero { padding-top:100px; }
          .dg-h1 { letter-spacing:-1px; }
          .dg-hero-btns { flex-direction:column; width:100%; }
          .dg-btn-primary, .dg-btn-ghost { width:100%; justify-content:center; }
          .dg-section { padding:60px 18px; }
          .dg-signin { display:none; }
        }
      `}</style>

      <div className="dg-page">

        {/* ── Navbar ── */}
        <motion.nav
          className="dg-nav"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="dg-nav-inner">
            <div className="dg-nav-logo">
              <div className="dg-nav-icon">
                <Sparkles style={{ width: 18, height: 18, color: "#fff" }} />
              </div>
              <span className="dg-nav-name">DocGenius <span>AI</span></span>
            </div>
            <div className="dg-nav-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="dg-nav-actions">
              <Link href="/login" className="dg-signin">Sign in</Link>
              <Link href="/signup" className="dg-btn-nav">Get Started Free</Link>
            </div>
          </div>
        </motion.nav>

        {/* ── Hero ── */}
        <section className="dg-hero">
          <div className="dg-hero-glow" />
          <div className="dg-hero-grid" />
          <div className="dg-hero-content">


            <motion.h1
              variants={fadeUp} initial="hidden" animate="show" custom={1}
              className="dg-h1"
            >
              Create Professional
              <br />
              <span className="dg-h1-grad">Documents with AI</span>
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="show" custom={2}
              className="dg-hero-sub"
            >
              Generate high-quality PDFs, Word documents, PowerPoint presentations,
              and Excel spreadsheets in seconds. Just describe what you need.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={3}
              className="dg-hero-btns"
            >
              <Link href="/signup" className="dg-btn-primary">
                Start Generating Free <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/login" className="dg-btn-ghost">Sign In</Link>
            </motion.div>

            {/* Doc Cards */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={4}
              className="dg-doc-grid"
            >
              {DOC_TYPES.map((t) => (
                <div key={t.label} className="dg-doc-card">
                  <div className="dg-doc-icon" style={{ background: t.grad }}>
                    <t.icon style={{ width: 24, height: 24, color: "#fff" }} />
                  </div>
                  <div className="dg-doc-title">{t.label}</div>
                  <div className="dg-doc-desc">{t.desc}</div>
                </div>
              ))}
            </motion.div>

          </div>
        </section>

        <hr className="dg-divider" />

        {/* ── Features ── */}
        <section id="features" className="dg-section dg-section-alt">
          <div className="dg-inner">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="dg-section-head"
            >
              <h2 className="dg-h2">
                Everything You Need to{" "}
                <span className="dg-grad-blue">Create Better Docs</span>
              </h2>
              <p className="dg-h2-sub">A complete AI-powered document suite right in your browser.</p>
            </motion.div>

            <div className="dg-features-grid">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                  className="dg-feature-card"
                >
                  <div className="dg-feature-icon" style={{ background: f.iconBg }}>
                    <f.icon style={{ width: 22, height: 22, color: f.iconColor }} />
                  </div>
                  <div className="dg-feature-title">{f.title}</div>
                  <div className="dg-feature-desc">{f.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <hr className="dg-divider" />

        {/* ── How It Works ── */}
        <section id="how-it-works" className="dg-section">
          <div className="dg-inner-sm">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="dg-section-head"
            >
              <h2 className="dg-h2">
                Three Steps to a{" "}
                <span className="dg-grad-vp">Perfect Document</span>
              </h2>
            </motion.div>

            <div className="dg-steps-grid">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                  className="dg-step"
                >
                  <div className="dg-step-num">{s.n}</div>
                  <div className="dg-step-title">{s.title}</div>
                  <div className="dg-step-desc">{s.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <hr className="dg-divider" />

        {/* ── Pricing ── */}
        <section id="pricing" className="dg-section dg-section-alt">
          <div className="dg-inner">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="dg-section-head"
            >
              <h2 className="dg-h2">
                Simple,{" "}
                <span className="dg-grad-green">Transparent Pricing</span>
              </h2>
              <p className="dg-h2-sub">Start free, upgrade when you need more power</p>
            </motion.div>

            <div className="dg-plans-wrap">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  className="dg-plan-wrap"
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                >
                  {plan.popular && <div className="dg-pop-badge">MOST POPULAR</div>}
                  <div className={`dg-plan${plan.popular ? " popular" : ""}`} style={{ width: "100%" }}>
                    <div className="dg-plan-icon" style={{ background: plan.grad }}>
                      <Star style={{ width: 20, height: 20, color: "#fff" }} />
                    </div>
                    <div className="dg-plan-name">{plan.name}</div>
                    <div>
                      <span className="dg-plan-price">{plan.price}</span>
                      <span className="dg-plan-per">/mo</span>
                    </div>
                    <div className="dg-plan-tokens">{plan.tokens}</div>
                    <ul className="dg-plan-features">
                      {plan.features.map((feat) => (
                        <li key={feat} className="dg-plan-feature">
                          <div className="dg-check">
                            <Check style={{ width: 10, height: 10, color: "#34d399" }} />
                          </div>
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup" className={`dg-plan-btn ${plan.popular ? "white" : "outline"}`}>
                      {plan.cta}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <hr className="dg-divider" />

        {/* ── CTA ── */}
        <section className="dg-section" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 500, background: "radial-gradient(ellipse,rgba(37,99,235,0.09) 0%,transparent 68%)", pointerEvents: "none" }} />
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="dg-cta-box"
          >
            <Sparkles style={{ width: 44, height: 44, color: "#60a5fa", margin: "0 auto 20px" }} />
            <h2 className="dg-cta-h2">Ready to Create?</h2>
            <p className="dg-cta-sub">Join thousands of professionals using AI to create better documents, faster.</p>
            <Link href="/signup" className="dg-btn-primary" style={{ display: "inline-flex" }}>
              Start for Free <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </motion.div>
        </section>

        {/* ── Footer ── */}
        <footer className="dg-footer">
          <div className="dg-footer-logo">
            <Sparkles style={{ width: 16, height: 16, color: "#60a5fa" }} />
            DocGenius AI
          </div>
          <p>© 2026 DocGenius AI. Built with Next.js + GPT-4o.</p>
        </footer>

      </div>
    </>
  );
}