import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetListDestinationMC = ({ p, q }: any) => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["list-destination-mc", { p, q }],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/destinations?page=${p}&q=${q}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
