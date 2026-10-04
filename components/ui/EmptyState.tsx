import { Inbox, type LucideIcon } from "lucide-react";

type Props = {
  title: string;
  description?: string;
  icon?: LucideIcon;
};

export default function EmptyState({ title, description, icon: Icon = Inbox }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-beige-100 text-brown-300">
        <Icon size={22} />
      </span>
      <p className="font-medium text-brown-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-brown-500">{description}</p>}
    </div>
  );
}
