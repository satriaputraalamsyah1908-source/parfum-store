type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function PageHeader({ title, description, action }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl text-brown-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-brown-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
