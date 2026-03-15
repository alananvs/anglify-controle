import { useState, useEffect } from "react";
import { globalCss } from "./src/styles.js";
import { useAuth, useToast, useTurmas, useAlunos, useProfessores } from "./src/hooks/index.js";
import { PAGES, PAGE_TITLES, CARGO_ADMIN } from "./src/constants/index.js";
import { Toast, Icons } from "./src/components/ui/index.jsx";
import Sidebar from "./src/components/Sidebar.jsx";
import LoginPage from "./src/pages/LoginPage.jsx";
import DashboardPage from "./src/pages/DashboardPage.jsx";
import TurmasPage from "./src/pages/TurmasPage.jsx";
import TurmaDetailPage from "./src/pages/TurmaDetailPage.jsx";
import PontoPage from "./src/pages/PontoPage.jsx";
import {
  AdminDashboardPage,
  AdminAlunosPage,
  AdminRelatoriosPage,
  AdminMovimentacaoPage,
  AdminContratosPage,
  AdminPontoPage,
} from "./src/pages/AdminPage.jsx";

const ADMIN_PAGES = [
  PAGES.ADMIN, PAGES.ADMIN_ALUNOS, PAGES.ADMIN_RELATORIOS,
  PAGES.ADMIN_MOVIMENTACAO, PAGES.ADMIN_CONTRATOS, PAGES.ADMIN_PONTO,
];

export default function App() {
  const { user, isAdmin, logout }                     = useAuth();
  const { toast, showToast }                          = useToast();
  const { turmas, load: loadTurmas, ...turmaActions } = useTurmas();
  const { alunos, load: loadAlunos, ...alunoActions } = useAlunos();
  const { professores, load: loadProfessores }        = useProfessores();
  const [page,       setPage]       = useState(PAGES.DASHBOARD);
  const [turmaId,    setTurmaId]    = useState(null);
  const [appLoading, setAppLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setAppLoading(true);
    Promise.all([loadTurmas(), loadAlunos(), loadProfessores()])
      .catch(() => showToast("Erro ao carregar dados.", true))
      .finally(() => setAppLoading(false));
  }, [user]);

  function navigate(targetPage, id) {
    if (ADMIN_PAGES.includes(targetPage) && !isAdmin) return;
    setPage(targetPage);
    if (id !== undefined) setTurmaId(id);
  }

  if (!user) {
    return (
      <>
        <style>{globalCss}</style>
        <LoginPage onSuccess={() => window.location.reload()} />
      </>
    );
  }

  const pageInfo    = PAGE_TITLES[page] || {};
  const isAdminPage = ADMIN_PAGES.includes(page);

  return (
    <>
      <style>{globalCss}</style>
      <div className="app">
        <Sidebar user={user} currentPage={page} onNavigate={navigate} onLogout={logout} />

        <main className="main">
          <div className="topbar">
            <div>
              <div className="topbar__title" style={isAdminPage ? { color: "var(--red)" } : {}}>
                {isAdminPage && " "}{pageInfo.title}
              </div>
              <div className="topbar__subtitle">{pageInfo.subtitle}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {page === PAGES.TURMA_DETAIL && (
                <button className="btn btn--ghost btn--sm" onClick={() => navigate(PAGES.TURMAS)}>
                  <Icons.ChevLeft /> Voltar
                </button>
              )}
              {isAdminPage && page !== PAGES.ADMIN && (
                <button className="btn btn--ghost btn--sm" onClick={() => navigate(PAGES.ADMIN)}>
                  <Icons.ChevLeft /> Painel Admin
                </button>
              )}
            </div>
          </div>

          {appLoading ? (
            <div className="loading-state"><span className="spinner" /> Carregando dados da nuvem...</div>
          ) : (
            <PageRouter
              page={page} user={user} isAdmin={isAdmin} turmaId={turmaId}
              turmas={turmas} alunos={alunos} professores={professores}
              turmaActions={turmaActions} alunoActions={alunoActions}
              onNavigate={navigate} showToast={showToast}
            />
          )}
        </main>
      </div>
      <Toast toast={toast} />
    </>
  );
}

function PageRouter({ page, user, isAdmin, turmaId, turmas, alunos, professores, turmaActions, alunoActions, onNavigate, showToast }) {
  switch (page) {
    case PAGES.DASHBOARD:
      return <DashboardPage user={user} turmas={turmas} alunos={alunos} onNavigate={onNavigate} />;

    case PAGES.TURMAS:
      return <TurmasPage user={user} turmas={turmas} alunos={alunos} professores={professores} turmaActions={turmaActions} onDetail={(id) => onNavigate(PAGES.TURMA_DETAIL, id)} showToast={showToast} />;

    case PAGES.TURMA_DETAIL:
      return <TurmaDetailPage turmaId={turmaId} turmas={turmas} alunos={alunos} turmaActions={turmaActions} alunoActions={alunoActions} showToast={showToast} />;

    case PAGES.PONTO:
      return <PontoPage user={user} />;

    case PAGES.ADMIN:
      return isAdmin ? <AdminDashboardPage turmas={turmas} alunos={alunos} professores={professores} onNavigate={onNavigate} /> : null;

    case PAGES.ADMIN_ALUNOS:
      return isAdmin ? <AdminAlunosPage alunos={alunos} turmas={turmas} professores={professores} /> : null;

    case PAGES.ADMIN_CONTRATOS:
      return isAdmin ? <AdminContratosPage alunos={alunos} turmas={turmas} professores={professores} /> : null;

    case PAGES.ADMIN_RELATORIOS:
      return isAdmin ? <AdminRelatoriosPage turmas={turmas} alunos={alunos} professores={professores} /> : null;

    case PAGES.ADMIN_PONTO:
      return isAdmin ? <AdminPontoPage professores={professores} /> : null;

    case PAGES.ADMIN_MOVIMENTACAO:
      return isAdmin ? <AdminMovimentacaoPage alunos={alunos} turmas={turmas} professores={professores} alunoActions={alunoActions} showToast={showToast} /> : null;

    default:
      return null;
  }
}
