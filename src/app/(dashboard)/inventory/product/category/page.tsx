import React from "react";
import { Metadata } from "next";
import { Client } from "./_components/client";

export const metadata: Metadata = {
  title: "Product by Category",
};

const ProductCategoryPage = () => {
  return (
    <div className="w-full h-full">
      <Client />
    </div>
  );
};

export default ProductCategoryPage;
