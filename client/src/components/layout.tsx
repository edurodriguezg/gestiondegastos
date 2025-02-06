import { Link, useLocation } from "wouter";
import { HomeIcon, PlusCircleIcon, ClockIcon, SettingsIcon } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pb-20 pt-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            <NavLink href="/" icon={<HomeIcon />} label="Inicio" active={location === "/"} />
            <NavLink href="/add" icon={<PlusCircleIcon />} label="Agregar" active={location === "/add"} />
            <NavLink href="/history" icon={<ClockIcon />} label="Historial" active={location === "/history"} />
            <NavLink href="/settings" icon={<SettingsIcon />} label="Ajustes" active={location === "/settings"} />
          </div>
        </div>
      </nav>
    </div>
  );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <div className={`flex flex-col items-center p-2 cursor-pointer ${active ? "text-primary" : "text-muted-foreground"}`}>
        <div className="h-6 w-6">
          {icon}
        </div>
        <span className="text-sm mt-1">{label}</span>
      </div>
    </Link>
  );
}