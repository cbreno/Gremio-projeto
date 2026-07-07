import { NavLink } from "react-router-dom";

const abas = [
  { to: "/admin", rotulo: "Pedidos", fim: true },
  { to: "/admin/produtos", rotulo: "Produtos", fim: false },
  { to: "/admin/devedores", rotulo: "Devedores", fim: false },
];

// Navegação por abas do painel administrativo.
export function AdminNav() {
  return (
    <nav className="superficie mt-4 grid grid-cols-3 gap-1 p-1">
      {abas.map((a) => (
        <NavLink
          key={a.to}
          to={a.to}
          end={a.fim}
          className={({ isActive }) =>
            `rounded-xl px-2 py-2 text-center font-titulo text-sm font-semibold transition ${
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
