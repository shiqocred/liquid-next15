import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { useCookies } from "next-client-cookies";

export const useGetDetailMigrateCategory = ({ id }: any) => {
  const accessToken = useCookies().get("accessToken");
  const query = useQuery({
    queryKey: ["detail-migrate-category", id],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/migrate-bulky/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    enabled: !!id,
  });
  return query;
};
