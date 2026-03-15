import supabase from "./supabase.js";

// ─── Professor ────────────────────────────────────────────────────────────────
export const professorRepository = {
  findAll: () =>
    supabase.query("tb_professor", { order: "ds_nome.asc" }),

  findByEmail: (email) =>
    supabase.query("tb_professor", {
      filters: [`ds_email=eq.${encodeURIComponent(email.toLowerCase().trim())}`],
    }),
};

// ─── Turma ────────────────────────────────────────────────────────────────────
export const turmaRepository = {
  findAll: () =>
    supabase.query("tb_turma", { order: "created_at.asc" }),

  create: (professorId, data) =>
    supabase.insert("tb_turma", {
      id_professor:      professorId,
      ds_unidade:        data.ds_unidade,
      ds_livro:          data.ds_livro,
      ds_turma:          data.ds_turma,
      ds_horario_inicio: data.ds_horario_inicio,
      ds_horario_fim:    data.ds_horario_fim,
    }),

  update: (id, data) =>
    supabase.update("tb_turma", `id_turma=eq.${id}`, {
      ds_unidade:        data.ds_unidade,
      ds_livro:          data.ds_livro,
      ds_turma:          data.ds_turma,
      ds_horario_inicio: data.ds_horario_inicio,
      ds_horario_fim:    data.ds_horario_fim,
    }),

  remove: (id) =>
    supabase.remove("tb_turma", `id_turma=eq.${id}`),
};

// ─── Aluno ────────────────────────────────────────────────────────────────────
export const alunoRepository = {
  findAll: () =>
    supabase.query("tb_aluno", { order: "ds_nome.asc" }),

  create: (turmaId, campos) =>
    supabase.insert("tb_aluno", {
      id_turma:          turmaId,
      ds_nome:           campos.nome.trim(),
      ds_email:          campos.email?.trim()     || "",
      ds_telefone:       campos.telefone?.trim()  || "",
      dt_nascimento:     campos.nascimento        || null,
      dt_inicio_contrato: campos.inicioContrato   || null,
      dt_fim_contrato:   campos.fimContrato       || null,
    }),

  update: (id, campos) =>
    supabase.update("tb_aluno", `id_aluno=eq.${id}`, {
      ds_nome:           campos.nome.trim(),
      ds_email:          campos.email?.trim()     || "",
      ds_telefone:       campos.telefone?.trim()  || "",
      dt_nascimento:     campos.nascimento        || null,
      dt_inicio_contrato: campos.inicioContrato   || null,
      dt_fim_contrato:   campos.fimContrato       || null,
    }),

  moveTurma: (alunoId, novaTurmaId) =>
    supabase.update("tb_aluno", `id_aluno=eq.${alunoId}`, { id_turma: novaTurmaId }),

  remove: (id) =>
    supabase.remove("tb_aluno", `id_aluno=eq.${id}`),
};

// ─── Presença ─────────────────────────────────────────────────────────────────
export const presencaRepository = {
  findByTurmaMonthYear: (turmaId, mes, ano) =>
    supabase.query("tb_presenca", {
      filters: [`id_turma=eq.${turmaId}`, `dt_mes=eq.${mes}`, `dt_ano=eq.${ano}`],
    }),

  findByAlunoMonthYear: (alunoId, mes, ano) =>
    supabase.query("tb_presenca", {
      filters: [`id_aluno=eq.${alunoId}`, `dt_mes=eq.${mes}`, `dt_ano=eq.${ano}`],
    }),

  findByAlunoAndDate: (alunoId, dia, mes, ano) =>
    supabase.query("tb_presenca", {
      filters: [`id_aluno=eq.${alunoId}`, `dt_dia=eq.${dia}`, `dt_mes=eq.${mes}`, `dt_ano=eq.${ano}`],
    }),

  save: (alunoId, turmaId, dia, mes, ano, presente) =>
    supabase.upsert(
      "tb_presenca",
      { id_aluno: alunoId, id_turma: turmaId, dt_dia: dia, dt_mes: mes, dt_ano: ano, st_presente: presente },
      "id_aluno,dt_dia,dt_mes,dt_ano"
    ),

  remove: (id) =>
    supabase.remove("tb_presenca", `id_presenca=eq.${id}`),
};

// ─── Ponto ────────────────────────────────────────────────────────────────────
export const pontoRepository = {
  findByProfessorMonth: (professorId, mes, ano) => {
    const firstDay = `${ano}-${String(mes + 1).padStart(2, "0")}-01`;
    const lastDay  = new Date(ano, mes + 1, 0);
    const lastStr  = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
    return supabase.query("tb_ponto", {
      filters: [`id_professor=eq.${professorId}`, `dt_data=gte.${firstDay}`, `dt_data=lte.${lastStr}`],
      order: "dt_data.asc",
    });
  },

  save: (data) =>
    supabase.upsert("tb_ponto", data, "id_professor,dt_data"),
};
