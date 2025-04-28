import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeChangePart } from "@/components/Globel/ThemeChangePart"
import { Navbar } from "@/components/Globel/Navbar"
import { MusicPlayer } from "@/components/Globel/MusicPlayer"
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BetaLyrGD",
  description: "A programming guides built with Next.js and Tailwind CSS",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeChangePart
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="mt-14">{children}</main>
          <MusicPlayer />
          <Toaster richColors />
        </ThemeChangePart>
      </body>
    </html>
  )
}