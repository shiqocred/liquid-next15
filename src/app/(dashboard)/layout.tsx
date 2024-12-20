import Navbar from "@/components/navbar/navbar";
import { Sidebar } from "@/components/sidebar/sidebar";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

const AdminDashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className={cn("w-screen bg-white h-full flex flex-col")}>
      <Navbar />
      <div className="w-full flex h-[calc(100vh-64px)]">
        <Sidebar />
        <div className="w-full overflow-x-hidden overflow-y-scroll bg-gray-100 h-full">
          {children}
        </div>
      </div>
    </main>
  );
};

export default AdminDashboardLayout;
