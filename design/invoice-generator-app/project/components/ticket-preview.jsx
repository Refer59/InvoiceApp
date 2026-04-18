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
