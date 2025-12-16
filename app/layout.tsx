import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "./providers/SidebarProvider";
import { AuthGuard } from "./components/AuthGuard";
import { SidebarWrapper } from "./components/SidebarWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lacquer - Location Manager",
  description: "Manage tasks, projects, and locations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthGuard>
          <SidebarProvider>
            <SidebarWrapper>
              {children}
            </SidebarWrapper>
          </SidebarProvider>
        </AuthGuard>
      </body>
    </html>
  );
}
