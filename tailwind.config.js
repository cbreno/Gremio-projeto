/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta institucional de caserna — versão mais rica e viva.
        lona: "#E7E1D1", // fundo cor de lona/cáqui
        papel: "#F7F4EB", // superfícies em papel claro
        oliva: {
          DEFAULT: "#525E30", // verde-oliva de campo (mais vivo)
          escuro: "#333B1F",
          claro: "#6C7A3E",
        },
        latao: {
          DEFAULT: "#C2933A", // latão/insígnia (dourado mais quente)
          claro: "#E0B860",
          escuro: "#9A6E24",
        },
        tinta: "#20241A", // tinta escura para texto
        // Acentos de status
        brasa: "#B5482E", // vermelho-tijolo para pendências/dívidas
      },
      fontFamily: {
        titulo: ['"Archivo"', "system-ui", "sans-serif"],
        corpo: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        // Elevação suave e quente para os cards
        cartao: "0 4px 20px -6px rgba(51,59,31,0.35), 0 1px 2px rgba(32,36,26,0.10)",
        botao: "0 6px 16px -4px rgba(51,59,31,0.45)",
        latao: "0 4px 14px -3px rgba(154,110,36,0.45)",
      },
      backgroundImage: {
        // Textura diagonal leve para a "chapa de identificação" (dog tag)
        "diagonal-latao":
          "repeating-linear-gradient(45deg, rgba(194,147,58,0.12) 0, rgba(194,147,58,0.12) 2px, transparent 2px, transparent 9px)",
        // Gradientes para botões e superfícies
        "oliva-grad": "linear-gradient(135deg, #6C7A3E 0%, #525E30 45%, #3B451F 100%)",
        "latao-grad": "linear-gradient(135deg, #E0B860 0%, #C2933A 55%, #9A6E24 100%)",
        "papel-grad": "linear-gradient(160deg, #FBF9F2 0%, #F3EFE3 100%)",
      },
    },
  },
  plugins: [],
};
