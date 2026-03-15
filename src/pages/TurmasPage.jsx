import { useState } from "react";
import { Icons, Modal, ConfirmModal, EmptyState, PageHeader, Field, Select } from "../components/ui/index.jsx";
import { UNIDADES, LIVROS, TURMAS_OPTS, CARGO_ADMIN } from "../constants/index.js";

const FORM_DEFAULT = { ds_unidade: UNIDADES[0], ds_livro: LIVROS[0], ds_turma: TURMAS_OPTS[0], ds_horario_inicio: "19:00", ds_horario_fim: "20:00" };

export default function TurmasPage({ user, turmas, alunos, professores, turmaActions, onDetail, showToast }) {
  const isAdmin = user.id_cargo === CARGO_ADMIN;
  const visible = isAdmin ? turmas : turmas.filter((t) => t.id_professor === user.id_professor);

  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(FORM_DEFAULT);
  const [selectedProf, setSelectedProf] = useState(String(user.id_professor));
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState(null);

  function openCreate() { setEditing(null); setForm(FORM_DEFAULT); setSelectedProf(String(user.id_professor)); setShowForm(true); }
  function openEdit(t, e) {
    e.stopPropagation();
    setEditing(t);
    setForm({ ds_unidade: t.ds_unidade, ds_livro: t.ds_livro, ds_turma: t.ds_turma, ds_horario_inicio: t.ds_horario_inicio, ds_horario_fim: t.ds_horario_fim });
    setSelectedProf(String(t.id_professor));
    setShowForm(true);
  }
  const f = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const getProfName = (idP) => professores?.find((p) => p.id_professor === idP)?.ds_nome || "—";

  async function handleSave() {
    setSaving(true);
    try {
      const profId = isAdmin ? Number(selectedProf) : user.id_professor;
      if (editing) { await turmaActions.update(editing.id_turma, form); showToast("Turma atualizada!"); }
      else         { await turmaActions.create(profId, form); showToast("Turma criada!"); }
      setShowForm(false);
    } catch { showToast("Erro ao salvar turma.", true); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    try { await turmaActions.remove(deleteId); showToast("Turma removida."); }
    catch { showToast("Erro ao remover.", true); }
    finally { setDeleteId(null); }
  }

  return (
    <div className="content">
      <PageHeader
        title={isAdmin ? "Todas as Turmas" : "Minhas Turmas"}
        subtitle={`${visible.length} turma${visible.length !== 1 ? "s" : ""} cadastrada${visible.length !== 1 ? "s" : ""}`}
        action={<button className="btn btn--primary" onClick={openCreate}><Icons.Plus /> Nova Turma</button>}
      />

      {visible.length === 0 ? (
        <EmptyState icon="" title="Nenhuma turma" subtitle="Crie a primeira turma" />
      ) : (
        <div className="turmas-grid">
          {visible.map((turma) => {
            const count = alunos.filter((a) => a.id_turma === turma.id_turma).length;
            return (
              <div key={turma.id_turma} className="turma-card" onClick={() => onDetail(turma.id_turma)}>
                <div className="turma-card__actions">
                  <button className="icon-btn" onClick={(e) => openEdit(turma, e)}><Icons.Edit /></button>
                  <button className="icon-btn icon-btn--danger" onClick={(e) => { e.stopPropagation(); setDeleteId(turma.id_turma); }}><Icons.Trash /></button>
                </div>
                <div className="turma-card__badge"><Icons.Book /> {turma.ds_unidade}</div>
                <div className="turma-card__title">{turma.ds_livro}</div>
                <div className="turma-card__sub">{turma.ds_turma}</div>
                {isAdmin && <div style={{ fontSize: 11, color: "var(--g400)", marginBottom: 8 }}>👤 {getProfName(turma.id_professor)}</div>}
                <div className="turma-card__meta">
                  <div className="turma-card__meta-item"><Icons.Users /> {count} aluno{count !== 1 ? "s" : ""}</div>
                  <div className="turma-card__meta-item"><Icons.Clock /> {turma.ds_horario_inicio}–{turma.ds_horario_fim}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Editar Turma" : "Nova Turma"} onClose={() => setShowForm(false)}
          footer={<><button className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancelar</button><button className="btn btn--primary" onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar" : "Criar"}</button></>}>
          {isAdmin && (
            <Field label="Professor">
              <select className="field__input" value={selectedProf} onChange={(e) => setSelectedProf(e.target.value)}>
                {(professores || []).filter((p) => p.id_cargo === 2).map((p) => <option key={p.id_professor} value={p.id_professor}>{p.ds_nome}</option>)}
              </select>
            </Field>
          )}
          <Field label="Unidade"><Select options={UNIDADES} value={form.ds_unidade} onChange={f("ds_unidade")} /></Field>
          <Field label="Livro"><Select options={LIVROS} value={form.ds_livro} onChange={f("ds_livro")} /></Field>
          <Field label="Turma"><Select options={TURMAS_OPTS} value={form.ds_turma} onChange={f("ds_turma")} /></Field>
          <div className="field-row">
            <Field label="Horário Início"><input className="field__input field__input--time" type="time" value={form.ds_horario_inicio} onChange={f("ds_horario_inicio")} /></Field>
            <Field label="Horário Fim"><input className="field__input field__input--time" type="time" value={form.ds_horario_fim} onChange={f("ds_horario_fim")} /></Field>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmModal title="Confirmar Exclusão" message="Todos os alunos e registros desta turma serão removidos." onConfirm={handleDelete} onClose={() => setDeleteId(null)} />
      )}
    </div>
  );
}
