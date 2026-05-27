import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PushNotifications from "@/components/PushNotifications";
import { AuthProvider } from "@/lib/auth-context";
import { UserDataProvider } from "@/lib/user-data-context";
import { EmailAlertProvider } from "@/lib/email-alerts-context";
import { AdminAuthProvider } from "@/lib/admin-auth-context";

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
  preload: false,
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Pronostics Pro - Pronostics sportifs en ligne",
  description: "La plateforme de pronostics sportifs la plus fiable en France. Analyses expertes, scores en direct et communauté passionnée.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <UserDataProvider>
            <EmailAlertProvider>
              <AdminAuthProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <PushNotifications />
              </AdminAuthProvider>
            </EmailAlertProvider>
          </UserDataProvider>
        </AuthProvider>
        <Script
          src="https://readdy.ai/api/public/assistant/widget?projectId=6d10c910-506e-4304-9082-1193201eff90"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
