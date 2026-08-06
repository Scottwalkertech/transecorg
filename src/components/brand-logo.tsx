import logoUrl from "@/assets/transec-logo.jpg";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="TranSec Logistics logo"
      width={512}
      height={512}
      loading="eager"
      decoding="async"
      className={cn(
        "h-9 w-9 shrink-0 rounded-lg object-cover object-center shadow-elegant [image-rendering:auto]",
        className,
      )}
    />
  );
}
