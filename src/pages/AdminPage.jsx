import { useState, useEffect } from "react";
import { Icons, Modal, EmptyState, MonthSelector, PageHeader, Field } from "../components/ui/index.jsx";
import { MONTH_NAMES, DAY_NAMES, PAGES } from "../constants/index.js";
import { presencaRepository, pontoRepository } from "../services/repositories.js";
import { daysInMonth, getDayOfWeek, isSunday, isSaturday, pad, minutesToTime, formatDate, daysUntil, isBirthdayThisMonth, calcFimContrato } from "../utils/index.js";
import { usePonto } from "../hooks/index.js";

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export function AdminDashboardPage({ turmas, alunos, professores, onNavigate }) {
  const now          = new Date();
  const thisMonth    = now.getMonth();
  const totalTurmas  = turmas.length;
  const totalAlunos  = alunos.length;

  const alunosPorProf = professores.map((p) => ({
    ds_nome: p.ds_nome,
    count:   alunos.filter((a) => turmas.find((t) => t.id_turma === a.id_turma && t.id_professor === p.id_professor)).length,
  })).filter((p) => p.count > 0).sort((a, b) => b.count - a.count);

  const turmasComAlunos = turmas.map((t) => ({
    ...t, count: alunos.filter((a) => a.id_turma === t.id_turma).length,
    professor: professores.find((p) => p.id_professor === t.id_professor)?.ds_nome || "—",
  })).sort((a, b) => b.count - a.count);

  // Contratos vencendo em até 30 dias
  const contratosAlerta = alunos.filter((a) => {
    if (!a.dt_fim_contrato) return false;
    const days = daysUntil(a.dt_fim_contrato);
    return days !== null && days >= 0 && days <= 30;
  }).sort((a, b) => daysUntil(a.dt_fim_contrato) - daysUntil(b.dt_fim_contrato));

  // Aniversariantes do mês
  const aniversariantes = alunos.filter((a) => isBirthdayThisMonth(a.dt_nascimento, thisMonth))
    .sort((a, b) => new Date(a.dt_nascimento).getDate() - new Date(b.dt_nascimento).getDate());

  return (
    <div className="content">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--g900)", marginBottom: 4 }}>Painel Administrativo</div>
        <div style={{ fontSize: 13, color: "var(--g400)" }}>Visão geral da escola Anglify</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card--blue"><div className="stat-card__label">Total de Turmas</div><div className="stat-card__value">{totalTurmas}</div><div className="stat-card__detail">turmas ativas</div></div>
        <div className="stat-card stat-card--green"><div className="stat-card__label">Total de Alunos</div><div className="stat-card__value">{totalAlunos}</div><div className="stat-card__detail">alunos matriculados</div></div>
        <div className="stat-card stat-card--red"><div className="stat-card__label">Professores</div><div className="stat-card__value">{professores.filter((p) => p.id_cargo === 2).length}</div><div className="stat-card__detail">professores ativos</div></div>
        <div className="stat-card stat-card--gray"><div className="stat-card__label">Média Alunos/Turma</div><div className="stat-card__value">{totalTurmas ? Math.round(totalAlunos / totalTurmas) : 0}</div><div className="stat-card__detail">por turma</div></div>
      </div>

      {/* Alertas de contratos */}
      {contratosAlerta.length > 0 && (
        <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}></span>
            <span style={{ fontWeight: 600, color: "#92400E", fontSize: 14 }}>
              {contratosAlerta.length} contrato{contratosAlerta.length !== 1 ? "s" : ""} vencendo em até 30 dias
            </span>
            <button className="btn btn--ghost btn--sm" style={{ marginLeft: "auto" }} onClick={() => onNavigate(PAGES.ADMIN_CONTRATOS)}>Ver todos</button>
          </div>
          {contratosAlerta.slice(0, 3).map((a) => {
            const d = daysUntil(a.dt_fim_contrato);
            return (
              <div key={a.id_aluno} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #FDE68A" }}>
                <span style={{ fontSize: 13, color: "#78350F", fontWeight: 500 }}>{a.ds_nome}</span>
                <span style={{ fontSize: 12, color: "#92400E" }}>Vence em {d === 0 ? "hoje" : `${d} dia${d !== 1 ? "s" : ""}`} — {formatDate(a.dt_fim_contrato)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Alunos por professor */}
        <div className="card">
          <div className="card__header"><div className="card__title">Alunos por Professor</div></div>
          {alunosPorProf.length === 0 ? <EmptyState icon="" title="Nenhum dado" subtitle="" /> : (
            alunosPorProf.map((p) => (
              <div key={p.ds_nome} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--g100)" }}>
                <span style={{ fontSize: 13, color: "var(--g700)" }}>{p.ds_nome}</span>
                <span className="tag tag--blue">{p.count} aluno{p.count !== 1 ? "s" : ""}</span>
              </div>
            ))
          )}
        </div>

        {/* Aniversariantes do mês */}
        <div className="card">
          <div className="card__header">
            <div><div className="card__title">Aniversariantes de {MONTH_NAMES[thisMonth]}</div></div>
          </div>
          {aniversariantes.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--g400)", textAlign: "center", padding: "20px 0" }}>Nenhum aniversariante este mês</div>
          ) : (
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {aniversariantes.map((a) => {
                const dia = new Date(a.dt_nascimento).getDate();
                const isToday2 = dia === now.getDate();
                return (
                  <div key={a.id_aluno} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--g100)" }}>
                    <span style={{ fontSize: 13, fontWeight: isToday2 ? 600 : 400, color: isToday2 ? "var(--blue)" : "var(--g700)" }}>
                      {isToday2 ? "" : ""}{a.ds_nome}
                    </span>
                    <span className={`tag ${isToday2 ? "tag--blue" : "tag--gray"}`}>Dia {dia}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Alunos por turma */}
        <div className="card">
          <div className="card__header"><div className="card__title">Alunos por Turma</div></div>
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {turmasComAlunos.map((t) => (
              <div key={t.id_turma} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--g100)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--g800)" }}>{t.ds_livro}</div>
                  <div style={{ fontSize: 11, color: "var(--g400)" }}>{t.ds_turma} • {t.professor}</div>
                </div>
                <span className="tag tag--green">{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="card">
          <div className="card__header"><div className="card__title">Ações Rápidas</div></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button className="btn btn--primary" onClick={() => onNavigate(PAGES.ADMIN_RELATORIOS)}><Icons.Download /> Emitir Relatório de Presença</button>
            <button className="btn btn--ghost" onClick={() => onNavigate(PAGES.ADMIN_PONTO)}><Icons.Clock /> Exportar Folha de Ponto</button>
            <button className="btn btn--ghost" onClick={() => onNavigate(PAGES.ADMIN_CONTRATOS)}><Icons.Book /> Gerenciar Contratos</button>
            <button className="btn btn--ghost" onClick={() => onNavigate(PAGES.ADMIN_MOVIMENTACAO)}><Icons.Users /> Movimentar Aluno</button>
            <button className="btn btn--ghost" onClick={() => onNavigate(PAGES.ADMIN_ALUNOS)}><Icons.Users /> Ver Todos os Alunos</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Alunos ─────────────────────────────────────────────────────────────
export function AdminAlunosPage({ alunos, turmas, professores }) {
  const [search, setSearch]         = useState("");
  const [filterTurma, setFilterTurma] = useState("");

  const filtered = alunos.filter((a) => {
    const matchSearch = a.ds_nome.toLowerCase().includes(search.toLowerCase());
    const matchTurma  = filterTurma ? a.id_turma === Number(filterTurma) : true;
    return matchSearch && matchTurma;
  });

  function getTurma(id) { return turmas.find((t) => t.id_turma === id); }
  function getProf(idP) { return professores.find((p) => p.id_professor === idP); }

  return (
    <div className="content">
      <PageHeader title="Todos os Alunos" subtitle={`${alunos.length} alunos matriculados`} />
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input className="field__input" style={{ maxWidth: 280 }} placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="field__input" style={{ maxWidth: 240 }} value={filterTurma} onChange={(e) => setFilterTurma(e.target.value)}>
          <option value="">Todas as turmas</option>
          {turmas.map((t) => <option key={t.id_turma} value={t.id_turma}>{t.ds_livro} — {t.ds_turma}</option>)}
        </select>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="ponto-table">
          <thead><tr><th>Aluno</th><th>Telefone</th><th>Nascimento</th><th>Turma</th><th>Professor</th><th>Contrato</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--g400)" }}>Nenhum aluno encontrado</td></tr>
            ) : filtered.map((a) => {
              const turma = getTurma(a.id_turma);
              const prof  = turma ? getProf(turma.id_professor) : null;
              const d     = a.dt_fim_contrato ? daysUntil(a.dt_fim_contrato) : null;
              const alertContract = d !== null && d <= 30 && d >= 0;
              return (
                <tr key={a.id_aluno}>
                  <td style={{ fontWeight: 500 }}>{a.ds_nome}</td>
                  <td style={{ color: "var(--g500)" }}>{a.ds_telefone || "—"}</td>
                  <td style={{ color: "var(--g500)" }}>{formatDate(a.dt_nascimento)}</td>
                  <td>{turma ? <><span className="tag tag--blue" style={{ marginRight: 4 }}>{turma.ds_livro}</span>{turma.ds_turma}</> : <span className="tag tag--gray">Sem turma</span>}</td>
                  <td style={{ color: "var(--g600)" }}>{prof?.ds_nome || "—"}</td>
                  <td>
                    {a.dt_fim_contrato ? (
                      <span className={`tag ${alertContract ? "tag--red" : "tag--green"}`}>
                        {alertContract ? `${d}d` : formatDate(a.dt_fim_contrato)}
                      </span>
                    ) : <span className="tag tag--gray">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Admin Contratos ──────────────────────────────────────────────────────────
export function AdminContratosPage({ alunos, turmas, professores }) {
  const [filter, setFilter] = useState("alerta"); // "alerta" | "todos" | "vencidos"

  function getTurma(id) { return turmas.find((t) => t.id_turma === id); }
  function getProf(idP) { return professores.find((p) => p.id_professor === idP); }

  const withContracts = alunos.filter((a) => a.dt_fim_contrato);

  const filtered = withContracts.filter((a) => {
    const d = daysUntil(a.dt_fim_contrato);
    if (filter === "alerta")  return d !== null && d >= 0 && d <= 30;
    if (filter === "vencidos") return d !== null && d < 0;
    return true;
  }).sort((a, b) => daysUntil(a.dt_fim_contrato) - daysUntil(b.dt_fim_contrato));

  const alertCount   = withContracts.filter((a) => { const d = daysUntil(a.dt_fim_contrato); return d !== null && d >= 0 && d <= 30; }).length;
  const vencidoCount = withContracts.filter((a) => { const d = daysUntil(a.dt_fim_contrato); return d !== null && d < 0; }).length;

  return (
    <div className="content">
      <PageHeader title="Gerência de Contratos" subtitle="Contratos ativos e alertas de vencimento" />

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card stat-card--blue"><div className="stat-card__label">Total com Contrato</div><div className="stat-card__value">{withContracts.length}</div><div className="stat-card__detail">alunos</div></div>
        <div className="stat-card stat-card--red"><div className="stat-card__label">Vencendo em 30 dias</div><div className="stat-card__value">{alertCount}</div><div className="stat-card__detail">requer atenção</div></div>
        <div className="stat-card stat-card--gray"><div className="stat-card__label">Vencidos</div><div className="stat-card__value">{vencidoCount}</div><div className="stat-card__detail">contratos expirados</div></div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["alerta", `Alertas (${alertCount})`], ["vencidos", `Vencidos (${vencidoCount})`], ["todos", "Todos"]].map(([v, label]) => (
          <button key={v} className={`btn ${filter === v ? "btn--primary" : "btn--ghost"} btn--sm`} onClick={() => setFilter(v)}>{label}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="ponto-table">
          <thead><tr><th>Aluno</th><th>Turma</th><th>Professor</th><th>Início</th><th>Fim</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--g400)" }}>Nenhum contrato nesta categoria</td></tr>
            ) : filtered.map((a) => {
              const turma = getTurma(a.id_turma);
              const prof  = turma ? getProf(turma.id_professor) : null;
              const d     = daysUntil(a.dt_fim_contrato);
              let statusTag, statusColor;
              if (d < 0)       { statusTag = "Vencido";               statusColor = "tag--red"; }
              else if (d === 0) { statusTag = "Vence hoje!";           statusColor = "tag--red"; }
              else if (d <= 7)  { statusTag = `${d}d — Urgente`;       statusColor = "tag--red"; }
              else if (d <= 30) { statusTag = `${d} dias restantes`;   statusColor = "tag--gray"; }
              else              { statusTag = formatDate(a.dt_fim_contrato); statusColor = "tag--green"; }

              return (
                <tr key={a.id_aluno}>
                  <td style={{ fontWeight: 500 }}>{a.ds_nome}</td>
                  <td>{turma ? `${turma.ds_livro} — ${turma.ds_turma}` : "—"}</td>
                  <td style={{ color: "var(--g500)" }}>{prof?.ds_nome || "—"}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>{formatDate(a.dt_inicio_contrato)}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>{formatDate(a.dt_fim_contrato)}</td>
                  <td><span className={`tag ${statusColor}`}>{statusTag}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Admin Ponto (export) ─────────────────────────────────────────────────────
export function AdminPontoPage({ professores }) {
  const now = new Date();
  const [selectedProf, setSelectedProf] = useState("");
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const prof = professores.find((p) => p.id_professor === Number(selectedProf));
  const { pontoMap, loading, totalMinutes, workedDays, dateKey, calcDayMinutes } =
    usePonto(prof ? prof.id_professor : null, month, year);

  const days = daysInMonth(year, month);

  function exportPDF() {
    const rows = Array.from({ length: days }, (_, i) => {
      const d = i + 1, dow = getDayOfWeek(year, month, d);
      const isSun = isSunday(year, month, d), isSat = isSaturday(year, month, d);
      const key = dateKey(d), r = pontoMap[key] || {}, mins = calcDayMinutes(r);
      const bg = isSun ? "#f9fafb" : isSat ? "#f0fdf4" : "white";
      const dc = isSun ? "#d1d5db" : isSat ? "#16a34a" : "#374151";
      const cell = (v) => `<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace">${isSun ? "" : v || "—"}</td>`;
      return `<tr style="background:${bg}"><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace">${pad(d)}/${pad(month+1)}/${year}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:${dc}">${DAY_NAMES[dow]}</td>${cell(r.dt_primeira_entrada)}${cell(r.dt_primeira_saida)}${cell(r.dt_segunda_entrada)}${cell(r.dt_segunda_saida)}<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace;color:${mins>0?"#16a34a":"#9ca3af"}">${isSun?"—":mins>0?minutesToTime(mins):"—"}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280">${r.ds_observacao||""}</td></tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ponto — ${prof?.ds_nome}</title><style>body{font-family:sans-serif;padding:32px;color:#1f2937;max-width:1000px;margin:0 auto}h1{font-size:20px;font-weight:700;margin-bottom:4px}p{color:#6b7280;font-size:13px;margin-bottom:24px}table{width:100%;border-collapse:collapse}th{background:#f3f4f6;padding:8px 10px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #e5e7eb}.sum{margin-top:24px;background:#111827;color:white;padding:16px 20px;border-radius:8px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}.sl{font-size:11px;color:#9ca3af;text-transform:uppercase;margin-bottom:4px}.sv{font-size:24px;font-weight:700;font-family:monospace}</style></head><body><h1>Folha de Ponto — ${prof?.ds_nome}</h1><p>${MONTH_NAMES[month]} de ${year} • Anglify • Gerado em ${new Date().toLocaleDateString("pt-BR")}</p><table><thead><tr><th>Data</th><th>Dia</th><th>1ª Entrada</th><th>1ª Saída</th><th>2ª Entrada</th><th>2ª Saída</th><th>Total</th><th>Obs.</th></tr></thead><tbody>${rows}</tbody></table><div class="sum"><div><div class="sl">Total de Horas</div><div class="sv">${minutesToTime(totalMinutes)}</div></div><div><div class="sl">Dias Trabalhados</div><div class="sv">${workedDays}</div></div><div><div class="sl">Total em Minutos</div><div class="sv">${totalMinutes} min</div></div></div></body></html>`;
    const w = window.open("", "_blank"); w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500);
  }

  function exportExcel() {
    const header = ["Data", "Dia", "1ª Entrada", "1ª Saída", "2ª Entrada", "2ª Saída", "Total", "Observação"];
    const dataRows = Array.from({ length: days }, (_, i) => {
      const d = i + 1, dow = getDayOfWeek(year, month, d), isSun = isSunday(year, month, d);
      const key = dateKey(d), r = pontoMap[key] || {}, mins = calcDayMinutes(r);
      return [`${pad(d)}/${pad(month+1)}/${year}`, DAY_NAMES[dow], isSun?"":r.dt_primeira_entrada||"", isSun?"":r.dt_primeira_saida||"", isSun?"":r.dt_segunda_entrada||"", isSun?"":r.dt_segunda_saida||"", isSun?"—":mins>0?minutesToTime(mins):"", r.ds_observacao||""];
    });
    const csv = [header, ...dataRows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `ponto_${prof?.ds_nome}_${MONTH_NAMES[month]}_${year}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="content">
      <PageHeader title="Folha de Ponto dos Professores" subtitle="Visualize e exporte a folha de qualquer professor" />

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
            <label className="field__label">Professor</label>
            <select className="field__input" value={selectedProf} onChange={(e) => setSelectedProf(e.target.value)}>
              <option value="">Selecione um professor...</option>
              {professores.filter((p) => p.id_cargo === 2).map((p) => <option key={p.id_professor} value={p.id_professor}>{p.ds_nome}</option>)}
            </select>
          </div>
          <MonthSelector month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} loading={loading} />
          {selectedProf && (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn--primary btn--sm" onClick={exportPDF}><Icons.Download /> PDF</button>
              <button className="btn btn--ghost btn--sm" onClick={exportExcel}><Icons.Download /> Excel</button>
            </div>
          )}
        </div>
      </div>

      {!selectedProf ? (
        <EmptyState icon="" title="Selecione um professor" subtitle="Escolha o professor acima para ver a folha de ponto" />
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
            <table className="ponto-table">
              <thead><tr><th>Data</th><th>Dia</th><th>1ª Entrada</th><th>1ª Saída</th><th>2ª Entrada</th><th>2ª Saída</th><th>Total</th><th>Obs.</th></tr></thead>
              <tbody>
                {Array.from({ length: days }, (_, i) => {
                  const d = i + 1, dow = getDayOfWeek(year, month, d);
                  const isSun = isSunday(year, month, d), isSat = isSaturday(year, month, d);
                  const key = dateKey(d), r = pontoMap[key] || {}, mins = calcDayMinutes(r);
                  return (
                    <tr key={d} className={isSun ? "ponto-row--sunday" : ""}>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 13 }}>{pad(d)}/{pad(month+1)}/{year}{isSat && <span className="tag tag--green" style={{ marginLeft: 6 }}>Sáb</span>}</td>
                      <td style={{ color: isSun ? "var(--g300)" : isSat ? "var(--green)" : "var(--g600)" }}>{DAY_NAMES[dow]}</td>
                      {isSun ? <><td/><td/><td/><td/><td style={{ color: "var(--g300)" }}>—</td><td/></> : (
                        <>
                          <td style={{ fontFamily: "monospace", fontSize: 13 }}>{r.dt_primeira_entrada || "—"}</td>
                          <td style={{ fontFamily: "monospace", fontSize: 13 }}>{r.dt_primeira_saida   || "—"}</td>
                          <td style={{ fontFamily: "monospace", fontSize: 13 }}>{r.dt_segunda_entrada  || "—"}</td>
                          <td style={{ fontFamily: "monospace", fontSize: 13 }}>{r.dt_segunda_saida    || "—"}</td>
                          <td style={{ fontFamily: "monospace", fontSize: 13, color: mins > 0 ? "var(--green)" : "var(--g300)", fontWeight: mins > 0 ? 600 : 400 }}>{mins > 0 ? minutesToTime(mins) : "—"}</td>
                          <td style={{ fontSize: 13, color: "var(--g500)" }}>{r.ds_observacao || ""}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="ponto-summary">
            <div><div className="ponto-summary__label">Total de Horas — {MONTH_NAMES[month]} {year}</div><div className="ponto-summary__value">{minutesToTime(totalMinutes)}</div></div>
            <div><div className="ponto-summary__label">Dias Trabalhados</div><div className="ponto-summary__value">{workedDays}</div></div>
            <div><div className="ponto-summary__label">Total em Minutos</div><div className="ponto-summary__value" style={{ fontSize: 22 }}>{totalMinutes} min</div></div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Admin Relatórios ─────────────────────────────────────────────────────────
export function AdminRelatoriosPage({ turmas, alunos, professores }) {
  const [selectedTurma, setSelectedTurma] = useState("");
  const [month, setMonth]                 = useState(new Date().getMonth());
  const [year, setYear]                   = useState(new Date().getFullYear());
  const [presencaData, setPresencaData]   = useState([]);
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    if (!selectedTurma) return;
    setLoading(true);
    presencaRepository.findByTurmaMonthYear(Number(selectedTurma), month, year)
      .then(setPresencaData).catch(() => {}).finally(() => setLoading(false));
  }, [selectedTurma, month, year]);

  const turma         = turmas.find((t) => t.id_turma === Number(selectedTurma));
  const alunosDaTurma = alunos.filter((a) => a.id_turma === Number(selectedTurma));
  const days          = daysInMonth(year, month);

  function getStatus(alunoId, dia) {
    const row = presencaData.find((p) => p.id_aluno === alunoId && p.dt_dia === dia);
    if (!row) return null;
    return row.st_presente ? "P" : "F";
  }

  function getPercent(alunoId) {
    const aulas = presencaData.filter((p) => alunosDaTurma.some((a) => a.id_aluno === p.id_aluno)).map((p) => p.dt_dia).filter((v, i, arr) => arr.indexOf(v) === i).length;
    if (aulas === 0) return null;
    const pres = presencaData.filter((p) => p.id_aluno === alunoId && p.st_presente).length;
    return Math.round((pres / aulas) * 100);
  }

  function exportPDF() {
    const header = Array.from({ length: days }, (_, i) => { const d = i+1, dow = getDayOfWeek(year,month,d); return isSunday(year,month,d) ? "" : `<th style="padding:4px;min-width:26px;text-align:center;font-size:10px;background:#f3f4f6">${d}<br/><span style="font-weight:400">${DAY_NAMES[dow]}</span></th>`; }).join("");
    const bodyRows = alunosDaTurma.map((a) => { const cells = Array.from({length:days},(_,i)=>{const d=i+1;if(isSunday(year,month,d))return"";const s=getStatus(a.id_aluno,d);const color=s==="P"?"#16a34a":s==="F"?"#dc2626":"#d1d5db";return`<td style="padding:4px;text-align:center;border-bottom:1px solid #f3f4f6;color:${color};font-weight:600">${s||"·"}</td>`;}).join(""); const pct=getPercent(a.id_aluno); const pc=pct===null?"#9ca3af":pct>=75?"#16a34a":"#dc2626"; return `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-weight:500">${a.ds_nome}</td>${cells}<td style="padding:6px 8px;text-align:center;font-weight:700;color:${pc}">${pct!==null?pct+"%":"—"}</td></tr>`; }).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Presença</title><style>body{font-family:sans-serif;padding:28px;color:#1f2937}h1{font-size:18px;font-weight:700;margin-bottom:4px}p{color:#6b7280;font-size:12px;margin-bottom:20px}table{border-collapse:collapse;width:100%}th{border-bottom:2px solid #e5e7eb}</style></head><body><h1>Relatório de Presença — ${turma?.ds_livro} ${turma?.ds_turma}</h1><p>${MONTH_NAMES[month]} de ${year} • Anglify • Gerado em ${new Date().toLocaleDateString("pt-BR")}</p><table><thead><tr><th style="padding:6px 8px;text-align:left;background:#f3f4f6">Aluno</th>${header}<th style="padding:6px 8px;background:#f3f4f6;text-align:center">%</th></tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
    const w = window.open("", "_blank"); w.document.write(html); w.document.close(); setTimeout(() => w.print(), 400);
  }

  function exportExcel() {
    const headerRow = ["Aluno", ...Array.from({length:days},(_,i)=>{const d=i+1;return isSunday(year,month,d)?null:`${pad(d)}/${pad(month+1)}`}).filter(Boolean), "%"];
    const dataRows = alunosDaTurma.map((a) => { const cells=Array.from({length:days},(_,i)=>{const d=i+1;if(isSunday(year,month,d))return null;return getStatus(a.id_aluno,d)||"";}).filter((v)=>v!==null); const pct=getPercent(a.id_aluno); return[a.ds_nome,...cells,pct!==null?`${pct}%`:"—"]; });
    const csv = [headerRow,...dataRows].map((r)=>r.map((c)=>`"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`presenca_${turma?.ds_turma||"turma"}_${MONTH_NAMES[month]}_${year}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="content">
      <PageHeader title="Relatórios de Presença" subtitle="Selecione a turma e o período" />
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
            <label className="field__label">Turma</label>
            <select className="field__input" value={selectedTurma} onChange={(e) => setSelectedTurma(e.target.value)}>
              <option value="">Selecione uma turma...</option>
              {turmas.map((t) => { const p = professores.find((pr) => pr.id_professor === t.id_professor); return <option key={t.id_turma} value={t.id_turma}>{t.ds_livro} — {t.ds_turma} ({p?.ds_nome || ""})</option>; })}
            </select>
          </div>
          <MonthSelector month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} loading={loading} />
          {selectedTurma && <><button className="btn btn--primary btn--sm" onClick={exportPDF}><Icons.Download /> PDF</button><button className="btn btn--ghost btn--sm" onClick={exportExcel}><Icons.Download /> Excel</button></>}
        </div>
      </div>
      {!selectedTurma ? <EmptyState icon="" title="Selecione uma turma" subtitle="Escolha a turma acima" /> : alunosDaTurma.length === 0 ? <EmptyState icon="" title="Turma sem alunos" subtitle="" /> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table className="presence-table">
              <thead><tr><th className="name-col">Aluno</th>{Array.from({length:days},(_,i)=>{const d=i+1,dow=getDayOfWeek(year,month,d);return isSunday(year,month,d)?null:<th key={d}>{d}<br/><span style={{fontSize:9,fontWeight:400}}>{DAY_NAMES[dow]}</span></th>;})}<th>%</th></tr></thead>
              <tbody>{alunosDaTurma.map((a)=>{const pct=getPercent(a.id_aluno);return(<tr key={a.id_aluno}><td className="name-col">{a.ds_nome}</td>{Array.from({length:days},(_,i)=>{const d=i+1;if(isSunday(year,month,d))return null;const s=getStatus(a.id_aluno,d);return(<td key={d} style={{textAlign:"center"}}>{s==="P"&&<span className="check-btn check-btn--present">✓</span>}{s==="F"&&<span className="check-btn check-btn--absent">✗</span>}{!s&&<span style={{color:"var(--g300)",fontSize:12}}>·</span>}</td>);})}<td>{pct!==null?<span className={`tag ${pct>=75?"tag--green":"tag--red"}`}>{pct}%</span>:<span className="tag tag--gray">—</span>}</td></tr>);})}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Movimentação ───────────────────────────────────────────────────────
export function AdminMovimentacaoPage({ alunos, turmas, professores, alunoActions, showToast }) {
  const [search, setSearch]             = useState("");
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [novaTurma, setNovaTurma]       = useState("");
  const [saving, setSaving]             = useState(false);
  const [historico, setHistorico]       = useState([]);

  const filtered = alunos.filter((a) => a.ds_nome.toLowerCase().includes(search.toLowerCase()));
  function getTurma(id) { return turmas.find((t) => t.id_turma === id); }
  function getProf(idP) { return professores.find((p) => p.id_professor === idP); }

  async function handleMover() {
    if (!selectedAluno || !novaTurma) return;
    setSaving(true);
    try {
      const ta = getTurma(selectedAluno.id_turma), tn = getTurma(Number(novaTurma));
      await alunoActions.moveTurma(selectedAluno.id_aluno, Number(novaTurma));
      setHistorico((h) => [{ aluno: selectedAluno.ds_nome, de: `${ta?.ds_livro} ${ta?.ds_turma}`, para: `${tn?.ds_livro} ${tn?.ds_turma}`, data: new Date().toLocaleDateString("pt-BR") }, ...h]);
      showToast(`${selectedAluno.ds_nome} movido com sucesso!`);
      setSelectedAluno(null); setNovaTurma("");
    } catch { showToast("Erro ao mover aluno.", true); }
    finally { setSaving(false); }
  }

  return (
    <div className="content">
      <PageHeader title="Movimentação de Alunos" subtitle="Troca de turma — histórico de presença mantido" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card__header"><div className="card__title">1. Selecione o Aluno</div></div>
          <input className="field__input" placeholder="Buscar aluno..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 12 }} />
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {filtered.slice(0, 20).map((a) => { const turma = getTurma(a.id_turma); const isSel = selectedAluno?.id_aluno === a.id_aluno; return (<div key={a.id_aluno} onClick={() => { setSelectedAluno(a); setNovaTurma(""); }} style={{ padding: "10px 12px", borderRadius: 6, cursor: "pointer", marginBottom: 4, background: isSel ? "var(--blue-l)" : "var(--g50)", border: `1px solid ${isSel ? "var(--blue)" : "var(--g100)"}` }}><div style={{ fontWeight: 500, fontSize: 13, color: isSel ? "var(--blue)" : "var(--g800)" }}>{a.ds_nome}</div><div style={{ fontSize: 11, color: "var(--g400)" }}>{turma ? `${turma.ds_livro} — ${turma.ds_turma}` : "Sem turma"}</div></div>); })}
          </div>
        </div>
        <div className="card">
          <div className="card__header"><div className="card__title">2. Mover Para</div></div>
          {!selectedAluno ? <EmptyState icon="" title="Selecione um aluno" subtitle="" /> : (
            <>
              <div style={{ background: "var(--blue-l)", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--blue)", fontWeight: 600, marginBottom: 2 }}>Aluno selecionado</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--g900)" }}>{selectedAluno.ds_nome}</div>
                <div style={{ fontSize: 12, color: "var(--g500)" }}>Turma atual: {getTurma(selectedAluno.id_turma)?.ds_livro} — {getTurma(selectedAluno.id_turma)?.ds_turma || "Sem turma"}</div>
              </div>
              <div className="field">
                <label className="field__label">Nova Turma</label>
                <select className="field__input" value={novaTurma} onChange={(e) => setNovaTurma(e.target.value)}>
                  <option value="">Selecione a turma destino...</option>
                  {turmas.filter((t) => t.id_turma !== selectedAluno.id_turma).map((t) => { const p = getProf(t.id_professor); return <option key={t.id_turma} value={t.id_turma}>{t.ds_livro} — {t.ds_turma} ({p?.ds_nome || ""})</option>; })}
                </select>
              </div>
              <button className="btn btn--primary btn--full" onClick={handleMover} disabled={!novaTurma || saving}>{saving ? "Movendo..." : "Confirmar Movimentação"}</button>
            </>
          )}
        </div>
      </div>
      {historico.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card__header"><div className="card__title">Histórico desta Sessão</div></div>
          <table><thead><tr><th>Aluno</th><th>De</th><th>Para</th><th>Data</th></tr></thead>
          <tbody>{historico.map((h, i) => <tr key={i}><td style={{ fontWeight: 500 }}>{h.aluno}</td><td><span className="tag tag--red">{h.de}</span></td><td><span className="tag tag--green">{h.para}</span></td><td style={{ color: "var(--g400)", fontSize: 12 }}>{h.data}</td></tr>)}</tbody></table>
        </div>
      )}
    </div>
  );
}
