import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetCountStaging = () => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["count-staging"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/countStaging`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
