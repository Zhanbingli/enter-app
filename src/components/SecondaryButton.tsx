import type { ButtonHTMLAttributes, ReactNode } from "react";

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function SecondaryButton({
  children,
  className = "",
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-full border border-ink/15 bg-cream/70 px-5 py-2.5 text-sm font-semibold text-ink shadow-sm backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-ink/30 hover:bg-cream focus:outline-none focus:ring-2 focus:ring-tide focus:ring-offset-2 focus:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
