import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

type Props = {
  user: {
    name: string;
    username: string;
    email: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: Date;
    role: { name: string };
  };
};

export default function ProfileCard({ user }: Props) {
  const initials =
    user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "U";

  const rows: { label: string; value: string }[] = [
    { label: "Username", value: user.username },
    { label: "Email", value: user.email },
    { label: "Role", value: user.role.name === "ADMIN" ? "Admin" : "Petugas / Kasir" },
    { label: "Terdaftar", value: formatDate(user.createdAt) },
  ];

  return (
    <div className="card max-w-xl p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-beige-100 font-serif text-xl text-brown-700">
          {initials}
        </span>
        <div>
          <h2 className="font-serif text-2xl text-brown-900">{user.name}</h2>
          <Badge variant={user.status === "ACTIVE" ? "success" : "danger"} className="mt-1">
            {user.status === "ACTIVE" ? "Akun Aktif" : "Akun Nonaktif"}
          </Badge>
        </div>
      </div>

      <dl className="mt-6 divide-y divide-beige-100 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 py-3">
            <dt className="text-brown-500">{row.label}</dt>
            <dd className="text-right font-medium text-brown-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
