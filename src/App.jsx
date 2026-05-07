import { useState, useEffect } from "react";
import { supabase } from './lib/supabase.js';

// ─── DATA ────────────────────────────────────────────────────────────────────
const MODULES = [
  { id:"kurikulum", label:"Kurikulum", icon:"📚", color:"#2563eb", light:"#eff6ff", tag:"GPK 1",
    subs:["Jadual Waktu","Panitia Mata Pelajaran","Peperiksaan & Penilaian","RPH / Rekod Mengajar","Program Akademik","Pusat Sumber / NILAM","Perkembangan Staf"],
    ids:["jadual","panitia","peperiksaan","rph","program","pss","staf"] },
  { id:"hem", label:"Hal Ehwal Murid", icon:"👫", color:"#0ea5e9", light:"#f0f9ff", tag:"GPK HEM",
    subs:["Pendaftaran & Data Murid","Disiplin","Bimbingan & Kaunseling","Kesihatan Murid","Bantuan Pelajaran","Keselamatan & 3K","Pengawas Sekolah","Koperasi"],
    ids:["apdm","disiplin","kaunseling","kesihatan","bantuan","3k","pengawas","koperasi"] },
  { id:"kokurikulum", label:"Kokurikulum", icon:"🏅", color:"#6366f1", light:"#eef2ff", tag:"GPK Koku",
    subs:["Kelab & Persatuan","Badan Beruniform","Sukan & Permainan","PAJSK","Profil Murid Koku","Pencapaian","OPR","Takwim Kokurikulum"],
    ids:["kelab","uniform","sukan","pajsk","profil","pencapaian","opr","takwim"] },
  { id:"pentadbiran", label:"Pentadbiran Am", icon:"🏛️", color:"#0284c7", light:"#e0f2fe", tag:"Pentadbir",
    subs:["Kewangan (PCG)","Aset (JKPAK)","Staf & Guru","Surat & Pekeliling","Mesyuarat & Minit"],
    ids:["kewangan","aset","staf","surat","mesyuarat"] },
  { id:"ict", label:"ICT / Makmal", icon:"💻", color:"#1d4ed8", light:"#eff6ff", tag:"Guru ICT",
    subs:["Inventori ICT","Penjadualan Makmal","Sistem & Aplikasi","Laporan Kerosakan"],
    ids:["inventori","makmal","sistem","kerosakan"] },
  { id:"prasekolah", label:"Prasekolah", icon:"🌈", color:"#7c3aed", light:"#f5f3ff", tag:"Guru PRA",
    subs:["Data Murid Prasekolah","Jadual & Aktiviti","Penilaian Murid","Laporan"],
    ids:["murid-pra","aktiviti-pra","penilaian-pra","laporan-pra"] },
];

const TAG_OPTS = [
  { lbl:"Segera",     tc:"#ef4444", bg:"#fef2f2" },
  { lbl:"Peringatan", tc:"#f59e0b", bg:"#fffbeb" },
  { lbl:"Maklumat",   tc:"#6366f1", bg:"#f0f0ff" },
  { lbl:"Baharu",     tc:"#2563eb", bg:"#eff6ff" },
  { lbl:"Selesai",    tc:"#22c55e", bg:"#f0fdf4" },
];
const NOTIS_ICONS = ["📅","📋","📦","👦","📢","⚠️","✅","🏫","📌","🔔"];

// ─── KURIKULUM DATA ──────────────────────────────────────────────────────────
const SC = {
  "BM":      { c:"#2563eb", bg:"#eff6ff",  i:"📖" },
  "BI":      { c:"#0891b2", bg:"#ecfeff",  i:"🌍" },
  "Math":    { c:"#ea580c", bg:"#fff7ed",  i:"🔢" },
  "Sains":   { c:"#16a34a", bg:"#f0fdf4",  i:"🔬" },
  "Sejarah": { c:"#92400e", bg:"#fef3c7",  i:"📜" },
  "PI":      { c:"#a16207", bg:"#fefce8",  i:"🕌" },
  "Moral":   { c:"#7c3aed", bg:"#f5f3ff",  i:"⭐" },
  "PJ":      { c:"#dc2626", bg:"#fef2f2",  i:"⚽" },
  "PSV":     { c:"#db2777", bg:"#fdf2f8",  i:"🎨" },
  "Muzik":   { c:"#7c3aed", bg:"#f5f3ff",  i:"🎵" },
  "RBT":     { c:"#475569", bg:"#f8fafc",  i:"🔧" },
  "BK":      { c:"#0284c7", bg:"#e0f2fe",  i:"📚" },
};

const KELAS_LIST = [
  "Tahun 1 Unik","Tahun 1 Aplikasi","Tahun 1 Revolusi","Tahun 1 Aspirasi","Tahun 1 Dedikasi",
  "Tahun 2 Unik","Tahun 2 Aplikasi","Tahun 2 Revolusi","Tahun 2 Aspirasi","Tahun 2 Dedikasi",
  "Tahun 3 Unik","Tahun 3 Aplikasi","Tahun 3 Revolusi","Tahun 3 Aspirasi","Tahun 3 Dedikasi",
  "Tahun 4 Unik","Tahun 4 Aplikasi","Tahun 4 Revolusi","Tahun 4 Aspirasi","Tahun 4 Dedikasi",
  "Tahun 5 Unik","Tahun 5 Aplikasi","Tahun 5 Revolusi","Tahun 5 Aspirasi","Tahun 5 Dedikasi",
  "Tahun 6 Unik","Tahun 6 Aplikasi","Tahun 6 Revolusi","Tahun 6 Aspirasi","Tahun 6 Dedikasi",
];

const WAKTU_SLOTS = [
  "7:30 – 8:00","8:00 – 8:30","8:30 – 9:00","9:00 – 9:30","9:30 – 10:00",
  "REHAT","10:30 – 11:00","11:00 – 11:30","11:30 – 12:00","12:00 – 12:30","12:30 – 1:00"
];

// each row = [Isnin, Selasa, Rabu, Khamis, Jumaat]


// ─── TOAST NOTIFICATION ──────────────────────────────────────────────────────
let _setToast = null;
function toast(msg, type = "error") { _setToast?.({ msg, type, id: Date.now() }); }

function Toast() {
  const [t, setT] = useState(null);
  useEffect(() => { _setToast = setT; }, []);
  useEffect(() => {
    if (!t) return;
    const id = setTimeout(() => setT(null), 4000);
    return () => clearTimeout(id);
  }, [t]);
  if (!t) return null;
  const isErr = t.type === "error";
  return (
    <div style={{
      position:"fixed", bottom:28, right:28, zIndex:9999,
      background: isErr ? "#ef4444" : "#22c55e",
      color:"white", padding:"12px 20px", borderRadius:14,
      fontWeight:700, fontSize:13, boxShadow:"0 4px 24px rgba(0,0,0,0.25)",
      fontFamily:"'Nunito',sans-serif", maxWidth:340,
      animation:"fadeIn 0.2s ease",
    }}>
      {isErr ? "❌ " : "✅ "}{t.msg}
    </div>
  );
}

// ─── DB HELPER ───────────────────────────────────────────────────────────────
async function dbRun(fn) {
  try {
    const result = await fn();
    if (result?.error) {
      toast(result.error.message || "Ralat Supabase — semak RLS policy");
      return false;
    }
    return true;
  } catch (e) {
    toast(e?.message || "Gagal sambung ke pelayan — semak internet");
    return false;
  }
}

// ─── ANIMATED COUNT ──────────────────────────────────────────────────────────
function Count({ to, suffix="" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let n = 0;
    const step = to / 36;
    const t = setInterval(() => {
      n += step;
      if (n >= to) { setV(to); clearInterval(t); }
      else setV(Math.floor(n));
    }, 28);
    return () => clearInterval(t);
  }, [to]);
  return <>{v.toLocaleString()}{suffix}</>;
}

// ─── WAVY SVG ────────────────────────────────────────────────────────────────
function Wave({ flip = false }) {
  return (
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none"
      style={{ width:"100%", height:32, display:"block", transform: flip?"scaleY(-1)":"none" }}>
      <path d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z"
        style={{fill:"var(--bg)"}}/>
    </svg>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Fredoka+One&display=swap');

/* ══ THEME TOKENS ══════════════════════════════════════════════════════════ */
:root {
  --bg:           #eef4ff;
  --bg2:          #f8faff;
  --surface:      #ffffff;
  --surface-s:    #ffffff;
  --border:       #1e293b;
  --border-s:     #1e293b;
  --divider:      #dbeafe;
  --shadow:       3px 3px 0 #1e293b;
  --shadow-md:    4px 4px 0 #1e293b;
  --shadow-lg:    6px 6px 0 #1e293b;
  --text:         #0f172a;
  --text2:        #334155;
  --text3:        #64748b;
  --accent:       #2563eb;
  --accent2:      #ef4444;
  --accent-lt:    #dbeafe;
  --accent-ring:  rgba(37,99,235,0.25);
  --sb-bg:        #1e40af;
  --tb-bg:        #ffffff;
  --input-bg:     #f8faff;
  --input-br:     #1e293b;
  --scroll:       #93c5fd;
  --blur:         none;
}

[data-theme="dark"] {
  --bg:           #0d1526;
  --bg2:          #111c35;
  --surface:      #1a2540;
  --surface-s:    #1a2540;
  --border:       #60a5fa;
  --border-s:     #60a5fa;
  --divider:      rgba(96,165,250,0.2);
  --shadow:       3px 3px 0 #60a5fa;
  --shadow-md:    4px 4px 0 #60a5fa;
  --shadow-lg:    6px 6px 0 #60a5fa;
  --text:         #f0f6ff;
  --text2:        #bfdbfe;
  --text3:        #60a5fa;
  --accent:       #60a5fa;
  --accent2:      #f87171;
  --accent-lt:    rgba(96,165,250,0.15);
  --accent-ring:  rgba(96,165,250,0.3);
  --sb-bg:        #0f1f4a;
  --tb-bg:        #111c35;
  --input-bg:     #1a2540;
  --input-br:     #60a5fa;
  --scroll:       #3b82f6;
  --blur:         none;
}

/* ══ BASE ══════════════════════════════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
html { font-size:16px; }

body {
  font-family: 'Nunito', sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
  min-height: 100vh;
  transition: background 0.35s, color 0.35s;
  position: relative;
  background-image: radial-gradient(var(--divider) 1.5px, transparent 1.5px);
  background-size: 28px 28px;
}

::-webkit-scrollbar { width:6px; }
::-webkit-scrollbar-thumb { background:var(--accent); border-radius:99px; border:2px solid var(--bg); }

/* ══ KEYFRAMES ═════════════════════════════════════════════════════════════ */
@keyframes float {
  0%,100% { transform:translateY(0) rotate(-1deg); }
  50%      { transform:translateY(-10px) rotate(1deg); }
}
@keyframes wiggle {
  0%,100% { transform:rotate(-4deg); }
  50%     { transform:rotate(4deg); }
}
@keyframes pop {
  0%   { transform:scale(0.7) rotate(-3deg); opacity:0; }
  70%  { transform:scale(1.08) rotate(1deg); opacity:1; }
  100% { transform:scale(1) rotate(0deg); opacity:1; }
}
@keyframes slideUp {
  0%   { transform:translateY(24px); opacity:0; }
  100% { transform:translateY(0); opacity:1; }
}
@keyframes bounce-in {
  0%   { transform:scale(0.8); opacity:0; }
  60%  { transform:scale(1.1); opacity:1; }
  100% { transform:scale(1); }
}
@keyframes pulse-ring {
  0%,100% { box-shadow: var(--shadow), 0 0 0 0 var(--accent-ring); }
  50%     { box-shadow: var(--shadow), 0 0 0 6px transparent; }
}
@keyframes cycleIn {
  0%   { opacity:0; transform:translateY(10px); }
  18%  { opacity:1; transform:translateY(0); }
  78%  { opacity:1; transform:translateY(0); }
  100% { opacity:0; transform:translateY(-10px); }
}
@keyframes spin-slow {
  from { transform:rotate(0deg); }
  to   { transform:rotate(360deg); }
}
@keyframes wobble {
  0%,100% { transform:rotate(0deg); }
  20%  { transform:rotate(-8deg); }
  40%  { transform:rotate(6deg); }
  60%  { transform:rotate(-4deg); }
  80%  { transform:rotate(2deg); }
}

.cycle-text {
  display:inline-block;
  animation: cycleIn 3.8s cubic-bezier(.4,0,.2,1) forwards;
}

/* ══ CARD UTILITY ══════════════════════════════════════════════════════════ */
.glass {
  background: var(--surface);
  border: 2.5px solid var(--border);
  box-shadow: var(--shadow);
  transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
}

/* ══════════════════════════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════════════════════════ */
.login-page {
  min-height:100vh;
  display:flex; align-items:center; justify-content:center;
  padding:20px 16px;
  background:#2563eb;
  background-image:
    radial-gradient(rgba(255,255,255,0.12) 2px, transparent 2px),
    radial-gradient(rgba(239,68,68,0.18) 2px, transparent 2px);
  background-size: 32px 32px, 64px 64px;
  background-position: 0 0, 16px 16px;
  position:relative; overflow:hidden;
}

.blob {
  position:absolute; border-radius:50%;
  pointer-events:none; border:4px solid rgba(255,255,255,0.2);
  animation:float 5s ease-in-out infinite;
}

.login-card {
  position:relative; z-index:1;
  width:100%; max-width:420px;
  background:#ffffff;
  border-radius:24px;
  padding:36px 28px 32px;
  border:3px solid #0f172a;
  box-shadow:6px 6px 0 #0f172a;
  animation:pop 0.4s cubic-bezier(.34,1.56,.64,1) both;
}

.lc-logo { display:flex; align-items:center; gap:12px; margin-bottom:24px; }
.lc-mark {
  width:54px; height:54px; border-radius:16px; flex-shrink:0;
  background:#2563eb;
  display:flex; align-items:center; justify-content:center;
  font-size:26px;
  border:3px solid #0f172a;
  box-shadow:3px 3px 0 #0f172a;
  animation:wiggle 2.5s ease-in-out infinite;
}
.lc-name { font-family:'Fredoka One',cursive; font-size:20px; color:#0f172a; letter-spacing:0.02em; }
.lc-school { font-size:12px; color:#64748b; font-weight:800; margin-top:1px; }

.lc-greet { margin-bottom:20px; padding-bottom:20px; border-bottom:3px dashed #bfdbfe; }
.lc-greet h1 {
  font-family:'Fredoka One',cursive;
  font-size:26px; color:#0f172a;
  margin-bottom:4px; line-height:1.2; letter-spacing:0.02em;
}
.lc-greet p { font-size:14px; color:#475569; font-weight:700; }

.lc-hint {
  background:#fef9c3;
  border:2.5px solid #0f172a; border-radius:14px;
  box-shadow:3px 3px 0 #0f172a;
  padding:12px 14px; margin-bottom:20px;
  display:flex; align-items:flex-start; gap:10px;
}
.lc-hint-ico { font-size:22px; flex-shrink:0; animation:wiggle 2s ease-in-out infinite; }
.lc-hint-body { font-size:13px; color:#713f12; font-weight:800; line-height:1.5; }
.lc-hint-body small { display:block; font-weight:700; color:#92400e; margin-top:3px; }

.lc-field { margin-bottom:14px; }
.lc-label {
  display:block; font-size:11.5px; font-weight:900;
  color:#2563eb; letter-spacing:0.08em;
  text-transform:uppercase; margin-bottom:7px;
}
.lc-input {
  width:100%; padding:12px 15px;
  background:#f8faff; border:2.5px solid #0f172a; border-radius:12px;
  font-size:15px; font-weight:800;
  font-family:'Nunito',sans-serif; color:#0f172a;
  outline:none; transition:all 0.18s;
  box-shadow:2px 2px 0 #0f172a;
}
.lc-input:focus { border-color:#2563eb; box-shadow:2px 2px 0 #2563eb, 0 0 0 4px rgba(37,99,235,0.15); background:white; }
.lc-input::placeholder { color:#94a3b8; font-weight:600; }

.lc-pw { position:relative; }
.lc-pw .lc-input { padding-right:50px; }
.lc-pw-btn {
  position:absolute; right:13px; top:50%; transform:translateY(-50%);
  background:none; border:none; cursor:pointer; font-size:20px; padding:4px;
  transition:transform 0.15s;
}
.lc-pw-btn:hover { transform:translateY(-50%) scale(1.2) rotate(-10deg); }

.lc-err {
  background:#fef2f2; border:2.5px solid #ef4444;
  border-radius:12px; padding:11px 14px;
  box-shadow:3px 3px 0 #ef4444;
  font-size:13.5px; color:#dc2626; font-weight:800;
  margin-bottom:14px; display:flex; gap:8px; align-items:center;
}
.lc-btn {
  width:100%; padding:14px;
  background:#2563eb;
  border:2.5px solid #0f172a; border-radius:14px;
  color:white; font-size:16px; font-weight:900;
  font-family:'Nunito',sans-serif;
  cursor:pointer; margin-top:4px;
  box-shadow:4px 4px 0 #0f172a;
  transition:all 0.15s; letter-spacing:0.03em;
}
.lc-btn:hover:not(:disabled) { transform:translate(-2px,-2px); box-shadow:6px 6px 0 #0f172a; }
.lc-btn:active { transform:translate(2px,2px); box-shadow:2px 2px 0 #0f172a; }
.lc-btn:disabled { opacity:0.6; cursor:not-allowed; }
.lc-foot { text-align:center; margin-top:18px; font-size:12px; color:#94a3b8; font-weight:700; }

/* ══════════════════════════════════════════════════════════════════════════
   APP SHELL
══════════════════════════════════════════════════════════════════════════ */
.app { display:flex; min-height:100vh; }

/* ── SIDEBAR ── */
.sidebar {
  width:262px; flex-shrink:0;
  background:var(--sb-bg);
  border-right:3px solid var(--border);
  display:flex; flex-direction:column;
  height:100vh; position:sticky; top:0;
  overflow-y:auto;
  box-shadow:4px 0 0 var(--border);
  transition:transform 0.3s cubic-bezier(.34,1.56,.64,1);
  z-index:200;
}
.sb-overlay {
  display:none; position:fixed; inset:0;
  background:rgba(5,11,25,0.6); z-index:190;
}

.sb-top {
  padding:18px 16px 14px;
  border-bottom:2.5px solid rgba(255,255,255,0.15);
}
.sb-logo { display:flex; align-items:center; gap:10px; }
.sb-mark {
  width:42px; height:42px; border-radius:14px; flex-shrink:0;
  background:#ef4444;
  display:flex; align-items:center; justify-content:center;
  font-size:22px;
  border:2.5px solid rgba(255,255,255,0.4);
  box-shadow:3px 3px 0 rgba(0,0,0,0.2);
  animation:wobble 4s ease-in-out infinite;
}
.sb-name { font-family:'Fredoka One',cursive; font-size:15px; color:#ffffff; letter-spacing:0.03em; }
.sb-school { font-size:11px; color:rgba(255,255,255,0.65); font-weight:700; margin-top:1px; }

.sb-mood {
  margin-top:12px; padding:10px 12px;
  background:rgba(255,255,255,0.12);
  border:2px dashed rgba(255,255,255,0.3);
  border-radius:14px;
  display:flex; align-items:center; gap:8px;
}
.sb-mood-ico { font-size:20px; animation:float 3s ease-in-out infinite; }
.sb-mood-text { font-size:12px; font-weight:800; color:rgba(255,255,255,0.9); line-height:1.3; }

.sb-nav { flex:1; padding:10px; overflow-y:auto; }
.sb-sec-lbl {
  font-size:9.5px; font-weight:900; color:rgba(255,255,255,0.5);
  letter-spacing:0.14em; text-transform:uppercase;
  padding:14px 8px 5px;
}
.sb-btn {
  width:100%; display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:12px; margin-bottom:3px;
  background:transparent; border:none; cursor:pointer;
  color:rgba(255,255,255,0.75); font-size:13.5px; font-weight:800;
  font-family:'Nunito',sans-serif; text-align:left;
  transition:all 0.15s;
}
.sb-btn:hover { background:rgba(255,255,255,0.15); color:#ffffff; transform:translateX(3px); }
.sb-btn.dash {
  background:rgba(255,255,255,0.18); color:#ffffff;
  border:2px solid rgba(255,255,255,0.3);
}
.sb-btn.act {
  background:rgba(255,255,255,0.18); color:#ffffff;
  border-left:4px solid #fbbf24;
}
.sb-ico { font-size:17px; width:24px; text-align:center; flex-shrink:0; }
.sb-chev { margin-left:auto; font-size:10px; color:rgba(255,255,255,0.4); font-weight:900; transition:transform 0.2s; }
.sb-chev.open { transform:rotate(90deg); }

.subnav { padding-left:10px; margin-left:22px; border-left:2.5px dashed rgba(255,255,255,0.2); padding-bottom:3px; }
.sub-btn {
  width:100%; display:flex; align-items:center; gap:8px;
  padding:7px 10px; border-radius:10px; margin-bottom:2px;
  background:transparent; border:none; cursor:pointer;
  color:rgba(255,255,255,0.65); font-size:13px; font-weight:700;
  font-family:'Nunito',sans-serif; text-align:left; transition:all 0.12s;
}
.sub-btn:hover { color:#ffffff; background:rgba(255,255,255,0.12); transform:translateX(2px); }
.sub-btn.act { color:#fbbf24; background:rgba(251,191,36,0.12); font-weight:900; }
.sub-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; opacity:0.6; }

.sb-foot {
  padding:12px 10px;
  border-top:2px solid rgba(255,255,255,0.15);
}
.sb-user {
  display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:14px;
  background:rgba(255,255,255,0.12);
  border:2px solid rgba(255,255,255,0.2);
  margin-bottom:8px;
}
.sb-av {
  width:38px; height:38px; border-radius:12px; flex-shrink:0;
  background:#ef4444;
  display:flex; align-items:center; justify-content:center;
  color:white; font-size:13px; font-weight:900;
  border:2px solid rgba(255,255,255,0.4);
  box-shadow:2px 2px 0 rgba(0,0,0,0.2);
}
.sb-uname { font-size:13px; font-weight:900; color:#ffffff; }
.sb-urole { font-size:11px; color:rgba(255,255,255,0.6); font-weight:700; }
.sb-out {
  width:100%; display:flex; align-items:center; gap:8px;
  padding:9px 12px; border-radius:10px;
  background:transparent; border:2px solid transparent; cursor:pointer;
  color:rgba(255,255,255,0.6); font-size:13.5px; font-weight:800;
  font-family:'Nunito',sans-serif; transition:all 0.15s;
}
.sb-out:hover { background:rgba(239,68,68,0.2); color:#fca5a5; border-color:rgba(239,68,68,0.3); }

/* ── TOPBAR ── */
.topbar {
  height:62px;
  background:var(--tb-bg);
  border-bottom:3px solid var(--border);
  display:flex; align-items:center;
  padding:0 18px; gap:12px;
  position:sticky; top:0; z-index:100;
  box-shadow:0 3px 0 var(--border);
  transition:background 0.25s;
}
.tb-hamburger {
  display:none;
  background:#dbeafe; border:2.5px solid #0f172a; border-radius:10px;
  width:40px; height:40px; align-items:center; justify-content:center;
  cursor:pointer; font-size:19px; flex-shrink:0;
  box-shadow:2px 2px 0 #0f172a;
  transition:all 0.15s;
}
.tb-hamburger:hover { transform:translate(-1px,-1px); box-shadow:3px 3px 0 #0f172a; }
.tb-bread {
  display:flex; align-items:center; gap:6px;
  font-size:13px; color:var(--text2); font-weight:700;
  min-width:0; flex:1;
}
.tb-bread .cur { color:var(--accent); font-weight:900; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tb-sep { color:var(--text3); font-weight:900; flex-shrink:0; }
.tb-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }

.tb-theme {
  width:38px; height:38px; border-radius:10px;
  background:#dbeafe; border:2.5px solid #0f172a;
  display:flex; align-items:center; justify-content:center;
  font-size:17px; cursor:pointer;
  box-shadow:2px 2px 0 #0f172a;
  transition:all 0.15s; flex-shrink:0;
}
.tb-theme:hover { transform:translate(-1px,-1px) rotate(15deg); box-shadow:3px 3px 0 #0f172a; }

.tb-notif {
  width:38px; height:38px; border-radius:10px;
  background:#fee2e2; border:2.5px solid #0f172a;
  display:flex; align-items:center; justify-content:center;
  font-size:18px; cursor:pointer; position:relative;
  box-shadow:2px 2px 0 #0f172a;
  transition:all 0.15s;
}
.tb-notif:hover { transform:translate(-1px,-1px) rotate(-10deg); box-shadow:3px 3px 0 #0f172a; }
.tb-dot { position:absolute; top:5px; right:5px; width:9px; height:9px; border-radius:50%; background:#ef4444; border:2px solid white; }
.tb-user {
  display:flex; align-items:center; gap:8px;
  padding:5px 12px 5px 5px; border-radius:30px;
  background:#dbeafe; border:2.5px solid #0f172a; cursor:pointer;
  box-shadow:2px 2px 0 #0f172a;
  transition:all 0.15s;
}
.tb-user:hover { transform:translate(-1px,-1px); box-shadow:3px 3px 0 #0f172a; }
.tb-uav {
  width:30px; height:30px; border-radius:50%;
  background:#2563eb; border:2px solid #0f172a;
  display:flex; align-items:center; justify-content:center;
  color:white; font-size:11px; font-weight:900; flex-shrink:0;
}
.tb-uname { font-size:13px; font-weight:900; color:var(--text); white-space:nowrap; }

/* ── CONTENT ── */
.main { flex:1; min-width:0; display:flex; flex-direction:column; }
.content { flex:1; padding:20px 18px 40px; }

/* ── HERO ── */
.hero {
  border-radius:20px; margin-bottom:6px;
  background:#2563eb;
  color:white; position:relative; overflow:hidden;
  border:3px solid #0f172a;
  box-shadow:5px 5px 0 #0f172a;
  animation:slideUp 0.4s cubic-bezier(.34,1.56,.64,1) both;
}
.hero-glow { display:none; }
.hero-dots {
  position:absolute; inset:0; pointer-events:none;
  background-image:radial-gradient(rgba(255,255,255,0.15) 1.5px,transparent 1.5px);
  background-size:18px 18px;
}
.hero-body { padding:26px 22px 0; position:relative; z-index:1; }
.hero-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; }
.hero-emoji { font-size:56px; animation:float 3.5s ease-in-out infinite; line-height:1; flex-shrink:0; }
.hero-title {
  font-family:'Fredoka One',cursive;
  font-size:24px; margin-bottom:6px; line-height:1.2; letter-spacing:0.02em;
}
.hero-sub { font-size:14px; opacity:0.85; font-weight:700; min-height:22px; }
.hero-date { font-size:12px; opacity:0.55; margin-top:5px; font-weight:700; }
.hero-tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; margin-bottom:26px; }
.hero-tag {
  display:flex; align-items:center; gap:5px;
  background:rgba(255,255,255,0.18);
  border:2px solid rgba(255,255,255,0.35);
  border-radius:30px; padding:5px 14px;
  font-size:12px; font-weight:800;
  transition:background 0.15s;
}
.hero-tag:hover { background:rgba(255,255,255,0.28); transform:scale(1.05); }

/* ── BENTO STATS ── */
.bento-grid {
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:12px; margin-bottom:20px;
}
.bento-card {
  background:var(--surface);
  border:2.5px solid var(--border);
  border-radius:18px; padding:18px 16px;
  position:relative; overflow:hidden;
  box-shadow:var(--shadow);
  transition:all 0.15s;
  animation:slideUp 0.4s ease both;
}
.bento-card:hover {
  transform:translate(-2px,-2px);
  box-shadow:var(--shadow-lg);
}
.bento-accent-bar {
  position:absolute; left:0; top:0; bottom:0; width:5px; border-radius:16px 0 0 16px;
}
.bento-bg-circle {
  position:absolute; border-radius:50%; right:-18px; bottom:-18px;
  width:80px; height:80px; opacity:0.08;
}
.bento-ico { font-size:30px; margin-bottom:8px; display:block; }
.bento-val {
  font-family:'Fredoka One',cursive;
  font-size:30px; color:var(--text); line-height:1; letter-spacing:0.02em;
}
.bento-lbl { font-size:13px; color:var(--text2); font-weight:800; margin-top:4px; }
.bento-note {
  font-size:11.5px; font-weight:800; margin-top:10px;
  padding-top:10px; border-top:2px dashed var(--divider);
  display:flex; align-items:center; gap:5px;
}

/* featured bento card — spans 2 cols */
.bento-featured {
  grid-column:span 2;
  padding:22px 20px;
  background:#eff6ff;
  border-color:#2563eb;
  box-shadow:4px 4px 0 #2563eb;
}
[data-theme="dark"] .bento-featured {
  background:rgba(37,99,235,0.1);
  border-color:#60a5fa;
  box-shadow:4px 4px 0 #60a5fa;
}
.bento-featured .bento-val { font-size:40px; }
.bento-featured .bento-lbl { font-size:14px; }
.bento-featured-inner { display:flex; align-items:center; justify-content:space-between; }
.bento-featured-left {}
.bento-featured-right { text-align:right; }
.bento-progress {
  width:120px; height:10px; border-radius:99px;
  background:var(--divider); margin-top:8px; overflow:hidden;
  margin-left:auto; border:2px solid var(--border);
}
.bento-progress-fill {
  height:100%; border-radius:99px;
  background:#22c55e;
}

/* ── SECTION HEADER ── */
.sec-hd {
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:12px; margin-top:22px;
}
.sec-title {
  font-family:'Fredoka One',cursive;
  font-size:18px; color:var(--text);
  display:flex; align-items:center; gap:8px;
  letter-spacing:0.02em;
}
.sec-sub { font-size:12.5px; color:var(--text3); font-weight:700; }

/* ── UPDATES ── */
.updates { display:flex; flex-direction:column; gap:10px; margin-bottom:4px; }
.upd-card {
  background:var(--surface);
  border:2.5px solid var(--border);
  border-radius:14px; padding:13px 15px;
  display:flex; align-items:center; gap:12px;
  box-shadow:var(--shadow);
  transition:all 0.15s; animation:slideUp 0.4s ease both;
}
.upd-card:hover {
  transform:translate(-2px,-2px);
  box-shadow:var(--shadow-md);
}
.upd-ico {
  width:42px; height:42px; border-radius:12px;
  display:flex; align-items:center; justify-content:center;
  font-size:20px; flex-shrink:0;
  border:2px solid var(--border);
  transition:transform 0.2s;
}
.upd-card:hover .upd-ico { transform:scale(1.15) rotate(-8deg); }
.upd-text { flex:1; font-size:13.5px; font-weight:800; color:var(--text); }
.upd-tag { font-size:11.5px; font-weight:900; padding:4px 11px; border-radius:20px; white-space:nowrap; flex-shrink:0; border:2px solid currentColor; }

/* ── MODULE CARDS ── */
.mods-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.mc {
  background:var(--surface);
  border:2.5px solid var(--border);
  border-radius:18px; padding:16px 15px;
  cursor:pointer; box-shadow:var(--shadow);
  transition:all 0.15s; position:relative; overflow:hidden;
  animation:slideUp 0.4s ease both;
}
.mc:hover {
  transform:translate(-3px,-3px);
  box-shadow:var(--shadow-lg);
}
.mc-blob {
  position:absolute; bottom:-20px; right:-20px;
  width:90px; height:90px; border-radius:50%; opacity:0.08;
  transition:transform 0.3s;
}
.mc:hover .mc-blob { transform:scale(1.3); }
.mc-tag {
  display:inline-flex; align-items:center; gap:4px;
  font-size:10.5px; font-weight:900; padding:3px 10px;
  border-radius:20px; margin-bottom:10px;
  border:2px solid currentColor;
}
.mc-ico-wrap { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.mc-ico {
  width:48px; height:48px; border-radius:14px;
  font-size:24px; display:flex; align-items:center; justify-content:center;
  border:2.5px solid var(--border); box-shadow:2px 2px 0 var(--border);
  transition:transform 0.2s;
}
.mc:hover .mc-ico { transform:scale(1.1) rotate(-8deg); }
.mc-count {
  font-family:'Fredoka One',cursive;
  font-size:12px; color:var(--text2);
  background:var(--accent-lt); border:2px solid var(--border);
  border-radius:20px; padding:3px 10px;
}
.mc-name {
  font-family:'Fredoka One',cursive;
  font-size:15px; color:var(--text);
  margin-bottom:10px; letter-spacing:0.02em;
}
.mc-pills { display:flex; flex-wrap:wrap; gap:5px; }
.mc-pill {
  padding:4px 10px; border-radius:8px;
  font-size:11.5px; font-weight:800; cursor:pointer;
  transition:all 0.12s; border:1.5px solid transparent;
}
.mc-pill:hover { transform:scale(1.08) rotate(-2deg); }
.mc-more { padding:4px 10px; border-radius:8px; font-size:11.5px; font-weight:800; background:var(--accent-lt); color:var(--accent); border:1.5px solid var(--accent); }

/* ── PAGE VIEW ── */
.pg-top { display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
.pg-chip {
  display:flex; align-items:center; gap:5px;
  padding:5px 12px; border-radius:20px; border:2px solid currentColor;
  font-size:12px; font-weight:900; cursor:pointer; transition:all 0.15s;
}
.pg-chip:hover { transform:scale(1.06) rotate(-1deg); }
.pg-sep { color:var(--text3); font-weight:900; font-size:14px; }
.pg-title {
  font-family:'Fredoka One',cursive;
  font-size:26px; color:var(--text);
  margin-bottom:4px; letter-spacing:0.02em;
}
.pg-sub { font-size:14px; color:var(--text2); font-weight:800; margin-bottom:20px; }
.pg-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px; }
.pgs {
  background:var(--surface);
  border:2.5px solid var(--border);
  border-radius:16px; padding:16px 12px;
  text-align:center;
  box-shadow:var(--shadow);
  transition:all 0.15s;
}
.pgs:hover { transform:translate(-2px,-2px); box-shadow:var(--shadow-md); }
.pgs-ico { font-size:28px; margin-bottom:8px; display:block; }
.pgs-val { font-family:'Fredoka One',cursive; font-size:22px; color:var(--text); letter-spacing:0.02em; }
.pgs-lbl { font-size:12px; color:var(--text3); font-weight:800; margin-top:3px; }

.placeholder {
  background:var(--surface);
  border-radius:20px; border:3px dashed var(--accent);
  padding:54px 28px; text-align:center;
  box-shadow:var(--shadow);
  position:relative; overflow:hidden;
}
.ph-float { position:absolute; border-radius:50%; pointer-events:none; opacity:0.05; }
.ph-ico {
  width:84px; height:84px; border-radius:22px;
  font-size:40px; display:inline-flex; align-items:center; justify-content:center;
  margin-bottom:18px;
  animation:float 3.5s ease-in-out infinite;
  border:3px solid var(--border); box-shadow:4px 4px 0 var(--border);
}
.ph-title {
  font-family:'Fredoka One',cursive;
  font-size:22px; color:var(--text);
  margin-bottom:10px; letter-spacing:0.02em;
}
.ph-text { font-size:14.5px; color:var(--text2); font-weight:700; line-height:1.7; max-width:340px; margin:0 auto 24px; }
.ph-btn {
  display:inline-flex; align-items:center; gap:8px;
  background:var(--accent); border:2.5px solid #0f172a;
  border-radius:12px; padding:12px 24px;
  font-size:14px; font-weight:900; color:white;
  font-family:'Nunito',sans-serif;
  box-shadow:3px 3px 0 #0f172a;
  transition:all 0.15s;
}
.ph-btn:hover { transform:translate(-2px,-2px); box-shadow:5px 5px 0 #0f172a; }

/* ══════════════════════════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════════════════════════ */
@media (max-width:768px) {
  .sidebar { position:fixed; left:0; top:0; bottom:0; transform:translateX(-100%); }
  .sidebar.open { transform:translateX(0); }
  .sb-overlay.open { display:block; }
  .tb-hamburger { display:flex; }
  .tb-uname { display:none; }
  .content { padding:16px 12px 36px; }
  .hero-body { padding:20px 16px 0; }
  .hero-title { font-size:20px; }
  .hero-emoji { font-size:40px; }
  .bento-grid { gap:10px; }
  .bento-featured { grid-column:span 2; }
  .bento-featured .bento-val { font-size:30px; }
  .bento-progress { width:80px; }
  .mods-grid { gap:10px; }
  .mc { padding:14px 12px; }
  .pg-stats { gap:8px; }
  .pgs { padding:14px 10px; }
}
@media (max-width:380px) {
  .login-card { padding:28px 16px 24px; }
  .bento-grid { grid-template-columns:1fr; }
  .bento-featured { grid-column:span 1; }
  .mods-grid { grid-template-columns:1fr 1fr; }
}
@media (min-width:769px) {
  .bento-grid { grid-template-columns:repeat(4,1fr); }
  .bento-featured { grid-column:span 2; }
  .mods-grid { grid-template-columns:repeat(3,1fr); }
  .updates { display:grid; grid-template-columns:1fr 1fr; }
}
@media (min-width:1200px) {
  .mods-grid { grid-template-columns:repeat(3,1fr); }
}

/* ══ KURIKULUM PAGES ══════════════════════════════════════════════════════ */
.kur-header {
  display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap;
}
.kur-select {
  padding:9px 14px; border-radius:12px;
  background:var(--surface); border:2.5px solid var(--border);
  color:var(--text); font-size:13px; font-weight:800;
  font-family:'Nunito',sans-serif; cursor:pointer;
  outline:none; box-shadow:var(--shadow); transition:all 0.15s;
}
.kur-select:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-ring); }
.kur-search-wrap { position:relative; flex:1; min-width:180px; }
.kur-search-ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:15px; pointer-events:none; }
.kur-search {
  width:100%; padding:9px 14px 9px 38px;
  border-radius:12px; background:var(--surface); border:2.5px solid var(--border);
  color:var(--text); font-size:13px; font-weight:700;
  font-family:'Nunito',sans-serif;
  outline:none; box-shadow:var(--shadow); transition:all 0.15s;
}
.kur-search:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-ring); }
.kur-search::placeholder { color:var(--text3); }

/* stats row */
.kur-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; }
.kur-stat {
  background:var(--surface);
  border:2.5px solid var(--border); border-radius:14px;
  padding:14px 12px; text-align:center;
  box-shadow:var(--shadow); transition:all 0.15s;
}
.kur-stat:hover { transform:translate(-2px,-2px); box-shadow:var(--shadow-md); }
.kur-stat-ico { font-size:24px; margin-bottom:6px; display:block; }
.kur-stat-val { font-family:'Fredoka One',cursive; font-size:22px; color:var(--text); letter-spacing:0.02em; }
.kur-stat-lbl { font-size:11px; color:var(--text3); font-weight:800; margin-top:2px; }

/* timetable */
.jadual-wrap {
  overflow-x:auto; border-radius:16px;
  border:2.5px solid var(--border); box-shadow:var(--shadow);
}
.jadual-table { width:100%; border-collapse:collapse; min-width:640px; }
.jadual-table th {
  padding:11px 8px; text-align:center;
  font-size:11.5px; font-weight:900; text-transform:uppercase;
  letter-spacing:0.06em; color:var(--accent);
  background:var(--accent-lt); border-bottom:2.5px solid var(--border);
  white-space:nowrap; font-family:'Nunito',sans-serif;
}
.jadual-table th:first-child { text-align:left; padding-left:16px; min-width:110px; }
.jadual-table td {
  padding:7px 5px; text-align:center; vertical-align:middle;
  border-bottom:1.5px solid var(--divider);
  background:var(--surface);
}
.jadual-table td:first-child {
  text-align:left; padding-left:16px;
  font-size:11.5px; font-weight:900; color:var(--text2);
  white-space:nowrap; background:var(--accent-lt);
  border-right:2px solid var(--border);
}
.jadual-table tr:last-child td { border-bottom:none; }
.jadual-cell {
  display:inline-flex; flex-direction:column; align-items:center;
  padding:6px 8px; border-radius:10px; min-width:82px;
  cursor:default; transition:all 0.15s;
}
.jadual-cell:hover { transform:scale(1.08) rotate(-2deg); box-shadow:var(--shadow-md); }
.jadual-cell-sub { font-size:11.5px; font-weight:900; color:var(--text); }
.jadual-cell-guru { font-size:10px; font-weight:700; color:var(--text2); margin-top:1px; }
.jadual-rehat td {
  padding:6px 16px !important;
  background:#dbeafe !important;
  font-size:10.5px; font-weight:900; color:#2563eb !important;
  letter-spacing:0.12em; text-transform:uppercase; font-family:'Nunito',sans-serif;
}
.j-match .jadual-cell { outline:2.5px solid var(--accent); outline-offset:2px; border-radius:10px; }
.j-dim { opacity:0.2; pointer-events:none; }

/* panitia grid */
.panitia-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.panitia-card {
  background:var(--surface);
  border:2.5px solid var(--border); border-radius:16px;
  padding:16px 14px; box-shadow:var(--shadow); transition:all 0.15s;
}
.panitia-card:hover { transform:translate(-2px,-2px); box-shadow:var(--shadow-md); }
.panitia-head { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.panitia-ico { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:21px; flex-shrink:0; border:2.5px solid var(--border); box-shadow:2px 2px 0 var(--border); }
.panitia-name { font-family:'Fredoka One',cursive; font-size:15px; color:var(--text); letter-spacing:0.02em; }
.panitia-ketua { font-size:12px; color:var(--text2); font-weight:700; }
.panitia-body { font-size:12.5px; color:var(--text2); margin-bottom:10px; font-weight:700; }
.panitia-foot { display:flex; gap:6px; flex-wrap:wrap; }

/* generic table */
.kur-table-wrap {
  overflow-x:auto; border-radius:14px;
  border:2.5px solid var(--border); box-shadow:var(--shadow);
}
.kur-table { width:100%; border-collapse:collapse; min-width:480px; }
.kur-table th {
  padding:11px 14px; text-align:left;
  font-size:11px; font-weight:900; text-transform:uppercase;
  letter-spacing:0.07em; color:var(--accent);
  background:var(--accent-lt); border-bottom:2.5px solid var(--border);
  white-space:nowrap; font-family:'Nunito',sans-serif;
}
.kur-table td {
  padding:11px 14px; font-size:13px; font-weight:700;
  color:var(--text); border-bottom:1.5px solid var(--divider);
  background:var(--surface);
}
.kur-table tr:last-child td { border-bottom:none; }
.kur-table tr:hover td { background:var(--accent-lt); }

/* badges */
.badge { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:900; white-space:nowrap; display:inline-block; border:2px solid currentColor; }
.b-green  { background:#f0fdf4; color:#15803d; }
.b-yellow { background:#fffbeb; color:#a16207; }
.b-red    { background:#fef2f2; color:#dc2626; }
.b-blue   { background:#eff6ff; color:#1d4ed8; }
.b-purple { background:#f5f3ff; color:#6d28d9; }
.b-gray   { background:#f8fafc; color:#475569; }
[data-theme="dark"] .b-green  { background:rgba(34,197,94,0.15);  color:#4ade80; }
[data-theme="dark"] .b-yellow { background:rgba(234,179,8,0.15);  color:#facc15; }
[data-theme="dark"] .b-red    { background:rgba(239,68,68,0.15);  color:#f87171; }
[data-theme="dark"] .b-blue   { background:rgba(59,130,246,0.15); color:#60a5fa; }
[data-theme="dark"] .b-purple { background:rgba(139,92,246,0.15); color:#a78bfa; }
[data-theme="dark"] .b-gray   { background:rgba(71,85,105,0.2);   color:#94a3b8; }

/* nilam/progress bar */
.nilam-bar-wrap { width:100%; height:10px; border-radius:99px; background:var(--divider); overflow:hidden; margin-top:5px; border:2px solid var(--border); }
.nilam-bar { height:100%; border-radius:99px; background:#2563eb; }

/* program card */
.prog-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.prog-card {
  background:var(--surface);
  border:2.5px solid var(--border); border-radius:16px;
  padding:16px 14px; box-shadow:var(--shadow); transition:all 0.15s;
  position:relative; overflow:hidden;
}
.prog-card:hover { transform:translate(-2px,-2px); box-shadow:var(--shadow-md); }
.prog-card-accent { position:absolute; top:0; left:0; right:0; height:5px; border-radius:14px 14px 0 0; }
.prog-title { font-family:'Fredoka One',cursive; font-size:15px; color:var(--text); margin-bottom:5px; letter-spacing:0.02em; }
.prog-date { font-size:12px; color:var(--text3); font-weight:800; margin-bottom:8px; }
.prog-desc { font-size:12.5px; color:var(--text2); line-height:1.6; font-weight:700; }

@media (min-width:769px) {
  .panitia-grid { grid-template-columns:repeat(4,1fr); }
  .kur-stats { grid-template-columns:repeat(4,1fr); }
  .prog-grid { grid-template-columns:repeat(3,1fr); }
}
@media (max-width:600px) {
  .panitia-grid { grid-template-columns:1fr 1fr; }
  .prog-grid { grid-template-columns:1fr; }
}

/* ── MODAL ── */
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal-overlay {
  position:fixed; inset:0; z-index:1000;
  background:rgba(0,0,0,0.5);
  display:flex; align-items:center; justify-content:center;
  padding:20px; animation:fadeIn 0.15s ease;
}
.modal-card {
  background:var(--surface-s); border:3px solid var(--border);
  border-radius:20px; width:100%; max-width:440px;
  box-shadow:6px 6px 0 var(--border);
  animation:pop 0.3s cubic-bezier(.34,1.56,.64,1) both;
}
.modal-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px; border-bottom:2.5px solid var(--divider);
}
.modal-title { font-family:'Fredoka One',cursive; font-size:17px; color:var(--text); letter-spacing:0.02em; }
.modal-close {
  width:30px; height:30px; border-radius:8px;
  background:#fee2e2; border:2px solid var(--border);
  color:#dc2626; cursor:pointer; font-size:13px;
  box-shadow:2px 2px 0 var(--border);
  display:flex; align-items:center; justify-content:center; transition:all 0.12s;
}
.modal-close:hover { transform:translate(-1px,-1px); box-shadow:3px 3px 0 var(--border); }
.modal-body { padding:20px; }

/* Forms */
.form-field { margin-bottom:12px; }
.form-label { display:block; font-size:11px; font-weight:900; color:var(--accent); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px; }
.form-input {
  width:100%; padding:9px 13px;
  background:var(--input-bg); border:2.5px solid var(--input-br);
  border-radius:10px; color:var(--text);
  font-size:13px; font-weight:700;
  font-family:'Nunito',sans-serif;
  outline:none; transition:all 0.15s;
  box-shadow:2px 2px 0 var(--border);
}
.form-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-ring); }
.form-input:disabled { opacity:0.5; cursor:not-allowed; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.btn-primary {
  width:100%; padding:11px;
  background:var(--accent);
  border:2.5px solid #0f172a; border-radius:12px;
  color:white; font-size:14px; font-weight:900;
  font-family:'Nunito',sans-serif;
  cursor:pointer; margin-top:4px;
  box-shadow:3px 3px 0 #0f172a; transition:all 0.15s;
}
.btn-primary:hover { transform:translate(-1px,-1px); box-shadow:4px 4px 0 #0f172a; }
.btn-primary:active { transform:translate(1px,1px); box-shadow:2px 2px 0 #0f172a; }
.btn-add {
  display:flex; align-items:center; gap:6px;
  padding:8px 16px; border-radius:10px;
  background:var(--accent); border:2.5px solid #0f172a; color:white;
  font-size:12.5px; font-weight:900;
  font-family:'Nunito',sans-serif;
  cursor:pointer; transition:all 0.15s;
  box-shadow:3px 3px 0 #0f172a;
}
.btn-add:hover { transform:translate(-1px,-1px); box-shadow:4px 4px 0 #0f172a; }
.btn-add:active { transform:translate(1px,1px); box-shadow:2px 2px 0 #0f172a; }
.btn-del {
  padding:4px 9px; border-radius:7px;
  background:transparent; border:2px solid transparent;
  color:var(--text3); font-size:12px; cursor:pointer;
  font-family:'Nunito',sans-serif; font-weight:800; transition:all 0.15s;
}
.btn-del:hover { background:#fee2e2; color:#dc2626; border-color:#fca5a5; }
.loading { padding:48px; text-align:center; color:var(--text3); font-size:15px; font-weight:900; animation:float 2s ease-in-out infinite; font-family:'Fredoka One',cursive; letter-spacing:0.03em; }
`;

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr("");
    if (!email || !pass) { setErr("Sila isi emel dan kata laluan."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    if (email === "guru@sekolah.edu.my" && pass === "password") {
      onLogin({ name: "Ahmad Khairulazwani", role: "Guru ICT" });
    } else setErr("Emel atau kata laluan tidak sah.");
    setLoading(false);
  };

  return (
    <div className="login-page">
      <style>{CSS}</style>
      {[
        { w:240, h:240, bg:"rgba(255,255,255,0.06)", top:"5%",   left:"5%",   delay:"0s" },
        { w:180, h:180, bg:"rgba(99,102,241,0.18)",  bottom:"8%",right:"5%",  delay:"2s" },
        { w:110, h:110, bg:"rgba(255,255,255,0.04)", top:"38%",  right:"14%", delay:"1s" },
        { w:80,  h:80,  bg:"rgba(255,255,255,0.07)", bottom:"28%",left:"9%",  delay:"3s" },
        { w:60,  h:60,  bg:"rgba(14,165,233,0.15)",  top:"60%",  left:"25%",  delay:"1.5s" },
      ].map((b,i) => (
        <div key={i} className="blob" style={{
          width:b.w, height:b.h, background:b.bg,
          top:b.top, left:b.left, bottom:b.bottom, right:b.right,
          animationDelay:b.delay,
        }}/>
      ))}

      <div className="login-card">
        <div className="lc-logo">
          <div className="lc-mark">🏫</div>
          <div>
            <div className="lc-name">EduDashboard</div>
            <div className="lc-school">SK Darau, Kota Kinabalu</div>
          </div>
        </div>

        <div className="lc-greet">
          <h1>Hai, Cikgu! 👋</h1>
          <p>Log masuk untuk akses sistem sekolah.</p>
        </div>

        <div className="lc-hint">
          <span className="lc-hint-ico">💡</span>
          <div className="lc-hint-body">
            Akaun demo:
            <small>guru@sekolah.edu.my &nbsp;·&nbsp; password</small>
          </div>
        </div>

        {err && <div className="lc-err">⚠️ {err}</div>}

        <div className="lc-field">
          <label className="lc-label">Emel</label>
          <input className="lc-input" type="email" placeholder="guru@sekolah.edu.my"
            value={email} onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&submit()} />
        </div>

        <div className="lc-field">
          <label className="lc-label">Kata Laluan</label>
          <div className="lc-pw">
            <input className="lc-input" type={show?"text":"password"} placeholder="••••••••"
              value={pass} onChange={e=>setPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()} />
            <button className="lc-pw-btn" onClick={()=>setShow(!show)}>{show?"🙈":"👁️"}</button>
          </div>
        </div>

        <button className="lc-btn" onClick={submit} disabled={loading}>
          {loading ? "⏳  Sedang masuk..." : "Log Masuk →"}
        </button>

        <div className="lc-foot">SK Darau · Sistem Pengurusan Sekolah 2025</div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose, exp, setExp, actMod, actSub, onNav, user, onLogout }) {
  const greetings = ["Semoga hari cikgu menyeronokkan! ✨","Hebat! Cikgu dah log masuk 🎉","Selamat bertugas, Cikgu! 💪","Jom buat kerja best harini! 🚀"];
  const [g] = useState(() => greetings[Math.floor(Math.random()*greetings.length)]);
  const initials = user.name.split(" ").map(w=>w[0]).join("").slice(0,2);

  return (
    <>
      <div className={`sb-overlay${open?" open":""}`} onClick={onClose}/>
      <aside className={`sidebar${open?" open":""}`}>
        <div className="sb-top">
          <div className="sb-logo">
            <div className="sb-mark">🏫</div>
            <div>
              <div className="sb-name">EduDashboard</div>
              <div className="sb-school">SK Darau, KK</div>
            </div>
          </div>
          <div className="sb-mood">
            <span className="sb-mood-ico">☀️</span>
            <div><div className="sb-mood-text">{g}</div></div>
          </div>
        </div>

        <nav className="sb-nav">
          <button className={`sb-btn${!actMod?" dash":""}`} onClick={()=>{onNav(null,null);onClose();}}>
            <span className="sb-ico">🏠</span> Papan Pemuka
          </button>
          <div className="sb-sec-lbl">Modul Sekolah</div>
          {MODULES.map(m=>(
            <div key={m.id}>
              <button className={`sb-btn${actMod===m.id?" act":""}`}
                onClick={()=>setExp(p=>p===m.id?"":m.id)}>
                <span className="sb-ico">{m.icon}</span>
                <span style={{flex:1}}>{m.label}</span>
                <span className={`sb-chev${exp===m.id?" open":""}`}>▶</span>
              </button>
              {exp===m.id&&(
                <div className="subnav">
                  {m.subs.map((s,i)=>(
                    <button key={m.ids[i]} className={`sub-btn${actSub===m.ids[i]?" act":""}`}
                      onClick={()=>{onNav(m.id,m.ids[i]);onClose();}}>
                      <div className="sub-dot"/> {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sb-foot">
          <div className="sb-user">
            <div className="sb-av">{initials}</div>
            <div>
              <div className="sb-uname">{user.name.split(" ").slice(0,2).join(" ")}</div>
              <div className="sb-urole">{user.role}</div>
            </div>
          </div>
          <button className="sb-out" onClick={onLogout}>🚪 &nbsp;Log Keluar</button>
        </div>
      </aside>
    </>
  );
}

// ─── CYCLING TEXT ─────────────────────────────────────────────────────────────
const CYCLE_MSGS = [
  "Sistem berjalan lancar — jom mulakan hari! ✅",
  "Semua modul aktif dan bersedia 🚀",
  "Mari tingkatkan prestasi sekolah bersama 💪",
  "Hari yang produktif menanti, Cikgu! 🌟",
  "Data sekolah sentiasa dikemaskini 📊",
  "Teruskan kerja cemerlang, Cikgu! 🏆",
];

function CyclingText() {
  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setIdx(i => (i + 1) % CYCLE_MSGS.length);
      setTick(k => k + 1);
    }, 3800);
    return () => clearInterval(t);
  }, []);
  return <span key={tick} className="cycle-text">{CYCLE_MSGS[idx]}</span>;
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function Overview({ onNav, user }) {
  const today = new Date().toLocaleDateString("ms-MY",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const initials = user.name.split(" ").map(w=>w[0]).join("").slice(0,2);
  const greetHour = new Date().getHours();
  const greetWord = greetHour < 12 ? "Selamat Pagi" : greetHour < 17 ? "Selamat Petang" : "Selamat Malam";

  const [liveStats, setLiveStats] = useState({ murid:0, guru:0, aktiviti:0 });
  useEffect(() => {
    async function fetchStats() {
      const [{ count: murid }, { data: guruRows }, { count: aktiviti }] = await Promise.all([
        supabase.from('hem_murid').select('*', { count:'exact', head:true }).eq('status','Aktif'),
        supabase.from('jadual_waktu').select('guru'),
        supabase.from('program_akademik').select('*', { count:'exact', head:true }).eq('status','Akan Datang'),
      ]);
      const uniqueGuru = new Set((guruRows||[]).map(r=>r.guru)).size;
      setLiveStats({ murid: murid||0, guru: uniqueGuru, aktiviti: aktiviti||0 });
    }
    fetchStats();
  }, []);

  const [notisData, setNotisData] = useState([]);
  const [showAddNotis, setShowAddNotis] = useState(false);
  const [notisForm, setNotisForm] = useState({ icon:"📌", teks:"", tag:"Maklumat" });

  const loadNotis = async () => {
    const { data } = await supabase.from('notis').select('*').order('created_at', { ascending:false });
    setNotisData(data||[]);
  };
  useEffect(() => { loadNotis(); }, []);

  const addNotis = async () => {
    if (!notisForm.teks.trim()) return;
    const tagCfg = TAG_OPTS.find(t=>t.lbl===notisForm.tag) || TAG_OPTS[2];
    await supabase.from('notis').insert([{ icon:notisForm.icon, teks:notisForm.teks, tag:notisForm.tag, tc:tagCfg.tc, bg:tagCfg.bg }]);
    setShowAddNotis(false);
    setNotisForm({ icon:"📌", teks:"", tag:"Maklumat" });
    loadNotis();
  };

  const delNotis = async (id) => {
    await supabase.from('notis').delete().eq('id', id);
    setNotisData(d=>d.filter(r=>r.id!==id));
  };

  const STATS = [
    { lbl:"Jumlah Murid",   val:liveStats.murid,    ico:"👦",   color:"#2563eb", featured:true },
    { lbl:"Jumlah Guru",    val:liveStats.guru,     ico:"👩‍🏫",  color:"#0ea5e9" },
    { lbl:"Jumlah Kelas",   val:KELAS_LIST.length,  ico:"🏫",   color:"#6366f1" },
    { lbl:"Aktiviti Aktif", val:liveStats.aktiviti, ico:"📅",   color:"#0284c7" },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-dots"/>
        <div className="hero-glow" style={{width:300,height:300,top:-100,right:-80,background:"#3b82f6"}}/>
        <div className="hero-glow" style={{width:200,height:200,bottom:-60,left:60,background:"#6366f1",animationDelay:"2s"}}/>
        <div className="hero-body">
          <div className="hero-top">
            <div style={{flex:1}}>
              <div className="hero-title">{greetWord}, Cikgu {user.name.split(" ")[0]}! 🎉</div>
              <div className="hero-sub"><CyclingText /></div>
              <div className="hero-date">{today}</div>
              <div className="hero-tags">
                <div className="hero-tag">✅ Semua Modul Aktif</div>
                <div className="hero-tag">📅 Penggal 2 · 2025</div>
                <div className="hero-tag">👋 Hai, {initials}!</div>
              </div>
            </div>
            <div className="hero-emoji">🏫</div>
          </div>
        </div>
        <Wave />
      </div>

      {/* Bento Stats */}
      <div className="bento-grid">
        {STATS.map((s,i)=>(
          <div
            className={`bento-card${s.featured?" bento-featured":""}`}
            key={i}
            style={{animationDelay:`${i*0.08}s`}}
          >
            <div className="bento-accent-bar" style={{background:s.color}}/>
            <div className="bento-bg-circle" style={{background:s.color}}/>
            <>
              <span className="bento-ico">{s.ico}</span>
              <div className="bento-val"><Count to={s.val} suffix={s.suffix||""}/></div>
              <div className="bento-lbl">{s.lbl}</div>
            </>
          </div>
        ))}
      </div>

      {/* Updates */}
      <div className="sec-hd">
        <div className="sec-title">📌 Notis & Kemaskini</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span className="sec-sub">{notisData.length} item</span>
          <button className="btn-add" onClick={()=>setShowAddNotis(true)}>+ Tambah</button>
        </div>
      </div>
      <div className="updates" style={{marginBottom:8}}>
        {notisData.length === 0 && (
          <div style={{textAlign:"center",padding:"24px",color:"var(--text3)",fontWeight:700,fontSize:14}}>
            Tiada notis. Tambah yang pertama!
          </div>
        )}
        {notisData.map((u,i)=>(
          <div className="upd-card" key={u.id} style={{animationDelay:`${i*0.07}s`}}>
            <div className="upd-ico" style={{background:u.bg}}>{u.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="upd-text">{u.teks}</div>
            </div>
            <div className="upd-tag" style={{background:u.bg,color:u.tc}}>{u.tag}</div>
            <button onClick={()=>delNotis(u.id)} style={{marginLeft:8,background:"none",border:"none",cursor:"pointer",fontSize:15,opacity:0.45,lineHeight:1}} title="Padam">🗑️</button>
          </div>
        ))}
      </div>
      {showAddNotis && (
        <Modal title="Tambah Notis" onClose={()=>setShowAddNotis(false)}>
          <div className="form-field">
            <label className="form-label">Ikon</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:4}}>
              {NOTIS_ICONS.map(ic=>(
                <button key={ic} onClick={()=>setNotisForm(f=>({...f,icon:ic}))}
                  style={{fontSize:20,background:notisForm.icon===ic?"var(--accent-lt)":"var(--card)",border:`2px solid ${notisForm.icon===ic?"var(--accent)":"var(--border)"}`,borderRadius:8,padding:"4px 8px",cursor:"pointer"}}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Teks Notis</label>
            <input className="form-input" placeholder="cth: Mesyuarat PKG Jumaat ini 2PM" value={notisForm.teks} onChange={e=>setNotisForm(f=>({...f,teks:e.target.value}))}/>
          </div>
          <div className="form-field">
            <label className="form-label">Tag</label>
            <select className="form-input" value={notisForm.tag} onChange={e=>setNotisForm(f=>({...f,tag:e.target.value}))}>
              {TAG_OPTS.map(t=><option key={t.lbl}>{t.lbl}</option>)}
            </select>
          </div>
          <button className="btn-add" style={{width:"100%",justifyContent:"center"}} onClick={addNotis}>Simpan Notis</button>
        </Modal>
      )}

      {/* Modules */}
      <div className="sec-hd">
        <div className="sec-title">📦 Modul Sekolah</div>
        <span className="sec-sub">6 modul · 36 sub-modul</span>
      </div>
      <div className="mods-grid">
        {MODULES.map((m,i)=>(
          <div className="mc" key={m.id} onClick={()=>onNav(m.id,m.ids[0])} style={{animationDelay:`${i*0.07}s`}}>
            <div className="mc-blob" style={{background:m.color}}/>
            <div className="mc-tag" style={{color:m.color}}>{m.icon} {m.tag}</div>
            <div className="mc-ico-wrap">
              <div className="mc-ico" style={{background:m.light}}>{m.icon}</div>
              <div className="mc-count">{m.subs.length} sub</div>
            </div>
            <div className="mc-name">{m.label}</div>
            <div className="mc-pills">
              {m.subs.slice(0,2).map((s,j)=>(
                <span key={j} className="mc-pill"
                  style={{background:m.light,color:m.color,borderColor:`${m.color}30`}}
                  onClick={e=>{e.stopPropagation();onNav(m.id,m.ids[j]);}}>
                  {s}
                </span>
              ))}
              {m.subs.length>2&&(
                <span className="mc-more">+{m.subs.length-2} lagi</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ─── KURIKULUM — shared page wrapper ─────────────────────────────────────────
function KurPage({ title, sub, stats, children }) {
  return (
    <div>
      <div className="pg-title">{title}</div>
      <div className="pg-sub">{sub}</div>
      {stats && (
        <div className="kur-stats">
          {stats.map((s,i) => (
            <div className="kur-stat" key={i}>
              <span className="kur-stat-ico">{s.ico}</span>
              <div className="kur-stat-val">{s.val}</div>
              <div className="kur-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── 1. JADUAL WAKTU ─────────────────────────────────────────────────────────
function JadualWaktu() {
  const HARI = ["Isnin","Selasa","Rabu","Khamis","Jumaat"];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kelas, setKelas] = useState("Tahun 1 Unik");
  const [q, setQ] = useState("");
  const [editCell, setEditCell] = useState(null);


  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from('jadual_waktu').select('*').eq('kelas', kelas);
      setRows(data || []);
      setLoading(false);
    };
    load();
  }, [kelas]);

  const buildGrid = () => WAKTU_SLOTS.map((_,ri) => {
    if (ri === 5) return null;
    return HARI.map(h => {
      const c = rows.find(r => r.waktu_slot===ri && r.hari===h);
      return c ? { s:c.subjek, g:c.guru, id:c.id } : null;
    });
  });

  const handleSave = async (e) => {
    e.preventDefault();
    let ok;
    if (editCell.id) {
      ok = await dbRun(() => supabase.from('jadual_waktu').update({ subjek:editCell.subjek, guru:editCell.guru }).eq('id', editCell.id));
    } else {
      ok = await dbRun(() => supabase.from('jadual_waktu').insert([{ kelas, hari:editCell.hari, waktu_slot:editCell.ri, subjek:editCell.subjek, guru:editCell.guru }]));
    }
    if (!ok) return;
    toast("Tersimpan!", "success");
    setEditCell(null);
    const { data } = await supabase.from('jadual_waktu').select('*').eq('kelas', kelas);
    setRows(data || []);
  };

  const handleDelCell = async () => {
    if (!editCell?.id) return;
    const ok = await dbRun(() => supabase.from('jadual_waktu').delete().eq('id', editCell.id));
    if (!ok) return;
    setEditCell(null);
    const { data } = await supabase.from('jadual_waktu').select('*').eq('kelas', kelas);
    setRows(data || []);
  };

  const grid = buildGrid();
  const search = q.toLowerCase().trim();
  const matchCell = (cell) => !search||!cell ? null : cell.s.toLowerCase().includes(search)||cell.g.toLowerCase().includes(search);
  const uniqueSubj = [...new Set(rows.map(r=>r.subjek))].length;
  const uniqueGuru = [...new Set(rows.map(r=>r.guru))].length;

  return (
    <KurPage title="Jadual Waktu" sub="Kurikulum · SK Darau, Kota Kinabalu"
      stats={[
        {ico:"🏫",val:KELAS_LIST.length,lbl:"Jumlah Kelas"},
        {ico:"📚",val:uniqueSubj,lbl:"Mata Pelajaran"},
        {ico:"👩‍🏫",val:uniqueGuru,lbl:"Guru Mengajar"},
        {ico:"⏰",val:10,lbl:"Waktu / Hari"},
      ]}>
      <div className="kur-header">
        <select className="kur-select" value={kelas} onChange={e=>setKelas(e.target.value)}>
          {KELAS_LIST.map(k=><option key={k}>{k}</option>)}
        </select>
        <div className="kur-search-wrap">
          <span className="kur-search-ico">🔍</span>
          <input className="kur-search" placeholder="Cari subjek atau guru…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        {q&&<button className="btn-del" onClick={()=>setQ("")}>✕ Bersih</button>}
        <div style={{fontSize:11,color:"var(--text3)",fontWeight:700}}>Klik sel untuk edit</div>
      </div>

      {loading ? <div className="loading">⏳ Memuatkan jadual…</div> : (
        <div className="jadual-wrap">
          <table className="jadual-table">
            <thead><tr><th>Waktu</th>{HARI.map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {WAKTU_SLOTS.map((waktu,ri) => {
                const row = grid[ri];
                if (!row) return <tr key={ri} className="jadual-rehat"><td colSpan={6} style={{textAlign:"center"}}>— Rehat —</td></tr>;
                return (
                  <tr key={ri}>
                    <td>{waktu}</td>
                    {row.map((cell,ci) => {
                      const cfg = SC[cell?.s] || {c:"#94a3b8",bg:"var(--accent-lt)",i:"+"};
                      const m = matchCell(cell);
                      return (
                        <td key={ci} className={search?(m?"j-match":"j-dim"):""}>
                          <div className="jadual-cell" style={{background:cfg.bg,cursor:"pointer",opacity:cell?1:0.5}}
                            onClick={()=>setEditCell({id:cell?.id||null,ri,hari:HARI[ci],subjek:cell?.s||"",guru:cell?.g||""})}>
                            {cell
                              ? <><span className="jadual-cell-sub" style={{color:cfg.c}}>{cfg.i} {cell.s}</span><span className="jadual-cell-guru">{cell.g}</span></>
                              : <span style={{fontSize:18,color:"var(--text3)"}}>+</span>
                            }
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editCell && (
        <Modal title={`Edit — ${editCell.hari}, Slot ${editCell.ri+1}`} onClose={()=>setEditCell(null)}>
          <form onSubmit={handleSave}>
            <div className="form-field">
              <label className="form-label">Subjek</label>
              <select className="form-input" value={editCell.subjek} onChange={e=>setEditCell(c=>({...c,subjek:e.target.value}))}>
                <option value="">-- Pilih --</option>
                {Object.keys(SC).map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Nama Guru</label>
              <input className="form-input" placeholder="cth: Pn.Ramlah" value={editCell.guru} onChange={e=>setEditCell(c=>({...c,guru:e.target.value}))}/>
            </div>
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button className="btn-primary" type="submit" style={{flex:1}}>💾 Simpan</button>
              {editCell.id && <button type="button" className="btn-del" style={{padding:"8px 16px"}} onClick={handleDelCell}>🗑 Padam Sel</button>}
            </div>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── 2. PANITIA MATA PELAJARAN ────────────────────────────────────────────────
function PanitiaMP() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const emptyForm = { subjek:"", icon:"📋", color:"#2563eb", bg:"#eff6ff", ketua:"", jumlah_ahli:4, tarikh_mesyuarat:"", status:"Aktif" };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);

    const { data: rows } = await supabase.from('panitia').select('*').order('created_at');
    setData(rows||[]); setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('panitia').insert([form]));
    if (!ok) return;
    toast("Panitia ditambah!", "success");
    setShowAdd(false); setForm(emptyForm); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('panitia').update({ subjek:editItem.subjek, icon:editItem.icon, ketua:editItem.ketua, jumlah_ahli:editItem.jumlah_ahli, tarikh_mesyuarat:editItem.tarikh_mesyuarat, status:editItem.status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success");
    setEditItem(null); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('panitia').delete().eq('id',id));
    if (!ok) return;
    setData(d=>d.filter(r=>r.id!==id));
  };

  return (
    <KurPage title="Panitia Mata Pelajaran" sub="Kurikulum · SK Darau, Kota Kinabalu"
      stats={[
        {ico:"📋",val:data.length,lbl:"Panitia Aktif"},
        {ico:"👩‍🏫",val:data.reduce((a,r)=>a+(r.jumlah_ahli||0),0),lbl:"Jumlah Ahli"},
        {ico:"📅",val:"Apr",lbl:"Mesyuarat Terakhir"},
        {ico:"✅",val:"100%",lbl:"Status Aktif"},
      ]}>
      <div className="kur-header">
        <button className="btn-add" onClick={()=>setShowAdd(true)}>+ Tambah Panitia</button>
      </div>
      {loading ? <div className="loading">⏳ Memuatkan…</div> : (
        <div className="panitia-grid">
          {data.map(p=>(
            <div className="panitia-card" key={p.id}>
              <div className="panitia-head">
                <div className="panitia-ico" style={{background:p.bg||"#eff6ff"}}>{p.icon}</div>
                <div style={{flex:1}}>
                  <div className="panitia-name">{p.subjek}</div>
                  <div className="panitia-ketua">Ketua: {p.ketua}</div>
                </div>
                <div style={{display:"flex",gap:4}}>
                  <button className="btn-add" style={{padding:"4px 10px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️ Edit</button>
                  <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
                </div>
              </div>
              <div className="panitia-body">👥 {p.jumlah_ahli} ahli &nbsp;·&nbsp; 📅 {p.tarikh_mesyuarat}</div>
              <div className="panitia-foot">
                <span className="badge b-green">{p.status}</span>
                <span className="badge b-blue">{p.jumlah_ahli} Ahli</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showAdd && (
        <Modal title="Tambah Panitia" onClose={()=>setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Subjek</label><input className="form-input" required value={form.subjek} onChange={e=>setForm(f=>({...f,subjek:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Ikon</label><input className="form-input" value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Nama Ketua Panitia</label><input className="form-input" required value={form.ketua} onChange={e=>setForm(f=>({...f,ketua:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Jumlah Ahli</label><input className="form-input" type="number" min="1" value={form.jumlah_ahli} onChange={e=>setForm(f=>({...f,jumlah_ahli:+e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Tarikh Mesyuarat</label><input className="form-input" placeholder="cth: 15 Jun 2025" value={form.tarikh_mesyuarat} onChange={e=>setForm(f=>({...f,tarikh_mesyuarat:e.target.value}))}/></div>
            </div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit Panitia — ${editItem.subjek}`} onClose={()=>setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Subjek</label><input className="form-input" required value={editItem.subjek} onChange={e=>setEditItem(f=>({...f,subjek:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Ikon</label><input className="form-input" value={editItem.icon} onChange={e=>setEditItem(f=>({...f,icon:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Nama Ketua Panitia</label><input className="form-input" required value={editItem.ketua} onChange={e=>setEditItem(f=>({...f,ketua:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Jumlah Ahli</label><input className="form-input" type="number" min="1" value={editItem.jumlah_ahli} onChange={e=>setEditItem(f=>({...f,jumlah_ahli:+e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Tarikh Mesyuarat</label><input className="form-input" value={editItem.tarikh_mesyuarat} onChange={e=>setEditItem(f=>({...f,tarikh_mesyuarat:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                <option>Aktif</option><option>Tidak Aktif</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── 3. PEPERIKSAAN & PENILAIAN ───────────────────────────────────────────────
function Peperiksaan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ nama:"", tarikh:"", kelas:"Tahun 1–6", status:"Akan Datang" });
  const badgeMap = { "Selesai":"b-green","Akan Datang":"b-yellow","Semasa":"b-blue" };
  const STATUS_CYCLE = ["Akan Datang","Semasa","Selesai"];

  const load = async () => {
    setLoading(true);

    const { data: rows } = await supabase.from('peperiksaan').select('*').order('created_at');
    setData(rows||[]); setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('peperiksaan').insert([form]));
    if (!ok) return;
    toast("Peperiksaan ditambah!", "success");
    setShowAdd(false); setForm({ nama:"", tarikh:"", kelas:"Tahun 1–6", status:"Akan Datang" }); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('peperiksaan').update({ nama:editItem.nama, tarikh:editItem.tarikh, kelas:editItem.kelas, status:editItem.status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success");
    setEditItem(null); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('peperiksaan').delete().eq('id',id));
    if (ok) setData(d=>d.filter(r=>r.id!==id));
  };
  const cycleStatus = async (p) => {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(p.status)+1) % STATUS_CYCLE.length];
    const ok = await dbRun(() => supabase.from('peperiksaan').update({ status:next }).eq('id',p.id));
    if (ok) setData(d=>d.map(r=>r.id===p.id?{...r,status:next}:r));
  };

  const selesai = data.filter(p=>p.status==="Selesai").length;
  return (
    <KurPage title="Peperiksaan & Penilaian" sub="Kurikulum · SK Darau, Kota Kinabalu"
      stats={[
        {ico:"📝",val:data.length,lbl:"Jumlah Peperiksaan"},
        {ico:"✅",val:selesai,lbl:"Selesai"},
        {ico:"⏳",val:data.length-selesai,lbl:"Akan Datang"},
        {ico:"🎓",val:"Nov",lbl:"Peperiksaan Akhir"},
      ]}>
      <div className="kur-header">
        <button className="btn-add" onClick={()=>setShowAdd(true)}>+ Tambah Peperiksaan</button>
      </div>
      {loading ? <div className="loading">⏳ Memuatkan…</div> : (
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead><tr><th>#</th><th>Nama Peperiksaan</th><th>Tarikh</th><th>Kelas</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {data.map((p,i)=>(
                <tr key={p.id}>
                  <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
                  <td style={{fontWeight:800}}>{p.nama}</td>
                  <td style={{color:"var(--text2)"}}>{p.tarikh}</td>
                  <td>{p.kelas}</td>
                  <td><span className={`badge ${badgeMap[p.status]||"b-gray"}`} style={{cursor:"pointer"}} onClick={()=>cycleStatus(p)} title="Klik untuk tukar status">{p.status}</span></td>
                  <td style={{display:"flex",gap:4}}>
                    <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
                    <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Tambah Peperiksaan" onClose={()=>setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-field"><label className="form-label">Nama Peperiksaan</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" placeholder="cth: 3–7 Nov 2025" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={form.kelas} onChange={e=>setForm(f=>({...f,kelas:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Akan Datang</option><option>Semasa</option><option>Selesai</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-field"><label className="form-label">Nama Peperiksaan</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={editItem.kelas} onChange={e=>setEditItem(f=>({...f,kelas:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                <option>Akan Datang</option><option>Semasa</option><option>Selesai</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── 4. RPH / REKOD MENGAJAR ──────────────────────────────────────────────────
function RPHRekod() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ guru:"", subjek:"", kelas:"", minggu:"Minggu 16", status:"Tertunggak" });
  const badgeMap = { "Hantar":"b-green","Tertunggak":"b-red","Semak":"b-yellow" };

  const load = async () => {
    setLoading(true);

    const { data: rows } = await supabase.from('rph').select('*').order('created_at');
    setData(rows||[]); setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('rph').insert([form]));
    if (!ok) return;
    toast("RPH ditambah!", "success");
    setShowAdd(false); setForm({ guru:"", subjek:"", kelas:"", minggu:"Minggu 16", status:"Tertunggak" }); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('rph').delete().eq('id',id));
    if (ok) setData(d=>d.filter(r=>r.id!==id));
  };
  const handleStatus = async (id, status) => {
    const ok = await dbRun(() => supabase.from('rph').update({ status }).eq('id',id));
    if (ok) setData(d=>d.map(r=>r.id===id?{...r,status}:r));
  };

  const filtered = data.filter(r=>!q||r.guru?.toLowerCase().includes(q.toLowerCase())||r.subjek?.toLowerCase().includes(q.toLowerCase()));
  const hantar = data.filter(r=>r.status==="Hantar").length;

  return (
    <KurPage title="RPH / Rekod Mengajar" sub="Kurikulum · SK Darau, Kota Kinabalu"
      stats={[
        {ico:"📄",val:data.length,lbl:"Jumlah RPH"},
        {ico:"✅",val:hantar,lbl:"Sudah Hantar"},
        {ico:"⚠️",val:data.length-hantar,lbl:"Tertunggak / Semak"},
        {ico:"📅",val:"Minggu 16",lbl:"Minggu Semasa"},
      ]}>
      <div className="kur-header">
        <button className="btn-add" onClick={()=>setShowAdd(true)}>+ Tambah RPH</button>
        <div className="kur-search-wrap">
          <span className="kur-search-ico">🔍</span>
          <input className="kur-search" placeholder="Cari guru atau subjek…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>
      {loading ? <div className="loading">⏳ Memuatkan…</div> : (
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead><tr><th>Guru</th><th>Subjek</th><th>Kelas</th><th>Minggu</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td style={{fontWeight:800}}>{r.guru}</td>
                  <td>{r.subjek}</td>
                  <td>{r.kelas}</td>
                  <td style={{color:"var(--text3)"}}>{r.minggu}</td>
                  <td>
                    <select style={{border:"none",background:"transparent",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:12,color:"inherit"}}
                      value={r.status} onChange={e=>handleStatus(r.id,e.target.value)}>
                      <option>Hantar</option><option>Tertunggak</option><option>Semak</option>
                    </select>
                    <span className={`badge ${badgeMap[r.status]||"b-gray"}`} style={{pointerEvents:"none",marginLeft:4}}>{r.status}</span>
                  </td>
                  <td><button className="btn-del" onClick={()=>handleDel(r.id)}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Tambah RPH" onClose={()=>setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-field"><label className="form-label">Nama Guru</label><input className="form-input" required value={form.guru} onChange={e=>setForm(f=>({...f,guru:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Subjek</label><input className="form-input" value={form.subjek} onChange={e=>setForm(f=>({...f,subjek:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" placeholder="cth: Thn 4" value={form.kelas} onChange={e=>setForm(f=>({...f,kelas:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Minggu</label><input className="form-input" value={form.minggu} onChange={e=>setForm(f=>({...f,minggu:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  <option>Tertunggak</option><option>Hantar</option><option>Semak</option>
                </select>
              </div>
            </div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── 5. PROGRAM AKADEMIK ──────────────────────────────────────────────────────
function ProgramAkademik() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ nama:"", tarikh:"", deskripsi:"", color:"#2563eb", status:"Akan Datang" });
  const badgeMap = { "Sedang Berjalan":"b-green","Akan Datang":"b-yellow","Selesai":"b-gray" };

  const load = async () => {
    setLoading(true);

    const { data: rows } = await supabase.from('program_akademik').select('*').order('created_at');
    setData(rows||[]); setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('program_akademik').insert([form]));
    if (!ok) return;
    toast("Program ditambah!", "success");
    setShowAdd(false); setForm({ nama:"", tarikh:"", deskripsi:"", color:"#2563eb", status:"Akan Datang" }); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('program_akademik').update({ nama:editItem.nama, tarikh:editItem.tarikh, deskripsi:editItem.deskripsi, color:editItem.color, status:editItem.status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success");
    setEditItem(null); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('program_akademik').delete().eq('id',id));
    if (ok) setData(d=>d.filter(r=>r.id!==id));
  };

  const aktif = data.filter(p=>p.status==="Sedang Berjalan").length;
  return (
    <KurPage title="Program Akademik" sub="Kurikulum · SK Darau, Kota Kinabalu"
      stats={[
        {ico:"🎯",val:data.length,lbl:"Jumlah Program"},
        {ico:"🟢",val:aktif,lbl:"Sedang Berjalan"},
        {ico:"📅",val:data.length-aktif,lbl:"Lain-lain"},
        {ico:"📆",val:"2025",lbl:"Tahun Semasa"},
      ]}>
      <div className="kur-header">
        <button className="btn-add" onClick={()=>setShowAdd(true)}>+ Tambah Program</button>
      </div>
      {loading ? <div className="loading">⏳ Memuatkan…</div> : (
        <div className="prog-grid">
          {data.map(p=>(
            <div className="prog-card" key={p.id}>
              <div className="prog-card-accent" style={{background:p.color||"#2563eb"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div className="prog-title">{p.nama}</div>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <span className={`badge ${badgeMap[p.status]||"b-gray"}`}>{p.status}</span>
                  <button className="btn-add" style={{padding:"3px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
                  <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
                </div>
              </div>
              <div className="prog-date">📅 {p.tarikh}</div>
              <div className="prog-desc">{p.deskripsi}</div>
            </div>
          ))}
        </div>
      )}
      {showAdd && (
        <Modal title="Tambah Program Akademik" onClose={()=>setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-field"><label className="form-label">Nama Program</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" placeholder="cth: Jun 2025" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Deskripsi</label><textarea className="form-input" rows={3} value={form.deskripsi} onChange={e=>setForm(f=>({...f,deskripsi:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Akan Datang</option><option>Sedang Berjalan</option><option>Selesai</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-field"><label className="form-label">Nama Program</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Deskripsi</label><textarea className="form-input" rows={3} value={editItem.deskripsi} onChange={e=>setEditItem(f=>({...f,deskripsi:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                <option>Akan Datang</option><option>Sedang Berjalan</option><option>Selesai</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── 6. PUSAT SUMBER / NILAM ──────────────────────────────────────────────────
function PusatSumber() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ nama:"", kelas:"", buku_dibaca:0, sasaran:8 });

  const load = async () => {
    setLoading(true);

    const { data: rows } = await supabase.from('nilam').select('*').order('buku_dibaca', { ascending:false });
    setData(rows || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.nama.trim() || !form.kelas.trim()) return;
    const ok = await dbRun(() => supabase.from('nilam').insert([{ nama:form.nama, kelas:form.kelas, buku_dibaca:Number(form.buku_dibaca), sasaran:Number(form.sasaran) }]));
    if (!ok) return;
    toast("Murid ditambah!", "success");
    setShowAdd(false);
    setForm({ nama:"", kelas:"", buku_dibaca:0, sasaran:8 });
    load();
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('nilam').update({ nama:editItem.nama, kelas:editItem.kelas, buku_dibaca:Number(editItem.buku_dibaca), sasaran:Number(editItem.sasaran) }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success");
    setEditItem(null); load();
  };

  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('nilam').delete().eq('id', id));
    if (ok) load();
  };

  const adjustBuku = async (id, cur, delta) => {
    const val = Math.max(0, cur + delta);
    const ok = await dbRun(() => supabase.from('nilam').update({ buku_dibaca: val }).eq('id', id));
    if (ok) setData(d=>d.map(r=>r.id===id?{...r,buku_dibaca:val}:r));
  };

  const totalBuku = data.reduce((a,r)=>a+(r.buku_dibaca||0),0);
  const capai = data.filter(r=>r.buku_dibaca>=r.sasaran).length;

  return (
    <KurPage
      title="Pusat Sumber / NILAM"
      sub="Kurikulum · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"📚", val:3200, lbl:"Koleksi Buku" },
        { ico:"👦", val:data.length, lbl:"Murid Berdaftar" },
        { ico:"📖", val:totalBuku, lbl:"Buku Dibaca" },
        { ico:"🏆", val:capai, lbl:"Capai Sasaran" },
      ]}
    >
      <div className="sec-hd" style={{marginTop:0}}>
        <div className="sec-title">🏆 Pembaca Terbaik NILAM</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span className="sec-sub">Sasaran: 8 buku / murid</span>
          <button className="btn-add" onClick={()=>setShowAdd(true)}>+ Tambah Murid</button>
        </div>
      </div>
      {loading ? <div className="kur-loading">Memuatkan...</div> : (
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead>
              <tr><th>#</th><th>Nama Murid</th><th>Kelas</th><th>Buku Dibaca</th><th>Sasaran</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {data.map((r,i)=>(
                <tr key={r.id}>
                  <td style={{fontWeight:900,color:"var(--accent)"}}>{i+1}</td>
                  <td style={{fontWeight:800}}>{r.nama}</td>
                  <td>{r.kelas}</td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                      <button onClick={()=>adjustBuku(r.id,r.buku_dibaca,-1)} style={{border:"1px solid var(--border)",background:"var(--surface)",borderRadius:4,width:22,height:22,cursor:"pointer",color:"var(--text)",fontWeight:900,lineHeight:1}}>-</button>
                      <span style={{fontWeight:900,color:"var(--accent)",minWidth:20,textAlign:"center"}}>{r.buku_dibaca}</span>
                      <button onClick={()=>adjustBuku(r.id,r.buku_dibaca,1)} style={{border:"1px solid var(--border)",background:"var(--surface)",borderRadius:4,width:22,height:22,cursor:"pointer",color:"var(--text)",fontWeight:900,lineHeight:1}}>+</button>
                    </div>
                    <div className="nilam-bar-wrap">
                      <div className="nilam-bar" style={{width:`${Math.min(100,(r.buku_dibaca/r.sasaran)*100)}%`}}/>
                    </div>
                  </td>
                  <td style={{color:"var(--text3)"}}>{r.sasaran}</td>
                  <td><span className={`badge ${r.buku_dibaca>=r.sasaran?"b-green":"b-yellow"}`}>{r.buku_dibaca>=r.sasaran?"Capai ✓":"Dalam Proses"}</span></td>
                  <td style={{display:"flex",gap:4}}>
                    <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...r})}>✏️</button>
                    <button className="btn-del" onClick={()=>handleDel(r.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <Modal title="Tambah Rekod NILAM" onClose={()=>setShowAdd(false)}>
          <div className="form-row">
            <label className="form-label">Nama Murid</label>
            <input className="form-input" value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} placeholder="Nama penuh murid" />
          </div>
          <div className="form-row">
            <label className="form-label">Kelas</label>
            <input className="form-input" value={form.kelas} onChange={e=>setForm({...form,kelas:e.target.value})} placeholder="cth: Thn 4 Angsana" />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div className="form-row">
              <label className="form-label">Buku Dibaca</label>
              <input className="form-input" type="number" min="0" value={form.buku_dibaca} onChange={e=>setForm({...form,buku_dibaca:e.target.value})} />
            </div>
            <div className="form-row">
              <label className="form-label">Sasaran</label>
              <input className="form-input" type="number" min="1" value={form.sasaran} onChange={e=>setForm({...form,sasaran:e.target.value})} />
            </div>
          </div>
          <button className="form-submit" onClick={handleAdd}>Simpan</button>
        </Modal>
      )}

      {editItem && (
        <Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-row">
              <label className="form-label">Nama Murid</label>
              <input className="form-input" value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))} />
            </div>
            <div className="form-row">
              <label className="form-label">Kelas</label>
              <input className="form-input" value={editItem.kelas} onChange={e=>setEditItem(f=>({...f,kelas:e.target.value}))} />
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div className="form-row">
                <label className="form-label">Buku Dibaca</label>
                <input className="form-input" type="number" min="0" value={editItem.buku_dibaca} onChange={e=>setEditItem(f=>({...f,buku_dibaca:e.target.value}))} />
              </div>
              <div className="form-row">
                <label className="form-label">Sasaran</label>
                <input className="form-input" type="number" min="1" value={editItem.sasaran} onChange={e=>setEditItem(f=>({...f,sasaran:e.target.value}))} />
              </div>
            </div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── 7. PERKEMBANGAN STAF ────────────────────────────────────────────────────
function PerkembanganStaf() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ peserta:"", kursus:"", tarikh:"", penganjur:"", status:"Akan Datang" });

  const load = async () => {
    setLoading(true);

    const { data: rows } = await supabase.from('perkembangan_staf').select('*').order('created_at');
    setData(rows || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.peserta.trim() || !form.kursus.trim()) return;
    const ok = await dbRun(() => supabase.from('perkembangan_staf').insert([{ peserta:form.peserta, kursus:form.kursus, tarikh:form.tarikh, penganjur:form.penganjur, status:form.status }]));
    if (!ok) return;
    toast("Kursus ditambah!", "success");
    setShowAdd(false);
    setForm({ peserta:"", kursus:"", tarikh:"", penganjur:"", status:"Akan Datang" });
    load();
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('perkembangan_staf').update({ peserta:editItem.peserta, kursus:editItem.kursus, tarikh:editItem.tarikh, penganjur:editItem.penganjur, status:editItem.status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success");
    setEditItem(null); load();
  };

  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('perkembangan_staf').delete().eq('id', id));
    if (ok) load();
  };

  const toggleStatus = async (id, cur) => {
    const cycle = ["Akan Datang","Dalam Proses","Selesai"];
    const next = cycle[(cycle.indexOf(cur)+1) % cycle.length];
    const ok = await dbRun(() => supabase.from('perkembangan_staf').update({ status: next }).eq('id', id));
    if (ok) setData(d=>d.map(r=>r.id===id?{...r,status:next}:r));
  };

  const selesai = data.filter(s=>s.status==="Selesai").length;
  const badgeFor = s => s.status==="Selesai" ? "b-green" : s.status==="Dalam Proses" ? "b-blue" : "b-yellow";

  return (
    <KurPage
      title="Perkembangan Staf"
      sub="Kurikulum · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"📋", val:data.length, lbl:"Jumlah Kursus" },
        { ico:"✅", val:selesai, lbl:"Selesai" },
        { ico:"⏳", val:data.length-selesai, lbl:"Akan Datang" },
        { ico:"👩‍🏫", val:new Set(data.map(r=>r.peserta)).size, lbl:"Guru Terlibat" },
      ]}
    >
      <div className="sec-hd" style={{marginTop:0}}>
        <div className="sec-title">📋 Rekod Kursus & Bengkel</div>
        <button className="btn-add" onClick={()=>setShowAdd(true)}>+ Tambah Kursus</button>
      </div>
      {loading ? <div className="kur-loading">Memuatkan...</div> : (
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead>
              <tr><th>Peserta</th><th>Kursus / Bengkel</th><th>Tarikh</th><th>Penganjur</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {data.map((s)=>(
                <tr key={s.id}>
                  <td style={{fontWeight:800,fontSize:12}}>{s.peserta}</td>
                  <td style={{fontWeight:700}}>{s.kursus}</td>
                  <td style={{color:"var(--text3)",whiteSpace:"nowrap"}}>{s.tarikh}</td>
                  <td><span className="badge b-gray">{s.penganjur}</span></td>
                  <td>
                    <span className={`badge ${badgeFor(s)}`} style={{cursor:"pointer"}} onClick={()=>toggleStatus(s.id,s.status)} title="Klik tukar status">
                      {s.status}
                    </span>
                  </td>
                  <td style={{display:"flex",gap:4}}>
                    <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...s})}>✏️</button>
                    <button className="btn-del" onClick={()=>handleDel(s.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <Modal title="Tambah Kursus Staf" onClose={()=>setShowAdd(false)}>
          <div className="form-row">
            <label className="form-label">Peserta</label>
            <input className="form-input" value={form.peserta} onChange={e=>setForm({...form,peserta:e.target.value})} placeholder="cth: Semua Guru / Pn. Ramlah" />
          </div>
          <div className="form-row">
            <label className="form-label">Kursus / Bengkel</label>
            <input className="form-input" value={form.kursus} onChange={e=>setForm({...form,kursus:e.target.value})} placeholder="Nama kursus" />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div className="form-row">
              <label className="form-label">Tarikh</label>
              <input className="form-input" value={form.tarikh} onChange={e=>setForm({...form,tarikh:e.target.value})} placeholder="cth: 15 Jun 2025" />
            </div>
            <div className="form-row">
              <label className="form-label">Penganjur</label>
              <input className="form-input" value={form.penganjur} onChange={e=>setForm({...form,penganjur:e.target.value})} placeholder="cth: JPN Sabah" />
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
              <option>Akan Datang</option>
              <option>Dalam Proses</option>
              <option>Selesai</option>
            </select>
          </div>
          <button className="form-submit" onClick={handleAdd}>Simpan</button>
        </Modal>
      )}

      {editItem && (
        <Modal title={`Edit — ${editItem.kursus}`} onClose={()=>setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-row">
              <label className="form-label">Peserta</label>
              <input className="form-input" value={editItem.peserta} onChange={e=>setEditItem(f=>({...f,peserta:e.target.value}))} />
            </div>
            <div className="form-row">
              <label className="form-label">Kursus / Bengkel</label>
              <input className="form-input" value={editItem.kursus} onChange={e=>setEditItem(f=>({...f,kursus:e.target.value}))} />
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div className="form-row">
                <label className="form-label">Tarikh</label>
                <input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))} />
              </div>
              <div className="form-row">
                <label className="form-label">Penganjur</label>
                <input className="form-input" value={editItem.penganjur} onChange={e=>setEditItem(f=>({...f,penganjur:e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Status</label>
              <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                <option>Akan Datang</option>
                <option>Dalam Proses</option>
                <option>Selesai</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HEM — HAL EHWAL MURID (8 sub-modules)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── HEM 1. PENDAFTARAN & DATA MURID (APDM) ──────────────────────────────────
function HemMurid() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const blank = { nama:"", kelas:"", ic:"", jantina:"Lelaki", telefon_wali:"", status:"Aktif" };
  const [form, setForm] = useState(blank);

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_murid').select('*').order('created_at');
    setData(rows || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('hem_murid').insert([form]));
    if (!ok) return;
    toast("Murid ditambah!", "success");
    setShowAdd(false); setForm(blank); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const { nama, kelas, ic, jantina, telefon_wali, status } = editItem;
    const ok = await dbRun(() => supabase.from('hem_murid').update({ nama, kelas, ic, jantina, telefon_wali, status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success"); setEditItem(null); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('hem_murid').delete().eq('id', id));
    if (ok) setData(d => d.filter(r => r.id !== id));
  };

  const aktif = data.filter(r => r.status === "Aktif").length;
  return (
    <KurPage title="Pendaftaran & Data Murid" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"👦", val:data.length, lbl:"Jumlah Murid" },
        { ico:"✅", val:aktif, lbl:"Aktif" },
        { ico:"👧", val:data.filter(r=>r.jantina==="Perempuan").length, lbl:"Perempuan" },
        { ico:"👦", val:data.filter(r=>r.jantina==="Lelaki").length, lbl:"Lelaki" },
      ]}>
      <div className="kur-header">
        <button className="btn-add" onClick={() => setShowAdd(true)}>+ Tambah Murid</button>
      </div>
      {loading ? <div className="loading">⏳ Memuatkan…</div> : (
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead><tr><th>#</th><th>Nama</th><th>Kelas</th><th>IC</th><th>Jantina</th><th>Tel. Wali</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={r.id}>
                  <td style={{fontWeight:900,color:"var(--accent)"}}>{i+1}</td>
                  <td style={{fontWeight:800}}>{r.nama}</td>
                  <td>{r.kelas}</td>
                  <td style={{fontSize:12,color:"var(--text3)"}}>{r.ic}</td>
                  <td><span className={`badge ${r.jantina==="Perempuan"?"b-purple":"b-blue"}`}>{r.jantina}</span></td>
                  <td style={{color:"var(--text3)"}}>{r.telefon_wali}</td>
                  <td><span className={`badge ${r.status==="Aktif"?"b-green":"b-gray"}`}>{r.status}</span></td>
                  <td style={{display:"flex",gap:4}}>
                    <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={() => setEditItem({...r})}>✏️</button>
                    <button className="btn-del" onClick={() => handleDel(r.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Tambah Murid" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-field"><label className="form-label">Nama Penuh</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))} placeholder="Nama penuh murid"/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={form.kelas} onChange={e=>setForm(f=>({...f,kelas:e.target.value}))} placeholder="cth: Tahun 4 Angsana"/></div>
              <div className="form-field"><label className="form-label">No. IC</label><input className="form-input" value={form.ic} onChange={e=>setForm(f=>({...f,ic:e.target.value}))} placeholder="cth: 120304-12-0011"/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Jantina</label>
                <select className="form-input" value={form.jantina} onChange={e=>setForm(f=>({...f,jantina:e.target.value}))}>
                  <option>Lelaki</option><option>Perempuan</option>
                </select>
              </div>
              <div className="form-field"><label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  <option>Aktif</option><option>Tidak Aktif</option><option>Berpindah</option>
                </select>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Tel. Wali</label><input className="form-input" value={form.telefon_wali} onChange={e=>setForm(f=>({...f,telefon_wali:e.target.value}))} placeholder="cth: 011-2345678"/></div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama}`} onClose={() => setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-field"><label className="form-label">Nama Penuh</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={editItem.kelas} onChange={e=>setEditItem(f=>({...f,kelas:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">No. IC</label><input className="form-input" value={editItem.ic} onChange={e=>setEditItem(f=>({...f,ic:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Jantina</label>
                <select className="form-input" value={editItem.jantina} onChange={e=>setEditItem(f=>({...f,jantina:e.target.value}))}>
                  <option>Lelaki</option><option>Perempuan</option>
                </select>
              </div>
              <div className="form-field"><label className="form-label">Status</label>
                <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                  <option>Aktif</option><option>Tidak Aktif</option><option>Berpindah</option>
                </select>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Tel. Wali</label><input className="form-input" value={editItem.telefon_wali} onChange={e=>setEditItem(f=>({...f,telefon_wali:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 2. DISIPLIN ─────────────────────────────────────────────────────────
function HemDisiplin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const blank = { nama_murid:"", kelas:"", tarikh:"", kesalahan:"", tindakan:"", status:"Dalam Proses" };
  const [form, setForm] = useState(blank);
  const badgeMap = { "Selesai":"b-green","Dalam Proses":"b-yellow","Dirujuk":"b-red" };

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_disiplin').select('*').order('created_at', { ascending: false });
    setData(rows || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('hem_disiplin').insert([form]));
    if (!ok) return;
    toast("Rekod ditambah!", "success"); setShowAdd(false); setForm(blank); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const { nama_murid, kelas, tarikh, kesalahan, tindakan, status } = editItem;
    const ok = await dbRun(() => supabase.from('hem_disiplin').update({ nama_murid, kelas, tarikh, kesalahan, tindakan, status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success"); setEditItem(null); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('hem_disiplin').delete().eq('id', id));
    if (ok) setData(d => d.filter(r => r.id !== id));
  };

  const selesai = data.filter(r => r.status === "Selesai").length;
  return (
    <KurPage title="Disiplin" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"📋", val:data.length, lbl:"Jumlah Kes" },
        { ico:"✅", val:selesai, lbl:"Selesai" },
        { ico:"⏳", val:data.filter(r=>r.status==="Dalam Proses").length, lbl:"Dalam Proses" },
        { ico:"🚨", val:data.filter(r=>r.status==="Dirujuk").length, lbl:"Dirujuk" },
      ]}>
      <div className="kur-header">
        <button className="btn-add" onClick={() => setShowAdd(true)}>+ Tambah Kes</button>
      </div>
      {loading ? <div className="loading">⏳ Memuatkan…</div> : (
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead><tr><th>Nama Murid</th><th>Kelas</th><th>Tarikh</th><th>Kesalahan</th><th>Tindakan</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {data.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:800}}>{r.nama_murid}</td>
                  <td style={{color:"var(--text3)"}}>{r.kelas}</td>
                  <td style={{color:"var(--text3)",whiteSpace:"nowrap"}}>{r.tarikh}</td>
                  <td>{r.kesalahan}</td>
                  <td style={{fontSize:12,color:"var(--text2)"}}>{r.tindakan}</td>
                  <td><span className={`badge ${badgeMap[r.status]||"b-gray"}`}>{r.status}</span></td>
                  <td style={{display:"flex",gap:4}}>
                    <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={() => setEditItem({...r})}>✏️</button>
                    <button className="btn-del" onClick={() => handleDel(r.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Tambah Kes Disiplin" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={form.nama_murid} onChange={e=>setForm(f=>({...f,nama_murid:e.target.value}))} placeholder="Nama penuh"/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={form.kelas} onChange={e=>setForm(f=>({...f,kelas:e.target.value}))} placeholder="cth: Tahun 4"/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))} placeholder="cth: 5 Mei 2025"/></div>
              <div className="form-field"><label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  <option>Dalam Proses</option><option>Selesai</option><option>Dirujuk</option>
                </select>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Kesalahan</label><input className="form-input" value={form.kesalahan} onChange={e=>setForm(f=>({...f,kesalahan:e.target.value}))} placeholder="Jenis kesalahan"/></div>
            <div className="form-field"><label className="form-label">Tindakan</label><textarea className="form-input" rows={2} value={form.tindakan} onChange={e=>setForm(f=>({...f,tindakan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama_murid}`} onClose={() => setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" value={editItem.nama_murid} onChange={e=>setEditItem(f=>({...f,nama_murid:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={editItem.kelas} onChange={e=>setEditItem(f=>({...f,kelas:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Status</label>
                <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                  <option>Dalam Proses</option><option>Selesai</option><option>Dirujuk</option>
                </select>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Kesalahan</label><input className="form-input" value={editItem.kesalahan} onChange={e=>setEditItem(f=>({...f,kesalahan:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Tindakan</label><textarea className="form-input" rows={2} value={editItem.tindakan} onChange={e=>setEditItem(f=>({...f,tindakan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 3. BIMBINGAN & KAUNSELING ───────────────────────────────────────────
function HemKaunseling() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const blank = { nama_murid:"", kelas:"", tarikh:"", jenis_kes:"", kaunselor:"", status:"Dalam Proses" };
  const [form, setForm] = useState(blank);
  const badgeMap = { "Selesai":"b-green","Dalam Proses":"b-blue","Dirujuk":"b-red" };

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_kaunseling').select('*').order('created_at', { ascending: false });
    setData(rows || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('hem_kaunseling').insert([form]));
    if (!ok) return;
    toast("Sesi ditambah!", "success"); setShowAdd(false); setForm(blank); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const { nama_murid, kelas, tarikh, jenis_kes, kaunselor, status } = editItem;
    const ok = await dbRun(() => supabase.from('hem_kaunseling').update({ nama_murid, kelas, tarikh, jenis_kes, kaunselor, status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success"); setEditItem(null); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('hem_kaunseling').delete().eq('id', id));
    if (ok) setData(d => d.filter(r => r.id !== id));
  };

  const selesai = data.filter(r => r.status === "Selesai").length;
  return (
    <KurPage title="Bimbingan & Kaunseling" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"💬", val:data.length, lbl:"Jumlah Sesi" },
        { ico:"✅", val:selesai, lbl:"Selesai" },
        { ico:"⏳", val:data.filter(r=>r.status==="Dalam Proses").length, lbl:"Dalam Proses" },
        { ico:"👩‍💼", val:[...new Set(data.map(r=>r.kaunselor))].filter(Boolean).length, lbl:"Kaunselor" },
      ]}>
      <div className="kur-header">
        <button className="btn-add" onClick={() => setShowAdd(true)}>+ Tambah Sesi</button>
      </div>
      {loading ? <div className="loading">⏳ Memuatkan…</div> : (
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead><tr><th>Nama Murid</th><th>Kelas</th><th>Tarikh</th><th>Jenis Kes</th><th>Kaunselor</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {data.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:800}}>{r.nama_murid}</td>
                  <td style={{color:"var(--text3)"}}>{r.kelas}</td>
                  <td style={{color:"var(--text3)",whiteSpace:"nowrap"}}>{r.tarikh}</td>
                  <td>{r.jenis_kes}</td>
                  <td><span className="badge b-gray">{r.kaunselor}</span></td>
                  <td><span className={`badge ${badgeMap[r.status]||"b-gray"}`}>{r.status}</span></td>
                  <td style={{display:"flex",gap:4}}>
                    <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={() => setEditItem({...r})}>✏️</button>
                    <button className="btn-del" onClick={() => handleDel(r.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Tambah Sesi Kaunseling" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={form.nama_murid} onChange={e=>setForm(f=>({...f,nama_murid:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={form.kelas} onChange={e=>setForm(f=>({...f,kelas:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kaunselor</label><input className="form-input" value={form.kaunselor} onChange={e=>setForm(f=>({...f,kaunselor:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Jenis Kes</label><input className="form-input" value={form.jenis_kes} onChange={e=>setForm(f=>({...f,jenis_kes:e.target.value}))} placeholder="cth: Masalah Akademik"/></div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Dalam Proses</option><option>Selesai</option><option>Dirujuk</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama_murid}`} onClose={() => setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" value={editItem.nama_murid} onChange={e=>setEditItem(f=>({...f,nama_murid:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={editItem.kelas} onChange={e=>setEditItem(f=>({...f,kelas:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kaunselor</label><input className="form-input" value={editItem.kaunselor} onChange={e=>setEditItem(f=>({...f,kaunselor:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Jenis Kes</label><input className="form-input" value={editItem.jenis_kes} onChange={e=>setEditItem(f=>({...f,jenis_kes:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                <option>Dalam Proses</option><option>Selesai</option><option>Dirujuk</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 4. KESIHATAN MURID ───────────────────────────────────────────────────
function HemKesihatan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const blank = { nama_murid:"", kelas:"", tarikh:"", jenis_pemeriksaan:"", catatan:"", status:"Normal" };
  const [form, setForm] = useState(blank);
  const badgeMap = { "Normal":"b-green","Perlu Perhatian":"b-yellow","Dirujuk":"b-red" };

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_kesihatan').select('*').order('created_at', { ascending: false });
    setData(rows || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('hem_kesihatan').insert([form]));
    if (!ok) return;
    toast("Rekod ditambah!", "success"); setShowAdd(false); setForm(blank); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const { nama_murid, kelas, tarikh, jenis_pemeriksaan, catatan, status } = editItem;
    const ok = await dbRun(() => supabase.from('hem_kesihatan').update({ nama_murid, kelas, tarikh, jenis_pemeriksaan, catatan, status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success"); setEditItem(null); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('hem_kesihatan').delete().eq('id', id));
    if (ok) setData(d => d.filter(r => r.id !== id));
  };

  const normal = data.filter(r => r.status === "Normal").length;
  return (
    <KurPage title="Kesihatan Murid" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"🏥", val:data.length, lbl:"Rekod" },
        { ico:"✅", val:normal, lbl:"Normal" },
        { ico:"⚠️", val:data.filter(r=>r.status==="Perlu Perhatian").length, lbl:"Perlu Perhatian" },
        { ico:"🚑", val:data.filter(r=>r.status==="Dirujuk").length, lbl:"Dirujuk" },
      ]}>
      <div className="kur-header">
        <button className="btn-add" onClick={() => setShowAdd(true)}>+ Tambah Rekod</button>
      </div>
      {loading ? <div className="loading">⏳ Memuatkan…</div> : (
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead><tr><th>Nama Murid</th><th>Kelas</th><th>Tarikh</th><th>Pemeriksaan</th><th>Catatan</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {data.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:800}}>{r.nama_murid}</td>
                  <td style={{color:"var(--text3)"}}>{r.kelas}</td>
                  <td style={{color:"var(--text3)",whiteSpace:"nowrap"}}>{r.tarikh}</td>
                  <td>{r.jenis_pemeriksaan}</td>
                  <td style={{fontSize:12,color:"var(--text2)"}}>{r.catatan}</td>
                  <td><span className={`badge ${badgeMap[r.status]||"b-gray"}`}>{r.status}</span></td>
                  <td style={{display:"flex",gap:4}}>
                    <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={() => setEditItem({...r})}>✏️</button>
                    <button className="btn-del" onClick={() => handleDel(r.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Tambah Rekod Kesihatan" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={form.nama_murid} onChange={e=>setForm(f=>({...f,nama_murid:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={form.kelas} onChange={e=>setForm(f=>({...f,kelas:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jenis Pemeriksaan</label><input className="form-input" value={form.jenis_pemeriksaan} onChange={e=>setForm(f=>({...f,jenis_pemeriksaan:e.target.value}))} placeholder="cth: Pemeriksaan Gigi"/></div>
            </div>
            <div className="form-field"><label className="form-label">Catatan</label><textarea className="form-input" rows={2} value={form.catatan} onChange={e=>setForm(f=>({...f,catatan:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Normal</option><option>Perlu Perhatian</option><option>Dirujuk</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama_murid}`} onClose={() => setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" value={editItem.nama_murid} onChange={e=>setEditItem(f=>({...f,nama_murid:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={editItem.kelas} onChange={e=>setEditItem(f=>({...f,kelas:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jenis Pemeriksaan</label><input className="form-input" value={editItem.jenis_pemeriksaan} onChange={e=>setEditItem(f=>({...f,jenis_pemeriksaan:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Catatan</label><textarea className="form-input" rows={2} value={editItem.catatan} onChange={e=>setEditItem(f=>({...f,catatan:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                <option>Normal</option><option>Perlu Perhatian</option><option>Dirujuk</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 5. BANTUAN PELAJARAN ─────────────────────────────────────────────────
function HemBantuan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const blank = { nama_murid:"", kelas:"", jenis_bantuan:"RMT", tahun:"2025", status:"Aktif" };
  const [form, setForm] = useState(blank);

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_bantuan').select('*').order('created_at');
    setData(rows || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('hem_bantuan').insert([form]));
    if (!ok) return;
    toast("Bantuan ditambah!", "success"); setShowAdd(false); setForm(blank); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const { nama_murid, kelas, jenis_bantuan, tahun, status } = editItem;
    const ok = await dbRun(() => supabase.from('hem_bantuan').update({ nama_murid, kelas, jenis_bantuan, tahun, status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success"); setEditItem(null); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('hem_bantuan').delete().eq('id', id));
    if (ok) setData(d => d.filter(r => r.id !== id));
  };

  const JENIS = ["RMT","BAP","KWAPM","Zakat","Lain-lain"];
  const aktif = data.filter(r => r.status === "Aktif").length;
  return (
    <KurPage title="Bantuan Pelajaran" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"🎒", val:data.length, lbl:"Penerima" },
        { ico:"✅", val:aktif, lbl:"Aktif" },
        { ico:"🍱", val:data.filter(r=>r.jenis_bantuan==="RMT").length, lbl:"RMT" },
        { ico:"💰", val:data.filter(r=>r.jenis_bantuan==="BAP").length, lbl:"BAP" },
      ]}>
      <div className="kur-header">
        <button className="btn-add" onClick={() => setShowAdd(true)}>+ Tambah Penerima</button>
      </div>
      {loading ? <div className="loading">⏳ Memuatkan…</div> : (
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead><tr><th>Nama Murid</th><th>Kelas</th><th>Jenis Bantuan</th><th>Tahun</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {data.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:800}}>{r.nama_murid}</td>
                  <td style={{color:"var(--text3)"}}>{r.kelas}</td>
                  <td><span className="badge b-blue">{r.jenis_bantuan}</span></td>
                  <td style={{color:"var(--text3)"}}>{r.tahun}</td>
                  <td><span className={`badge ${r.status==="Aktif"?"b-green":"b-gray"}`}>{r.status}</span></td>
                  <td style={{display:"flex",gap:4}}>
                    <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={() => setEditItem({...r})}>✏️</button>
                    <button className="btn-del" onClick={() => handleDel(r.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Tambah Penerima Bantuan" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={form.nama_murid} onChange={e=>setForm(f=>({...f,nama_murid:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={form.kelas} onChange={e=>setForm(f=>({...f,kelas:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Jenis Bantuan</label>
                <select className="form-input" value={form.jenis_bantuan} onChange={e=>setForm(f=>({...f,jenis_bantuan:e.target.value}))}>
                  {JENIS.map(j=><option key={j}>{j}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-label">Tahun</label><input className="form-input" value={form.tahun} onChange={e=>setForm(f=>({...f,tahun:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Aktif</option><option>Tidak Aktif</option><option>Tamat</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama_murid}`} onClose={() => setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" value={editItem.nama_murid} onChange={e=>setEditItem(f=>({...f,nama_murid:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={editItem.kelas} onChange={e=>setEditItem(f=>({...f,kelas:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Jenis Bantuan</label>
                <select className="form-input" value={editItem.jenis_bantuan} onChange={e=>setEditItem(f=>({...f,jenis_bantuan:e.target.value}))}>
                  {JENIS.map(j=><option key={j}>{j}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-label">Tahun</label><input className="form-input" value={editItem.tahun} onChange={e=>setEditItem(f=>({...f,tahun:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                <option>Aktif</option><option>Tidak Aktif</option><option>Tamat</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 6. KESELAMATAN & 3K ──────────────────────────────────────────────────
function Hem3K() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const blank = { tajuk:"", tarikh:"", jenis:"Kebersihan", lokasi:"", status:"Akan Datang" };
  const [form, setForm] = useState(blank);
  const badgeMap = { "Selesai":"b-green","Akan Datang":"b-yellow","Dalam Proses":"b-blue" };

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_3k').select('*').order('created_at', { ascending: false });
    setData(rows || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('hem_3k').insert([form]));
    if (!ok) return;
    toast("Aktiviti ditambah!", "success"); setShowAdd(false); setForm(blank); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const { tajuk, tarikh, jenis, lokasi, status } = editItem;
    const ok = await dbRun(() => supabase.from('hem_3k').update({ tajuk, tarikh, jenis, lokasi, status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success"); setEditItem(null); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('hem_3k').delete().eq('id', id));
    if (ok) setData(d => d.filter(r => r.id !== id));
  };

  const JENIS_3K = ["Kebersihan","Keselamatan","Kesihatan","Gotong-royong","Lain-lain"];
  const selesai = data.filter(r => r.status === "Selesai").length;
  return (
    <KurPage title="Keselamatan & 3K" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"🛡️", val:data.length, lbl:"Aktiviti" },
        { ico:"✅", val:selesai, lbl:"Selesai" },
        { ico:"📅", val:data.filter(r=>r.status==="Akan Datang").length, lbl:"Akan Datang" },
        { ico:"🔄", val:data.filter(r=>r.status==="Dalam Proses").length, lbl:"Dalam Proses" },
      ]}>
      <div className="kur-header">
        <button className="btn-add" onClick={() => setShowAdd(true)}>+ Tambah Aktiviti</button>
      </div>
      {loading ? <div className="loading">⏳ Memuatkan…</div> : (
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead><tr><th>Tajuk</th><th>Tarikh</th><th>Jenis</th><th>Lokasi</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {data.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:800}}>{r.tajuk}</td>
                  <td style={{color:"var(--text3)",whiteSpace:"nowrap"}}>{r.tarikh}</td>
                  <td><span className="badge b-blue">{r.jenis}</span></td>
                  <td style={{color:"var(--text2)"}}>{r.lokasi}</td>
                  <td><span className={`badge ${badgeMap[r.status]||"b-gray"}`}>{r.status}</span></td>
                  <td style={{display:"flex",gap:4}}>
                    <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={() => setEditItem({...r})}>✏️</button>
                    <button className="btn-del" onClick={() => handleDel(r.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Tambah Aktiviti 3K" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-field"><label className="form-label">Tajuk Aktiviti</label><input className="form-input" required value={form.tajuk} onChange={e=>setForm(f=>({...f,tajuk:e.target.value}))} placeholder="cth: Gotong-royong Bulanan"/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))} placeholder="cth: 15 Mei 2025"/></div>
              <div className="form-field"><label className="form-label">Jenis</label>
                <select className="form-input" value={form.jenis} onChange={e=>setForm(f=>({...f,jenis:e.target.value}))}>
                  {JENIS_3K.map(j=><option key={j}>{j}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" value={form.lokasi} onChange={e=>setForm(f=>({...f,lokasi:e.target.value}))} placeholder="cth: Padang sekolah"/></div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Akan Datang</option><option>Dalam Proses</option><option>Selesai</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.tajuk}`} onClose={() => setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-field"><label className="form-label">Tajuk Aktiviti</label><input className="form-input" value={editItem.tajuk} onChange={e=>setEditItem(f=>({...f,tajuk:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jenis</label>
                <select className="form-input" value={editItem.jenis} onChange={e=>setEditItem(f=>({...f,jenis:e.target.value}))}>
                  {JENIS_3K.map(j=><option key={j}>{j}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" value={editItem.lokasi} onChange={e=>setEditItem(f=>({...f,lokasi:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                <option>Akan Datang</option><option>Dalam Proses</option><option>Selesai</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 7. PENGAWAS SEKOLAH ──────────────────────────────────────────────────
function HemPengawas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const blank = { nama:"", kelas:"", jawatan:"Pengawas Biasa", tarikh_lantik:"", status:"Aktif" };
  const [form, setForm] = useState(blank);

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_pengawas').select('*').order('created_at');
    setData(rows || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('hem_pengawas').insert([form]));
    if (!ok) return;
    toast("Pengawas ditambah!", "success"); setShowAdd(false); setForm(blank); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const { nama, kelas, jawatan, tarikh_lantik, status } = editItem;
    const ok = await dbRun(() => supabase.from('hem_pengawas').update({ nama, kelas, jawatan, tarikh_lantik, status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success"); setEditItem(null); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('hem_pengawas').delete().eq('id', id));
    if (ok) setData(d => d.filter(r => r.id !== id));
  };

  const JAWATAN = ["Ketua Pengawas","Penolong Ketua","Pengawas Biasa"];
  const aktif = data.filter(r => r.status === "Aktif").length;
  return (
    <KurPage title="Pengawas Sekolah" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"🎖️", val:data.length, lbl:"Pengawas" },
        { ico:"✅", val:aktif, lbl:"Aktif" },
        { ico:"👑", val:data.filter(r=>r.jawatan==="Ketua Pengawas").length, lbl:"Ketua" },
        { ico:"🏅", val:data.filter(r=>r.jawatan==="Pengawas Biasa").length, lbl:"Biasa" },
      ]}>
      <div className="kur-header">
        <button className="btn-add" onClick={() => setShowAdd(true)}>+ Tambah Pengawas</button>
      </div>
      {loading ? <div className="loading">⏳ Memuatkan…</div> : (
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead><tr><th>#</th><th>Nama</th><th>Kelas</th><th>Jawatan</th><th>Tarikh Lantik</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={r.id}>
                  <td style={{fontWeight:900,color:"var(--accent)"}}>{i+1}</td>
                  <td style={{fontWeight:800}}>{r.nama}</td>
                  <td style={{color:"var(--text3)"}}>{r.kelas}</td>
                  <td><span className={`badge ${r.jawatan==="Ketua Pengawas"?"b-purple":r.jawatan==="Penolong Ketua"?"b-blue":"b-gray"}`}>{r.jawatan}</span></td>
                  <td style={{color:"var(--text3)",whiteSpace:"nowrap"}}>{r.tarikh_lantik}</td>
                  <td><span className={`badge ${r.status==="Aktif"?"b-green":"b-gray"}`}>{r.status}</span></td>
                  <td style={{display:"flex",gap:4}}>
                    <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={() => setEditItem({...r})}>✏️</button>
                    <button className="btn-del" onClick={() => handleDel(r.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Tambah Pengawas" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={form.kelas} onChange={e=>setForm(f=>({...f,kelas:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Jawatan</label>
                <select className="form-input" value={form.jawatan} onChange={e=>setForm(f=>({...f,jawatan:e.target.value}))}>
                  {JAWATAN.map(j=><option key={j}>{j}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-label">Tarikh Lantik</label><input className="form-input" value={form.tarikh_lantik} onChange={e=>setForm(f=>({...f,tarikh_lantik:e.target.value}))} placeholder="cth: 1 Jan 2025"/></div>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Aktif</option><option>Tidak Aktif</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama}`} onClose={() => setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama</label><input className="form-input" value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={editItem.kelas} onChange={e=>setEditItem(f=>({...f,kelas:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Jawatan</label>
                <select className="form-input" value={editItem.jawatan} onChange={e=>setEditItem(f=>({...f,jawatan:e.target.value}))}>
                  {JAWATAN.map(j=><option key={j}>{j}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-label">Tarikh Lantik</label><input className="form-input" value={editItem.tarikh_lantik} onChange={e=>setEditItem(f=>({...f,tarikh_lantik:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                <option>Aktif</option><option>Tidak Aktif</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 8. KOPERASI ──────────────────────────────────────────────────────────
function HemKoperasi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const blank = { nama_produk:"", kategori:"Alat Tulis", stok:0, harga:0, status:"Tersedia" };
  const [form, setForm] = useState(blank);

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_koperasi').select('*').order('created_at');
    setData(rows || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('hem_koperasi').insert([{ ...form, stok:Number(form.stok), harga:Number(form.harga) }]));
    if (!ok) return;
    toast("Produk ditambah!", "success"); setShowAdd(false); setForm(blank); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const { nama_produk, kategori, status } = editItem;
    const stok = Number(editItem.stok); const harga = Number(editItem.harga);
    const ok = await dbRun(() => supabase.from('hem_koperasi').update({ nama_produk, kategori, stok, harga, status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Dikemaskini!", "success"); setEditItem(null); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('hem_koperasi').delete().eq('id', id));
    if (ok) setData(d => d.filter(r => r.id !== id));
  };
  const adjustStok = async (id, cur, delta) => {
    const val = Math.max(0, cur + delta);
    const ok = await dbRun(() => supabase.from('hem_koperasi').update({ stok: val }).eq('id', id));
    if (ok) setData(d => d.map(r => r.id === id ? {...r, stok:val} : r));
  };

  const KAT = ["Alat Tulis","Pakaian","Makanan & Minuman","Buku","Lain-lain"];
  const tersedia = data.filter(r => r.status === "Tersedia").length;
  const totalStok = data.reduce((a, r) => a + (r.stok || 0), 0);
  return (
    <KurPage title="Koperasi Sekolah" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"🏪", val:data.length, lbl:"Produk" },
        { ico:"✅", val:tersedia, lbl:"Tersedia" },
        { ico:"📦", val:totalStok, lbl:"Jumlah Stok" },
        { ico:"🚫", val:data.filter(r=>r.stok===0).length, lbl:"Kehabisan" },
      ]}>
      <div className="kur-header">
        <button className="btn-add" onClick={() => setShowAdd(true)}>+ Tambah Produk</button>
      </div>
      {loading ? <div className="loading">⏳ Memuatkan…</div> : (
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead><tr><th>Nama Produk</th><th>Kategori</th><th>Stok</th><th>Harga (RM)</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {data.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:800}}>{r.nama_produk}</td>
                  <td><span className="badge b-blue">{r.kategori}</span></td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button onClick={() => adjustStok(r.id, r.stok, -1)} style={{border:"1px solid var(--border)",background:"var(--surface)",borderRadius:4,width:22,height:22,cursor:"pointer",color:"var(--text)",fontWeight:900,lineHeight:1}}>-</button>
                      <span style={{fontWeight:900,color:"var(--accent)",minWidth:24,textAlign:"center"}}>{r.stok}</span>
                      <button onClick={() => adjustStok(r.id, r.stok, 1)} style={{border:"1px solid var(--border)",background:"var(--surface)",borderRadius:4,width:22,height:22,cursor:"pointer",color:"var(--text)",fontWeight:900,lineHeight:1}}>+</button>
                    </div>
                  </td>
                  <td style={{fontWeight:700}}>RM {Number(r.harga).toFixed(2)}</td>
                  <td><span className={`badge ${r.stok===0?"b-red":r.stok<10?"b-yellow":"b-green"}`}>{r.stok===0?"Habis":r.stok<10?"Sedikit":"Tersedia"}</span></td>
                  <td style={{display:"flex",gap:4}}>
                    <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={() => setEditItem({...r})}>✏️</button>
                    <button className="btn-del" onClick={() => handleDel(r.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Tambah Produk Koperasi" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-field"><label className="form-label">Nama Produk</label><input className="form-input" required value={form.nama_produk} onChange={e=>setForm(f=>({...f,nama_produk:e.target.value}))} placeholder="cth: Buku Tulis A4"/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kategori</label>
                <select className="form-input" value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value}))}>
                  {KAT.map(k=><option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  <option>Tersedia</option><option>Tidak Tersedia</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Stok</label><input className="form-input" type="number" min="0" value={form.stok} onChange={e=>setForm(f=>({...f,stok:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Harga (RM)</label><input className="form-input" type="number" min="0" step="0.01" value={form.harga} onChange={e=>setForm(f=>({...f,harga:e.target.value}))}/></div>
            </div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama_produk}`} onClose={() => setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-field"><label className="form-label">Nama Produk</label><input className="form-input" value={editItem.nama_produk} onChange={e=>setEditItem(f=>({...f,nama_produk:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kategori</label>
                <select className="form-input" value={editItem.kategori} onChange={e=>setEditItem(f=>({...f,kategori:e.target.value}))}>
                  {KAT.map(k=><option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-label">Status</label>
                <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                  <option>Tersedia</option><option>Tidak Tersedia</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Stok</label><input className="form-input" type="number" min="0" value={editItem.stok} onChange={e=>setEditItem(f=>({...f,stok:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Harga (RM)</label><input className="form-input" type="number" min="0" step="0.01" value={editItem.harga} onChange={e=>setEditItem(f=>({...f,harga:e.target.value}))}/></div>
            </div>
            <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM ROUTER ───────────────────────────────────────────────────────────────
function HEMPage({ subId, onNav }) {
  const m = MODULES.find(x => x.id === "hem");
  const idx = m?.ids.indexOf(subId) ?? -1;
  const sName = idx >= 0 ? m.subs[idx] : "";

  const views = {
    apdm:      <HemMurid />,
    disiplin:  <HemDisiplin />,
    kaunseling:<HemKaunseling />,
    kesihatan: <HemKesihatan />,
    bantuan:   <HemBantuan />,
    "3k":      <Hem3K />,
    pengawas:  <HemPengawas />,
    koperasi:  <HemKoperasi />,
  };

  return (
    <div>
      <div className="pg-top" style={{marginBottom:14}}>
        <div className="pg-chip" style={{color:"#2563eb",borderColor:"#bfdbfe"}}
          onClick={() => onNav(null, null)}>🏠 Papan Pemuka</div>
        <span className="pg-sep">›</span>
        <div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`}}>{m.icon} {m.label}</div>
        {sName && <><span className="pg-sep">›</span>
        <div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`,background:m.light}}>{sName}</div></>}
      </div>

      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
        {m.subs.map((s, i) => (
          <button key={m.ids[i]}
            onClick={() => onNav("hem", m.ids[i])}
            style={{
              padding:"7px 14px", borderRadius:12,
              border:`1.5px solid ${subId===m.ids[i]?m.color:"var(--border)"}`,
              background:subId===m.ids[i]?m.color:"var(--surface)",
              color:subId===m.ids[i]?"white":"var(--text2)",
              fontSize:12, fontWeight:800,
              fontFamily:"'Nunito',sans-serif",
              cursor:"pointer", transition:"all 0.15s",
            }}>
            {s}
          </button>
        ))}
      </div>

      {views[subId] || <div style={{color:"var(--text2)",padding:40,textAlign:"center"}}>Pilih sub-modul</div>}
    </div>
  );
}

// ─── KURIKULUM ROUTER ─────────────────────────────────────────────────────────
function KurikulumPage({ subId, onNav }) {
  const m = MODULES.find(x=>x.id==="kurikulum");
  const idx = m?.ids.indexOf(subId)??-1;
  const sName = idx>=0 ? m.subs[idx] : "";

  const views = {
    jadual:      <JadualWaktu />,
    panitia:     <PanitiaMP />,
    peperiksaan: <Peperiksaan />,
    rph:         <RPHRekod />,
    program:     <ProgramAkademik />,
    pss:         <PusatSumber />,
    staf:        <PerkembanganStaf />,
  };

  return (
    <div>
      {/* breadcrumb */}
      <div className="pg-top" style={{marginBottom:14}}>
        <div className="pg-chip" style={{color:"#2563eb",borderColor:"#bfdbfe"}}
          onClick={()=>onNav(null,null)}>🏠 Papan Pemuka</div>
        <span className="pg-sep">›</span>
        <div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`}}>{m.icon} {m.label}</div>
        {sName&&<><span className="pg-sep">›</span>
        <div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`,background:m.light}}>{sName}</div></>}
      </div>

      {/* sub-tab nav */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
        {m.subs.map((s,i)=>(
          <button key={m.ids[i]}
            onClick={()=>onNav("kurikulum",m.ids[i])}
            style={{
              padding:"7px 14px", borderRadius:12,
              border:`1.5px solid ${subId===m.ids[i]?m.color:"var(--border)"}`,
              background:subId===m.ids[i]?m.color:"var(--surface)",
              color:subId===m.ids[i]?"white":"var(--text2)",
              fontSize:12, fontWeight:800,
              fontFamily:"'Nunito',sans-serif",
              cursor:"pointer", transition:"all 0.15s",
              backdropFilter:"blur(12px)",
            }}>
            {s}
          </button>
        ))}
      </div>

      {views[subId] || <div style={{color:"var(--text2)",padding:40,textAlign:"center"}}>Pilih sub-modul</div>}
    </div>
  );
}

// ─── KOKURIKULUM — SUB-PAGES ─────────────────────────────────────────────────
function KelabPersatuan() {
  const SEED=[{id:1,nama:"Kelab Bahasa Melayu",jenis:"Kelab",pengerusi:"Cikgu Rosnah Bt Ali",ahli:22,status:"Aktif"},{id:2,nama:"Persatuan Matematik",jenis:"Persatuan",pengerusi:"Cikgu Hafiz Bin Salleh",ahli:18,status:"Aktif"},{id:3,nama:"Kelab Sains Alam Sekitar",jenis:"Kelab",pengerusi:"Cikgu Laila Bt Hamid",ahli:15,status:"Aktif"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={nama:"",jenis:"Kelab",pengerusi:"",ahli:10,status:"Aktif"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  return (
    <KurPage title="Kelab & Persatuan" sub="Kokurikulum · SK Darau"
      stats={[{ico:"🏛️",val:data.length,lbl:"Kelab/Persatuan"},{ico:"✅",val:data.filter(d=>d.status==="Aktif").length,lbl:"Aktif"},{ico:"👥",val:data.reduce((s,d)=>s+Number(d.ahli),0),lbl:"Jumlah Ahli"},{ico:"📋",val:[...new Set(data.map(d=>d.jenis))].length,lbl:"Jenis"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Nama</th><th>Jenis</th><th>Pengerusi</th><th>Ahli</th><th>Status</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.nama}</td>
            <td><span className={`badge ${p.jenis==="Kelab"?"b-blue":"b-green"}`}>{p.jenis}</span></td>
            <td>{p.pengerusi}</td><td>{p.ahli}</td>
            <td><span className={`badge ${p.status==="Aktif"?"b-green":"b-red"}`}>{p.status}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Kelab/Persatuan" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Nama</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jenis</label><select className="form-input" value={form.jenis} onChange={e=>setForm(f=>({...f,jenis:e.target.value}))}><option>Kelab</option><option>Persatuan</option></select></div>
          <div className="form-field"><label className="form-label">Jumlah Ahli</label><input className="form-input" type="number" min="1" value={form.ahli} onChange={e=>setForm(f=>({...f,ahli:+e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Pengerusi</label><input className="form-input" required value={form.pengerusi} onChange={e=>setForm(f=>({...f,pengerusi:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Nama</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jenis</label><select className="form-input" value={editItem.jenis} onChange={e=>setEditItem(f=>({...f,jenis:e.target.value}))}><option>Kelab</option><option>Persatuan</option></select></div>
          <div className="form-field"><label className="form-label">Jumlah Ahli</label><input className="form-input" type="number" min="1" value={editItem.ahli} onChange={e=>setEditItem(f=>({...f,ahli:+e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Pengerusi</label><input className="form-input" required value={editItem.pengerusi} onChange={e=>setEditItem(f=>({...f,pengerusi:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function BadanBeruniform() {
  const SEED=[{id:1,nama:"Pengakap",pengerusi:"Cikgu Azman Bin Yusof",jurulatih:"Cikgu Nordin",ahli:28,status:"Aktif"},{id:2,nama:"Puteri Islam",pengerusi:"Cikgu Siti Bt Kamal",jurulatih:"Cikgu Aminah",ahli:24,status:"Aktif"},{id:3,nama:"Bulan Sabit Merah",pengerusi:"Cikgu Rajan A/L Kumar",jurulatih:"Cikgu Priya",ahli:20,status:"Aktif"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={nama:"",pengerusi:"",jurulatih:"",ahli:10,status:"Aktif"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  return (
    <KurPage title="Badan Beruniform" sub="Kokurikulum · SK Darau"
      stats={[{ico:"🎖️",val:data.length,lbl:"Badan Beruniform"},{ico:"✅",val:data.filter(d=>d.status==="Aktif").length,lbl:"Aktif"},{ico:"👥",val:data.reduce((s,d)=>s+Number(d.ahli),0),lbl:"Jumlah Ahli"},{ico:"👩‍🏫",val:[...new Set(data.map(d=>d.jurulatih))].length,lbl:"Jurulatih"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Nama Badan</th><th>Pengerusi</th><th>Jurulatih</th><th>Ahli</th><th>Status</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.nama}</td><td>{p.pengerusi}</td><td>{p.jurulatih}</td><td>{p.ahli}</td>
            <td><span className={`badge ${p.status==="Aktif"?"b-green":"b-red"}`}>{p.status}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Badan Beruniform" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Nama Badan</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Pengerusi</label><input className="form-input" required value={form.pengerusi} onChange={e=>setForm(f=>({...f,pengerusi:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Jurulatih</label><input className="form-input" required value={form.jurulatih} onChange={e=>setForm(f=>({...f,jurulatih:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jumlah Ahli</label><input className="form-input" type="number" min="1" value={form.ahli} onChange={e=>setForm(f=>({...f,ahli:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Nama Badan</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Pengerusi</label><input className="form-input" required value={editItem.pengerusi} onChange={e=>setEditItem(f=>({...f,pengerusi:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Jurulatih</label><input className="form-input" required value={editItem.jurulatih} onChange={e=>setEditItem(f=>({...f,jurulatih:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jumlah Ahli</label><input className="form-input" type="number" min="1" value={editItem.ahli} onChange={e=>setEditItem(f=>({...f,ahli:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function SukanPermainan() {
  const SEED=[{id:1,sukan:"Bola Sepak",kategori:"Lelaki",jurulatih:"Cikgu Azhar Bin Daud",atlet:18,status:"Aktif"},{id:2,sukan:"Bola Jaring",kategori:"Perempuan",jurulatih:"Cikgu Nora Bt Jamil",atlet:15,status:"Aktif"},{id:3,sukan:"Badminton",kategori:"Campuran",jurulatih:"Cikgu Farid Bin Hassan",atlet:12,status:"Aktif"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={sukan:"",kategori:"Campuran",jurulatih:"",atlet:10,status:"Aktif"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  return (
    <KurPage title="Sukan & Permainan" sub="Kokurikulum · SK Darau"
      stats={[{ico:"⚽",val:data.length,lbl:"Jenis Sukan"},{ico:"✅",val:data.filter(d=>d.status==="Aktif").length,lbl:"Aktif"},{ico:"🏃",val:data.reduce((s,d)=>s+Number(d.atlet),0),lbl:"Jumlah Atlet"},{ico:"👩‍🏫",val:[...new Set(data.map(d=>d.jurulatih))].length,lbl:"Jurulatih"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Sukan</th><th>Kategori</th><th>Jurulatih</th><th>Atlet</th><th>Status</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.sukan}</td>
            <td><span className={`badge ${p.kategori==="Lelaki"?"b-blue":p.kategori==="Perempuan"?"b-green":"b-yellow"}`}>{p.kategori}</span></td>
            <td>{p.jurulatih}</td><td>{p.atlet}</td>
            <td><span className={`badge ${p.status==="Aktif"?"b-green":"b-red"}`}>{p.status}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Sukan" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Sukan</label><input className="form-input" required value={form.sukan} onChange={e=>setForm(f=>({...f,sukan:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Kategori</label><select className="form-input" value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value}))}><option>Lelaki</option><option>Perempuan</option><option>Campuran</option></select></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jurulatih</label><input className="form-input" required value={form.jurulatih} onChange={e=>setForm(f=>({...f,jurulatih:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Jumlah Atlet</label><input className="form-input" type="number" min="1" value={form.atlet} onChange={e=>setForm(f=>({...f,atlet:+e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.sukan}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Sukan</label><input className="form-input" required value={editItem.sukan} onChange={e=>setEditItem(f=>({...f,sukan:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Kategori</label><select className="form-input" value={editItem.kategori} onChange={e=>setEditItem(f=>({...f,kategori:e.target.value}))}><option>Lelaki</option><option>Perempuan</option><option>Campuran</option></select></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jurulatih</label><input className="form-input" required value={editItem.jurulatih} onChange={e=>setEditItem(f=>({...f,jurulatih:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Jumlah Atlet</label><input className="form-input" type="number" min="1" value={editItem.atlet} onChange={e=>setEditItem(f=>({...f,atlet:+e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function PAJSKPage() {
  const SEED=[{id:1,nama:"Ahmad Firdaus",kelas:"Tahun 5 Unik",jawatan:"Naib Pengerusi Kelab",skor:85,gred:"A"},{id:2,nama:"Nur Aisyah",kelas:"Tahun 5 Aplikasi",jawatan:"Ketua Pengawas",skor:92,gred:"A"},{id:3,nama:"Mohd Haziq",kelas:"Tahun 6 Unik",jawatan:"Ahli Aktif",skor:78,gred:"B"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={nama:"",kelas:"Tahun 4 Unik",jawatan:"",skor:70,gred:"B"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  const gradeColor={A:"b-green",B:"b-blue",C:"b-yellow",D:"b-red"};
  return (
    <KurPage title="PAJSK" sub="Kokurikulum · SK Darau"
      stats={[{ico:"🏅",val:data.length,lbl:"Murid Dinilai"},{ico:"⭐",val:data.filter(d=>d.gred==="A").length,lbl:"Gred A"},{ico:"📊",val:data.length?Math.round(data.reduce((s,d)=>s+Number(d.skor),0)/data.length):0,lbl:"Purata Skor"},{ico:"🎖️",val:[...new Set(data.map(d=>d.jawatan))].length,lbl:"Jenis Jawatan"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Murid</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Nama Murid</th><th>Kelas</th><th>Jawatan</th><th>Skor</th><th>Gred</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.nama}</td><td>{p.kelas}</td><td>{p.jawatan}</td><td>{p.skor}</td>
            <td><span className={`badge ${gradeColor[p.gred]||"b-gray"}`}>{p.gred}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Rekod PAJSK" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Kelas</label><select className="form-input" value={form.kelas} onChange={e=>setForm(f=>({...f,kelas:e.target.value}))}>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}</select></div>
        </div>
        <div className="form-field"><label className="form-label">Jawatan</label><input className="form-input" required value={form.jawatan} onChange={e=>setForm(f=>({...f,jawatan:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Skor</label><input className="form-input" type="number" min="0" max="100" value={form.skor} onChange={e=>setForm(f=>({...f,skor:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Gred</label><select className="form-input" value={form.gred} onChange={e=>setForm(f=>({...f,gred:e.target.value}))}><option>A</option><option>B</option><option>C</option><option>D</option></select></div>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Kelas</label><select className="form-input" value={editItem.kelas} onChange={e=>setEditItem(f=>({...f,kelas:e.target.value}))}>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}</select></div>
        </div>
        <div className="form-field"><label className="form-label">Jawatan</label><input className="form-input" required value={editItem.jawatan} onChange={e=>setEditItem(f=>({...f,jawatan:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Skor</label><input className="form-input" type="number" min="0" max="100" value={editItem.skor} onChange={e=>setEditItem(f=>({...f,skor:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Gred</label><select className="form-input" value={editItem.gred} onChange={e=>setEditItem(f=>({...f,gred:e.target.value}))}><option>A</option><option>B</option><option>C</option><option>D</option></select></div>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function ProfilMuridKoku() {
  const SEED=[{id:1,nama:"Ahmad Firdaus",kelas:"Tahun 5 Unik",kelab:"Kelab Sains",uniform:"Pengakap",sukan:"Bola Sepak"},{id:2,nama:"Nur Aisyah",kelas:"Tahun 5 Aplikasi",kelab:"Persatuan Matematik",uniform:"Puteri Islam",sukan:"Bola Jaring"},{id:3,nama:"Lim Wei Xian",kelas:"Tahun 4 Revolusi",kelab:"Kelab Bahasa Melayu",uniform:"Bulan Sabit Merah",sukan:"Badminton"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={nama:"",kelas:"Tahun 1 Unik",kelab:"",uniform:"",sukan:""};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  return (
    <KurPage title="Profil Murid Kokurikulum" sub="Kokurikulum · SK Darau"
      stats={[{ico:"👦",val:data.length,lbl:"Jumlah Murid"},{ico:"🏛️",val:[...new Set(data.map(d=>d.kelab))].length,lbl:"Kelab Berbeza"},{ico:"🎖️",val:[...new Set(data.map(d=>d.uniform))].length,lbl:"Badan Beruniform"},{ico:"⚽",val:[...new Set(data.map(d=>d.sukan))].length,lbl:"Jenis Sukan"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Profil</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Nama</th><th>Kelas</th><th>Kelab</th><th>Beruniform</th><th>Sukan</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.nama}</td><td>{p.kelas}</td>
            <td><span className="badge b-blue">{p.kelab}</span></td>
            <td><span className="badge b-green">{p.uniform}</span></td>
            <td><span className="badge b-yellow">{p.sukan}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Profil Murid" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Kelas</label><select className="form-input" value={form.kelas} onChange={e=>setForm(f=>({...f,kelas:e.target.value}))}>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}</select></div>
        </div>
        <div className="form-field"><label className="form-label">Kelab/Persatuan</label><input className="form-input" required value={form.kelab} onChange={e=>setForm(f=>({...f,kelab:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Badan Beruniform</label><input className="form-input" required value={form.uniform} onChange={e=>setForm(f=>({...f,uniform:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Sukan</label><input className="form-input" required value={form.sukan} onChange={e=>setForm(f=>({...f,sukan:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Kelas</label><select className="form-input" value={editItem.kelas} onChange={e=>setEditItem(f=>({...f,kelas:e.target.value}))}>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}</select></div>
        </div>
        <div className="form-field"><label className="form-label">Kelab/Persatuan</label><input className="form-input" required value={editItem.kelab} onChange={e=>setEditItem(f=>({...f,kelab:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Badan Beruniform</label><input className="form-input" required value={editItem.uniform} onChange={e=>setEditItem(f=>({...f,uniform:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Sukan</label><input className="form-input" required value={editItem.sukan} onChange={e=>setEditItem(f=>({...f,sukan:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function PencapaianKoku() {
  const SEED=[{id:1,acara:"Merentas Desa Daerah",tahap:"Daerah",tempat:"Ke-2",tarikh:"15 Mac 2025",status:"Selesai"},{id:2,acara:"Pertandingan Nasyid Zon",tahap:"Zon",tempat:"Ke-1",tarikh:"22 April 2025",status:"Selesai"},{id:3,acara:"Kejohanan Bola Sepak MSSD",tahap:"Daerah",tempat:"Separuh Akhir",tarikh:"10 Mei 2025",status:"Selesai"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={acara:"",tahap:"Sekolah",tempat:"",tarikh:"",status:"Akan Datang"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  const stColor={Selesai:"b-green","Akan Datang":"b-yellow",Semasa:"b-blue"};
  return (
    <KurPage title="Pencapaian" sub="Kokurikulum · SK Darau"
      stats={[{ico:"🏆",val:data.length,lbl:"Acara"},{ico:"✅",val:data.filter(d=>d.status==="Selesai").length,lbl:"Selesai"},{ico:"🥇",val:data.filter(d=>d.tempat==="Ke-1").length,lbl:"Tempat Pertama"},{ico:"🌟",val:[...new Set(data.map(d=>d.tahap))].length,lbl:"Peringkat"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Pencapaian</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Acara</th><th>Tahap</th><th>Tempat</th><th>Tarikh</th><th>Status</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.acara}</td>
            <td><span className="badge b-blue">{p.tahap}</span></td>
            <td style={{fontWeight:700,color:"#f59e0b"}}>{p.tempat}</td><td style={{color:"var(--text2)"}}>{p.tarikh}</td>
            <td><span className={`badge ${stColor[p.status]||"b-gray"}`}>{p.status}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Pencapaian" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Nama Acara</label><input className="form-input" required value={form.acara} onChange={e=>setForm(f=>({...f,acara:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tahap</label><select className="form-input" value={form.tahap} onChange={e=>setForm(f=>({...f,tahap:e.target.value}))}><option>Sekolah</option><option>Zon</option><option>Daerah</option><option>Negeri</option><option>Kebangsaan</option></select></div>
          <div className="form-field"><label className="form-label">Tempat/Kedudukan</label><input className="form-input" required value={form.tempat} onChange={e=>setForm(f=>({...f,tempat:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select></div>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.acara}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Nama Acara</label><input className="form-input" required value={editItem.acara} onChange={e=>setEditItem(f=>({...f,acara:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tahap</label><select className="form-input" value={editItem.tahap} onChange={e=>setEditItem(f=>({...f,tahap:e.target.value}))}><option>Sekolah</option><option>Zon</option><option>Daerah</option><option>Negeri</option><option>Kebangsaan</option></select></div>
          <div className="form-field"><label className="form-label">Tempat/Kedudukan</label><input className="form-input" required value={editItem.tempat} onChange={e=>setEditItem(f=>({...f,tempat:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select></div>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function OPRPage() {
  const SEED=[{id:1,nama:"Ahmad Firdaus",kelab:"Kelab Sains",markah:85,gred:"A",catatan:"Cemerlang"},{id:2,nama:"Nur Aisyah",kelab:"Pengakap",markah:90,gred:"A",catatan:"Cemerlang"},{id:3,nama:"Lim Wei Xian",kelab:"Persatuan Matematik",markah:72,gred:"B",catatan:"Baik"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={nama:"",kelab:"",markah:70,gred:"B",catatan:""};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  const gc={A:"b-green",B:"b-blue",C:"b-yellow",D:"b-red"};
  return (
    <KurPage title="OPR (Penilaian Keseluruhan)" sub="Kokurikulum · SK Darau"
      stats={[{ico:"📊",val:data.length,lbl:"Rekod"},{ico:"⭐",val:data.filter(d=>d.gred==="A").length,lbl:"Gred A"},{ico:"📈",val:data.length?Math.round(data.reduce((s,d)=>s+Number(d.markah),0)/data.length):0,lbl:"Purata Markah"},{ico:"🏅",val:"A",lbl:"Gred Tertinggi"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Rekod</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Nama Murid</th><th>Kelab/Badan</th><th>Markah</th><th>Gred</th><th>Catatan</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.nama}</td><td>{p.kelab}</td><td style={{fontWeight:700}}>{p.markah}</td>
            <td><span className={`badge ${gc[p.gred]||"b-gray"}`}>{p.gred}</span></td>
            <td style={{color:"var(--text2)"}}>{p.catatan}</td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Rekod OPR" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Kelab/Badan</label><input className="form-input" required value={form.kelab} onChange={e=>setForm(f=>({...f,kelab:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Markah</label><input className="form-input" type="number" min="0" max="100" value={form.markah} onChange={e=>setForm(f=>({...f,markah:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Gred</label><select className="form-input" value={form.gred} onChange={e=>setForm(f=>({...f,gred:e.target.value}))}><option>A</option><option>B</option><option>C</option><option>D</option></select></div>
        </div>
        <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={form.catatan} onChange={e=>setForm(f=>({...f,catatan:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Kelab/Badan</label><input className="form-input" required value={editItem.kelab} onChange={e=>setEditItem(f=>({...f,kelab:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Markah</label><input className="form-input" type="number" min="0" max="100" value={editItem.markah} onChange={e=>setEditItem(f=>({...f,markah:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Gred</label><select className="form-input" value={editItem.gred} onChange={e=>setEditItem(f=>({...f,gred:e.target.value}))}><option>A</option><option>B</option><option>C</option><option>D</option></select></div>
        </div>
        <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={editItem.catatan} onChange={e=>setEditItem(f=>({...f,catatan:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function TakwimKokurikulum() {
  const SEED=[{id:1,aktiviti:"Hari Sukan Sekolah",tarikh:"14 Mac 2025",masa:"7:30 pagi",tempat:"Padang Sekolah",status:"Selesai"},{id:2,aktiviti:"Pertandingan Bola Sepak MSSD",tarikh:"20 April 2025",masa:"8:00 pagi",tempat:"Stadium Mini Kota Belud",status:"Selesai"},{id:3,aktiviti:"Kejohanan Olahraga Zon",tarikh:"15 Jun 2025",masa:"7:30 pagi",tempat:"Stadium Likas",status:"Akan Datang"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={aktiviti:"",tarikh:"",masa:"",tempat:"",status:"Akan Datang"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  const stC={Selesai:"b-green","Akan Datang":"b-yellow",Semasa:"b-blue"};
  return (
    <KurPage title="Takwim Kokurikulum" sub="Kokurikulum · SK Darau"
      stats={[{ico:"📅",val:data.length,lbl:"Aktiviti"},{ico:"✅",val:data.filter(d=>d.status==="Selesai").length,lbl:"Selesai"},{ico:"⏳",val:data.filter(d=>d.status==="Akan Datang").length,lbl:"Akan Datang"},{ico:"📍",val:[...new Set(data.map(d=>d.tempat))].length,lbl:"Lokasi"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Aktiviti</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Aktiviti</th><th>Tarikh</th><th>Masa</th><th>Tempat</th><th>Status</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.aktiviti}</td><td style={{color:"var(--text2)"}}>{p.tarikh}</td>
            <td>{p.masa}</td><td>{p.tempat}</td>
            <td><span className={`badge ${stC[p.status]||"b-gray"}`}>{p.status}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Aktiviti" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Nama Aktiviti</label><input className="form-input" required value={form.aktiviti} onChange={e=>setForm(f=>({...f,aktiviti:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={form.masa} onChange={e=>setForm(f=>({...f,masa:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tempat</label><input className="form-input" value={form.tempat} onChange={e=>setForm(f=>({...f,tempat:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select></div>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.aktiviti}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Nama Aktiviti</label><input className="form-input" required value={editItem.aktiviti} onChange={e=>setEditItem(f=>({...f,aktiviti:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={editItem.masa} onChange={e=>setEditItem(f=>({...f,masa:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tempat</label><input className="form-input" value={editItem.tempat} onChange={e=>setEditItem(f=>({...f,tempat:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select></div>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

// ─── KOKURIKULUM ROUTER ───────────────────────────────────────────────────────
function KokurikulumPage({ subId, onNav }) {
  const m = MODULES.find(x=>x.id==="kokurikulum");
  const idx = m?.ids.indexOf(subId)??-1;
  const sName = idx>=0 ? m.subs[idx] : "";
  const views = {
    kelab:      <KelabPersatuan />,
    uniform:    <BadanBeruniform />,
    sukan:      <SukanPermainan />,
    pajsk:      <PAJSKPage />,
    profil:     <ProfilMuridKoku />,
    pencapaian: <PencapaianKoku />,
    opr:        <OPRPage />,
    takwim:     <TakwimKokurikulum />,
  };
  return (
    <div>
      <div className="pg-top" style={{marginBottom:14}}>
        <div className="pg-chip" style={{color:"#2563eb",borderColor:"#bfdbfe"}} onClick={()=>onNav(null,null)}>🏠 Papan Pemuka</div>
        <span className="pg-sep">›</span>
        <div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`}}>{m.icon} {m.label}</div>
        {sName&&<><span className="pg-sep">›</span><div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`,background:m.light}}>{sName}</div></>}
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
        {m.subs.map((s,i)=>(
          <button key={m.ids[i]} onClick={()=>onNav("kokurikulum",m.ids[i])} style={{padding:"7px 14px",borderRadius:12,border:`1.5px solid ${subId===m.ids[i]?m.color:"var(--border)"}`,background:subId===m.ids[i]?m.color:"var(--surface)",color:subId===m.ids[i]?"white":"var(--text2)",fontSize:12,fontWeight:800,fontFamily:"'Nunito',sans-serif",cursor:"pointer",transition:"all 0.15s"}}>
            {s}
          </button>
        ))}
      </div>
      {views[subId] || <div style={{color:"var(--text2)",padding:40,textAlign:"center"}}>Pilih sub-modul</div>}
    </div>
  );
}

// ─── PENTADBIRAN — SUB-PAGES ─────────────────────────────────────────────────
function KewanganPCG() {
  const SEED=[{id:1,butiran:"Pembelian Buku Teks",amaun:1200.00,tarikh:"5 Jan 2025",kategori:"PCG",status:"Selesai"},{id:2,butiran:"Alatan Sukan",amaun:850.00,tarikh:"12 Feb 2025",kategori:"PCG",status:"Selesai"},{id:3,butiran:"Peralatan Makmal",amaun:2300.00,tarikh:"1 Mac 2025",kategori:"SUWA",status:"Dalam Proses"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={butiran:"",amaun:0,tarikh:"",kategori:"PCG",status:"Dalam Proses"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  const stC={Selesai:"b-green","Dalam Proses":"b-yellow",Ditolak:"b-red"};
  return (
    <KurPage title="Kewangan (PCG)" sub="Pentadbiran Am · SK Darau"
      stats={[{ico:"💰",val:data.length,lbl:"Rekod"},{ico:"✅",val:data.filter(d=>d.status==="Selesai").length,lbl:"Selesai"},{ico:"💵",val:`RM${data.reduce((s,d)=>s+Number(d.amaun),0).toFixed(0)}`,lbl:"Jumlah Perbelanjaan"},{ico:"⏳",val:data.filter(d=>d.status==="Dalam Proses").length,lbl:"Dalam Proses"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Rekod</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Butiran</th><th>Kategori</th><th>Amaun (RM)</th><th>Tarikh</th><th>Status</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.butiran}</td>
            <td><span className="badge b-blue">{p.kategori}</span></td>
            <td style={{fontWeight:700}}>{Number(p.amaun).toFixed(2)}</td>
            <td style={{color:"var(--text2)"}}>{p.tarikh}</td>
            <td><span className={`badge ${stC[p.status]||"b-gray"}`}>{p.status}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Rekod Kewangan" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Butiran</label><input className="form-input" required value={form.butiran} onChange={e=>setForm(f=>({...f,butiran:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Kategori</label><select className="form-input" value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value}))}><option>PCG</option><option>SUWA</option><option>Kerajaan</option><option>PIBG</option></select></div>
          <div className="form-field"><label className="form-label">Amaun (RM)</label><input className="form-input" type="number" min="0" step="0.01" value={form.amaun} onChange={e=>setForm(f=>({...f,amaun:+e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Dalam Proses</option><option>Selesai</option><option>Ditolak</option></select></div>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.butiran}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Butiran</label><input className="form-input" required value={editItem.butiran} onChange={e=>setEditItem(f=>({...f,butiran:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Kategori</label><select className="form-input" value={editItem.kategori} onChange={e=>setEditItem(f=>({...f,kategori:e.target.value}))}><option>PCG</option><option>SUWA</option><option>Kerajaan</option><option>PIBG</option></select></div>
          <div className="form-field"><label className="form-label">Amaun (RM)</label><input className="form-input" type="number" min="0" step="0.01" value={editItem.amaun} onChange={e=>setEditItem(f=>({...f,amaun:+e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Dalam Proses</option><option>Selesai</option><option>Ditolak</option></select></div>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function AsetJKPAK() {
  const SEED=[{id:1,nama:"Komputer Riba",bil:5,jenama:"Dell",keadaan:"Baik",lokasi:"Bilik Guru"},{id:2,nama:"Projektor LCD",bil:3,jenama:"Epson",keadaan:"Baik",lokasi:"Bilik Darjah"},{id:3,nama:"Mesin Fotostat",bil:1,jenama:"Ricoh",keadaan:"Rosak",lokasi:"Bilik Am"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={nama:"",bil:1,jenama:"",keadaan:"Baik",lokasi:""};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  const kColor={Baik:"b-green",Rosak:"b-red","Perlu Selenggara":"b-yellow"};
  return (
    <KurPage title="Aset (JKPAK)" sub="Pentadbiran Am · SK Darau"
      stats={[{ico:"📦",val:data.length,lbl:"Jenis Aset"},{ico:"✅",val:data.filter(d=>d.keadaan==="Baik").length,lbl:"Keadaan Baik"},{ico:"🔧",val:data.filter(d=>d.keadaan==="Rosak").length,lbl:"Rosak"},{ico:"🔢",val:data.reduce((s,d)=>s+Number(d.bil),0),lbl:"Jumlah Unit"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Aset</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Nama Aset</th><th>Bil</th><th>Jenama</th><th>Keadaan</th><th>Lokasi</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.nama}</td><td>{p.bil}</td><td>{p.jenama}</td>
            <td><span className={`badge ${kColor[p.keadaan]||"b-gray"}`}>{p.keadaan}</span></td>
            <td style={{color:"var(--text2)"}}>{p.lokasi}</td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Aset" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Aset</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Jenama</label><input className="form-input" value={form.jenama} onChange={e=>setForm(f=>({...f,jenama:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Bilangan</label><input className="form-input" type="number" min="1" value={form.bil} onChange={e=>setForm(f=>({...f,bil:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Keadaan</label><select className="form-input" value={form.keadaan} onChange={e=>setForm(f=>({...f,keadaan:e.target.value}))}><option>Baik</option><option>Perlu Selenggara</option><option>Rosak</option></select></div>
        </div>
        <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" required value={form.lokasi} onChange={e=>setForm(f=>({...f,lokasi:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Aset</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Jenama</label><input className="form-input" value={editItem.jenama} onChange={e=>setEditItem(f=>({...f,jenama:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Bilangan</label><input className="form-input" type="number" min="1" value={editItem.bil} onChange={e=>setEditItem(f=>({...f,bil:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Keadaan</label><select className="form-input" value={editItem.keadaan} onChange={e=>setEditItem(f=>({...f,keadaan:e.target.value}))}><option>Baik</option><option>Perlu Selenggara</option><option>Rosak</option></select></div>
        </div>
        <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" required value={editItem.lokasi} onChange={e=>setEditItem(f=>({...f,lokasi:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function StafGuruPentadbiran() {
  const SEED=[{id:1,nama:"Pn. Halimah Bt Mohd",jawatan:"Guru Besar",gred:"DG52",noTel:"013-4567890",status:"Tetap"},{id:2,nama:"En. Azman Bin Yusof",jawatan:"Penolong Kanan 1",gred:"DG48",noTel:"012-3456789",status:"Tetap"},{id:3,nama:"Pn. Siti Bt Kamal",jawatan:"Guru Biasa",gred:"DG41",noTel:"011-9876543",status:"Tetap"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={nama:"",jawatan:"",gred:"DG41",noTel:"",status:"Tetap"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  return (
    <KurPage title="Staf & Guru" sub="Pentadbiran Am · SK Darau"
      stats={[{ico:"👩‍🏫",val:data.length,lbl:"Jumlah Staf"},{ico:"✅",val:data.filter(d=>d.status==="Tetap").length,lbl:"Tetap"},{ico:"📋",val:[...new Set(data.map(d=>d.jawatan))].length,lbl:"Jawatan Berbeza"},{ico:"🎖️",val:[...new Set(data.map(d=>d.gred))].length,lbl:"Gred"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Staf</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Nama</th><th>Jawatan</th><th>Gred</th><th>No. Tel</th><th>Status</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.nama}</td><td>{p.jawatan}</td>
            <td><span className="badge b-blue">{p.gred}</span></td>
            <td style={{color:"var(--text2)"}}>{p.noTel}</td>
            <td><span className={`badge ${p.status==="Tetap"?"b-green":"b-yellow"}`}>{p.status}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Staf/Guru" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Nama Penuh</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jawatan</label><input className="form-input" required value={form.jawatan} onChange={e=>setForm(f=>({...f,jawatan:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Gred</label><input className="form-input" value={form.gred} onChange={e=>setForm(f=>({...f,gred:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">No. Telefon</label><input className="form-input" value={form.noTel} onChange={e=>setForm(f=>({...f,noTel:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Tetap</option><option>Kontrak</option><option>Sementara</option></select></div>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Nama Penuh</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jawatan</label><input className="form-input" required value={editItem.jawatan} onChange={e=>setEditItem(f=>({...f,jawatan:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Gred</label><input className="form-input" value={editItem.gred} onChange={e=>setEditItem(f=>({...f,gred:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">No. Telefon</label><input className="form-input" value={editItem.noTel} onChange={e=>setEditItem(f=>({...f,noTel:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Tetap</option><option>Kontrak</option><option>Sementara</option></select></div>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function SuratPekeliling() {
  const SEED=[{id:1,tajuk:"Pekeliling Kewangan Bil. 2/2025",noRuj:"KP(PP)0200/JLD.2(2)",tarikh:"10 Jan 2025",jenis:"Pekeliling",status:"Aktif"},{id:2,tajuk:"Surat Arahan Hari Guru 2025",noRuj:"SK/Pentadbiran/02/2025",tarikh:"3 Mac 2025",jenis:"Surat",status:"Aktif"},{id:3,tajuk:"Pekeliling KAFA Semakan Semula",noRuj:"KP(BPKhas)603/7/4",tarikh:"15 Feb 2025",jenis:"Pekeliling",status:"Semak"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={tajuk:"",noRuj:"",tarikh:"",jenis:"Surat",status:"Aktif"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  const stC={Aktif:"b-green",Semak:"b-yellow",Luput:"b-red"};
  return (
    <KurPage title="Surat & Pekeliling" sub="Pentadbiran Am · SK Darau"
      stats={[{ico:"📄",val:data.length,lbl:"Dokumen"},{ico:"📋",val:data.filter(d=>d.jenis==="Pekeliling").length,lbl:"Pekeliling"},{ico:"✉️",val:data.filter(d=>d.jenis==="Surat").length,lbl:"Surat"},{ico:"✅",val:data.filter(d=>d.status==="Aktif").length,lbl:"Aktif"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Dokumen</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Tajuk</th><th>No. Rujukan</th><th>Tarikh</th><th>Jenis</th><th>Status</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.tajuk}</td>
            <td style={{color:"var(--text2)",fontSize:11}}>{p.noRuj}</td>
            <td style={{color:"var(--text2)"}}>{p.tarikh}</td>
            <td><span className={`badge ${p.jenis==="Pekeliling"?"b-blue":"b-green"}`}>{p.jenis}</span></td>
            <td><span className={`badge ${stC[p.status]||"b-gray"}`}>{p.status}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Surat/Pekeliling" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Tajuk</label><input className="form-input" required value={form.tajuk} onChange={e=>setForm(f=>({...f,tajuk:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">No. Rujukan</label><input className="form-input" value={form.noRuj} onChange={e=>setForm(f=>({...f,noRuj:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jenis</label><select className="form-input" value={form.jenis} onChange={e=>setForm(f=>({...f,jenis:e.target.value}))}><option>Surat</option><option>Pekeliling</option><option>Arahan</option></select></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Semak</option><option>Luput</option></select></div>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.tajuk}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Tajuk</label><input className="form-input" required value={editItem.tajuk} onChange={e=>setEditItem(f=>({...f,tajuk:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">No. Rujukan</label><input className="form-input" value={editItem.noRuj} onChange={e=>setEditItem(f=>({...f,noRuj:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jenis</label><select className="form-input" value={editItem.jenis} onChange={e=>setEditItem(f=>({...f,jenis:e.target.value}))}><option>Surat</option><option>Pekeliling</option><option>Arahan</option></select></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Semak</option><option>Luput</option></select></div>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function MesyuaratMinit() {
  const SEED=[{id:1,tajuk:"Mesyuarat Guru Bil. 1/2025",tarikh:"10 Jan 2025",masa:"2:00 petang",tempat:"Bilik Mesyuarat",status:"Selesai"},{id:2,tajuk:"Mesyuarat PIBG Bil. 1/2025",tarikh:"25 Feb 2025",masa:"8:00 pagi",tempat:"Dewan Sekolah",status:"Selesai"},{id:3,tajuk:"Mesyuarat Guru Bil. 2/2025",tarikh:"20 Mei 2025",masa:"2:00 petang",tempat:"Bilik Mesyuarat",status:"Akan Datang"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={tajuk:"",tarikh:"",masa:"",tempat:"",status:"Akan Datang"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  const stC={Selesai:"b-green","Akan Datang":"b-yellow",Semasa:"b-blue"};
  return (
    <KurPage title="Mesyuarat & Minit" sub="Pentadbiran Am · SK Darau"
      stats={[{ico:"📋",val:data.length,lbl:"Mesyuarat"},{ico:"✅",val:data.filter(d=>d.status==="Selesai").length,lbl:"Selesai"},{ico:"⏳",val:data.filter(d=>d.status==="Akan Datang").length,lbl:"Akan Datang"},{ico:"📍",val:[...new Set(data.map(d=>d.tempat))].length,lbl:"Lokasi"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Mesyuarat</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Tajuk Mesyuarat</th><th>Tarikh</th><th>Masa</th><th>Tempat</th><th>Status</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.tajuk}</td>
            <td style={{color:"var(--text2)"}}>{p.tarikh}</td><td>{p.masa}</td><td>{p.tempat}</td>
            <td><span className={`badge ${stC[p.status]||"b-gray"}`}>{p.status}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Mesyuarat" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Tajuk Mesyuarat</label><input className="form-input" required value={form.tajuk} onChange={e=>setForm(f=>({...f,tajuk:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={form.masa} onChange={e=>setForm(f=>({...f,masa:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tempat</label><input className="form-input" value={form.tempat} onChange={e=>setForm(f=>({...f,tempat:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select></div>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.tajuk}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Tajuk Mesyuarat</label><input className="form-input" required value={editItem.tajuk} onChange={e=>setEditItem(f=>({...f,tajuk:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={editItem.masa} onChange={e=>setEditItem(f=>({...f,masa:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tempat</label><input className="form-input" value={editItem.tempat} onChange={e=>setEditItem(f=>({...f,tempat:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select></div>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

// ─── PENTADBIRAN ROUTER ───────────────────────────────────────────────────────
function PentadbiranPage({ subId, onNav }) {
  const m = MODULES.find(x=>x.id==="pentadbiran");
  const idx = m?.ids.indexOf(subId)??-1;
  const sName = idx>=0 ? m.subs[idx] : "";
  const views = {
    kewangan:  <KewanganPCG />,
    aset:      <AsetJKPAK />,
    staf:      <StafGuruPentadbiran />,
    surat:     <SuratPekeliling />,
    mesyuarat: <MesyuaratMinit />,
  };
  return (
    <div>
      <div className="pg-top" style={{marginBottom:14}}>
        <div className="pg-chip" style={{color:"#2563eb",borderColor:"#bfdbfe"}} onClick={()=>onNav(null,null)}>🏠 Papan Pemuka</div>
        <span className="pg-sep">›</span>
        <div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`}}>{m.icon} {m.label}</div>
        {sName&&<><span className="pg-sep">›</span><div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`,background:m.light}}>{sName}</div></>}
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
        {m.subs.map((s,i)=>(
          <button key={m.ids[i]} onClick={()=>onNav("pentadbiran",m.ids[i])} style={{padding:"7px 14px",borderRadius:12,border:`1.5px solid ${subId===m.ids[i]?m.color:"var(--border)"}`,background:subId===m.ids[i]?m.color:"var(--surface)",color:subId===m.ids[i]?"white":"var(--text2)",fontSize:12,fontWeight:800,fontFamily:"'Nunito',sans-serif",cursor:"pointer",transition:"all 0.15s"}}>
            {s}
          </button>
        ))}
      </div>
      {views[subId] || <div style={{color:"var(--text2)",padding:40,textAlign:"center"}}>Pilih sub-modul</div>}
    </div>
  );
}

// ─── ICT — SUB-PAGES ─────────────────────────────────────────────────────────
function InventoriICT() {
  const SEED=[{id:1,nama:"Komputer Desktop",bil:12,jenama:"Acer",keadaan:"Baik",lokasi:"Makmal ICT"},{id:2,nama:"Projektor",bil:4,jenama:"Epson",keadaan:"Baik",lokasi:"Bilik Darjah"},{id:3,nama:"Tablet",bil:30,jenama:"Samsung",keadaan:"Perlu Selenggara",lokasi:"Makmal ICT"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={nama:"",bil:1,jenama:"",keadaan:"Baik",lokasi:""};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  const kColor={Baik:"b-green",Rosak:"b-red","Perlu Selenggara":"b-yellow"};
  return (
    <KurPage title="Inventori ICT" sub="ICT / Makmal · SK Darau"
      stats={[{ico:"💻",val:data.length,lbl:"Jenis Peralatan"},{ico:"✅",val:data.filter(d=>d.keadaan==="Baik").length,lbl:"Keadaan Baik"},{ico:"🔧",val:data.filter(d=>d.keadaan!=="Baik").length,lbl:"Perlu Perhatian"},{ico:"🔢",val:data.reduce((s,d)=>s+Number(d.bil),0),lbl:"Jumlah Unit"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Peralatan</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Nama Peralatan</th><th>Bil</th><th>Jenama</th><th>Keadaan</th><th>Lokasi</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.nama}</td><td>{p.bil}</td><td>{p.jenama}</td>
            <td><span className={`badge ${kColor[p.keadaan]||"b-gray"}`}>{p.keadaan}</span></td>
            <td style={{color:"var(--text2)"}}>{p.lokasi}</td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Peralatan ICT" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Peralatan</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Jenama</label><input className="form-input" value={form.jenama} onChange={e=>setForm(f=>({...f,jenama:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Bilangan</label><input className="form-input" type="number" min="1" value={form.bil} onChange={e=>setForm(f=>({...f,bil:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Keadaan</label><select className="form-input" value={form.keadaan} onChange={e=>setForm(f=>({...f,keadaan:e.target.value}))}><option>Baik</option><option>Perlu Selenggara</option><option>Rosak</option></select></div>
        </div>
        <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" required value={form.lokasi} onChange={e=>setForm(f=>({...f,lokasi:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Peralatan</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Jenama</label><input className="form-input" value={editItem.jenama} onChange={e=>setEditItem(f=>({...f,jenama:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Bilangan</label><input className="form-input" type="number" min="1" value={editItem.bil} onChange={e=>setEditItem(f=>({...f,bil:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Keadaan</label><select className="form-input" value={editItem.keadaan} onChange={e=>setEditItem(f=>({...f,keadaan:e.target.value}))}><option>Baik</option><option>Perlu Selenggara</option><option>Rosak</option></select></div>
        </div>
        <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" required value={editItem.lokasi} onChange={e=>setEditItem(f=>({...f,lokasi:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function PenjadualanMakmal() {
  return (
    <KurPage title="Penjadualan Makmal" sub="ICT / Makmal · SK Darau"
      stats={[{ico:"💻",val:1,lbl:"Makmal Aktif"},{ico:"✅",val:"Aktif",lbl:"Status"},{ico:"🌐",val:"Vercel",lbl:"Platform"},{ico:"🔒",val:"HTTPS",lbl:"Protokol"}]}>
      <EmbedFrame url={ICT_APP_URL} title="Dashboard ICT Sekolah" />
    </KurPage>
  );
}

const ICT_APP_URL = "https://dashboard-ict-sekolah.vercel.app/";

function EmbedFrame({ url, title }) {
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  return (
    <div style={{marginTop:16}}>
      <div style={{
        display:"flex",alignItems:"center",gap:10,marginBottom:10,
        padding:"10px 16px",borderRadius:12,
        background:"var(--surface)",border:"1.5px solid var(--border)",
      }}>
        <span style={{fontSize:18}}>🌐</span>
        <span style={{flex:1,fontSize:12,color:"var(--text2)",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{url}</span>
        <a href={url} target="_blank" rel="noopener noreferrer"
          style={{padding:"6px 14px",borderRadius:8,background:"#2563eb",color:"white",fontSize:12,fontWeight:800,textDecoration:"none",whiteSpace:"nowrap"}}>
          ↗ Tab Baru
        </a>
      </div>
      {errored ? (
        <div style={{textAlign:"center",padding:"60px 20px",background:"var(--surface)",borderRadius:16,border:"1.5px solid var(--border)"}}>
          <div style={{fontSize:40,marginBottom:12}}>🚫</div>
          <div style={{fontWeight:800,fontSize:15,color:"var(--text1)",marginBottom:8}}>Tidak Dapat Dipaparkan</div>
          <div style={{color:"var(--text2)",fontSize:13,marginBottom:20,maxWidth:400,margin:"0 auto 20px"}}>
            Web app ini menyekat iframe. Tambah header berikut dalam <code>vercel.json</code> web app ICT:
          </div>
          <pre style={{textAlign:"left",background:"#1e293b",color:"#e2e8f0",borderRadius:10,padding:16,fontSize:12,maxWidth:480,margin:"0 auto 20px",overflow:"auto"}}>{`{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "ALLOWALL" }
      ]
    }
  ]
}`}</pre>
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{display:"inline-block",padding:"10px 24px",borderRadius:10,background:"#2563eb",color:"white",fontSize:13,fontWeight:800,textDecoration:"none"}}>
            ↗ Buka Dalam Tab Baru
          </a>
        </div>
      ) : (
        <div style={{position:"relative",borderRadius:16,overflow:"hidden",border:"1.5px solid var(--border)",background:"var(--surface)"}}>
          {loading&&(
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"var(--surface)",zIndex:1,gap:12}}>
              <div style={{fontSize:32}}>⏳</div>
              <div style={{fontWeight:700,color:"var(--text2)"}}>Memuatkan {title}…</div>
            </div>
          )}
          <iframe
            src={url}
            title={title}
            style={{width:"100%",height:"calc(100vh - 320px)",minHeight:500,border:"none",display:"block"}}
            onLoad={()=>setLoading(false)}
            onError={()=>{setLoading(false);setErrored(true);}}
          />
        </div>
      )}
    </div>
  );
}

function SistemAplikasi() {
  return (
    <KurPage title="Sistem & Aplikasi ICT" sub="ICT / Makmal · SK Darau"
      stats={[{ico:"💻",val:1,lbl:"Sistem Aktif"},{ico:"✅",val:"Aktif",lbl:"Status"},{ico:"🌐",val:"Vercel",lbl:"Platform"},{ico:"🔒",val:"HTTPS",lbl:"Protokol"}]}>
      <EmbedFrame url={ICT_APP_URL} title="Dashboard ICT Sekolah" />
    </KurPage>
  );
}

function LaporanKerosakanICT() {
  const SEED=[{id:1,alat:"Komputer Desktop No. 5",masalah:"Tidak boleh boot",tarikh:"12 Apr 2025",status:"Dalam Baiki"},{id:2,alat:"Projektor Bilik Darjah 3",masalah:"Imej kabur",tarikh:"20 Apr 2025",status:"Selesai"},{id:3,alat:"Tablet No. 12",masalah:"Skrin pecah",tarikh:"2 Mei 2025",status:"Tertunggak"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={alat:"",masalah:"",tarikh:"",status:"Tertunggak"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Laporan dihantar!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  const stC={Selesai:"b-green","Dalam Baiki":"b-yellow",Tertunggak:"b-red"};
  return (
    <KurPage title="Laporan Kerosakan" sub="ICT / Makmal · SK Darau"
      stats={[{ico:"⚠️",val:data.length,lbl:"Laporan"},{ico:"🔧",val:data.filter(d=>d.status==="Dalam Baiki").length,lbl:"Dalam Baiki"},{ico:"✅",val:data.filter(d=>d.status==="Selesai").length,lbl:"Selesai"},{ico:"🔴",val:data.filter(d=>d.status==="Tertunggak").length,lbl:"Tertunggak"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Lapor Kerosakan</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Alatan</th><th>Masalah</th><th>Tarikh Lapor</th><th>Status</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.alat}</td>
            <td style={{color:"var(--text2)"}}>{p.masalah}</td>
            <td style={{color:"var(--text2)"}}>{p.tarikh}</td>
            <td><span className={`badge ${stC[p.status]||"b-gray"}`}>{p.status}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Lapor Kerosakan" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Nama Alatan</label><input className="form-input" required value={form.alat} onChange={e=>setForm(f=>({...f,alat:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Masalah</label><input className="form-input" required value={form.masalah} onChange={e=>setForm(f=>({...f,masalah:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Tertunggak</option><option>Dalam Baiki</option><option>Selesai</option></select></div>
        </div>
        <button className="btn-primary" type="submit">+ Hantar Laporan</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.alat}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Nama Alatan</label><input className="form-input" required value={editItem.alat} onChange={e=>setEditItem(f=>({...f,alat:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Masalah</label><input className="form-input" required value={editItem.masalah} onChange={e=>setEditItem(f=>({...f,masalah:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Tertunggak</option><option>Dalam Baiki</option><option>Selesai</option></select></div>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

// ─── ICT ROUTER ───────────────────────────────────────────────────────────────
function ICTPage({ subId, onNav }) {
  const m = MODULES.find(x=>x.id==="ict");
  const idx = m?.ids.indexOf(subId)??-1;
  const sName = idx>=0 ? m.subs[idx] : "";
  const views = {
    inventori: <InventoriICT />,
    makmal:    <PenjadualanMakmal />,
    sistem:    <SistemAplikasi />,
    kerosakan: <LaporanKerosakanICT />,
  };
  return (
    <div>
      <div className="pg-top" style={{marginBottom:14}}>
        <div className="pg-chip" style={{color:"#2563eb",borderColor:"#bfdbfe"}} onClick={()=>onNav(null,null)}>🏠 Papan Pemuka</div>
        <span className="pg-sep">›</span>
        <div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`}}>{m.icon} {m.label}</div>
        {sName&&<><span className="pg-sep">›</span><div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`,background:m.light}}>{sName}</div></>}
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
        {m.subs.map((s,i)=>(
          <button key={m.ids[i]} onClick={()=>onNav("ict",m.ids[i])} style={{padding:"7px 14px",borderRadius:12,border:`1.5px solid ${subId===m.ids[i]?m.color:"var(--border)"}`,background:subId===m.ids[i]?m.color:"var(--surface)",color:subId===m.ids[i]?"white":"var(--text2)",fontSize:12,fontWeight:800,fontFamily:"'Nunito',sans-serif",cursor:"pointer",transition:"all 0.15s"}}>
            {s}
          </button>
        ))}
      </div>
      {views[subId] || <div style={{color:"var(--text2)",padding:40,textAlign:"center"}}>Pilih sub-modul</div>}
    </div>
  );
}

// ─── PRASEKOLAH — SUB-PAGES ──────────────────────────────────────────────────
function DataMuridPra() {
  const SEED=[{id:1,nama:"Aina Sofea Bt Azman",umur:6,jantina:"Perempuan",wali:"Pn. Azlina Bt Mahmud",noWali:"013-7654321"},{id:2,nama:"Muhammad Irfan Bin Hafiz",umur:5,jantina:"Lelaki",wali:"En. Mohd Hafiz Bin Salleh",noWali:"012-8765432"},{id:3,nama:"Chloe Lim Jia Yi",umur:6,jantina:"Perempuan",wali:"Pn. Tan Mei Ling",noWali:"011-5678901"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={nama:"",umur:5,jantina:"Lelaki",wali:"",noWali:""};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  return (
    <KurPage title="Data Murid Prasekolah" sub="Prasekolah · SK Darau"
      stats={[{ico:"👶",val:data.length,lbl:"Jumlah Murid"},{ico:"👦",val:data.filter(d=>d.jantina==="Lelaki").length,lbl:"Lelaki"},{ico:"👧",val:data.filter(d=>d.jantina==="Perempuan").length,lbl:"Perempuan"},{ico:"🎂",val:Math.round(data.reduce((s,d)=>s+Number(d.umur),0)/(data.length||1)*10)/10,lbl:"Purata Umur"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Murid</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Nama</th><th>Umur</th><th>Jantina</th><th>Wali</th><th>No. Tel Wali</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.nama}</td><td>{p.umur} tahun</td>
            <td><span className={`badge ${p.jantina==="Lelaki"?"b-blue":"b-green"}`}>{p.jantina}</span></td>
            <td>{p.wali}</td><td style={{color:"var(--text2)"}}>{p.noWali}</td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Murid Prasekolah" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Nama Penuh</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Umur</label><input className="form-input" type="number" min="4" max="7" value={form.umur} onChange={e=>setForm(f=>({...f,umur:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Jantina</label><select className="form-input" value={form.jantina} onChange={e=>setForm(f=>({...f,jantina:e.target.value}))}><option>Lelaki</option><option>Perempuan</option></select></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Wali</label><input className="form-input" required value={form.wali} onChange={e=>setForm(f=>({...f,wali:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">No. Tel Wali</label><input className="form-input" value={form.noWali} onChange={e=>setForm(f=>({...f,noWali:e.target.value}))}/></div>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Nama Penuh</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Umur</label><input className="form-input" type="number" min="4" max="7" value={editItem.umur} onChange={e=>setEditItem(f=>({...f,umur:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Jantina</label><select className="form-input" value={editItem.jantina} onChange={e=>setEditItem(f=>({...f,jantina:e.target.value}))}><option>Lelaki</option><option>Perempuan</option></select></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Nama Wali</label><input className="form-input" required value={editItem.wali} onChange={e=>setEditItem(f=>({...f,wali:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">No. Tel Wali</label><input className="form-input" value={editItem.noWali} onChange={e=>setEditItem(f=>({...f,noWali:e.target.value}))}/></div>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function JadualAktivitiPra() {
  const SEED=[{id:1,aktiviti:"Senaman Pagi",hari:"Isnin – Jumaat",masa:"7:30–7:50 pagi",guru:"Cikgu Aminah Bt Rahmat",status:"Tetap"},{id:2,aktiviti:"Mewarna & Seni",hari:"Selasa",masa:"9:00–9:30 pagi",guru:"Cikgu Priya A/P Rajan",status:"Tetap"},{id:3,aktiviti:"Bercerita",hari:"Khamis",masa:"10:30–11:00 pagi",guru:"Cikgu Aminah Bt Rahmat",status:"Tetap"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={aktiviti:"",hari:"Isnin",masa:"",guru:"",status:"Tetap"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  return (
    <KurPage title="Jadual & Aktiviti" sub="Prasekolah · SK Darau"
      stats={[{ico:"📅",val:data.length,lbl:"Aktiviti"},{ico:"✅",val:data.filter(d=>d.status==="Tetap").length,lbl:"Tetap"},{ico:"👩‍🏫",val:[...new Set(data.map(d=>d.guru))].length,lbl:"Guru"},{ico:"📍",val:[...new Set(data.map(d=>d.hari))].length,lbl:"Hari"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Aktiviti</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Aktiviti</th><th>Hari</th><th>Masa</th><th>Guru</th><th>Status</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.aktiviti}</td>
            <td><span className="badge b-blue">{p.hari}</span></td>
            <td>{p.masa}</td><td>{p.guru}</td>
            <td><span className={`badge ${p.status==="Tetap"?"b-green":"b-yellow"}`}>{p.status}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Aktiviti" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Nama Aktiviti</label><input className="form-input" required value={form.aktiviti} onChange={e=>setForm(f=>({...f,aktiviti:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Hari</label><input className="form-input" value={form.hari} onChange={e=>setForm(f=>({...f,hari:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={form.masa} onChange={e=>setForm(f=>({...f,masa:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Guru</label><input className="form-input" required value={form.guru} onChange={e=>setForm(f=>({...f,guru:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Tetap</option><option>Sementara</option></select></div>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.aktiviti}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Nama Aktiviti</label><input className="form-input" required value={editItem.aktiviti} onChange={e=>setEditItem(f=>({...f,aktiviti:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Hari</label><input className="form-input" value={editItem.hari} onChange={e=>setEditItem(f=>({...f,hari:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={editItem.masa} onChange={e=>setEditItem(f=>({...f,masa:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Guru</label><input className="form-input" required value={editItem.guru} onChange={e=>setEditItem(f=>({...f,guru:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Tetap</option><option>Sementara</option></select></div>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function PenilaianMuridPra() {
  const SEED=[{id:1,nama:"Aina Sofea",domain:"Bahasa & Komunikasi",skor:85,tahap:"Cemerlang",catatan:"Fasih bertutur"},{id:2,nama:"Muhammad Irfan",domain:"Perkembangan Kognitif",skor:78,tahap:"Baik",catatan:"Boleh mengira 1-20"},{id:3,nama:"Chloe Lim",domain:"Perkembangan Fizikal",skor:92,tahap:"Cemerlang",catatan:"Aktif dan koordinasi baik"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={nama:"",domain:"Bahasa & Komunikasi",skor:70,tahap:"Baik",catatan:""};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  const DOMAINS=["Bahasa & Komunikasi","Perkembangan Kognitif","Perkembangan Fizikal","Perkembangan Sosial","Kreativiti & Estetika","Kerohanian & Moral"];
  const tColor={Cemerlang:"b-green",Baik:"b-blue",Memuaskan:"b-yellow","Perlu Bimbingan":"b-red"};
  return (
    <KurPage title="Penilaian Murid" sub="Prasekolah · SK Darau"
      stats={[{ico:"📊",val:data.length,lbl:"Rekod Penilaian"},{ico:"⭐",val:data.filter(d=>d.tahap==="Cemerlang").length,lbl:"Cemerlang"},{ico:"📈",val:data.length?Math.round(data.reduce((s,d)=>s+Number(d.skor),0)/data.length):0,lbl:"Purata Skor"},{ico:"📚",val:[...new Set(data.map(d=>d.domain))].length,lbl:"Domain"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Penilaian</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Nama Murid</th><th>Domain</th><th>Skor</th><th>Tahap</th><th>Catatan</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.nama}</td>
            <td style={{fontSize:11}}>{p.domain}</td>
            <td style={{fontWeight:700}}>{p.skor}</td>
            <td><span className={`badge ${tColor[p.tahap]||"b-gray"}`}>{p.tahap}</span></td>
            <td style={{color:"var(--text2)",fontSize:12}}>{p.catatan}</td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Penilaian" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Domain</label><select className="form-input" value={form.domain} onChange={e=>setForm(f=>({...f,domain:e.target.value}))}>{DOMAINS.map(d=><option key={d}>{d}</option>)}</select></div>
          <div className="form-field"><label className="form-label">Skor</label><input className="form-input" type="number" min="0" max="100" value={form.skor} onChange={e=>setForm(f=>({...f,skor:+e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tahap</label><select className="form-input" value={form.tahap} onChange={e=>setForm(f=>({...f,tahap:e.target.value}))}><option>Cemerlang</option><option>Baik</option><option>Memuaskan</option><option>Perlu Bimbingan</option></select></div>
          <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={form.catatan} onChange={e=>setForm(f=>({...f,catatan:e.target.value}))}/></div>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Domain</label><select className="form-input" value={editItem.domain} onChange={e=>setEditItem(f=>({...f,domain:e.target.value}))}>{DOMAINS.map(d=><option key={d}>{d}</option>)}</select></div>
          <div className="form-field"><label className="form-label">Skor</label><input className="form-input" type="number" min="0" max="100" value={editItem.skor} onChange={e=>setEditItem(f=>({...f,skor:+e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tahap</label><select className="form-input" value={editItem.tahap} onChange={e=>setEditItem(f=>({...f,tahap:e.target.value}))}><option>Cemerlang</option><option>Baik</option><option>Memuaskan</option><option>Perlu Bimbingan</option></select></div>
          <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={editItem.catatan} onChange={e=>setEditItem(f=>({...f,catatan:e.target.value}))}/></div>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

function LaporanPra() {
  const SEED=[{id:1,tajuk:"Laporan Perkembangan Murid Semester 1",tarikh:"30 Mac 2025",jenis:"Semester",status:"Selesai"},{id:2,tajuk:"Laporan Akhir Tahun Prasekolah 2024",tarikh:"15 Nov 2024",jenis:"Tahunan",status:"Selesai"},{id:3,tajuk:"Laporan Aktiviti Hari Kanak-Kanak 2025",tarikh:"15 Okt 2025",jenis:"Aktiviti",status:"Akan Datang"}];
  const [data,setData]=useState(SEED);const [showAdd,setShowAdd]=useState(false);const [editItem,setEditItem]=useState(null);const [nid,setNid]=useState(4);
  const BLANK={tajuk:"",tarikh:"",jenis:"Semester",status:"Akan Datang"};const [form,setForm]=useState(BLANK);
  const handleAdd=e=>{e.preventDefault();setData(d=>[...d,{...form,id:nid}]);setNid(n=>n+1);setForm(BLANK);setShowAdd(false);toast("Ditambah!","success");};
  const handleEdit=e=>{e.preventDefault();setData(d=>d.map(r=>r.id===editItem.id?editItem:r));setEditItem(null);toast("Dikemaskini!","success");};
  const handleDel=id=>{setData(d=>d.filter(r=>r.id!==id));toast("Dipadam!","success");};
  const stC={Selesai:"b-green","Akan Datang":"b-yellow",Semasa:"b-blue"};
  return (
    <KurPage title="Laporan" sub="Prasekolah · SK Darau"
      stats={[{ico:"📄",val:data.length,lbl:"Laporan"},{ico:"✅",val:data.filter(d=>d.status==="Selesai").length,lbl:"Selesai"},{ico:"⏳",val:data.filter(d=>d.status==="Akan Datang").length,lbl:"Akan Datang"},{ico:"📋",val:[...new Set(data.map(d=>d.jenis))].length,lbl:"Jenis"}]}>
      <div className="kur-header"><button className="btn-add" onClick={()=>{setForm(BLANK);setShowAdd(true)}}>+ Tambah Laporan</button></div>
      <div className="kur-table-wrap"><table className="kur-table">
        <thead><tr><th>#</th><th>Tajuk Laporan</th><th>Tarikh</th><th>Jenis</th><th>Status</th><th></th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={p.id}>
            <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
            <td style={{fontWeight:800}}>{p.tajuk}</td>
            <td style={{color:"var(--text2)"}}>{p.tarikh}</td>
            <td><span className={`badge ${p.jenis==="Tahunan"?"b-blue":p.jenis==="Semester"?"b-green":"b-yellow"}`}>{p.jenis}</span></td>
            <td><span className={`badge ${stC[p.status]||"b-gray"}`}>{p.status}</span></td>
            <td style={{display:"flex",gap:4}}>
              <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {showAdd&&<Modal title="Tambah Laporan" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
        <div className="form-field"><label className="form-label">Tajuk Laporan</label><input className="form-input" required value={form.tajuk} onChange={e=>setForm(f=>({...f,tajuk:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Jenis</label><select className="form-input" value={form.jenis} onChange={e=>setForm(f=>({...f,jenis:e.target.value}))}><option>Semester</option><option>Tahunan</option><option>Aktiviti</option><option>Bulanan</option></select></div>
        </div>
        <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select></div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editItem&&<Modal title={`Edit — ${editItem.tajuk}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
        <div className="form-field"><label className="form-label">Tajuk Laporan</label><input className="form-input" required value={editItem.tajuk} onChange={e=>setEditItem(f=>({...f,tajuk:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Jenis</label><select className="form-input" value={editItem.jenis} onChange={e=>setEditItem(f=>({...f,jenis:e.target.value}))}><option>Semester</option><option>Tahunan</option><option>Aktiviti</option><option>Bulanan</option></select></div>
        </div>
        <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select></div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

// ─── PRASEKOLAH ROUTER ────────────────────────────────────────────────────────
function PrasekolahPage({ subId, onNav }) {
  const m = MODULES.find(x=>x.id==="prasekolah");
  const idx = m?.ids.indexOf(subId)??-1;
  const sName = idx>=0 ? m.subs[idx] : "";
  const views = {
    "murid-pra":    <DataMuridPra />,
    "aktiviti-pra": <JadualAktivitiPra />,
    "penilaian-pra":<PenilaianMuridPra />,
    "laporan-pra":  <LaporanPra />,
  };
  return (
    <div>
      <div className="pg-top" style={{marginBottom:14}}>
        <div className="pg-chip" style={{color:"#2563eb",borderColor:"#bfdbfe"}} onClick={()=>onNav(null,null)}>🏠 Papan Pemuka</div>
        <span className="pg-sep">›</span>
        <div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`}}>{m.icon} {m.label}</div>
        {sName&&<><span className="pg-sep">›</span><div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`,background:m.light}}>{sName}</div></>}
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
        {m.subs.map((s,i)=>(
          <button key={m.ids[i]} onClick={()=>onNav("prasekolah",m.ids[i])} style={{padding:"7px 14px",borderRadius:12,border:`1.5px solid ${subId===m.ids[i]?m.color:"var(--border)"}`,background:subId===m.ids[i]?m.color:"var(--surface)",color:subId===m.ids[i]?"white":"var(--text2)",fontSize:12,fontWeight:800,fontFamily:"'Nunito',sans-serif",cursor:"pointer",transition:"all 0.15s"}}>
            {s}
          </button>
        ))}
      </div>
      {views[subId] || <div style={{color:"var(--text2)",padding:40,textAlign:"center"}}>Pilih sub-modul</div>}
    </div>
  );
}

// ─── PAGE VIEW ────────────────────────────────────────────────────────────────
function Page({ modId, subId }) {
  const m = MODULES.find(x=>x.id===modId);
  const idx = m?.ids.indexOf(subId)??-1;
  const sName = idx>=0 ? m.subs[idx] : "";
  if(!m) return null;

  return (
    <div>
      <div className="pg-top">
        <div className="pg-chip" style={{color:"#2563eb",borderColor:"#bfdbfe"}}
          onClick={()=>{}}>🏠 Papan Pemuka</div>
        <span className="pg-sep">›</span>
        <div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`}}>{m.icon} {m.label}</div>
        {sName&&<><span className="pg-sep">›</span>
        <div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`,background:m.light}}>{sName}</div></>}
      </div>

      <div className="pg-title">{sName}</div>
      <div className="pg-sub">Modul {m.label} · SK Darau, Kota Kinabalu</div>

      <div className="pg-stats">
        {[["📁","—","Rekod"],["🕐","—","Kemaskini"],["📊","—","Laporan"]].map(([ico,val,lbl],i)=>(
          <div className="pgs" key={i}>
            <span className="pgs-ico">{ico}</span>
            <div className="pgs-val">{val}</div>
            <div className="pgs-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      <div className="placeholder">
        <div className="ph-float" style={{width:200,height:200,background:m.color,top:-50,right:-50}}/>
        <div className="ph-float" style={{width:140,height:140,background:m.color,bottom:-40,left:-40}}/>
        <div className="ph-ico" style={{background:m.light}}>{m.icon}</div>
        <div className="ph-title">{sName}</div>
        <div className="ph-text">
          Modul ini akan disambungkan ke Supabase. Data <strong>{sName}</strong> bagi <strong>{m.label}</strong> akan dipaparkan di sini setelah pembangunan selesai.
        </div>
        <div className="ph-btn">🚧 &nbsp;Dalam Pembangunan</div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("edu-user"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [sbOpen, setSbOpen] = useState(false);
  const [exp, setExp] = useState("");
  const [actMod, setActMod] = useState(null);
  const [actSub, setActSub] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("edu-theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("edu-theme", theme);
  }, [theme]);

  const onNav = (mod, sub) => { setActMod(mod); setActSub(sub); if(mod) setExp(mod); };
  const m = MODULES.find(x=>x.id===actMod);
  const idx = m?.ids.indexOf(actSub)??-1;
  const sName = idx>=0 ? m.subs[idx] : "";
  const initials = user ? user.name.split(" ").map(w=>w[0]).join("").slice(0,2) : "";

  if (!user) return <Login onLogin={u=>{ localStorage.setItem("edu-user", JSON.stringify(u)); setUser(u); }}/>;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <Sidebar open={sbOpen} onClose={()=>setSbOpen(false)}
          exp={exp} setExp={setExp} actMod={actMod} actSub={actSub}
          onNav={onNav} user={user} onLogout={()=>{ localStorage.removeItem("edu-user"); setUser(null); }}/>

        <div className="main">
          <div className="topbar">
            <button className="tb-hamburger" onClick={()=>setSbOpen(true)}>☰</button>
            <div className="tb-bread">
              <span style={{cursor:"pointer",fontSize:16}} onClick={()=>onNav(null,null)}>🏠</span>
              {m&&<><span className="tb-sep">›</span><span>{m.icon} {m.label}</span></>}
              {sName&&<><span className="tb-sep">›</span><span className="cur">{sName}</span></>}
            </div>
            <div className="tb-right">
              <button className="tb-theme" onClick={()=>setTheme(t=>t==="light"?"dark":"light")}
                title="Tukar tema">
                {theme==="light" ? "🌙" : "☀️"}
              </button>
              <div className="tb-notif">🔔<div className="tb-dot"/></div>
              <div className="tb-user">
                <div className="tb-uav">{initials}</div>
                <div className="tb-uname">{user.name.split(" ")[0]}</div>
              </div>
            </div>
          </div>

          <div className="content">
            {!actMod
              ? <Overview onNav={onNav} user={user}/>
              : actMod==="kurikulum"
                ? <KurikulumPage subId={actSub} onNav={onNav}/>
                : actMod==="hem"
                  ? <HEMPage subId={actSub} onNav={onNav}/>
                  : actMod==="kokurikulum"
                    ? <KokurikulumPage subId={actSub} onNav={onNav}/>
                    : actMod==="pentadbiran"
                      ? <PentadbiranPage subId={actSub} onNav={onNav}/>
                      : actMod==="ict"
                        ? <ICTPage subId={actSub} onNav={onNav}/>
                        : actMod==="prasekolah"
                          ? <PrasekolahPage subId={actSub} onNav={onNav}/>
                          : <Page modId={actMod} subId={actSub}/>}
          </div>
        </div>
      </div>
      <Toast />
    </>
  );
}
