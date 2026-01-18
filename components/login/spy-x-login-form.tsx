'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

interface SpyXLoginFormProps {
    onForgotPassword?: () => void;
    onSubmit: (data: any) => void;
}

export default function SpyXLoginForm({ onForgotPassword, onSubmit }: SpyXLoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="relative w-full max-w-[450px] p-6 sm:p-12 rounded-[24px] backdrop-blur-xl border border-purple-500/30 shadow-[0_20px_60px_rgba(168,85,247,0.2)] bg-[rgba(30,30,50,0.6)] animate-in fade-in zoom-in-95 duration-500">

            {/* Decorative Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500 rounded-tl-xl opacity-50" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-pink-500 rounded-tr-xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-pink-500 rounded-bl-xl opacity-50" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500 rounded-br-xl opacity-50" />

            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                    Welcome back
                </h1>
                <p className="text-white/60 text-base">
                    Sign in to access Google Drive
                </p>
            </div>

            {/* Google Button */}
            <button
                type="button"
                onClick={() => signIn('google')}
                className="w-full h-14 bg-white hover:scale-[1.02] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-lg rounded-xl flex items-center justify-center gap-3 transition-all duration-200 group"
            >
                <Image
                    src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
                    alt="Google"
                    width={24}
                    height={24}
                />
                <span className="text-gray-800 font-medium">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-xs uppercase text-white/50 font-medium">or</span>
                <div className="flex-1 h-px bg-white/20" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Email Input */}
                <div className="space-y-2">
                    <label className="text-sm text-white/70 ml-1">Email address</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-12 px-4 bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] transition-all duration-200"
                        placeholder="name@example.com"
                    />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <label className="text-sm text-white/70 ml-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full h-12 px-4 bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] transition-all duration-200"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        Forgot password?
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full h-[52px] mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_24px_rgba(168,85,247,0.4)] hover:brightness-110 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                >
                    <span>Sign In</span>
                    <ArrowRight size={20} />
                </button>
            </form>
        </div>
    );
}
