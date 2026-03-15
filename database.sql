-- ─── LIMPAR TABELAS ANTIGAS ───────────────────────────────────────────────────
drop table if exists tb_ponto     cascade;
drop table if exists tb_presenca  cascade;
drop table if exists tb_aluno     cascade;
drop table if exists tb_turma     cascade;
drop table if exists tb_professor cascade;
drop table if exists tb_cargo     cascade;

-- ─── CARGOS ───────────────────────────────────────────────────────────────────
create table tb_cargo (
  id_cargo  INT  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ds_cargo  text not null
);
insert into tb_cargo (ds_cargo) values ('Administrador'), ('Professor');

-- ─── PROFESSORES ──────────────────────────────────────────────────────────────
create table tb_professor (
  id_professor  INT  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ds_nome       text not null,
  ds_email      text unique not null,
  id_cargo      int  references tb_cargo(id_cargo) default 2
);
insert into tb_professor (ds_nome, ds_email, id_cargo) values
  ('Alana Neves',       'alana.neves@anglify.com',     2),
  ('Aron Henrique',     'aron.henrique@anglify.com',   2),
  ('Daniel Damasceno',  'daniel.damasceno@anglify.com',2),
  ('Ana Souza',         'ana.souza@anglify.com',       2),
  ('Daniel Filho',      'daniel.filho@anglify.com',    2),
  ('Ana Paula',         'ana.bueno@anglify.com',       1);

-- ─── TURMAS ───────────────────────────────────────────────────────────────────
create table tb_turma (
  id_turma          INT  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_professor      int  references tb_professor(id_professor),
  ds_unidade        text,
  ds_livro          text,
  ds_turma          text,
  ds_horario_inicio text,
  ds_horario_fim    text,
  created_at        timestamp default now()
);

-- ─── ALUNOS ───────────────────────────────────────────────────────────────────
create table tb_aluno (
  id_aluno            INT  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_turma            int  references tb_turma(id_turma),
  ds_nome             text not null,
  ds_email            text,
  ds_telefone         text,
  dt_nascimento       date,
  dt_inicio_contrato  date,
  dt_fim_contrato     date,  -- calculado no frontend: inicio + 1 ano - 1 dia
  created_at          timestamp default now()
);

-- ─── PRESENÇAS ────────────────────────────────────────────────────────────────
create table tb_presenca (
  id_presenca  INT  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_aluno     int  references tb_aluno(id_aluno)  on delete cascade,
  id_turma     int  references tb_turma(id_turma),
  dt_dia       integer,
  dt_mes       integer,
  dt_ano       integer,
  st_presente  boolean,
  unique(id_aluno, dt_dia, dt_mes, dt_ano)
);

-- ─── PONTO ────────────────────────────────────────────────────────────────────
create table tb_ponto (
  id_ponto             INT  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_professor         int  references tb_professor(id_professor),
  dt_data              date,
  dt_primeira_entrada  time,
  dt_primeira_saida    time,
  dt_segunda_entrada   time,
  dt_segunda_saida     time,
  ds_observacao        text,
  unique(id_professor, dt_data)
);

-- ─── DESABILITAR RLS ──────────────────────────────────────────────────────────
alter table tb_cargo     disable row level security;
alter table tb_professor disable row level security;
alter table tb_turma     disable row level security;
alter table tb_aluno     disable row level security;
alter table tb_presenca  disable row level security;
alter table tb_ponto     disable row level security;
