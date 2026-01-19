'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Github, Linkedin, Mail, ExternalLink, Code, BarChart, Layers, MapPin, Globe, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/ui/sidebar';
import { CardContainer, CardBody, CardItem } from '@/components/ui/three-d-card';
import { ComingSoonModal } from '@/components/ui/coming-soon-modal';

const developerProfile = {
    name: "Tejas Deshpande",
    role: "Full Stack Developer",
    email: "xladetej@gmail.com",
    linkedin: "https://www.linkedin.com/in/tejas-deshpande-1229691a6/",
    github: "https://github.com/devyonko",
    openToWork: true,
};

export default function AboutDevPage() {
    const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30">
            <Sidebar />

            {/* Main Content Area */}
            <div className="ml-0 lg:ml-[280px] p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen">
                <div className="max-w-7xl mx-auto">

                    {/* Header / Title */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                Developer.<span className="text-purple-500">Profile</span>
                            </h1>
                            <p className="text-gray-400 mt-2 text-lg">Building digital experiences with code & passion.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className={`px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2 ${developerProfile.openToWork ? '' : 'hidden'}`}>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Open to Work
                            </div>
                        </div>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">

                        {/* 1. Hero Profile Card (Span 2x2) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="col-span-1 md:col-span-2 row-span-2 relative overflow-hidden rounded-3xl bg-slate-900/50 border border-white/10 p-8 flex flex-col justify-between group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                                        <Image
                                            src="/developer_profile.jpg"
                                            alt="Tejas"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <Globe className="w-6 h-6 text-gray-600 group-hover:text-purple-400 transition-colors" />
                                </div>

                                <div className="mt-8">
                                    <h2 className="text-3xl font-bold text-white mb-2">{developerProfile.name}</h2>
                                    <p className="text-purple-400 font-medium mb-4">{developerProfile.role}</p>
                                    <p className="text-gray-400 leading-relaxed text-sm md:text-base max-w-md">
                                        Crafting robust applications with modern technologies.
                                        Specialized in Next.js ecosystems, high-performance UI, and seamless backend integration.
                                        Fan of dark modes, clean code, and anime.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 relative z-10">
                                <a href={developerProfile.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href={developerProfile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] transition-colors border border-current/10">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a href={`mailto:${developerProfile.email}`} className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4" />
                                    Contact Me
                                </a>
                            </div>
                        </motion.div>

                        {/* 2. Tech Stack (Span 1x2) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="col-span-1 row-span-2 rounded-3xl bg-slate-900/50 border border-white/10 p-6 flex flex-col gap-4 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Cpu className="w-24 h-24" />
                            </div>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Layers className="w-5 h-5 text-blue-400" />
                                Stack
                            </h3>
                            <div className="space-y-4 relative z-10">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Core</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Next.js 14', 'React', 'TypeScript', 'Tailwind'].map(tech => (
                                            <span key={tech} className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-gray-300">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Backend</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Node.js', 'PostgreSQL', 'Prisma', 'Supabase', 'Vercel'].map(tech => (
                                            <span key={tech} className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Design</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Framer Motion', 'Figma', 'Three.js'].map(tech => (
                                            <span key={tech} className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Github Stats (Span 1x1) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="col-span-1 bg-gradient-to-br from-slate-900 via-slate-900 to-black border border-white/10 rounded-3xl p-6 flex flex-col justify-center items-center relative group"
                        >
                            <div className="text-center">
                                <div className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">Active</div>
                                <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium">Open-Source Contributor</div>
                            </div>
                        </motion.div>

                        {/* 4. Experience / Location (Span 1x1) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="col-span-1 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex flex-col justify-between group hover:border-white/20 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">Remote</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">Available Worldwide</div>
                            </div>
                        </motion.div>


                        {/* 5. Project Card 1: InstaVault (Span 2x2) */}
                        <div className="col-span-1 md:col-span-2 row-span-2 min-h-[400px]">
                            <CardContainer className="inter-var w-full h-full">
                                <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.1] dark:bg-black dark:border-white/[0.1] border-black/[0.1] w-full h-full rounded-3xl p-6 border flex flex-col justify-between overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start">
                                            <CardItem
                                                translateZ="50"
                                                className="text-xl font-bold text-neutral-600 dark:text-white"
                                            >
                                                InstaVault
                                            </CardItem>
                                            <CardItem translateZ="60" className="px-2 py-1 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
                                                Live App
                                            </CardItem>
                                        </div>
                                        <CardItem
                                            as="p"
                                            translateZ="60"
                                            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                                        >
                                            The ultimate Instagram saver. Securely archive your favorite Reels & Photos directly to Google Drive.
                                        </CardItem>
                                    </div>

                                    {/* Visual Content: Avatar Collage */}
                                    <CardItem translateZ="100" className="w-full mt-4 flex-1 relative min-h-[200px] flex items-center justify-center">
                                        {/* Floating Images simulating a 'Vault' */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                                            <motion.div
                                                className="absolute top-4 left-4 w-24 h-32 rounded-xl border-2 border-white/20 overflow-hidden shadow-2xl rotate-[-6deg] z-10 bg-gray-900"
                                                whileHover={{ scale: 1.1, rotate: -8, zIndex: 20 }}
                                            >
                                                <Image src="/avatars/avatar-1.jpg" alt="Saved 1" fill className="object-cover opacity-80 hover:opacity-100 transition-opacity" />
                                            </motion.div>
                                            <motion.div
                                                className="absolute top-8 right-12 w-28 h-28 rounded-xl border-2 border-white/20 overflow-hidden shadow-2xl rotate-[3deg] z-20 bg-gray-800"
                                                whileHover={{ scale: 1.1, rotate: 6, zIndex: 30 }}
                                            >
                                                <Image src="/avatars/avatar-15.jpg" alt="Saved 2" fill className="object-cover opacity-90 hover:opacity-100 transition-opacity" />
                                            </motion.div>
                                            <motion.div
                                                className="absolute bottom-4 left-16 w-32 h-20 rounded-xl border-2 border-white/20 overflow-hidden shadow-2xl rotate-[-3deg] z-30 bg-gray-900"
                                                whileHover={{ scale: 1.1, rotate: 0, zIndex: 40 }}
                                            >
                                                <Image src="/avatars/avatar-7.jpg" alt="Saved 3" fill className="object-cover opacity-90 hover:opacity-100 transition-opacity" />
                                            </motion.div>
                                            {/* Decorative Elements */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-40" />
                                        </div>
                                    </CardItem>

                                    <div className="flex justify-between items-center mt-6 relative z-50">
                                        <CardItem
                                            translateZ={20}
                                            as="div"
                                            className="flex -space-x-2"
                                        >
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] text-gray-500">
                                                    User
                                                </div>
                                            ))}
                                        </CardItem>
                                        <CardItem
                                            translateZ={40}
                                            as="button"
                                            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors"
                                        >
                                            Try Now
                                        </CardItem>
                                    </div>
                                </CardBody>
                            </CardContainer>
                        </div>


                        {/* 6. Project Card 2: Creative Portfolio (Span 2x2) */}
                        <div
                            className="col-span-1 md:col-span-2 row-span-2 min-h-[400px] cursor-pointer"
                            onClick={() => setIsPortfolioOpen(true)}
                        >
                            <CardContainer className="inter-var w-full h-full">
                                <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] dark:bg-black dark:border-white/[0.1] border-black/[0.1] w-full h-full rounded-3xl p-6 border flex flex-col justify-between overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start">
                                            <CardItem
                                                translateZ="50"
                                                className="text-xl font-bold text-neutral-600 dark:text-white"
                                            >
                                                Creative Portfolio
                                            </CardItem>
                                            <CardItem translateZ="60" className="px-2 py-1 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold">
                                                Showcase
                                            </CardItem>
                                        </div>
                                        <CardItem
                                            as="p"
                                            translateZ="60"
                                            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                                        >
                                            A collection of immersive 3D web experiences, experiments, and UI/UX designs.
                                        </CardItem>
                                    </div>

                                    <CardItem translateZ="100" className="w-full mt-4 flex-1 relative min-h-[200px] rounded-2xl overflow-hidden border border-white/10 group-hover/card:shadow-xl">
                                        <Image
                                            src="/avatars/avatar-33.jpg"
                                            alt="Portfolio Cover"
                                            fill
                                            className="object-cover grayscale group-hover/card:grayscale-0 transition-all duration-500"
                                        />
                                        <div className="absolute inset-0 bg-blue-900/40 mix-blend-overlay group-hover/card:bg-transparent transition-colors duration-500" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                <ExternalLink className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </CardItem>

                                    <div className="flex justify-between items-center mt-6 relative z-50">
                                        <CardItem
                                            translateZ={20}
                                            as="div"
                                            className="flex gap-2"
                                        >
                                            <span className="text-xs px-2 py-1 bg-white/5 rounded-md">Three.js</span>
                                            <span className="text-xs px-2 py-1 bg-white/5 rounded-md">WebGL</span>
                                        </CardItem>
                                        <CardItem
                                            translateZ={40}
                                            as="button"
                                            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
                                        >
                                            View Works
                                        </CardItem>
                                    </div>
                                </CardBody>
                            </CardContainer>
                        </div>

                    </div>

                    {/* Footer / Quote */}
                    <div className="mt-12 text-center text-gray-500 text-sm italic opacity-50">
                        "Code is like humor. When you have to explain it, it’s bad."
                    </div>

                </div>
            </div>
            {/* Modals */}
            <ComingSoonModal
                isOpen={isPortfolioOpen}
                onClose={() => setIsPortfolioOpen(false)}
                feature="Portfolio"
            />
        </div>
    );
}
