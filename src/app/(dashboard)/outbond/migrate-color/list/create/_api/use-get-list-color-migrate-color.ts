import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetListColorMigrate = () => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["list-color-migrate"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/displayMigrate`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
