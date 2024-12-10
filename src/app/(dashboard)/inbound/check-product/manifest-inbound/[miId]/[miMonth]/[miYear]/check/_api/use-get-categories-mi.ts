import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetCategoriesMI = () => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["check-categories-manifest-inbound"],
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
