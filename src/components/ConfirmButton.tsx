"use client";

/** Submit button that asks "are you sure?" first. Use inside a <form action={...}>. */
export function ConfirmButton({
  message,
  className,
  children,
  ...props
}: { message: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
