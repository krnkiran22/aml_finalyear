'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, Upload, CheckCircle, XCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { DocumentType } from '@/lib/shared';
import { INDIAN_COUNTRY_CODE } from '@/lib/shared';

const STEP_LABELS = ['Country', 'Document', 'Upload', 'Verify'];

const ALL_COUNTRIES = [
  { name: 'India', code: 'IN', flag: '🇮🇳' },
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { name: 'France', code: 'FR', flag: '🇫🇷' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  { name: 'UAE', code: 'AE', flag: '🇦🇪' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷' },
  { name: 'China', code: 'CN', flag: '🇨🇳' },
  { name: 'South Korea', code: 'KR', flag: '🇰🇷' },
];

type KYCStep = 1 | 2 | 3 | 4;

export default function KYCPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const {
    country, countryCode, documentType,
    setCountry, setDocumentType, setDocumentUrl, setKYCVerified,
  } = useOnboardingStore();

  const [step, setStep] = useState<KYCStep>(1);
  const [countrySearch, setCountrySearch] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    status: 'VERIFIED' | 'REJECTED';
    reason?: string;
    confidence: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isIndian = countryCode === INDIAN_COUNTRY_CODE;
  const docTypes: { value: DocumentType; label: string }[] = isIndian
    ? [
        { value: 'AADHAAR', label: 'Aadhaar Card' },
        { value: 'PAN', label: 'PAN Card' },
        { value: 'PASSPORT', label: 'Passport' },
      ]
    : [
        { value: 'PASSPORT', label: 'Passport' },
        { value: 'DRIVING_LICENSE', label: 'Driving License' },
      ];

  const filteredCountries = ALL_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  }

  async function handleUpload() {
    if (!file || !documentType) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      const res = await api.upload<{ documentUrl: string }>('/kyc/upload', formData, token ?? undefined);
      setDocumentUrl(res.documentUrl);
      setStep(4);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleVerify() {
    setVerifying(true);
    setError(null);
    try {
      const res = await api.post<{
        kycStatus: 'VERIFIED' | 'REJECTED';
        confidence: number;
        rejectedReason?: string;
      }>('/kyc/verify', {}, token ?? undefined);
      setVerifyResult({ status: res.kycStatus, reason: res.rejectedReason, confidence: res.confidence });
      setKYCVerified(res.kycStatus === 'VERIFIED');
      if (res.kycStatus === 'VERIFIED') {
        setTimeout(() => router.push('/income'), 2000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ background: '#000' }}>
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,113,227,0.12)' }}>
            <Shield size={16} color="#0071e3" />
          </div>
          <span className="font-semibold text-text-primary">KYC Verification</span>
        </div>

        <OnboardingProgressBar currentStep={step} totalSteps={4} labels={STEP_LABELS} />

        <AnimatePresence mode="wait">
          {/* Step 1: Country */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="font-semibold text-text-primary mb-2" style={{ fontSize: '1.375rem', letterSpacing: '-0.01em' }}>
                Select your country
              </h2>
              <p className="text-text-secondary text-sm mb-6">
                We&apos;ll show you the accepted identity documents based on your country.
              </p>
              <input
                className="input-field mb-4"
                placeholder="Search countries..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
              />
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCountry(c.name, c.code)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: countryCode === c.code ? 'rgba(0,113,227,0.12)' : 'rgba(255,255,255,0.04)',
                      border: countryCode === c.code ? '1px solid rgba(0,113,227,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span className="text-xl">{c.flag}</span>
                    <span className="text-sm text-text-primary font-medium">{c.name}</span>
                    {countryCode === c.code && <CheckCircle size={16} color="#0071e3" className="ml-auto" />}
                  </button>
                ))}
              </div>
              <button
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                disabled={!countryCode}
                onClick={() => setStep(2)}
              >
                Continue <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Document type */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="font-semibold text-text-primary mb-2" style={{ fontSize: '1.375rem', letterSpacing: '-0.01em' }}>
                Choose document type
              </h2>
              <p className="text-text-secondary text-sm mb-6">
                Select the identity document you&apos;ll be uploading for {country}.
              </p>
              <div className="space-y-2">
                {docTypes.map((dt) => (
                  <button
                    key={dt.value}
                    onClick={() => setDocumentType(dt.value)}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all"
                    style={{
                      background: documentType === dt.value ? 'rgba(0,113,227,0.12)' : 'rgba(255,255,255,0.04)',
                      border: documentType === dt.value ? '1px solid rgba(0,113,227,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span className="text-sm text-text-primary font-medium">{dt.label}</span>
                    {documentType === dt.value && <CheckCircle size={16} color="#0071e3" className="ml-auto" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button className="btn-secondary flex-1 flex items-center justify-center gap-2" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={!documentType}
                  onClick={() => setStep(3)}
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Upload */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="font-semibold text-text-primary mb-2" style={{ fontSize: '1.375rem', letterSpacing: '-0.01em' }}>
                Upload your document
              </h2>
              <p className="text-text-secondary text-sm mb-6">
                Upload a clear photo or scan of your {documentType?.replace('_', ' ').toLowerCase()}. JPG, PNG, or PDF accepted.
              </p>
              <label
                className="block w-full rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden"
                style={{ borderColor: file ? 'rgba(0,113,227,0.4)' : 'rgba(255,255,255,0.12)', minHeight: 180 }}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {filePreview ? (
                  <img src={filePreview} alt="Document preview" className="w-full object-cover" style={{ maxHeight: 280 }} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <Upload size={20} color="#636366" />
                    </div>
                    <p className="text-sm text-text-tertiary">
                      {file ? file.name : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-xs text-text-disabled">Max 10MB</p>
                  </div>
                )}
              </label>
              {error && <p className="text-sm mt-3" style={{ color: '#ff453a' }}>{error}</p>}
              <div className="flex gap-3 mt-6">
                <button className="btn-secondary flex-1 flex items-center justify-center gap-2" onClick={() => setStep(2)}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={!file || uploading}
                  onClick={handleUpload}
                >
                  {uploading ? <LoadingSpinner size="sm" /> : null}
                  {uploading ? 'Uploading…' : 'Upload & Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Verify */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="font-semibold text-text-primary mb-2" style={{ fontSize: '1.375rem', letterSpacing: '-0.01em' }}>
                Verify your identity
              </h2>
              <p className="text-text-secondary text-sm mb-8">
                Our AI will extract and verify your document details. This usually takes 10–20 seconds.
              </p>

              {!verifyResult && !verifying && (
                <button className="btn-primary w-full" onClick={handleVerify}>
                  Start Verification
                </button>
              )}

              {verifying && (
                <div className="flex flex-col items-center py-12 gap-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-text-secondary text-sm">Analysing your document…</p>
                </div>
              )}

              {verifyResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  {verifyResult.status === 'VERIFIED' ? (
                    <>
                      <CheckCircle size={56} color="#30d158" className="mx-auto mb-4" />
                      <h3 className="font-semibold text-text-primary text-xl mb-2">Verified</h3>
                      <p className="text-text-secondary text-sm mb-2">
                        Identity confirmed with {Math.round(verifyResult.confidence * 100)}% confidence
                      </p>
                      <p className="text-text-tertiary text-xs">Redirecting to income declaration…</p>
                    </>
                  ) : (
                    <>
                      <XCircle size={56} color="#ff453a" className="mx-auto mb-4" />
                      <h3 className="font-semibold text-text-primary text-xl mb-2">Verification Failed</h3>
                      <p className="text-text-secondary text-sm mb-6">{verifyResult.reason}</p>
                      <button className="btn-primary" onClick={() => { setVerifyResult(null); setStep(3); setFile(null); setFilePreview(null); }}>
                        Try Again
                      </button>
                    </>
                  )}
                </motion.div>
              )}
              {error && <p className="text-sm mt-3 text-center" style={{ color: '#ff453a' }}>{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
