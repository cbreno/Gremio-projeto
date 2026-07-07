/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta institucional de caserna (ver identidade visual do briefing)
        lona: "#E4DECF", // fundo cor de lona/cáqui
        papel: "#F4F1E7", // superfícies em papel claro
        oliva: {
          DEFAULT: "#4A5333", // verde-oliva de campo (cor principal)
          escuro: "#353B25",
        },
        latao: "#B0883A", // detalhe em latão/insígnia
        tinta: "#222418", // tinta escura para texto
      },
      fontFamily: {
        titulo: ['"Archivo"', "system-ui", "sans-serif"],
        corpo: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      backgroundImage: {
        // Textura diagonal leve para a "chapa de identificação" (dog tag)
        "diagonal-latao":
          "repeating-linear-gradient(45deg, rgba(176,136,58,0.10) 0, rgba(176,136,58,0.10) 2px, transparent 2px, transparent 8px)",
      },
    },
  },
  plugins: [],
};
