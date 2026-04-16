'use client';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import Link from 'next/link';

export default function ConnectPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#000' }}>
      <motion.div
        className="w-full max-w-sm text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo mark */}
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(0,113,227,0.12)', border: '1px solid rgba(0,113,227,0.2)' }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Shield size={32} color="#0071e3" />
        </motion.div>

        <h1
          className="font-semibold text-text-primary mb-2"
          style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}
        >
          Connect your wallet
        </h1>
        <p className="text-text-secondary mb-10 leading-relaxed">
          Sign in with MetaMask to access ChainGuard AML. You&apos;ll sign a message to prove wallet ownership — no transaction is made.
        </p>

        <WalletConnectButton />

        <p className="mt-8 text-xs text-text-tertiary leading-relaxed">
          By connecting, you agree to complete KYC verification. Your identity documents are processed securely and never stored on-chain.
        </p>

        <Link href="/" className="block mt-6 text-sm text-apple-blue hover:underline">
          ← Back to home
        </Link>
      </motion.div>
    </div>
  );
}
