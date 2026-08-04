// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// ✅ 1. 新增引入语言包 Context
import { LanguageProvider } from '@/components/LanguageContext'; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DreamBird",
  description: "Bird sightings app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ 2. 用 LanguageProvider 把 children 包起来 */}
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}