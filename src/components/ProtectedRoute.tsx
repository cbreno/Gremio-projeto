import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Protege rotas por autenticação e por papel.
 *   • sem sessão            -> vai para /login
 *   • requerAdmin e não é   -> vai para / (catálogo do militar)
 * Isso garante que militar não acesse a área do admin (requisito não-funcional).
 */
export function ProtectedRoute({
  children,
  requerAdmin = false,
}: {
  children: ReactNode;
  requerAdmin?: boolean;
}) {
  const { carregando, militar, ehAdmin } = useAuth();

  if (carregando) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-papel">
        <p className="font-mono text-sm">Carregando…</p>
      </div>
    );
  }

  if (!militar) return <Navigate to="/login" replace />;
  if (requerAdmin && !ehAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
