begin;

alter table public.profiles
  add column if not exists company_name text,
  add column if not exists street text,
  add column if not exists postal_code text,
  add column if not exists city text,
  add column if not exists country text not null default 'DE',
  add column if not exists logo_file_path text,
  add column if not exists mailbox_email text,
  add column if not exists mailbox_display_name text,
  add column if not exists mailbox_signature text,
  add column if not exists mailbox_provider text not null default 'mock',
  add column if not exists mailbox_is_active boolean not null default false;

create unique index if not exists profiles_mailbox_email_lower_idx
on public.profiles (lower(mailbox_email))
where mailbox_email is not null;

alter table public.inbox_messages
  add column if not exists customer_profile_id uuid references public.profiles (id) on delete set null,
  add column if not exists recipient_email text,
  add column if not exists mailbox_email text;

alter table public.case_messages
  add column if not exists customer_profile_id uuid references public.profiles (id) on delete set null,
  add column if not exists recipient_email text,
  add column if not exists mailbox_email text;

create index if not exists inbox_messages_customer_profile_id_idx
on public.inbox_messages (customer_profile_id, received_at desc);

create index if not exists case_messages_customer_profile_id_idx
on public.case_messages (customer_profile_id, received_at desc);

update public.inbox_messages as inbox
set
  customer_profile_id = cases.customer_id,
  recipient_email = case
    when inbox.direction = 'outbound'::public.message_direction then cases.customer_email
    else profiles.mailbox_email
  end,
  mailbox_email = profiles.mailbox_email
from public.cases, public.profiles
where inbox.case_id = cases.id
  and cases.customer_id = profiles.id
  and inbox.customer_profile_id is null;

update public.case_messages as messages
set
  customer_profile_id = cases.customer_id,
  recipient_email = case
    when messages.direction = 'outbound'::public.message_direction then cases.customer_email
    else profiles.mailbox_email
  end,
  mailbox_email = profiles.mailbox_email
from public.cases, public.profiles
where messages.case_id = cases.id
  and cases.customer_id = profiles.id
  and messages.customer_profile_id is null;

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
  v_customer_profile_id uuid;
  v_customer_email text;
  v_mailbox_email text;
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED';
  end if;

  if p_case_id is not null then
    select
      cases.customer_id,
      cases.customer_email,
      profiles.mailbox_email
    into
      v_customer_profile_id,
      v_customer_email,
      v_mailbox_email
    from public.cases
    left join public.profiles on profiles.id = cases.customer_id
    where cases.id = p_case_id;

    if not found then
      raise exception 'CASE_NOT_FOUND';
    end if;
  end if;

  insert into public.inbox_messages (
    case_id,
    customer_profile_id,
    sender_email,
    sender_name,
    recipient_email,
    mailbox_email,
    subject,
    body,
    received_at,
    direction,
    read_at
  )
  values (
    p_case_id,
    v_customer_profile_id,
    p_sender_email,
    p_sender_name,
    case
      when p_direction = 'outbound'::public.message_direction then v_customer_email
      else v_mailbox_email
    end,
    v_mailbox_email,
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
      customer_profile_id,
      inbox_message_id,
      sender_user_id,
      sender_email,
      sender_name,
      recipient_email,
      mailbox_email,
      subject,
      body,
      received_at,
      direction,
      read_at
    )
    values (
      p_case_id,
      v_customer_profile_id,
      v_inbox_id,
      p_sender_user_id,
      p_sender_email,
      p_sender_name,
      case
        when p_direction = 'outbound'::public.message_direction then v_customer_email
        else v_mailbox_email
      end,
      v_mailbox_email,
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

create or replace function public.process_customer_mailbox_message(
  p_customer_profile_id uuid,
  p_sender_email text,
  p_recipient_email text,
  p_subject text,
  p_body text,
  p_case_id uuid default null,
  p_sender_name text default null,
  p_direction public.message_direction default 'outbound',
  p_received_at timestamptz default timezone('utc', now()),
  p_read_at timestamptz default null,
  p_sender_user_id uuid default auth.uid(),
  p_mailbox_email text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inbox_id uuid;
  v_customer_role public.user_role;
  v_case_customer_id uuid;
  v_mailbox_email text;
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED';
  end if;

  select role, mailbox_email
  into v_customer_role, v_mailbox_email
  from public.profiles
  where id = p_customer_profile_id;

  if not found or v_customer_role <> 'customer'::public.user_role then
    raise exception 'CUSTOMER_NOT_FOUND';
  end if;

  if p_case_id is not null then
    select customer_id
    into v_case_customer_id
    from public.cases
    where id = p_case_id;

    if not found then
      raise exception 'CASE_NOT_FOUND';
    end if;

    if v_case_customer_id <> p_customer_profile_id then
      raise exception 'CASE_CUSTOMER_MISMATCH';
    end if;
  end if;

  insert into public.inbox_messages (
    case_id,
    customer_profile_id,
    sender_email,
    sender_name,
    recipient_email,
    mailbox_email,
    subject,
    body,
    received_at,
    direction,
    read_at
  )
  values (
    p_case_id,
    p_customer_profile_id,
    p_sender_email,
    p_sender_name,
    p_recipient_email,
    coalesce(p_mailbox_email, v_mailbox_email),
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
      customer_profile_id,
      inbox_message_id,
      sender_user_id,
      sender_email,
      sender_name,
      recipient_email,
      mailbox_email,
      subject,
      body,
      received_at,
      direction,
      read_at
    )
    values (
      p_case_id,
      p_customer_profile_id,
      v_inbox_id,
      p_sender_user_id,
      p_sender_email,
      p_sender_name,
      p_recipient_email,
      coalesce(p_mailbox_email, v_mailbox_email),
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

grant execute on function public.process_customer_mailbox_message(uuid, text, text, text, text, uuid, text, public.message_direction, timestamptz, timestamptz, uuid, text) to authenticated;

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
  v_mailbox_email text;
  v_mailbox_display_name text;
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

  select mailbox_email, coalesce(mailbox_display_name, company_name, full_name, 'Nachfass-Profis')
  into v_mailbox_email, v_mailbox_display_name
  from public.profiles
  where id = v_case.customer_id;

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

    perform public.process_customer_mailbox_message(
      p_customer_profile_id => v_case.customer_id,
      p_sender_email => coalesce(v_mailbox_email, 'noreply@nachfass-profis.local'),
      p_recipient_email => v_case_notification.recipient_email,
      p_subject => p_subject,
      p_body => p_body,
      p_case_id => v_case.id,
      p_sender_name => coalesce(v_mailbox_display_name, 'Nachfass-Profis'),
      p_direction => 'outbound',
      p_received_at => timezone('utc', now()),
      p_sender_user_id => auth.uid(),
      p_mailbox_email => v_mailbox_email
    );
  end if;

  return v_log_id;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'customer-assets',
  'customer-assets',
  false,
  10485760,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can manage customer assets" on storage.objects;
create policy "Admins can manage customer assets"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'customer-assets'
  and public.is_admin()
)
with check (
  bucket_id = 'customer-assets'
  and public.is_admin()
);

drop policy if exists "Customers can read own customer assets" on storage.objects;
create policy "Customers can read own customer assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'customer-assets'
  and split_part(name, '/', 1) = auth.uid()::text
);

commit;
