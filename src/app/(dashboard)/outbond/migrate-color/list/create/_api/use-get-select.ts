import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetSelect = () => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["list-select-migrate-color"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/colorDestination`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
