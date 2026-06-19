import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function MobileShell({
  children,
  hideNav = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
}) {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="relative mx-auto min-h-screen w-full max-w-[430px] pb-32 hypn-dot-grid">
        {children}
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
