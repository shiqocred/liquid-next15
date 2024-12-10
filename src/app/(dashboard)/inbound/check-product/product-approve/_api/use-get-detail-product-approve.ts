import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetDetailProductApprove = ({ code, p, q }: any) => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["detail-product-approve", code, { p, q }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/product-approveByDoc/${code}?page=${p}&q=${q}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    enabled: !!code,
  });
  return query;
};
