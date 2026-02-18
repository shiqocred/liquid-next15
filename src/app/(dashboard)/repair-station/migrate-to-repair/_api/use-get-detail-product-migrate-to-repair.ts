import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetDetailProductMigrateToRepair = ({ id }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["product-migrate-to-repair-detail", id],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/migrate-bulky/product/${id}`, {
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

export default useGetDetailProductMigrateToRepair;
