"use server";

import { cookies } from "next/headers";
import { baseUrl } from "./baseUrl";
import { deleteCookie, hasCookie } from "cookies-next/server";

export const protect = async () => {
  const cookie = await cookies();
  const token = cookie.get("accessToken")?.value;
  try {
    const res = await fetch(`${baseUrl}/checkLogin`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (
        (await hasCookie("profile", { cookies })) ||
        (await hasCookie("accessToken", { cookies }))
      ) {
        await deleteCookie("profile", { cookies });
        await deleteCookie("accessToken", { cookies });
      }
      return false;
    }

    return true;
  } catch (error) {
    console.log("ERROR_CHECK", error);
    return false;
  }
};
