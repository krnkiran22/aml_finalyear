'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Zap, Eye, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'KYC Verification',
    description:
      'Connect your wallet and verify your identity using government-issued documents. Supports Aadhaar, PAN, Passport, and Driving License.',
  },
  {
    icon: Zap,
    title: 'Three-Part Risk Scoring',
    description:
      'Every transaction is scored across country risk, transactional patterns, and 90-day behavioural history — producing a composite 0–1000 risk score.',
  },
  {
    icon: Eye,
    title: 'On-Chain Audit Trail',
    description:
      'Verified KYC status and flagged transactions are permanently logged on Ethereum Sepolia — transparent, tamper-proof, and no PII stored on-chain.',
  },
];

const stats = [
  { label: 'Risk Score Dimensions', value: '3' },
  { label: 'Countries in Risk Database', value: '55+' },
  { label: 'Score Range', value: '0–1000' },
  { label: 'Supported Document Types', value: '4' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#000' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,113,227,0.2)' }}>
            <Shield size={16} color="#0071e3" />
          </div>
          <span className="font-semibold text-text-primary">ChainGuard AML</span>
        </div>
        <Link href="/connect" className="btn-primary text-sm py-2 px-5">
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-medium" style={{ background: 'rgba(0,113,227,0.12)', color: '#0071e3', border: '1px solid rgba(0,113,227,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-apple-blue animate-pulse" />
            Built on Ethereum Sepolia
          </div>
          <h1
            className="font-bold text-text-primary mb-6"
            style={{ fontSize: '3.5rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Blockchain-Powered
            <br />
            <span style={{ color: '#0071e3' }}>AML Compliance</span>
            <br />
            for Web3
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10" style={{ lineHeight: 1.6 }}>
            Connect your MetaMask wallet, complete KYC in minutes, and every transaction you make
            is analyzed in real-time by a three-part composite risk scoring engine.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/connect" className="btn-primary flex items-center gap-2 text-base px-8 py-3.5">
              Connect Wallet to Begin
              <ArrowRight size={18} />
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-base px-8 py-3.5">
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 px-8 border-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="text-3xl font-bold text-apple-blue mb-1" style={{ letterSpacing: '-0.02em' }}>
                {stat.value}
              </div>
              <div className="text-sm text-text-tertiary">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-semibold text-text-primary mb-4" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
              How It Works
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              A three-step compliance process designed for Web3 users — private, secure, and verifiable on-chain.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="card"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,113,227,0.12)' }}>
                    <Icon size={20} color="#0071e3" />
                  </div>
                  <div className="text-xs font-semibold text-apple-blue mb-2 uppercase tracking-wider">
                    Step {i + 1}
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2" style={{ fontSize: '1.125rem' }}>
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Risk levels */}
      <section className="py-24 px-8" style={{ background: '#0a0a0a' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-semibold text-text-primary mb-4" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
              Risk Classification
            </h2>
            <p className="text-text-secondary text-lg">
              Every transaction receives a composite score from 0–1000, mapped to four risk levels.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'SAFE', range: '0–299', color: '#30d158', desc: 'Transaction approved automatically' },
              { label: 'LOW RISK', range: '300–499', color: '#ffd60a', desc: 'Approved, flagged for monitoring' },
              { label: 'FLAGGED', range: '500–749', color: '#ff9f0a', desc: 'Transaction held, team alerted' },
              { label: 'HIGH RISK', range: '750–1000', color: '#ff453a', desc: 'Transaction blocked, account flagged' },
            ].map((level) => (
              <div
                key={level.label}
                className="card text-center"
                style={{ borderColor: `${level.color}22` }}
              >
                <div className="text-2xl font-bold mb-1" style={{ color: level.color, letterSpacing: '-0.02em' }}>
                  {level.range}
                </div>
                <div className="text-sm font-semibold mb-3" style={{ color: level.color }}>
                  {level.label}
                </div>
                <p className="text-xs text-text-tertiary leading-relaxed">{level.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 text-center">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-semibold text-text-primary mb-4" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            Ready to get compliant?
          </h2>
          <p className="text-text-secondary text-lg mb-8">
            Join and complete your KYC in under 5 minutes. Your identity data is never stored on-chain.
          </p>
          <div className="flex items-center justify-center gap-3 mb-8">
            {['No personal data on-chain', 'OCR-powered verification', 'Real-time risk scoring'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle size={14} color="#30d158" />
                {item}
              </div>
            ))}
          </div>
          <Link href="/connect" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4">
            Connect Wallet
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="text-sm text-text-tertiary">
          © 2025 ChainGuard AML. Built for compliance, designed for humans.
        </p>
      </footer>
    </div>
  );
}
