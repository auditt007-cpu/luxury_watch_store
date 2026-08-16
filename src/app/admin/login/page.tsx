"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("密码错误");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-5">
      <form onSubmit={onSubmit} className="luxury-card w-full rounded-2xl p-8">
        <p className="text-xs tracking-[0.4em] text-gold">ADMIN</p>
        <h1 className="mt-3 font-serif text-3xl text-gold-soft">后台登录</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="管理员密码"
          className="mt-8 w-full border border-gold/25 bg-transparent px-4 py-3 outline-none focus:border-gold"
        />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button type="submit" className="mt-6 w-full bg-gold py-3 text-ink">
          进入
        </button>
      </form>
    </main>
  );
}
