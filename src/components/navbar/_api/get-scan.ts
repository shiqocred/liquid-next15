import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetScan = ({ p, q, role }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["get-scan", { p, q, role }],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/wms-scan?page=${p}&q=${q}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    enabled: role === "true",
    refetchInterval: 40000,
  });
  return query;
};
