import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FlashStory from "@/components/FlashStory";
import { Providers } from "@/components/providers/SessionProvider";
import FooterWrapper from "@/components/layout/FooterWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Presidency Odyssey - Report Facts, Valuing Truth",
  description: "Latest updates from Nigerian news",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <FlashStory />
          <main className="min-h-screen">{children}</main>
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  );
}