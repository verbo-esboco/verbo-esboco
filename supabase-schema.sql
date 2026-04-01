-- ============================================================
-- VERBO – Esboços Bíblicos
-- Execute este SQL no Supabase > SQL Editor
-- ============================================================

-- Tabela de Pastas
create table if not exists pastas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  nome text not null,
  cor text not null default '#f97316',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de Esboços
create table if not exists esbocos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  pasta_id uuid references pastas(id) on delete set null,
  titulo text not null default 'Novo Esboço',
  referencia_biblica text not null default '',
  texto_biblico text not null default '',
  introducao text not null default '',
  desenvolvimento text not null default '',
  aplicacao text not null default '',
  conclusao text not null default '',
  status text not null default 'rascunho' check (status in ('rascunho', 'pronto', 'pregado')),
  fixado boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para performance
create index if not exists esbocos_user_id_idx on esbocos(user_id);
create index if not exists esbocos_pasta_id_idx on esbocos(pasta_id);
create index if not exists esbocos_updated_at_idx on esbocos(updated_at desc);
create index if not exists pastas_user_id_idx on pastas(user_id);

-- Busca full text em português
alter table esbocos add column if not exists search_vector tsvector
  generated always as (
    to_tsvector('portuguese',
      coalesce(titulo, '') || ' ' ||
      coalesce(referencia_biblica, '') || ' ' ||
      coalesce(texto_biblico, '') || ' ' ||
      coalesce(introducao, '') || ' ' ||
      coalesce(desenvolvimento, '') || ' ' ||
      coalesce(aplicacao, '') || ' ' ||
      coalesce(conclusao, '')
    )
  ) stored;

create index if not exists esbocos_search_idx on esbocos using gin(search_vector);

-- Row Level Security (RLS)
alter table pastas enable row level security;
alter table esbocos enable row level security;

-- Políticas RLS — Pastas
create policy "Usuários veem próprias pastas" on pastas
  for select using (auth.uid() = user_id);

create policy "Usuários criam próprias pastas" on pastas
  for insert with check (auth.uid() = user_id);

create policy "Usuários editam próprias pastas" on pastas
  for update using (auth.uid() = user_id);

create policy "Usuários deletam próprias pastas" on pastas
  for delete using (auth.uid() = user_id);

-- Políticas RLS — Esboços
create policy "Usuários veem próprios esboços" on esbocos
  for select using (auth.uid() = user_id);

create policy "Usuários criam próprios esboços" on esbocos
  for insert with check (auth.uid() = user_id);

create policy "Usuários editam próprios esboços" on esbocos
  for update using (auth.uid() = user_id);

create policy "Usuários deletam próprios esboços" on esbocos
  for delete using (auth.uid() = user_id);

-- Trigger updated_at automático
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger esbocos_updated_at
  before update on esbocos
  for each row execute function update_updated_at();

create trigger pastas_updated_at
  before update on pastas
  for each row execute function update_updated_at();
