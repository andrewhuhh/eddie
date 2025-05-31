import type { Metadata, Viewport } from 'next'
import { Inter, Crimson_Text } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Analytics } from "@vercel/analytics/next"

const crimsonText = Crimson_Text({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'i miss my friends',
  description: 'A personal relationship management tool that helps maintain meaningful connections with friends and family',
  keywords: ['relationships', 'connections', 'social', 'networking', 'mindfulness'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`scroll-smooth ${crimsonText.variable} ${inter.variable}`}>
      <body className={`${inter.className} bg-neutral-50 text-neutral-800 antialiased overflow-x-hidden`}>
        <AuthProvider>
          <div className="min-h-screen w-full">
            {children}
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}