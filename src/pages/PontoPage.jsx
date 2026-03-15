import { useState } from "react";
import { MonthSelector, PageHeader, Spinner } from "../components/ui/index.jsx";
import { usePonto } from "../hooks/index.js";
import { MONTH_NAMES, DAY_NAMES } from "../constants/index.js";
import { daysInMonth, getDayOfWeek, isSunday, isSaturday, isToday, pad, minutesToTime } from "../utils/index.js";

export default function PontoPage({ user }) {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const { pontoMap, loading, setField, totalMinutes, workedDays, dateKey, calcDayMinutes } =
    usePonto(user.id_professor, month, year);

  const days = daysInMonth(year, month);

  return (
    <div className="content">
      <PageHeader
        title="Registro de Ponto"
        subtitle="Registre seus horários — salvo automaticamente"
      />

      <div style={{ background: "var(--blue-l)", border: "1px solid var(--blue-m)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "var(--blue)" }}>
        ℹ️ O registro de ponto é salvo automaticamente. A exportação da folha está disponível para a administração.
      </div>

      <MonthSelector month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} loading={loading} />

      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <table className="ponto-table">
          <thead>
            <tr>
              <th>Data</th><th>Dia</th>
              <th>1ª Entrada</th><th>1ª Saída</th>
              <th>2ª Entrada</th><th>2ª Saída</th>
              <th>Total</th><th>Observação</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: days }, (_, i) => {
              const d     = i + 1;
              const dow   = getDayOfWeek(year, month, d);
              const isSun = isSunday(year, month, d);
              const isSat = isSaturday(year, month, d);
              const today = isToday(year, month, d);
              const key   = dateKey(d);
              const row   = pontoMap[key] || {};
              const mins  = calcDayMinutes(row);

              return (
                <tr key={d} className={isSun ? "ponto-row--sunday" : today ? "ponto-row--today" : ""}>
                  <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: today ? 600 : 400 }}>
                    {pad(d)}/{pad(month + 1)}/{year}
                    {today && <span className="tag tag--blue" style={{ marginLeft: 8 }}>Hoje</span>}
                    {isSat  && <span className="tag tag--green" style={{ marginLeft: 8 }}>Sáb</span>}
                  </td>
                  <td style={{ color: isSun ? "var(--g300)" : isSat ? "var(--green)" : "var(--g600)" }}>{DAY_NAMES[dow]}</td>
                  {isSun ? (
                    <><td /><td /><td /><td /><td style={{ color: "var(--g300)" }}>—</td><td /></>
                  ) : (
                    <>
                      <td><input className="ponto-table__input" type="time" value={row.dt_primeira_entrada || ""} onChange={(e) => setField(d, "dt_primeira_entrada", e.target.value)} /></td>
                      <td><input className="ponto-table__input" type="time" value={row.dt_primeira_saida   || ""} onChange={(e) => setField(d, "dt_primeira_saida",   e.target.value)} /></td>
                      <td><input className="ponto-table__input" type="time" value={row.dt_segunda_entrada  || ""} onChange={(e) => setField(d, "dt_segunda_entrada",  e.target.value)} /></td>
                      <td><input className="ponto-table__input" type="time" value={row.dt_segunda_saida    || ""} onChange={(e) => setField(d, "dt_segunda_saida",    e.target.value)} /></td>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: mins > 0 ? 600 : 400, color: mins > 0 ? "var(--green)" : "var(--g300)" }}>
                        {mins > 0 ? minutesToTime(mins) : ""}
                      </td>
                      <td><input className="ponto-table__input ponto-table__input--text" value={row.ds_observacao || ""} onChange={(e) => setField(d, "ds_observacao", e.target.value)} placeholder="Substituição, evento..." /></td>
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
    </div>
  );
}
