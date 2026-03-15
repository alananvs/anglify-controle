import { useState } from "react";
import { Icons, Modal, ConfirmModal, EmptyState, MonthSelector, Field, Select } from "../components/ui/index.jsx";
import { usePresencas } from "../hooks/index.js";
import { UNIDADES, LIVROS, TURMAS_OPTS, DAY_NAMES, TURMA_DIAS } from "../constants/index.js";
import { daysInMonth, getDayOfWeek, isSunday, isFutureDate, isClassDay, calcFimContrato } from "../utils/index.js";

export default function TurmaDetailPage({ turmaId, turmas, alunos, turmaActions, alunoActions, showToast }) {
  const turma = turmas.find((t) => t.id_turma === turmaId);
  const meus  = alunos.filter((a) => a.id_turma === turmaId);
  const [year, setYear]   = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const { presencaMap, loading: loadingP, pendingCells, toggle } = usePresencas(turmaId, month, year);

  if (!turma) return <div className="content"><EmptyState icon="" title="Turma não encontrada" subtitle="" /></div>;

  async function handleToggle(alunoId, dia) {
    try { await toggle(alunoId, turmaId, dia, month, year); }
    catch { showToast("Erro ao salvar presença.", true); }
  }

  return (
    <div className="content">
      <TurmaInfoCard turma={turma} alunoCount={meus.length}
        onSave={async (data) => { try { await turmaActions.update(turmaId, data); showToast("Turma atualizada!"); } catch { showToast("Erro ao salvar.", true); } }} />
      <AttendanceCard turmaId={turmaId} turmaOpt={turma.ds_turma} meus={meus}
        month={month} year={year} presencaMap={presencaMap} pendingCells={pendingCells}
        loadingP={loadingP} onMonthChange={setMonth} onYearChange={setYear}
        onToggle={handleToggle} alunoActions={alunoActions} showToast={showToast} />
    </div>
  );
}

function TurmaInfoCard({ turma, alunoCount, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const f = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  function openEdit() {
    setForm({ ds_unidade: turma.ds_unidade, ds_livro: turma.ds_livro, ds_turma: turma.ds_turma, ds_horario_inicio: turma.ds_horario_inicio, ds_horario_fim: turma.ds_horario_fim });
    setEditing(true);
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card__header">
        <div><div className="card__title">Informações da Turma</div><div className="card__subtitle">{turma.ds_unidade} • {turma.ds_turma}</div></div>
        {!editing && <button className="icon-btn" onClick={openEdit}><Icons.Edit /></button>}
      </div>
      {editing ? (
        <>
          <div className="field-row">
            <Field label="Unidade"><Select options={UNIDADES} value={form.ds_unidade} onChange={f("ds_unidade")} /></Field>
            <Field label="Livro"><Select options={LIVROS} value={form.ds_livro} onChange={f("ds_livro")} /></Field>
          </div>
          <div className="field-row">
            <Field label="Turma"><Select options={TURMAS_OPTS} value={form.ds_turma} onChange={f("ds_turma")} /></Field>
            <Field label="Início"><input className="field__input field__input--time" type="time" value={form.ds_horario_inicio} onChange={f("ds_horario_inicio")} /></Field>
            <Field label="Fim"><input className="field__input field__input--time" type="time" value={form.ds_horario_fim} onChange={f("ds_horario_fim")} /></Field>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn--primary btn--sm" onClick={async () => { await onSave(form); setEditing(false); }}>Salvar</button>
            <button className="btn btn--ghost btn--sm" onClick={() => setEditing(false)}>Cancelar</button>
          </div>
        </>
      ) : (
        <div className="info-grid">
          <div><span className="info-item__label">Livro</span><span className="info-item__value">{turma.ds_livro}</span></div>
          <div><span className="info-item__label">Turma</span><span className="info-item__value">{turma.ds_turma}</span></div>
          <div><span className="info-item__label">Horário</span><span className="info-item__value">{turma.ds_horario_inicio} – {turma.ds_horario_fim}</span></div>
          <div><span className="info-item__label">Alunos</span><span className="info-item__value">{alunoCount}</span></div>
        </div>
      )}
    </div>
  );
}

function AttendanceCard({ turmaId, turmaOpt, meus, month, year, presencaMap, pendingCells, loadingP, onMonthChange, onYearChange, onToggle, alunoActions, showToast }) {
  const [showAdd, setShowAdd]     = useState(false);
  const [editAluno, setEditAluno] = useState(null);
  const [form, setForm]           = useState(emptyForm());
  const [deleteId, setDeleteId]   = useState(null);
  const days = daysInMonth(year, month);

  function emptyForm() { return { nome: "", email: "", telefone: "", nascimento: "", inicioContrato: "", fimContrato: "" }; }
  const f = (field) => (e) => {
    const val = e.target.value;
    setForm((p) => { const n = { ...p, [field]: val }; if (field === "inicioContrato") n.fimContrato = calcFimContrato(val); return n; });
  };

  async function handleSave() {
    if (!form.nome.trim()) return;
    try {
      if (editAluno) { await alunoActions.update(editAluno.id_aluno, form); showToast("Aluno atualizado!"); setEditAluno(null); }
      else { await alunoActions.create(turmaId, form); showToast("Aluno adicionado!"); setShowAdd(false); }
      setForm(emptyForm());
    } catch { showToast("Erro ao salvar aluno.", true); }
  }

  function openEdit(al) {
    setEditAluno(al);
    setForm({ nome: al.ds_nome, email: al.ds_email || "", telefone: al.ds_telefone || "", nascimento: al.dt_nascimento || "", inicioContrato: al.dt_inicio_contrato || "", fimContrato: al.dt_fim_contrato || "" });
  }

  function presencePercent(alunoId) {
    const aulas = Array.from({ length: days }, (_, i) => meus.some((al) => presencaMap[al.id_aluno]?.[i + 1] !== undefined)).filter(Boolean).length;
    if (aulas === 0) return null;
    const p = Array.from({ length: days }, (_, i) => presencaMap[alunoId]?.[i + 1] === "presente").filter(Boolean).length;
    return Math.round((p / aulas) * 100);
  }

  const closeForm = () => { setShowAdd(false); setEditAluno(null); setForm(emptyForm()); };
  const diasLabel = (TURMA_DIAS[turmaOpt] || []).map((d) => DAY_NAMES[d]).join(", ");

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <div className="card__title">Lista de Presença</div>
          <div className="card__subtitle">
            {meus.length} aluno{meus.length !== 1 ? "s" : ""}
            {diasLabel && <span style={{ marginLeft: 8, color: "var(--blue)", fontWeight: 500 }}>• Aulas: {diasLabel}</span>}
          </div>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => { setForm(emptyForm()); setShowAdd(true); }}><Icons.Plus /> Aluno</button>
      </div>

      <MonthSelector month={month} year={year} onMonthChange={onMonthChange} onYearChange={onYearChange} loading={loadingP} />

      {meus.length === 0 ? (
        <EmptyState icon="" title="Nenhum aluno" subtitle="Adicione alunos para registrar presença" />
      ) : (
        <div className="table-wrap">
          <table className="presence-table">
            <thead>
              <tr>
                <th className="name-col">Aluno</th>
                {Array.from({ length: days }, (_, i) => {
                  const d = i + 1, dow = getDayOfWeek(year, month, d);
                  const isAllowed = !isSunday(year, month, d) && isClassDay(year, month, d, turmaOpt, TURMA_DIAS);
                  return (
                    <th key={d} style={{ color: isAllowed ? "var(--g700)" : "var(--g200)", background: isAllowed ? "var(--g50)" : "var(--g100)" }}>
                      {d}<br /><span style={{ fontSize: 9, fontWeight: 400 }}>{DAY_NAMES[dow]}</span>
                    </th>
                  );
                })}
                <th>%</th><th></th>
              </tr>
            </thead>
            <tbody>
              {meus.map((al) => {
                const pct = presencePercent(al.id_aluno);
                return (
                  <tr key={al.id_aluno}>
                    <td className="name-col">
                      <div>{al.ds_nome}</div>
                      {al.ds_telefone && <div style={{ fontSize: 11, color: "var(--g400)" }}>{al.ds_telefone}</div>}
                    </td>
                    {Array.from({ length: days }, (_, i) => {
                      const d = i + 1;
                      const classDay = isClassDay(year, month, d, turmaOpt, TURMA_DIAS);
                      const isSun    = isSunday(year, month, d);
                      const isFut    = isFutureDate(year, month, d);
                      const val      = presencaMap[al.id_aluno]?.[d];
                      const pending  = pendingCells[`${al.id_aluno}_${d}`];
                      const blocked  = isSun || !classDay;
                      return (
                        <td key={d} style={{ background: blocked ? "var(--g100)" : "transparent" }}>
                          {!blocked && (
                            <button
                              className={["check-btn", val === "presente" ? "check-btn--present" : "", val === "falta" ? "check-btn--absent" : "", isFut ? "check-btn--future" : "", pending ? "check-btn--loading" : ""].filter(Boolean).join(" ")}
                              onClick={() => !isFut && !pending && onToggle(al.id_aluno, d)}>
                              {pending ? "·" : val === "presente" ? "✓" : val === "falta" ? "✗" : ""}
                            </button>
                          )}
                        </td>
                      );
                    })}
                    <td>{pct !== null ? <span className={`tag ${pct >= 75 ? "tag--green" : "tag--red"}`}>{pct}%</span> : <span className="tag tag--gray">—</span>}</td>
                    <td>
                      <div style={{ display: "flex", gap: 2 }}>
                        <button className="icon-btn" onClick={() => openEdit(al)}><Icons.Edit /></button>
                        <button className="icon-btn icon-btn--danger" onClick={() => setDeleteId(al.id_aluno)}><Icons.Trash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: "var(--g400)", display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span><span style={{ display: "inline-flex", width: 16, height: 16, fontSize: 9, background: "var(--green)", borderRadius: 3, color: "white", alignItems: "center", justifyContent: "center", marginRight: 4 }}>✓</span>Presente</span>
        <span><span style={{ display: "inline-flex", width: 16, height: 16, fontSize: 9, background: "var(--red-l)", borderRadius: 3, color: "var(--red)", alignItems: "center", justifyContent: "center", marginRight: 4 }}>✗</span>Falta</span>
        <span><span style={{ display: "inline-flex", width: 16, height: 16, background: "var(--g100)", borderRadius: 3, marginRight: 4 }} />Sem aula</span>
      </div>

      {(showAdd || editAluno) && (
        <Modal title={editAluno ? "Editar Aluno" : "Adicionar Aluno"} onClose={closeForm}
          footer={<><button className="btn btn--ghost" onClick={closeForm}>Cancelar</button><button className="btn btn--primary" onClick={handleSave}>{editAluno ? "Salvar" : "Adicionar"}</button></>}>
          <AlunoForm form={form} f={f} />
        </Modal>
      )}

      {deleteId && (
        <ConfirmModal title="Remover Aluno" message="Os registros de presença deste aluno também serão removidos."
          onConfirm={async () => { try { await alunoActions.remove(deleteId); showToast("Aluno removido."); } catch { showToast("Erro.", true); } finally { setDeleteId(null); } }}
          onClose={() => setDeleteId(null)} />
      )}
    </div>
  );
}

function maskTelefone(value) {
  value = value.replace(/\D/g, ""); // remove tudo que não for número

  if (value.length <= 2)
    return `(${value}`;
  if (value.length <= 7)
    return `(${value.slice(0,2)}) ${value.slice(2)}`;
  if (value.length <= 11)
    return `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7,11)}`;

  return value;
}

export function AlunoForm({ form, f }) {
  return (
    <>
      <Field label="Nome Completo"><input className="field__input" value={form.nome} onChange={f("nome")} placeholder="Nome completo" autoFocus /></Field>
      <div className="field-row">
        <Field label="E-mail"><input className="field__input" type="email" value={form.email} onChange={f("email")} placeholder="aluno@email.com" /></Field>
        <Field label="Telefone"><input className="field__input" value={maskTelefone(form.telefone)} onChange={f("telefone")} placeholder="(61) 99999-9999" /></Field>
      </div>
      <Field label="Data de Nascimento"><input className="field__input" type="date" value={form.nascimento} onChange={f("nascimento")} /></Field>
      <div className="field-row">
        <Field label="Início do Contrato"><input className="field__input" type="date" value={form.inicioContrato} onChange={f("inicioContrato")} /></Field>
        <Field label="Fim do Contrato (auto)">
          <input className="field__input" type="date" value={form.fimContrato} disabled style={{ background: "var(--g50)", color: "var(--g500)", cursor: "not-allowed" }} />
        </Field>
      </div>
      {form.inicioContrato && <div style={{ fontSize: 12, color: "var(--g400)", marginBottom: 8 }}>ℹ️ Calculado automaticamente: 1 ano a partir do início</div>}
    </>
  );
}
