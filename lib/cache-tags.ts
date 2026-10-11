// Cache tag on every public Supabase read (lib/data.ts). Admin writes
// expire it so changes appear on the next page load.
export const SITE_DATA_TAG = "site-data";
