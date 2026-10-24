"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, register } from "@/lib/actions";

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const [state, action, pending] = useActionState(isLogin ? login : register, undefined);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-3xl font-bold">📚 Study Planner</h1>
      <p className="mb-6 mt-1 text-slate-500">{isLogin ? "Welcome back" : "Create your account"}</p>
      <form action={action} className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {!isLogin && <input name="name" placeholder="Full name" required className={input} />}
        <input name="email" type="email" placeholder="Email" required className={input} />
        <input name="password" type="password" placeholder="Password" required className={input} />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          disabled={pending}
          className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "Please wait..." : isLogin ? "Log in" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        {isLogin ? "No account? " : "Already have one? "}
        <Link href={isLogin ? "/register" : "/login"} className="font-medium text-indigo-600">
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </main>
  );
}
