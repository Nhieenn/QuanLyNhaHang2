import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Work_Sans } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elevated POS",
  description: "The Elevated Organic Point-of-Sale System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${workSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
