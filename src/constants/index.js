// ─── Auth ─────────────────────────────────────────────────────────────────────
export const SHARED_PASSWORD = "Anglify@2026";
export const SESSION_KEY     = "anglify_user";
export const CARGO_ADMIN     = 1;
export const CARGO_PROFESSOR = 2;

// ─── Domain options ───────────────────────────────────────────────────────────
export const UNIDADES    = ["Estância", "Arapoangas"];
export const LIVROS      = ["Interchange Intro","Interchange One","Interchange Two","Interchange Three"];
export const TURMAS_OPTS = ["Segunda(Dupla)","Terça(Dupla)","Quarta(Dupla)","Sábado(Dupla)","Segunda e Quarta","Terça e Quinta"];

// Mapeamento turma → dias da semana permitidos (0=Dom,1=Seg,2=Ter,3=Qua,4=Qui,5=Sex,6=Sáb)
export const TURMA_DIAS = {
  "Segunda(Dupla)":   [1],
  "Terça(Dupla)":     [2],
  "Quarta(Dupla)":    [3],
  "Sábado(Dupla)":    [6],
  "Segunda e Quarta": [1, 3],
  "Terça e Quinta":   [2, 4],
};

export const MONTH_NAMES  = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const DAY_NAMES    = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
export const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

// ─── Pages ────────────────────────────────────────────────────────────────────
export const PAGES = {
  DASHBOARD:            "dashboard",
  TURMAS:               "turmas",
  TURMA_DETAIL:         "turma-detail",
  PONTO:                "ponto",
  ADMIN:                "admin",
  ADMIN_ALUNOS:         "admin-alunos",
  ADMIN_RELATORIOS:     "admin-relatorios",
  ADMIN_MOVIMENTACAO:   "admin-movimentacao",
  ADMIN_CONTRATOS:      "admin-contratos",
  ADMIN_PONTO:          "admin-ponto",
};

export const PAGE_TITLES = {
  "dashboard":           { title: "Dashboard",              subtitle: "Visão geral" },
  "turmas":              { title: "Minhas Turmas",          subtitle: "Gerenciar turmas" },
  "turma-detail":        { title: "Detalhes da Turma",      subtitle: "Alunos e presença" },
  "ponto":               { title: "Registro de Ponto",      subtitle: "Marque seus horários" },
  "admin":               { title: "Painel Administrativo",  subtitle: "Visão geral da escola" },
  "admin-alunos":        { title: "Alunos",                 subtitle: "Todos os alunos cadastrados" },
  "admin-relatorios":    { title: "Relatórios",             subtitle: "Emissão de relatórios de presença" },
  "admin-movimentacao":  { title: "Movimentação",           subtitle: "Troca de turma de alunos" },
  "admin-contratos":     { title: "Contratos",              subtitle: "Gerência de contratos de alunos" },
  "admin-ponto":         { title: "Folha de Ponto",         subtitle: "Visualizar e exportar ponto dos professores" },
};
