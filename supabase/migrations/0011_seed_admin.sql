-- ============================================================
-- 0011_seed_admin.sql
-- Seed the default super-admin, mirroring lib/auth/accounts.ts:
--   username     "admin"
--   password     "TL@Admin2025"
--   displayName  "Quản trị viên"
--   role         "superadmin"
--
-- The login route (app/api/admin/login/route.ts) maps a bare username to
-- "<username>@cacanhthanhliem.internal" and reads role / display_name from
-- public.admin_users (step 3).
--
-- Idempotent: safe to re-run. An existing admin keeps its password; only
-- the repairs in step 2 are applied to it.
--
-- NOTE: this writes directly into auth.users / auth.identities. The column
-- set below matches Supabase's GoTrue schema (identities.provider_id is
-- required on releases from 2024 onward). GoTrue reads the token columns
-- into plain strings, so they must be '' rather than NULL — a NULL there
-- makes every sign-in for the user fail ("Database error querying schema").
-- ============================================================

do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-0000000000ad';
  v_email   text := 'admin@cacanhthanhliem.internal';
begin
  -- 1. auth.users
  if not exists (select 1 from auth.users where id = v_user_id) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      phone_change,
      phone_change_token,
      reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt('TL@Admin2025', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role":"superadmin","display_name":"Quản trị viên"}'::jsonb,
      now(),
      now(),
      '', '', '', '', '', '', '', ''
    );

    -- auth.identities (email provider)
    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      v_user_id,
      v_user_id::text,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
      'email',
      now(),
      now(),
      now()
    );
  end if;

  -- 2. Repair an admin seeded by an earlier version of this file, which
  --    left the token columns NULL and so could never sign in.
  update auth.users set
    email_confirmed_at         = coalesce(email_confirmed_at, now()),
    confirmation_token         = coalesce(confirmation_token, ''),
    recovery_token             = coalesce(recovery_token, ''),
    email_change_token_new     = coalesce(email_change_token_new, ''),
    email_change               = coalesce(email_change, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    phone_change               = coalesce(phone_change, ''),
    phone_change_token         = coalesce(phone_change_token, ''),
    reauthentication_token     = coalesce(reauthentication_token, '')
  where id = v_user_id;

  -- 3. admin_users profile row
  insert into admin_users (id, username, display_name, role, active)
  values (v_user_id, 'admin', 'Quản trị viên', 'superadmin', true)
  on conflict (id) do nothing;
end
$$;
