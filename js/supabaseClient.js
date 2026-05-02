// js/supabaseClient.js

const supabaseUrl = 'https://neyzmzxwtsrrcfmfxioh.supabase.co';
const supabaseKey = 'sb_publishable_RtGlZynWd8S_dS2CHKgkvQ_f2hsNjVC';

export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
