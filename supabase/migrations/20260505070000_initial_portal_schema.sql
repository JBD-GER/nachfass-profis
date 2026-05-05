begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'customer');
  end if;

  if not exists (select 1 from pg_type where typname = 'case_status') then
    create type public.case_status as enum ('eingegangen', 'rueckfrage', 'abgeschlossen', 'abgelehnt');
  end if;

  if not exists (select 1 from pg_type where typname = 'note_visibility') then
    create type public.note_visibility as enum ('internal', 'customer_visible');
  end if;

  if not exists (select 1 from pg_type where typname = 'message_direction') then
    create type public.message_direction as enum ('inbound', 'outbound');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_delivery_status') then
    create type public.notification_delivery_status as enum ('queued', 'sent', 'failed');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.generate_case_reference()
returns text
language sql
as $$
  select 'NP-' || upper(replace(substr(gen_random_uuid()::text, 1, 8), '-', ''));
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'customer',
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  subject_template text not null,
  body_template text not null,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint notification_templates_slug_key unique (slug)
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_reference text not null default public.generate_case_reference(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  status public.case_status not null default 'eingegangen',
  email_contact_attempts integer not null default 0 check (email_contact_attempts >= 0),
  phone_contact_attempts integer not null default 0 check (phone_contact_attempts >= 0),
  initial_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cases_case_reference_key unique (case_reference)
);

create table if not exists public.case_files (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint not null check (file_size >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  constraint case_files_file_path_key unique (file_path)
);

create table if not exists public.case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  visibility public.note_visibility not null default 'internal',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases (id) on delete set null,
  sender_email text not null,
  sender_name text,
  subject text not null,
  body text not null,
  received_at timestamptz not null default timezone('utc', now()),
  direction public.message_direction not null default 'inbound',
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  inbox_message_id uuid references public.inbox_messages (id) on delete set null,
  sender_user_id uuid references public.profiles (id) on delete set null,
  sender_email text not null,
  sender_name text,
  subject text not null,
  body text not null,
  received_at timestamptz not null default timezone('utc', now()),
  direction public.message_direction not null default 'inbound',
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.case_notifications (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  template_id uuid not null references public.notification_templates (id) on delete cascade,
  recipient_email text not null,
  subject_override text,
  body_override text,
  is_enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  last_sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint case_notifications_case_template_key unique (case_id, template_id)
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  case_notification_id uuid references public.case_notifications (id) on delete set null,
  template_id uuid references public.notification_templates (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  recipient_email text not null,
  subject text not null,
  body text not null,
  provider text not null default 'mock',
  provider_message_id text,
  status public.notification_delivery_status not null default 'queued',
  error_message text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_role_idx on public.profiles (role);
create unique index if not exists profiles_email_lower_idx on public.profiles (lower(email)) where email is not null;
create index if not exists cases_customer_id_idx on public.cases (customer_id);
create index if not exists cases_status_idx on public.cases (status);
create index if not exists cases_created_at_idx on public.cases (created_at desc);
create index if not exists case_files_case_id_idx on public.case_files (case_id);
create index if not exists case_notes_case_id_idx on public.case_notes (case_id, created_at desc);
create index if not exists case_notes_visibility_idx on public.case_notes (visibility);
create index if not exists inbox_messages_case_id_idx on public.inbox_messages (case_id);
create index if not exists inbox_messages_received_at_idx on public.inbox_messages (received_at desc);
create index if not exists case_messages_case_id_idx on public.case_messages (case_id, received_at desc);
create index if not exists case_notifications_case_id_idx on public.case_notifications (case_id);
create index if not exists notification_logs_case_id_idx on public.notification_logs (case_id, created_at desc);
create index if not exists notification_logs_status_idx on public.notification_logs (status);

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'customer'::public.user_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin'::public.user_role;
$$;

create or replace function public.owns_case(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cases
    where id = p_case_id
      and customer_id = auth.uid()
  );
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists notification_templates_set_updated_at on public.notification_templates;
create trigger notification_templates_set_updated_at
before update on public.notification_templates
for each row
execute function public.set_updated_at();

drop trigger if exists cases_set_updated_at on public.cases;
create trigger cases_set_updated_at
before update on public.cases
for each row
execute function public.set_updated_at();

drop trigger if exists case_notifications_set_updated_at on public.case_notifications;
create trigger case_notifications_set_updated_at
before update on public.case_notifications
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.handle_new_case_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.case_notifications (case_id, template_id, recipient_email)
  select new.id, template.id, new.customer_email
  from public.notification_templates as template
  where template.is_active = true
  on conflict (case_id, template_id) do nothing;

  return new;
end;
$$;

drop trigger if exists cases_create_default_notifications on public.cases;
create trigger cases_create_default_notifications
after insert on public.cases
for each row
execute function public.handle_new_case_notifications();

create or replace function public.process_case_message(
  p_sender_email text,
  p_subject text,
  p_body text,
  p_case_id uuid default null,
  p_sender_name text default null,
  p_direction public.message_direction default 'inbound',
  p_received_at timestamptz default timezone('utc', now()),
  p_read_at timestamptz default null,
  p_sender_user_id uuid default auth.uid()
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inbox_id uuid;
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED';
  end if;

  if p_case_id is not null then
    if not exists (select 1 from public.cases where id = p_case_id) then
      raise exception 'CASE_NOT_FOUND';
    end if;
  end if;

  insert into public.inbox_messages (
    case_id,
    sender_email,
    sender_name,
    subject,
    body,
    received_at,
    direction,
    read_at
  )
  values (
    p_case_id,
    p_sender_email,
    p_sender_name,
    p_subject,
    p_body,
    p_received_at,
    p_direction,
    p_read_at
  )
  returning id into v_inbox_id;

  if p_case_id is not null then
    insert into public.case_messages (
      case_id,
      inbox_message_id,
      sender_user_id,
      sender_email,
      sender_name,
      subject,
      body,
      received_at,
      direction,
      read_at
    )
    values (
      p_case_id,
      v_inbox_id,
      p_sender_user_id,
      p_sender_email,
      p_sender_name,
      p_subject,
      p_body,
      p_received_at,
      p_direction,
      p_read_at
    );
  end if;

  return v_inbox_id;
end;
$$;

create or replace function public.adjust_case_contact_attempts(
  p_case_id uuid,
  p_email_delta integer default 0,
  p_phone_delta integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED';
  end if;

  update public.cases
  set
    email_contact_attempts = greatest(0, email_contact_attempts + coalesce(p_email_delta, 0)),
    phone_contact_attempts = greatest(0, phone_contact_attempts + coalesce(p_phone_delta, 0)),
    updated_at = timezone('utc', now())
  where id = p_case_id;

  if not found then
    raise exception 'CASE_NOT_FOUND';
  end if;
end;
$$;

create or replace function public.record_notification_dispatch(
  p_case_notification_id uuid,
  p_subject text,
  p_body text,
  p_provider text default 'mock',
  p_status public.notification_delivery_status default 'sent',
  p_provider_message_id text default null,
  p_error_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case_notification public.case_notifications%rowtype;
  v_case public.cases%rowtype;
  v_log_id uuid;
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED';
  end if;

  select *
  into v_case_notification
  from public.case_notifications
  where id = p_case_notification_id;

  if not found then
    raise exception 'CASE_NOTIFICATION_NOT_FOUND';
  end if;

  select *
  into v_case
  from public.cases
  where id = v_case_notification.case_id;

  if not found then
    raise exception 'CASE_NOT_FOUND';
  end if;

  insert into public.notification_logs (
    case_id,
    case_notification_id,
    template_id,
    created_by,
    recipient_email,
    subject,
    body,
    provider,
    provider_message_id,
    status,
    error_message
  )
  values (
    v_case.id,
    v_case_notification.id,
    v_case_notification.template_id,
    auth.uid(),
    v_case_notification.recipient_email,
    p_subject,
    p_body,
    p_provider,
    p_provider_message_id,
    p_status,
    p_error_message
  )
  returning id into v_log_id;

  if p_status = 'sent' then
    update public.cases
    set
      email_contact_attempts = email_contact_attempts + 1,
      updated_at = timezone('utc', now())
    where id = v_case.id;

    update public.case_notifications
    set
      last_sent_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
    where id = v_case_notification.id;

    perform public.process_case_message(
      p_sender_email => 'noreply@nachfass-profis.local',
      p_sender_name => 'Nachfass-Profis',
      p_subject => p_subject,
      p_body => p_body,
      p_case_id => v_case.id,
      p_direction => 'outbound',
      p_received_at => timezone('utc', now()),
      p_sender_user_id => auth.uid()
    );
  end if;

  return v_log_id;
end;
$$;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.owns_case(uuid) to authenticated;
grant execute on function public.process_case_message(text, text, text, uuid, text, public.message_direction, timestamptz, timestamptz, uuid) to authenticated;
grant execute on function public.adjust_case_contact_attempts(uuid, integer, integer) to authenticated;
grant execute on function public.record_notification_dispatch(uuid, text, text, text, public.notification_delivery_status, text, text) to authenticated;

insert into public.notification_templates (
  name,
  slug,
  description,
  subject_template,
  body_template,
  is_active
)
values
  (
    'Eingangsbestätigung',
    'case-received',
    'Standardvorlage für neu eingegangene Angebote.',
    '[{{case_reference}}] Wir haben Ihr Angebot erhalten',
    'Guten Tag {{customer_name}},\n\nwir haben Ihr Angebot erhalten und bearbeiten den Fall jetzt unter der Referenz {{case_reference}}.\n\nAktueller Status: {{status_label}}.\n\nViele Grüße\nNachfass-Profis',
    true
  ),
  (
    'Rückfrage',
    'case-follow-up',
    'Vorlage für Rückfragen an den Kunden.',
    '[{{case_reference}}] Rückfrage zu Ihrem Angebot',
    'Guten Tag {{customer_name}},\n\nzu Ihrem Fall {{case_reference}} haben wir eine Rückfrage. Bitte antworten Sie direkt auf diese Nachricht oder melden Sie sich telefonisch zurück.\n\nAktueller Status: {{status_label}}.\n\nViele Grüße\nNachfass-Profis',
    true
  ),
  (
    'Fallabschluss',
    'case-closed',
    'Vorlage für abgeschlossene Fälle.',
    '[{{case_reference}}] Ihr Fall wurde abgeschlossen',
    'Guten Tag {{customer_name}},\n\nIhr Fall {{case_reference}} wurde abgeschlossen.\n\nAktueller Status: {{status_label}}.\n\nViele Grüße\nNachfass-Profis',
    true
  )
on conflict (slug) do nothing;

alter table public.profiles enable row level security;
alter table public.notification_templates enable row level security;
alter table public.cases enable row level security;
alter table public.case_files enable row level security;
alter table public.case_notes enable row level security;
alter table public.inbox_messages enable row level security;
alter table public.case_messages enable row level security;
alter table public.case_notifications enable row level security;
alter table public.notification_logs enable row level security;

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Admins can manage templates" on public.notification_templates;
create policy "Admins can manage templates"
on public.notification_templates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage cases" on public.cases;
create policy "Admins can manage cases"
on public.cases
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Customers can read own cases" on public.cases;
create policy "Customers can read own cases"
on public.cases
for select
to authenticated
using (customer_id = auth.uid());

drop policy if exists "Customers can create own cases" on public.cases;
create policy "Customers can create own cases"
on public.cases
for insert
to authenticated
with check (
  customer_id = auth.uid()
  and public.current_user_role() = 'customer'::public.user_role
);

drop policy if exists "Admins can manage case files" on public.case_files;
create policy "Admins can manage case files"
on public.case_files
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Customers can read own case files" on public.case_files;
create policy "Customers can read own case files"
on public.case_files
for select
to authenticated
using (public.owns_case(case_id));

drop policy if exists "Customers can create own case files" on public.case_files;
create policy "Customers can create own case files"
on public.case_files
for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and public.owns_case(case_id)
);

drop policy if exists "Admins can manage case notes" on public.case_notes;
create policy "Admins can manage case notes"
on public.case_notes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Customers can read visible notes on own cases" on public.case_notes;
create policy "Customers can read visible notes on own cases"
on public.case_notes
for select
to authenticated
using (
  visibility = 'customer_visible'::public.note_visibility
  and public.owns_case(case_id)
);

drop policy if exists "Admins can manage inbox messages" on public.inbox_messages;
create policy "Admins can manage inbox messages"
on public.inbox_messages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage case messages" on public.case_messages;
create policy "Admins can manage case messages"
on public.case_messages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Customers can read own case messages" on public.case_messages;
create policy "Customers can read own case messages"
on public.case_messages
for select
to authenticated
using (public.owns_case(case_id));

drop policy if exists "Admins can manage case notifications" on public.case_notifications;
create policy "Admins can manage case notifications"
on public.case_notifications
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage notification logs" on public.notification_logs;
create policy "Admins can manage notification logs"
on public.notification_logs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'offers',
  'offers',
  false,
  52428800,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can manage offer objects" on storage.objects;
create policy "Admins can manage offer objects"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'offers'
  and public.is_admin()
)
with check (
  bucket_id = 'offers'
  and public.is_admin()
);

drop policy if exists "Customers can read own offer objects" on storage.objects;
create policy "Customers can read own offer objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'offers'
  and split_part(name, '/', 1) = auth.uid()::text
  and split_part(name, '/', 2) ~* '^[0-9a-f-]{36}$'
  and public.owns_case((split_part(name, '/', 2))::uuid)
);

drop policy if exists "Customers can create own offer objects" on storage.objects;
create policy "Customers can create own offer objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'offers'
  and split_part(name, '/', 1) = auth.uid()::text
  and split_part(name, '/', 2) ~* '^[0-9a-f-]{36}$'
  and public.owns_case((split_part(name, '/', 2))::uuid)
);

commit;
