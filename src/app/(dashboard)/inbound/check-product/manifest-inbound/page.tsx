import React from "react";
import { Metadata } from "next";
import { Client } from "./_components/client";

export const metadata: Metadata = {
  title: "Manifest Inbound",
};

const ManifestInboundPage = () => {
  return (
    <div className="w-full h-full">
      <Client />
    </div>
  );
};

export default ManifestInboundPage;
