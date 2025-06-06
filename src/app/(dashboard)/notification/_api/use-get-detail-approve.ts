import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetDetailApprove = ({ id, status }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["detail-sale-approve", { id, status }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/get_approve_spv/${status}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    enabled: !!id && !!status,
  });
  return query;
};
