import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackgroundWrapper from "@/components/ui/background-wrapper";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InstaVault - Save Your Favorite Moments",
  description: "Securely save and organize your favorite memories with InstaVault.",
  icons: {
    icon: "/favicon.ico",
    apple: "/instavault/instavault-icon-192.png",
    shortcut: "/instavault/instavault-icon-32.png",
  },
  openGraph: {
    title: "InstaVault",
    description: "Save Your Favorite Moments Forever",
    images: ["/instavault/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground`}
        suppressHydrationWarning
      >
        <BackgroundWrapper />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
