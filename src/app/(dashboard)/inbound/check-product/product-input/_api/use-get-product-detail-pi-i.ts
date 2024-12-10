import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetProductDetailPII = ({ id }: any) => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["product-detail-product-input", id],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/product_inputs/${id}`, {
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
