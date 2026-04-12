"use client";

import Link from "next/link";
import { useState } from "react";
import { register } from "@/lib/supabase/auth.action";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  const {
    register: formRegister,
    handleSubmit,
    formState,
  } = useForm<{ fullName: string; email: string; password: string }>();
  const { errors } = formState;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    setIsSubmitting(true);
    try {
      const result = await register(data.fullName, data.email, data.password);
      if (!result.success) {
        toast("Registration failed");
      } else {
        toast("Registration successful! Please check your email to confirm your account.");
        redirect("/");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Poppins:wght@400;500;600&display=swap');
      `}</style>

      <div
        className="flex w-full max-w-[940px] min-h-[600px] rounded-[32px] overflow-hidden bg-white shadow-2xl"
        style={{
          boxShadow:
            "0 32px 80px rgba(255,100,0,.18), 0 8px 28px rgba(0,0,0,.08)",
        }}
      >
        {/* ── LEFT: Orange panel ── */}
        <div className="w-6/12 relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-r-[160px] flex flex-col items-center justify-center p-14">
          <div className="absolute w-[180px] h-[180px] rounded-full bg-white/8 -top-12 -left-12" />
          <div className="absolute w-[120px] h-[120px] rounded-full bg-white/8 -bottom-2 -right-7" />

          <h2 className="font-nunito text-5xl md:text-6xl font-black text-white text-center whitespace-pre-line leading-tight mb-4 relative z-10">
            Welcome{"\n"}Back!
          </h2>
          <p className="font-poppins text-base md:text-lg text-white/90 text-center leading-relaxed mb-8 max-w-[260px] relative z-10">
            To keep connected with us please login with your personal info
          </p>
          <Link href="/login" className="relative z-10">
            <button className="bg-transparent text-white border-2 border-white/75 rounded-full px-10 py-2.75 font-poppins font-semibold text-sm tracking-wider cursor-pointer transition-all hover:bg-white/15 hover:-translate-y-0.5">
              SIGN IN
            </button>
          </Link>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="flex-1 px-16 py-20 flex flex-col items-center justify-center">
          <div className="font-nunito text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">
            f<span className="text-orange-600">oo</span>d
          </div>
          <h1 className="font-nunito text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Create Account
          </h1>

          <div className="flex gap-3 mb-3">
            <SocialBtn title="Google">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.27 9.76A7.08 7.08 0 0 1 19.07 12c0 .68-.06 1.34-.17 1.97H12v-3.72h7.2A7.08 7.08 0 0 0 5.27 9.76z"
                />
                <path
                  fill="#34A853"
                  d="M12 19.08a7.04 7.04 0 0 1-5.92-3.26l-3.1 2.4A11.06 11.06 0 0 0 12 23.08c2.97 0 5.67-1.14 7.7-3l-3.03-2.34A6.98 6.98 0 0 1 12 19.08z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.08 15.82A7.03 7.03 0 0 1 4.92 12c0-1.36.38-2.62 1.03-3.72L2.85 5.9A11.04 11.04 0 0 0 .94 12c0 2.1.58 4.07 1.6 5.74l3.54-1.92z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.92a6.97 6.97 0 0 1 4.79 1.87l3.32-3.32A11.02 11.02 0 0 0 12 .92a11.06 11.06 0 0 0-9.15 4.98l3.1 2.4A7.06 7.06 0 0 1 12 4.92z"
                />
              </svg>
            </SocialBtn>
            <SocialBtn title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#1877F2"
                  d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"
                />
              </svg>
            </SocialBtn>
            <SocialBtn title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#0A66C2"
                  d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46C23.21 24 24 23.23 24 22.28V1.72C24 .77 23.21 0 22.23 0z"
                />
              </svg>
            </SocialBtn>
            <SocialBtn title="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <defs>
                  <radialGradient id="ig2" cx="30%" cy="107%" r="150%">
                    <stop offset="0%" stopColor="#ffd600" />
                    <stop offset="50%" stopColor="#ff0100" />
                    <stop offset="100%" stopColor="#d800b9" />
                  </radialGradient>
                </defs>
                <path
                  fill="url(#ig2)"
                  d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12c0-3.2.01-3.58.07-4.85C2.38 3.86 3.9 2.31 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12c0 3.26.01 3.67.07 4.95.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24c3.26 0 3.67-.01 4.95-.07 4.35-.2 6.78-2.62 6.98-6.98C23.99 15.67 24 15.26 24 12c0-3.26-.01-3.67-.07-4.95-.2-4.35-2.63-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32A6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"
                />
              </svg>
            </SocialBtn>
          </div>

          <div className="flex items-center gap-2.5 w-full my-4.5">
            <span className="flex-1 h-px bg-gray-300" />
            <span className="font-poppins text-xs text-gray-400 whitespace-nowrap">
              Or register with email
            </span>
            <span className="flex-1 h-px bg-gray-300" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="w-full mb-3">
              <input
                {...formRegister("fullName", {
                  required: "Full name is required",
                })}
                className="w-full px-4.5 py-3 border border-gray-200 rounded-lg font-poppins text-sm text-gray-700 outline-none bg-gray-50 focus:border-orange-600 focus:bg-white focus:shadow-sm focus:ring-2 focus:ring-orange-100 placeholder-gray-400 transition-all"
                type="text"
                placeholder="Full Name"
                name="fullName"
                aria-invalid={errors.fullName ? "true" : "false"}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500 mt-1 font-poppins">
                  {(errors.fullName as any).message}
                </p>
              )}
            </div>
            <div className="w-full mb-3">
              <input
                {...formRegister("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-4.5 py-3 border border-gray-200 rounded-lg font-poppins text-sm text-gray-700 outline-none bg-gray-50 focus:border-orange-600 focus:bg-white focus:shadow-sm focus:ring-2 focus:ring-orange-100 placeholder-gray-400 transition-all"
                type="email"
                placeholder="Email"
                name="email"
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1 font-poppins">
                  {(errors.email as any).message}
                </p>
              )}
            </div>
            <div className="w-full mb-5 relative">
              <input
                {...formRegister("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full px-4.5 py-3 pr-10 border border-gray-200 rounded-lg font-poppins text-sm text-gray-700 outline-none bg-gray-50 focus:border-orange-600 focus:bg-white focus:shadow-sm focus:ring-2 focus:ring-orange-100 placeholder-gray-400 transition-all"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-4.97 0-9.27-3-11-8 1.04-2.64 2.8-4.8 4.94-6.06" />
                    <path d="M1 1l22 22" />
                    <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                  </svg>
                )}
              </button>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1 font-poppins">
                  {(errors.password as any).message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none rounded-full px-11 py-3 font-poppins font-semibold text-sm tracking-wider cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ boxShadow: "0 6px 22px rgba(255,96,0,.35)" }}
            >
              {isSubmitting ? "Signing..." : "SIGN UP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function SocialBtn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className="w-[42px] h-[42px] rounded-full border border-gray-200 bg-white flex items-center justify-center cursor-pointer transition-all hover:border-orange-600 hover:shadow-md hover:-translate-y-0.5"
      title={title}
    >
      {children}
    </button>
  );
}
