import React, { useEffect, useMemo, useState } from "react";
import { loadLeague, saveLeague, subscribeLeague } from "./cloud.js";



/* ================== Utils & Storage ================== */
const uid = () => Math.random().toString(36).slice(2, 10);
const DEFAULT_RATING = 1000;
const LS_KEY = "paris-league-v1";

const loadState = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};
const saveState = (s) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
};

/* ================== Cognomi composti ================== */
const COMPOUND = new Set(["di","de","del","della","dello","dalla","dalle","dei","degli","delle","da","dal","d","lo","la","le","van","von"]);
const clean = (s) => String(s || "").toLowerCase();
function surnameOf(fullName){
  const parts = String(fullName||"").trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] || "";
  const last = parts[parts.length-1];
  const prevRaw = parts[parts.length-2];
  const prev = clean(prevRaw.replace(/\.$/, ""));
  return (prev.endsWith("'") || COMPOUND.has(prev)) ? `${prevRaw} ${last}` : last;
}

/* ================== Paris Ranking ================== */
function setsToString(sets){
  return (sets||[])
    .filter(s=> String(s?.a??"")!=="" || String(s?.b??"")!=="")
    .map(s=>`${Number(s.a||0)}-${Number(s.b||0)}`).join(", ");
}
function computeFromSets(sets){
  let setsA=0, setsB=0, gamesA=0, gamesB=0;
  for (const s of sets||[]){
    const a = Number(s?.a||0), b = Number(s?.b||0);
    if (String(a)==="" && String(b)==="") continue;
    gamesA+=a; gamesB+=b; if(a>b) setsA++; else if(b>a) setsB++;
  }
  let winner=null; if(setsA>setsB) winner="A"; else if(setsB>setsA) winner="B";
  return { setsA, setsB, gamesA, gamesB, winner };
}
function calcParisDelta({ rA1, rA2, rB1, rB2, gamesA, gamesB, winner, sets }){
  const base = (rA1 + rA2 + rB1 + rB2) / 100;
  const bonus = Math.abs(gamesA - gamesB);
  const pts = base + bonus;
  const deltaA = winner === "A" ? +pts : -pts;
  const deltaB = winner === "B" ? +pts : -pts;
  const formula =
    `Base = (R1 + R2 + R3 + R4) / 100 = (${rA1.toFixed(2)} + ${rA2.toFixed(2)} + ${rB1.toFixed(2)} + ${rB2.toFixed(2)}) / 100 = ${base.toFixed(2)}\n` +
    `Bonus differenza game = |${gamesA} - ${gamesB}| = ${bonus}\n` +
    `Punti per vincitori = Base + Bonus = ${base.toFixed(2)} + ${bonus} = ${pts.toFixed(2)}\n` +
    (winner === "A" ? `A +${pts.toFixed(2)}, B -${pts.toFixed(2)}` : `B +${pts.toFixed(2)}, A -${pts.toFixed(2)}`) +
    `\nRisultato set: ${setsToString(sets)}`;
  return { deltaA, deltaB, base, bonus, pts, formula };
}

/* ================== Seed (20 giocatori + 15 partite) ================== */
const ITA20 = [
  "Andrea Paris","Giovanni Cardarelli","Nicola Di Marzio","Stefano Ruscitti",
  "Domenico Di Gianfilippo","Giorgio Contestabile","Alfredo Di Donato","Paolo Chiola",
  "Angelo Persia","Marco Idrofano","Lorenzo Eligi","Matteo Di Stefano",
  "Claudio Morgante","Pierluigi Paris","Gabriele Rossi","Luca Bianchi",
  "Marco Verdi","Antonio Esposito","Francesco Romano","Davide Moretti"
];
function makeSeed(){
  const players = ITA20.map(name=>({ id: uid(), name, rating: DEFAULT_RATING }));
  const pick4 = () => {
    const pool=[...players]; return new Array(4).fill(0)
      .map(()=> pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  };
  const matches=[];
  for(let i=0;i<15;i++){
    const [a1,a2,b1,b2]=pick4();
    const sets=[]; let wA=0, wB=0;
    while(wA<2 && wB<2){
      const aWin=Math.random()<0.5;
      const ga=6, gb=Math.floor(Math.random()*5);
      if(aWin){ sets.push({a:ga,b:gb}); wA++; } else { sets.push({a:gb,b:ga}); wB++; }
    }
    matches.push({ id: uid(), date: new Date().toISOString(), teamA:[a1.id,a2.id], teamB:[b1.id,b2.id], sets });
  }
  return { players, matches };
}

/* ================== Recompute ranking & stats ================== */
function recompute(players, matches){
  const map = new Map(players.map(p=>[p.id, {...p, rating: DEFAULT_RATING, wins:0, losses:0 }]));
  const enriched=[];
  const byDate = [...matches].sort((a,b)=> new Date(a.date) - new Date(b.date));
  for(const m of byDate){
    const a1=map.get(m.teamA[0]), a2=map.get(m.teamA[1]);
    const b1=map.get(m.teamB[0]), b2=map.get(m.teamB[1]);
    const rr=computeFromSets(m.sets);
    const { deltaA, deltaB, pts, formula } = calcParisDelta({
      rA1:a1?.rating??DEFAULT_RATING, rA2:a2?.rating??DEFAULT_RATING,
      rB1:b1?.rating??DEFAULT_RATING, rB2:b2?.rating??DEFAULT_RATING,
      gamesA:rr.gamesA, gamesB:rr.gamesB, winner:rr.winner, sets:m.sets
    });
    const rec={...m, ...rr, deltaA, deltaB, pts, formula};
    enriched.push(rec);
    if(rr.winner==="A"){
      if(a1) a1.rating+=deltaA; if(a2) a2.rating+=deltaA;
      if(b1) b1.rating+=deltaB; if(b2) b2.rating+=deltaB;
      if(a1) a1.wins++; if(a2) a2.wins++; if(b1) b1.losses++; if(b2) b2.losses++;
    }else if(rr.winner==="B"){
      if(a1) a1.rating+=deltaA; if(a2) a2.rating+=deltaA;
      if(b1) b1.rating+=deltaB; if(b2) b2.rating+=deltaB;
      if(b1) b1.wins++; if(b2) b2.wins++; if(a1) a1.losses++; if(a2) a2.losses++;
    }
  }
  return { players: Array.from(map.values()), matches: enriched };
}

/* ================== UI Helpers ================== */
function Section({ title, right, children }){
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {right}
      </div>
      <div className="rounded-2xl p-4 shadow bg-white">{children}</div>
    </div>
  );
}
function Modal({ open, onClose, title, children }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}/>
      <div className="relative z-10 bg-white rounded-2xl shadow-xl p-6 w-[min(800px,90vw)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="px-3 py-1 rounded-lg border" onClick={onClose}>Chiudi</button>
        </div>
        <div className="whitespace-pre-wrap text-sm">{children}</div>
      </div>
    </div>
  );
}

/* ================== App ================== */
export default function App() {
  // ---- id lega persistito ----
  const [leagueId, setLeagueId] = useState(
    localStorage.getItem("leagueId") || "lega-andrea-2025"
  );
  useEffect(() => localStorage.setItem("leagueId", leagueId), [leagueId]);

  // ---- stato principale ----
  const [state, setState] = useState(null);
  const [updatingFromCloud, setUpdatingFromCloud] = useState(false);

  // 3a) Primo caricamento: cloud -> fallback locale/seed -> scrivi su cloud se assente
  useEffect(() => {
    (async () => {
      try {
        const fromCloud = await loadLeague(leagueId);
        const valid =
          fromCloud &&
          typeof fromCloud === "object" &&
          Array.isArray(fromCloud.players) &&
          Array.isArray(fromCloud.matches);

        if (valid) {
          setState(fromCloud);
          try { localStorage.setItem(LS_KEY, JSON.stringify(fromCloud)); } catch {}
        } else {
          const local = (() => {
            try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch { return null; }
          })();
          const initial = local || makeSeed();
          setState(initial);
          try { await saveLeague(leagueId, initial); } catch {}
        }
      } catch (e) {
        console.warn("initial load error:", e);
        // fallback duro: seed
        const initial = makeSeed();
        setState(initial);
      }
    })();
  }, [leagueId]);

  // 3b) Realtime dal cloud (protetto anti-loop)
  useEffect(() => {
    if (!leagueId) return;
    let unsub = null;
    try {
      unsub = subscribeLeague(leagueId, (cloudState) => {
        const valid =
          cloudState &&
          typeof cloudState === "object" &&
          Array.isArray(cloudState.players) &&
          Array.isArray(cloudState.matches);
        if (valid) {
          setUpdatingFromCloud(true);
          setState(cloudState);
          try { localStorage.setItem(LS_KEY, JSON.stringify(cloudState)); } catch {}
          setUpdatingFromCloud(false);
        }
      });
    } catch (e) {
      console.warn("subscribe err:", e);
    }
    return () => unsub && unsub();
  }, [leagueId]);

  // 3c) Persist locale + salva su cloud (debounce)
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
    if (!state || updatingFromCloud) return;
    const t = setTimeout(() => {
      saveLeague(leagueId, state).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [state, leagueId, updatingFromCloud]);

  // ---- altri state UI (ordine fisso) ----
  const [active, setActive] = useState("classifica");
  const [formula, setFormula] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

  // ---- memos sicuri (si chiamano SEMPRE; con state=null ritornano shape vuota) ----
  const derived = useMemo(() => {
    if (!state) return { players: [], matches: [] };
    return recompute(state.players || [], state.matches || []);
  }, [state]);

  const playersById = useMemo(() => {
    return Object.fromEntries((derived.players || []).map((p) => [p.id, p]));
  }, [derived]);

  const openStats = (pid) => { setSelectedPlayerId(pid); setActive("stats"); };

  // ---- render: loader o app ----
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-2xl font-bold">Paris League</div>
          <nav className="flex gap-2">
            {[
              ["classifica","Classifica"],
              ["giocatori","Giocatori"],
              ["crea","Crea Partita"],
              ["stats","Statistiche Giocatore"],
              ["extra","Extra"],
            ].map(([id,label])=>(
              <button key={id} onClick={()=>setActive(id)}
                className={`px-3 py-1.5 rounded-xl border ${active===id?"bg-black text-white":"bg-white"}`}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {!state ? (
          <div className="p-6">Caricamento…</div>
        ) : (
          <>
            {active==="classifica" && <Classifica players={derived.players} onOpenStats={openStats} />}
            {active==="giocatori" && <Giocatori state={state} setState={setState} onOpenStats={openStats} />}
            {active==="crea" && <CreaPartita state={state} setState={setState} playersById={playersById} onShowFormula={setFormula} />}
            {active==="stats" && <StatisticheGiocatore players={derived.players} matches={derived.matches} selectedPlayerId={selectedPlayerId} onSelectPlayer={setSelectedPlayerId} onShowFormula={setFormula} />}
            {active==="extra" && (
              <Extra
                state={state}
                setState={setState}
                derived={derived}
                leagueId={leagueId}
                setLeagueId={setLeagueId}
              />
            )}
          </>
        )}
      </main>

      <Modal open={!!formula} onClose={()=>setFormula("")} title="Formula calcolo punti (Ranking Paris)">
        {formula}
      </Modal>
    </div>
  );
}


/* ================== Classifica ================== */
function Classifica({ players, onOpenStats }){
  const rows = useMemo(()=> ([...players].map(p=>({
    ...p, winRate: ((p.wins||0)+(p.losses||0))? ((p.wins||0)/((p.wins||0)+(p.losses||0))*100):0
  })).sort((a,b)=> b.rating-a.rating)), [players]);

  return (
    <Section title="Classifica (Ranking Paris)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">#</th>
              <th className="py-2 pr-3">Giocatore</th>
              <th className="py-2 pr-3">Ranking</th>
              <th className="py-2 pr-3">Vittorie</th>
              <th className="py-2 pr-3">Sconfitte</th>
              <th className="py-2 pr-3">% Vittorie</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p,idx)=>(
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="py-1 pr-3">{idx+1}</td>
                <td className="py-1 pr-3">
                  <button className="underline" onClick={()=>onOpenStats(p.id)}>{p.name}</button>
                </td>
                <td className="py-1 pr-3 font-semibold">{p.rating.toFixed(2)}</td>
                <td className="py-1 pr-3">{p.wins||0}</td>
                <td className="py-1 pr-3">{p.losses||0}</td>
                <td className="py-1 pr-3">{p.winRate.toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* ================== Giocatori ================== */
function Giocatori({ state, setState, onOpenStats }){
  const [name,setName]=useState("");
  const add=()=>{ if(!name.trim()) return;
    setState(s=>({...s, players:[...s.players, {id:uid(), name:name.trim(), rating:DEFAULT_RATING}]}));
    setName("");
  };
  const remove=(id)=>{ if(!confirm("Rimuovere il giocatore?")) return;
    setState(s=>({...s, players:s.players.filter(p=>p.id!==id)}));
  };
  return (
    <Section title="Giocatori">
      <div className="flex gap-2 mb-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome giocatore" className="border rounded-xl px-3 py-2 w-64"/>
        <button onClick={add} className="px-4 py-2 rounded-xl bg-black text-white">Aggiungi</button>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        {state.players.map(p=>(
          <div key={p.id} className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <button onClick={()=>onOpenStats(p.id)} className="font-medium underline">{p.name}</button>
              <div className="text-xs text-gray-500">ID: {p.id}</div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={()=>onOpenStats(p.id)} className="text-sm underline">Statistiche</button>
              <button onClick={()=>remove(p.id)} className="text-red-600 text-sm">Elimina</button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ================== Crea Partita ================== */
function PlayerSelect({ players, value, onChange, disabledIds }){
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} className="border rounded-xl px-3 py-2">
      <option value="">—</option>
      {players.map(p=>(
        <option key={p.id} value={p.id} disabled={disabledIds?.has(p.id)}>{p.name}</option>
      ))}
    </select>
  );
}
const toLocalInputValue = (d)=> {
  const pad = (n)=> String(n).padStart(2,"0");
  const dt = new Date(d);
  const y=dt.getFullYear(), m=pad(dt.getMonth()+1), day=pad(dt.getDate());
  const hh=pad(dt.getHours()), mm=pad(dt.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
};

function CreaPartita({ state, setState, playersById, onShowFormula }){
  const players=state.players;
  const [a1,setA1]=useState(""); const [a2,setA2]=useState("");
  const [b1,setB1]=useState(""); const [b2,setB2]=useState("");
  const [sets,setSets]=useState([{a:"",b:""},{a:"",b:""},{a:"",b:""}]);
  const [when,setWhen]=useState(toLocalInputValue(new Date()));

  const rr=computeFromSets(sets);
  const ready = a1&&a2&&b1&&b2&&rr.winner;
  const disabled = new Set([a1,a2,b1,b2].filter(Boolean));

  const showPreviewFormula=()=>{
    const { formula } = calcParisDelta({
      rA1: playersById[a1]?.rating??DEFAULT_RATING,
      rA2: playersById[a2]?.rating??DEFAULT_RATING,
      rB1: playersById[b1]?.rating??DEFAULT_RATING,
      rB2: playersById[b2]?.rating??DEFAULT_RATING,
      gamesA: rr.gamesA, gamesB: rr.gamesB, winner: rr.winner, sets
    });
    onShowFormula(formula);
  };

  const addMatch=()=>{
    if(!ready) return alert("Seleziona 4 giocatori e inserisci i set (best of 3). Il risultato non può finire 1-1.");
    const normSets=(sets||[]).map(s=>({ a:+(s?.a||0), b:+(s?.b||0) }));
    const date = new Date(when || Date.now()).toISOString();
    setState(s=>({...s, matches:[...s.matches, { id:uid(), date, teamA:[a1,a2], teamB:[b1,b2], sets:normSets }]}));
    setA1(""); setA2(""); setB1(""); setB2("");
    setSets([{a:"",b:""},{a:"",b:""},{a:"",b:""}]);
    setWhen(toLocalInputValue(new Date()));
  };

  const delMatch=(id)=>{ if(!confirm("Cancellare la partita?")) return;
    setState(s=>({...s, matches:s.matches.filter(m=>m.id!==id)}));
  };

  return (
    <>
      <Section title="Crea Partita">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="font-medium">Team A</div>
            <div className="flex gap-2">
              <PlayerSelect players={players} value={a1} onChange={setA1} disabledIds={new Set([a2,b1,b2].filter(Boolean))}/>
              <PlayerSelect players={players} value={a2} onChange={setA2} disabledIds={new Set([a1,b1,b2].filter(Boolean))}/>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium">Team B</div>
            <div className="flex gap-2">
              <PlayerSelect players={players} value={b1} onChange={setB1} disabledIds={new Set([a1,a2,b2].filter(Boolean))}/>
              <PlayerSelect players={players} value={b2} onChange={setB2} disabledIds={new Set([a1,a2,b1].filter(Boolean))}/>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr,1fr]">
          <div>
            <div className="font-medium mb-1">Data e ora</div>
            <input
              type="datetime-local"
              value={when}
              onChange={(e)=>setWhen(e.target.value)}
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <div className="font-medium mb-2">Risultato (best of 3)</div>
            <table className="w-full text-sm border rounded-xl overflow-hidden">
              <thead><tr className="bg-gray-100">
                <th className="py-2 px-2 text-left">Set</th>
                <th className="py-2 px-2 text-center">Team A</th>
                <th className="py-2 px-2 text-center">Team B</th>
              </tr></thead>
              <tbody>
                {[0,1,2].map(i=>(
                  <tr key={i} className="border-t">
                    <td className="py-2 px-2">{i+1}</td>
                    <td className="py-2 px-2"><input type="number" min="0" className="border rounded-xl px-2 py-1 w-20 text-center" value={sets[i].a} onChange={e=>setSets(prev=>prev.map((s,j)=> j===i?{...s,a:e.target.value}:s))}/></td>
                    <td className="py-2 px-2"><input type="number" min="0" className="border rounded-xl px-2 py-1 w-20 text-center" value={sets[i].b} onChange={e=>setSets(prev=>prev.map((s,j)=> j===i?{...s,b:e.target.value}:s))}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-xs text-gray-500">Se dopo 2 set è 1–1, inserisci il 3° set per decidere.</div>
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-600">
          Sets A-B: {rr.setsA}-{rr.setsB} | Games A-B: {rr.gamesA}-{rr.gamesB} {rr.winner && <span className="ml-2 px-2 py-0.5 rounded-full text-xs border">Vince {rr.winner}</span>}
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={addMatch} className="px-4 py-2 rounded-xl bg-black text-white">Salva partita</button>
          <button onClick={showPreviewFormula} className="px-4 py-2 rounded-xl border">Mostra formula punti</button>
        </div>
      </Section>

      <Section title="Ultime partite">
        <div className="space-y-2">
          {[...state.matches].slice(-20).reverse().map(m =>
            <MatchRow key={m.id} m={m} playersById={playersById} onShowFormula={onShowFormula} onDelete={()=>delMatch(m.id)} />
          )}
        </div>
      </Section>
    </>
  );
}

function MatchRow({ m, playersById, onShowFormula, onDelete }){
  const rr = computeFromSets(m.sets||[]);
  const nameOf = (id)=> playersById[id]?.name ?? id;
  const A = `${surnameOf(nameOf(m.teamA[0]))} & ${surnameOf(nameOf(m.teamA[1]))}`;
  const B = `${surnameOf(nameOf(m.teamB[0]))} & ${surnameOf(nameOf(m.teamB[1]))}`;
  const { formula, pts } = calcParisDelta({
    rA1: playersById[m.teamA[0]]?.rating ?? DEFAULT_RATING,
    rA2: playersById[m.teamA[1]]?.rating ?? DEFAULT_RATING,
    rB1: playersById[m.teamB[0]]?.rating ?? DEFAULT_RATING,
    rB2: playersById[m.teamB[1]]?.rating ?? DEFAULT_RATING,
    gamesA: rr.gamesA, gamesB: rr.gamesB, winner: rr.winner, sets: m.sets
  });
  const deltaText = `${rr.winner==="A"?"+":"-"}${pts.toFixed(2)}`;
  const aCls = rr.winner==="A" ? "text-green-600" : "text-red-600";
  const bCls = rr.winner==="B" ? "text-green-600" : "text-red-600";
  const dateStr = new Date(m.date).toLocaleString();

  return (
    <div className="border rounded-xl p-3 flex items-center justify-between">
      <div className="text-sm">
        <div><span className={`${aCls} font-medium`}>{A}</span> <span className="text-gray-500">vs</span> <span className={`${bCls} font-medium`}>{B}</span></div>
        <div className="text-gray-600">Sets {rr.setsA}-{rr.setsB} | Games {rr.gamesA}-{rr.gamesB} • <span className="text-gray-500">{dateStr}</span></div>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-sm underline" onClick={()=>onShowFormula(formula)}>Δ punti: {deltaText}</button>
        <button className="text-red-600 text-sm" onClick={onDelete}>Elimina</button>
      </div>
    </div>
  );
}

// ================== Statistiche giocatore (con percentuali, safe senza surnameFrom) ==================
function StatisticheGiocatore({ players, matches, selectedPlayerId, onSelectPlayer, onShowFormula }){
  const [pid,setPid]=useState(selectedPlayerId || players[0]?.id || "");
  useEffect(()=>{ if(selectedPlayerId) setPid(selectedPlayerId); },[selectedPlayerId]);

  // 👇 helper locale: usa surnameFrom se esiste, altrimenti fallback sicuro (gestisce anche cognomi composti basilari)
  const getSurname = (fullName) => {
    try {
      if (typeof surnameFrom === "function") return surnameFrom(fullName);
    } catch (_) {}
    const parts = String(fullName||"").trim().split(/\s+/);
    if (parts.length <= 1) return parts[0] || "";
    const last = parts[parts.length-1];
    const prevRaw = parts[parts.length-2] || "";
    const prev = prevRaw.toLowerCase().replace(/\.$/, "");
    const compound = new Set(["di","de","del","della","dello","dalla","dalle","dei","degli","delle","da","dal","d","lo","la","le","van","von"]);
    if (prev.endsWith("'") || compound.has(prev)) return `${prevRaw} ${last}`;
    return last;
  };

  const nameById = (id)=> players.find(p=>p.id===id)?.name || id;
  const teamStrSurname = (ids)=> ids.map(id=> getSurname(nameById(id))).join(" & ");

  const data = useMemo(()=>{
    if(!pid) return null;

    // partite giocate dal giocatore
    const played = (matches||[]).filter(m=> (m.teamA||[]).includes(pid) || (m.teamB||[]).includes(pid));

    // righe arricchite
    const rows = played.map(m=>{
      const isA = (m.teamA||[]).includes(pid);
      const delta = isA ? m.deltaA : m.deltaB;
      const mate  = isA ? (m.teamA||[]).find(x=>x!==pid) : (m.teamB||[]).find(x=>x!==pid);
      const foes  = isA ? (m.teamB||[]) : (m.teamA||[]);
      const win   = (isA && m.winner==="A") || (!isA && m.winner==="B");
      return { m, isA, delta: Number(delta||0), mate, foes, win };
    });

    // mappe statistiche
    const mates = new Map(); // id -> {wins, losses, total}
    const opps  = new Map();

    const bump = (map, id, key)=>{
      if(!id) return;
      const cur = map.get(id) || { wins:0, losses:0, total:0 };
      cur.total += 1;
      cur[key]  += 1;
      map.set(id, cur);
    };

    for(const r of rows){
      if(r.mate) bump(mates, r.mate, r.win ? "wins" : "losses");
      for(const f of r.foes){ bump(opps, f, r.win ? "wins" : "losses"); }
    }

    const toArrayWithPct = (map, field) =>
      [...map.entries()]
        .filter(([_,v]) => (v[field]||0) > 0)
        .map(([id, v]) => {
          const n = v[field] || 0;
          const total = v.total || 1;
          const pct = Math.round((n/total)*100);
          return { id, n, total, pct };
        })
        .sort((a,b)=> b.n - a.n);

    return {
      rows,
      mateWins:    toArrayWithPct(mates, "wins"),    // Compagni con cui hai vinto di più
      mateLoss:    toArrayWithPct(mates, "losses"),  // Compagni con i quali hai perso di più
      foesBeaten:  toArrayWithPct(opps,  "wins"),    // Avversari che hai battuto più volte
      foesWhoBeat: toArrayWithPct(opps,  "losses"),  // Avversari con i quali hai perso di più
    };
  },[pid, matches]);

  return (
    <Section title="Statistiche giocatore">
      <div className="mb-3">
        <select value={pid} onChange={e=>{setPid(e.target.value); onSelectPlayer?.(e.target.value);}} className="border rounded-xl px-3 py-2">
          {players.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {!data ? (
        <div>Seleziona un giocatore.</div>
      ) : (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            {/* Compagni: vittorie */}
            <div className="border rounded-xl p-3">
              <div className="font-medium mb-1">Compagni con cui hai vinto di più</div>
              {data.mateWins.length ? data.mateWins.map(({id,n,pct,total})=> (
                <div key={id} className="text-sm">
                  {nameById(id)} — {n} ({pct}% su {total})
                </div>
              )) : <div className="text-sm text-gray-500">(nessuno)</div>}
            </div>

            {/* Compagni: sconfitte */}
            <div className="border rounded-xl p-3">
              <div className="font-medium mb-1">Compagni con i quali hai perso di più</div>
              {data.mateLoss.length ? data.mateLoss.map(({id,n,pct,total})=> (
                <div key={id} className="text-sm">
                  {nameById(id)} — {n} ({pct}% su {total})
                </div>
              )) : <div className="text-sm text-gray-500">(nessuno)</div>}
            </div>

            {/* Avversari battuti */}
            <div className="border rounded-xl p-3">
              <div className="font-medium mb-1">Avversari che hai battuto più volte</div>
              {data.foesBeaten.length ? data.foesBeaten.map(({id,n,pct,total})=> (
                <div key={id} className="text-sm">
                  {nameById(id)} — {n} ({pct}% su {total})
                </div>
              )) : <div className="text-sm text-gray-500">(nessuno)</div>}
            </div>

            {/* Avversari che ti hanno battuto */}
            <div className="border rounded-xl p-3">
              <div className="font-medium mb-1">Avversari con i quali hai perso di più</div>
              {data.foesWhoBeat.length ? data.foesWhoBeat.map(({id,n,pct,total})=> (
                <div key={id} className="text-sm">
                  {nameById(id)} — {n} ({pct}% su {total})
                </div>
              )) : <div className="text-sm text-gray-500">(nessuno)</div>}
            </div>
          </div>

          {/* Elenco partite */}
          <div>
            <div className="font-medium mb-1">Tutte le partite</div>
            <div className="space-y-2">
             {data.rows
  .slice()
  .sort((a,b)=> new Date(b.m.date) - new Date(a.m.date))
  .map(({m,delta,isA})=> {
    const won = (isA && m.winner==="A") || (!isA && m.winner==="B");
    const selfTeam = teamStrSurname(isA ? m.teamA : m.teamB);
    const oppTeam  = teamStrSurname(isA ? m.teamB : m.teamA);
    const selfCls  = won ? "text-green-700 font-semibold" : "text-red-700 font-semibold";
    const oppCls   = won ? "text-red-700 font-semibold"  : "text-green-700 font-semibold";
    return (
      <div key={m.id} className="border rounded-xl p-3 flex items-center justify-between text-sm">
        <div>
          <span className={selfCls}>{selfTeam}</span>{" "}
          <span className="text-gray-500">vs</span>{" "}
          <span className={oppCls}>{oppTeam}</span>{" "}
          <span className="text-gray-400">—</span>{" "}
          <span className="text-gray-600">
            Sets {m.setsA}-{m.setsB} | Games {m.gamesA}-{m.gamesB}
          </span>
          {m.date && (
            <span className="text-xs text-gray-500 ml-2">
              • {new Date(m.date).toLocaleString()}
            </span>
          )}
        </div>
        <button
          className={delta>=0 ? "text-green-600" : "text-red-600"}
          onClick={()=>onShowFormula?.(m.formula)}
          title="Mostra formula punti"
        >
          Δ {delta>=0?"+":""}{delta.toFixed(2)}
        </button>
      </div>
    );
})}

            </div>
          </div>
        </div>
      )}
    </Section>
  );
}


/* ================== Extra (backup/import/CSV + Cloud) ================== */
const toCSV = (rows) => {
  if (!rows.length) return "";
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const header = Object.keys(rows[0]).map(esc).join(",");
  const body = rows.map((r) => Object.values(r).map(esc).join(",")).join("\n");
  return header + "\n" + body;
};
function downloadBlob(name, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 250);
}

function Extra({ state, setState, derived, leagueId, setLeagueId }) {
  const [cloudMsg, setCloudMsg] = React.useState("");

  // ===== Cloud helpers =====
  async function forceSave() {
    try {
      await saveLeague(leagueId, state);
      setCloudMsg(`✅ Salvato su cloud: leagues/${leagueId}`);
    } catch (e) {
      setCloudMsg(`❌ Errore salvataggio: ${e?.message || e}`);
    }
  }
  async function forceLoad() {
    try {
      const cloud = await loadLeague(leagueId);
      if (cloud && typeof cloud === "object") {
        setState(cloud);
        setCloudMsg(`✅ Caricato dal cloud: leagues/${leagueId}`);
      } else {
        setCloudMsg("⚠️ Documento non trovato sul cloud");
      }
    } catch (e) {
      setCloudMsg(`❌ Errore caricamento: ${e?.message || e}`);
    }
  }
  async function pingCloud() {
    const w = await testWritePing();
    const r = await testReadPing();
    setCloudMsg(
      `Ping → write: ${w.ok ? "OK" : "ERR"}${w.error ? " (" + w.error + ")" : ""} | ` +
        `read: ${r.ok ? "OK" : "ERR"}${r.error ? " (" + r.error + ")" : ""}`
    );
  }

  // ===== Local backup/export =====
  const exportJSON = () =>
    downloadBlob(
      "paris-league-backup.json",
      new Blob([JSON.stringify(state, null, 2)], {
        type: "application/json;charset=utf-8",
      })
    );

  const importJSON = (file) => {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        setState(JSON.parse(fr.result));
        alert("Import riuscito!");
      } catch {
        alert("File non valido");
      }
    };
    fr.readAsText(file);
  };

  const exportCSVClassifica = () => {
    const rows = derived.players
      .slice()
      .sort((a, b) => b.rating - a.rating)
      .map((p, i) => ({
        pos: i + 1,
        name: p.name,
        rating: p.rating.toFixed(2),
        wins: p.wins || 0,
        losses: p.losses || 0,
      }));
    if (!rows.length) return alert("Nessun dato da esportare.");
    downloadBlob(
      "classifica.csv",
      new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" })
    );
  };

  const exportCSVMatches = () => {
    const rows = derived.matches.map((m) => ({
      date: new Date(m.date).toLocaleString(),
      teamA: m.teamA.join("+"),
      teamB: m.teamB.join("+"),
      sets: (m.sets || []).map((s) => `${s.a}-${s.b}`).join(" "),
      gamesA: m.gamesA,
      gamesB: m.gamesB,
      winner: m.winner,
      deltaA: m.deltaA?.toFixed(2) ?? "",
      deltaB: m.deltaB?.toFixed(2) ?? "",
    }));
    if (!rows.length) return alert("Nessuna partita da esportare.");
    downloadBlob(
      "partite.csv",
      new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" })
    );
  };

  const resetAll = () => {
    if (!confirm("Rigenerare simulazione iniziale?")) return;
    setState(makeSeed());
  };

  return (
    <Section title="Extra – Backup & Export">
      {/* Barra Cloud */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm">Lega:</span>
        <input
          className="border rounded-xl px-2 py-1 w-64"
          value={leagueId}
          placeholder="lega-andrea-2025"
          onChange={(e) => setLeagueId(e.target.value)}
        />
        <button className="px-3 py-1.5 rounded-xl border" onClick={forceSave}>
          Forza salva su cloud
        </button>
        <button className="px-3 py-1.5 rounded-xl border" onClick={forceLoad}>
          Forza carica da cloud
        </button>
        <button className="px-3 py-1.5 rounded-xl border" onClick={pingCloud}>
          Test ping cloud
        </button>
      </div>
      {cloudMsg && (
        <div className="text-xs text-gray-600 mb-4">{cloudMsg}</div>
      )}

      {/* Strumenti Local/CSV */}
      <div className="flex flex-wrap gap-2">
        <button
          className="px-4 py-2 rounded-xl bg-black text-white"
          onClick={exportJSON}
        >
          Backup JSON
        </button>
        <label className="px-4 py-2 rounded-xl border cursor-pointer">
          Import JSON
          <input
            type="file"
            className="hidden"
            accept="application/json"
            onChange={(e) =>
              e.target.files?.[0] && importJSON(e.target.files[0])
            }
          />
        </label>
        <button
          className="px-4 py-2 rounded-xl border"
          onClick={exportCSVClassifica}
        >
          Export Classifica CSV
        </button>
        <button
          className="px-4 py-2 rounded-xl border"
          onClick={exportCSVMatches}
        >
          Export Partite CSV
        </button>
        <button
          className="px-4 py-2 rounded-xl text-red-600 border border-red-500"
          onClick={resetAll}
        >
          Rigenera simulazione
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-3">
        I dati sono salvati <b>in locale</b> (localStorage) e, se configurato,
        <b> anche su Firestore</b> nel documento <code>leagues/{leagueId}</code>
        . Ricorda di pubblicare la <code>dist/</code> su Netlify con{" "}
        <code>public/_redirects</code> per il fallback SPA.
      </div>
    </Section>
  );
}
