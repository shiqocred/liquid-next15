import React from "react";
import { Metadata } from "next";
import { Client } from "./_components/client";
import { protect } from "@/lib/protect";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Manual Inbound",
};

const ManualInboundPage = async () => {
  const user = await protect();

  if (!user) redirect("/login");
  return (
    <div className="w-full h-full">
      <Client />
      <Footer />
    </div>
  );
};

export default ManualInboundPage;
