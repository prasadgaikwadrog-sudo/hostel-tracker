import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useSendOtp, useVerifyOtp } from "@workspace/api-client-react";
import { Shield, ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const startResendTimer = () => {
    setResendCountdown(30);
    const interval = setInterval(() => {
      setResendCountdown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    sendOtp.mutate({ data: { email } }, {
      onSuccess: () => {
        setStep("otp");
        startResendTimer();
        toast({ title: "OTP sent!", description: "Check your email for the 6-digit code." });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.error || "Failed to send OTP", variant: "destructive" });
      },
    });
  };

  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    sendOtp.mutate({ data: { email } }, {
      onSuccess: () => {
        startResendTimer();
        setOtp(["", "", "", "", "", ""]);
        toast({ title: "OTP resent!" });
      },
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;

    verifyOtp.mutate({ data: { email, otp: code } }, {
      onSuccess: (data: any) => {
        login(data.token, data.user);
        setLocation(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
      },
      onError: (err: any) => {
        toast({ title: "Invalid OTP", description: err?.data?.error || "Please check your code", variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
            <Shield size={28} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Hostel Issue Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">Campus Complaint Management System</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          {step === "email" ? (
            <>
              <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your college email to receive a one-time password</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    required
                    data-testid="email-input"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendOtp.isPending}
                  data-testid="send-otp-button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {sendOtp.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Send OTP <ArrowRight size={15} /></>
                  )}
                </button>
              </form>
              <p className="text-xs text-slate-500 text-center mt-6">
                Use <span className="text-slate-400">admin@hostel.edu</span> for admin access
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep("email")} className="text-sm text-slate-400 hover:text-white mb-4 flex items-center gap-1">
                &larr; Back
              </button>
              <h2 className="text-lg font-semibold text-white mb-1">Enter OTP</h2>
              <p className="text-slate-400 text-sm mb-6">
                We sent a 6-digit code to <span className="text-white">{email}</span>
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      data-testid={`otp-input-${index}`}
                      className="w-11 h-12 text-center text-xl font-bold rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={verifyOtp.isPending || otp.join("").length !== 6}
                  data-testid="verify-otp-button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {verifyOtp.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : "Verify & Sign In"}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0 || sendOtp.isPending}
                    className="text-sm text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto"
                  >
                    <RefreshCw size={13} />
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend OTP"}
                  </button>
                </div>
              </form>
              <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400 text-center">
                  Dev mode: Check server logs for your OTP
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
