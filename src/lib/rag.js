import { supabase, isSupabaseConfigured } from './supabase';

// ─── PDF Text Extraction ─────────────────────────────────
export async function extractTextFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
  }

  return fullText.trim();
}

// ─── Image Text Extraction ──────────────────────────────
export async function extractTextFromImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(`[Medical Image: ${file.name}] — Image uploaded for visual analysis.`);
    };
    reader.readAsDataURL(file);
  });
}

// ─── Upload & Store Document ─────────────────────────────
export async function uploadAndIndexDocument(file, userId) {
  if (!isSupabaseConfigured() || !userId) {
    throw new Error('Supabase not configured or user not authenticated');
  }

  // 1. Extract FULL text (no chunking — preserve complete context)
  let text = '';
  const fileType = file.type;

  if (fileType === 'application/pdf') {
    text = await extractTextFromPDF(file);
  } else if (fileType.startsWith('image/')) {
    text = await extractTextFromImage(file);
  } else if (fileType === 'text/plain' || file.name.endsWith('.txt')) {
    text = await file.text();
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  if (!text || text.trim().length === 0) {
    throw new Error('No text could be extracted from the file');
  }

  // 2. Store the FULL document text in a single row
  const { error: insertError } = await supabase
    .from('user_documents')
    .upsert({
      user_id: userId,
      file_name: file.name,
      file_type: fileType,
      full_text: text,
      char_count: text.length,
    }, { onConflict: 'user_id,file_name' });

  if (insertError) {
    console.error('Insert error:', insertError);
    throw new Error('Failed to store document: ' + insertError.message);
  }

  return {
    fileName: file.name,
    fileType,
    textLength: text.length,
    pages: (text.match(/--- Page \d+ ---/g) || []).length || 1,
  };
}

// ─── Get All User Documents (full text) ──────────────────
export async function getUserDocumentsContext(userId) {
  if (!isSupabaseConfigured() || !userId) return '';

  const { data, error } = await supabase
    .from('user_documents')
    .select('file_name, file_type, full_text, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return '';

  // Build a complete context string with ALL document contents
  const parts = data.map((doc, i) => {
    return `━━━ Document ${i + 1}: "${doc.file_name}" (${doc.file_type}) ━━━\n${doc.full_text}`;
  });

  return parts.join('\n\n');
}

// ─── Format RAG Context (kept for backward compat) ───────
export function formatRAGContext(results) {
  // This is now just a passthrough — the context is already formatted
  return typeof results === 'string' ? results : '';
}

// ─── List User Documents ─────────────────────────────────
export async function listUserDocuments(userId) {
  if (!isSupabaseConfigured() || !userId) return [];

  const { data, error } = await supabase
    .from('user_documents')
    .select('file_name, file_type, char_count, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('List documents error:', error);
    return [];
  }

  return data || [];
}

// ─── Delete User Document ────────────────────────────────
export async function deleteUserDocument(fileName, userId) {
  if (!isSupabaseConfigured() || !userId) return false;

  const { error } = await supabase
    .from('user_documents')
    .delete()
    .eq('user_id', userId)
    .eq('file_name', fileName);

  if (error) {
    console.error('Delete document error:', error);
    return false;
  }

  return true;
}
