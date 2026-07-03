-- Criação da tabela candidatos_marketing no Supabase
create table if not exists candidatos_marketing (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  nome text,
  cpf text,
  idade text,
  estado_civil text,
  tem_filhos text,
  cidade_bairro text,
  telefone text,
  email text,
  tempo_experiencia_redes text,
  redes_gerenciadas text[],
  ferramentas_conteudo text[],
  portfolio text,
  experiencia_vendas_whatsapp text,
  descricao_vendas_whatsapp text,
  experiencia_agencia_fornecedor text,
  nivel_excel text,
  disponibilidade_horario text,
  pretensao_salarial text,
  status text default 'Novo'
);

-- Habilitar RLS
alter table candidatos_marketing enable row level security;

-- Permitir que a chave anon insira novas respostas (formulário público)
create policy "Permitir insercao publica"
  on candidatos_marketing
  for insert
  to anon
  with check (true);

-- Permitir que a chave anon leia os registros (painel admin)
create policy "Permitir leitura publica"
  on candidatos_marketing
  for select
  to anon
  using (true);

-- Permitir que a chave anon atualize o status (painel admin)
create policy "Permitir atualizacao publica"
  on candidatos_marketing
  for update
  to anon
  using (true)
  with check (true);
