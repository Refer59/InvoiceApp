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
