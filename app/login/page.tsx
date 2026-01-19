'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import MatrixBackground from '@/components/ui/matrix-background';
import SpyXLoginForm from '@/components/login/spy-x-login-form';
import ParticleBackground from '@/components/ui/particle-background';
import { GifDisplay } from '@/components/ui/modern-animated-sign-in';

type FormData = {
    [key: string]: string;
};

export default function LoginPage() {
    const [formData, setFormData] = useState<FormData>({});

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    const goToForgotPassword = () => {
        console.log('Navigate to forgot password');
    };

    const formFields = {
        header: 'Welcome back',
        subHeader: 'Sign in to access Google Drive',
        fields: [
            {
                label: 'Email',
                placeholder: 'Enter your email',
                type: 'email',
                name: 'email',
                required: true,
            },
            {
                label: 'Password',
                placeholder: 'Enter your password',
                type: 'password',
                name: 'password',
                required: true,
            }
        ],
        buttonText: 'Sign In',
        googleLogin: 'Continue with Google',
        footerText: "Don't have an account?",
        footerLink: 'Sign up',
        footerLinkHref: '/signup',
    };

    return (
        <div className='flex h-screen w-full bg-[#030303] selection:bg-stone-500/30'>
            <div className='flex h-full w-full'>
                {/* Left Side */}
                <div className='flex flex-col justify-center w-1/2 max-lg:hidden relative items-center overflow-hidden'>
                    <div className="absolute inset-0 z-0 bg-[#05050a]">
                        <MatrixBackground />
                    </div>
                    <div className="z-10 relative">
                        <GifDisplay gifUrl="placeholder" />
                    </div>
                </div>

                {/* Right Side */}
                <div className='w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:w-full max-lg:px-[10%] relative overflow-hidden'>
                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 z-0 pointer-events-none" />

                    {/* Particle Effects */}
                    <ParticleBackground />

                    {/* Login Form */}
                    <div className="relative z-50 w-full flex justify-center pointer-events-auto">
                        <SpyXLoginForm
                            onSubmit={handleSubmit}
                            onForgotPassword={goToForgotPassword}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
