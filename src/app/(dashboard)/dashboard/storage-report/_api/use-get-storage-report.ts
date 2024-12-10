import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetStorageReport = () => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["storage-report"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/dashboard/storage-report`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
