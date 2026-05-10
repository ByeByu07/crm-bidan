import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import "./design-system.css";
import "@repo/ui/globals.css";
import "streamdown/styles.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { PushTokenProvider } from "@/providers/push-token-provider";
import { Toaster } from "@repo/ui/components/sonner";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontSerif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});


export const metadata: Metadata = {
  title: "BidanCRM",
  description: "Aplikasi manajemen pasien dan penjualan obat untuk bidan desa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontSerif.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <PushTokenProvider>
              {children}
              <Toaster position="top-center" />
            </PushTokenProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
