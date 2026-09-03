import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kdqnxcklgiarjfnwztyc.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcW54Y2tsZ2lhcmpmbnd6dHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDA1NjQsImV4cCI6MjEwNDAxNjU2NH0.h88gS-4dyhDacvlYLXJcEYKU-Ojkowsh_Rm__NPnFlk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
