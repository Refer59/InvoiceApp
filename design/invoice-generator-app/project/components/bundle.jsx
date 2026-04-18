
// ===== components/design-canvas.jsx =====

// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// No assets, no deps.

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
};

// ─────────────────────────────────────────────────────────────
// Main canvas — transform-based pan/zoom viewport
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DesignCanvas({ children, minScale = 0.1, maxScale = 8, style = {} }) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({ x: 0, y: 0, scale: 1 });

  const apply = React.useCallback(() => {
    const { x, y, scale } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);

  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;

    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left, py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = (e) =>
      e.deltaMode !== 0 ||
      (e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40);

    const onWheel = (e) => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = (e) => { e.preventDefault(); isGesturing = true; gsBase = tf.current.scale; };
    const onGestureChange = (e) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, (gsBase * e.scale) / tf.current.scale);
    };
    const onGestureEnd = (e) => { e.preventDefault(); isGesturing = false; };

    // Drag-pan: middle button anywhere, or primary button starting on the
    // canvas background (not inside an artboard).
    let drag = null;
    const onPointerDown = (e) => {
      const onBg = e.target === vp || e.target === worldRef.current;
      if (!(e.button === 1 || (e.button === 0 && onBg))) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, lx: e.clientX, ly: e.clientY };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX; drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    vp.addEventListener('wheel', onWheel, { passive: false });
    vp.addEventListener('gesturestart', onGestureStart, { passive: false });
    vp.addEventListener('gesturechange', onGestureChange, { passive: false });
    vp.addEventListener('gestureend', onGestureEnd, { passive: false });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);

  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return (
    <div
      ref={vpRef}
      className="design-canvas"
      style={{
        height: '100vh', width: '100vw',
        background: DC.bg,
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
        position: 'relative',
        fontFamily: DC.font,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        ref={worldRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          transformOrigin: '0 0',
          willChange: 'transform',
          width: 'max-content', minWidth: '100%',
          minHeight: '100%',
          padding: '60px 0 80px',
          backgroundImage: gridSvg,
          backgroundSize: '120px 120px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section — title + subtitle + h-stack of artboards (no wrap)
// ─────────────────────────────────────────────────────────────
function DCSection({ title, subtitle, children, gap = 48 }) {
  return (
    <div style={{ marginBottom: 80, position: 'relative' }}>
      <div style={{ padding: '0 60px 36px' }}>
        <div style={{
          fontSize: 22, fontWeight: 600, color: DC.title,
          letterSpacing: -0.3, marginBottom: 4,
        }}>{title}</div>
        {subtitle && (
          <div style={{
            fontSize: 14, fontWeight: 400, color: DC.subtitle,
          }}>{subtitle}</div>
        )}
      </div>
      {/* h-stack — clips offscreen, never wraps */}
      <div style={{
        display: 'flex', gap, padding: '0 60px',
        alignItems: 'flex-start', width: 'max-content',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Artboard — labeled card
// ─────────────────────────────────────────────────────────────
function DCArtboard({ label, children, width, height, style = {} }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {label && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0,
          paddingBottom: 8,
          fontSize: 12, fontWeight: 500, color: DC.label,
          whiteSpace: 'nowrap',
        }}>{label}</div>
      )}
      <div style={{
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        width, height,
        background: '#fff',
        ...style,
      }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({ children, top, left, right, bottom, rotate = -2, width = 180 }) {
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom, width,
      background: DC.postitBg, padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14, lineHeight: 1.4, color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5,
    }}>{children}</div>
  );
}

Object.assign(window, { DesignCanvas, DCSection, DCArtboard, DCPostIt });



// ===== components/ui.jsx =====
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


// ===== components/data.jsx =====
// data.jsx — Mock state, ticket template, and ESC/POS mock translator

// Ticket template (subset of the user's example_output.json, kept structurally faithful)
const TICKET_TEMPLATE = [
  { TIPO: 'LOGO' }, // our added block — Aspel doesn't have this
  { TIPO: 'TEXTO', ANCHO: 100, ALINEACION: 'C', VALOR: 'RZN_EMPRESA', BOLD: true, SIZE: 'lg' },
  { TIPO: 'TEXTO', ANCHO: 100, ALINEACION: 'C', VALOR: 'DIR_EMPRESA' },
  { TIPO: 'TEXTO', ANCHO: 100, ALINEACION: 'C', TEXTO: 'RFC: ', VALOR: 'RFC_EMPRESA' },
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'TABLA_INFO', FIELDS: [
    ['Sucursal:', 'SUCURSAL'],
    ['Caja No:', 'NOMCAJA'],
    ['Nota de venta:', 'NUMDOCTO'],
    ['Fecha:', 'FECHADOC'],
    ['Hora:', 'HORADOC'],
    ['Atendido por:', 'USUARIO'],
  ]},
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'TABLA_PARTIDAS' },
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'TOTALES' },
  { TIPO: 'DIVISION', TEXTO: '=' },
  { TIPO: 'GRAN_TOTAL' },
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'FORMAS_PAGO' },
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'IMPUESTOS_DET' },
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'MONTO_LETRAS' },
  { TIPO: 'RETCARRO' },
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'TEXTO', ALINEACION: 'C', TEXTO: 'GRACIAS POR SU COMPRA', BOLD: true },
  { TIPO: 'TEXTO', ALINEACION: 'C', TEXTO: 'Vuelva pronto' },
  { TIPO: 'DIVISION', TEXTO: '-' },
];

// Mock sales data
const MOCK_EMPRESA = {
  RZN_EMPRESA: 'ABARROTES LA MERCED',
  DIR_EMPRESA: 'Av. Hidalgo 142, Col. Centro, Monterrey N.L.',
  RFC_EMPRESA: 'AME210512K3A',
  TEL_EMPRESA: 'Tel. 81 1234 5678',
};

const MOCK_DOC = {
  SUCURSAL: 'Matriz Centro',
  NOMCAJA: 'CAJA-01',
  NUMDOCTO: 'NV-000247',
  FECHADOC: '17/04/2026',
  HORADOC: '14:32',
  USUARIO: 'M. López',
};

const MOCK_PARTIDAS = [
  { CANT: 2, CLAVE: 'A101', DESCRIP: 'Coca-Cola 600ml', PREC: 18.50, IMP: 37.00 },
  { CANT: 1, CLAVE: 'B044', DESCRIP: 'Sabritas Original 45g', PREC: 16.00, IMP: 16.00 },
  { CANT: 3, CLAVE: 'C213', DESCRIP: 'Pan Bimbo Integral', PREC: 42.90, IMP: 128.70 },
  { CANT: 1, CLAVE: 'D008', DESCRIP: 'Leche Lala Entera 1L', PREC: 27.50, IMP: 27.50 },
  { CANT: 2, CLAVE: 'E117', DESCRIP: 'Huevo San Juan 18p', PREC: 68.00, IMP: 136.00 },
];

const calcTotals = (partidas) => {
  const subtotal = partidas.reduce((s, p) => s + p.IMP, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const recibido = Math.ceil(total / 50) * 50;
  return {
    SUBTOTAL: subtotal, DESCUENTO: 0, IMPUESTOS: iva,
    IVA: iva, PORIVA: 16,
    TOTALDOC: total, RECIBIDO: recibido, CAMBIODOCTO: recibido - total,
    NUM_VENDIDOS: partidas.reduce((s, p) => s + p.CANT, 0),
  };
};

const formatMoney = (n) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const numeroALetras = (n) => {
  const entero = Math.floor(n);
  const cents = Math.round((n - entero) * 100);
  // Simplified — a real impl would be much longer
  const aproximado = entero < 100 ? '' : entero < 1000 ? 'Trescientos sesenta y' : 'Trescientos cuarenta y cinco';
  return `${aproximado} pesos ${cents.toString().padStart(2, '0')}/100 M.N.`;
};

const MOCK_MONTO_LETRAS = '(Trescientos cuarenta y cinco pesos 20/100 M.N.)';

const MOCK_HISTORY = [
  { id: 'NV-000247', date: '17/04/2026 14:32', items: 9, total: 400.62, user: 'M. López', status: 'printed' },
  { id: 'NV-000246', date: '17/04/2026 13:05', items: 3, total: 84.50, user: 'M. López', status: 'printed' },
  { id: 'NV-000245', date: '17/04/2026 12:48', items: 12, total: 612.00, user: 'R. Díaz', status: 'printed' },
  { id: 'NV-000244', date: '17/04/2026 11:20', items: 5, total: 237.90, user: 'M. López', status: 'failed' },
  { id: 'NV-000243', date: '17/04/2026 10:15', items: 2, total: 55.00, user: 'R. Díaz', status: 'printed' },
  { id: 'NV-000242', date: '16/04/2026 19:47', items: 7, total: 312.40, user: 'M. López', status: 'printed' },
  { id: 'NV-000241', date: '16/04/2026 18:12', items: 4, total: 178.30, user: 'R. Díaz', status: 'printed' },
];

// ─────────────────────────────────────────────────────────────
// Ticket Renderer (58mm / 32 chars)
// Renders a character-grid visualization of what the printer prints.
// ─────────────────────────────────────────────────────────────
const TICKET_COLS = 32;

const padText = (text, width, align = 'I') => {
  text = String(text ?? '');
  if (text.length >= width) return text.slice(0, width);
  const pad = width - text.length;
  if (align === 'D') return ' '.repeat(pad) + text;
  if (align === 'C') {
    const left = Math.floor(pad / 2);
    return ' '.repeat(left) + text + ' '.repeat(pad - left);
  }
  return text + ' '.repeat(pad);
};

const wrap = (text, width) => {
  const words = String(text).split(' ');
  const lines = []; let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > width) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
};

// Builds the receipt as an array of rendered line objects with styling
function renderTicketLines({ empresa, doc, partidas, totales, montoLetras, logo, showLogo = true }) {
  const lines = [];
  const push = (text, opts = {}) => lines.push({ text: padText(text, TICKET_COLS, opts.align || 'I'), ...opts });
  const pushRaw = (text, opts = {}) => lines.push({ text, ...opts });

  for (const block of TICKET_TEMPLATE) {
    switch (block.TIPO) {
      case 'LOGO':
        if (showLogo && logo) lines.push({ logo: true, src: logo });
        break;
      case 'TEXTO': {
        const val = block.VALOR ? (empresa[block.VALOR] || doc[block.VALOR] || '') : '';
        const t = (block.TEXTO || '') + val;
        for (const ln of wrap(t, TICKET_COLS)) {
          push(ln, { align: block.ALINEACION, bold: block.BOLD, size: block.SIZE });
        }
        break;
      }
      case 'DIVISION':
        push((block.TEXTO || '-').repeat(TICKET_COLS));
        break;
      case 'RETCARRO':
        push('');
        break;
      case 'TABLA_INFO':
        for (const [label, key] of block.FIELDS) {
          const left = padText(label, 14, 'I');
          const right = padText(doc[key] || '', TICKET_COLS - 14, 'D');
          pushRaw(left + right);
        }
        break;
      case 'TABLA_PARTIDAS': {
        // Header
        pushRaw(
          padText('Cant', 4, 'I') + ' ' +
          padText('Clave', 5, 'I') + ' ' +
          padText('Descrip.', 13, 'I') + ' ' +
          padText('Importe', 7, 'D'),
          { bold: true }
        );
        push('-'.repeat(TICKET_COLS));
        for (const p of partidas) {
          // First line: cant, clave, descrip (truncated), importe
          const descLines = wrap(p.DESCRIP, 13);
          pushRaw(
            padText(p.CANT, 4, 'D') + ' ' +
            padText(p.CLAVE, 5, 'I') + ' ' +
            padText(descLines[0], 13, 'I') + ' ' +
            padText(formatMoney(p.IMP), 7, 'D')
          );
          // Extra desc lines
          for (let i = 1; i < descLines.length; i++) {
            pushRaw(' '.repeat(11) + padText(descLines[i], 13, 'I'));
          }
          // Unit price line
          pushRaw(' '.repeat(11) + padText(`@ ${formatMoney(p.PREC)}`, 21, 'D'), { muted: true });
        }
        break;
      }
      case 'TOTALES':
        pushRaw(padText('Subtotal:', 16, 'I') + padText(formatMoney(totales.SUBTOTAL), 16, 'D'));
        pushRaw(padText('Descuento:', 16, 'I') + padText(formatMoney(totales.DESCUENTO), 16, 'D'));
        pushRaw(padText('Impuestos:', 16, 'I') + padText(formatMoney(totales.IMPUESTOS), 16, 'D'));
        break;
      case 'GRAN_TOTAL':
        pushRaw(padText('TOTAL:', 16, 'I') + padText(formatMoney(totales.TOTALDOC), 16, 'D'), { bold: true, size: 'lg' });
        pushRaw(padText('Recibido:', 16, 'I') + padText(formatMoney(totales.RECIBIDO), 16, 'D'));
        pushRaw(padText('Cambio:', 16, 'I') + padText(formatMoney(totales.CAMBIODOCTO), 16, 'D'));
        break;
      case 'FORMAS_PAGO':
        pushRaw(padText('Efectivo', 16, 'I') + padText(formatMoney(totales.RECIBIDO), 16, 'D'));
        break;
      case 'IMPUESTOS_DET':
        pushRaw(padText('IVA', 10, 'I') + padText('16%', 10, 'C') + padText(formatMoney(totales.IVA), 12, 'D'));
        pushRaw(padText('Artículos vendidos:', 22, 'I') + padText(String(totales.NUM_VENDIDOS), 10, 'D'));
        break;
      case 'MONTO_LETRAS':
        for (const ln of wrap(montoLetras, TICKET_COLS)) {
          pushRaw(padText(ln, TICKET_COLS, 'I'), { italic: true, muted: true });
        }
        break;
    }
  }
  return lines;
}

// ─────────────────────────────────────────────────────────────
// ESC/POS mock translator — turns our template into hex commands
// Real commands (subset of Epson ESC/POS spec). Values are accurate.
// ─────────────────────────────────────────────────────────────
const ESC_POS = {
  INIT: '1B 40',            // ESC @
  ALIGN_L: '1B 61 00',
  ALIGN_C: '1B 61 01',
  ALIGN_R: '1B 61 02',
  BOLD_ON: '1B 45 01',
  BOLD_OFF: '1B 45 00',
  SIZE_NORM: '1D 21 00',
  SIZE_DBL: '1D 21 11',
  LF: '0A',
  CUT: '1D 56 41 10',
  IMG_RASTER: '1D 76 30 00',  // GS v 0 — raster bit image
};

function toEscPos({ empresa, doc, partidas, totales, montoLetras, showLogo, hasLogo }) {
  const out = [];
  out.push({ hex: ESC_POS.INIT, note: 'Inicializar impresora' });
  if (showLogo && hasLogo) {
    out.push({ hex: ESC_POS.ALIGN_C, note: 'Centrar' });
    out.push({ hex: ESC_POS.IMG_RASTER + ' [raster logo 384x96]', note: 'Imprimir logo (GS v 0)', highlight: true });
    out.push({ hex: ESC_POS.LF, note: '' });
  }
  out.push({ hex: ESC_POS.ALIGN_C, note: 'Centrar' });
  out.push({ hex: ESC_POS.SIZE_DBL + ' ' + ESC_POS.BOLD_ON, note: 'Doble tamaño + negrita' });
  out.push({ hex: strToHex(empresa.RZN_EMPRESA) + ' 0A', note: `"${empresa.RZN_EMPRESA}"`, text: true });
  out.push({ hex: ESC_POS.SIZE_NORM + ' ' + ESC_POS.BOLD_OFF, note: 'Tamaño normal' });
  out.push({ hex: strToHex(empresa.DIR_EMPRESA) + ' 0A', note: `"${empresa.DIR_EMPRESA}"`, text: true });
  out.push({ hex: strToHex('RFC: ' + empresa.RFC_EMPRESA) + ' 0A', note: `"RFC: ${empresa.RFC_EMPRESA}"`, text: true });
  out.push({ hex: ESC_POS.ALIGN_L, note: 'Alinear izquierda' });
  out.push({ hex: strToHex('-'.repeat(32)) + ' 0A', note: 'Separador' });
  out.push({ hex: strToHex(`Nota de venta: ${doc.NUMDOCTO}`) + ' 0A', note: 'Cabecera doc', text: true });
  out.push({ hex: strToHex(`Fecha: ${doc.FECHADOC}  ${doc.HORADOC}`) + ' 0A', note: 'Fecha/hora', text: true });
  out.push({ hex: '... [tabla partidas]', note: `${partidas.length} partidas formateadas`, dim: true });
  out.push({ hex: ESC_POS.BOLD_ON, note: 'Negrita' });
  out.push({ hex: strToHex(`TOTAL: ${formatMoney(totales.TOTALDOC)}`) + ' 0A', note: 'Total', text: true });
  out.push({ hex: ESC_POS.BOLD_OFF, note: '' });
  out.push({ hex: '0A 0A 0A', note: 'Espacios previos al corte' });
  out.push({ hex: ESC_POS.CUT, note: 'Corte parcial (GS V 1)', highlight: true });
  return out;
}

function strToHex(s) {
  return Array.from(new TextEncoder().encode(s))
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

Object.assign(window, {
  TICKET_TEMPLATE, MOCK_EMPRESA, MOCK_DOC, MOCK_PARTIDAS, MOCK_HISTORY, MOCK_MONTO_LETRAS,
  calcTotals, formatMoney, renderTicketLines, toEscPos, strToHex, TICKET_COLS,
});


// ===== components/ticket-preview.jsx =====
// ticket-preview.jsx — Visual renders of the thermal ticket
// Supports 3 preview styles: "paper", "terminal", "minimal"

const TicketPreview = ({ lines, style = 'paper', logo, width = 300, scale = 1 }) => {
  const styles = {
    paper: {
      bg: '#FEFEFB', border: '1px solid #E4E0D3',
      ink: '#1A1A1A', shadow: '0 4px 18px rgba(0,0,0,0.14), 0 1px 2px rgba(0,0,0,0.08)',
      font: FONT_MONO, fontSize: 11, lineHeight: 1.35,
      padding: '18px 16px', textureEl: 'paper',
    },
    terminal: {
      bg: '#0E1418', border: '1px solid #263038',
      ink: '#B4F5C4', shadow: '0 4px 18px rgba(0,0,0,0.25)',
      font: FONT_MONO, fontSize: 11, lineHeight: 1.4,
      padding: '18px 16px', textureEl: 'scanlines',
    },
    minimal: {
      bg: '#FFFFFF', border: `1px solid ${UI_TOKENS.border}`,
      ink: UI_TOKENS.text, shadow: 'none',
      font: FONT_MONO, fontSize: 11, lineHeight: 1.5,
      padding: '16px 14px', textureEl: null,
    },
  };
  const s = styles[style];

  const renderLine = (ln, i) => {
    if (ln.logo) {
      return (
        <div key={i} style={{ textAlign: 'center', padding: '6px 0' }}>
          {ln.src ? (
            <img src={ln.src} style={{ maxWidth: '100%', maxHeight: 60, filter: style === 'terminal' ? 'invert(1) hue-rotate(110deg)' : style === 'paper' ? 'grayscale(1) contrast(1.2)' : 'grayscale(1)' }} />
          ) : (
            <div style={{
              display: 'inline-block', padding: '14px 24px',
              border: `1px dashed ${s.ink}`, opacity: 0.6,
              fontSize: 10,
            }}>[ LOGO ]</div>
          )}
        </div>
      );
    }
    const sizeMul = ln.size === 'lg' ? 1.55 : 1;
    return (
      <div key={i} style={{
        whiteSpace: 'pre',
        fontWeight: ln.bold ? 700 : 400,
        fontStyle: ln.italic ? 'italic' : 'normal',
        opacity: ln.muted ? 0.65 : 1,
        fontSize: s.fontSize * sizeMul,
        lineHeight: sizeMul > 1 ? 1.25 : s.lineHeight,
        letterSpacing: sizeMul > 1 ? 0 : 0,
      }}>{ln.text}</div>
    );
  };

  return (
    <div style={{
      position: 'relative',
      width, margin: '0 auto',
      transform: scale !== 1 ? `scale(${scale})` : 'none',
      transformOrigin: 'top center',
    }}>
      <div style={{
        background: s.bg,
        color: s.ink,
        border: s.border,
        boxShadow: s.shadow,
        fontFamily: s.font,
        padding: s.padding,
        position: 'relative',
        borderRadius: style === 'minimal' ? 12 : 2,
        overflow: 'hidden',
      }}>
        {/* top serration */}
        {style === 'paper' && <div style={{
          position: 'absolute', top: -8, left: 0, right: 0, height: 10,
          backgroundImage: 'radial-gradient(circle at 5px 10px, transparent 4px, #FEFEFB 4px)',
          backgroundSize: '10px 10px', backgroundRepeat: 'repeat-x',
        }} />}
        {/* content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {lines.map(renderLine)}
        </div>
        {/* texture */}
        {s.textureEl === 'scanlines' && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3, opacity: 0.15,
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.2) 0 1px, transparent 1px 3px)',
          }} />
        )}
        {s.textureEl === 'paper' && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 10%, transparent 60%, rgba(0,0,0,0.04))',
          }} />
        )}
        {/* bottom serration */}
        {style === 'paper' && <div style={{
          position: 'absolute', bottom: -8, left: 0, right: 0, height: 10,
          backgroundImage: 'radial-gradient(circle at 5px 0px, transparent 4px, #FEFEFB 4px)',
          backgroundSize: '10px 10px', backgroundRepeat: 'repeat-x',
        }} />}
      </div>
    </div>
  );
};

Object.assign(window, { TicketPreview });


// ===== components/screens.jsx =====
// screens.jsx — Main screens for the POS ticket app

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────
const DashboardScreen = ({ onNavigate, printerStatus }) => {
  const stats = [
    { label: 'Ventas hoy', value: '$4,812.50', delta: '+12%', icon: 'dollar' },
    { label: 'Tickets', value: '23', delta: '+4', icon: 'receipt' },
    { label: 'Promedio', value: '$209.24', delta: null, icon: 'chart' },
  ];
  return (
    <div style={{ flex: 1, overflow: 'auto', background: UI_TOKENS.bg }}>
      <div style={{ padding: '16px 18px 8px' }}>
        <div style={{ fontSize: 13, color: UI_TOKENS.textMuted, fontFamily: FONT_UI }}>Buen día,</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: UI_TOKENS.text, letterSpacing: -0.5, fontFamily: FONT_UI }}>
          M. López
        </div>
        <div style={{ fontSize: 13, color: UI_TOKENS.textMuted, marginTop: 4, fontFamily: FONT_UI }}>
          Caja-01 · Matriz Centro · vie 17 abr
        </div>
      </div>

      {/* Printer status pill */}
      <div style={{ padding: '0 18px 14px' }}>
        <div style={{
          background: printerStatus === 'connected' ? 'color-mix(in oklab, var(--accent) 10%, white)' : UI_TOKENS.surfaceAlt,
          borderRadius: UI_TOKENS.r.lg, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          border: `1px solid ${printerStatus === 'connected' ? 'color-mix(in oklab, var(--accent) 30%, transparent)' : UI_TOKENS.border}`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: printerStatus === 'connected' ? 'var(--accent)' : UI_TOKENS.borderStrong,
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="bluetooth" size={18} /></div>
          <div style={{ flex: 1, fontFamily: FONT_UI }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: UI_TOKENS.text }}>
              {printerStatus === 'connected' ? 'PT-210 conectada' : 'Sin impresora'}
            </div>
            <div style={{ fontSize: 12, color: UI_TOKENS.textMuted }}>
              {printerStatus === 'connected' ? 'Térmica 58mm · 92% batería' : 'Toca para emparejar'}
            </div>
          </div>
          <Icon name="chevron_right" size={20} style={{ color: UI_TOKENS.textMuted }} />
        </div>
      </div>

      {/* Primary CTA */}
      <div style={{ padding: '0 18px 16px' }}>
        <button onClick={() => onNavigate?.('new')} style={{
          width: '100%', height: 76, border: 'none', cursor: 'pointer',
          background: 'var(--accent)', color: '#fff',
          borderRadius: UI_TOKENS.r.lg,
          display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px',
          boxShadow: '0 6px 18px color-mix(in oklab, var(--accent) 30%, transparent)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="plus" size={26} /></div>
          <div style={{ flex: 1, textAlign: 'left', fontFamily: FONT_UI }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.2 }}>Nueva nota de venta</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Registrar y imprimir ticket</div>
          </div>
          <Icon name="arrow_right" size={22} />
        </button>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 18px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: UI_TOKENS.surface, borderRadius: UI_TOKENS.r.md,
            border: `1px solid ${UI_TOKENS.border}`, padding: '12px 10px',
            fontFamily: FONT_UI,
          }}>
            <div style={{ fontSize: 11, color: UI_TOKENS.textMuted, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: UI_TOKENS.text, marginTop: 4, fontFamily: FONT_MONO, letterSpacing: -0.4 }}>
              {s.value}
            </div>
            {s.delta && <div style={{ fontSize: 11, color: UI_TOKENS.success, marginTop: 2, fontWeight: 600 }}>{s.delta}</div>}
          </div>
        ))}
      </div>

      {/* Quick actions grid */}
      <div style={{ padding: '0 18px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: UI_TOKENS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: FONT_UI, marginBottom: 8 }}>
          Accesos rápidos
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Historial', icon: 'history', to: 'history' },
            { label: 'Impresora', icon: 'printer', to: 'printer' },
            { label: 'Empresa', icon: 'building', to: 'empresa' },
            { label: 'Ajustes', icon: 'settings', to: 'settings' },
          ].map((a, i) => (
            <button key={i} onClick={() => onNavigate?.(a.to)} style={{
              background: UI_TOKENS.surface, border: `1px solid ${UI_TOKENS.border}`,
              borderRadius: UI_TOKENS.r.md, padding: '16px 14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: FONT_UI, textAlign: 'left',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'color-mix(in oklab, var(--accent) 14%, white)',
                color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon name={a.icon} size={20} /></div>
              <div style={{ fontSize: 15, fontWeight: 600, color: UI_TOKENS.text }}>{a.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent tickets */}
      <div style={{ padding: '0 18px 24px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: UI_TOKENS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: FONT_UI, marginBottom: 8 }}>
          Últimos tickets
        </div>
        <div style={{ background: UI_TOKENS.surface, borderRadius: UI_TOKENS.r.md, border: `1px solid ${UI_TOKENS.border}`, overflow: 'hidden' }}>
          {MOCK_HISTORY.slice(0, 3).map((t, i) => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderTop: i === 0 ? 'none' : `1px solid ${UI_TOKENS.border}`,
              fontFamily: FONT_UI,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: t.status === 'failed' ? 'color-mix(in oklab, #D64545 14%, white)' : UI_TOKENS.surfaceAlt,
                color: t.status === 'failed' ? UI_TOKENS.danger : UI_TOKENS.textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon name={t.status === 'failed' ? 'x' : 'receipt'} size={16} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: UI_TOKENS.text }}>{t.id}</div>
                <div style={{ fontSize: 12, color: UI_TOKENS.textMuted }}>
                  {t.date.split(' ')[1]} · {t.items} art. · {t.user}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: FONT_MONO, color: UI_TOKENS.text }}>
                {formatMoney(t.total)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// New Ticket (collapsible form)
// ─────────────────────────────────────────────────────────────
const NewTicketScreen = ({ state, setState, onNavigate, variant = 'collapsible' }) => {
  const totales = calcTotals(state.partidas);

  const renderPartidas = () => (
    <>
      {state.partidas.length === 0 ? (
        <div style={{
          padding: '22px 14px', borderRadius: 10, border: `1.5px dashed ${UI_TOKENS.borderStrong}`,
          textAlign: 'center', color: UI_TOKENS.textMuted, fontSize: 13, fontFamily: FONT_UI,
        }}>
          Aún no hay partidas. Toca + Agregar para comenzar.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {state.partidas.map((p, i) => (
            <div key={i} style={{
              background: UI_TOKENS.surfaceAlt, borderRadius: UI_TOKENS.r.md,
              padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: FONT_UI,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: UI_TOKENS.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.DESCRIP}
                </div>
                <div style={{ fontSize: 12, color: UI_TOKENS.textMuted, fontFamily: FONT_MONO, marginTop: 2 }}>
                  {p.CLAVE} · {p.CANT} × {formatMoney(p.PREC)}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: UI_TOKENS.text, fontFamily: FONT_MONO }}>
                {formatMoney(p.IMP)}
              </div>
              <button onClick={() => setState({ ...state, partidas: state.partidas.filter((_, j) => j !== i) })}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  background: 'transparent', color: UI_TOKENS.danger, cursor: 'pointer',
                }}><Icon name="trash" size={16} /></button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => onNavigate?.('addItem')} style={{
        width: '100%', marginTop: 10,
        height: 48, border: `1.5px dashed var(--accent)`, background: 'transparent',
        color: 'var(--accent)', borderRadius: UI_TOKENS.r.md,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: FONT_UI,
      }}><Icon name="plus" size={18} /> Agregar partida</button>
    </>
  );

  const renderCliente = () => (
    <>
      <PosField label="Nombre o razón social" value={state.cliente.nombre} placeholder="Público en general"
        onChange={(v) => setState({ ...state, cliente: { ...state.cliente, nombre: v } })} />
      <PosField label="RFC" value={state.cliente.rfc} placeholder="XAXX010101000"
        onChange={(v) => setState({ ...state, cliente: { ...state.cliente, rfc: v } })} />
    </>
  );

  const renderDoc = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <PosField label="Número" value={state.doc.NUMDOCTO} compact
          onChange={(v) => setState({ ...state, doc: { ...state.doc, NUMDOCTO: v } })} />
        <PosField label="Caja" value={state.doc.NOMCAJA} compact
          onChange={(v) => setState({ ...state, doc: { ...state.doc, NOMCAJA: v } })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <PosField label="Fecha" value={state.doc.FECHADOC} compact
          onChange={(v) => setState({ ...state, doc: { ...state.doc, FECHADOC: v } })} />
        <PosField label="Hora" value={state.doc.HORADOC} compact
          onChange={(v) => setState({ ...state, doc: { ...state.doc, HORADOC: v } })} />
      </div>
      <PosField label="Atendido por" value={state.doc.USUARIO}
        onChange={(v) => setState({ ...state, doc: { ...state.doc, USUARIO: v } })} />
    </>
  );

  const renderPagos = () => (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {['Efectivo', 'Tarjeta', 'Transferencia'].map((m, i) => (
          <Chip key={m} active={i === 0} icon={m === 'Tarjeta' ? 'card' : m === 'Efectivo' ? 'dollar' : 'zap'}>{m}</Chip>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <PosField label="Recibido" value={totales.RECIBIDO.toFixed(2)} suffix="MXN" compact />
        <PosField label="Cambio" value={totales.CAMBIODOCTO.toFixed(2)} suffix="MXN" compact />
      </div>
    </>
  );

  // Variant: "collapsible" (default), "single" (todo visible), "tabs"
  if (variant === 'single') {
    return (
      <div style={{ flex: 1, overflow: 'auto', background: UI_TOKENS.bg }}>
        <div style={{ padding: 14 }}>
          <FlatSection title="Datos del documento">{renderDoc()}</FlatSection>
          <FlatSection title="Cliente">{renderCliente()}</FlatSection>
          <FlatSection title={`Partidas (${state.partidas.length})`}>{renderPartidas()}</FlatSection>
          <FlatSection title="Pago">{renderPagos()}</FlatSection>
          <TotalsBar totales={totales} onPreview={() => onNavigate?.('preview')} />
        </div>
      </div>
    );
  }

  if (variant === 'tabs') {
    return <TabsFormVariant state={state} setState={setState} onNavigate={onNavigate} totales={totales}
      renderDoc={renderDoc} renderCliente={renderCliente} renderPartidas={renderPartidas} renderPagos={renderPagos} />;
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', background: UI_TOKENS.bg, paddingBottom: 130 }}>
      <div style={{ padding: 14 }}>
        <PosSection title="Datos del documento" subtitle={`${state.doc.NUMDOCTO} · ${state.doc.FECHADOC}`}
          icon="receipt" defaultOpen complete>
          {renderDoc()}
        </PosSection>
        <PosSection title="Cliente" subtitle={state.cliente.nombre || 'Público en general'}
          icon="user" complete={!!state.cliente.nombre}>
          {renderCliente()}
        </PosSection>
        <PosSection title="Partidas" subtitle={`${state.partidas.length} artículo${state.partidas.length === 1 ? '' : 's'} · ${formatMoney(totales.SUBTOTAL)}`}
          icon="tag" badge={state.partidas.length} defaultOpen complete={state.partidas.length > 0}>
          {renderPartidas()}
        </PosSection>
        <PosSection title="Forma de pago" subtitle="Efectivo"
          icon="dollar" complete={state.partidas.length > 0}>
          {renderPagos()}
        </PosSection>
      </div>
      <TotalsBar totales={totales} onPreview={() => onNavigate?.('preview')} fixed />
    </div>
  );
};

const FlatSection = ({ title, children }) => (
  <div style={{
    background: UI_TOKENS.surface, borderRadius: UI_TOKENS.r.lg,
    border: `1px solid ${UI_TOKENS.border}`, padding: 16, marginBottom: 10,
  }}>
    <div style={{
      fontSize: 12, fontWeight: 700, color: UI_TOKENS.textMuted, textTransform: 'uppercase',
      letterSpacing: 0.8, marginBottom: 10, fontFamily: FONT_UI,
    }}>{title}</div>
    {children}
  </div>
);

const TabsFormVariant = ({ state, setState, onNavigate, totales, renderDoc, renderCliente, renderPartidas, renderPagos }) => {
  const [tab, setTab] = React.useState('partidas');
  const tabs = [
    { id: 'doc', label: 'Doc', icon: 'receipt' },
    { id: 'cliente', label: 'Cliente', icon: 'user' },
    { id: 'partidas', label: 'Partidas', icon: 'tag', badge: state.partidas.length },
    { id: 'pago', label: 'Pago', icon: 'dollar' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: UI_TOKENS.bg }}>
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
        background: UI_TOKENS.surface, borderBottom: `1px solid ${UI_TOKENS.border}`,
      }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 4px', border: 'none', cursor: 'pointer',
            background: 'transparent', position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            fontFamily: FONT_UI, fontSize: 12, fontWeight: 600,
            color: tab === t.id ? 'var(--accent)' : UI_TOKENS.textMuted,
          }}>
            <Icon name={t.icon} size={20} />
            {t.label}
            {t.badge ? <span style={{
              position: 'absolute', top: 4, right: '30%',
              background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700,
              borderRadius: 100, minWidth: 16, height: 16, padding: '0 4px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>{t.badge}</span> : null}
            {tab === t.id && <div style={{ position: 'absolute', bottom: 0, left: '25%', right: '25%', height: 2, background: 'var(--accent)' }} />}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
        <FlatSection title={tabs.find(t => t.id === tab).label}>
          {tab === 'doc' && renderDoc()}
          {tab === 'cliente' && renderCliente()}
          {tab === 'partidas' && renderPartidas()}
          {tab === 'pago' && renderPagos()}
        </FlatSection>
      </div>
      <TotalsBar totales={totales} onPreview={() => onNavigate?.('preview')} />
    </div>
  );
};

const TotalsBar = ({ totales, onPreview, fixed }) => (
  <div style={{
    position: fixed ? 'absolute' : 'relative',
    bottom: fixed ? 24 : 'auto', left: 0, right: 0,
    padding: '10px 14px', background: UI_TOKENS.surface,
    borderTop: `1px solid ${UI_TOKENS.border}`,
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
      fontFamily: FONT_UI,
    }}>
      <div>
        <div style={{ fontSize: 11, color: UI_TOKENS.textMuted, fontWeight: 500 }}>TOTAL</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: UI_TOKENS.text, fontFamily: FONT_MONO, letterSpacing: -0.8, lineHeight: 1 }}>
          {formatMoney(totales.TOTALDOC)}
        </div>
      </div>
      <div style={{ textAlign: 'right', fontFamily: FONT_UI }}>
        <div style={{ fontSize: 11, color: UI_TOKENS.textMuted }}>Subtotal {formatMoney(totales.SUBTOTAL)}</div>
        <div style={{ fontSize: 11, color: UI_TOKENS.textMuted }}>IVA 16% {formatMoney(totales.IVA)}</div>
      </div>
    </div>
    <PosButton full size="lg" icon="eye" onClick={onPreview}>
      Vista previa e imprimir
    </PosButton>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Add Item (bottom-sheet-like form)
// ─────────────────────────────────────────────────────────────
const AddItemScreen = ({ onAdd, onCancel }) => {
  const [item, setItem] = React.useState({ CANT: 1, CLAVE: '', DESCRIP: '', PREC: '' });
  const suggestions = [
    { CLAVE: 'A101', DESCRIP: 'Coca-Cola 600ml', PREC: 18.50 },
    { CLAVE: 'B044', DESCRIP: 'Sabritas Original 45g', PREC: 16.00 },
    { CLAVE: 'C213', DESCRIP: 'Pan Bimbo Integral', PREC: 42.90 },
    { CLAVE: 'F001', DESCRIP: 'Galletas Marías 170g', PREC: 24.50 },
  ];
  const valid = item.DESCRIP && item.PREC && Number(item.PREC) > 0;

  return (
    <div style={{ flex: 1, overflow: 'auto', background: UI_TOKENS.bg, paddingBottom: 90 }}>
      <div style={{ padding: 14 }}>
        <FlatSection title="Buscar producto">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: UI_TOKENS.surfaceAlt, borderRadius: UI_TOKENS.r.md, padding: '0 14px', height: 48,
          }}>
            <Icon name="search" size={18} color={UI_TOKENS.textMuted} />
            <input placeholder="Clave, código o nombre…" style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: FONT_UI, fontSize: 15,
            }} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {suggestions.map((s) => (
              <button key={s.CLAVE} onClick={() => setItem({ ...item, ...s })} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: item.CLAVE === s.CLAVE ? 'color-mix(in oklab, var(--accent) 10%, white)' : 'transparent',
                border: `1px solid ${item.CLAVE === s.CLAVE ? 'var(--accent)' : UI_TOKENS.border}`,
                borderRadius: UI_TOKENS.r.md, cursor: 'pointer', textAlign: 'left',
                fontFamily: FONT_UI,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, background: UI_TOKENS.surfaceAlt,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: UI_TOKENS.textMuted,
                }}>{s.CLAVE}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: UI_TOKENS.text }}>{s.DESCRIP}</div>
                </div>
                <div style={{ fontFamily: FONT_MONO, fontWeight: 700, color: UI_TOKENS.text }}>{formatMoney(s.PREC)}</div>
              </button>
            ))}
          </div>
        </FlatSection>

        <FlatSection title="Detalles">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <PosField label="Clave" value={item.CLAVE} compact onChange={(v) => setItem({ ...item, CLAVE: v })} />
            <PosField label="Precio unit." value={item.PREC} suffix="MXN" type="number" compact
              onChange={(v) => setItem({ ...item, PREC: v })} />
          </div>
          <PosField label="Descripción" value={item.DESCRIP}
            onChange={(v) => setItem({ ...item, DESCRIP: v })} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: UI_TOKENS.textMuted, fontFamily: FONT_UI }}>Cantidad</div>
            <Stepper value={item.CANT} onChange={(v) => setItem({ ...item, CANT: v })} />
          </div>
        </FlatSection>

        <div style={{
          background: 'color-mix(in oklab, var(--accent) 10%, white)',
          borderRadius: UI_TOKENS.r.lg, padding: 14, fontFamily: FONT_UI,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 13, color: UI_TOKENS.textMuted, fontWeight: 500 }}>Importe</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: UI_TOKENS.text, fontFamily: FONT_MONO }}>
            {formatMoney((Number(item.PREC) || 0) * item.CANT)}
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 24, left: 0, right: 0, padding: '10px 14px',
        background: UI_TOKENS.surface, borderTop: `1px solid ${UI_TOKENS.border}`,
        display: 'flex', gap: 8,
      }}>
        <PosButton variant="outline" onClick={onCancel}>Cancelar</PosButton>
        <PosButton full disabled={!valid} icon="plus" onClick={() => onAdd({
          CANT: Number(item.CANT), CLAVE: item.CLAVE || 'SIN',
          DESCRIP: item.DESCRIP, PREC: Number(item.PREC),
          IMP: Number(item.PREC) * Number(item.CANT),
        })}>Agregar al ticket</PosButton>
      </div>
    </div>
  );
};

Object.assign(window, { DashboardScreen, NewTicketScreen, AddItemScreen, TotalsBar, FlatSection });


// ===== components/screens2.jsx =====
// screens2.jsx — Preview, Print, Printer settings, History screens

// ─────────────────────────────────────────────────────────────
// Preview + ESC/POS screen
// ─────────────────────────────────────────────────────────────
const PreviewScreen = ({ state, onNavigate, ticketStyle = 'paper', setShowLogo, showLogo }) => {
  const [showEscpos, setShowEscpos] = React.useState(false);
  const totales = calcTotals(state.partidas);
  const lines = renderTicketLines({
    empresa: state.empresa, doc: state.doc, partidas: state.partidas,
    totales, montoLetras: MOCK_MONTO_LETRAS, logo: state.logo, showLogo,
  });
  const escpos = toEscPos({ empresa: state.empresa, doc: state.doc, partidas: state.partidas,
    totales, montoLetras: MOCK_MONTO_LETRAS, showLogo, hasLogo: !!state.logo });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: ticketStyle === 'terminal' ? '#0A0E10' : '#E9EBEE' }}>
      {/* Toggle row */}
      <div style={{
        padding: '10px 14px', display: 'flex', gap: 6,
        background: UI_TOKENS.surface, borderBottom: `1px solid ${UI_TOKENS.border}`,
      }}>
        <div style={{ display: 'flex', gap: 6, background: UI_TOKENS.surfaceAlt, padding: 4, borderRadius: 100, flex: 1 }}>
          <button onClick={() => setShowEscpos(false)} style={{
            flex: 1, height: 36, border: 'none', borderRadius: 100, cursor: 'pointer',
            background: !showEscpos ? UI_TOKENS.surface : 'transparent',
            color: UI_TOKENS.text, fontFamily: FONT_UI, fontWeight: 600, fontSize: 13,
            boxShadow: !showEscpos ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
          }}>Papel</button>
          <button onClick={() => setShowEscpos(true)} style={{
            flex: 1, height: 36, border: 'none', borderRadius: 100, cursor: 'pointer',
            background: showEscpos ? UI_TOKENS.surface : 'transparent',
            color: UI_TOKENS.text, fontFamily: FONT_UI, fontWeight: 600, fontSize: 13,
            boxShadow: showEscpos ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
          }}>ESC/POS</button>
        </div>
        <button onClick={() => setShowLogo(!showLogo)} style={{
          height: 44, padding: '0 12px', border: `1.5px solid ${showLogo ? 'var(--accent)' : UI_TOKENS.border}`,
          background: showLogo ? 'color-mix(in oklab, var(--accent) 12%, white)' : UI_TOKENS.surface,
          color: showLogo ? 'var(--accent)' : UI_TOKENS.textMuted,
          borderRadius: 100, cursor: 'pointer',
          fontFamily: FONT_UI, fontSize: 12, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name="image" size={14} /> Logo
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: showEscpos ? 0 : '20px 14px' }}>
        {!showEscpos ? (
          <TicketPreview lines={lines} style={ticketStyle} logo={state.logo} width={300} />
        ) : (
          <EscPosViewer commands={escpos} />
        )}
      </div>

      <div style={{ padding: '10px 14px', background: UI_TOKENS.surface, borderTop: `1px solid ${UI_TOKENS.border}`, display: 'flex', gap: 8 }}>
        <PosButton variant="outline" icon="arrow_left" onClick={() => onNavigate?.('new')}>Editar</PosButton>
        <PosButton full size="lg" icon="printer" onClick={() => onNavigate?.('printing')}>Imprimir</PosButton>
      </div>
    </div>
  );
};

const EscPosViewer = ({ commands }) => (
  <div style={{
    background: '#0E1418', color: '#B8C5D1', height: '100%', overflow: 'auto',
    fontFamily: FONT_MONO, fontSize: 11, lineHeight: 1.5,
  }}>
    <div style={{
      padding: '10px 14px', background: '#1A232B', color: '#7B8A98',
      fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
      display: 'flex', justifyContent: 'space-between',
      borderBottom: '1px solid #263038',
    }}>
      <span>ESC/POS · Epson-compat</span>
      <span style={{ color: '#7B8A98' }}>{commands.length} comandos</span>
    </div>
    <div style={{ padding: '8px 0' }}>
      {commands.map((c, i) => (
        <div key={i} style={{
          padding: '4px 14px', display: 'grid', gridTemplateColumns: '1fr auto',
          gap: 10, alignItems: 'start',
          background: c.highlight ? 'rgba(255, 196, 88, 0.06)' : 'transparent',
          borderLeft: c.highlight ? '2px solid #FFC458' : '2px solid transparent',
          opacity: c.dim ? 0.6 : 1,
        }}>
          <div style={{ color: c.text ? '#B4F5C4' : c.highlight ? '#FFC458' : '#B8C5D1', wordBreak: 'break-all' }}>
            {c.hex}
          </div>
          <div style={{ color: '#6E7A86', fontSize: 10, whiteSpace: 'nowrap' }}>{c.note}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Printing status (Bluetooth send)
// ─────────────────────────────────────────────────────────────
const PrintingScreen = ({ onDone, onCancel, phase = 'sending' }) => {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: UI_TOKENS.bg, textAlign: 'center', fontFamily: FONT_UI,
    }}>
      {phase === 'sending' && (
        <>
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            background: 'color-mix(in oklab, var(--accent) 14%, white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: -10, borderRadius: '50%',
              border: '3px solid var(--accent)', borderTopColor: 'transparent',
              animation: 'spin 1.2s linear infinite',
            }} />
            <Icon name="printer" size={56} color="var(--accent)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: UI_TOKENS.text, letterSpacing: -0.3 }}>Enviando a impresora…</div>
          <div style={{ fontSize: 14, color: UI_TOKENS.textMuted, marginTop: 8, maxWidth: 280 }}>
            Convirtiendo ticket a ESC/POS y transmitiendo por Bluetooth a <b>PT-210</b>
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6, width: 280 }}>
            <StepRow done label="Generando plantilla" />
            <StepRow done label="Codificando logo (raster)" />
            <StepRow active label="Enviando por Bluetooth" />
            <StepRow label="Corte de papel" />
          </div>
          <button onClick={onCancel} style={{
            marginTop: 24, background: 'transparent', border: 'none',
            color: UI_TOKENS.danger, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: FONT_UI,
          }}>Cancelar</button>
        </>
      )}
      {phase === 'done' && (
        <>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Icon name="check" size={56} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: UI_TOKENS.text }}>Ticket impreso</div>
          <div style={{ fontSize: 14, color: UI_TOKENS.textMuted, marginTop: 6 }}>NV-000248 · {formatMoney(345.20)}</div>
          <div style={{ marginTop: 28, display: 'flex', gap: 8 }}>
            <PosButton variant="outline" icon="copy">Reimprimir</PosButton>
            <PosButton icon="plus" onClick={onDone}>Nuevo ticket</PosButton>
          </div>
        </>
      )}
    </div>
  );
};

const StepRow = ({ label, active, done }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT_UI,
    fontSize: 13, padding: '6px 10px', borderRadius: 8,
    background: active ? UI_TOKENS.surface : 'transparent',
    border: `1px solid ${active ? UI_TOKENS.border : 'transparent'}`,
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      background: done ? 'var(--accent)' : active ? 'var(--accent-soft)' : UI_TOKENS.surfaceAlt,
      color: done ? '#fff' : 'var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {done ? <Icon name="check" size={12} /> : active ? (
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s infinite' }} />
      ) : null}
    </div>
    <div style={{
      color: done ? UI_TOKENS.text : active ? UI_TOKENS.text : UI_TOKENS.textMuted,
      fontWeight: active || done ? 600 : 500,
    }}>{label}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Printer settings / Bluetooth pairing
// ─────────────────────────────────────────────────────────────
const PrinterScreen = ({ connectedId = 'pt210', onConnect }) => {
  const devices = [
    { id: 'pt210', name: 'PT-210', detail: 'Térmica 58mm · Emparejada', rssi: 4, battery: 92 },
    { id: 'xp80', name: 'XPrinter XP-80', detail: 'Térmica 80mm · Disponible', rssi: 3 },
    { id: 'bxl', name: 'Bixolon SPP-R200', detail: 'Portátil · Disponible', rssi: 2 },
    { id: 'star', name: 'Star TSP100', detail: 'Disponible', rssi: 1 },
  ];
  return (
    <div style={{ flex: 1, overflow: 'auto', background: UI_TOKENS.bg }}>
      <div style={{ padding: 14 }}>
        <div style={{
          background: 'var(--accent)', color: '#fff',
          borderRadius: UI_TOKENS.r.lg, padding: 18, fontFamily: FONT_UI,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="printer" size={26} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>PT-210 conectada</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Térmica 58mm · 92% batería</div>
            </div>
            <div style={{
              width: 12, height: 12, borderRadius: '50%', background: '#A8F5B4',
              boxShadow: '0 0 0 4px rgba(168,245,180,0.28)',
            }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
            {[['Ancho', '58 mm'], ['Chars', '32'], ['Códec', 'CP850']].map(([k, v]) => (
              <div key={k} style={{ background: 'rgba(255,255,255,0.16)', borderRadius: 10, padding: '8px 10px' }}>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: FONT_MONO }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <PosButton full variant="secondary" icon="zap">Imprimir prueba</PosButton>
          <PosButton full variant="outline" icon="x" danger>Olvidar</PosButton>
        </div>

        <div style={{
          fontSize: 12, fontWeight: 700, color: UI_TOKENS.textMuted, textTransform: 'uppercase',
          letterSpacing: 0.8, fontFamily: FONT_UI, margin: '20px 0 10px 4px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          Dispositivos cercanos
          <div style={{
            width: 12, height: 12, borderRadius: '50%', border: '1.5px solid var(--accent)',
            borderTopColor: 'transparent', animation: 'spin 1s linear infinite',
          }} />
        </div>
        <div style={{ background: UI_TOKENS.surface, borderRadius: UI_TOKENS.r.md, border: `1px solid ${UI_TOKENS.border}`, overflow: 'hidden' }}>
          {devices.slice(1).map((d, i) => (
            <button key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 14px', width: '100%', background: 'none', border: 'none',
              borderTop: i === 0 ? 'none' : `1px solid ${UI_TOKENS.border}`,
              cursor: 'pointer', textAlign: 'left', fontFamily: FONT_UI,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: UI_TOKENS.surfaceAlt,
                color: UI_TOKENS.textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon name="bluetooth" size={18} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: UI_TOKENS.text }}>{d.name}</div>
                <div style={{ fontSize: 12, color: UI_TOKENS.textMuted }}>{d.detail}</div>
              </div>
              {/* RSSI bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                {[1, 2, 3, 4].map(b => (
                  <div key={b} style={{
                    width: 3, height: 4 + b * 3,
                    background: b <= d.rssi ? UI_TOKENS.text : UI_TOKENS.borderStrong,
                    borderRadius: 1,
                  }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// History
// ─────────────────────────────────────────────────────────────
const HistoryScreen = () => {
  const [filter, setFilter] = React.useState('all');
  const list = filter === 'failed' ? MOCK_HISTORY.filter(t => t.status === 'failed') : MOCK_HISTORY;
  const grouped = {};
  for (const t of list) {
    const day = t.date.split(' ')[0];
    (grouped[day] = grouped[day] || []).push(t);
  }
  return (
    <div style={{ flex: 1, overflow: 'auto', background: UI_TOKENS.bg }}>
      <div style={{ padding: '12px 14px', background: UI_TOKENS.surface, borderBottom: `1px solid ${UI_TOKENS.border}` }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: UI_TOKENS.surfaceAlt, borderRadius: UI_TOKENS.r.md, padding: '0 14px', height: 44,
        }}>
          <Icon name="search" size={18} color={UI_TOKENS.textMuted} />
          <input placeholder="Buscar por número, cliente…" style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontFamily: FONT_UI, fontSize: 14,
          }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto' }}>
          {[['all', 'Todos'], ['today', 'Hoy'], ['week', 'Esta semana'], ['failed', 'Fallidos']].map(([id, label]) => (
            <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>{label}</Chip>
          ))}
        </div>
      </div>

      <div style={{ padding: 14 }}>
        {Object.entries(grouped).map(([day, items]) => (
          <div key={day} style={{ marginBottom: 14 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: UI_TOKENS.textMuted, textTransform: 'uppercase',
              letterSpacing: 0.8, fontFamily: FONT_UI, marginBottom: 8, padding: '0 4px',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{day}</span>
              <span style={{ fontFamily: FONT_MONO, letterSpacing: 0 }}>
                {formatMoney(items.reduce((s, t) => s + t.total, 0))}
              </span>
            </div>
            <div style={{ background: UI_TOKENS.surface, borderRadius: UI_TOKENS.r.md, border: `1px solid ${UI_TOKENS.border}`, overflow: 'hidden' }}>
              {items.map((t, i) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderTop: i === 0 ? 'none' : `1px solid ${UI_TOKENS.border}`,
                  fontFamily: FONT_UI,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: t.status === 'failed' ? 'color-mix(in oklab, #D64545 14%, white)' : 'color-mix(in oklab, var(--accent) 12%, white)',
                    color: t.status === 'failed' ? UI_TOKENS.danger : 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon name={t.status === 'failed' ? 'x' : 'receipt'} size={16} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: UI_TOKENS.text, fontFamily: FONT_MONO }}>{t.id}</div>
                    <div style={{ fontSize: 12, color: UI_TOKENS.textMuted }}>
                      {t.date.split(' ')[1]} · {t.items} art. · {t.user}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: FONT_MONO, color: UI_TOKENS.text }}>
                      {formatMoney(t.total)}
                    </div>
                    {t.status === 'failed' && (
                      <div style={{ fontSize: 11, color: UI_TOKENS.danger, fontWeight: 600 }}>Error BT</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { PreviewScreen, PrintingScreen, PrinterScreen, HistoryScreen, EscPosViewer });

