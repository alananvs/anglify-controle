export const globalCss = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

/* ─── Reset & Base ─────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --blue:   #2563EB;  --blue-d:  #1D4ED8;
  --blue-l: #EFF6FF;  --blue-m:  #BFDBFE;
  --red:    #DC2626;  --red-l:   #FEF2F2;
  --green:  #16A34A;  --green-l: #F0FDF4;
  --g50:  #F9FAFB; --g100: #F3F4F6; --g200: #E5E7EB; --g300: #D1D5DB;
  --g400: #9CA3AF; --g500: #6B7280; --g600: #4B5563; --g700: #374151;
  --g800: #1F2937; --g900: #111827; --white: #FFFFFF;
  --sidebar-w: 224px;
  --radius: 8px;
  --shadow:   0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,.12);
}

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--g50);
  color: var(--g800);
  font-size: 14px;
  line-height: 1.5;
}

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--g300); border-radius: 3px; }

/* ─── Layout ───────────────────────────────────────────────────────────────── */
.app        { display: flex; height: 100vh; overflow: hidden; }
.main       { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
.content    { padding: 28px; flex: 1; }

/* ─── Sidebar ──────────────────────────────────────────────────────────────── */
.sidebar           { width: var(--sidebar-w); background: var(--white); border-right: 1px solid var(--g200); display: flex; flex-direction: column; flex-shrink: 0; }
.sidebar__top      { padding: 20px 16px 16px; border-bottom: 1px solid var(--g200); }
.sidebar__logo     { display: flex; align-items: center; gap: 8px; }
.sidebar__mark     { width: 28px; height: 28px; background: var(--blue); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 12px; }
.sidebar__name     { font-size: 15px; font-weight: 700; color: var(--g900); }
.sidebar__nav      { flex: 1; padding: 12px 8px; overflow-y: auto; }
.sidebar__footer   { padding: 12px 16px; border-top: 1px solid var(--g200); }
.nav-section       { margin-bottom: 20px; }
.nav-section__title{ font-size: 10px; font-weight: 600; color: var(--g400); text-transform: uppercase; letter-spacing: .8px; padding: 0 8px; margin-bottom: 4px; }
.nav-item          { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 6px; color: var(--g600); font-size: 13px; font-weight: 500; cursor: pointer; transition: all .12s; }
.nav-item:hover    { background: var(--g100); color: var(--g900); }
.nav-item.active   { background: var(--blue-l); color: var(--blue); }
.nav-item svg      { width: 16px; height: 16px; flex-shrink: 0; }

/* ─── User card (sidebar footer) ───────────────────────────────────────────── */
.user-card         { display: flex; align-items: center; gap: 10px; }
.user-card__avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--blue); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.user-card__info   { flex: 1; min-width: 0; }
.user-card__name   { font-size: 13px; font-weight: 500; color: var(--g800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-card__role   { font-size: 11px; color: var(--g400); }

/* ─── Topbar ───────────────────────────────────────────────────────────────── */
.topbar            { padding: 16px 28px; border-bottom: 1px solid var(--g200); background: var(--white); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.topbar__title     { font-size: 16px; font-weight: 600; color: var(--g900); }
.topbar__subtitle  { font-size: 12px; color: var(--g400); margin-top: 1px; }

/* ─── Buttons ──────────────────────────────────────────────────────────────── */
.btn          { display: inline-flex; align-items: center; gap: 6px; border: none; border-radius: var(--radius); padding: 8px 16px; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; white-space: nowrap; }
.btn--primary { background: var(--blue); color: white; }
.btn--primary:hover    { background: var(--blue-d); }
.btn--primary:disabled { opacity: .5; cursor: default; }
.btn--danger  { background: var(--red); color: white; }
.btn--danger:hover { background: #B91C1C; }
.btn--ghost   { background: transparent; color: var(--g600); border: 1px solid var(--g200); }
.btn--ghost:hover { background: var(--g100); }
.btn--sm      { padding: 5px 10px; font-size: 12px; }
.btn--full    { width: 100%; justify-content: center; padding: 11px; }

/* ─── Icon button ──────────────────────────────────────────────────────────── */
.icon-btn       { padding: 6px; border-radius: 6px; background: transparent; border: none; cursor: pointer; color: var(--g400); transition: all .15s; display: inline-flex; align-items: center; }
.icon-btn:hover { color: var(--g700); background: var(--g100); }
.icon-btn--danger:hover { color: var(--red); background: var(--red-l); }
.icon-btn svg   { width: 15px; height: 15px; }

/* ─── Form fields ──────────────────────────────────────────────────────────── */
.field         { margin-bottom: 16px; }
.field__label  { display: block; font-size: 11px; font-weight: 600; color: var(--g500); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .5px; }
.field__input  { width: 100%; border: 1px solid var(--g200); border-radius: var(--radius); padding: 9px 12px; font-family: inherit; font-size: 14px; color: var(--g800); background: var(--white); outline: none; transition: border-color .15s, box-shadow .15s; }
.field__input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
.field__input--time { font-family: 'DM Mono', monospace; font-size: 13px; }
.field-row     { display: flex; gap: 12px; }
.field-row > .field { flex: 1; }

/* ─── Card ─────────────────────────────────────────────────────────────────── */
.card          { background: var(--white); border: 1px solid var(--g200); border-radius: 10px; padding: 20px; }
.card__header  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card__title   { font-size: 14px; font-weight: 600; color: var(--g800); }
.card__subtitle{ font-size: 12px; color: var(--g400); margin-top: 2px; }

/* ─── Stat cards ───────────────────────────────────────────────────────────── */
.stats-grid     { display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 16px; margin-bottom: 28px; }
.stat-card      { background: var(--white); border: 1px solid var(--g200); border-radius: 10px; padding: 18px 20px; }
.stat-card--blue  { border-top: 3px solid var(--blue); }
.stat-card--red   { border-top: 3px solid var(--red); }
.stat-card--green { border-top: 3px solid var(--green); }
.stat-card--gray  { border-top: 3px solid var(--g300); }
.stat-card__label { font-size: 11px; font-weight: 500; color: var(--g400); text-transform: uppercase; letter-spacing: .4px; margin-bottom: 8px; }
.stat-card__value { font-size: 26px; font-weight: 700; color: var(--g900); line-height: 1; margin-bottom: 4px; }
.stat-card__detail{ font-size: 12px; color: var(--g500); }

/* ─── Turma cards grid ─────────────────────────────────────────────────────── */
.turmas-grid    { display: grid; grid-template-columns: repeat(auto-fill, minmax(255px, 1fr)); gap: 16px; }
.turma-card     { background: var(--white); border: 1px solid var(--g200); border-radius: 10px; padding: 18px; cursor: pointer; transition: all .15s; position: relative; }
.turma-card:hover { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,.07); transform: translateY(-1px); }
.turma-card__badge  { display: inline-flex; align-items: center; gap: 4px; background: var(--blue-l); color: var(--blue); font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 20px; margin-bottom: 10px; }
.turma-card__title  { font-size: 15px; font-weight: 600; color: var(--g900); margin-bottom: 3px; }
.turma-card__sub    { font-size: 12px; color: var(--g500); margin-bottom: 12px; }
.turma-card__meta   { display: flex; align-items: center; gap: 12px; }
.turma-card__meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--g500); }
.turma-card__meta-item svg { width: 13px; height: 13px; }
.turma-card__actions { position: absolute; top: 14px; right: 14px; display: flex; gap: 3px; opacity: 0; transition: opacity .15s; }
.turma-card:hover .turma-card__actions { opacity: 1; }

/* ─── Modal ────────────────────────────────────────────────────────────────── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal         { background: var(--white); border-radius: 12px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-md); }
.modal__header { padding: 20px 24px 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.modal__title  { font-size: 16px; font-weight: 600; color: var(--g900); }
.modal__body   { padding: 0 24px 24px; }
.modal__footer { padding: 16px 24px; border-top: 1px solid var(--g100); display: flex; justify-content: flex-end; gap: 8px; }

/* ─── Info grid (turma detail) ─────────────────────────────────────────────── */
.info-grid       { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-item__label{ font-size: 11px; font-weight: 500; color: var(--g400); text-transform: uppercase; letter-spacing: .4px; display: block; margin-bottom: 3px; }
.info-item__value{ font-size: 14px; color: var(--g800); font-weight: 500; }

/* ─── Presence table ───────────────────────────────────────────────────────── */
.presence-table    { border-collapse: collapse; font-size: 12px; }
.presence-table th { padding: 8px 4px; text-align: center; font-size: 10px; min-width: 34px; background: var(--g50); font-weight: 600; }
.presence-table th.name-col { text-align: left; min-width: 150px; position: sticky; left: 0; background: var(--g50); z-index: 1; }
.presence-table td { padding: 7px 4px; text-align: center; border-bottom: 1px solid var(--g100); }
.presence-table td.name-col { text-align: left; position: sticky; left: 0; background: var(--white); z-index: 1; font-weight: 500; }
.presence-table tr:hover td { background: var(--g50); }
.presence-table tr:hover td.name-col { background: var(--g50); }

.check-btn         { width: 27px; height: 27px; border-radius: 6px; border: 1.5px solid var(--g200); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all .12s; background: white; font-size: 12px; }
.check-btn--present{ background: var(--green); border-color: var(--green); color: white; }
.check-btn--absent { background: var(--red-l); border-color: #FCA5A5; color: var(--red); }
.check-btn--future { cursor: default; opacity: .35; }
.check-btn--loading{ opacity: .6; cursor: wait; }

/* ─── Ponto table ──────────────────────────────────────────────────────────── */
.ponto-table       { border-collapse: collapse; width: 100%; }
.ponto-table th    { font-size: 11px; font-weight: 600; color: var(--g500); text-transform: uppercase; letter-spacing: .3px; padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--g200); background: var(--g50); }
.ponto-table td    { padding: 8px 14px; border-bottom: 1px solid var(--g100); }
.ponto-table__input{ border: 1px solid var(--g200); border-radius: 6px; padding: 5px 8px; font-family: 'DM Mono', monospace; font-size: 13px; width: 108px; outline: none; }
.ponto-table__input--text { font-family: 'DM Sans', sans-serif; width: 100%; max-width: 220px; }
.ponto-row--sunday  td { background: var(--g50); color: var(--g400); }
.ponto-row--today   td { background: var(--blue-l); }

/* ─── Ponto summary bar ────────────────────────────────────────────────────── */
.ponto-summary       { background: var(--g900); color: white; border-radius: 10px; padding: 20px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
.ponto-summary__label{ font-size: 11px; color: var(--g400); text-transform: uppercase; letter-spacing: .4px; margin-bottom: 4px; }
.ponto-summary__value{ font-size: 28px; font-weight: 700; font-family: 'DM Mono', monospace; }

/* ─── Month selector ───────────────────────────────────────────────────────── */
.month-selector        { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.month-selector__select{ border: 1px solid var(--g200); border-radius: var(--radius); padding: 7px 10px; font-family: inherit; font-size: 13px; font-weight: 500; color: var(--g700); background: var(--white); outline: none; }
.month-selector__select:focus { border-color: var(--blue); }

/* ─── Tags / Badges ────────────────────────────────────────────────────────── */
.tag          { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
.tag--blue    { background: var(--blue-l); color: var(--blue); }
.tag--green   { background: var(--green-l); color: var(--green); }
.tag--red     { background: var(--red-l); color: var(--red); }
.tag--gray    { background: var(--g100); color: var(--g600); }

/* ─── Login ────────────────────────────────────────────────────────────────── */
.login-page     { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--g50); }
.login-card     { background: var(--white); border: 1px solid var(--g200); border-radius: 14px; padding: 44px; width: 400px; box-shadow: var(--shadow-md); }
.login__logo    { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; }
.login__mark    { width: 38px; height: 38px; background: var(--blue); border-radius: 9px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 17px; }
.login__appname { font-size: 21px; font-weight: 700; color: var(--g900); letter-spacing: -.3px; }
.login__title   { font-size: 22px; font-weight: 700; color: var(--g900); margin-bottom: 6px; }
.login__sub     { color: var(--g500); margin-bottom: 28px; font-size: 13px; }
.login__error   { background: var(--red-l); border: 1px solid #FECACA; color: var(--red); padding: 10px 14px; border-radius: var(--radius); margin-bottom: 16px; font-size: 13px; }
.login__hint    { margin-top: 20px; padding: 12px 14px; background: var(--g50); border-radius: var(--radius); font-size: 12px; color: var(--g500); border: 1px solid var(--g100); }

/* ─── Loading spinner ──────────────────────────────────────────────────────── */
.spinner       { width: 18px; height: 18px; border: 2px solid var(--g200); border-top-color: var(--blue); border-radius: 50%; animation: spin .6s linear infinite; flex-shrink: 0; }
.spinner--white{ border-color: rgba(255,255,255,.3); border-top-color: white; }
.loading-state { display: flex; align-items: center; justify-content: center; padding: 48px; color: var(--g400); gap: 10px; font-size: 13px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Toast ────────────────────────────────────────────────────────────────── */
.toast         { position: fixed; bottom: 24px; right: 24px; background: var(--g900); color: white; padding: 12px 18px; border-radius: 8px; font-size: 13px; z-index: 200; animation: fadeIn .2s ease; max-width: 320px; }
.toast--error  { background: var(--red); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* ─── Empty state ──────────────────────────────────────────────────────────── */
.empty-state        { text-align: center; padding: 48px 24px; color: var(--g400); }
.empty-state__icon  { font-size: 36px; margin-bottom: 12px; }
.empty-state__title { font-size: 14px; font-weight: 500; color: var(--g500); margin-bottom: 6px; }
.empty-state__sub   { font-size: 13px; }

/* ─── Page header ──────────────────────────────────────────────────────────── */
.page-header        { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-header__title { font-size: 16px; font-weight: 600; color: var(--g800); margin-bottom: 4px; }
.page-header__sub   { font-size: 12px; color: var(--g400); }

/* ─── Table (generic) ──────────────────────────────────────────────────────── */
.table-wrap    { overflow-x: auto; }
`;
