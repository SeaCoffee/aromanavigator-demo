// frontend/src/app/(private)/admin/layout.tsx

import type { ReactNode } from "react";

import AdminMenu from "@/app/components/admin/AdminMenu";
import { requireAdminOrRedirect } from "@/app/lib/session";

type Props = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const user = await requireAdminOrRedirect();

  return (
    <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-5 px-4 py-5 md:grid-cols-[230px_minmax(0,1fr)] md:px-6">
      <AdminMenu isAdmin={user.is_superuser || user.role === "admin"} />

      <section className="min-w-0">{children}</section>
    </div>
  );
}
