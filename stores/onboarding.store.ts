'use client';
import { create } from 'zustand';
import { DocumentType } from '@/lib/shared';

type OnboardingStep = 'country' | 'document-type' | 'upload' | 'verify' | 'income' | 'complete';

interface OnboardingState {
  step: OnboardingStep;
  country: string;
  countryCode: string;
  documentType: DocumentType | null;
  documentUrl: string | null;
  kycVerified: boolean;
  setStep: (step: OnboardingStep) => void;
  setCountry: (country: string, code: string) => void;
  setDocumentType: (type: DocumentType) => void;
  setDocumentUrl: (url: string) => void;
  setKYCVerified: (verified: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  step: 'country',
  country: '',
  countryCode: '',
  documentType: null,
  documentUrl: null,
  kycVerified: false,
  setStep: (step) => set({ step }),
  setCountry: (country, countryCode) => set({ country, countryCode }),
  setDocumentType: (documentType) => set({ documentType }),
  setDocumentUrl: (documentUrl) => set({ documentUrl }),
  setKYCVerified: (kycVerified) => set({ kycVerified }),
  reset: () =>
    set({
      step: 'country',
      country: '',
      countryCode: '',
      documentType: null,
      documentUrl: null,
      kycVerified: false,
    }),
}));
