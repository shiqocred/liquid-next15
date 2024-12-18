"use server";

import { cookies } from "next/headers";
import { baseUrl } from "./baseUrl";

export const protect = async () => {
  const token = (await cookies()).get("accessToken")?.value;
  try {
    const res = await fetch(`${baseUrl}/checkLogin`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      (await cookies()).delete("profile");
      (await cookies()).delete("accessToken");
      throw new Error("Unauthenticated");
    }

    return true;
  } catch (error) {
    console.log("ERROR_CHECK", error);
    return false;
  }
};
