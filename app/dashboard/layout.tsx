"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = (session.user as any)?.role;

  const navigation = [
    { name: "Dashboard", href: "/dashboard", roles: ["DEVELOPER", "PROFESSIONAL", "ADMIN"] },
    { name: "Professional Directory", href: "/dashboard/directory", roles: ["DEVELOPER", "PROFESSIONAL", "ADMIN"], featured: true },
    { name: "Projects", href: "/dashboard/projects", roles: ["DEVELOPER", "ADMIN"] },
    { name: "My Profile", href: "/dashboard/profile", roles: ["PROFESSIONAL"] },
    { name: "Browse Projects", href: "/dashboard/browse", roles: ["PROFESSIONAL"] },
  ];

  const filteredNav = navigation.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                  TrustedLand
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
                {filteredNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      (item as any).featured
                        ? pathname === item.href
                          ? "border-indigo-500 text-indigo-700 font-black text-base"
                          : "border-transparent text-indigo-600 hover:text-indigo-800 font-black text-base"
                        : pathname === item.href
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {(item as any).featured && "⭐ "}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {session.user?.name}
                {userRole && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({userRole.toLowerCase()})
                  </span>
                )}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
