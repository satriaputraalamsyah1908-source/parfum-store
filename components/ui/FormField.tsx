type Props = {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

export default function FormField({ label, htmlFor, error, hint, className, children }: Props) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-brown-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-brown-300">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
