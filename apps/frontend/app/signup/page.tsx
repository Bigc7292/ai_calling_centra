// per TASK COMMAND: Full React component for /app/signup/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ethers } from 'ethers';
import { z } from 'zod';
import Confetti from 'react-confetti';
import { QRCodeCanvas } from 'qrcode.react';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';

import { SignupFormSchema } from '../../lib/zod-schemas';
import { createNewWallet, hashPII, storeEncryptedMnemonic, emitBlockchainAuditStub } from '../../lib/wallet-utils';

// Per PRD Sec 2.2: zxcvbn strength via lib
const options = { dictionary: { ...zxcvbnCommonPackage.dictionary } };
zxcvbnOptions.setOptions(options);

type SignupFormValues = z.infer<typeof SignupFormSchema>;

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'wallet' | 'success'>('form');
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupFormSchema),
  });

  const password = watch('password');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pass = e.target.value;
    if (pass) {
      const result = zxcvbn(pass);
      setPasswordStrength(result.score); // Score from 0 to 4
    } else {
      setPasswordStrength(0);
    }
  };

  const processSignup = async (data: SignupFormValues) => {
    setError(null);

    // 1. Generate wallet client-side // Per PRD Sec 2.2
    const newWallet = createNewWallet();
    setWallet(newWallet);
    setStep('wallet');

    // 2. Encrypt and store mnemonic // Per PRD Sec 2.2
    await storeEncryptedMnemonic(newWallet.mnemonic!.phrase, data.password);

    // 3. Hash PII client-side // Per PRD Sec 4
    const emailHash = hashPII(data.email);

    // 4. Call backend API // Per TASK COMMAND
    startTransition(async () => {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          walletAddress: newWallet.address,
        }),
      });

      if (!response.ok) {
        const res = await response.json();
        setError(res.error || 'An unknown error occurred during signup.');
        setStep('form'); // Revert to form on error
        return;
      }

      // 5. Client-side blockchain emit // Per TASK COMMAND
      try {
        const txHash = await emitBlockchainAuditStub(newWallet.address, emailHash);
        console.log(`Audit transaction submitted. Hash: ${txHash}`);
        // In a real app, we might store this txHash in the user's profile
      } catch (bcError) {
        console.error("Blockchain emit failed:", bcError);
        // TODO: Per PRD Sec 5 - Implement retry logic or flag for later processing
      }

      // 6. Transition to success state
      setStep('success');
    });
  };

  // Per PRD Sec 2.2: UX Micros: Inline errors
  const renderPasswordStrength = () => {
    const strengthMap = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colorMap = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div
          className={`h-2.5 rounded-full ${colorMap[passwordStrength]}`}
          style={{ width: `${(passwordStrength + 1) * 20}%` }}
        ></div>
        <p className="text-xs mt-1">{strengthMap[passwordStrength]}</p>
      </div>
    );
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Confetti />
        <div className="p-8 text-center bg-white shadow-lg rounded-xl">
          <h1 className="text-2xl font-bold text-green-600">Signup Successful!</h1>
          <p className="mt-4 text-gray-600">
            Your account and secure wallet have been created.
          </p>
          <p className="mt-2">A verification link has been sent to your email.</p>
          <button
            onClick={() => (window.location.href = '/dashboard')} // Per TASK COMMAND: Redirect
            className="w-full px-4 py-2 mt-6 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === 'wallet') {
    return (
      // Per PRD Sec 2.2 & A11y: ARIA for modals
      <div role="alertdialog" aria-modal="true" aria-labelledby="wallet-heading" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="p-8 bg-white rounded-lg shadow-2xl max-w-md w-full">
          <h2 id="wallet-heading" className="text-xl font-bold text-center">Your Secure Wallet is Ready</h2>
          <p className="mt-2 text-sm text-center text-red-600 font-semibold">
            IMPORTANT: Write down this phrase and store it securely. This is the only way to recover your wallet.
          </p>
          <div className="p-4 my-4 font-mono text-center bg-gray-100 border border-gray-300 rounded-md">
            {wallet?.mnemonic?.phrase}
          </div>
          <div className="flex justify-center my-4">
            <QRCodeCanvas value={wallet?.mnemonic?.phrase || ''} size={128} />
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(wallet?.mnemonic?.phrase || '')}
            className="w-full px-4 py-2 font-semibold text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200"
          >
            Copy Mnemonic
          </button>
          <p className="mt-4 text-xs text-center text-gray-500">
            Your wallet address: <span className="font-mono text-xs">{wallet?.address}</span>
          </p>
          {isPending && (
            <div className="mt-4 text-center">
              <p>Finalizing account setup...</p>
              {/* Per PRD Sec 2.2: Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Create Your Account</h1>
        <form onSubmit={handleSubmit(processSignup)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" {...register('email')} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password"
             className="block text-sm font-medium text-gray-700">Password</label>
            <input id="password" type="password" {...register('password', { onChange: handlePasswordChange })} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            {password && renderPasswordStrength()}
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          {error && <p className="text-sm text-center text-red-600">{error}</p>}
          <button type="submit" disabled={isSubmitting || isPending} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {isSubmitting || isPending ? 'Creating Account...' : 'Sign Up & Create Wallet'}
          </button>
        </form>
        {/* Per PRD Sec 2.2: OAuth buttons (stubs) */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative px-2 text-sm bg-white">Or continue with</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <button className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Google</button>
            <button className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">LinkedIn</button>
        </div>
      </div>
    </div>
  );
}
