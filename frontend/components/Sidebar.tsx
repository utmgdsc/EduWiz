import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
  } from "@/components/ui/sidebar"
  
const SideBar = () => {
    return (
        <Sidebar>
        <SidebarHeader />
        <SidebarContent>
            <SidebarGroup />
            <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
        </Sidebar>
    )
}

export default SideBar
