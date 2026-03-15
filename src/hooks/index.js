import { useState, useEffect, useCallback, useRef } from "react";
import { SESSION_KEY, SHARED_PASSWORD, CARGO_ADMIN } from "../constants/index.js";
import {
  professorRepository,
  turmaRepository,
  alunoRepository,
  presencaRepository,
  pontoRepository,
} from "../services/repositories.js";
import { isSunday, pad } from "../utils/index.js";

// ─── useToast ─────────────────────────────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3200);
  }, []);
  return { toast, showToast };
}

// ─── useAuth ──────────────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const s = sessionStorage.getItem(SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const isAdmin = user?.id_cargo === CARGO_ADMIN;

  const login = useCallback(async (email, password) => {
    if (password !== SHARED_PASSWORD) throw new Error("Senha incorreta.");
    const rows = await professorRepository.findByEmail(email);
    if (!rows.length) throw new Error("E-mail não encontrado.");
    const professor = rows[0];
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(professor));
    setUser(professor);
    return professor;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return { user, isAdmin, login, logout };
}

// ─── useProfessores ───────────────────────────────────────────────────────────
export function useProfessores() {
  const [professores, setProfessores] = useState([]);
  const load = useCallback(async () => {
    const rows = await professorRepository.findAll();
    setProfessores(rows);
  }, []);
  useEffect(() => { load(); }, [load]);
  return { professores, load };
}

// ─── useTurmas ────────────────────────────────────────────────────────────────
export function useTurmas() {
  const [turmas, setTurmas]   = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTurmas(await turmaRepository.findAll()); }
    finally { setLoading(false); }
  }, []);

  const create = useCallback(async (professorId, data) => {
    await turmaRepository.create(professorId, data);
    await load();
  }, [load]);

  const update = useCallback(async (id, data) => {
    await turmaRepository.update(id, data);
    await load();
  }, [load]);

  const remove = useCallback(async (id) => {
    await turmaRepository.remove(id);
    await load();
  }, [load]);

  return { turmas, loading, load, create, update, remove };
}

// ─── useAlunos ────────────────────────────────────────────────────────────────
export function useAlunos() {
  const [alunos, setAlunos]   = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAlunos(await alunoRepository.findAll()); }
    finally { setLoading(false); }
  }, []);

  const create = useCallback(async (turmaId, campos) => {
    await alunoRepository.create(turmaId, campos);
    await load();
  }, [load]);

  const update = useCallback(async (id, campos) => {
    await alunoRepository.update(id, campos);
    await load();
  }, [load]);

  const moveTurma = useCallback(async (alunoId, novaTurmaId) => {
    await alunoRepository.moveTurma(alunoId, novaTurmaId);
    await load();
  }, [load]);

  const remove = useCallback(async (id) => {
    await alunoRepository.remove(id);
    await load();
  }, [load]);

  return { alunos, loading, load, create, update, moveTurma, remove };
}

// ─── usePresencas ─────────────────────────────────────────────────────────────
export function usePresencas(turmaId, month, year) {
  const [presencaMap, setPresencaMap] = useState({});
  const [loading, setLoading]         = useState(false);
  const [pendingCells, setPendingCells] = useState({});

  const load = useCallback(async () => {
    if (!turmaId) return;
    setLoading(true);
    try {
      const rows = await presencaRepository.findByTurmaMonthYear(turmaId, month, year);
      const map = {};
      rows.forEach((r) => {
        if (!map[r.id_aluno]) map[r.id_aluno] = {};
        // st_presente: true = presente, false = falta
        map[r.id_aluno][r.dt_dia] = r.st_presente ? "presente" : "falta";
      });
      setPresencaMap(map);
    } finally { setLoading(false); }
  }, [turmaId, month, year]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (alunoId, turmaId, dia, mes, ano) => {
    const cellKey = `${alunoId}_${dia}`;
    if (pendingCells[cellKey]) return;

    const current = presencaMap[alunoId]?.[dia];
    const next    = current === "presente" ? "falta" : current === "falta" ? null : "presente";

    // Optimistic update
    setPresencaMap((prev) => {
      const copy = { ...prev, [alunoId]: { ...(prev[alunoId] || {}) } };
      if (next === null) delete copy[alunoId][dia];
      else copy[alunoId][dia] = next;
      return copy;
    });
    setPendingCells((p) => ({ ...p, [cellKey]: true }));

    try {
      if (next === null) {
        const rows = await presencaRepository.findByAlunoAndDate(alunoId, dia, mes, ano);
        if (rows[0]) await presencaRepository.remove(rows[0].id_presenca);
      } else {
        await presencaRepository.save(alunoId, turmaId, dia, mes, ano, next === "presente");
      }
    } catch {
      // Revert
      setPresencaMap((prev) => {
        const copy = { ...prev, [alunoId]: { ...(prev[alunoId] || {}) } };
        if (current === undefined) delete copy[alunoId][dia];
        else copy[alunoId][dia] = current;
        return copy;
      });
      throw new Error("Erro ao salvar presença.");
    } finally {
      setPendingCells((p) => { const c = { ...p }; delete c[cellKey]; return c; });
    }
  }, [presencaMap, pendingCells]);

  return { presencaMap, loading, pendingCells, toggle };
}

// ─── usePonto ─────────────────────────────────────────────────────────────────
export function usePonto(professorId, month, year) {
  // pontoMap: Record<"YYYY-MM-DD", PontoRow>
  const [pontoMap, setPontoMap] = useState({});
  const [loading, setLoading]   = useState(false);
  const debounceRefs            = useRef({});

  const dateKey = (day) =>
    `${year}-${pad(month + 1)}-${pad(day)}`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await pontoRepository.findByProfessorMonth(professorId, month, year);
      const map  = {};
      rows.forEach((r) => { map[r.dt_data] = r; });
      setPontoMap(map);
    } finally { setLoading(false); }
  }, [professorId, month, year]);

  useEffect(() => { load(); }, [load]);

  const setField = useCallback((dia, field, value) => {
  const key = dateKey(dia);

    // Atualização local imediata
    setPontoMap((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));

    // Debounce por campo
    const debKey = `${key}_${field}`;
    clearTimeout(debounceRefs.current[debKey]);
    debounceRefs.current[debKey] = setTimeout(() => {
      setPontoMap((prev) => {
        const row = prev[key] || {};
        // NUNCA envia id_ponto — banco gera automaticamente
        const payload = {
          id_professor:        professorId,
          dt_data:             key,
          dt_primeira_entrada: row.dt_primeira_entrada || null,
          dt_primeira_saida:   row.dt_primeira_saida   || null,
          dt_segunda_entrada:  row.dt_segunda_entrada  || null,
          dt_segunda_saida:    row.dt_segunda_saida    || null,
          ds_observacao:       row.ds_observacao       || null,
          [field]:             value || null,
        };
        pontoRepository.save(payload)
          .then((res) => {
            if (res?.[0]) setPontoMap((p) => ({ ...p, [key]: res[0] }));
          })
          .catch(() => {});
        return prev;
      });
    }, 900);
  }, [professorId, month, year, dateKey]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function calcDayMinutes(row) {
    if (!row) return 0;
    const t = (a, b) => {
      if (!a || !b) return 0;
      // times arrive as "HH:MM:SS" or "HH:MM"
      const toMin = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
      const diff  = toMin(b) - toMin(a);
      return diff > 0 ? diff : 0;
    };
    return t(row.dt_primeira_entrada, row.dt_primeira_saida)
         + t(row.dt_segunda_entrada,  row.dt_segunda_saida);
  }

  const days = new Date(year, month + 1, 0).getDate();

  const totalMinutes = Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    if (isSunday(year, month, d)) return 0;
    return calcDayMinutes(pontoMap[dateKey(d)]);
  }).reduce((a, b) => a + b, 0);

  const workedDays = Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    if (isSunday(year, month, d)) return false;
    return calcDayMinutes(pontoMap[dateKey(d)]) > 0;
  }).filter(Boolean).length;

  return { pontoMap, loading, setField, totalMinutes, workedDays, dateKey, calcDayMinutes };
}
