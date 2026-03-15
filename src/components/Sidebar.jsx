import { Icons } from "./ui/index.jsx";
import { PAGES, CARGO_ADMIN } from "../constants/index.js";

export default function Sidebar({ user, currentPage, onNavigate, onLogout }) {
  const initials = user.ds_nome.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const isAdmin  = user.id_cargo === CARGO_ADMIN;

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <div className="sidebar__logo">
          <div className="sidebar__mark">A</div>
          <span className="sidebar__name">Anglify</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        <div className="nav-section">
          <div className="nav-section__title">Principal</div>
          <NavItem icon={<Icons.Home />}  label="Dashboard"        active={currentPage === PAGES.DASHBOARD}    onClick={() => onNavigate(PAGES.DASHBOARD)} />
          {/* Admin sees ALL turmas; professor sees own */}
          <NavItem icon={<Icons.Book />}  label={isAdmin ? "Todas as Turmas" : "Minhas Turmas"} active={currentPage === PAGES.TURMAS || currentPage === PAGES.TURMA_DETAIL} onClick={() => onNavigate(PAGES.TURMAS)} />
        </div>

        <div className="nav-section">
          <div className="nav-section__title">Pessoal</div>
          <NavItem icon={<Icons.Clock />} label="Registro de Ponto" active={currentPage === PAGES.PONTO} onClick={() => onNavigate(PAGES.PONTO)} />
        </div>

        {isAdmin && (
          <div className="nav-section">
            <div className="nav-section__title" style={{ color: "var(--red)" }}>Administração</div>
            <NavItem icon={<Icons.Shield />}   label="Painel Admin"   active={currentPage === PAGES.ADMIN}              onClick={() => onNavigate(PAGES.ADMIN)}              accent />
            <NavItem icon={<Icons.Users />}    label="Alunos"         active={currentPage === PAGES.ADMIN_ALUNOS}       onClick={() => onNavigate(PAGES.ADMIN_ALUNOS)}       accent />
            <NavItem icon={<Icons.Book />}     label="Contratos"      active={currentPage === PAGES.ADMIN_CONTRATOS}    onClick={() => onNavigate(PAGES.ADMIN_CONTRATOS)}    accent />
            <NavItem icon={<Icons.Download />} label="Relatórios"     active={currentPage === PAGES.ADMIN_RELATORIOS}   onClick={() => onNavigate(PAGES.ADMIN_RELATORIOS)}   accent />
            <NavItem icon={<Icons.Clock />}    label="Folha de Ponto" active={currentPage === PAGES.ADMIN_PONTO}        onClick={() => onNavigate(PAGES.ADMIN_PONTO)}        accent />
            <NavItem icon={<Icons.Move />}     label="Movimentação"   active={currentPage === PAGES.ADMIN_MOVIMENTACAO} onClick={() => onNavigate(PAGES.ADMIN_MOVIMENTACAO)} accent />
          </div>
        )}
      </nav>

      <div className="sidebar__footer">
        <div className="user-card">
          <div className="user-card__avatar" style={isAdmin ? { background: "var(--red)" } : {}}>{initials}</div>
          <div className="user-card__info">
            <div className="user-card__name">{user.ds_nome}</div>
            <div className="user-card__role">{isAdmin ? "Administrador" : "Professor"}</div>
          </div>
          <button className="icon-btn" onClick={onLogout} title="Sair"><Icons.LogOut /></button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick, accent }) {
  return (
    <div className={`nav-item${active ? " active" : ""}`} onClick={onClick}
      style={accent && active ? { background: "var(--red-l)", color: "var(--red)" } : {}}>
      {icon} {label}
    </div>
  );
}
