import { SECTIONS, API_KEY, API_URL, MODEL } from '../config';

/**
 * Stream a chat completion from the HuggingFace API.
 * Extracted from App.jsx for reuse across pages.
 */
export async function callAPIStream(text, image, section, prevHistory, onChunk) {
  const sec = SECTIONS[section];
  const systemPrompt = sec.systemPrompt;

  const messages = [{ role: 'system', content: systemPrompt }];

  const recent = prevHistory.slice(-10);
  for (const msg of recent) {
    if (msg.role === 'user') {
      const content = [];
      if (msg.text) content.push({ type: 'text', text: msg.text });
      if (msg.image) content.push({ type: 'image_url', image_url: { url: msg.image } });
      messages.push({ role: 'user', content });
    } else if (msg.role === 'assistant') {
      messages.push({ role: 'assistant', content: msg.text });
    }
  }

  const currentContent = [];
  if (text) currentContent.push({ type: 'text', text });
  if (image) currentContent.push({ type: 'image_url', image_url: { url: image.base64 } });
  if (currentContent.length) messages.push({ role: 'user', content: currentContent });

  const MAX_RETRIES = 3;
  const body = JSON.stringify({ model: MODEL, messages, max_tokens: 2048, temperature: 0.7, stream: true });

  let res;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body,
    });

    if (res.status === 429 && attempt < MAX_RETRIES) {
      const waitSec = Math.pow(2, attempt + 1);
      onChunk(`*Rate limited — retrying in ${waitSec}s... (attempt ${attempt + 2}/${MAX_RETRIES + 1})*`);
      await new Promise(r => setTimeout(r, waitSec * 1000));
      continue;
    }
    break;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') break;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onChunk(full);
        }
      } catch {}
    }
  }

  return full || 'No response received.';
}
