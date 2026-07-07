// ============================================================================
// Seed de usuários de teste + pedidos de exemplo — Cantina Tenente Breno
//
// USO LOCAL APENAS. Precisa da service_role key (secreta) no .env:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Rode as migrations e o seed.sql (produtos) ANTES. Depois:  npm run seed:users
//
// A service_role IGNORA a RLS — por isso este script nunca vai para o frontend.
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "\n✖ Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env (veja .env.example).\n",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const telefoneParaEmail = (tel) => `${tel.replace(/\D/g, "")}@cantina.local`;

// Cria (ou reaproveita) um usuário no Auth e garante a linha em militares.
async function criarMilitar({ posto, nome_guerra, telefone, senha, role }) {
  const email = telefoneParaEmail(telefone);

  // 1) Cria no Supabase Auth com e-mail já confirmado (login por telefone->email).
  let userId;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { posto, nome_guerra, telefone },
  });

  if (createErr) {
    // Se já existe, localiza o usuário para reaproveitar o id (idempotência).
    if (/already been registered|already exists/i.test(createErr.message)) {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      userId = list.users.find((u) => u.email === email)?.id;
      if (!userId) throw createErr;
    } else {
      throw createErr;
    }
  } else {
    userId = created.user.id;
  }

  // 2) Garante a linha correspondente em public.militares.
  const { error: upsertErr } = await admin
    .from("militares")
    .upsert({ id: userId, posto, nome_guerra, telefone, role }, { onConflict: "id" });
  if (upsertErr) throw upsertErr;

  console.log(`  ✓ ${role.padEnd(7)} ${posto} ${nome_guerra}  (login: ${telefone} / ${senha})`);
  return userId;
}

async function main() {
  console.log("\nCriando usuários de teste...");

  await criarMilitar({
    posto: "Cap",
    nome_guerra: "Breno",
    telefone: "61999990001",
    senha: "admin123",
    role: "admin",
  });

  const militarId = await criarMilitar({
    posto: "Sd",
    nome_guerra: "Silva",
    telefone: "61999990002",
    senha: "militar123",
    role: "militar",
  });

  // ─── Pedidos de exemplo (para as telas do admin não nascerem vazias) ───────
  console.log("Criando pedidos de exemplo...");

  // Evita duplicar se o script rodar de novo: só cria se o militar não tiver pedidos.
  const { count } = await admin
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("militar_id", militarId);

  if (count && count > 0) {
    console.log("  • Militar de teste já possui pedidos — pulando exemplos.");
  } else {
    // Pedido 1: PIX aguardando confirmação do admin.
    const { data: p1 } = await admin
      .from("pedidos")
      .insert({
        militar_id: militarId,
        total: 12.5,
        forma_pagamento: "pix",
        status: "aguardando",
      })
      .select("id")
      .single();
    await admin.from("itens_pedido").insert([
      {
        pedido_id: p1.id,
        produto_id: "11111111-1111-1111-1111-111111111101",
        nome_produto: "Refrigerante Lata",
        preco_unitario: 5.0,
        quantidade: 1,
      },
      {
        pedido_id: p1.id,
        produto_id: "11111111-1111-1111-1111-111111111103",
        nome_produto: "Salgado",
        preco_unitario: 7.5,
        quantidade: 1,
      },
    ]);

    // Pedido 2: a prazo pendente, vencendo no 1º dia útil do mês seguinte.
    const hoje = new Date();
    const venc = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
    while (venc.getDay() === 0 || venc.getDay() === 6) venc.setDate(venc.getDate() + 1);
    const vencimento = venc.toISOString().slice(0, 10);

    const { data: p2 } = await admin
      .from("pedidos")
      .insert({
        militar_id: militarId,
        total: 5.0,
        forma_pagamento: "prazo",
        status: "pendente",
        vencimento,
      })
      .select("id")
      .single();
    await admin.from("itens_pedido").insert([
      {
        pedido_id: p2.id,
        produto_id: "11111111-1111-1111-1111-111111111104",
        nome_produto: "Café",
        preco_unitario: 2.5,
        quantidade: 2,
      },
    ]);

    console.log("  ✓ 1 pedido PIX (aguardando) e 1 pedido a prazo (pendente) criados.");
  }

  console.log("\n✔ Seed concluído.\n");
}

main().catch((e) => {
  console.error("\n✖ Erro no seed:", e.message ?? e, "\n");
  process.exit(1);
});
