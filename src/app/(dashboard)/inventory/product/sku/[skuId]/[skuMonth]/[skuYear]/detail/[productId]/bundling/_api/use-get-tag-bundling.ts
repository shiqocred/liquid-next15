import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

type BodyTagBundling = {
  items_per_bundle: number;
};

export const useGetTagBundlingBySku = (
  productId?: any,
  body?: BodyTagBundling,
  enabled?: boolean,
) => {
  const accessToken = getCookie("accessToken");

  return useQuery({
    queryKey: ["check-tag-product-by-sku-bundling", productId, body],
    enabled: !!productId && !!body && enabled,
    queryFn: async () => {
      const res = await axios.post(
        `${baseUrl}/sku-products/${productId}/check-bundle`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return res.data;
    },
  });
};
