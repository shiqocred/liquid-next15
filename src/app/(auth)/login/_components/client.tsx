"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { LeftBackground } from "./left-background";
import { RightBackground } from "./right-background";
import { useLogin } from "../_api/use-login";
import Loading from "@/app/(dashboard)/loading";

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { mutate } = useLogin();
  const [input, setInput] = useState({
    email_or_username: "",
    password: "",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    mutate({
      email_or_username: input.email_or_username,
      password: input.password,
    });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex justify-center items-center h-full px-3 relative w-full">
      <div className="absolute left-0 h-3/5 z-0">
        <LeftBackground />
      </div>
      <div className="absolute right-0 h-3/5 z-0">
        <RightBackground />
      </div>
      <Card className="w-full max-w-sm backdrop-blur-sm z-10 bg-white/70">
        <CardHeader className="flex-row items-center space-y-0 gap-2">
          <div className="h-[58px] relative aspect-square">
            <Image
              alt=""
              src={"/images/liquid.png"}
              fill
              className="object-contain"
            />
          </div>
          <div className="w-full flex flex-col gap-1.5">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Login to your account.</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex w-full flex-col gap-1">
              <Label>Email or Username</Label>
              <Input
                type="email"
                name="email_or_username"
                value={input.email_or_username}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    email_or_username: e.target.value,
                  }))
                }
                placeholder="jhon@example.com"
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <Label>Password</Label>
              <div className="relative flex items-center">
                <Input
                  type="password"
                  name="password"
                  value={input.password}
                  onChange={(e) =>
                    setInput((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
                <button
                  type="button"
                  className="absolute right-3"
                  onClick={() => setIsVisible(!isVisible)}
                >
                  {isVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-sky-500/70 hover:bg-sky-500 text-black"
            >
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
