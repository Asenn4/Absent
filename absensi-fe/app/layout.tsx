import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Jetson Attend",
  description: "Face recognition attendance system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={${"$"}{inter.variable} {jetbrainsMono.variable} font-sans min-h-screen antialiased bg-background text-foreground}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
