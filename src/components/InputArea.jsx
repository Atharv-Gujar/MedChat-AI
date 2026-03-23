import { useState, useRef, useEffect } from 'react';
import { SECTIONS } from '../config';

export default function InputArea({ theme, section, image, setImage, onSend, loading }) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const textRef = useRef(null);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const dark = theme === 'dark';
  const canSend = (text.trim() || image) && !loading;

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 150) + 'px';
    }
  }, [text]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const handleSend = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage({ base64: ev.target.result, name: file.name });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage({ base64: ev.target.result, name: file.name });
      reader.readAsDataURL(file);
    }
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = text;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + t;
        } else {
          interim = t;
        }
      }
      setText(finalTranscript + (interim ? ' ' + interim : ''));
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div
      className={`px-4 md:px-6 pt-3 pb-4 border-t
        ${dark ? 'bg-dark-800/60 border-white/[0.06] backdrop-blur-xl' : 'bg-white/80 border-slate-200/60 backdrop-blur-xl'}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Image preview */}
      {image && (
        <div className={`flex items-center gap-3 px-3 py-2.5 mb-2.5 rounded-xl border animate-fade-in-up
          ${dark ? 'bg-brand-500/[0.05] border-brand-500/15' : 'bg-brand-50/50 border-brand-200/40'}`}>
          <div className="relative rounded-lg overflow-hidden">
            <img src={image.base64} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 border-2 border-dark-900 flex items-center justify-center text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <span className={`text-xs font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Image attached</span>
        </div>
      )}

      {/* Input */}
      <div className={`flex items-end gap-1.5 px-1.5 py-1.5 rounded-2xl border transition-all shadow-input
        ${dark ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-slate-50 border-slate-200/60'}
        focus-within:border-brand-500/30 focus-within:shadow-[0_0_0_3px_rgba(43,127,255,0.06)]`}
      >
        {/* Upload button */}
        <button
          onClick={() => fileRef.current?.click()}
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors
            ${dark ? 'text-slate-500 hover:text-brand-400 hover:bg-white/[0.06]' : 'text-slate-400 hover:text-brand-500 hover:bg-slate-100'}`}
          title="Upload image"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />

        {/* Mic button */}
        {hasSpeechRecognition && (
          <button
            onClick={toggleVoice}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all
              ${listening
                ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                : dark
                  ? 'text-slate-500 hover:text-rose-400 hover:bg-white/[0.06]'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
              }`}
            title={listening ? 'Stop listening' : 'Voice input'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        )}

        <textarea
          ref={textRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={listening ? 'Listening... speak now' : 'Type clinical query or drag images here...'}
          rows={1}
          className={`flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed py-2 px-2 min-h-[38px] max-h-[150px]
            ${dark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all
            bg-gradient-to-br from-brand-500 to-brand-600 text-white
            ${canSend ? 'opacity-100 hover:shadow-[0_0_20px_rgba(43,127,255,0.3)] hover:scale-105' : 'opacity-30 cursor-not-allowed'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
