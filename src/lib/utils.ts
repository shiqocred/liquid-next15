import { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const apiGMaps = process.env.NEXT_PUBLIC_API_GMAPS!;

export function formatRupiah(rupiah: number) {
  if (rupiah) {
    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
    return formatter.format(rupiah);
  }
  return "Rp 0";
}

export const setPaginate = ({
  isSuccess,
  data,
  dataPaginate,
  setPage,
  setMetaPage,
}: {
  isSuccess: boolean;
  data: any;
  dataPaginate: any;
  setPage: any;
  setMetaPage: any;
}) => {
  if (isSuccess && data) {
    if (dataPaginate.last_page < dataPaginate.current_page) {
      setPage(1);
    } else {
      setPage(dataPaginate.current_page ?? 1);
    }
    setMetaPage({
      last: dataPaginate.last_page ?? 1,
      from: dataPaginate.from ?? 0,
      total: dataPaginate.total ?? 0,
      perPage: dataPaginate.per_page ?? 0,
    });
  }
};

export const alertError = ({
  isError,
  error,
  data,
  action,
  method,
}: {
  isError: boolean;
  error: AxiosError;
  data: string;
  action: string;
  method: string;
}) => {
  if (isError && error.status === 403) {
    toast.error(`Error 403: Restricted Access`);
  }
  if (isError && error.status !== 403) {
    toast.error(`ERROR ${error.status}: ${data} failed to ${action}`);
    console.log(
      `ERROR_${method.toUpperCase()}_${data
        .split(" ")
        .join("_")
        .toUpperCase()}:`,
      error
    );
  }
};
