// ui.jsx — Shared design tokens and base components for Ticket POS app
// Inter for UI, JetBrains Mono for ticket preview (mimics thermal print).

const UI_TOKENS = {
  // Neutrals (cool gray)
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF0F3',
  border: '#E4E7EB',
  borderStrong: '#CDD2D8',
  text: '#0F1419',
  textMuted: '#5A6270',
  textFaint: '#8A919C',
  // Accent is injected via CSS var --accent; default set in app
  success: '#1F9D55',
  danger: '#D64545',
  warning: '#C69026',
  // Radii / shadow
  r: { sm: 8, md: 12, lg: 16, xl: 20 },
  // Density
  hit: 48,
};

// Font stacks
const FONT_UI = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace';

// Minimal stroke icon set (outline, 24x24 viewBox). Stroke inherits currentColor.
const Icon = ({ name, size = 22, color, style }) => {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    check: <path d="M5 12l5 5L20 7" />,
    x: <path d="M6 6l12 12M6 18L18 6" />,
    chevron_down: <path d="M6 9l6 6 6-6" />,
    chevron_right: <path d="M9 6l6 6-6 6" />,
    chevron_left: <path d="M15 6l-6 6 6 6" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
    bluetooth: <path d="M7 7l10 10-5 5V2l5 5L7 17" />,
    printer: <><path d="M6 9V3h12v6" /><rect x="4" y="9" width="16" height="9" rx="1" /><path d="M7 14h10v6H7z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
    receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h4" />,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 17l-5-5-9 9" /></>,
    trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
    edit: <path d="M4 20h4l10-10-4-4L4 16v4zM14 6l4 4" />,
    more: <><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>,
    dollar: <path d="M12 3v18M8 7h7a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7" />,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></>,
    arrow_right: <path d="M5 12h14M13 6l6 6-6 6" />,
    arrow_left: <path d="M19 12H5M11 18l-6-6 6-6" />,
    download: <path d="M12 3v12M6 11l6 6 6-6M4 21h16" />,
    upload: <path d="M12 21V9M6 13l6-6 6 6M4 3h16" />,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    zap: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    tag: <><path d="M3 12V3h9l9 9-9 9-9-9z" /><circle cx="8" cy="8" r="1.5" /></>,
    refresh: <path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />,
    wifi: <path d="M2 8.5A15 15 0 0 1 22 8.5M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01" />,
    signal: <path d="M3 21V9M9 21V5M15 21V3M21 21v-6" />,
    battery: <><rect x="2" y="7" width="18" height="10" rx="2" /><path d="M22 10v4" /><rect x="4" y="9" width="12" height="6" fill="currentColor" stroke="none" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M4 16V6a2 2 0 0 1 2-2h10" /></>,
    chart: <path d="M3 21h18M6 18V10M11 18V6M16 18v-5M21 18V8" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={style}>
      {paths[name] || null}
    </svg>
  );
};

// Button — POS style (large, chunky)
const PosButton = ({ children, variant = 'primary', size = 'md', icon, onClick, disabled, full, style = {} }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontFamily: FONT_UI, fontWeight: 600, letterSpacing: -0.1,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: UI_TOKENS.r.md, transition: 'transform .08s, background .15s',
    opacity: disabled ? 0.45 : 1, width: full ? '100%' : 'auto',
    whiteSpace: 'nowrap', userSelect: 'none',
  };
  const sizes = {
    sm: { height: 40, padding: '0 14px', fontSize: 14 },
    md: { height: 52, padding: '0 20px', fontSize: 16 },
    lg: { height: 60, padding: '0 24px', fontSize: 18 },
  };
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff' },
    secondary: { background: UI_TOKENS.surfaceAlt, color: UI_TOKENS.text },
    outline: { background: 'transparent', color: UI_TOKENS.text, boxShadow: `inset 0 0 0 1.5px ${UI_TOKENS.borderStrong}` },
    ghost: { background: 'transparent', color: UI_TOKENS.text },
    danger: { background: UI_TOKENS.danger, color: '#fff' },
    accent_soft: { background: 'var(--accent-soft)', color: 'var(--accent-ink)' },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.97)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = '')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = '')}>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 20} />}
      {children}
    </button>
  );
};

// Collapsible Section
const PosSection = ({ title, subtitle, icon, defaultOpen = false, badge, children, complete }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{
      background: UI_TOKENS.surface,
      borderRadius: UI_TOKENS.r.lg,
      border: `1px solid ${UI_TOKENS.border}`,
      marginBottom: 12, overflow: 'hidden',
    }}>
      <button onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
          fontFamily: FONT_UI, textAlign: 'left',
        }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: complete ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : UI_TOKENS.surfaceAlt,
          color: complete ? 'var(--accent)' : UI_TOKENS.textMuted,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {complete ? <Icon name="check" size={22} /> : <Icon name={icon} size={20} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: UI_TOKENS.text, letterSpacing: -0.1 }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 13, color: UI_TOKENS.textMuted, marginTop: 2 }}>{subtitle}</div>
          )}
        </div>
        {badge !== undefined && badge !== null && (
          <span style={{
            fontSize: 12, fontWeight: 600, background: UI_TOKENS.surfaceAlt, color: UI_TOKENS.textMuted,
            padding: '4px 10px', borderRadius: 100, fontFamily: FONT_UI,
          }}>{badge}</span>
        )}
        <Icon name="chevron_down" size={22}
          style={{ color: UI_TOKENS.textMuted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && (
        <div style={{ padding: '4px 18px 18px', borderTop: `1px solid ${UI_TOKENS.border}` }}>
          {children}
        </div>
      )}
    </div>
  );
};

// Field — text input
const PosField = ({ label, value, placeholder, required, suffix, type = 'text', multiline, compact, onChange }) => {
  return (
    <div style={{ marginBottom: compact ? 10 : 14 }}>
      {label && (
        <div style={{
          fontSize: 13, fontWeight: 500, color: UI_TOKENS.textMuted, marginBottom: 6,
          fontFamily: FONT_UI, letterSpacing: 0.1,
        }}>
          {label}{required && <span style={{ color: UI_TOKENS.danger, marginLeft: 4 }}>*</span>}
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: UI_TOKENS.surfaceAlt,
        borderRadius: UI_TOKENS.r.md,
        border: `1px solid transparent`,
        padding: multiline ? '12px 14px' : '0 14px',
        minHeight: multiline ? 80 : 48,
        fontFamily: FONT_UI,
      }}>
        {multiline ? (
          <textarea value={value || ''} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: FONT_UI, fontSize: 15, color: UI_TOKENS.text, resize: 'none',
              minHeight: 56,
            }} />
        ) : (
          <input type={type} value={value || ''} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: FONT_UI, fontSize: 16, color: UI_TOKENS.text, height: 48,
            }} />
        )}
        {suffix && (
          <span style={{ color: UI_TOKENS.textMuted, fontSize: 14, fontWeight: 500, marginLeft: 8 }}>{suffix}</span>
        )}
      </div>
    </div>
  );
};

// Status bar (Android-ish but content-only)
const PosStatusBar = ({ dark }) => {
  const c = dark ? '#fff' : UI_TOKENS.text;
  return (
    <div style={{
      height: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 18px', fontFamily: FONT_UI, fontSize: 13, fontWeight: 600, color: c,
    }}>
      <div>9:41</div>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <Icon name="signal" size={14} />
        <Icon name="wifi" size={14} />
        <Icon name="battery" size={16} />
      </div>
    </div>
  );
};

// Top bar for screens
const PosTopBar = ({ title, subtitle, leading, trailing, dense }) => (
  <div style={{
    padding: dense ? '10px 16px 12px' : '14px 18px 16px',
    display: 'flex', alignItems: 'center', gap: 12,
    background: UI_TOKENS.surface,
    borderBottom: `1px solid ${UI_TOKENS.border}`,
  }}>
    {leading}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: dense ? 18 : 20, fontWeight: 700, color: UI_TOKENS.text,
        letterSpacing: -0.3, fontFamily: FONT_UI,
      }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: 12, color: UI_TOKENS.textMuted, marginTop: 2, fontFamily: FONT_UI }}>
          {subtitle}
        </div>
      )}
    </div>
    {trailing}
  </div>
);

// Circular icon button — for top bars
const IconButton = ({ name, onClick, size = 44, filled, danger, iconSize = 22 }) => (
  <button onClick={onClick} style={{
    width: size, height: size, borderRadius: '50%', border: 'none', cursor: 'pointer',
    background: filled ? (danger ? UI_TOKENS.danger : 'var(--accent)') : UI_TOKENS.surfaceAlt,
    color: filled ? '#fff' : (danger ? UI_TOKENS.danger : UI_TOKENS.text),
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <Icon name={name} size={iconSize} />
  </button>
);

// Chip — for filters / tags
const Chip = ({ children, active, onClick, icon }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 100,
    border: 'none', cursor: 'pointer',
    fontFamily: FONT_UI, fontSize: 13, fontWeight: 600,
    background: active ? 'var(--accent)' : UI_TOKENS.surfaceAlt,
    color: active ? '#fff' : UI_TOKENS.textMuted,
    whiteSpace: 'nowrap',
  }}>
    {icon && <Icon name={icon} size={14} />}
    {children}
  </button>
);

// KeyValue row — for summaries
const KV = ({ label, value, bold, accent, size = 'md' }) => {
  const s = size === 'lg';
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: s ? '10px 0' : '7px 0',
      fontFamily: FONT_UI,
    }}>
      <span style={{
        fontSize: s ? 16 : 14,
        color: bold ? UI_TOKENS.text : UI_TOKENS.textMuted,
        fontWeight: bold ? 700 : 500,
      }}>{label}</span>
      <span style={{
        fontSize: s ? 20 : 15,
        color: accent ? 'var(--accent)' : UI_TOKENS.text,
        fontWeight: bold ? 700 : 600,
        fontFamily: FONT_MONO, letterSpacing: -0.3,
      }}>{value}</span>
    </div>
  );
};

// Stepper (qty +/-)
const Stepper = ({ value, onChange, min = 1 }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center',
    background: UI_TOKENS.surfaceAlt, borderRadius: UI_TOKENS.r.md,
    padding: 4, gap: 4,
  }}>
    <button onClick={() => onChange(Math.max(min, value - 1))} style={{
      width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
      background: UI_TOKENS.surface, color: UI_TOKENS.text,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}><Icon name="minus" size={16} /></button>
    <div style={{
      minWidth: 38, textAlign: 'center', fontFamily: FONT_MONO,
      fontSize: 16, fontWeight: 700, color: UI_TOKENS.text,
    }}>{value}</div>
    <button onClick={() => onChange(value + 1)} style={{
      width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
      background: 'var(--accent)', color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}><Icon name="plus" size={16} /></button>
  </div>
);

Object.assign(window, {
  UI_TOKENS, FONT_UI, FONT_MONO,
  Icon, PosButton, PosSection, PosField, PosStatusBar, PosTopBar, IconButton, Chip, KV, Stepper,
});
