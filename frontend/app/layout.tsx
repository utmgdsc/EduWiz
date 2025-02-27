import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import SideBar from "@/components/Sidebar";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import PreviousChats from "./previousChats";


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
                    <Sidebar>
                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarMenu>
                                    <SidebarMenuButton>
                                        Account
                                    </SidebarMenuButton>
                                    <SidebarMenuButton>
                                        Feedback
                                    </SidebarMenuButton>
                                </SidebarMenu>
                            </SidebarGroup>

                            <SidebarGroup>
                            <SidebarGroupLabel>Previously Viewed</SidebarGroupLabel>
                                <SidebarMenu>
                                    {/* ADD PREVIOUS CHATS HERE*/}
                                    <PreviousChats userID="asdfas"></PreviousChats>
                                </SidebarMenu>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>
                    <div className="w-full">
                        {children}
                    </div>
                </SidebarProvider>
            </body>

        </html>
    );
}
