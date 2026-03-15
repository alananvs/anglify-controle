import { Icons } from "../components/ui/index.jsx";
import { MONTH_NAMES, DAY_NAMES, PAGES } from "../constants/index.js";
import { usePonto } from "../hooks/index.js";
import { minutesToTime, isSunday } from "../utils/index.js";

export default function DashboardPage({ user, turmas, alunos, onNavigate }) {
  const myTurmas    = turmas.filter((t) => t.id_professor === user.id_professor);
  const totalAlunos = alunos.filter((a) => myTurmas.some((t) => t.id_turma === a.id_turma)).length;
  const now         = new Date();

  const { pontoMap, calcDayMinutes, dateKey } = usePonto(user.id_professor, now.getMonth(), now.getFullYear());

  // Calcula totais do mês atual
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const totalMinutosMes = Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    if (isSunday(now.getFullYear(), now.getMonth(), d)) return 0;
    return calcDayMinutes(pontoMap[dateKey(d)]);
  }).reduce((a, b) => a + b, 0);

  const diasTrabalhados = Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    if (isSunday(now.getFullYear(), now.getMonth(), d)) return false;
    return calcDayMinutes(pontoMap[dateKey(d)]) > 0;
  }).filter(Boolean).length;

  return (
    <div className="content">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 23, fontWeight: 700, color: "var(--g900)", marginBottom: 4 }}>
          Olá, professor {user.ds_nome.split(" ")[0]}
        </div>
        <div style={{ fontSize: 13, color: "var(--g400)" }}>
          {DAY_NAMES[now.getDay()]}, {now.getDate()} de {MONTH_NAMES[now.getMonth()]} de {now.getFullYear()}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-card__label">Minhas Turmas</div>
          <div className="stat-card__value">{myTurmas.length}</div>
          <div className="stat-card__detail">turmas ativas</div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-card__label">Alunos</div>
          <div className="stat-card__value">{totalAlunos}</div>
          <div className="stat-card__detail">nas suas turmas</div>
        </div>
        <div className="stat-card stat-card--red">
          <div className="stat-card__label">Dias Trabalhados</div>
          <div className="stat-card__value">{diasTrabalhados}</div>
          <div className="stat-card__detail">{MONTH_NAMES[now.getMonth()]}</div>
        </div>
        <div className="stat-card stat-card--gray">
          <div className="stat-card__label">Horas no Mês</div>
          <div className="stat-card__value" style={{ fontSize: 22, paddingTop: 2 }}>
            {minutesToTime(totalMinutosMes)}
          </div>
          <div className="stat-card__detail">total acumulado</div>
        </div>
      </div>

      <div className="page-header">
        <div>
          <div className="page-header__title">Minhas Turmas</div>
          <div className="page-header__sub">
            {myTurmas.length} turma{myTurmas.length !== 1 ? "s" : ""} sob sua responsabilidade
          </div>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => onNavigate(PAGES.TURMAS)}>
          <Icons.Plus /> Nova Turma
        </button>
      </div>

      {myTurmas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"></div>
          <div className="empty-state__title">Nenhuma turma ainda</div>
          <div className="empty-state__sub">Clique em "Nova Turma" para começar</div>
        </div>
      ) : (
        <div className="turmas-grid">
          {myTurmas.slice(0, 6).map((turma) => {
            const count = alunos.filter((a) => a.id_turma === turma.id_turma).length;
            return (
              <div key={turma.id_turma} className="turma-card"
                onClick={() => onNavigate(PAGES.TURMA_DETAIL, turma.id_turma)}>
                <div className="turma-card__badge"><Icons.Book /> {turma.ds_unidade}</div>
                <div className="turma-card__title">{turma.ds_livro}</div>
                <div className="turma-card__sub">{turma.ds_turma}</div>
                <div className="turma-card__meta">
                  <div className="turma-card__meta-item"><Icons.Users /> {count} aluno{count !== 1 ? "s" : ""}</div>
                  <div className="turma-card__meta-item"><Icons.Clock /> {turma.ds_horario_inicio}–{turma.ds_horario_fim}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
