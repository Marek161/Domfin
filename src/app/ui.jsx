// Reużywalne elementy UI oraz komponenty ekranu (ESM pod Vite)
// - KOMPONENTY: Card, Button, LabeledInput/Select, Tabs
// - EKRANY: BillsTab (opłaty), ReportsTab (raporty)
// - Dodatki: TipsWidget (porada dnia z API)
import React, { useMemo, useState } from 'react'
import { useFetch } from './hooks'
import { BillsProvider, useBills } from './firebaseContext'

export function Card({ children }) { return <section className="card">{children}</section>; }
export function Button({ children, variant='primary', ...props }) { const cls = variant==='primary' ? 'primary' : ''; return <button className={cls} {...props}>{children}</button>; }
export function LabeledInput({ id, label, ...props }) { return (<>
  <label htmlFor={id} className="muted" style={{position:'absolute',left:'-9999px'}}>{label}</label>
  <input id={id} {...props} />
</>); }
export function LabeledSelect({ id, label, options, ...props }) { return (<>
  <label htmlFor={id} className="muted" style={{position:'absolute',left:'-9999px'}}>{label}</label>
  <select id={id} {...props}>
    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
  </select>
</>); }

// Zakładki dostępne z klawiatury (strzałki, enter/spacja)
export function Tabs({ items, activeId, onChange }) {
  const onKey = (i) => (e) => {
    const idx = items.findIndex(it => it.id===activeId);
    if (e.key==='ArrowRight' || e.key==='ArrowLeft') {
      e.preventDefault();
      const dir = e.key==='ArrowRight'? 1 : -1;
      const next = items[(idx + dir + items.length) % items.length];
      onChange(next.id);
    }
    if (e.key==='Enter' || e.key===' ') { e.preventDefault(); onChange(items[i].id); }
  };
  return (
    <div className="tabs" role="tablist" aria-label="Nawigacja zakładek">
      {items.map((it, i) => (
        <div key={it.id} id={`tab-${it.id}`} role="tab" aria-selected={activeId===it.id} tabIndex={activeId===it.id?0:-1} className={'tab ' + (activeId===it.id?'active':'')} onKeyDown={onKey(i)} onClick={()=>onChange(it.id)}>{it.label}</div>
      ))}
    </div>
  );
}

export const CATEGORIES = [ 'Ogólne ✨','Mieszkanie 🏠','Prąd ⚡','Rachunki 📄','Subskrypcje 💳','Śmieci 🗑️','Inne 🧩' ];
export const fmtCurrency = (n) => n.toLocaleString('pl-PL', { style:'currency', currency:'PLN' });
export const fmtDate = (ts) => new Date(ts).toLocaleDateString('pl-PL');

export function Header({ tab, setTab }){
  return (
    <div style={{display:'flex',alignItems:'center',gap:12,width:'100%'}}>
      <div><h1 className="title">DomFinanse</h1></div>
      <div style={{flex:1}} />
      <Tabs items={[{id:'bills', label:'Opłaty'}, {id:'reports', label:'Raporty'}]} activeId={tab} onChange={setTab} />
    </div>
  );
}

// Formularz dodawania opłaty (tytuł, kategoria, kwota, termin)
export function AddBillForm(){
  const { addBill } = useBills();
  const [form, setForm] = useState({ title:'', category:CATEGORIES[0], amount:'', due:'' });
  const isValid = useMemo(()=> form.title.trim() && Number(form.amount)>0 && form.due, [form]);
  function onSubmit(e){ e.preventDefault(); if(!isValid) return; addBill({ title: form.title.trim(), category: form.category, amount: Number(form.amount), due: new Date(form.due).getTime() }); setForm({ title:'', category:CATEGORIES[0], amount:'', due:'' }); }
  return (
    <form className="tx" onSubmit={onSubmit}>
      <div className="row">
        <LabeledInput id="bill-title" label="Nazwa opłaty" name="title" placeholder="Nazwa opłaty (np. Rachunek za prąd)" value={form.title} onChange={(e)=>setForm(f=>({ ...f, title:e.target.value }))} required aria-required="true" />
        <LabeledSelect id="bill-category" label="Kategoria" name="category" value={form.category} onChange={(e)=>setForm(f=>({ ...f, category:e.target.value }))} aria-label="Kategoria opłaty" options={CATEGORIES} />
        <LabeledInput id="bill-amount" label="Kwota" name="amount" type="number" min="0.01" step="0.01" placeholder="Kwota" value={form.amount} onChange={(e)=>setForm(f=>({ ...f, amount:e.target.value }))} required aria-required="true" />
      </div>
      <div className="row2">
        <LabeledInput id="bill-due" label="Termin płatności" name="due" type="date" value={form.due} onChange={(e)=>setForm(f=>({ ...f, due:e.target.value }))} required aria-required="true" />
        <div style={{ display:'flex', justifyContent:'end', alignItems:'end' }}>
          <Button type="submit">Dodaj opłatę</Button>
        </div>
      </div>
    </form>
  );
}

// Lista opłat – loading/error + akcje: zapłacone/usuń
export function BillsList(){
  const { bills, togglePaid, removeBill, loading, error } = useBills();
  const sorted = useMemo(()=> bills.slice().sort((a,b)=>(a.isPaid-b.isPaid) || (a.due||0)-(b.due||0)), [bills]);
  if (loading) return <div className="muted">Ładowanie opłat…</div>;
  if (error) return <div className="muted">Błąd pobierania opłat. Spróbuj ponownie później.</div>;
  if(sorted.length===0) return <div className="muted">Brak opłat. Dodaj pierwszą powyżej.</div>;
  return (
    <ul className="list">
      {sorted.map(b=> (
        <li key={b.id}>
          <div>
            <div>{b.title}</div>
            <div className="muted" style={{ fontSize:12 }}>{b.category} • termin: {b.due?fmtDate(b.due):'—'}</div>
          </div>
          <div className={'amount ' + (b.isPaid? 'pos':'neg')}>{fmtCurrency(b.amount)}</div>
          <div className="muted" style={{ fontSize:12 }}>{b.isPaid? 'Zapłacono' : 'Do zapłaty'}</div>
          <div style={{ display:'flex', gap:6 }}>
            <button type="button" aria-pressed={b.isPaid} aria-label={(b.isPaid?'Cofnij status zapłacone dla ':'Oznacz jako zapłacone: ') + b.title} onClick={()=>togglePaid(b.id)}>{b.isPaid? 'Cofnij' : 'Zapłacone'}</button>
            <button type="button" aria-label={'Usuń opłatę: ' + b.title} onClick={()=>removeBill(b.id)}>Usuń</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

// Wykres kołowy w SVG: zapłacone vs do zapłaty
export function DonutPaid({ paid, unpaid }){
  const total = Math.max(paid+unpaid, 1);
  const R = 48, C = 2*Math.PI*R; const paidLen = C*(paid/total); const unpaidLen = C - paidLen;
  return (
    <div className="chart">
      <h4>Zapłacone vs Do zapłaty</h4>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <g transform="translate(70,70)">
          <circle r={R} fill="none" stroke="#1f2a44" strokeWidth="16" />
          <circle r={R} fill="none" stroke="#22c55e" strokeWidth="16" strokeDasharray={paidLen + ' ' + C} transform="rotate(-90)"/>
          <circle r={R} fill="none" stroke="#ef4444" strokeWidth="16" strokeDasharray={unpaidLen + ' ' + C} transform={'rotate(' + ((paid/total)*360-90) + ')'} />
        </g>
      </svg>
      <div className="muted">Zapłacone: {fmtCurrency(paid)} • Do zapłaty: {fmtCurrency(unpaid)}</div>
    </div>
  );
}

// Wykres słupkowy: suma wg kategorii
export function BarsByCategory({ data }){
  const entries = Object.entries(data);
  if(entries.length===0) return <div className="chart"><h4>Wg kategorii</h4><div className="muted">Brak danych</div></div>;
  const max = Math.max.apply(null, entries.map(([,v])=>v));
  return (
    <div className="chart">
      <h4>Wg kategorii</h4>
      <div style={{display:'grid', gap:8}}>
        {entries.map(([k,v])=> (
          <div key={k}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--muted)'}}>
              <span>{k}</span><span>{fmtCurrency(v)}</span>
            </div>
            <div style={{height:8, background:'#0b1020', border:'1px solid var(--border)', borderRadius:999}}>
              <div style={{height:'100%', width: ((v/max)*100) + '%', background:'linear-gradient(90deg,#16b3f1,#0ea5e9)', borderRadius:999}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Ekran „Opłaty”: formularz i lista
export function BillsTab(){
  return (
    <Card>
      <AddBillForm />
      <div style={{ height:12 }} />
      <BillsList />
    </Card>
  );
}

// Ekran „Raporty”: podsumowania, wykresy, porada dnia
export function ReportsTab(){
  const { summary } = useBills();
  return (
    <Card>
      <div className="summary" style={{ marginBottom:16 }}>
        <div className="item positive"><div>Zapłacone</div><strong>{fmtCurrency(summary.paid)}</strong></div>
        <div className="item negative"><div>Do zapłaty</div><strong>-{fmtCurrency(summary.unpaid)}</strong></div>
        <div className="item balance"><div>Razem</div><strong>{fmtCurrency(summary.total)}</strong></div>
      </div>
      <div className="grid">
        <DonutPaid paid={summary.paid} unpaid={summary.unpaid} />
        <BarsByCategory data={summary.byCategory} />
      </div>
      <div style={{ height:12 }} />
      <TipsWidget />
    </Card>
  );
}

const FINANCIAL_TIPS = [
  'Zacznij od budżetu 50/30/20: 50% potrzeby, 30% zachcianki, 20% oszczędności/inwestycje.',
  'Ustaw automatyczne przelewy oszczędności zaraz po wypłacie (“najpierw sobie płać”).',
  'Twórz fundusz awaryjny na 3–6 miesięcy wydatków.',
  'Negocjuj rachunki i subskrypcje raz na kwartał – często można obniżyć koszt.',
  'Rata/abonament? Porównaj całkowity koszt (RRSO), nie tylko miesięczną ratę.',
  'Unikaj impulsywnych zakupów: zasada 24 godzin przed większym wydatkiem.',
  'Agreguj mikrowydatki – ich suma bywa zaskakująca.',
];

// Widżet „Porada dnia” – pobiera tip z API i ma lokalny fallback
export function TipsWidget(){
  const { data, loading, error, refetch } = useFetch('https://api.adviceslip.com/advice');
  const external = data && data.slip && data.slip.advice ? String(data.slip.advice) : null;
  const local = FINANCIAL_TIPS[Math.floor(Math.random()*FINANCIAL_TIPS.length)];
  const tip = external || local;
  return (
    <div className="chart" style={{ minHeight:120 }}>
      <h4>Porada dnia</h4>
      {loading ? (<div className="muted">Ładowanie porady…</div>) : error ? (<div className="muted">Błąd API – pokazuję lokalną poradę:</div>) : null}
      <div style={{ marginTop:8 }}>{tip}</div>
      <div style={{ marginTop:10, display:'flex', justifyContent:'end' }}>
        <button type="button" onClick={refetch}>Odśwież poradę</button>
      </div>
    </div>
  );
}

// Szkielet aplikacji (header + dwa panele)
export function AppFrame(){
  const [tab, setTab] = useState('bills');
  return (
    <BillsProvider>
      <div className="container">
        <header className="app">
          <Header tab={tab} setTab={setTab} />
        </header>
        <main role="main">
          <section id="panel-bills" role="tabpanel" aria-labelledby="tab-bills" hidden={tab!=='bills'}>
            <BillsTab />
          </section>
          <section id="panel-reports" role="tabpanel" aria-labelledby="tab-reports" hidden={tab!=='reports'}>
            <ReportsTab />
          </section>
        </main>
      </div>
    </BillsProvider>
  );
}

window.App = window.App || {};
window.App.ui = { AppFrame };


