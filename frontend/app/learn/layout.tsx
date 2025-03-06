import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
} from "@/components/ui/sidebar";
import PreviousChats from "./previousChats";

export default function LearnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="dark">
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuButton>Account</SidebarMenuButton>
                <SidebarMenuButton>Feedback</SidebarMenuButton>
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
        <div className="w-full">{children}</div>
      </SidebarProvider>
    </main>
  );
}
