import Navbar from "@/components/navbar/navbar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Sidebar } from "@/components/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

const AdminDashboardLayout = async ({ children }: { children: ReactNode }) => {
  return (
    // <main className={cn("w-screen bg-white h-full flex flex-col")}>
    //   <Navbar />
    //   <div className="w-full flex h-[calc(100vh-64px)]">
    //     <Sidebar />
    //     <div className="w-full overflow-x-hidden overflow-y-scroll bg-gray-100 h-full">
    //       {children}
    //     </div>
    //   </div>
    // </main>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
          ini header
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminDashboardLayout;
