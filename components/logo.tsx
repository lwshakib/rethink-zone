import { cn } from "@/lib/utils";

export const Logo = ({
  className,
  uniColor,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoIcon uniColor={uniColor} />
      <span className="text-base font-semibold tracking-tight text-foreground">
        Rethink
      </span>
    </div>
  );
};

export const LogoIcon = ({
  className,
  uniColor,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-5", className)}
    >
      <g
        transform="translate(5 0)"
        fill={uniColor ? "currentColor" : "url(#logo-gradient)"}
        fillRule="evenodd"
        clipRule="evenodd"
      >
        <path d="m19 12.5c-4.1421 0-7.5-3.35786-7.5-7.5h-5c0 6.9036 5.5964 12.5 12.5 12.5s12.5-5.5964 12.5-12.5h-5c0 4.14214-3.3579 7.5-7.5 7.5zm-7.5 30.5c0-4.1421 3.3579-7.5 7.5-7.5s7.5 3.3579 7.5 7.5h5c0-6.9036-5.5964-12.5-12.5-12.5s-12.5 5.5964-12.5 12.5zm-4-19c0-4.1421-3.35786-7.5-7.5-7.5v-5c6.90356 0 12.5 5.5964 12.5 12.5s-5.59644 12.5-12.5 12.5v-5c4.14214 0 7.5-3.3579 7.5-7.5zm23 0c0-4.1421 3.3579-7.5 7.5-7.5v-5c-6.9036 0-12.5 5.5964-12.5 12.5s5.5964 12.5 12.5 12.5v-5c-4.1421 0-7.5-3.3579-7.5-7.5z" />
      </g>

      <defs>
        <linearGradient
          id="logo-gradient"
          x1="24"
          y1="0"
          x2="24"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9B99FE" />
          <stop offset="1" stopColor="#2BC8B7" />
        </linearGradient>
      </defs>
    </svg>
  );
};
