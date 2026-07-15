import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Upload, RefreshCw, CheckCircle, HelpCircle, Zap, ChevronRight } from 'lucide-react';
import API from './api';

/* ── Navigation Icons ── */
const TextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <polygon points="10 8 16 10 10 12 10 8" />
  </svg>
);

const TrayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

/* ── Corner bracket decorator ── */
const CornerBrackets = ({ className = '' }) => (
  <span className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
    <span style={{
      position: 'absolute', top: 0, left: 0, width: 8, height: 8,
      borderTop: '1.5px solid var(--amber)', borderLeft: '1.5px solid var(--amber)'
    }} />
    <span style={{
      position: 'absolute', top: 0, right: 0, width: 8, height: 8,
      borderTop: '1.5px solid var(--amber)', borderRight: '1.5px solid var(--amber)'
    }} />
    <span style={{
      position: 'absolute', bottom: 0, left: 0, width: 8, height: 8,
      borderBottom: '1.5px solid var(--amber)', borderLeft: '1.5px solid var(--amber)'
    }} />
    <span style={{
      position: 'absolute', bottom: 0, right: 0, width: 8, height: 8,
      borderBottom: '1.5px solid var(--amber)', borderRight: '1.5px solid var(--amber)'
    }} />
  </span>
);

/* ── Score badge ── */
const ScoreBadge = ({ obtained, total }) => {
  const pct = Math.round((obtained / total) * 100);
  const isHigh = pct >= 70;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
      style={{
        position: 'relative',
        background: isHigh ? 'var(--emerald-bg)' : 'var(--rose-bg)',
        border: `1px solid ${isHigh ? 'var(--emerald-border)' : 'var(--rose-border)'}`,
        borderRadius: 6,
        padding: '8px 16px',
        textAlign: 'right',
        minWidth: 96,
      }}
    >
      <CornerBrackets />
      <span style={{ display: 'block', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: isHigh ? 'var(--emerald)' : 'var(--rose)', textTransform: 'uppercase', marginBottom: 2 }}>
        SCORE
      </span>
      <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: isHigh ? 'var(--emerald)' : 'var(--rose)', lineHeight: 1 }}>
        {obtained}<span style={{ fontSize: 12, opacity: 0.6 }}>/{total}</span>
      </span>
      <span style={{ display: 'block', fontSize: 9, fontFamily: 'var(--font-mono)', color: isHigh ? 'var(--emerald)' : 'var(--rose)', opacity: 0.7 }}>{pct}%</span>
    </motion.div>
  );
};

/* ── Input / Textarea base style objects ── */
const inputBase = {
  width: '100%',
  background: 'var(--bg-base)',
  border: '1px solid var(--border-dim)',
  borderRadius: 4,
  padding: '9px 12px',
  fontSize: 13,
  color: 'var(--ink-primary)',
  fontFamily: 'var(--font-ui)',
  outline: 'none',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
};

/* ── Controlled input with focus glow ── */
const CyberInput = ({ as: Tag = 'input', style = {}, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <Tag
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        borderColor: focused ? 'var(--amber)' : 'var(--border-dim)',
        boxShadow: focused ? '0 0 0 3px var(--amber-glow)' : 'none',
        ...style,
      }}
    />
  );
};

/* ── Floating Dock Tab ── */
const DockTab = ({ active, onClick, icon, tooltip }) => (
  <div className="group relative flex items-center justify-center">
    <button
      type="button"
      onClick={onClick}
      className={`relative p-3 rounded-full flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-125 hover:mx-2 hover:shadow-xl hover:shadow-[#e06d25]/20 ${active
          ? 'bg-[#e06d25] text-slate-950 scale-110 shadow-lg shadow-[#e06d25]/30'
          : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
        }`}
      aria-label={tooltip}
    >
      {icon}
    </button>
    <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-all duration-200 px-3 py-1.5 bg-slate-900 text-slate-200 text-xs font-medium rounded-md shadow-xl border border-slate-700/50 whitespace-nowrap pointer-events-none z-50">
      {tooltip}
    </div>
  </div>
);

/* ── Option button for quiz answers ── */
const OptionButton = ({ option, isSelected, isCorrect, isWrong, disabled, onClick }) => {
  const [hovered, setHovered] = useState(false);

  let bg = 'var(--bg-base)';
  let borderColor = 'var(--border-dim)';
  let color = 'var(--ink-body)';
  let prefix = null;

  if (isCorrect) {
    bg = 'var(--emerald-bg)';
    borderColor = 'var(--emerald-border)';
    color = 'var(--emerald)';
    prefix = <CheckCircle size={12} />;
  } else if (isWrong) {
    bg = 'var(--rose-bg)';
    borderColor = 'var(--rose-border)';
    color = 'var(--rose)';
  } else if (isSelected) {
    bg = 'var(--amber-muted)';
    borderColor = 'var(--amber)';
    color = 'var(--ink-primary)';
  } else if (hovered && !disabled) {
    borderColor = 'var(--border-mid)';
    color = 'var(--ink-primary)';
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '9px 12px',
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        background: bg,
        color,
        fontSize: 13,
        fontFamily: 'var(--font-ui)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        transition: 'border-color 140ms ease, background 140ms ease, color 140ms ease, transform 140ms ease',
        transform: hovered && !disabled && !isSelected && !isCorrect && !isWrong ? 'translateY(-1px)' : 'none',
      }}
    >
      <span style={{ flex: 1, lineHeight: 1.45 }}>{option}</span>
      {prefix}
    </button>
  );
};

/* ── History item ── */
const HistoryItem = ({ quiz, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const src = quiz.sourceType?.toLowerCase();
  const srcColor = src === 'youtube' ? '#ef4444' : src === 'pdf' ? '#f59e0b' : '#94a3b8';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '9px 12px',
        border: `1px solid ${isActive ? 'var(--amber-border)' : hovered ? 'var(--border-mid)' : 'var(--border-dim)'}`,
        borderRadius: 4,
        background: isActive ? 'var(--amber-muted)' : hovered ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        transition: 'border-color 140ms ease, background 140ms ease',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: isActive ? 'var(--amber)' : 'var(--ink-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {quiz.title}
        </p>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', color: srcColor }}>
          {quiz.sourceType}
        </span>
      </div>
      <ChevronRight size={13} style={{ color: 'var(--ink-muted)', flexShrink: 0, opacity: isActive ? 1 : 0.5 }} />
    </motion.button>
  );
};

/* ── Ambient Background Vectors ── */
const DECORATIVE_SVGS = [
  {
    viewBox: "0 0 111 84",
    path: <path d="M31.0765 27.2486C26.1015 26.7012 22.2413 26.4661 17.9912 29.1784C14.4117 31.4627 11.1985 34.3891 8.58691 37.738C4.29615 43.2402 0.336537 52.039 2.24142 59.2246C4.98617 69.5784 16.8366 73.6018 26.4625 74.5225C32.2991 75.0807 36.8134 76.705 42.0015 79.2989C47.4455 82.0208 52.9625 83.0126 59.0575 82.5448C75.1997 81.3059 86.5715 66.0366 97.7023 55.901C102.262 51.7489 106.83 47.1506 108.433 41.0086C110.209 34.2 109.841 28.1289 107.511 21.538C102.999 8.77718 89.8609 0.953284 76.6103 1.72494C63.5784 2.48385 54.9919 14.6445 45.2562 21.8461C38.9055 26.5438 33.3725 25.9365 26.0188 26.6718" fill="currentColor" />
  },
  {
    viewBox: "0 0 81 87",
    path: <path d="M12.8712 45.9567C16.4531 45.4474 19.1792 45.4456 19.2357 49.5569C19.2811 52.8605 18.6076 56.1649 18.4128 59.4609C17.9957 66.5175 17.9499 72.1072 23.0471 77.2041C32.3722 86.5287 49.1238 87.0282 60.7547 82.6889C67.9214 80.0151 74.2671 74.2839 78.0682 67.6885C80.7636 63.0116 80.2666 59.7345 76.4262 56.0918C72.0712 51.961 67.4279 48.1904 67.0597 41.7158C66.6423 34.374 70.685 28.1183 72.9716 21.4091C74.7614 16.1575 75.4912 9.43892 71.2989 5.07469C66.1453 -0.290242 59.1517 0.30946 52.8643 2.86602C46.1254 5.60612 40.6447 10.8242 33.6144 12.9014C27.9547 14.5737 22.2595 13.4785 16.5512 14.4656C10.3367 15.5403 5.23288 18.9391 2.72595 24.8252C1.01796 28.8354 0.348828 33.9445 1.89154 38.104C2.73893 40.3888 4.69762 41.7066 6.8999 42.4293C9.72015 43.3548 11.699 45.2144 14.7875 45.5769" fill="currentColor" />
  }
];

const THEME_COLORS = [
  'text-[#b5a3a3]/60', // The color provided in the SVGs
  'text-[#e06d25]/50', // Nature's Basket glowing orange
  'text-[#d9e2b4]/40'  // Nature's Basket glowing green
];

const ROTATIONS = ['rotate-[15deg]', 'rotate-[45deg]', 'rotate-[72deg]', 'rotate-[120deg]', 'rotate-[180deg]', 'rotate-[215deg]', 'rotate-[260deg]', 'rotate-[310deg]'];
const SCALES = ['scale-100', 'scale-150', 'scale-[2]', 'scale-[2.5]', 'scale-[3]'];

/* ─────────────────────────────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [questionCount, setQuestionCount] = useState(5);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);

  const [quizTitle, setQuizTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const fileInputRef = useRef(null);

  const decorations = useMemo(() => {
    const items = [];
    const count = Math.floor(Math.random() * 3) + 6; // 6 to 8 items
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        top: `${Math.floor(Math.random() * 100)}%`,
        left: `${Math.floor(Math.random() * 100)}%`,
        rotate: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
        scale: SCALES[Math.floor(Math.random() * SCALES.length)],
        color: THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)],
        svg: DECORATIVE_SVGS[Math.floor(Math.random() * DECORATIVE_SVGS.length)]
      });
    }
    return items;
  }, []);

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await API.get('/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error retrieving historical quizzes:', error);
    }
  };

  const handleClearHistory = async () => {
    try {
      await API.delete('/quizzes/clear-all');
      setQuizzes([]);
      setCurrentQuiz(null);
      setQuizScore(null);
      setSelectedAnswers({});
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Failed to clear history.');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setQuizScore(null);
    setSelectedAnswers({});

    try {
      let response;
      if (activeTab === 'text') {
        response = await API.post('/quizzes/generate-text', { title: quizTitle, textContent, questionCount });
      } else if (activeTab === 'youtube') {
        response = await API.post('/quizzes/generate-youtube', { title: quizTitle, videoUrl: youtubeUrl, questionCount });
      } else if (activeTab === 'pdf') {
        if (!pdfFile) throw new Error('Please select a PDF file first.');
        const formData = new FormData();
        formData.append('title', quizTitle);
        formData.append('file', pdfFile);
        formData.append('questionCount', questionCount);
        response = await API.post('/quizzes/generate-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setCurrentQuiz(response.data);
      fetchQuizzes();
      setQuizTitle('');
      setTextContent('');
      setYoutubeUrl('');
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      alert(error.response?.data?.error || error.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, optionText) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionText }));
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;
    let score = 0;
    currentQuiz.questions.forEach(q => {
      if (selectedAnswers[q._id] === q.correctAnswer) score += 1;
    });
    setQuizScore({ obtained: score, total: currentQuiz.questions.length });
  };

  /* ── Derived: answered all questions? ── */
  const allAnswered = currentQuiz
    ? currentQuiz.questions.every(q => selectedAnswers[q._id] !== undefined)
    : false;

  return (
    <div
      className="grid-bg relative overflow-hidden"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* ── Background Decorative Vectors ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {decorations.map(dec => (
          <svg
            key={dec.id}
            viewBox={dec.svg.viewBox}
            preserveAspectRatio="xMidYMid meet"
            className={`absolute blur-[12px] drop-shadow-2xl ${dec.color} ${dec.rotate} ${dec.scale}`}
            style={{ top: dec.top, left: dec.left, width: '200px', height: '200px', transformOrigin: 'center center' }}
          >
            {dec.svg.path}
          </svg>
        ))}
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
          background: 'rgba(7, 20, 24, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-dim)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                position: 'relative',
                width: 34,
                height: 34,
                background: 'var(--bg-surface)',
                border: '1px solid var(--amber-border)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CornerBrackets />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: 'var(--amber)', letterSpacing: '-0.02em' }}>MA</span>
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16, color: 'var(--ink-primary)', letterSpacing: '-0.02em' }}>
              QuizIt
            </span>
          </div>

          {/* Right badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {loading && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.06em' }}
              >
                <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />
                PROCESSING
              </motion.div>
            )}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: 'var(--amber)',
                background: 'var(--amber-muted)',
                border: '1px solid var(--amber-border)',
                borderRadius: 3,
                padding: '3px 8px',
                textTransform: 'uppercase',
              }}
            >
              Assessment Engine
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Layout ─────────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
          padding: '28px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 20,
          position: 'relative',
          zIndex: 1,
        }}
        className="lg-two-col"
      >
        {/* ── Left: Generator + History ─────────────────────────────── */}
        <section
          className="bg-slate-900/75 backdrop-blur-md z-10 relative"
          style={{
            border: '1px solid var(--border-dim)',
            borderRadius: 6,
            padding: '22px',
            alignSelf: 'start',
          }}
        >
          {/* Panel header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Zap size={13} style={{ color: 'var(--amber)' }} />
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--ink-primary)', letterSpacing: '-0.01em' }}>
              Generate Quiz
            </h2>
          </div>

          {/* Source tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-950/80 border border-slate-800/60 backdrop-blur-md px-4 py-2.5 flex items-center gap-3.5 shadow-2xl rounded-full">
              <DockTab active={activeTab === 'text'} onClick={() => setActiveTab('text')} icon={<TextIcon />} tooltip="Raw Text" />
              <DockTab active={activeTab === 'youtube'} onClick={() => setActiveTab('youtube')} icon={<VideoIcon />} tooltip="YouTube Video" />
              <DockTab active={activeTab === 'pdf'} onClick={() => setActiveTab('pdf')} icon={<TrayIcon />} tooltip="PDF Document" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 5 }}>
                Custom Title (optional)
              </label>
              <CyberInput
                type="text"
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
                placeholder="e.g. Data Structures Introduction"
              />
            </div>

            {/* Dynamic source input */}
            <AnimatePresence mode="wait">
              {activeTab === 'text' && (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 5 }}>
                    Source Text
                  </label>
                  <CyberInput
                    as="textarea"
                    rows={7}
                    value={textContent}
                    onChange={e => setTextContent(e.target.value)}
                    placeholder="Paste documentation, notes, or study material here..."
                    style={{ resize: 'none', lineHeight: 1.6 }}
                    required
                  />
                </motion.div>
              )}

              {activeTab === 'youtube' && (
                <motion.div
                  key="youtube"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 5 }}>
                    YouTube URL
                  </label>
                  <CyberInput
                    type="url"
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </motion.div>
              )}

              {activeTab === 'pdf' && (
                <motion.div
                  key="pdf"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 5 }}>
                    PDF Document
                  </label>
                  <label
                    htmlFor="pdf-upload"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      border: '1px dashed var(--border-mid)',
                      borderRadius: 4,
                      background: 'var(--bg-base)',
                      cursor: 'pointer',
                      transition: 'border-color 140ms ease',
                      color: pdfFile ? 'var(--amber)' : 'var(--ink-muted)',
                      fontSize: 13,
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--amber)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
                  >
                    <Upload size={14} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pdfFile ? pdfFile.name : 'Click to select PDF file'}
                    </span>
                  </label>
                  <input
                    id="pdf-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={e => setPdfFile(e.target.files[0])}
                    style={{ display: 'none' }}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question Count Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                NUMBER OF EVALUATION VECTORS
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#e06d25] transition-colors"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* Submit CTA */}
            <GenerateButton loading={loading} />
          </form>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-dim)', margin: '20px 0' }} />

          {/* History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                HISTORY — {quizzes.length} records
              </span>
              {quizzes.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  Clear All
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 260, overflowY: 'auto', paddingRight: 2 }}>
              {quizzes.map(q => (
                <HistoryItem
                  key={q._id}
                  quiz={q}
                  isActive={currentQuiz?._id === q._id}
                  onClick={() => { setCurrentQuiz(q); setQuizScore(null); setSelectedAnswers({}); }}
                />
              ))}
              {quizzes.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--ink-muted)', textAlign: 'center', padding: '20px 0', margin: 0 }}>
                  No historical records yet.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Right: Quiz Workspace ──────────────────────────────────── */}
        <section
          className="bg-slate-900/75 backdrop-blur-md z-10 relative"
          style={{
            border: '1px solid var(--border-dim)',
            borderRadius: 6,
            minHeight: 520,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AnimatePresence mode="wait">
            {currentQuiz ? (
              <motion.div
                key={currentQuiz._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ flex: 1, padding: '22px', display: 'flex', flexDirection: 'column' }}
              >
                {/* Quiz header */}
                <div
                  style={{
                    borderBottom: '1px solid var(--border-dim)',
                    paddingBottom: 16,
                    marginBottom: 24,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <h1 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                      {currentQuiz.title}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--amber)' }}>
                        ACTIVE EVALUATION
                      </span>
                      <span style={{ width: 1, height: 10, background: 'var(--border-dim)' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', color: 'var(--ink-muted)' }}>
                        {currentQuiz.questions?.length ?? 0} VECTORS
                      </span>
                    </div>
                  </div>
                  {quizScore && <ScoreBadge obtained={quizScore.obtained} total={quizScore.total} />}
                </div>

                {/* Questions */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {currentQuiz.questions.map((q, qIndex) => {
                    const userAnswer = selectedAnswers[q._id];
                    return (
                      <motion.div
                        key={q._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: qIndex * 0.04, ease: [0.25, 1, 0.5, 1] }}
                        style={{
                          border: '1px solid var(--border-dim)',
                          borderRadius: 5,
                          padding: '16px',
                          background: 'rgba(7,20,24,0.5)',
                        }}
                      >
                        {/* Question text */}
                        <p style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: 'var(--ink-primary)', lineHeight: 1.55 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)', marginRight: 8 }}>
                            {String(qIndex + 1).padStart(2, '0')}
                          </span>
                          {q.questionText}
                        </p>

                        {/* Options grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                          {q.options.map(option => {
                            const isSelected = userAnswer === option;
                            const isCorrect = quizScore && q.correctAnswer === option;
                            const isWrong = quizScore && isSelected && !isCorrect;
                            return (
                              <OptionButton
                                key={option}
                                option={option}
                                isSelected={isSelected}
                                isCorrect={isCorrect}
                                isWrong={isWrong}
                                disabled={!!quizScore}
                                onClick={() => handleSelectAnswer(q._id, option)}
                              />
                            );
                          })}
                        </div>

                        {/* Explanation (post-submit) */}
                        <AnimatePresence>
                          {quizScore && q.explanation && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div
                                style={{
                                  marginTop: 12,
                                  paddingTop: 12,
                                  borderTop: '1px solid var(--border-dim)',
                                  display: 'flex',
                                  gap: 9,
                                  fontSize: 12,
                                  color: 'var(--ink-body)',
                                  lineHeight: 1.55,
                                }}
                              >
                                <HelpCircle size={13} style={{ color: 'var(--amber)', marginTop: 1, flexShrink: 0 }} />
                                <p style={{ margin: 0 }}>
                                  <strong style={{ color: 'var(--ink-primary)', fontWeight: 600 }}>Explanation: </strong>
                                  {q.explanation}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Submit */}
                {!quizScore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-dim)', display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <SubmitButton onClick={handleSubmitQuiz} disabled={!allAnswered} answeredCount={Object.keys(selectedAnswers).length} totalCount={currentQuiz.questions.length} />
                    {!allAnswered && (
                      <span style={{ fontSize: 12, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                        {Object.keys(selectedAnswers).length}/{currentQuiz.questions.length} answered
                      </span>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* Empty state */
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '60px 32px',
                  gap: 16,
                }}
              >
                <EmptyState />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* ── Responsive two-col grid ── */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-two-col {
            grid-template-columns: 420px 1fr !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ── Generate button with loading state ── */
function GenerateButton({ loading }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '10px 16px',
        border: `1px solid ${loading ? 'var(--border-dim)' : hovered ? 'var(--amber)' : 'var(--amber-border)'}`,
        borderRadius: 4,
        background: loading ? 'var(--bg-elevated)' : hovered ? 'var(--amber-glow)' : 'var(--amber-muted)',
        color: loading ? 'var(--ink-muted)' : 'var(--amber)',
        fontFamily: 'var(--font-ui)',
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '0.01em',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 150ms ease',
        transform: hovered && !loading ? 'translateY(-1px)' : 'none',
        boxShadow: hovered && !loading ? '0 4px 16px var(--amber-glow)' : 'none',
      }}
    >
      {loading ? (
        <>
          <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
          Processing…
        </>
      ) : (
        <>
          <Zap size={13} />
          Build Dynamic Quiz
        </>
      )}
    </button>
  );
}

/* ── Submit quiz button ── */
function SubmitButton({ onClick, disabled, answeredCount, totalCount }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '9px 22px',
        border: `1px solid ${disabled ? 'var(--border-dim)' : hovered ? 'var(--ink-primary)' : 'var(--border-mid)'}`,
        borderRadius: 4,
        background: disabled ? 'transparent' : hovered ? 'var(--ink-primary)' : 'var(--bg-elevated)',
        color: disabled ? 'var(--ink-muted)' : hovered ? 'var(--bg-base)' : 'var(--ink-primary)',
        fontFamily: 'var(--font-ui)',
        fontWeight: 700,
        fontSize: 13,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 150ms ease',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
      }}
    >
      Submit Assessment
    </button>
  );
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <>
      {/* Geometric SVG icon */}
      <div
        style={{
          position: 'relative',
          width: 56,
          height: 56,
          border: '1px solid var(--border-mid)',
          borderRadius: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface)',
        }}
      >
        <CornerBrackets />
        <FileText size={22} style={{ color: 'var(--amber)', opacity: 0.8 }} />
      </div>
      <div>
        <h3 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700, color: 'var(--ink-primary)', letterSpacing: '-0.01em' }}>
          No Active Evaluation
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-muted)', maxWidth: '34ch', lineHeight: 1.55 }}>
          Generate a new quiz or select an existing record from the left panel to begin.
        </p>
      </div>
      {/* Decorative terminal line */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--ink-muted)',
          opacity: 0.5,
          letterSpacing: '0.05em',
        }}
      >
        &gt;_ awaiting input vector
      </div>
    </>
  );
}