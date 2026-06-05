# Frontend

O primeiro frontend MVP do Sherlock DataLayer fica em `frontend/`.

## Stack

- Vite
- React
- TypeScript
- CSS simples em `src/styles/global.css`

## Estrutura

```txt
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/auditsApi.ts
│   ├── components/
│   ├── types/audit.ts
│   └── styles/global.css
├── .env.example
├── package.json
├── index.html
└── vite.config.ts
```

## Variável de ambiente

```env
VITE_API_URL=https://sherlock-datalayer.onrender.com
```

A API é consumida em `src/api/auditsApi.ts` usando `import.meta.env.VITE_API_URL`.

## Rodar localmente

```bash
cd frontend
npm install
npm run dev
```

## Build

```bash
cd frontend
npm run build
```

## Escopo do MVP

Tela única para:

- enviar URL para `POST /audits`;
- exibir resumo técnico;
- listar ferramentas detectadas;
- listar dataLayer e eventos;
- listar requests/evidências;
- listar interações testadas;
- listar problemas técnicos;
- exibir JSON bruto colapsável para debug.

O visual segue a direção de dev tools/debugging do `DESIGN.MD`, com canvas midnight-violet, acentos lime/pink e componentes simples. Não é um dashboard final complexo.

A apresentação dos resultados é organizada por tópicos técnicos e evita textos opinativos/recomendações. O foco é evidência: encontrado, não encontrado, detectado, não detectado, executado, não executado e não validado.
