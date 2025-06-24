"use client";

import { lusitana } from "@/app/ui/fonts";
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Button } from "./button";
import { useActionState } from "react";
import { Registeruser } from "@/app/lib/actions";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";

export default function RegisterForm() {
  const searchparams = useSearchParams();
  const callbackUrl = searchparams.get("callbackUrl") || "/dashboard";
  const [errorMessage, formAction, ispending] = useActionState(Registeruser, {
    errors: {},
    message: null,
  });
  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please Register to continue.
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Name
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="name"
                type="text"
                name="name"
                placeholder="Enter your Fullname address"
                required
              />
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <input type="hidden" value={callbackUrl} name="redirectTo" />
        <Button className="mt-4 w-full" aria-disabled={ispending}>
          {ispending ? (
            <p className="text-center">
              <span className="loading loading-spinner loading-xl"></span>
              Processing...
            </p>
          ) : (
            <>
              Register{" "}
              <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
            </>
          )}
        </Button>

        <p className="italic text-sm mt-3">
          Already have an account{" "}
          <Link className="text-blue-400" href="/login">
            Login
          </Link>
        </p>

        <div
          className="flex h-8 mt-5 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage.message && (
            <div>
              {errorMessage.success ? (
                <p className="text-sm gap-2 flex   text-green-500">
                  <span>
                    {" "}
                    <ExclamationCircleIcon className="h-5 w-5 text-green-500" />
                  </span>
                  {errorMessage.message}
                </p>
              ) : (
                <p className="text-sm flex gap-2  text-red-500">
                  <span>
                    {" "}
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  </span>
                  {errorMessage.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
