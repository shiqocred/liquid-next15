import React from "react";
import { Metadata } from "next";
import { Client } from "./_components/client";

export const metadata: Metadata = {
  title: "List Product Slow Moving",
};

const SlowMovingProduct = () => {
  return (
    <div className="w-full h-full">
      <Client />
    </div>
  );
};

export default SlowMovingProduct;
