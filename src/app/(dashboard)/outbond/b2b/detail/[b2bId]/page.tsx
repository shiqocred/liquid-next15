import React from "react";
import { Metadata } from "next";
import { protect } from "@/lib/protect";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { Client } from "./_component/client";

export const metadata: Metadata = {
  title: "Detail B2B",
};

const detailB2BPage = async () => {
  const user = await protect();

  if (!user) redirect("/login");
  return (
    <div className="w-full h-full">
      <Client />
      <Footer />
    </div>
  );
};

export default detailB2BPage;
