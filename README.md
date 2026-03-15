# Anglify — Sistema de Chamadas e Folha de Ponto

## Estrutura do Projeto

```
anglify/
├── App.jsx                        ← Raiz: orquestra rotas, hooks globais
│
└── src/
    ├── constants/
    │   └── index.js               ← Todas as constantes do app (listas, nomes de páginas, etc.)
    │
    ├── utils/
    │   └── index.js               ← Funções puras: datas, tempo, string helpers
    │
    ├── services/
    │   ├── supabase.js            ← Cliente HTTP genérico do Supabase (query/insert/update/upsert/remove)
    │   └── repositories.js        ← Repositórios por entidade: professor, turma, aluno, presença, ponto
    │
    ├── hooks/
    │   └── index.js               ← Custom hooks: useAuth, useTurmas, useAlunos, usePresencas, usePonto, useToast
    │
    ├── styles.js                  ← CSS global em string (injetado via <style>)
    │
    ├── components/
    │   ├── Sidebar.js             ← Sidebar de navegação
    │   └── ui/
    │       └── index.js           ← Componentes reutilizáveis: Icons, Modal, Toast, Field, MonthSelector, etc.
    │
    └── pages/
        ├── LoginPage.js           ← Tela de login
        ├── DashboardPage.js       ← Dashboard com stats e preview de turmas
        ├── TurmasPage.js          ← Listagem e CRUD de turmas
        ├── TurmaDetailPage.js     ← Detalhes da turma + lista de presença + CRUD de alunos
        └── PontoPage.js           ← Folha de ponto + exportação PDF
```

## Camadas da Arquitetura

### 1. `services/supabase.js`
Cliente HTTP puro. Não sabe nada de negócio — apenas faz requests REST ao Supabase.

### 2. `services/repositories.js`
Traduz operações de negócio em chamadas ao supabase client.
Cada entidade tem seu próprio objeto de repositório com métodos semânticos.
Ex: `turmaRepository.create(professorId, data)` em vez de `supabase.insert("tb_turma", {...})`.

### 3. `hooks/index.js`
Camada de estado. Consome os repositórios e expõe estado + ações para os componentes.
Nenhuma página acessa os repositórios diretamente — tudo passa pelos hooks.

### 4. `pages/`
Componentes de página. Recebem dados e ações via props, não fazem chamadas de rede diretas.

### 5. `App.jsx`
Apenas orquestra: instancia os hooks globais, gerencia a rota atual, renderiza o `<PageRouter>`.

## Regras de negócio respeitadas
- Um professor só vê e gerencia suas próprias turmas
- Um aluno pertence a exatamente uma turma
- Ponto é pessoal de cada professor (isolado por professor_id)
- Sábado habilitado no ponto; domingo bloqueado
- Dias futuros não podem ter presença marcada
- Presença salva com upsert para evitar duplicatas
- Ponto salvo com debounce de 900ms (evita requisição a cada tecla)
