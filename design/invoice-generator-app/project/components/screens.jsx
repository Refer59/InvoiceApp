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
