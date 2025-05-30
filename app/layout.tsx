import type { Metadata } from 'next'
import { Instrument_Serif, Instrument_Sans } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
})

const instrumentSans = Instrument_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'i miss my friends',
  description: 'A personal relationship management tool that helps maintain meaningful connections with friends and family',
  keywords: ['relationships', 'connections', 'social', 'networking', 'mindfulness'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`scroll-smooth ${instrumentSerif.variable} ${instrumentSans.variable}`}>
      <body className={`${instrumentSans.className} bg-neutral-50 text-neutral-800 antialiased`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
} 