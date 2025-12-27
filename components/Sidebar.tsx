"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { appName } from "@/lib/env";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contractors", label: "Contractors" },
  { href: "/send", label: "Send Payment" },
  { href: "/payouts", label: "Payouts" },
  { href: "/settings", label: "Settings" }
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-black text-white p-6 flex flex-col">
      <div className="mb-2 text-xl font-bold tracking-tight">{appName()}</div>
      <div className="mb-8 text-xs text-white/60">Pay contractors globally in minutes.</div>
      <nav className="space-y-1 flex-1">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "block rounded-md px-3 py-2 text-sm transition",
                active ? "bg-white/15" : "hover:bg-white/10"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="text-xs text-white/60">Dev UI • Local data</div>
    </aside>
  );
}
