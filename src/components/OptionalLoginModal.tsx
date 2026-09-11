import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogIn,
  Heart,
  Lock,
  Compass,
} from 'lucide-react';
import { UserProfile } from '../types';

interface OptionalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSubmit: (profile: Partial<UserProfile>) => void;
  onContinueGuest: () => void;
}

export const OptionalLoginModal: React.FC<OptionalLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSubmit,
  onContinueGuest,
}) => {
  const [name, setName] = useState(currentUser.isLoggedIn ? currentUser.name : '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [activeTab, setActiveTab] = useState<'signin' | 'guest'>('signin');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name to personalize your profile.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setError(null);
    onLoginSubmit({
      name: name.trim(),
      email: email.trim(),
      isLoggedIn: true,
    });
    onClose();
  };

  const handleGuestChoice = () => {
    onContinueGuest();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#000c1b]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#c3c6ce]/40 animate-scaleUp flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-[#eff4ff] via-[#f8f9ff] to-white border-b border-[#c3c6ce]/30 flex items-start justify-between relative">
          <div className="pr-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#26fedc]/30 text-[#006b5b] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Login is 100% Optional</span>
            </div>
            <h2
              id="login-modal-title"
              className="text-lg sm:text-xl font-extrabold text-[#000c1b] tracking-tight"
            >
              Local Profile & Guest Access
            </h2>
            <p className="text-xs sm:text-sm text-[#43474d] mt-1 leading-relaxed">
              Your profile and preferences are saved only in this browser. This does not create an online account or sync across devices.
            </p>
          </div>

          <button
            id="btn-close-login-modal"
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#74777e] hover:text-[#000c1b] p-1.5 rounded-full hover:bg-white/80 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-[#c3c6ce]/20 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-[#000c1b] text-[#26fedc] shadow-xs'
                : 'bg-[#eff4ff] text-[#43474d] hover:bg-[#e0eaff]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Local Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guest')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'guest'
                ? 'bg-[#000c1b] text-[#26fedc] shadow-xs'
                : 'bg-[#eff4ff] text-[#43474d] hover:bg-[#e0eaff]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Guest Browsing (No Login)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {activeTab === 'guest' ? (
            /* Guest Browsing Tab */
            <div className="space-y-4">
              <div className="p-4 bg-[#eff4ff]/70 rounded-2xl border border-[#c3c6ce]/30 space-y-3">
                <div className="flex items-center gap-2.5 text-[#006b5b]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-sm text-[#000c1b]">
                    Zero Login Required to Use Any Feature
                  </h3>
                </div>
                <p className="text-xs text-[#43474d] leading-relaxed">
                  We believe great product discoveries shouldn't require mandatory account walls. As a guest, you can freely:
                </p>
                <ul className="space-y-2 text-xs text-[#43474d]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#006b5b] mt-0.5 shrink-0" />
                    <span>Browse editorial reviews, specifications, and pros & cons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#006b5b] mt-0.5 shrink-0" />
                    <span>Save favorites to your local wishlist with the heart button</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#006b5b] mt-0.5 shrink-0" />
                    <span>Set price drop notifications and write verified buyer reviews</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  id="btn-continue-as-guest"
                  type="button"
                  onClick={handleGuestChoice}
                  className="w-full py-3.5 px-4 bg-[#26fedc] hover:bg-[#00f5d4] text-[#000c1b] font-extrabold text-sm rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Continue Browsing as Guest</span>
                </button>

                <p className="text-[11px] text-center text-[#74777e]">
                  No passwords or cookies required. You can always sign in later if you want.
                </p>
              </div>
            </div>
          ) : (
            /* Sign In / Personalize Tab */
            <div className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {error && (
                  <div className="p-2.5 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-xl text-xs text-[#ba1a1a] font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="login-input-name"
                    className="block text-xs font-bold text-[#000c1b] mb-1"
                  >
                    Your Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#74777e]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="login-input-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9ff] border border-[#c3c6ce]/50 rounded-xl text-xs sm:text-sm text-[#000c1b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006b5b] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="login-input-email"
                    className="block text-xs font-bold text-[#000c1b] mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#74777e]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-input-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9ff] border border-[#c3c6ce]/50 rounded-xl text-xs sm:text-sm text-[#000c1b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006b5b] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    id="btn-submit-optional-login"
                    type="submit"
                    className="flex-1 py-3 px-4 bg-[#000c1b] hover:bg-[#006b5b] text-[#26fedc] font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Save Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestChoice}
                    className="py-3 px-4 bg-[#eff4ff] hover:bg-[#e0eaff] text-[#000c1b] font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Skip & Browse as Guest
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer Reassurance */}
        <div className="p-3.5 bg-[#f8f9ff] border-t border-[#c3c6ce]/20 flex items-center justify-between text-[11px] text-[#74777e] px-4 sm:px-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#006b5b]" />
            <span>No passwords required • Privacy first</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="hover:underline font-semibold text-[#006b5b] cursor-pointer"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
