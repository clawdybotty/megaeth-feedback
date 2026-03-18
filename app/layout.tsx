import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MegaETH Feedback",
  description: "Testnet app feedback collection",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-950">
          <nav className="border-b border-slate-800 bg-slate-900">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-white hover:text-slate-300 transition-colors">
                  MegaETH Feedback
                </Link>
                <div className="flex gap-4">
                  <Link 
                    href="/tester" 
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Tester
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/admin" 
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Admin
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
