# Questionário — Assistente de Marketing (Genthe)

## 1. Supabase
1. Acesse o projeto `wlfxwtzjlbuzyigzspms.supabase.co`.
2. Abra o editor SQL e execute o conteúdo do arquivo `supabase.sql` para criar a tabela `candidatos_marketing` e as políticas de acesso.

## 2. GitHub
1. Crie o repositório `questionario-marketing` na organização `gentedagenthe`.
2. Envie todos os arquivos deste projeto para o repositório.

## 3. Vercel
1. Conecte o repositório `questionario-marketing` ao Vercel.
2. Configure as variáveis de ambiente:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_ADMIN_PASSWORD` = `Marketing2026`
   - `REACT_APP_INSCRICOES_ENCERRADAS` = `false` (mude para `true` quando quiser encerrar as inscrições)
3. Faça o deploy.

## Acesso
- Formulário público: `/`
- Painel administrativo: `/admin` (senha: `Marketing2026`)

## Observações
- Todas as perguntas do formulário são obrigatórias.
- O painel administrativo permite busca, filtro por status e contato direto via WhatsApp.
- Os status disponíveis são: Novo, Em análise, Aprovado, Entrevista, Reprovado, Desistiu.
