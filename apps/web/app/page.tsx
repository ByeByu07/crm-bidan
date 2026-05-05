import { redirect } from "next/navigation";
import { getSession } from "@repo/auth/session";

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect("/sales");
  }
  redirect("/signin");
}
