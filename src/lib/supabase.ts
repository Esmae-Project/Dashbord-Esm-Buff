import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  "https://tqjkourdfxcdopstqrzp.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_WfWO41Jr6Ix03fa1tv9txg_fQ8Dd3qw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
