import { createClient } from '@supabase/supabase-js';

// ──────────────────────────────────────────────────────────
// Configure these in your .env file:
//   VITE_SUPABASE_URL=https://your-project.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-key-here
// ──────────────────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export function isSupabaseConfigured() {
  return !!supabase;
}

// ─── Chat Sessions ───────────────────────────────────────

export async function createChatSession(section, title = '', userId = null) {
  if (!supabase) return null;
  const insertData = { section, title: title || `${section} Session` };
  if (userId) insertData.user_id = userId;
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert(insertData)
    .select()
    .single();
  if (error) { console.error('Create session error:', error); return null; }
  return data;
}

export async function listChatSessions(section = null) {
  if (!supabase) return [];
  let query = supabase.from('chat_sessions').select('*').order('updated_at', { ascending: false });
  if (section) query = query.eq('section', section);
  const { data, error } = await query;
  if (error) { console.error('List sessions error:', error); return []; }
  return data || [];
}

export async function deleteChatSession(sessionId) {
  if (!supabase) return false;
  const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId);
  if (error) { console.error('Delete session error:', error); return false; }
  return true;
}

// ─── Messages ────────────────────────────────────────────

export async function saveMessage(sessionId, role, content, imageUrl = null, metadata = {}) {
  if (!supabase || !sessionId) return null;
  const { data, error } = await supabase
    .from('messages')
    .insert({ session_id: sessionId, role, content, image_url: imageUrl, metadata })
    .select()
    .single();
  if (error) { console.error('Save message error:', error); return null; }

  // Update session timestamp
  await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);
  return data;
}

export async function getMessages(sessionId) {
  if (!supabase || !sessionId) return [];
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  if (error) { console.error('Get messages error:', error); return []; }
  return data || [];
}

// ─── Storage ─────────────────────────────────────────────

export async function uploadMedicalImage(file, sessionId) {
  if (!supabase) return null;
  const ext = file.name.split('.').pop();
  const path = `scans/${sessionId}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from('medical-images')
    .upload(path, file, { contentType: file.type });
  if (error) { console.error('Upload error:', error); return null; }
  const { data: urlData } = supabase.storage.from('medical-images').getPublicUrl(data.path);
  return urlData?.publicUrl || null;
}
