import Link from "next/link";
import { logout } from "@/app/admin/actions";

export default function AdminNav() {
  return (
    <nav className="flex items-center gap-4 text-sm font-semibold">
      <Link href="/admin" className="hover:underline">
        Събития
      </Link>
      <form action={logout}>
        <button type="submit" className="opacity-80 hover:underline hover:opacity-100">
          Изход
        </button>
      </form>
    </nav>
  );
}
