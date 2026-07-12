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
-- the Supabase user_metadata — so those are written here to match.
--
-- Idempotent: safe to re-run. Nothing happens if the user already exists.
--
-- NOTE: this writes directly into auth.users / auth.identities. The column
-- set below matches Supabase's GoTrue schema (identities.provider_id is
-- required on releases from 2024 onward). Alternatively the same user can be
-- created via the Auth Admin API; either path satisfies the login flow.
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
      updated_at
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
      now()
    );

    -- 2. auth.identities (email provider)
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
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email',
      now(),
      now(),
      now()
    );
  end if;

  -- 3. admin_users profile row
  insert into admin_users (id, username, display_name, role, active)
  values (v_user_id, 'admin', 'Quản trị viên', 'superadmin', true)
  on conflict (id) do nothing;
end
$$;
