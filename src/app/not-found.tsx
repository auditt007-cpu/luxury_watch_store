import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="px-5 py-24 text-center">
        <p className="font-serif text-4xl text-gold">404</p>
        <p className="mt-3 text-zinc-400">商品不存在或已下架</p>
        <Link href="/" className="mt-8 inline-block border border-gold px-6 py-2 text-sm text-gold">
          返回展厅
        </Link>
      </div>
    </>
  );
}
