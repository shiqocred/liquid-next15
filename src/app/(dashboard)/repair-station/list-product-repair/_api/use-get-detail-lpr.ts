import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetDetailLPR = ({ barcode, document }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["detail-lpr", document, barcode],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/getProductRepair?code_document=${document}&old_barcode_product=${barcode}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    enabled: !!barcode && !!document,
  });
  return query;
};
