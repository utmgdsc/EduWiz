import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import SideBar from "@/components/Sidebar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;

}>) {
    return (
        <html lang="en" className="dark">
            <body className={`h-screen w-screen ${geistSans.variable} ${geistMono.variable} antialiased`}>
                <SidebarProvider>
                    <SideBar></SideBar>
                    <div className="w-full">
                        {children}
                    </div>
                </SidebarProvider>
            </body>

        </html>
    );
}
