import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

export function Th(props: ThHTMLAttributes<HTMLTableCellElement>) {
  const { children, className, ...rest } = props;
  return (
    <th
      className={clsx(
        "text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 border-b",
        className
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td(props: TdHTMLAttributes<HTMLTableCellElement>) {
  const { children, className, ...rest } = props;
  return (
    <td className={clsx("px-4 py-3 border-b", className)} {...rest}>
      {children}
    </td>
  );
}
