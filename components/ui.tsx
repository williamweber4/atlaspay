import { clsx } from "clsx";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const { className, variant = "primary", ...rest } = props;
  const base = "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition";
  const styles =
    variant === "primary" ? "bg-black text-white hover:bg-gray-900" :
    variant === "danger" ? "bg-red-600 text-white hover:bg-red-700" :
    "bg-transparent text-gray-700 hover:bg-gray-100";
  return <button className={clsx(base, styles, className)} {...rest} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input className={clsx("w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900", className)} {...rest} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return <select className={clsx("w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900", className)} {...rest} />;
}

export function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="text-sm font-semibold">{title}</div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
