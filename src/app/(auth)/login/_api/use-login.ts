import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { useCookies } from "next-client-cookies";

type RequestType = {
  email_or_username: string;
  password: string;
};

type Error = AxiosError;

export const useLogin = () => {
  const router = useRouter();
  const cookies = useCookies();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async (value) => {
      const res = await axios.post(`${baseUrl}/login`, value);
      return res;
    },
    onSuccess: (res) => {
      toast.success("Login Success");
      cookies.set("accessToken", res.data.data.resource[0]);
      cookies.set("profile", JSON.stringify(res.data.data.resource[1]));
      router.push("/");
    },
    onError: (err) => {
      console.log("ERROR_LOGIN:", err);
      toast.error("Email, username or password not match");
    },
  });
  return mutation;
};
