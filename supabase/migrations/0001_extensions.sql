-- ============================================================
-- 0001_extensions.sql
-- Required Postgres extensions.
-- ============================================================
--
-- pgcrypto provides:
--   * gen_random_uuid()  — default value for every UUID primary key
--   * crypt() / gen_salt() — used by 0011_seed_admin.sql to write the
--     default admin password into auth.users
--
-- On Supabase these extensions live in the dedicated `extensions`
-- schema and are usually pre-installed; `if not exists` keeps this
-- migration idempotent regardless.

create extension if not exists pgcrypto;

-- citext is used for case-insensitive uniqueness on admin usernames
-- (the login flow lower-cases usernames before comparison).
create extension if not exists citext;
