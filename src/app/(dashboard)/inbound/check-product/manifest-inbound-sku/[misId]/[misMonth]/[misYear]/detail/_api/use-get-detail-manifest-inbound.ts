import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetDetailManifestInboundSku = ({ code, p, q }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["detail-manifest-inbound-sku", code, { p, q }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/sku-product-old?search=${code}&page=${p}&q=${q}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
  });
  return query;
};
