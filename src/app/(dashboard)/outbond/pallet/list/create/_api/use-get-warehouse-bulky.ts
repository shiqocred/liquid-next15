import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrlApiBulky } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetWarehouseBulky = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-warehouse-create-palet"],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrlApiBulky}/products/filter/warehouse`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
  });
  return query;
};
