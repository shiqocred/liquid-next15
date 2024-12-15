import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetListDestinationMigrateColor = () => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["list-destination-migrate-color"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/destinations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
