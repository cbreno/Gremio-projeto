import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Catalogo from "./pages/Catalogo";
import Carrinho from "./pages/Carrinho";
import Checkout from "./pages/Checkout";
import PagamentoPix from "./pages/PagamentoPix";
import MeusPedidos from "./pages/MeusPedidos";
import AdminProdutos from "./pages/admin/Produtos";
import AdminPedidos from "./pages/admin/Pedidos";
import AdminDevedores from "./pages/admin/Devedores";

// Rota "/": redireciona conforme o papel logado (admin -> painel; militar -> catálogo).
function Inicio() {
  const { ehAdmin } = useAuth();
  return ehAdmin ? <Navigate to="/admin" replace /> : <Catalogo />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Militar (autenticado) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Inicio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carrinho"
            element={
              <ProtectedRoute>
                <Carrinho />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedido/:id/pix"
            element={
              <ProtectedRoute>
                <PagamentoPix />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meus-pedidos"
            element={
              <ProtectedRoute>
                <MeusPedidos />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requerAdmin>
                <AdminPedidos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/produtos"
            element={
              <ProtectedRoute requerAdmin>
                <AdminProdutos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/devedores"
            element={
              <ProtectedRoute requerAdmin>
                <AdminDevedores />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
