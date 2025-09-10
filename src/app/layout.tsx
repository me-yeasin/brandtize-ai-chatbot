import ClientOnly from "@/component/client_only";
import { DevBanner } from "@/component/dev_banner";
import { FileAttachmentProvider } from "@/contexts/file-attachment/file_attachment_context";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brandtize AI Chatbot",
  description:
    "A chatbot powered by GPT-4,Claude,Grok,Deepseek,Llama2,Alpaca and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>{/* Puter script is already loaded by PuterProvider */}</head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Add Development Environment Banner */}
        <ClientOnly>
          <DevBanner position="top-right" />
        </ClientOnly>
        <FileAttachmentProvider>{children}</FileAttachmentProvider>
      </body>
    </html>
  );
}
