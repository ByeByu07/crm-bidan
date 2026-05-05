import type { Metadata } from "next";
import localFont from "next/font/local";
import { Montserrat, Playfair_Display, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import "@repo/ui/globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@repo/ui/components/sonner";

const fontSans = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono",
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
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            {children}
            <Toaster position="top-center" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
