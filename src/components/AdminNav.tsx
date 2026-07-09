import { NavLink } from "react-router-dom";

const abas = [
  { to: "/admin", rotulo: "Pedidos", fim: true },
  { to: "/admin/lancar", rotulo: "Lançar", fim: false },
  { to: "/admin/produtos", rotulo: "Produtos", fim: false },
  { to: "/admin/devedores", rotulo: "Devedores", fim: false },
  { to: "/admin/militares", rotulo: "Militares", fim: false },
];

// Navegação por abas do painel administrativo (rolável na horizontal).
export function AdminNav() {
  return (
    <nav className="superficie mt-4 flex gap-1 overflow-x-auto p-1">
      {abas.map((a) => (
        <NavLink
          key={a.to}
          to={a.to}
          end={a.fim}
          className={({ isActive }) =>
            `shrink-0 rounded-xl px-3 py-2 text-center font-titulo text-sm font-semibold transition ${
              isActive ? "bg-oliva text-papel" : "text-oliva-escuro hover:bg-lona/60"
            }`
          }
        >
          {a.rotulo}
        </NavLink>
      ))}
    </nav>
  );
}
