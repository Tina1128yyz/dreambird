// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fmqmwlfqvwjipyblsbfb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcW13bGZxdndqaXB5YmxzYmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzc4OTUsImV4cCI6MjA3MjYxMzg5NX0.raArSb9QF8EKxA8pMGGKGN1ivrqcuwax2Q9PZCSmfBY";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("缺少 Supabase 环境变量，请在 .env.local 中设置");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
