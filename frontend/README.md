# StockBox - Sistema de Controle de Estoque

## Descrição
Sistema para controlar itens no estoque: entradas, saídas e quantidade atual.

## Tecnologias
- React 19.2.0
- TypeScript 5.6.3
- Vite 5.4.11
- TailwindCSS 3.4.14
- React Router 7.9.3
- TanStack Query 5.90.2
- Axios 1.12.2
- Zustand 5.0.8
- React Hook Form 7.63.0
- Zod 4.1.11

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:
```
VITE_API_URL=http://localhost:3000
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000
```

## Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Estrutura do Projeto

```
src/
├── app/                    # Configuração da aplicação
│   ├── App.tsx            # Componente raiz
│   ├── providers.tsx      # Provedores globais
│   └── router.tsx         # Configuração de rotas
├── pages/                 # Páginas da aplicação
│   ├── layouts/          # Layouts compartilhados
│   ├── Home/             # Página inicial
│   └── NotFound/         # Página 404
├── domain/               # Módulos de domínio
├── core/                 # Componentes e utilitários core
│   ├── components/       # Componentes compartilhados
│   ├── lib/             # Configurações de bibliotecas
│   └── utils/           # Funções utilitárias
└── assets/              # Recursos estáticos
    └── styles/          # Estilos globais
```

## Arquitetura

O projeto segue uma arquitetura baseada em domínios:

- **app/**: Configuração central da aplicação
- **pages/**: Componentes de página para roteamento
- **domain/**: Módulos de negócio organizados por domínio
- **core/**: Componentes e lógica compartilhada
- **assets/**: Recursos estáticos (estilos, imagens, etc.)

## API

O frontend se comunica com o backend através de dois clientes HTTP:

- **publicClient**: Para endpoints públicos (`/api/v1/external`)
- **authenticatedClient**: Para endpoints autenticados (`/api/v1/internal`)

Configuração em: `src/core/lib/api.ts`