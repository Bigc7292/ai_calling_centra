// per TASK COMMAND: Vitest tests for signup flow
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupPage from '../apps/frontend/app/signup/page'; // Adjust path as needed
import * as walletUtils from '@/lib/wallet-utils';
import { ethers } from 'ethers';

// Mock dependencies
// Per PRD Sec 5: Vitest tests at 90% coverage
vi.mock('@/lib/wallet-utils', () => ({
  createNewWallet: vi.fn(),
  storeEncryptedMnemonic: vi.fn(),
  hashPII: vi.fn(),
  emitBlockchainAuditStub: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useTransition: () => [false, vi.fn(callback => callback())],
}));

vi.mock('react-confetti', () => ({
  __esModule: true,
  default: () => <div data-testid="confetti" />,
}));

vi.mock('qrcode.react', () => ({
  __esModule: true,
  default: ({ value }: { value: string }) => <div data-testid="qrcode" data-value={value} />,
}));

global.fetch = vi.fn();

describe('SignupPage', () => {
  const mockWallet = new ethers.Wallet('0x0123456789012345678901234567890123456789012345678901234567890123');
  
  beforeEach(() => {
    vi.resetAllMocks();
    (walletUtils.createNewWallet as vi.Mock).mockReturnValue(mockWallet);
    (walletUtils.storeEncryptedMnemonic as vi.Mock).mockResolvedValue(undefined);
    (walletUtils.hashPII as vi.Mock).mockReturnValue('0xhashed_email');
    (walletUtils.emitBlockchainAuditStub as vi.Mock).mockResolvedValue('0x_fake_tx_hash');
    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    });
  });

  it('renders the initial signup form', () => {
    render(<SignupPage />);
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows an error for weak passwords (based on length)', async () => {
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'weak' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    });
  });

  it('proceeds to wallet generation on valid signup', async () => {
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'a-strong-password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(walletUtils.createNewWallet).toHaveBeenCalled();
      expect(screen.getByRole('heading', { name: /your secure wallet is ready/i })).toBeInTheDocument();
      expect(screen.getByText(mockWallet.mnemonic!.phrase)).toBeInTheDocument();
    });
  });

  it('handles API failure gracefully', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Email already in use' }),
    });

    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'a-strong-password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
      // Should revert to the form
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    });
  });

  it('shows success screen after full process completion', async () => {
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'a-strong-password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/signup', expect.any(Object));
      expect(walletUtils.emitBlockchainAuditStub).toHaveBeenCalledWith(mockWallet.address, '0xhashed_email');
      expect(screen.getByRole('heading', { name: /signup successful/i })).toBeInTheDocument();
      expect(screen.getByTestId('confetti')).toBeInTheDocument();
    });
  });
});
