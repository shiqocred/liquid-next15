import React from "react";
import { Metadata } from "next";
import { Client } from "./_components/client";

export const metadata: Metadata = {
  title: "Bulking Product",
};

const BulkingProductPage = () => {
  return (
    <div className="w-full h-full">
      <Client />
    </div>
  );
};

export default BulkingProductPage;
