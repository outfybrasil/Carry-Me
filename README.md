# CarryMe - Plataforma de Matchmaking

Este projeto é uma plataforma de matchmaking focada em comportamento e reputação.

## Como Rodar Localmente

**Pré-requisitos:** Node.js instalado.

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar Supabase:**
   - Crie um projeto no [Supabase](https://supabase.com).
   - Crie um arquivo `.env` na raiz do projeto.
   - Adicione as chaves do seu projeto:
     ```
     VITE_SUPABASE_URL=sua_url_do_supabase
     VITE_SUPABASE_ANON_KEY=sua_chave_anonima
     ```
   - Certifique-se de criar as tabelas necessárias no banco de dados (profiles, matches, etc).

3. **Rodar o projeto:**
   ```bash
   npm run dev
   ```

## Dicas de Teste

- **Pular Fila (Hack):** Abra o console do navegador (F12) e digite `window.startMatchHack()` para forçar o início de uma partida sem esperar o matchmaking.
