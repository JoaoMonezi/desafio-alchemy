import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Imports adjusted to your structure
// Note: If Toaster is red, check if the path matches where you moved the file
import { Toaster } from "@/_shared/components/sonner"; 
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { SessionProvider } from "next-auth/react"; // <--- THE MISSING PIECE

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Gerenciador de tarefas T3 Stack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 1. Auth Provider (Wraps everything) */}
        <SessionProvider>
          
          {/* 2. Data Provider (tRPC) */}
          <TRPCProvider>
            {children}
            <Toaster />
          </TRPCProvider>

        </SessionProvider>
      </body>
    </html>
  );
}