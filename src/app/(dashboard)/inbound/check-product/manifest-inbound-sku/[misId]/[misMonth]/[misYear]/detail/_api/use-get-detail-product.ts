import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetDetailProduct = ({ id }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["detail-manifest-inbound-sku", id],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/sku-product-old/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    enabled: !!id,
  });
  return query;
};
