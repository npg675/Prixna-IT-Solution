import { redirect } from "next/navigation";

export default function QuotePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const query = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === "string") {
        query.set(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, v));
      }
    }
  }
  const qStr = query.toString();
  redirect(qStr ? `/contact?${qStr}` : "/contact");
}
