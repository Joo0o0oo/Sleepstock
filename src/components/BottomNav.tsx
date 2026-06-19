import { Link, useLocation } from "@tanstack/react-router";
import { Home, TrendingUp, ScanFace, Cloud, Users } from "lucide-react";

export function BottomNav() {
  const { pathname } = useLocation();
  const items = [
    { icon: Home, label: "Home", to: "/" },
    { icon: TrendingUp, label: "Mercado", to: "/mercado" },
    { icon: Cloud, label: "Sueños", to: "/sueno" },
    { icon: Users, label: "Comunidad", to: "/comunidad" },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 px-4 pb-4">
      <div
        className="relative flex items-center justify-around rounded-full px-3 py-3"
        style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(107,33,217,0.22)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow:
            "0 8px 24px -10px rgba(20,16,31,0.18), 0 0 0 1px rgba(107,33,217,0.06) inset",
        }}
      >
        <NavItem {...items[0]} active={pathname === "/"} />
        <NavItem {...items[1]} active={pathname.startsWith("/mercado")} />
        <div className="w-16" />
        <NavItem {...items[2]} active={pathname.startsWith("/sueno")} />
        <NavItem {...items[3]} active={pathname.startsWith("/comunidad")} />
        <Link
          to="/scanner"
          className="absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/3 items-center justify-center rounded-full text-white transition-transform duration-200 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #6B21D9 0%, #8A38F5 100%)",
            boxShadow:
              "0 8px 20px -4px rgba(107,33,217,0.45), 0 0 0 4px #FFFFFF, 0 0 0 5px rgba(107,33,217,0.35)",
          }}
          aria-label="Scanner"
        >
          <ScanFace className="h-7 w-7" />
        </Link>
      </div>
    </nav>
  );
}

function NavItem({
  icon: Icon,
  label,
  to,
  active,
}: {
  icon: typeof Home;
  label: string;
  to: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className="relative flex flex-col items-center gap-1 font-display text-[9px] uppercase transition-colors duration-200"
      style={{
        letterSpacing: "0.14em",
        color: active ? "#4A1AA8" : "#5A4E78",
        fontWeight: active ? 700 : 600,
      }}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
        style={
          active
            ? {
                background: "rgba(107,33,217,0.12)",
                border: "1px solid rgba(107,33,217,0.45)",
                color: "#4A1AA8",
              }
            : {
                color: "#5A4E78",
                border: "1px solid transparent",
              }
        }
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 1.9} />
      </span>
      <span>{label}</span>
      {active && (
        <span
          aria-hidden
          className="absolute -bottom-1 h-[2px] w-4 rounded-full"
          style={{ background: "#6B21D9" }}
        />
      )}
    </Link>
  );
}
