import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetCategoriesBundlingBySku = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["check-categories-product-by-sku-bundling"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/categories`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
