import React from "react";
import { Metadata } from "next";
import { Client } from "./_components/client";

export const metadata: Metadata = {
  title: "Inbound Process",
};

const InboundProcess = () => {
  return (
    <div className="w-full h-full">
      <Client />
    </div>
  );
};

export default InboundProcess;
