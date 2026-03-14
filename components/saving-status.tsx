import React from "react";
import { CloudCheck, CloudUpload, Loader2, CloudAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type SavingStatusType = "idle" | "unsaved" | "saving" | "saved" | "error";

interface SavingStatusProps {
  status: SavingStatusType;
  className?: string;
}

export const SavingStatus: React.FC<SavingStatusProps> = ({ status, className }) => {
  return (
    <div className={cn("flex items-center justify-center size-8 rounded-full transition-all duration-300", className)}>
      {status === "saved" && (
        <CloudCheck className="h-4 w-4 text-emerald-500 animate-in zoom-in-50" />
      )}
      {(status === "idle" || status === "unsaved") && (
        <CloudUpload className="h-4 w-4 text-muted-foreground/60" />
      )}
      {status === "saving" && (
        <Loader2 className="h-4 w-4 text-primary animate-spin" />
      )}
      {status === "error" && (
        <CloudAlert className="h-4 w-4 text-destructive animate-pulse" />
      )}
    </div>
  );
};
