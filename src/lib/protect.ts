"use server";

import { cookies } from "next/headers";
import { baseUrl } from "./baseUrl";

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
        !!cookie.get("profile")?.value &&
        !!cookie.get("accessToken")?.value
      ) {
        cookie.delete("profile");
        cookie.delete("accessToken");
      }
      throw new Error("Unauthenticated");
    }

    return true;
  } catch (error) {
    console.log("ERROR_CHECK", error);
    return false;
  }
};
