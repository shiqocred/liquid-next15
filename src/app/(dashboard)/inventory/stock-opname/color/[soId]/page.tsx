import { Footer } from "@/components/footer";
import { protect } from "@/lib/protect";
import { redirect } from "next/navigation";
import React from "react";
import { Client } from "./_components/client";

const CreateSOColorPage = async () => {
  const user = await protect();

  if (!user) redirect("/login");
  return (
    <div className="w-full h-full">
      <Client />
      <Footer />
    </div>
  );
};

export default CreateSOColorPage;
