import React from "react";
import { Metadata } from "next";
import { Client } from "./_components/client";
import { protect } from "@/lib/protect";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Bundle",
};

const BundlePage = async () => {
  const user = await protect();

  if (!user) redirect("/login");
  return (
    <div className="w-full h-full">
      <Client />
    </div>
  );
};

export default BundlePage;
