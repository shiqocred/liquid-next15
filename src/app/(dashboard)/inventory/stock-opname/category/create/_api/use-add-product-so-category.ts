import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidateQuery, useMutate } from "@/lib/query";

interface Body {
  type: string;
  barcode: string;
}

export const useAddProductSOCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/update_check",
    method: "post",
    onSuccess: () => {
      toast.success("Product successfully added");
      invalidateQuery(queryClient, [
        ["list-product-so-category"],
        ["list-data-so-category"],
      ]);
    },
    onError: {
      message: "Product failed to add",
      title: "ADD_PRODUCT",
    },
  });

  // const mutation = useMutation<AxiosResponse, Error, RequestType>({
  //   mutationFn: async ({ body }) => {
  //     const res = await axios.post(`${baseUrl}/update_check`, body, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  //     return res;
  //   },
  //   onSuccess: () => {
  //     toast.success("Product successfully added");
  //     queryClient.invalidateQueries({ queryKey: ["list-product-so-category"] });
  //     queryClient.invalidateQueries({
  //       queryKey: ["list-data-so-category"],
  //     });
  //   },
  //   onError: (err) => {
  //     if (err.status === 403) {
  //       toast.error(`Error 403: Restricted Access`);
  //     } else {
  //       toast.error(`ERROR ${err?.status}: Product failed to add`);
  //       console.log("ERROR_ADD_PRODUCT:", err);
  //     }
  //   },
  // });
  return mutation;
};
