import { useState, useEffect } from "react";
import { supabase } from './lib/supabase.js';

// ─── DATA ────────────────────────────────────────────────────────────────────
const MODULES = [
  { id:"kurikulum", label:"Kurikulum", icon:"📚", color:"#2563eb", light:"#eff6ff", tag:"GPK 1",
    subs:["Jadual Waktu","Panitia Mata Pelajaran","Peperiksaan & Penilaian","eRPH / Rekod Mengajar","Program Akademik","Pusat Sumber / NILAM","Perkembangan Staf","Fail Drive"],
    ids:["jadual","panitia","peperiksaan","rph","program","pss","staf","drive"] },
  { id:"hem", label:"Hal Ehwal Murid", icon:"👫", color:"#0ea5e9", light:"#f0f9ff", tag:"GPK HEM",
    subs:["Pendaftaran & Data Murid","Disiplin","Bimbingan & Kaunseling","Kesihatan Murid","Bantuan Pelajaran","Keselamatan & 3K","Pengawas Sekolah","Koperasi","Fail Drive"],
    ids:["apdm","disiplin","kaunseling","kesihatan","bantuan","3k","pengawas","koperasi","drive"] },
  { id:"kokurikulum", label:"Kokurikulum", icon:"🏅", color:"#6366f1", light:"#eef2ff", tag:"GPK Koku",
    subs:["Kelab & Persatuan","Badan Beruniform","Sukan & Permainan","PAJSK","Profil Murid Koku","Pencapaian","Takwim Kokurikulum","Fail Drive"],
    ids:["kelab","uniform","sukan","pajsk","profil","pencapaian","takwim","drive"] },
  { id:"pentadbiran", label:"Pentadbiran Am", icon:"🏛️", color:"#0284c7", light:"#e0f2fe", tag:"Pentadbir",
    subs:["Kewangan (PCG)","Aset (JKPAK)","Staf & Guru","Surat & Pekeliling","Mesyuarat & Minit"],
    ids:["kewangan","aset","staf","surat","mesyuarat"] },
  { id:"ict", label:"ICT / Makmal", icon:"💻", color:"#1d4ed8", light:"#eff6ff", tag:"Guru ICT",
    subs:["Inventori ICT","Penjadualan Makmal","Sistem & Aplikasi","Laporan Kerosakan"],
    ids:["inventori","makmal","sistem","kerosakan"] },
  { id:"prasekolah", label:"Prasekolah", icon:"🌈", color:"#7c3aed", light:"#f5f3ff", tag:"Guru PRA",
    subs:["Data Murid Prasekolah","Jadual & Aktiviti","Penilaian Murid","Laporan"],
    ids:["murid-pra","aktiviti-pra","penilaian-pra","laporan-pra"] },
  { id:"opr", label:"OPR", icon:"📋", color:"#0891b2", light:"#ecfeff", tag:"GPK Koku",
    subs:["Rekod & Analisis OPR","Fail Drive (ePBD)"],
    ids:["opr-rekod","drive"] },
];

const TAG_OPTS = [
  { lbl:"Segera",     tc:"#ef4444", bg:"#fef2f2" },
  { lbl:"Peringatan", tc:"#f59e0b", bg:"#fffbeb" },
  { lbl:"Maklumat",   tc:"#6366f1", bg:"#f0f0ff" },
  { lbl:"Baharu",     tc:"#2563eb", bg:"#eff6ff" },
  { lbl:"Selesai",    tc:"#22c55e", bg:"#f0fdf4" },
];
const NOTIS_ICONS = ["📅","📋","📦","👦","📢","⚠️","✅","🏫","📌","🔔"];

const SASARAN_OPTS = [
  { lbl:"Semua",         ico:"🌐", tc:"#374151", bg:"#f3f4f6" },
  { lbl:"Guru",          ico:"👩‍🏫", tc:"#0077b6", bg:"#e8f4fd" },
  { lbl:"Warga Sekolah", ico:"🏫", tc:"#7c3aed", bg:"#f5f3ff" },
  { lbl:"Ibu Bapa",      ico:"👨‍👩‍👧", tc:"#d97706", bg:"#fef3c7" },
];

const JENIS_HAL = [
  { lbl:"Cuti",         tc:"#dc2626", bg:"#fef2f2" },
  { lbl:"Acara",        tc:"#0077b6", bg:"#e8f4fd" },
  { lbl:"Peperiksaan",  tc:"#d97706", bg:"#fef3c7" },
  { lbl:"Mesyuarat",    tc:"#7c3aed", bg:"#f5f3ff" },
  { lbl:"Lain-lain",    tc:"#374151", bg:"#f3f4f6" },
];

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
      fontFamily:"'Inter',sans-serif", maxWidth:340,
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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ══ THEME TOKENS ══════════════════════════════════════════════════════════ */
:root {
  --bg:           #f5f0e8;
  --bg2:          #faf6ee;
  --surface:      #ffffff;
  --surface-s:    #ffffff;
  --border:       #c9910d;
  --border-s:     #c9910d;
  --divider:      #e8d5a3;
  --shadow:       3px 3px 0 #c9910d;
  --shadow-md:    4px 4px 0 #c9910d;
  --shadow-lg:    6px 6px 0 #c9910d;
  --text:         #001e3a;
  --text2:        #003d6b;
  --text3:        #005f99;
  --accent:       #0077b6;
  --accent2:      #c9910d;
  --accent-lt:    #fef3c7;
  --accent-ring:  rgba(0,119,182,0.22);
  --sb-bg:        #003d6b;
  --tb-bg:        #ffffff;
  --input-bg:     #faf6ee;
  --input-br:     #c9910d;
  --scroll:       #c9910d;
  --blur:         none;
}

[data-theme="dark"] {
  --bg:           #001829;
  --bg2:          #002040;
  --surface:      #002d56;
  --surface-s:    #002d56;
  --border:       #d4a017;
  --border-s:     #d4a017;
  --divider:      rgba(212,160,23,0.2);
  --shadow:       3px 3px 0 #d4a017;
  --shadow-md:    4px 4px 0 #d4a017;
  --shadow-lg:    6px 6px 0 #d4a017;
  --text:         #e8f4fd;
  --text2:        #b3d9f2;
  --text3:        #7ab8d9;
  --accent:       #d4a017;
  --accent2:      #f0c040;
  --accent-lt:    rgba(212,160,23,0.12);
  --accent-ring:  rgba(212,160,23,0.3);
  --sb-bg:        #001020;
  --tb-bg:        #002040;
  --input-bg:     #002d56;
  --input-br:     #d4a017;
  --scroll:       #d4a017;
  --blur:         none;
}

/* ══ BASE ══════════════════════════════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
html { font-size:16px; }
[data-theme="dark"] body {
  background: linear-gradient(160deg,#001020 0%,#001829 40%,#002040 70%,#001829 100%) !important;
}
[data-theme="dark"] body::before {
  background-image: radial-gradient(rgba(212,160,23,0.06) 1.5px, transparent 1.5px) !important;
}

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(160deg,#f5f0e8 0%,#faf6ee 35%,#f0e8d8 65%,#faf6ee 100%);
  background-attachment: fixed;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
  min-height: 100vh;
  transition: background 0.35s, color 0.35s;
  position: relative;
}
body::before {
  content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
  background-image: radial-gradient(rgba(0,119,182,0.09) 1.5px, transparent 1.5px);
  background-size: 28px 28px;
}
.app,.login-page { position:relative; z-index:1; }

::-webkit-scrollbar { width:6px; }
::-webkit-scrollbar-thumb { background:var(--scroll); border-radius:99px; border:2px solid var(--bg); }

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
  background:#003d6b;
  background-image:
    radial-gradient(rgba(212,160,23,0.12) 2px, transparent 2px),
    radial-gradient(rgba(255,255,255,0.03) 2px, transparent 2px);
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
  border:3px solid #c9910d;
  box-shadow:6px 6px 0 #c9910d;
  animation:pop 0.4s cubic-bezier(.34,1.56,.64,1) both;
}

.lc-logo { display:flex; align-items:center; gap:12px; margin-bottom:24px; }
.lc-mark {
  width:54px; height:54px; border-radius:16px; flex-shrink:0;
  background:#fff;
  display:flex; align-items:center; justify-content:center;
  overflow:hidden;
  border:3px solid #c9910d;
  box-shadow:3px 3px 0 #c9910d;
  animation:wiggle 2.5s ease-in-out infinite;
}
.lc-name { font-family:'Playfair Display',serif; font-size:20px; color:#001e3a; letter-spacing:0.02em; }
.lc-school { font-size:12px; color:#4a6fa5; font-weight:700; margin-top:1px; letter-spacing:0.04em; }

.lc-greet { margin-bottom:20px; padding-bottom:20px; border-bottom:3px dashed #e8d5a3; }
.lc-greet h1 {
  font-family:'Playfair Display',serif;
  font-size:26px; color:#001e3a;
  margin-bottom:4px; line-height:1.2; letter-spacing:0.02em;
}
.lc-greet p { font-size:14px; color:#4a6fa5; font-weight:700; }

.lc-hint {
  background:#fef9c3;
  border:2.5px solid #c9910d; border-radius:14px;
  box-shadow:3px 3px 0 #c9910d;
  padding:12px 14px; margin-bottom:20px;
  display:flex; align-items:flex-start; gap:10px;
}
.lc-hint-ico { font-size:22px; flex-shrink:0; animation:wiggle 2s ease-in-out infinite; }
.lc-hint-body { font-size:13px; color:#713f12; font-weight:800; line-height:1.5; }
.lc-hint-body small { display:block; font-weight:700; color:#92400e; margin-top:3px; }

.lc-field { margin-bottom:14px; }
.lc-label {
  display:block; font-size:11.5px; font-weight:700;
  color:#c9910d; letter-spacing:0.1em;
  text-transform:uppercase; margin-bottom:7px;
}
.lc-input {
  width:100%; padding:12px 15px;
  background:#faf6ee; border:2.5px solid #c9910d; border-radius:12px;
  font-size:15px; font-weight:700;
  font-family:'Inter',sans-serif; color:#001e3a;
  outline:none; transition:all 0.18s;
  box-shadow:2px 2px 0 #c9910d;
}
.lc-input:focus { border-color:#d4a017; box-shadow:2px 2px 0 #d4a017, 0 0 0 4px rgba(212,160,23,0.15); background:white; }
.lc-input::placeholder { color:#a08060; font-weight:500; }

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
  background:linear-gradient(135deg,#003060,#0077b6);
  border:2.5px solid #c9910d; border-radius:14px;
  color:white; font-size:16px; font-weight:700;
  font-family:'Inter',sans-serif;
  cursor:pointer; margin-top:4px;
  box-shadow:4px 4px 0 #c9910d;
  transition:all 0.15s; letter-spacing:0.06em;
}
.lc-btn:hover:not(:disabled) { transform:translate(-2px,-2px); box-shadow:6px 6px 0 #c9910d; }
.lc-btn:active { transform:translate(2px,2px); box-shadow:2px 2px 0 #c9910d; }
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
  overflow:hidden;
  box-shadow:4px 0 0 var(--border);
  transition:transform 0.3s cubic-bezier(.34,1.56,.64,1);
  z-index:200;
}
.sb-overlay {
  display:none; position:fixed; inset:0;
  background:rgba(5,11,25,0.6); z-index:190;
}

.sb-top {
  padding:12px 14px 10px;
  border-bottom:2.5px solid rgba(255,255,255,0.15);
}
.sb-logo { display:flex; align-items:center; gap:10px; }
.sb-mark {
  width:42px; height:42px; border-radius:14px; flex-shrink:0;
  background:#fff;
  display:flex; align-items:center; justify-content:center;
  overflow:hidden;
  border:2.5px solid rgba(255,255,255,0.4);
  box-shadow:3px 3px 0 rgba(0,0,0,0.2);
  animation:wobble 4s ease-in-out infinite;
}
.sb-name { font-family:'Playfair Display',serif; font-size:15px; color:#ffffff; letter-spacing:0.03em; }
.sb-school { font-size:11px; color:rgba(255,255,255,0.65); font-weight:700; margin-top:1px; }

.sb-mood {
  margin-top:12px; padding:10px 12px;
  background:rgba(212,160,23,0.1);
  border:2px dashed rgba(212,160,23,0.35);
  border-radius:14px;
  display:flex; align-items:center; gap:8px;
}
.sb-mood-ico { font-size:20px; animation:float 3s ease-in-out infinite; }
.sb-mood-text { font-size:12px; font-weight:800; color:rgba(255,255,255,0.9); line-height:1.3; }

.sb-nav { flex:1; padding:8px; overflow-y:auto; min-height:0; }
.sb-sec-lbl {
  font-size:9.5px; font-weight:700; color:rgba(212,160,23,0.7);
  letter-spacing:0.16em; text-transform:uppercase;
  padding:14px 8px 5px;
}
.sb-btn {
  width:100%; display:flex; align-items:center; gap:10px;
  padding:7px 12px; border-radius:12px; margin-bottom:2px;
  background:transparent; border:none; cursor:pointer;
  color:rgba(255,255,255,0.75); font-size:13px; font-weight:800;
  font-family:'Inter',sans-serif; text-align:left;
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
  font-family:'Inter',sans-serif; text-align:left; transition:all 0.12s;
}
.sub-btn:hover { color:#ffffff; background:rgba(255,255,255,0.12); transform:translateX(2px); }
.sub-btn.act { color:#fbbf24; background:rgba(251,191,36,0.12); font-weight:900; }
.sub-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; opacity:0.6; }

.sb-foot {
  padding:8px 10px;
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
  background:linear-gradient(135deg,#c9910d,#f0c040);
  display:flex; align-items:center; justify-content:center;
  color:#001e3a; font-size:13px; font-weight:900;
  border:2px solid rgba(212,160,23,0.5);
  box-shadow:2px 2px 0 rgba(0,0,0,0.3);
}
.sb-uname { font-size:13px; font-weight:900; color:#ffffff; }
.sb-urole { font-size:11px; color:rgba(255,255,255,0.6); font-weight:700; }
.sb-out {
  width:100%; display:flex; align-items:center; gap:8px;
  padding:9px 12px; border-radius:10px;
  background:transparent; border:2px solid transparent; cursor:pointer;
  color:rgba(255,255,255,0.6); font-size:13.5px; font-weight:800;
  font-family:'Inter',sans-serif; transition:all 0.15s;
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
  background:#fef3c7; border:2.5px solid #c9910d; border-radius:10px;
  width:40px; height:40px; align-items:center; justify-content:center;
  cursor:pointer; font-size:19px; flex-shrink:0;
  box-shadow:2px 2px 0 #c9910d;
  transition:all 0.15s;
}
.tb-hamburger:hover { transform:translate(-1px,-1px); box-shadow:3px 3px 0 #c9910d; }
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
  background:#fef3c7; border:2.5px solid #c9910d;
  display:flex; align-items:center; justify-content:center;
  font-size:17px; cursor:pointer;
  box-shadow:2px 2px 0 #c9910d;
  transition:all 0.15s; flex-shrink:0;
}
.tb-theme:hover { transform:translate(-1px,-1px) rotate(15deg); box-shadow:3px 3px 0 #c9910d; }

.tb-notif {
  width:38px; height:38px; border-radius:10px;
  background:#fef3c7; border:2.5px solid #c9910d;
  display:flex; align-items:center; justify-content:center;
  font-size:18px; cursor:pointer; position:relative;
  box-shadow:2px 2px 0 #c9910d;
  transition:all 0.15s;
}
.tb-notif:hover { transform:translate(-1px,-1px) rotate(-10deg); box-shadow:3px 3px 0 #c9910d; }
.tb-dot { position:absolute; top:5px; right:5px; width:9px; height:9px; border-radius:50%; background:#ef4444; border:2px solid white; }
.tb-user {
  display:flex; align-items:center; gap:8px;
  padding:5px 12px 5px 5px; border-radius:30px;
  background:#fef3c7; border:2.5px solid #c9910d; cursor:pointer;
  box-shadow:2px 2px 0 #c9910d;
  transition:all 0.15s;
}
.tb-user:hover { transform:translate(-1px,-1px); box-shadow:3px 3px 0 #c9910d; }
.tb-uav {
  width:30px; height:30px; border-radius:50%;
  background:#0077b6; border:2px solid #c9910d;
  display:flex; align-items:center; justify-content:center;
  color:white; font-size:11px; font-weight:900; flex-shrink:0;
}
.tb-uname { font-size:13px; font-weight:900; color:var(--text); white-space:nowrap; }

/* ── CONTENT ── */
.main { flex:1; min-width:0; display:flex; flex-direction:column; }
.content { flex:1; padding:20px 18px 40px; }

/* ── HERO ── */
.hero {
  border-radius:28px; margin-bottom:20px;
  background:linear-gradient(135deg,#002d56 0%,#004e8a 22%,#0077b6 50%,#0096c7 72%,#b8860b 90%,#d4a017 100%);
  color:white; position:relative; overflow:hidden;
  border:2px solid rgba(255,255,255,0.22);
  box-shadow:0 20px 60px rgba(30,58,138,0.38),0 8px 20px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.18);
  animation:slideUp 0.5s cubic-bezier(.34,1.56,.64,1) both;
}
.hero::before {
  content:''; position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(ellipse at 10% 55%,rgba(255,255,255,0.18) 0%,transparent 50%),
    radial-gradient(ellipse at 88% 15%,rgba(6,182,212,0.32) 0%,transparent 45%),
    radial-gradient(ellipse at 50% 110%,rgba(99,102,241,0.22) 0%,transparent 55%);
}
.hero-glow {
  position:absolute; border-radius:50%;
  filter:blur(55px); pointer-events:none;
  animation:float 7s ease-in-out infinite; opacity:0.55;
}
.hero-dots {
  position:absolute; inset:0; pointer-events:none;
  background-image:radial-gradient(rgba(255,255,255,0.2) 1.5px,transparent 1.5px);
  background-size:22px 22px; opacity:0.55;
}
.hero-body { padding:32px 28px 10px; position:relative; z-index:1; }
.hero-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
.hero-emoji {
  width:90px; height:90px; animation:float 4s ease-in-out infinite;
  flex-shrink:0; border-radius:20px; overflow:hidden;
  filter:drop-shadow(0 10px 20px rgba(0,0,0,0.22)); margin-top:4px;
  background:#fff;
}
.hero-title {
  font-family:'Playfair Display',serif;
  font-size:28px; margin-bottom:8px; line-height:1.2; letter-spacing:0.02em;
  text-shadow:0 2px 10px rgba(0,0,0,0.12);
}
.hero-sub { font-size:14.5px; opacity:0.9; font-weight:700; min-height:22px; }
.hero-date { font-size:12.5px; opacity:0.62; margin-top:6px; font-weight:700; }
.hero-tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:18px; margin-bottom:30px; }
.hero-tag {
  display:flex; align-items:center; gap:5px;
  background:rgba(255,255,255,0.18);
  backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
  border:1.5px solid rgba(255,255,255,0.32);
  border-radius:30px; padding:6px 16px;
  font-size:12px; font-weight:800;
  transition:all 0.22s cubic-bezier(.34,1.56,.64,1);
}
.hero-tag:hover {
  background:rgba(255,255,255,0.30);
  transform:translateY(-2px) scale(1.06);
  box-shadow:0 6px 16px rgba(0,0,0,0.12);
}

/* ── BENTO STATS ── */
.bento-grid {
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:14px; margin-bottom:24px;
}
.bento-card {
  background:rgba(255,255,255,0.72);
  backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid rgba(255,255,255,0.88);
  border-radius:22px; padding:22px 18px;
  position:relative; overflow:hidden;
  box-shadow:0 4px 24px rgba(37,99,235,0.09),0 1px 4px rgba(0,0,0,0.04);
  transition:all 0.25s cubic-bezier(.34,1.56,.64,1);
  animation:slideUp 0.4s ease both;
}
.bento-card:hover {
  transform:translateY(-5px) scale(1.015);
  box-shadow:0 16px 44px rgba(37,99,235,0.2),0 4px 12px rgba(0,0,0,0.06);
  border-color:rgba(255,255,255,1);
}
[data-theme="dark"] .bento-card {
  background:rgba(17,28,53,0.78);
  border-color:rgba(96,165,250,0.18);
  box-shadow:0 4px 24px rgba(0,0,0,0.35);
}
[data-theme="dark"] .bento-card:hover {
  box-shadow:0 16px 44px rgba(96,165,250,0.15);
}
.bento-accent-bar {
  position:absolute; left:0; top:0; bottom:0;
  width:4px; border-radius:22px 0 0 22px;
}
.bento-bg-circle {
  position:absolute; border-radius:50%;
  right:-24px; bottom:-24px;
  width:100px; height:100px; opacity:0.08;
}
.bento-ico { font-size:34px; margin-bottom:10px; display:block; }
.bento-val {
  font-family:'Playfair Display',serif;
  font-size:34px; color:var(--text); line-height:1; letter-spacing:0.02em;
}
.bento-lbl { font-size:13px; color:var(--text2); font-weight:800; margin-top:5px; }
.bento-note {
  font-size:11.5px; font-weight:800; margin-top:10px;
  padding-top:10px; border-top:1.5px dashed var(--divider);
  display:flex; align-items:center; gap:5px;
}

/* featured bento card — spans 2 cols */
.bento-featured {
  grid-column:span 2;
  padding:26px 22px;
  background:linear-gradient(135deg,rgba(239,246,255,0.96) 0%,rgba(219,234,254,0.92) 100%);
  border-color:rgba(147,197,253,0.65);
  box-shadow:0 8px 32px rgba(37,99,235,0.14),0 2px 8px rgba(0,0,0,0.04);
}
[data-theme="dark"] .bento-featured {
  background:linear-gradient(135deg,rgba(37,99,235,0.18) 0%,rgba(30,64,175,0.22) 100%);
  border-color:rgba(96,165,250,0.28);
  box-shadow:0 8px 32px rgba(0,0,0,0.3);
}
.bento-featured .bento-val { font-size:44px; }
.bento-featured .bento-lbl { font-size:14px; }
.bento-featured-inner { display:flex; align-items:center; justify-content:space-between; }
.bento-featured-left {}
.bento-featured-right { text-align:right; }
.bento-progress {
  width:120px; height:10px; border-radius:99px;
  background:var(--divider); margin-top:8px; overflow:hidden;
  margin-left:auto; border:1.5px solid rgba(147,197,253,0.4);
}
.bento-progress-fill {
  height:100%; border-radius:99px;
  background:linear-gradient(90deg,#22c55e,#86efac);
}

/* ── SECTION HEADER ── */
.sec-hd {
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:12px; margin-top:22px;
}
.sec-title {
  font-family:'Playfair Display',serif;
  font-size:18px; color:var(--text);
  display:flex; align-items:center; gap:8px;
  letter-spacing:0.02em;
}
.sec-sub { font-size:12.5px; color:var(--text3); font-weight:700; }

/* ── UPDATES ── */
.updates { display:flex; flex-direction:column; gap:10px; margin-bottom:4px; }
.upd-card {
  background:rgba(255,255,255,0.72);
  backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  border:1.5px solid rgba(255,255,255,0.88);
  border-radius:16px; padding:13px 15px;
  display:flex; align-items:center; gap:12px;
  box-shadow:0 4px 16px rgba(37,99,235,0.07),0 1px 3px rgba(0,0,0,0.03);
  transition:all 0.22s cubic-bezier(.34,1.56,.64,1); animation:slideUp 0.4s ease both;
}
[data-theme="dark"] .upd-card {
  background:rgba(17,28,53,0.75);
  border-color:rgba(96,165,250,0.15);
}
.upd-card:hover {
  transform:translateY(-3px) scale(1.01);
  box-shadow:0 10px 30px rgba(37,99,235,0.14);
}
.upd-ico {
  width:42px; height:42px; border-radius:12px;
  display:flex; align-items:center; justify-content:center;
  font-size:20px; flex-shrink:0;
  border:1.5px solid rgba(255,255,255,0.7);
  box-shadow:0 2px 8px rgba(0,0,0,0.06);
  transition:transform 0.2s;
}
.upd-card:hover .upd-ico { transform:scale(1.15) rotate(-8deg); }
.upd-text { flex:1; font-size:13.5px; font-weight:800; color:var(--text); }
.upd-tag { font-size:11.5px; font-weight:900; padding:4px 11px; border-radius:20px; white-space:nowrap; flex-shrink:0; border:2px solid currentColor; }

/* ── MODULE CARDS ── */
.mods-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.mc {
  background:rgba(255,255,255,0.75);
  backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1.5px solid rgba(255,255,255,0.9);
  border-radius:22px; padding:20px 18px;
  cursor:pointer;
  box-shadow:0 4px 20px rgba(37,99,235,0.08),0 1px 4px rgba(0,0,0,0.03);
  transition:all 0.25s cubic-bezier(.34,1.56,.64,1);
  position:relative; overflow:hidden;
  animation:slideUp 0.4s ease both;
}
.mc:hover {
  transform:translateY(-6px) scale(1.02);
  box-shadow:0 20px 50px rgba(37,99,235,0.2),0 6px 16px rgba(0,0,0,0.06);
  border-color:rgba(255,255,255,1);
}
[data-theme="dark"] .mc {
  background:rgba(17,28,53,0.78);
  border-color:rgba(96,165,250,0.15);
  box-shadow:0 4px 20px rgba(0,0,0,0.3);
}
.mc-blob {
  position:absolute; bottom:-30px; right:-30px;
  width:120px; height:120px; border-radius:50%; opacity:0.09;
  transition:transform 0.4s cubic-bezier(.34,1.56,.64,1);
}
.mc:hover .mc-blob { transform:scale(1.6); opacity:0.14; }
.mc-tag {
  display:inline-flex; align-items:center; gap:4px;
  font-size:10.5px; font-weight:900; padding:4px 12px;
  border-radius:20px; margin-bottom:12px;
  background:rgba(37,99,235,0.06);
  border:1.5px solid currentColor;
}
.mc-ico-wrap { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.mc-ico {
  width:54px; height:54px; border-radius:18px;
  font-size:28px; display:flex; align-items:center; justify-content:center;
  border:1.5px solid rgba(255,255,255,0.7);
  box-shadow:0 4px 14px rgba(0,0,0,0.09);
  transition:transform 0.25s cubic-bezier(.34,1.56,.64,1);
  backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
}
.mc:hover .mc-ico { transform:scale(1.12) rotate(-7deg); }
.mc-count {
  font-family:'Playfair Display',serif;
  font-size:12px; color:var(--text2);
  background:rgba(239,246,255,0.85);
  border:1.5px solid rgba(147,197,253,0.5);
  border-radius:20px; padding:3px 12px;
  backdrop-filter:blur(8px);
}
.mc-name {
  font-family:'Playfair Display',serif;
  font-size:16px; color:var(--text);
  margin-bottom:12px; letter-spacing:0.02em;
}
.mc-pills { display:flex; flex-wrap:wrap; gap:5px; }
.mc-pill {
  padding:4px 11px; border-radius:10px;
  font-size:11.5px; font-weight:800; cursor:pointer;
  transition:all 0.2s cubic-bezier(.34,1.56,.64,1);
  border:1.5px solid transparent;
  backdrop-filter:blur(8px);
}
.mc-pill:hover { transform:scale(1.1) rotate(-2deg); }
.mc-more {
  padding:4px 11px; border-radius:10px;
  font-size:11.5px; font-weight:800;
  background:rgba(239,246,255,0.85);
  color:var(--accent); border:1.5px solid rgba(147,197,253,0.5);
}

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
  font-family:'Playfair Display',serif;
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
.pgs-val { font-family:'Playfair Display',serif; font-size:22px; color:var(--text); letter-spacing:0.02em; }
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
  font-family:'Playfair Display',serif;
  font-size:22px; color:var(--text);
  margin-bottom:10px; letter-spacing:0.02em;
}
.ph-text { font-size:14.5px; color:var(--text2); font-weight:700; line-height:1.7; max-width:340px; margin:0 auto 24px; }
.ph-btn {
  display:inline-flex; align-items:center; gap:8px;
  background:var(--accent); border:2.5px solid #c9910d;
  border-radius:12px; padding:12px 24px;
  font-size:14px; font-weight:900; color:white;
  font-family:'Inter',sans-serif;
  box-shadow:3px 3px 0 #c9910d;
  transition:all 0.15s;
}
.ph-btn:hover { transform:translate(-2px,-2px); box-shadow:5px 5px 0 #c9910d; }

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
  .hero-body { padding:22px 18px 6px; }
  .hero-title { font-size:22px; }
  .hero-emoji { font-size:50px; }
  .bento-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
  .bento-featured { grid-column:span 2; }
  .bento-featured .bento-val { font-size:32px; }
  .bento-progress { width:80px; }
  .mods-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
  .mc { padding:16px 14px; }
  .pg-stats { gap:8px; }
  .pgs { padding:14px 10px; }
}
@media (max-width:480px) {
  .login-card { padding:28px 16px 24px; }
  .bento-grid { grid-template-columns:repeat(2,1fr); }
  .bento-featured { grid-column:span 2; }
  .mods-grid { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:360px) {
  .bento-grid { grid-template-columns:1fr; }
  .bento-featured { grid-column:span 1; }
  .mods-grid { grid-template-columns:1fr; }
}
@media (min-width:769px) {
  .bento-grid { grid-template-columns:repeat(3,1fr); }
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
  font-family:'Inter',sans-serif; cursor:pointer;
  outline:none; box-shadow:var(--shadow); transition:all 0.15s;
}
.kur-select:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-ring); }
.kur-search-wrap { position:relative; flex:1; min-width:180px; }
.kur-search-ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:15px; pointer-events:none; }
.kur-search {
  width:100%; padding:9px 14px 9px 38px;
  border-radius:12px; background:var(--surface); border:2.5px solid var(--border);
  color:var(--text); font-size:13px; font-weight:700;
  font-family:'Inter',sans-serif;
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
.kur-stat-val { font-family:'Playfair Display',serif; font-size:22px; color:var(--text); letter-spacing:0.02em; }
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
  white-space:nowrap; font-family:'Inter',sans-serif;
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
  background:#fef3c7 !important;
  font-size:10.5px; font-weight:900; color:#c9910d !important;
  letter-spacing:0.12em; text-transform:uppercase; font-family:'Inter',sans-serif;
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
.panitia-name { font-family:'Playfair Display',serif; font-size:15px; color:var(--text); letter-spacing:0.02em; }
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
  white-space:nowrap; font-family:'Inter',sans-serif;
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
.nilam-bar { height:100%; border-radius:99px; background:linear-gradient(90deg,#c9910d,#f0c040); }

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
.prog-title { font-family:'Playfair Display',serif; font-size:15px; color:var(--text); margin-bottom:5px; letter-spacing:0.02em; }
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
  .form-row { grid-template-columns:1fr; }
  .kur-stats { grid-template-columns:1fr 1fr; }
  .modal-card { border-radius:14px; }
}
/* Murid card (mobile list view) */
.murid-card {
  background:var(--surface); border:2.5px solid var(--border);
  border-radius:14px; padding:14px 14px 10px;
  box-shadow:var(--shadow); margin-bottom:10px;
}
.murid-card-row { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; }
.murid-card-acts { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin:10px 0 8px; }
.murid-card-act { background:var(--card2); border-radius:8px; padding:7px 8px; font-size:11px; }
.murid-card-act-label { font-size:9px; font-weight:900; color:var(--text3); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:2px; }
.murid-card-act-name { font-weight:700; color:var(--text); font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.murid-card-act-mark { font-weight:900; font-size:13px; color:var(--accent); margin-top:2px; }

/* ── MODAL ── */
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal-overlay {
  position:fixed; inset:0; z-index:1000;
  background:rgba(0,0,0,0.5);
  display:flex; align-items:flex-start; justify-content:center;
  padding:20px; animation:fadeIn 0.15s ease;
  overflow-y:auto;
}
.modal-card {
  background:var(--surface-s); border:3px solid var(--border);
  border-radius:20px; width:100%; max-width:440px;
  box-shadow:6px 6px 0 var(--border);
  animation:pop 0.3s cubic-bezier(.34,1.56,.64,1) both;
  display:flex; flex-direction:column;
  max-height:calc(100vh - 40px);
}
.modal-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px; border-bottom:2.5px solid var(--divider);
}
.modal-title { font-family:'Playfair Display',serif; font-size:17px; color:var(--text); letter-spacing:0.02em; }
.modal-close {
  width:30px; height:30px; border-radius:8px;
  background:#fee2e2; border:2px solid var(--border);
  color:#dc2626; cursor:pointer; font-size:13px;
  box-shadow:2px 2px 0 var(--border);
  display:flex; align-items:center; justify-content:center; transition:all 0.12s;
}
.modal-close:hover { transform:translate(-1px,-1px); box-shadow:3px 3px 0 var(--border); }
.modal-body { padding:20px; overflow-y:auto; flex:1; }

/* Forms */
.form-field { margin-bottom:12px; }
.form-label { display:block; font-size:11px; font-weight:900; color:var(--accent); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px; }
.form-input {
  width:100%; padding:9px 13px;
  background:var(--input-bg); border:2.5px solid var(--input-br);
  border-radius:10px; color:var(--text);
  font-size:13px; font-weight:700;
  font-family:'Inter',sans-serif;
  outline:none; transition:all 0.15s;
  box-shadow:2px 2px 0 var(--border);
}
.form-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-ring); }
.form-input:disabled { opacity:0.5; cursor:not-allowed; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.btn-primary {
  width:100%; padding:11px;
  background:var(--accent);
  border:2.5px solid #c9910d; border-radius:12px;
  color:white; font-size:14px; font-weight:900;
  font-family:'Inter',sans-serif;
  cursor:pointer; margin-top:4px;
  box-shadow:3px 3px 0 #c9910d; transition:all 0.15s;
}
.btn-primary:hover { transform:translate(-1px,-1px); box-shadow:4px 4px 0 #c9910d; }
.btn-primary:active { transform:translate(1px,1px); box-shadow:2px 2px 0 #c9910d; }
.btn-add {
  display:flex; align-items:center; gap:6px;
  padding:8px 16px; border-radius:10px;
  background:var(--accent); border:2.5px solid #c9910d; color:white;
  font-size:12.5px; font-weight:900;
  font-family:'Inter',sans-serif;
  cursor:pointer; transition:all 0.15s;
  box-shadow:3px 3px 0 #c9910d;
}
.btn-add:hover { transform:translate(-1px,-1px); box-shadow:4px 4px 0 #c9910d; }
.btn-add:active { transform:translate(1px,1px); box-shadow:2px 2px 0 #c9910d; }
.btn-del {
  padding:4px 9px; border-radius:7px;
  background:transparent; border:2px solid transparent;
  color:var(--text3); font-size:12px; cursor:pointer;
  font-family:'Inter',sans-serif; font-weight:800; transition:all 0.15s;
}
.btn-del:hover { background:#fee2e2; color:#dc2626; border-color:#fca5a5; }
/* ── MAKLUMAN AUDIENCE TABS ── */
.mak-tabs { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }
.mak-tab {
  display:flex; align-items:center; gap:5px;
  padding:5px 14px; border-radius:20px;
  font-size:12px; font-weight:800;
  border:2.5px solid var(--border);
  cursor:pointer; background:var(--surface);
  color:var(--text2); transition:all 0.15s;
  font-family:'Inter',sans-serif;
  box-shadow:var(--shadow);
}
.mak-tab:hover { transform:translate(-1px,-1px); box-shadow:var(--shadow-md); }
.mak-tab.act {
  background:var(--accent); color:#fff;
  border-color:var(--accent);
  box-shadow:var(--shadow-md);
}
.mak-cnt {
  font-size:10px; font-weight:900;
  background:rgba(255,255,255,0.25); border-radius:10px; padding:1px 6px;
}
.mak-tab:not(.act) .mak-cnt { background:var(--accent-lt); color:var(--accent); }
.mak-sasaran {
  font-size:10px; font-weight:800; padding:2px 8px;
  border-radius:10px; white-space:nowrap; border:1.5px solid currentColor;
  flex-shrink:0;
}

/* ── KALENDAR ── */
.kal-list { display:flex; flex-direction:column; gap:8px; margin-bottom:4px; }
.kal-card {
  background:var(--surface);
  border:2.5px solid var(--border); border-radius:16px;
  padding:12px 15px; display:flex; align-items:center; gap:14px;
  box-shadow:var(--shadow); transition:all 0.15s;
  animation:slideUp 0.35s ease both;
}
.kal-card:hover { transform:translate(-2px,-2px); box-shadow:var(--shadow-md); }
.kal-card.kal-past { opacity:0.5; }
.kal-date-box {
  min-width:52px; text-align:center; flex-shrink:0;
  background:var(--accent); color:#fff;
  border-radius:12px; padding:6px 4px;
  border:2px solid var(--border);
  box-shadow:2px 2px 0 var(--border);
}
.kal-date-day { font-family:'Playfair Display',serif; font-size:22px; font-weight:800; line-height:1; }
.kal-date-mon { font-size:10px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; opacity:0.85; }
.kal-body { flex:1; min-width:0; }
.kal-tajuk { font-size:13.5px; font-weight:800; color:var(--text); margin-bottom:2px; }
.kal-nota { font-size:11.5px; color:var(--text3); font-weight:700; }
.kal-badges { display:flex; align-items:center; gap:6px; margin-top:5px; flex-wrap:wrap; }
.kal-countdown {
  font-size:10.5px; font-weight:900; padding:2px 9px;
  border-radius:10px; white-space:nowrap; flex-shrink:0;
  border:1.5px solid currentColor;
}
.kal-jenis { font-size:10.5px; font-weight:900; padding:2px 9px; border-radius:10px; border:1.5px solid currentColor; white-space:nowrap; }
@media (min-width:769px) { .kal-list { display:grid; grid-template-columns:1fr 1fr; } }

/* ── Profil Pentadbir Sekolah ────────────────────────────────────────────── */
.profil-logo-wrap {
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  background:var(--surface); border:1.5px solid var(--border); border-radius:16px;
  padding:16px 20px; margin-bottom:16px; box-shadow:var(--shadow);
  flex-wrap:wrap;
}
.profil-logo-box { display:flex; align-items:center; gap:16px; }
.profil-logo-img { width:64px; height:64px; object-fit:contain; border-radius:12px; border:2px solid var(--border); background:white; }
.profil-nama-sek { font-family:'Playfair Display',serif; font-size:16px; font-weight:700; color:var(--text); }
.profil-alamat-sek { font-size:12px; color:var(--text3); font-weight:600; margin-top:2px; }

.pent-grid {
  display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
  gap:14px; margin-bottom:20px;
}
.pent-card {
  background:var(--surface); border:1.5px solid var(--border); border-radius:16px;
  padding:20px 16px; display:flex; flex-direction:column; align-items:center;
  text-align:center; gap:10px; box-shadow:var(--shadow); position:relative;
  animation:fadeIn 0.3s ease both;
}
.pent-foto-wrap { width:80px; height:80px; flex-shrink:0; }
.pent-foto {
  width:80px; height:80px; border-radius:50%; object-fit:cover;
  border:3px solid var(--border);
}
.pent-foto-ph {
  display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,#003d6b,#0077b6);
  color:white; font-size:26px; font-weight:800; font-family:'Playfair Display',serif;
  border-radius:50%;
}
.pent-info { display:flex; flex-direction:column; gap:4px; width:100%; }
.pent-nama { font-family:'Playfair Display',serif; font-size:13.5px; font-weight:700; color:var(--text); }
.pent-jawatan {
  font-size:11.5px; font-weight:700; color:var(--accent); background:var(--accent-lt);
  border:1px solid var(--border); border-radius:20px; padding:3px 12px;
  display:inline-block; align-self:center;
}
.pent-bio { font-size:11px; color:var(--text3); font-weight:500; line-height:1.5; }
.pent-actions { position:absolute; top:8px; right:8px; display:flex; gap:4px; }
.btn-icon-sm {
  background:none; border:1.5px solid var(--border); border-radius:8px;
  cursor:pointer; font-size:13px; padding:3px 7px; color:var(--text2);
  transition:background 0.15s; font-family:'Inter',sans-serif;
}
.btn-icon-sm:hover { background:var(--accent-lt); }
.btn-icon-del:hover { background:#fef2f2; border-color:#ef4444; }
.btn-sm-ghost {
  background:none; border:1.5px solid var(--border); border-radius:8px;
  cursor:pointer; font-size:12px; padding:6px 12px; color:var(--text2);
  font-weight:600; font-family:'Inter',sans-serif; white-space:nowrap;
  transition:background 0.15s;
}
.btn-sm-ghost:hover { background:var(--accent-lt); }

@media (max-width:600px) {
  .pent-grid { grid-template-columns:1fr 1fr; }
}

.loading { padding:48px; text-align:center; color:var(--text3); font-size:15px; font-weight:900; animation:float 2s ease-in-out infinite; font-family:'Playfair Display',serif; letter-spacing:0.03em; }
`;

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// ─── PUBLIC VIEW (no auth) ────────────────────────────────────────────────────
function PublicView() {
  const [notis, setNotis] = useState([]);
  const [kal, setKal] = useState([]);
  const [pent, setPent] = useState([]);
  const [logo, setLogo] = useState("https://i.postimg.cc/pdhvk3Q2/images.jpg");

  useEffect(() => {
    supabase.from('notis').select('*').order('created_at',{ascending:false}).then(({data})=>setNotis(data||[]));
    supabase.from('kalendar').select('*').order('tarikh',{ascending:true}).then(({data})=>setKal(data||[]));
    supabase.from('pentadbir').select('*').order('urutan',{ascending:true}).then(({data})=>setPent(data||[]));
    supabase.from('tetapan').select('*').then(({data})=>{
      const l=data?.find(r=>r.kunci==='logo_url'); if(l?.nilai) setLogo(l.nilai);
    });
  },[]);

  const BULAN=["JAN","FEB","MAR","APR","MEI","JUN","JUL","OGO","SEP","OKT","NOV","DIS"];
  const fmtD=(s)=>{const d=new Date(s+'T00:00:00');const t=new Date();t.setHours(0,0,0,0);const diff=Math.ceil((d-t)/86400000);return{day:d.getDate(),mon:BULAN[d.getMonth()],diff};};
  const cdStyle=(diff)=>{
    if(diff<0) return{lbl:`${Math.abs(diff)} hari lalu`,tc:"#94a3b8",bg:"#f1f5f9"};
    if(diff===0) return{lbl:"Hari ini!",tc:"#92400e",bg:"#fef9c3"};
    if(diff<=7) return{lbl:`${diff} hari lagi`,tc:"#0077b6",bg:"#e8f4fd"};
    return{lbl:`${diff} hari lagi`,tc:"#15803d",bg:"#f0fdf4"};
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#f5f0e8,#faf6ee,#f0e8d8)",fontFamily:"'Inter',sans-serif"}}>
      <style>{CSS}</style>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#001e3a,#003d6b,#0077b6)",color:"#fff",padding:"18px 28px",display:"flex",alignItems:"center",gap:16,boxShadow:"0 2px 12px rgba(0,0,0,0.2)"}}>
        <img src={logo} alt="Logo" style={{width:52,height:52,borderRadius:"50%",border:"2px solid rgba(212,160,23,0.7)",objectFit:"contain",background:"#fff"}}/>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:800,letterSpacing:0.4}}>Sekolah Kebangsaan Darau</div>
          <div style={{fontSize:11,opacity:0.8,marginTop:2}}>Kota Kinabalu, Sabah · Malaysia</div>
        </div>
        <a href={window.location.pathname} style={{padding:"7px 16px",background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.3)",borderRadius:10,color:"#fff",textDecoration:"none",fontSize:12,fontWeight:700}}>
          🔐 Log Masuk Admin
        </a>
      </div>
      <div style={{height:3,background:"linear-gradient(90deg,#b8860b,#f0c040,#b8860b)"}}/>

      <div style={{maxWidth:900,margin:"0 auto",padding:"24px 16px"}}>

        {/* Profil Pentadbir */}
        {pent.length>0 && <>
          <div className="sec-hd" style={{marginBottom:12}}>
            <div className="sec-title">🏫 Pentadbir Sekolah</div>
          </div>
          <div className="pent-grid" style={{marginBottom:24}}>
            {pent.map((p,i)=>(
              <div className="pent-card" key={p.id} style={{animationDelay:`${i*0.08}s`}}>
                <div className="pent-foto-wrap">
                  {p.gambar_url
                    ? <img src={p.gambar_url} alt={p.nama} className="pent-foto"/>
                    : <div className="pent-foto pent-foto-ph">{p.nama.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>}
                </div>
                <div className="pent-info">
                  <div className="pent-nama">{p.nama}</div>
                  <div className="pent-jawatan">{p.jawatan}</div>
                  {p.bio&&<div className="pent-bio">{p.bio}</div>}
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* Makluman */}
        <div className="sec-hd" style={{marginBottom:12}}>
          <div className="sec-title">📢 Makluman Sekolah</div>
          <span className="sec-sub">{notis.length} item</span>
        </div>
        <div className="updates" style={{marginBottom:24}}>
          {notis.length===0
            ? <div style={{gridColumn:"1/-1",textAlign:"center",padding:28,color:"var(--text3)",fontWeight:700}}>Tiada makluman.</div>
            : notis.map((u,i)=>{
                const sas=SASARAN_OPTS.find(s=>s.lbl===(u.sasaran||"Semua"))||SASARAN_OPTS[0];
                return(
                  <div className="upd-card" key={u.id} style={{animationDelay:`${i*0.07}s`}}>
                    <div className="upd-top">
                      <span className="upd-ico">{u.icon}</span>
                      <span className="upd-tag" style={{color:u.tc,background:u.bg}}>{u.tag}</span>
                      <span className="mak-sasaran" style={{color:sas.tc,background:sas.bg}}>{sas.ico} {sas.lbl}</span>
                    </div>
                    <div className="upd-txt">{u.teks}</div>
                  </div>
                );
              })
          }
        </div>

        {/* Kalendar */}
        <div className="sec-hd" style={{marginBottom:12}}>
          <div className="sec-title">📅 Kalendar Sekolah</div>
          <span className="sec-sub">{kal.length} acara</span>
        </div>
        <div className="kal-list" style={{marginBottom:24}}>
          {kal.length===0
            ? <div style={{textAlign:"center",padding:28,color:"var(--text3)",fontWeight:700}}>Tiada acara.</div>
            : kal.map((k,i)=>{
                const{day,mon,diff}=fmtD(k.tarikh);
                const cd=cdStyle(diff);
                const jn=JENIS_HAL.find(j=>j.lbl===k.jenis)||JENIS_HAL[4];
                return(
                  <div className={`kal-card${diff<0?" kal-past":""}`} key={k.id} style={{animationDelay:`${i*0.06}s`}}>
                    <div className="kal-date-box" style={diff<0?{background:"var(--text3)"}:{}}>
                      <div className="kal-date-day">{day}</div>
                      <div className="kal-date-mon">{mon}</div>
                    </div>
                    <div className="kal-body">
                      <div className="kal-tajuk">{k.tajuk}</div>
                      {k.nota&&<div className="kal-nota">{k.nota}</div>}
                      <div className="kal-badges">
                        <span className="kal-jenis" style={{color:jn.tc,background:jn.bg,borderColor:jn.tc}}>{k.jenis}</span>
                        <span className="kal-countdown" style={{color:cd.tc,background:cd.bg,borderColor:cd.tc}}>{cd.lbl}</span>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>

        <div style={{textAlign:"center",fontSize:11,color:"#94a3b8",paddingTop:12,borderTop:"1px solid #e2e8f0"}}>
          Sistem EduDashboard · SK Darau · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const submit = async () => {
    setErr("");
    if (!email || !pass) { setErr("Sila isi emel dan kata laluan."); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      setErr("Emel atau kata laluan tidak sah. Sila hubungi pentadbir sistem.");
    } else {
      const u = data.user;
      const name = u.user_metadata?.name || u.user_metadata?.full_name || u.email.split("@")[0];
      const role = u.user_metadata?.role || "Guru";
      onLogin({ name, role, email: u.email });
    }
    setLoading(false);
  };

  const sendReset = async () => {
    setErr("");
    if (!email.trim()) { setErr("Sila isi emel dahulu."); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + window.location.pathname,
    });
    if (error) {
      setErr("Gagal hantar emel: " + (error.message || "Cuba semula."));
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  const blobs = [
    { w:240, h:240, bg:"rgba(255,255,255,0.06)", top:"5%",   left:"5%",   delay:"0s" },
    { w:180, h:180, bg:"rgba(99,102,241,0.18)",  bottom:"8%",right:"5%",  delay:"2s" },
    { w:110, h:110, bg:"rgba(255,255,255,0.04)", top:"38%",  right:"14%", delay:"1s" },
    { w:80,  h:80,  bg:"rgba(255,255,255,0.07)", bottom:"28%",left:"9%",  delay:"3s" },
    { w:60,  h:60,  bg:"rgba(14,165,233,0.15)",  top:"60%",  left:"25%",  delay:"1.5s" },
  ];

  return (
    <div className="login-page">
      <style>{CSS}</style>
      {blobs.map((b,i) => (
        <div key={i} className="blob" style={{
          width:b.w, height:b.h, background:b.bg,
          top:b.top, left:b.left, bottom:b.bottom, right:b.right,
          animationDelay:b.delay,
        }}/>
      ))}

      <div className="login-card">
        <div className="lc-logo">
          <img className="lc-mark" src="https://i.postimg.cc/pdhvk3Q2/images.jpg" alt="SK Darau" style={{width:"54px",height:"54px",objectFit:"contain"}}/>
          <div>
            <div className="lc-name">EduDashboard</div>
            <div className="lc-school">SK Darau, Kota Kinabalu</div>
          </div>
        </div>

        {forgotMode ? (
          <>
            <div className="lc-greet">
              <h1>Lupa Kata Laluan 🔑</h1>
              <p>{resetSent
                ? "✅ Link reset telah dihantar! Semak emel (termasuk folder Spam/Junk)."
                : "Masukkan emel yang didaftarkan untuk terima link set kata laluan."}</p>
            </div>
            {err && <div className="lc-err">⚠️ {err}</div>}
            {!resetSent && (
              <>
                <div className="lc-field">
                  <label className="lc-label">Emel</label>
                  <input className="lc-input" type="email" placeholder="guru@sekolah.edu.my"
                    value={email} onChange={e=>setEmail(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&sendReset()} />
                </div>
                <button className="lc-btn" onClick={sendReset} disabled={loading}>
                  {loading ? "⏳ Menghantar..." : "Hantar Link Reset →"}
                </button>
              </>
            )}
            <button onClick={()=>{setForgotMode(false);setResetSent(false);setErr("");}}
              style={{marginTop:12,background:"none",border:"none",color:"#2563eb",cursor:"pointer",fontSize:13,fontWeight:700}}>
              ← Kembali Log Masuk
            </button>
          </>
        ) : (
          <>
            <div className="lc-greet">
              <h1>Selamat Datang! 👋</h1>
              <p>Log masuk dengan akaun sekolah anda.</p>
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
            <div style={{textAlign:"center",marginTop:10}}>
              <button onClick={()=>{setForgotMode(true);setErr("");}}
                style={{background:"none",border:"none",color:"#2563eb",cursor:"pointer",fontSize:12,fontWeight:700}}>
                Lupa kata laluan?
              </button>
            </div>
          </>
        )}

        <div className="lc-foot">SK Darau · Sistem Pengurusan Sekolah 2025</div>
        <div style={{marginTop:14,padding:"10px 14px",background:"rgba(239,246,255,0.8)",border:"1.5px solid rgba(147,197,253,0.6)",borderRadius:12,textAlign:"center"}}>
          <div style={{fontSize:10,color:"#64748b",fontWeight:900,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>Pentadbir Sistem</div>
          <div style={{fontSize:12,color:"#1d4ed8",fontWeight:900}}>En. Khairul Azwani bin Haji Ahinin</div>
          <div style={{fontSize:11,color:"#64748b",fontWeight:700}}>Guru ICT · SK Darau, Kota Kinabalu</div>
        </div>
      </div>
    </div>
  );
}

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
function WelcomeSetPassword({ onDone }) {
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr("");
    if (!pass || !pass2) { setErr("Sila isi kedua-dua medan."); return; }
    if (pass.length < 6) { setErr("Kata laluan sekurang-kurangnya 6 aksara."); return; }
    if (pass !== pass2) { setErr("Kata laluan tidak sepadan."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pass });
    if (error) {
      setErr("Gagal tetapkan kata laluan: " + error.message);
      setLoading(false);
      return;
    }
    // Session masih aktif — ambil user dan terus masuk dashboard
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const u = session.user;
      const name = u.user_metadata?.name || u.user_metadata?.full_name || u.email.split("@")[0];
      const role = u.user_metadata?.role || "Guru";
      onDone({ name, role, email: u.email });
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <style>{CSS}</style>
      {[
        { w:200, h:200, bg:"rgba(255,255,255,0.05)", top:"4%",  left:"4%",  delay:"0s" },
        { w:150, h:150, bg:"rgba(99,102,241,0.15)", bottom:"6%",right:"4%", delay:"1.5s" },
        { w:90,  h:90,  bg:"rgba(14,165,233,0.12)", top:"50%",  left:"20%", delay:"1s" },
      ].map((b,i)=>(
        <div key={i} className="blob" style={{width:b.w,height:b.h,background:b.bg,top:b.top,left:b.left,bottom:b.bottom,right:b.right,animationDelay:b.delay}}/>
      ))}
      <div className="login-card">
        <div className="lc-logo">
          <img className="lc-mark" src="https://i.postimg.cc/pdhvk3Q2/images.jpg" alt="SK Darau" style={{width:"54px",height:"54px",objectFit:"contain"}}/>
          <div>
            <div className="lc-name">EduDashboard</div>
            <div className="lc-school">SK Darau, Kota Kinabalu</div>
          </div>
        </div>
        <div className="lc-greet">
          <h1>Tetapkan Kata Laluan 🔐</h1>
          <p>Selamat datang! Sila tetapkan kata laluan anda sebelum masuk ke dashboard. Simpan kata laluan ini untuk log masuk pada masa hadapan.</p>
        </div>
        {err && <div className="lc-err">⚠️ {err}</div>}
        <div className="lc-field">
          <label className="lc-label">Kata Laluan Baru</label>
          <div className="lc-pw">
            <input className="lc-input" type={show?"text":"password"} placeholder="Min. 6 aksara"
              value={pass} onChange={e=>setPass(e.target.value)} />
            <button className="lc-pw-btn" onClick={()=>setShow(s=>!s)}>{show?"🙈":"👁️"}</button>
          </div>
        </div>
        <div className="lc-field">
          <label className="lc-label">Ulang Kata Laluan</label>
          <input className="lc-input" type="password" placeholder="Sama seperti atas"
            value={pass2} onChange={e=>setPass2(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&submit()} />
        </div>
        <button className="lc-btn" onClick={submit} disabled={loading}>
          {loading ? "⏳ Menyimpan..." : "Simpan & Masuk Dashboard →"}
        </button>
        <div className="lc-foot">SK Darau · Sistem Pengurusan Sekolah 2025</div>
      </div>
    </div>
  );
}

// ─── SUPPORT PANEL (GURU) ─────────────────────────────────────────────────────
const JENIS_OPTS = ["Masalah Teknikal / Log Masuk","Maklum Balas / Cadangan","Laporan Pepijat / Kesilapan Data","Pertanyaan Am"];
const JENIS_ICO  = { "Masalah Teknikal / Log Masuk":"🔧","Maklum Balas / Cadangan":"💡","Laporan Pepijat / Kesilapan Data":"🐛","Pertanyaan Am":"❓" };
const STATUS_CLR = { Terbuka:{bg:"#fffbeb",tc:"#92400e",br:"#fde68a"}, "Dalam Semakan":{bg:"#eff6ff",tc:"#1d4ed8",br:"#bfdbfe"}, Selesai:{bg:"#f0fdf4",tc:"#15803d",br:"#bbf7d0"} };

function SupportPanel({ user }) {
  const blankForm = { jenis: JENIS_OPTS[0], tajuk: "", mesej: "" };
  const [tab, setTab] = useState("list");
  const [tickets, setTickets] = useState([]);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("support_tickets")
      .select("*, support_replies(*)")
      .eq("guru_email", user.email)
      .order("created_at", { ascending: false });
    setTickets(data || []);
    if (active) setActive(a => (data||[]).find(t => t.id === a.id) || null);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submitTicket = async e => {
    e.preventDefault();
    if (!form.tajuk.trim() || !form.mesej.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert([{
      guru_email: user.email, guru_nama: user.name,
      jenis: form.jenis, tajuk: form.tajuk.trim(), mesej: form.mesej.trim(),
    }]);
    if (!error) { toast("Tiket dihantar! Admin akan membalas.", "success"); setForm(blankForm); setTab("list"); load(); }
    else toast("Gagal hantar tiket.", "error");
    setSubmitting(false);
  };

  const submitReply = async e => {
    e.preventDefault();
    if (!replyText.trim() || !active) return;
    setSubmitting(true);
    await supabase.from("support_replies").insert([{
      ticket_id: active.id, pengirim_email: user.email,
      pengirim_nama: user.name, is_admin: false, mesej: replyText.trim(),
    }]);
    setReplyText("");
    load();
    setSubmitting(false);
  };

  const fmt = d => d ? new Date(d).toLocaleString("ms-MY", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "";

  const S = STATUS_CLR;

  return (
    <div style={{ padding:"24px 20px", maxWidth:700, margin:"0 auto" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:22, fontWeight:900, color:"var(--text1)", marginBottom:4 }}>🆘 Bantuan & Aduan</div>
        <div style={{ fontSize:13, color:"var(--text2)" }}>Hubungi pentadbir sistem untuk bantuan atau laporan isu.</div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[["list","📋 Tiket Saya"],["new","✉️ Hantar Tiket Baru"]].map(([t,lbl])=>(
          <button key={t} onClick={()=>{setTab(t);setActive(null);}}
            style={{ padding:"8px 18px", borderRadius:20, border:"none", cursor:"pointer", fontWeight:700, fontSize:13,
              background: tab===t ? "#2563eb" : "var(--card)", color: tab===t ? "#fff" : "var(--text1)" }}>
            {lbl}
          </button>
        ))}
      </div>

      {tab==="new" && (
        <div style={{ background:"var(--card)", borderRadius:16, padding:"22px", border:"1.5px solid var(--border)" }}>
          <form onSubmit={submitTicket}>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:800, color:"var(--text2)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Jenis Aduan</label>
              <select value={form.jenis} onChange={e=>setForm(f=>({...f,jenis:e.target.value}))}
                style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:"1.5px solid var(--border)", background:"var(--bg)", color:"var(--text1)", fontSize:14 }}>
                {JENIS_OPTS.map(j=><option key={j}>{j}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:800, color:"var(--text2)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Tajuk</label>
              <input required value={form.tajuk} onChange={e=>setForm(f=>({...f,tajuk:e.target.value}))}
                placeholder="Ringkasan masalah anda..."
                style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:"1.5px solid var(--border)", background:"var(--bg)", color:"var(--text1)", fontSize:14, boxSizing:"border-box" }}/>
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:800, color:"var(--text2)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Penerangan</label>
              <textarea required rows={5} value={form.mesej} onChange={e=>setForm(f=>({...f,mesej:e.target.value}))}
                placeholder="Terangkan masalah anda dengan terperinci..."
                style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:"1.5px solid var(--border)", background:"var(--bg)", color:"var(--text1)", fontSize:14, resize:"vertical", boxSizing:"border-box" }}/>
            </div>
            <button type="submit" disabled={submitting}
              style={{ padding:"10px 24px", borderRadius:10, background:"#2563eb", color:"#fff", border:"none", fontWeight:800, fontSize:14, cursor:"pointer" }}>
              {submitting ? "⏳ Menghantar..." : "Hantar Tiket →"}
            </button>
          </form>
        </div>
      )}

      {tab==="list" && (
        loading ? <div style={{ textAlign:"center", padding:40, color:"var(--text2)" }}>⏳ Memuatkan...</div>
        : active ? (
          <div style={{ background:"var(--card)", borderRadius:16, border:"1.5px solid var(--border)", overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={()=>setActive(null)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"var(--text2)" }}>←</button>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, color:"var(--text1)", fontSize:15 }}>{active.tajuk}</div>
                <div style={{ fontSize:11, color:"var(--text2)", marginTop:2 }}>{JENIS_ICO[active.jenis]} {active.jenis} · {fmt(active.created_at)}</div>
              </div>
              <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:800,
                background:(S[active.status]||S.Terbuka).bg, color:(S[active.status]||S.Terbuka).tc,
                border:`1px solid ${(S[active.status]||S.Terbuka).br}` }}>
                {active.status}
              </span>
            </div>
            <div style={{ padding:"16px 20px", maxHeight:420, overflowY:"auto" }}>
              {/* Original message */}
              <div style={{ marginBottom:16, display:"flex", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"#2563eb", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, flexShrink:0 }}>
                  {user.name[0]}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--text1)", marginBottom:4 }}>{user.name} <span style={{ color:"var(--text3)", fontWeight:400 }}>· {fmt(active.created_at)}</span></div>
                  <div style={{ background:"var(--bg)", borderRadius:10, padding:"10px 14px", fontSize:13, lineHeight:1.7, color:"var(--text1)", whiteSpace:"pre-wrap" }}>{active.mesej}</div>
                </div>
              </div>
              {/* Replies */}
              {(active.support_replies||[]).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)).map(r=>(
                <div key={r.id} style={{ marginBottom:14, display:"flex", gap:10, flexDirection: r.is_admin?"row-reverse":"row" }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background: r.is_admin?"#6366f1":"#0ea5e9", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, flexShrink:0 }}>
                    {r.is_admin?"A":r.pengirim_nama[0]}
                  </div>
                  <div style={{ flex:1, textAlign: r.is_admin?"right":"left" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"var(--text1)", marginBottom:4 }}>
                      {r.is_admin?"✦ Admin":r.pengirim_nama} <span style={{ color:"var(--text3)", fontWeight:400 }}>· {fmt(r.created_at)}</span>
                    </div>
                    <div style={{ display:"inline-block", background: r.is_admin?"#6366f115":"var(--bg)", borderRadius:10, padding:"10px 14px", fontSize:13, lineHeight:1.7, color:"var(--text1)", border: r.is_admin?"1px solid #6366f130":"1px solid var(--border)", whiteSpace:"pre-wrap" }}>{r.mesej}</div>
                  </div>
                </div>
              ))}
            </div>
            {active.status !== "Selesai" && (
              <div style={{ padding:"14px 20px", borderTop:"1px solid var(--border)" }}>
                <form onSubmit={submitReply} style={{ display:"flex", gap:10 }}>
                  <input value={replyText} onChange={e=>setReplyText(e.target.value)}
                    placeholder="Tulis balasan..." required
                    style={{ flex:1, padding:"9px 12px", borderRadius:10, border:"1.5px solid var(--border)", background:"var(--bg)", color:"var(--text1)", fontSize:13 }}/>
                  <button type="submit" disabled={submitting}
                    style={{ padding:"9px 16px", borderRadius:10, background:"#2563eb", color:"#fff", border:"none", fontWeight:800, cursor:"pointer" }}>
                    {submitting?"⏳":"Hantar"}
                  </button>
                </form>
              </div>
            )}
            {active.status === "Selesai" && (
              <div style={{ padding:"12px 20px", borderTop:"1px solid var(--border)", textAlign:"center", fontSize:13, color:"#15803d", fontWeight:700 }}>
                ✅ Tiket ini telah diselesaikan.
              </div>
            )}
          </div>
        ) : (
          tickets.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 20px", background:"var(--card)", borderRadius:16, border:"1.5px solid var(--border)" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
              <div style={{ fontSize:15, fontWeight:700, color:"var(--text2)" }}>Tiada tiket lagi.</div>
              <div style={{ fontSize:13, color:"var(--text3)", marginTop:6 }}>Klik "Hantar Tiket Baru" untuk hubungi pentadbir.</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {tickets.map(t => (
                <button key={t.id} onClick={()=>setActive(t)}
                  style={{ width:"100%", textAlign:"left", padding:"14px 18px", background:"var(--card)", borderRadius:14,
                    border:`1.5px solid ${(S[t.status]||S.Terbuka).br}`, cursor:"pointer", transition:"box-shadow 0.15s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, color:"var(--text1)", fontSize:14, marginBottom:4 }}>
                        {JENIS_ICO[t.jenis]} {t.tajuk}
                      </div>
                      <div style={{ fontSize:12, color:"var(--text2)" }}>{t.jenis} · {fmt(t.created_at)}</div>
                      {(t.support_replies||[]).length > 0 && (
                        <div style={{ fontSize:11, color:"#6366f1", fontWeight:700, marginTop:4 }}>
                          💬 {(t.support_replies||[]).length} balasan
                        </div>
                      )}
                    </div>
                    <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:800, whiteSpace:"nowrap",
                      background:(S[t.status]||S.Terbuka).bg, color:(S[t.status]||S.Terbuka).tc,
                      border:`1px solid ${(S[t.status]||S.Terbuka).br}` }}>
                      {t.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )
        )
      )}
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
const FN_URL = import.meta.env.VITE_SUPABASE_URL + "/functions/v1/user-mgmt";

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("support_tickets")
      .select("*, support_replies(*)")
      .order("created_at", { ascending: false });
    setTickets(data || []);
    if (active) setActive(a => (data||[]).find(t => t.id === a?.id) || null);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openTicket = async (t) => {
    setActive(t);
    setReplyText("");
    if (!t.dibaca_admin) {
      await supabase.from("support_tickets").update({ dibaca_admin: true }).eq("id", t.id);
      setTickets(ts => ts.map(x => x.id === t.id ? {...x, dibaca_admin: true} : x));
    }
  };

  const sendReply = async e => {
    e.preventDefault();
    if (!replyText.trim() || !active) return;
    setSubmitting(true);
    await supabase.from("support_replies").insert([{
      ticket_id: active.id, pengirim_email: import.meta.env.VITE_ADMIN_EMAIL,
      pengirim_nama: "Admin", is_admin: true, mesej: replyText.trim(),
    }]);
    setReplyText("");
    load();
    setSubmitting(false);
  };

  const changeStatus = async (status) => {
    if (!active) return;
    await supabase.from("support_tickets").update({ status }).eq("id", active.id);
    setActive(a => ({...a, status}));
    setTickets(ts => ts.map(t => t.id === active.id ? {...t, status} : t));
    toast(`Status ditukar: ${status}`, "success");
  };

  const fmt = d => d ? new Date(d).toLocaleString("ms-MY", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "";
  const S = STATUS_CLR;
  const filtered = filterStatus === "Semua" ? tickets : tickets.filter(t => t.status === filterStatus);
  const unread = tickets.filter(t => !t.dibaca_admin).length;

  return (
    <div>
      {active ? (
        <div style={{ background:"var(--card)", borderRadius:16, border:"1.5px solid var(--border)", overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"flex-start", gap:10 }}>
            <button onClick={()=>setActive(null)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"var(--text2)", marginTop:2 }}>←</button>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, color:"var(--text1)", fontSize:15 }}>{active.tajuk}</div>
              <div style={{ fontSize:12, color:"var(--text2)", marginTop:2 }}>
                {JENIS_ICO[active.jenis]} {active.jenis} · {active.guru_nama} ({active.guru_email}) · {fmt(active.created_at)}
              </div>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {["Terbuka","Dalam Semakan","Selesai"].map(s => (
                <button key={s} onClick={()=>changeStatus(s)}
                  style={{ padding:"4px 10px", borderRadius:16, fontSize:11, fontWeight:800, cursor:"pointer",
                    background:(S[s]||S.Terbuka).bg, color:(S[s]||S.Terbuka).tc, border:`1.5px solid ${(S[s]||S.Terbuka).br}`,
                    outline: active.status===s ? `2px solid ${(S[s]||S.Terbuka).tc}` : "none" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding:"16px 20px", maxHeight:400, overflowY:"auto" }}>
            <div style={{ marginBottom:16, display:"flex", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"#0ea5e9", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, flexShrink:0 }}>
                {active.guru_nama[0]}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:700, marginBottom:4 }}>{active.guru_nama} <span style={{ color:"var(--text3)", fontWeight:400 }}>· {fmt(active.created_at)}</span></div>
                <div style={{ background:"var(--bg)", borderRadius:10, padding:"10px 14px", fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{active.mesej}</div>
              </div>
            </div>
            {(active.support_replies||[]).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)).map(r=>(
              <div key={r.id} style={{ marginBottom:14, display:"flex", gap:10, flexDirection:r.is_admin?"row-reverse":"row" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:r.is_admin?"#6366f1":"#0ea5e9", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, flexShrink:0 }}>
                  {r.is_admin?"A":r.pengirim_nama[0]}
                </div>
                <div style={{ flex:1, textAlign:r.is_admin?"right":"left" }}>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:4 }}>
                    {r.is_admin?"✦ Admin":r.pengirim_nama} <span style={{ color:"var(--text3)", fontWeight:400 }}>· {fmt(r.created_at)}</span>
                  </div>
                  <div style={{ display:"inline-block", background:r.is_admin?"#6366f115":"var(--bg)", borderRadius:10, padding:"10px 14px", fontSize:13, lineHeight:1.7, border:`1px solid ${r.is_admin?"#6366f130":"var(--border)"}`, whiteSpace:"pre-wrap" }}>{r.mesej}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding:"14px 20px", borderTop:"1px solid var(--border)" }}>
            <form onSubmit={sendReply} style={{ display:"flex", gap:10 }}>
              <input value={replyText} onChange={e=>setReplyText(e.target.value)}
                placeholder="Balas sebagai Admin..." required
                style={{ flex:1, padding:"9px 12px", borderRadius:10, border:"1.5px solid var(--border)", background:"var(--bg)", color:"var(--text1)", fontSize:13 }}/>
              <button type="submit" disabled={submitting}
                style={{ padding:"9px 16px", borderRadius:10, background:"#6366f1", color:"#fff", border:"none", fontWeight:800, cursor:"pointer" }}>
                {submitting?"⏳":"Balas"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
            {["Semua","Terbuka","Dalam Semakan","Selesai"].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)}
                style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontWeight:700, fontSize:12,
                  background: filterStatus===s ? "#2563eb" : "var(--bg)", color: filterStatus===s ? "#fff" : "var(--text2)" }}>
                {s}
              </button>
            ))}
            <div style={{ marginLeft:"auto", fontSize:12, color:"var(--text2)" }}>
              {unread > 0 && <span style={{ background:"#ef4444", color:"#fff", borderRadius:20, padding:"2px 8px", fontWeight:800, fontSize:11 }}>🔴 {unread} belum dibaca</span>}
            </div>
            <button onClick={load} style={{ background:"none", border:"1px solid var(--border)", borderRadius:8, padding:"4px 10px", fontSize:12, cursor:"pointer", color:"var(--text2)", fontWeight:700 }}>🔄</button>
          </div>
          {loading ? <div style={{ textAlign:"center", padding:40, color:"var(--text2)" }}>⏳ Memuatkan...</div>
          : filtered.length === 0 ? <div style={{ textAlign:"center", padding:40, color:"var(--text2)", fontSize:14 }}>Tiada tiket {filterStatus !== "Semua" ? `(${filterStatus})` : ""}.</div>
          : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {filtered.map(t => (
                <button key={t.id} onClick={()=>openTicket(t)}
                  style={{ width:"100%", textAlign:"left", padding:"14px 18px", background:"var(--card)", borderRadius:12,
                    border:`1.5px solid ${t.dibaca_admin ? "var(--border)" : "#fbbf24"}`,
                    cursor:"pointer", position:"relative" }}>
                  {!t.dibaca_admin && (
                    <span style={{ position:"absolute", top:10, right:12, width:8, height:8, borderRadius:"50%", background:"#ef4444", display:"block" }}/>
                  )}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, color:"var(--text1)", fontSize:14 }}>
                        {JENIS_ICO[t.jenis]} {t.tajuk}
                      </div>
                      <div style={{ fontSize:12, color:"var(--text2)", marginTop:3 }}>
                        👤 {t.guru_nama} · {t.guru_email}
                      </div>
                      <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>
                        {fmt(t.created_at)} {(t.support_replies||[]).length > 0 && `· 💬 ${(t.support_replies||[]).length} balasan`}
                      </div>
                    </div>
                    <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:800, whiteSpace:"nowrap",
                      background:(S[t.status]||S.Terbuka).bg, color:(S[t.status]||S.Terbuka).tc,
                      border:`1px solid ${(S[t.status]||S.Terbuka).br}` }}>
                      {t.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdminPanel() {
  const [panelTab, setPanelTab] = useState("akaun");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);
  const [setPwdUser, setSetPwdUser] = useState(null);
  const [newPwd, setNewPwd] = useState("");
  const [newPwdLoading, setNewPwdLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    supabase.from("support_tickets").select("id", { count:"exact" }).eq("dibaca_admin", false)
      .then(({ count }) => setUnreadCount(count || 0));
  }, []);

  const callFn = async (body) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + session.access_token,
      },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const loadUsers = async () => {
    setLoading(true);
    const data = await callFn({ action: "list" });
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const invite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setMsg(null);
    const data = await callFn({ action: "invite", email: inviteEmail, nama: inviteName.trim() });
    if (data.error) {
      setMsg({ type: "err", text: "Gagal: " + data.error });
    } else {
      setMsg({ type: "ok", text: `Jemputan dihantar ke ${inviteEmail}` });
      setInviteEmail("");
      setInviteName("");
      loadUsers();
    }
    setInviting(false);
  };

  const deleteUser = async (userId, email) => {
    const data = await callFn({ action: "delete", userId });
    if (data.error) {
      setMsg({ type: "err", text: "Gagal padam: " + data.error });
    } else {
      setMsg({ type: "ok", text: `Akaun ${email} dipadam.` });
      setUsers(u => u.filter(x => x.id !== userId));
    }
    setDelConfirm(null);
  };

  const toggleAdmin = async (u) => {
    const newRole = u.user_metadata?.role === "Admin" ? "Guru" : "Admin";
    setRoleLoading(u.id);
    const data = await callFn({ action:"setRole", userId:u.id, role:newRole });
    if (data.error) {
      setMsg({ type:"err", text:"Gagal tukar role: " + data.error });
    } else {
      setMsg({ type:"ok", text:`${u.email} kini ${newRole}.` });
      setUsers(list => list.map(x => x.id===u.id
        ? {...x, user_metadata:{...x.user_metadata, role:newRole}}
        : x));
    }
    setRoleLoading(null);
  };

  const doSetPassword = async () => {
    if (!newPwd || newPwd.length < 6) { setMsg({ type:"err", text:"Kata laluan sekurang-kurangnya 6 aksara." }); return; }
    setNewPwdLoading(true);
    const data = await callFn({ action:"setPassword", userId:setPwdUser.id, newPassword:newPwd });
    if (data.error) {
      setMsg({ type:"err", text:"Gagal: " + data.error });
    } else {
      setMsg({ type:"ok", text:`Kata laluan ${setPwdUser.email} berjaya ditetapkan.` });
      setSetPwdUser(null);
      setNewPwd("");
    }
    setNewPwdLoading(false);
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("ms-MY", { day:"2-digit", month:"short", year:"numeric" }) : "—";

  return (
    <div style={{padding:"24px 20px",maxWidth:800,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:900,color:"var(--text1)",marginBottom:4}}>⚙️ Panel Admin</div>
      </div>

      {/* Tab switcher */}
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {[["akaun","👥 Akaun Guru"],["tiket","🎫 Tiket Sokongan"]].map(([t,lbl])=>(
          <button key={t} onClick={()=>setPanelTab(t)}
            style={{padding:"9px 20px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,position:"relative",
              background:panelTab===t?"#2563eb":"var(--card)",color:panelTab===t?"#fff":"var(--text1)"}}>
            {lbl}
            {t==="tiket" && unreadCount>0 && (
              <span style={{position:"absolute",top:-4,right:-4,background:"#ef4444",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {panelTab==="tiket" && <AdminTickets />}

      {panelTab==="akaun" && <>
      {/* Invite form */}
      <div style={{background:"var(--card)",borderRadius:16,padding:"20px 22px",marginBottom:20,border:"1.5px solid var(--border)"}}>
        <div style={{fontSize:14,fontWeight:800,color:"var(--text1)",marginBottom:12}}>✉️ Jemput Guru Baru</div>
        <form onSubmit={invite}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
            <input
              required placeholder="Nama Penuh Guru"
              value={inviteName} onChange={e=>setInviteName(e.target.value)}
              style={{flex:"0 0 220px",padding:"9px 14px",borderRadius:10,border:"1.5px solid var(--border)",
                background:"var(--bg)",color:"var(--text1)",fontSize:14,outline:"none"}}
            />
            <input
              type="email" required placeholder="email@guru.com"
              value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}
              style={{flex:1,minWidth:220,padding:"9px 14px",borderRadius:10,border:"1.5px solid var(--border)",
                background:"var(--bg)",color:"var(--text1)",fontSize:14,outline:"none"}}
            />
            <button type="submit" disabled={inviting}
              style={{padding:"9px 20px",borderRadius:10,background:"#2563eb",color:"#fff",
                border:"none",fontWeight:800,fontSize:14,cursor:"pointer",whiteSpace:"nowrap"}}>
              {inviting ? "⏳ Menghantar..." : "Hantar Jemputan →"}
            </button>
          </div>
          <div style={{fontSize:11,color:"var(--text3)"}}>Guru akan terima email jemputan. Klik link → set kata laluan → terus masuk dashboard.</div>
        </form>
        {msg && (
          <div style={{marginTop:10,padding:"8px 12px",borderRadius:8,fontSize:13,fontWeight:700,
            background: msg.type==="ok" ? "#f0fdf4" : "#fef2f2",
            color: msg.type==="ok" ? "#15803d" : "#dc2626",
            border: `1px solid ${msg.type==="ok" ? "#bbf7d0" : "#fecaca"}`}}>
            {msg.type==="ok" ? "✅" : "⚠️"} {msg.text}
          </div>
        )}
      </div>

      {/* User list */}
      <div style={{background:"var(--card)",borderRadius:16,border:"1.5px solid var(--border)",overflow:"hidden"}}>
        <div style={{padding:"14px 22px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:14,fontWeight:800,color:"var(--text1)"}}>👥 Senarai Akaun ({users.length})</div>
          <button onClick={loadUsers} style={{background:"none",border:"1px solid var(--border)",borderRadius:8,
            padding:"4px 10px",fontSize:12,cursor:"pointer",color:"var(--text2)",fontWeight:700}}>
            🔄 Muat Semula
          </button>
        </div>
        {loading ? (
          <div style={{padding:40,textAlign:"center",color:"var(--text2)",fontSize:14}}>⏳ Memuatkan...</div>
        ) : users.length === 0 ? (
          <div style={{padding:40,textAlign:"center",color:"var(--text2)",fontSize:14}}>Tiada akaun.</div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"var(--bg)"}}>
                  {["Emel","Daftar","Log Masuk Terakhir","Status",""].map((h,i)=>(
                    <th key={i} style={{padding:"10px 16px",textAlign:"left",fontWeight:800,
                      color:"var(--text2)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em",
                      borderBottom:"1px solid var(--border)"}}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{borderBottom:"1px solid var(--border)"}}>
                    <td style={{padding:"11px 16px",fontWeight:700,color:"var(--text1)"}}>{u.email}</td>
                    <td style={{padding:"11px 16px",color:"var(--text2)"}}>{fmt(u.created_at)}</td>
                    <td style={{padding:"11px 16px",color:"var(--text2)"}}>{fmt(u.last_sign_in_at)}</td>
                    <td style={{padding:"11px 16px"}}>
                      {u.confirmed_at ? (
                        <span style={{background:"#f0fdf4",color:"#15803d",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:800}}>Aktif</span>
                      ) : (
                        <span style={{background:"#fffbeb",color:"#92400e",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:800}}>Jemputan Hantar</span>
                      )}
                    </td>
                    <td style={{padding:"11px 16px"}}>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {/* Toggle Admin role */}
                        {u.email !== import.meta.env.VITE_ADMIN_EMAIL && (
                          <button onClick={()=>toggleAdmin(u)} disabled={roleLoading===u.id}
                            style={{padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:800,cursor:"pointer",
                              background: u.user_metadata?.role==="Admin" ? "#fef9c3" : "#f0fdf4",
                              color: u.user_metadata?.role==="Admin" ? "#92400e" : "#15803d",
                              border: `1px solid ${u.user_metadata?.role==="Admin" ? "#fde68a" : "#bbf7d0"}`}}>
                            {roleLoading===u.id ? "⏳" : u.user_metadata?.role==="Admin" ? "⭐ Admin — Buang" : "Jadikan Admin"}
                          </button>
                        )}
                        {/* Set Password */}
                        <button onClick={()=>{setSetPwdUser(u);setNewPwd("");setDelConfirm(null);}}
                          style={{padding:"3px 10px",borderRadius:6,background:"#eff6ff",color:"#2563eb",
                            border:"1px solid #bfdbfe",fontSize:11,fontWeight:800,cursor:"pointer"}}>
                          🔑 Set Kata Laluan
                        </button>
                        {/* Delete */}
                        {delConfirm === u.id ? (
                          <>
                            <button onClick={()=>deleteUser(u.id, u.email)}
                              style={{padding:"3px 10px",borderRadius:6,background:"#ef4444",color:"#fff",
                                border:"none",fontSize:11,fontWeight:800,cursor:"pointer"}}>
                              Confirm Padam
                            </button>
                            <button onClick={()=>setDelConfirm(null)}
                              style={{padding:"3px 10px",borderRadius:6,background:"var(--bg)",color:"var(--text2)",
                                border:"1px solid var(--border)",fontSize:11,fontWeight:800,cursor:"pointer"}}>
                              Batal
                            </button>
                          </>
                        ) : (
                          <button onClick={()=>{setDelConfirm(u.id);setSetPwdUser(null);}}
                            style={{padding:"3px 10px",borderRadius:6,background:"#fef2f2",color:"#ef4444",
                              border:"1px solid #fecaca",fontSize:11,fontWeight:800,cursor:"pointer"}}>
                            🗑️ Padam
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Set Password Modal */}
      {setPwdUser && (
        <Modal title={`🔑 Tetapkan Kata Laluan`} onClose={()=>{setSetPwdUser(null);setNewPwd("");}}>
          <div style={{fontSize:13,color:"var(--text2)",marginBottom:14,padding:"8px 12px",background:"var(--bg)",borderRadius:8,border:"1px solid var(--border)"}}>
            👤 <strong>{setPwdUser.email}</strong>
          </div>
          <div className="form-field">
            <label className="form-label">Kata Laluan Baru</label>
            <input className="form-input" type="password" placeholder="Min. 6 aksara"
              value={newPwd} onChange={e=>setNewPwd(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&doSetPassword()}/>
          </div>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:12}}>
            💡 Beritahu guru kata laluan baru ini selepas simpan. Guru boleh tukar sendiri kemudian.
          </div>
          <button className="btn-add" style={{width:"100%",justifyContent:"center"}}
            onClick={doSetPassword} disabled={newPwdLoading}>
            {newPwdLoading ? "⏳ Menyimpan..." : "Simpan Kata Laluan"}
          </button>
        </Modal>
      )}
      </>}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose, exp, setExp, actMod, actSub, onNav, user, onLogout, unreadTickets }) {
  const greetings = ["Semoga hari cikgu menyeronokkan! ✨","Hebat! Cikgu dah log masuk 🎉","Selamat bertugas, Cikgu! 💪","Jom buat kerja best harini! 🚀"];
  const [g] = useState(() => greetings[Math.floor(Math.random()*greetings.length)]);
  const initials = user.name.split(" ").map(w=>w[0]).join("").slice(0,2);

  return (
    <>
      <div className={`sb-overlay${open?" open":""}`} onClick={onClose}/>
      <aside className={`sidebar${open?" open":""}`}>
        <div className="sb-top">
          <div className="sb-logo">
            <img className="sb-mark" src="https://i.postimg.cc/pdhvk3Q2/images.jpg" alt="SK Darau" style={{width:"42px",height:"42px",objectFit:"contain"}}/>
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
          {MODULES.map(m=>{
            const directNav = m.id==="ict";
            return (
              <div key={m.id}>
                <button className={`sb-btn${actMod===m.id?" act":""}`}
                  onClick={()=>{ if(directNav){onNav(m.id,null);onClose();} else setExp(p=>p===m.id?"":m.id); }}>
                  <span className="sb-ico">{m.icon}</span>
                  <span style={{flex:1}}>{m.label}</span>
                  {!directNav&&<span className={`sb-chev${exp===m.id?" open":""}`}>▶</span>}
                </button>
                {!directNav&&exp===m.id&&(
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
            );
          })}
        </nav>

        <div className="sb-foot">
          <div className="sb-user">
            <div className="sb-av">{initials}</div>
            <div>
              <div className="sb-uname">{user.name.split(" ").slice(0,2).join(" ")}</div>
              <div className="sb-urole">{user.role}</div>
            </div>
          </div>
          <button onClick={()=>{ onNav("support", null); onClose(); }}
            style={{width:"100%",marginBottom:6,padding:"8px 14px",borderRadius:10,background:"rgba(14,165,233,0.15)",
              border:"1px solid rgba(14,165,233,0.35)",color:"rgba(255,255,255,0.85)",
              cursor:"pointer",fontSize:13,fontWeight:800,textAlign:"left"}}>
            🆘 &nbsp;Bantuan &amp; Aduan
          </button>
          {user.email === import.meta.env.VITE_ADMIN_EMAIL && (
            <button onClick={()=>{ onNav("admin", null); onClose(); }}
              style={{width:"100%",marginBottom:6,padding:"8px 14px",borderRadius:10,background:"rgba(99,102,241,0.18)",
                border:"1px solid rgba(99,102,241,0.35)",color:"rgba(255,255,255,0.85)",
                cursor:"pointer",fontSize:13,fontWeight:800,textAlign:"left",position:"relative"}}>
              ⚙️ &nbsp;Panel Admin (Super)
              {unreadTickets > 0 && (
                <span style={{position:"absolute",top:6,right:10,background:"#ef4444",color:"#fff",borderRadius:"50%",
                  width:18,height:18,fontSize:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {unreadTickets}
                </span>
              )}
            </button>
          )}
          {user.role === "Admin" && user.email !== import.meta.env.VITE_ADMIN_EMAIL && (
            <div style={{width:"100%",marginBottom:6,padding:"7px 14px",borderRadius:10,
              background:"rgba(212,160,23,0.15)",border:"1px solid rgba(212,160,23,0.35)",
              color:"rgba(253,230,138,0.9)",fontSize:12,fontWeight:700,textAlign:"center"}}>
              ⭐ Admin — Boleh edit kandungan
            </div>
          )}
          <button className="sb-out" onClick={onLogout}>🚪 &nbsp;Log Keluar</button>
          <div style={{marginTop:8,padding:"9px 12px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:9.5,color:"rgba(255,255,255,0.45)",fontWeight:900,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>Pentadbir Sistem</div>
            <div style={{fontSize:11.5,color:"rgba(255,255,255,0.82)",fontWeight:900}}>En. Khairul Azwani bin Hj. Ahinin</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",fontWeight:700,marginTop:1}}>Guru ICT SK Darau</div>
          </div>
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
  const [notisFilter, setNotisFilter] = useState("Semua");
  const [notisForm, setNotisForm] = useState({ icon:"📌", teks:"", tag:"Maklumat", sasaran:"Semua" });

  const loadNotis = async () => {
    const { data } = await supabase.from('notis').select('*').order('created_at', { ascending:false });
    setNotisData(data||[]);
  };
  useEffect(() => { loadNotis(); }, []);

  const addNotis = async () => {
    if (!notisForm.teks.trim()) return;
    const tagCfg = TAG_OPTS.find(t=>t.lbl===notisForm.tag) || TAG_OPTS[2];
    const ok = await dbRun(() => supabase.from('notis').insert([{
      icon:notisForm.icon, teks:notisForm.teks, tag:notisForm.tag,
      tc:tagCfg.tc, bg:tagCfg.bg, sasaran:notisForm.sasaran
    }]));
    if (ok) { setShowAddNotis(false); setNotisForm({ icon:"📌", teks:"", tag:"Maklumat", sasaran:"Semua" }); loadNotis(); }
  };

  const delNotis = async (id) => {
    await supabase.from('notis').delete().eq('id', id);
    setNotisData(d=>d.filter(r=>r.id!==id));
  };

  // ── Kalendar ──
  const [kalendarData, setKalendarData] = useState([]);
  const [showAddKal, setShowAddKal] = useState(false);
  const [kalForm, setKalForm] = useState({ tajuk:"", tarikh:"", jenis:"Acara", nota:"" });

  const loadKalendar = async () => {
    const { data } = await supabase.from('kalendar').select('*').order('tarikh', { ascending:true });
    setKalendarData(data||[]);
  };
  useEffect(() => { loadKalendar(); }, []);

  const addKal = async () => {
    if (!kalForm.tajuk.trim() || !kalForm.tarikh) { toast("Sila isi tajuk dan tarikh."); return; }
    const ok = await dbRun(() => supabase.from('kalendar').insert([{
      tajuk:kalForm.tajuk, tarikh:kalForm.tarikh, jenis:kalForm.jenis, nota:kalForm.nota
    }]));
    if (ok) { setShowAddKal(false); setKalForm({ tajuk:"", tarikh:"", jenis:"Acara", nota:"" }); loadKalendar(); }
  };

  const delKal = async (id) => {
    await supabase.from('kalendar').delete().eq('id', id);
    setKalendarData(d=>d.filter(r=>r.id!==id));
  };

  // ── Calendar helpers ──
  const fmtKal = (s) => {
    const d = new Date(s + 'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    const diff = Math.ceil((d - today) / 86400000);
    const BULAN = ["JAN","FEB","MAR","APR","MEI","JUN","JUL","OGO","SEP","OKT","NOV","DIS"];
    return { day:d.getDate(), mon:BULAN[d.getMonth()], diff };
  };
  const cdown = (diff) => {
    if (diff < -1) return { lbl:`${Math.abs(diff)} hari lalu`, tc:"#94a3b8", bg:"#f1f5f9" };
    if (diff === -1) return { lbl:"Semalam", tc:"#94a3b8", bg:"#f1f5f9" };
    if (diff === 0)  return { lbl:"Hari ini!", tc:"#92400e", bg:"#fef9c3" };
    if (diff === 1)  return { lbl:"Esok", tc:"#b45309", bg:"#fef3c7" };
    if (diff <= 7)   return { lbl:`${diff} hari lagi`, tc:"#0077b6", bg:"#e8f4fd" };
    return { lbl:`${diff} hari lagi`, tc:"#15803d", bg:"#f0fdf4" };
  };

  const isSuperAdmin = user.email === import.meta.env.VITE_ADMIN_EMAIL;
  const isAdmin = isSuperAdmin || user.role === "Admin";

  // ── Profil Pentadbir ──
  const [pentadbirData, setPentadbirData] = useState([]);
  const [logoUrl, setLogoUrl] = useState("https://i.postimg.cc/pdhvk3Q2/images.jpg");
  const [showAddPent, setShowAddPent] = useState(false);
  const [editPent, setEditPent] = useState(null);
  const [pentForm, setPentForm] = useState({ nama:"", jawatan:"", gambar_url:"", bio:"", urutan:0 });
  const [showLogoEdit, setShowLogoEdit] = useState(false);
  const [logoInput, setLogoInput] = useState("");

  const loadPentadbir = async () => {
    const { data } = await supabase.from('pentadbir').select('*').order('urutan', { ascending:true });
    setPentadbirData(data || []);
  };
  const loadTetapan = async () => {
    const { data } = await supabase.from('tetapan').select('*');
    const logo = data?.find(r => r.kunci === 'logo_url');
    if (logo?.nilai) setLogoUrl(logo.nilai);
  };
  useEffect(() => { loadPentadbir(); loadTetapan(); }, []);

  const saveLogo = async () => {
    if (!logoInput.trim()) return;
    const ok = await dbRun(() => supabase.from('tetapan').upsert([{ kunci:'logo_url', nilai:logoInput.trim() }], { onConflict:'kunci' }));
    if (ok) { setLogoUrl(logoInput.trim()); setShowLogoEdit(false); toast("Logo dikemaskini!", "success"); }
  };

  const addPentadbir = async () => {
    if (!pentForm.nama.trim() || !pentForm.jawatan.trim()) { toast("Sila isi nama dan jawatan."); return; }
    const ok = await dbRun(() => supabase.from('pentadbir').insert([{ ...pentForm }]));
    if (ok) { setShowAddPent(false); setPentForm({ nama:"", jawatan:"", gambar_url:"", bio:"", urutan:0 }); loadPentadbir(); toast("Pentadbir ditambah!", "success"); }
  };

  const updatePentadbir = async () => {
    if (!pentForm.nama.trim() || !pentForm.jawatan.trim()) { toast("Sila isi nama dan jawatan."); return; }
    const ok = await dbRun(() => supabase.from('pentadbir').update({ ...pentForm }).eq('id', editPent.id));
    if (ok) { setEditPent(null); setPentForm({ nama:"", jawatan:"", gambar_url:"", bio:"", urutan:0 }); loadPentadbir(); toast("Maklumat dikemaskini!", "success"); }
  };

  const delPentadbir = async (id) => {
    await supabase.from('pentadbir').delete().eq('id', id);
    setPentadbirData(d => d.filter(r => r.id !== id));
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
        <div className="hero-glow" style={{width:320,height:320,top:-120,right:-80,background:"#3b82f6",animationDelay:"0s"}}/>
        <div className="hero-glow" style={{width:220,height:220,bottom:-70,left:40,background:"#6366f1",animationDelay:"2.2s"}}/>
        <div className="hero-glow" style={{width:160,height:160,top:20,left:"35%",background:"#06b6d4",animationDelay:"1.1s"}}/>
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
                <div className="hero-tag">🏫 SK Darau</div>
              </div>
            </div>
            <img className="hero-emoji" src="https://i.postimg.cc/pdhvk3Q2/images.jpg" alt="SK Darau" style={{width:"90px",height:"90px",objectFit:"contain",borderRadius:"20px"}}/>
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
            <span className="bento-ico">{s.ico}</span>
            <div className="bento-val"><Count to={s.val} suffix={s.suffix||""}/></div>
            <div className="bento-lbl">{s.lbl}</div>
          </div>
        ))}
        {/* Admin info card */}
        <div className="bento-card" style={{animationDelay:"0.32s",background:"linear-gradient(135deg,rgba(239,246,255,0.95) 0%,rgba(224,242,254,0.92) 100%)",border:"1.5px solid rgba(147,197,253,0.6)",display:"flex",flexDirection:"column",justifyContent:"center",gap:4}}>
          <div className="bento-bg-circle" style={{background:"#0ea5e9"}}/>
          <span style={{fontSize:28,marginBottom:6}}>👨‍💼</span>
          <div style={{fontSize:11,fontWeight:900,color:"#64748b",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>Pentadbir Sistem</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:13.5,color:"#1d4ed8",lineHeight:1.3}}>En. Khairul Azwani<br/>bin Haji Ahinin</div>
          <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginTop:3}}>Guru ICT · SK Darau</div>
        </div>
      </div>

      {/* ── Makluman ── */}
      <div className="sec-hd">
        <div className="sec-title">📢 Makluman Sekolah</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span className="sec-sub">{notisData.length} item</span>
          <button className="btn-add" onClick={()=>setShowAddNotis(true)}>+ Tambah</button>
        </div>
      </div>

      {/* Audience filter tabs */}
      <div className="mak-tabs">
        {SASARAN_OPTS.map(s=>{
          const cnt = s.lbl==="Semua" ? notisData.length : notisData.filter(n=>(n.sasaran||"Semua")===s.lbl).length;
          return (
            <button key={s.lbl} className={`mak-tab${notisFilter===s.lbl?" act":""}`}
              onClick={()=>setNotisFilter(s.lbl)}>
              {s.ico} {s.lbl} <span className="mak-cnt">{cnt}</span>
            </button>
          );
        })}
      </div>

      <div className="updates" style={{marginBottom:8}}>
        {(() => {
          const filtered = notisFilter==="Semua" ? notisData : notisData.filter(n=>(n.sasaran||"Semua")===notisFilter);
          if (filtered.length===0) return (
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"28px",color:"var(--text3)",fontWeight:700,fontSize:14}}>
              {notisFilter==="Semua" ? "Tiada makluman. Tambah yang pertama!" : `Tiada makluman untuk ${notisFilter}.`}
            </div>
          );
          return filtered.map((u,i)=>{
            const sas = SASARAN_OPTS.find(s=>s.lbl===(u.sasaran||"Semua")) || SASARAN_OPTS[0];
            return (
              <div className="upd-card" key={u.id} style={{animationDelay:`${i*0.07}s`}}>
                <div className="upd-ico" style={{background:u.bg}}>{u.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="upd-text">{u.teks}</div>
                  <div style={{marginTop:5,display:"flex",gap:5,flexWrap:"wrap"}}>
                    <span className="mak-sasaran" style={{color:sas.tc,borderColor:sas.tc,background:sas.bg}}>{sas.ico} {sas.lbl}</span>
                    <span className="upd-tag" style={{background:u.bg,color:u.tc}}>{u.tag}</span>
                  </div>
                </div>
                <button onClick={()=>delNotis(u.id)} style={{marginLeft:8,background:"none",border:"none",cursor:"pointer",fontSize:15,opacity:0.45,lineHeight:1,flexShrink:0}} title="Padam">🗑️</button>
              </div>
            );
          });
        })()}
      </div>

      {showAddNotis && (
        <Modal title="Tambah Makluman" onClose={()=>setShowAddNotis(false)}>
          <div className="form-field">
            <label className="form-label">Ikon</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {NOTIS_ICONS.map(ic=>(
                <button key={ic} onClick={()=>setNotisForm(f=>({...f,icon:ic}))}
                  style={{fontSize:20,background:notisForm.icon===ic?"var(--accent-lt)":"var(--surface)",border:`2px solid ${notisForm.icon===ic?"var(--accent)":"var(--border)"}`,borderRadius:8,padding:"4px 8px",cursor:"pointer"}}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Teks Makluman</label>
            <input className="form-input" placeholder="cth: Mesyuarat PKG Jumaat ini 2PM di Bilik Guru" value={notisForm.teks} onChange={e=>setNotisForm(f=>({...f,teks:e.target.value}))}/>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Sasaran</label>
              <select className="form-input" value={notisForm.sasaran} onChange={e=>setNotisForm(f=>({...f,sasaran:e.target.value}))}>
                {SASARAN_OPTS.map(s=><option key={s.lbl}>{s.lbl}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Keutamaan</label>
              <select className="form-input" value={notisForm.tag} onChange={e=>setNotisForm(f=>({...f,tag:e.target.value}))}>
                {TAG_OPTS.map(t=><option key={t.lbl}>{t.lbl}</option>)}
              </select>
            </div>
          </div>
          <button className="btn-add" style={{width:"100%",justifyContent:"center"}} onClick={addNotis}>Simpan Makluman</button>
        </Modal>
      )}

      {/* ── Kalendar Sekolah ── */}
      <div className="sec-hd" style={{marginTop:22}}>
        <div className="sec-title">📅 Kalendar Sekolah</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span className="sec-sub">{kalendarData.length} acara</span>
          <button className="btn-add" onClick={()=>setShowAddKal(true)}>+ Tambah</button>
        </div>
      </div>

      <div className="kal-list">
        {kalendarData.length===0 && (
          <div style={{gridColumn:"1/-1",textAlign:"center",padding:"28px",color:"var(--text3)",fontWeight:700,fontSize:14}}>
            Tiada acara. Tambah tarikh penting sekolah!
          </div>
        )}
        {kalendarData.map((k,i)=>{
          const { day, mon, diff } = fmtKal(k.tarikh);
          const cd = cdown(diff);
          const jn = JENIS_HAL.find(j=>j.lbl===k.jenis)||JENIS_HAL[4];
          return (
            <div className={`kal-card${diff<0?" kal-past":""}`} key={k.id} style={{animationDelay:`${i*0.06}s`}}>
              <div className="kal-date-box" style={diff<0?{background:"var(--text3)"}:{}}>
                <div className="kal-date-day">{day}</div>
                <div className="kal-date-mon">{mon}</div>
              </div>
              <div className="kal-body">
                <div className="kal-tajuk">{k.tajuk}</div>
                {k.nota && <div className="kal-nota">{k.nota}</div>}
                <div className="kal-badges">
                  <span className="kal-jenis" style={{color:jn.tc,background:jn.bg,borderColor:jn.tc}}>{k.jenis}</span>
                  <span className="kal-countdown" style={{color:cd.tc,background:cd.bg,borderColor:cd.tc}}>{cd.lbl}</span>
                </div>
              </div>
              <button onClick={()=>delKal(k.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:15,opacity:0.4,flexShrink:0}} title="Padam">🗑️</button>
            </div>
          );
        })}
      </div>

      {showAddKal && (
        <Modal title="Tambah Tarikh Penting" onClose={()=>setShowAddKal(false)}>
          <div className="form-field">
            <label className="form-label">Tajuk Acara</label>
            <input className="form-input" placeholder="cth: Sambutan Hari Guru 2025" value={kalForm.tajuk} onChange={e=>setKalForm(f=>({...f,tajuk:e.target.value}))}/>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Tarikh</label>
              <input className="form-input" type="date" value={kalForm.tarikh} onChange={e=>setKalForm(f=>({...f,tarikh:e.target.value}))}/>
            </div>
            <div className="form-field">
              <label className="form-label">Jenis</label>
              <select className="form-input" value={kalForm.jenis} onChange={e=>setKalForm(f=>({...f,jenis:e.target.value}))}>
                {JENIS_HAL.map(j=><option key={j.lbl}>{j.lbl}</option>)}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Nota (pilihan)</label>
            <input className="form-input" placeholder="cth: Dewan Sekolah · 8:00 pagi · Semua guru" value={kalForm.nota} onChange={e=>setKalForm(f=>({...f,nota:e.target.value}))}/>
          </div>
          <button className="btn-add" style={{width:"100%",justifyContent:"center"}} onClick={addKal}>Simpan Tarikh</button>
        </Modal>
      )}

      {/* ── Profil Pentadbir Sekolah ── */}
      <div className="sec-hd" style={{marginTop:22}}>
        <div className="sec-title">🏫 Profil Pentadbir Sekolah</div>
        {isAdmin && (
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button className="btn-add" onClick={()=>setShowAddPent(true)}>+ Tambah</button>
          </div>
        )}
      </div>

      {/* Logo + nama sekolah */}
      <div className="profil-logo-wrap">
        <div className="profil-logo-box">
          <img src={logoUrl} alt="Logo SK Darau" className="profil-logo-img"
            onError={e=>{e.target.style.display='none';}}/>
          <div>
            <div className="profil-nama-sek">Sekolah Kebangsaan Darau</div>
            <div className="profil-alamat-sek">Kota Kinabalu, Sabah, Malaysia</div>
          </div>
        </div>
        {isAdmin && (
          <button className="btn-sm-ghost" onClick={()=>{setLogoInput(logoUrl);setShowLogoEdit(true);}}>✏️ Tukar Logo</button>
        )}
      </div>

      {/* Pentadbir cards */}
      <div className="pent-grid">
        {pentadbirData.length===0 ? (
          <div style={{gridColumn:"1/-1",textAlign:"center",padding:"28px",color:"var(--text3)",fontWeight:700,fontSize:14}}>
            {isAdmin ? "Tiada pentadbir. Klik '+ Tambah' untuk mula!" : "Tiada maklumat pentadbir."}
          </div>
        ) : pentadbirData.map((p,i)=>(
          <div className="pent-card" key={p.id} style={{animationDelay:`${i*0.08}s`}}>
            {isAdmin && (
              <div className="pent-actions">
                <button className="btn-icon-sm" title="Edit"
                  onClick={()=>{setEditPent(p);setPentForm({nama:p.nama,jawatan:p.jawatan,gambar_url:p.gambar_url||"",bio:p.bio||"",urutan:p.urutan||0});}}>✏️</button>
                <button className="btn-icon-sm btn-icon-del" title="Padam"
                  onClick={()=>delPentadbir(p.id)}>🗑️</button>
              </div>
            )}
            <div className="pent-foto-wrap">
              {p.gambar_url
                ? <img src={p.gambar_url} alt={p.nama} className="pent-foto" onError={e=>{e.target.style.display='none';}}/>
                : <div className="pent-foto pent-foto-ph">{p.nama.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
              }
            </div>
            <div className="pent-info">
              <div className="pent-nama">{p.nama}</div>
              <div className="pent-jawatan">{p.jawatan}</div>
              {p.bio && <div className="pent-bio">{p.bio}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Pentadbir Modal */}
      {(showAddPent || editPent) && (
        <Modal
          title={editPent ? "Kemaskini Pentadbir" : "Tambah Pentadbir"}
          onClose={()=>{setShowAddPent(false);setEditPent(null);setPentForm({nama:"",jawatan:"",gambar_url:"",bio:"",urutan:0});}}>
          <div className="form-field">
            <label className="form-label">Nama Penuh</label>
            <input className="form-input" placeholder="cth: En. Ahmad bin Ali" value={pentForm.nama}
              onChange={e=>setPentForm(f=>({...f,nama:e.target.value}))}/>
          </div>
          <div className="form-field">
            <label className="form-label">Jawatan</label>
            <input className="form-input" placeholder="cth: Guru Besar" value={pentForm.jawatan}
              onChange={e=>setPentForm(f=>({...f,jawatan:e.target.value}))}/>
          </div>
          <div className="form-field">
            <label className="form-label">URL Gambar (pilihan)</label>
            <input className="form-input" placeholder="https://..." value={pentForm.gambar_url}
              onChange={e=>setPentForm(f=>({...f,gambar_url:e.target.value}))}/>
          </div>
          {pentForm.gambar_url && (
            <img src={pentForm.gambar_url} alt="Preview"
              style={{width:72,height:72,objectFit:"cover",borderRadius:"50%",margin:"4px auto 8px",display:"block",border:"2px solid var(--border)"}}
              onError={e=>{e.target.style.display='none';}}/>
          )}
          <div className="form-field">
            <label className="form-label">Bio Ringkas (pilihan)</label>
            <input className="form-input" placeholder="cth: 15 tahun pengalaman dalam pendidikan"
              value={pentForm.bio} onChange={e=>setPentForm(f=>({...f,bio:e.target.value}))}/>
          </div>
          <div className="form-field">
            <label className="form-label">Susunan (nombor — 1 = pertama)</label>
            <input className="form-input" type="number" min="0" value={pentForm.urutan}
              onChange={e=>setPentForm(f=>({...f,urutan:+e.target.value}))}/>
          </div>
          <button className="btn-add" style={{width:"100%",justifyContent:"center"}}
            onClick={editPent ? updatePentadbir : addPentadbir}>
            {editPent ? "Kemaskini" : "Simpan Pentadbir"}
          </button>
        </Modal>
      )}

      {/* Logo Edit Modal */}
      {showLogoEdit && (
        <Modal title="Tukar Logo Sekolah" onClose={()=>setShowLogoEdit(false)}>
          <div className="form-field">
            <label className="form-label">URL Logo Sekolah</label>
            <input className="form-input" placeholder="https://..." value={logoInput}
              onChange={e=>setLogoInput(e.target.value)}/>
          </div>
          {logoInput && (
            <img src={logoInput} alt="Preview Logo"
              style={{width:80,height:80,objectFit:"contain",borderRadius:12,margin:"8px auto",display:"block",border:"2px solid var(--border)",background:"white"}}
              onError={e=>{e.target.style.display='none';}}/>
          )}
          <button className="btn-add" style={{width:"100%",justifyContent:"center"}} onClick={saveLogo}>Simpan Logo</button>
        </Modal>
      )}

      {/* Modules */}
      <div className="sec-hd">
        <div className="sec-title">📦 Modul Sekolah</div>
        <span className="sec-sub">6 modul · 36 sub-modul</span>
      </div>
      <div className="mods-grid">
        {MODULES.map((m,i)=>(
          <div className="mc" key={m.id} onClick={()=>onNav(m.id,m.ids[0])} style={{animationDelay:`${i*0.07}s`,background:`linear-gradient(145deg,rgba(255,255,255,0.85) 0%,${m.light} 100%)`}}>
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
  const [subtab, setSubtab] = useState(0);
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kelas, setKelas] = useState("Tahun 1 Unik");
  const [q, setQ] = useState("");
  const [editCell, setEditCell] = useState(null);
  const [selGuru, setSelGuru] = useState("");

  const [guruList, setGuruList] = useState([]);
  const [showAddGuru, setShowAddGuru] = useState(false);
  const [editGuru, setEditGuru] = useState(null);
  const blankGuru = { nama:"", gred_jawatan:"", mata_pelajaran:"", kelas_mengajar:"", status:"Aktif" };
  const [formGuru, setFormGuru] = useState(blankGuru);

  const loadKelas = async (k) => {
    const { data } = await supabase.from('jadual_waktu').select('*').eq('kelas', k||kelas);
    setRows(data||[]);
  };
  const loadAll = async () => {
    setLoading(true);
    const [r1, r2, r3] = await Promise.all([
      supabase.from('jadual_waktu').select('*').eq('kelas', kelas),
      supabase.from('jadual_waktu').select('*'),
      supabase.from('jadual_guru').select('*').order('nama'),
    ]);
    setRows(r1.data||[]); setAllRows(r2.data||[]); setGuruList(r3.data||[]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadKelas(); }, [kelas]);

  const buildGrid = (source, byKelas) => WAKTU_SLOTS.map((_,ri) => {
    if (ri === 5) return null;
    return HARI.map(h => {
      const c = source.find(r => r.waktu_slot===ri && r.hari===h);
      return c ? (byKelas ? { s:c.subjek, g:c.guru, id:c.id } : { s:c.subjek, k:c.kelas, id:c.id }) : null;
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
    const [r1, r2] = await Promise.all([
      supabase.from('jadual_waktu').select('*').eq('kelas', kelas),
      supabase.from('jadual_waktu').select('*'),
    ]);
    setRows(r1.data||[]); setAllRows(r2.data||[]);
  };

  const handleDelCell = async () => {
    if (!editCell?.id) return;
    const ok = await dbRun(() => supabase.from('jadual_waktu').delete().eq('id', editCell.id));
    if (!ok) return;
    setEditCell(null);
    const [r1, r2] = await Promise.all([
      supabase.from('jadual_waktu').select('*').eq('kelas', kelas),
      supabase.from('jadual_waktu').select('*'),
    ]);
    setRows(r1.data||[]); setAllRows(r2.data||[]);
  };

  const addGuru = async e => { e.preventDefault(); const ok=await dbRun(()=>supabase.from('jadual_guru').insert([formGuru])); if(!ok)return; toast("Guru ditambah!","success"); setShowAddGuru(false); const {data}=await supabase.from('jadual_guru').select('*').order('nama'); setGuruList(data||[]); };
  const updGuru = async e => { e.preventDefault(); const {nama,gred_jawatan,mata_pelajaran,kelas_mengajar,status}=editGuru; const ok=await dbRun(()=>supabase.from('jadual_guru').update({nama,gred_jawatan,mata_pelajaran,kelas_mengajar,status}).eq('id',editGuru.id)); if(!ok)return; toast("Dikemaskini!","success"); setEditGuru(null); const {data}=await supabase.from('jadual_guru').select('*').order('nama'); setGuruList(data||[]); };
  const delGuru = async id => { const ok=await dbRun(()=>supabase.from('jadual_guru').delete().eq('id',id)); if(ok)setGuruList(d=>d.filter(r=>r.id!==id)); };

  const uniqueGurus = [...new Set(allRows.map(r=>r.guru).filter(Boolean))].sort();
  const guruRows = selGuru ? allRows.filter(r=>r.guru===selGuru) : [];

  const bebanData = uniqueGurus.map(g => {
    const gRows = allRows.filter(r=>r.guru===g);
    return { guru:g, periods:gRows.length, subjects:[...new Set(gRows.map(r=>r.subjek))], kelasList:[...new Set(gRows.map(r=>r.kelas))] };
  }).sort((a,b)=>b.periods-a.periods);
  const maxPeriods = bebanData[0]?.periods || 1;

  const konflik = [];
  const groupKey = {};
  allRows.forEach(r => {
    if(!r.guru) return;
    const key = `${r.guru}|${r.hari}|${r.waktu_slot}`;
    if(!groupKey[key]) groupKey[key]=[];
    groupKey[key].push(r);
  });
  Object.values(groupKey).forEach(grp => { if(grp.length>1) konflik.push(grp); });

  const tabSty = i => ({
    padding:"7px 14px", borderRadius:12,
    border:`1.5px solid ${subtab===i?'#2563eb':'var(--border)'}`,
    background:subtab===i?'#2563eb':'var(--surface)',
    color:subtab===i?'white':'var(--text2)',
    fontSize:12, fontWeight:800, fontFamily:"'Inter',sans-serif",
    cursor:'pointer', transition:'all 0.15s'
  });

  const grid = buildGrid(rows, true);
  const guruGrid = buildGrid(guruRows, false);
  const search = q.toLowerCase().trim();
  const matchCell = (cell) => !search||!cell ? null : cell.s?.toLowerCase().includes(search)||cell.g?.toLowerCase().includes(search);

  const statsCards = [
    {ico:"🏫",val:KELAS_LIST.length,lbl:"Jumlah Kelas"},
    {ico:"📚",val:[...new Set(allRows.map(r=>r.subjek))].length,lbl:"Mata Pelajaran"},
    {ico:"👩‍🏫",val:uniqueGurus.length,lbl:"Guru Mengajar"},
    {ico:"⚠️",val:konflik.length,lbl:konflik.length?"Konflik!":"Tiada Konflik"},
  ];

  return (
    <KurPage title="Jadual Waktu" sub="Kurikulum · SK Darau, Kota Kinabalu" stats={statsCards}>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
        {['📅 Jadual Kelas','👩‍🏫 Jadual Guru','📊 Beban Tugas','👥 Senarai Guru','⚠️ Semakan Konflik'].map((t,i)=>(
          <button key={i} style={tabSty(i)} onClick={()=>setSubtab(i)}>{t}</button>
        ))}
      </div>

      {loading?<div className="loading">⏳ Memuatkan jadual…</div>:(<>

        {/* ── TAB 0: JADUAL KELAS ── */}
        {subtab===0&&(
          <div>
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
          </div>
        )}

        {/* ── TAB 1: JADUAL GURU ── */}
        {subtab===1&&(
          <div>
            <div className="kur-header" style={{marginBottom:14}}>
              <select className="kur-select" value={selGuru} onChange={e=>setSelGuru(e.target.value)}>
                <option value="">— Pilih Guru —</option>
                {uniqueGurus.map(g=><option key={g}>{g}</option>)}
              </select>
              {selGuru&&<span style={{fontSize:12,color:'var(--text3)',fontWeight:800,padding:'6px 0'}}>{guruRows.length} waktu / minggu</span>}
            </div>
            {!selGuru?(
              <div style={{textAlign:'center',color:'var(--text3)',padding:40,fontSize:14,fontWeight:800}}>☝️ Pilih guru untuk lihat jadual mingguan</div>
            ):(
              <div className="jadual-wrap">
                <table className="jadual-table">
                  <thead><tr><th>Waktu</th>{HARI.map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {WAKTU_SLOTS.map((waktu,ri) => {
                      const row = guruGrid[ri];
                      if (!row) return <tr key={ri} className="jadual-rehat"><td colSpan={6} style={{textAlign:"center"}}>— Rehat —</td></tr>;
                      return (
                        <tr key={ri}>
                          <td>{waktu}</td>
                          {row.map((cell,ci) => {
                            const cfg = SC[cell?.s] || {c:"#94a3b8",bg:"var(--accent-lt)",i:"📚"};
                            return (
                              <td key={ci}>
                                <div className="jadual-cell" style={{background:cell?cfg.bg:'transparent',opacity:cell?1:0.25,cursor:'default'}}>
                                  {cell&&<><span className="jadual-cell-sub" style={{color:cfg.c}}>{cfg.i} {cell.s}</span><span className="jadual-cell-guru">{cell.k}</span></>}
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
          </div>
        )}

        {/* ── TAB 2: BEBAN TUGAS ── */}
        {subtab===2&&(
          <div>
            <div style={{fontSize:12,color:'var(--text3)',fontWeight:800,marginBottom:12}}>Jumlah waktu mengajar setiap guru — semua kelas digabung</div>
            {bebanData.length===0&&<div style={{textAlign:'center',color:'var(--text3)',padding:40,fontWeight:800}}>Tiada data. Isi jadual kelas dahulu.</div>}
            <div className="kur-table-wrap">
              <table className="kur-table">
                <thead><tr><th>#</th><th>Nama Guru</th><th>Waktu / Minggu</th><th>Mata Pelajaran</th><th>Kelas</th></tr></thead>
                <tbody>
                  {bebanData.map((b,i)=>(
                    <tr key={b.guru}>
                      <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                      <td style={{fontWeight:800}}>{b.guru}</td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{flex:1,height:10,borderRadius:6,background:'var(--accent-lt)',overflow:'hidden'}}>
                            <div style={{height:'100%',borderRadius:6,background:'#2563eb',width:`${(b.periods/maxPeriods)*100}%`,transition:'width 0.3s'}}/>
                          </div>
                          <span style={{fontWeight:900,color:'#2563eb',minWidth:24}}>{b.periods}</span>
                        </div>
                      </td>
                      <td style={{fontSize:11}}>{b.subjects.join(' · ')||'—'}</td>
                      <td><span style={{fontSize:11,fontWeight:800,color:'var(--text3)'}}>{b.kelasList.length} kelas</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: SENARAI GURU ── */}
        {subtab===3&&(
          <div>
            <div className="kur-header" style={{marginBottom:10}}>
              <button className="btn-add" onClick={()=>{setFormGuru(blankGuru);setShowAddGuru(true);}}>+ Tambah Guru</button>
              <span style={{fontSize:12,color:'var(--text3)',fontWeight:800,padding:'6px 0'}}>{guruList.length} guru berdaftar</span>
            </div>
            <div className="kur-table-wrap">
              <table className="kur-table">
                <thead><tr><th>#</th><th>Nama Guru</th><th>Gred Jawatan</th><th>Mata Pelajaran</th><th>Kelas Mengajar</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {guruList.length===0&&<tr><td colSpan={7} style={{textAlign:'center',color:'var(--text3)',padding:28}}>Tiada guru. Tambah guru — nama akan tersedia dalam dropdown jadual.</td></tr>}
                  {guruList.map((g,i)=>(
                    <tr key={g.id}>
                      <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                      <td style={{fontWeight:800}}>{g.nama}</td>
                      <td style={{fontSize:12}}>{g.gred_jawatan||'—'}</td>
                      <td style={{fontSize:12}}>{g.mata_pelajaran||'—'}</td>
                      <td style={{fontSize:12,color:'var(--text3)'}}>{g.kelas_mengajar||'—'}</td>
                      <td><span className={`badge ${g.status==='Aktif'?'b-green':'b-gray'}`}>{g.status}</span></td>
                      <td style={{display:'flex',gap:4}}>
                        <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditGuru({...g})}>✏️</button>
                        <button className="btn-del" onClick={()=>delGuru(g.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: SEMAKAN KONFLIK ── */}
        {subtab===4&&(
          <div>
            {konflik.length===0?(
              <div style={{textAlign:'center',padding:48}}>
                <div style={{fontSize:40,marginBottom:10}}>✅</div>
                <div style={{fontWeight:900,fontSize:16,color:'#16a34a',marginBottom:4}}>Tiada Konflik Jadual</div>
                <div style={{fontSize:12,color:'var(--text3)'}}>Semua guru ditetapkan di satu kelas sahaja bagi setiap slot waktu.</div>
              </div>
            ):(
              <>
                <div style={{background:'#fef2f2',border:'2px solid #fca5a5',borderRadius:12,padding:'10px 16px',marginBottom:14,fontWeight:800,fontSize:13,color:'#dc2626'}}>
                  ⚠️ {konflik.length} konflik ditemui — guru ditetapkan di 2 kelas pada masa yang sama
                </div>
                <div className="kur-table-wrap">
                  <table className="kur-table">
                    <thead><tr><th>#</th><th>Guru</th><th>Hari</th><th>Waktu</th><th>Kelas Bercanggah</th></tr></thead>
                    <tbody>
                      {konflik.map((grp,i)=>(
                        <tr key={i} style={{background:'#fef2f2'}}>
                          <td style={{color:'#dc2626',fontWeight:800}}>{i+1}</td>
                          <td style={{fontWeight:800}}>{grp[0].guru}</td>
                          <td>{grp[0].hari}</td>
                          <td style={{fontSize:12}}>{WAKTU_SLOTS[grp[0].waktu_slot]}</td>
                          <td>{grp.map(r=>`${r.kelas} (${r.subjek})`).join(' ⚡ ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </>)}

      {/* ── MODAL: Edit Cell ── */}
      {editCell&&(
        <Modal title={`Edit — ${editCell.hari}, ${WAKTU_SLOTS[editCell.ri]}`} onClose={()=>setEditCell(null)}>
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
              <select className="form-input" value={editCell.guru} onChange={e=>setEditCell(c=>({...c,guru:e.target.value}))}>
                <option value="">-- Pilih Guru --</option>
                {guruList.map(g=><option key={g.id}>{g.nama}</option>)}
                {editCell.guru&&!guruList.find(g=>g.nama===editCell.guru)&&<option value={editCell.guru}>{editCell.guru} (tidak dalam senarai)</option>}
              </select>
            </div>
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button className="btn-primary" type="submit" style={{flex:1}}>💾 Simpan</button>
              {editCell.id&&<button type="button" className="btn-del" style={{padding:"8px 16px"}} onClick={handleDelCell}>🗑 Padam</button>}
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: Tambah Guru ── */}
      {showAddGuru&&<Modal title="Tambah Guru" onClose={()=>setShowAddGuru(false)}><form onSubmit={addGuru}>
        <div className="form-field"><label className="form-label">Nama Penuh</label><input className="form-input" required value={formGuru.nama} onChange={e=>setFormGuru(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Gred Jawatan</label><input className="form-input" placeholder="cth: DG41, DG44" value={formGuru.gred_jawatan} onChange={e=>setFormGuru(f=>({...f,gred_jawatan:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Mata Pelajaran</label><input className="form-input" placeholder="cth: BM, Math, BI" value={formGuru.mata_pelajaran} onChange={e=>setFormGuru(f=>({...f,mata_pelajaran:e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Kelas Mengajar</label><input className="form-input" placeholder="cth: 4 Unik, 5 Aspirasi, 6 Dedikasi" value={formGuru.kelas_mengajar} onChange={e=>setFormGuru(f=>({...f,kelas_mengajar:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}

      {/* ── MODAL: Edit Guru ── */}
      {editGuru&&<Modal title={`Edit — ${editGuru.nama}`} onClose={()=>setEditGuru(null)}><form onSubmit={updGuru}>
        <div className="form-field"><label className="form-label">Nama Penuh</label><input className="form-input" required value={editGuru.nama} onChange={e=>setEditGuru(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Gred Jawatan</label><input className="form-input" value={editGuru.gred_jawatan} onChange={e=>setEditGuru(f=>({...f,gred_jawatan:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Mata Pelajaran</label><input className="form-input" value={editGuru.mata_pelajaran} onChange={e=>setEditGuru(f=>({...f,mata_pelajaran:e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Kelas Mengajar</label><input className="form-input" value={editGuru.kelas_mengajar} onChange={e=>setEditGuru(f=>({...f,kelas_mengajar:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Status</label>
          <select className="form-input" value={editGuru.status} onChange={e=>setEditGuru(f=>({...f,status:e.target.value}))}>
            <option>Aktif</option><option>Tidak Aktif</option>
          </select>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

// ─── 2. PANITIA MATA PELAJARAN ────────────────────────────────────────────────
function PanitiaMP() {
  const [subtab, setSubtab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [panitia, setPanitia] = useState([]);
  const [ahli, setAhli] = useState([]);
  const [mesyuarat, setMesyuarat] = useState([]);
  const [program, setProgram] = useState([]);
  const [analisis, setAnalisis] = useState([]);
  const [peperiksaanList, setPeperiksaanList] = useState([]);
  const [laporan, setLaporan] = useState([]);
  const [selId, setSelId] = useState(null);

  const [showAddPanitia, setShowAddPanitia] = useState(false);
  const [editPanitia, setEditPanitia] = useState(null);
  const [showAddAhli, setShowAddAhli] = useState(false);
  const [editAhli, setEditAhli] = useState(null);
  const [showAddMesy, setShowAddMesy] = useState(false);
  const [editMesy, setEditMesy] = useState(null);
  const [showAddProg, setShowAddProg] = useState(false);
  const [editProg, setEditProg] = useState(null);
  const [showAddAnal, setShowAddAnal] = useState(false);
  const [editAnal, setEditAnal] = useState(null);
  const [showAddLap, setShowAddLap] = useState(false);
  const [editLap, setEditLap] = useState(null);

  const blankPanitia = { subjek:"", icon:"📋", color:"#2563eb", bg:"#eff6ff", ketua:"", status:"Aktif" };
  const blankAhli    = { nama_guru:"", peranan:"Ahli", kelas_ajar:"", status:"Aktif" };
  const blankMesy    = { tarikh:"", masa:"", tempat:"", agenda:"", minit:"", status:"Akan Datang" };
  const blankProg    = { nama:"", jenis:"Pemulihan", tarikh_mula:"", tarikh_tamat:"", sasaran:"", status:"Rancangan", catatan:"" };
  const blankAnal    = { peperiksaan_id:"", bil_murid:0, min_markah:0, peratus_lulus:0, peratus_cemerlang:0, catatan:"" };
  const blankLap     = { tajuk:"", jenis:"Tahunan", tarikh:"", status:"Draf", kandungan:"" };

  const [formPanitia, setFormPanitia] = useState(blankPanitia);
  const [formAhli,    setFormAhli]    = useState(blankAhli);
  const [formMesy,    setFormMesy]    = useState(blankMesy);
  const [formProg,    setFormProg]    = useState(blankProg);
  const [formAnal,    setFormAnal]    = useState(blankAnal);
  const [formLap,     setFormLap]     = useState(blankLap);

  const selPanitia = panitia.find(p=>p.id===selId);

  const loadAll = async () => {
    setLoading(true);
    const [r1,r2,r3,r4,r5,r6,r7] = await Promise.all([
      supabase.from('panitia').select('*').order('created_at'),
      supabase.from('panitia_ahli').select('*').order('created_at'),
      supabase.from('panitia_mesyuarat').select('*').order('tarikh',{ascending:false}),
      supabase.from('panitia_program').select('*').order('created_at'),
      supabase.from('panitia_analisis').select('*').order('created_at'),
      supabase.from('peperiksaan').select('*').order('created_at'),
      supabase.from('panitia_laporan').select('*').order('created_at'),
    ]);
    setPanitia(r1.data||[]); setAhli(r2.data||[]); setMesyuarat(r3.data||[]);
    setProgram(r4.data||[]); setAnalisis(r5.data||[]); setPeperiksaanList(r6.data||[]);
    setLaporan(r7.data||[]); setLoading(false);
  };
  useEffect(()=>{ loadAll(); },[]);

  const addPanitia = async e => { e.preventDefault(); const ok=await dbRun(()=>supabase.from('panitia').insert([formPanitia])); if(!ok)return; toast("Panitia ditambah!","success"); setShowAddPanitia(false); loadAll(); };
  const updPanitia = async e => { e.preventDefault(); const {subjek,icon,ketua,status}=editPanitia; const ok=await dbRun(()=>supabase.from('panitia').update({subjek,icon,ketua,status}).eq('id',editPanitia.id)); if(!ok)return; toast("Dikemaskini!","success"); setEditPanitia(null); loadAll(); };
  const delPanitia = async id => { const ok=await dbRun(()=>supabase.from('panitia').delete().eq('id',id)); if(ok){ setPanitia(d=>d.filter(r=>r.id!==id)); if(selId===id)setSelId(null); } };

  const addAhli = async e => { e.preventDefault(); const ok=await dbRun(()=>supabase.from('panitia_ahli').insert([{...formAhli,panitia_id:selId}])); if(!ok)return; toast("Ahli ditambah!","success"); setShowAddAhli(false); loadAll(); };
  const updAhli = async e => { e.preventDefault(); const {nama_guru,peranan,kelas_ajar,status}=editAhli; const ok=await dbRun(()=>supabase.from('panitia_ahli').update({nama_guru,peranan,kelas_ajar,status}).eq('id',editAhli.id)); if(!ok)return; toast("Dikemaskini!","success"); setEditAhli(null); loadAll(); };
  const delAhli = async id => { const ok=await dbRun(()=>supabase.from('panitia_ahli').delete().eq('id',id)); if(ok)setAhli(d=>d.filter(r=>r.id!==id)); };

  const addMesy = async e => { e.preventDefault(); const ok=await dbRun(()=>supabase.from('panitia_mesyuarat').insert([{...formMesy,panitia_id:selId}])); if(!ok)return; toast("Mesyuarat ditambah!","success"); setShowAddMesy(false); loadAll(); };
  const updMesy = async e => { e.preventDefault(); const {tarikh,masa,tempat,agenda,minit,status}=editMesy; const ok=await dbRun(()=>supabase.from('panitia_mesyuarat').update({tarikh,masa,tempat,agenda,minit,status}).eq('id',editMesy.id)); if(!ok)return; toast("Dikemaskini!","success"); setEditMesy(null); loadAll(); };
  const delMesy = async id => { const ok=await dbRun(()=>supabase.from('panitia_mesyuarat').delete().eq('id',id)); if(ok)setMesyuarat(d=>d.filter(r=>r.id!==id)); };

  const addProg = async e => { e.preventDefault(); const ok=await dbRun(()=>supabase.from('panitia_program').insert([{...formProg,panitia_id:selId}])); if(!ok)return; toast("Program ditambah!","success"); setShowAddProg(false); loadAll(); };
  const updProg = async e => { e.preventDefault(); const {nama,jenis,tarikh_mula,tarikh_tamat,sasaran,status,catatan}=editProg; const ok=await dbRun(()=>supabase.from('panitia_program').update({nama,jenis,tarikh_mula,tarikh_tamat,sasaran,status,catatan}).eq('id',editProg.id)); if(!ok)return; toast("Dikemaskini!","success"); setEditProg(null); loadAll(); };
  const delProg = async id => { const ok=await dbRun(()=>supabase.from('panitia_program').delete().eq('id',id)); if(ok)setProgram(d=>d.filter(r=>r.id!==id)); };

  const addAnal = async e => { e.preventDefault(); const ok=await dbRun(()=>supabase.from('panitia_analisis').insert([{...formAnal,panitia_id:selId}])); if(!ok)return; toast("Analisis ditambah!","success"); setShowAddAnal(false); loadAll(); };
  const updAnal = async e => { e.preventDefault(); const {peperiksaan_id,bil_murid,min_markah,peratus_lulus,peratus_cemerlang,catatan}=editAnal; const ok=await dbRun(()=>supabase.from('panitia_analisis').update({peperiksaan_id,bil_murid,min_markah,peratus_lulus,peratus_cemerlang,catatan}).eq('id',editAnal.id)); if(!ok)return; toast("Dikemaskini!","success"); setEditAnal(null); loadAll(); };
  const delAnal = async id => { const ok=await dbRun(()=>supabase.from('panitia_analisis').delete().eq('id',id)); if(ok)setAnalisis(d=>d.filter(r=>r.id!==id)); };

  const addLap = async e => { e.preventDefault(); const ok=await dbRun(()=>supabase.from('panitia_laporan').insert([{...formLap,panitia_id:selId}])); if(!ok)return; toast("Laporan ditambah!","success"); setShowAddLap(false); loadAll(); };
  const updLap = async e => { e.preventDefault(); const {tajuk,jenis,tarikh,status,kandungan}=editLap; const ok=await dbRun(()=>supabase.from('panitia_laporan').update({tajuk,jenis,tarikh,status,kandungan}).eq('id',editLap.id)); if(!ok)return; toast("Dikemaskini!","success"); setEditLap(null); loadAll(); };
  const delLap = async id => { const ok=await dbRun(()=>supabase.from('panitia_laporan').delete().eq('id',id)); if(ok)setLaporan(d=>d.filter(r=>r.id!==id)); };

  const tabSty = i => ({
    padding:"7px 14px", borderRadius:12,
    border:`1.5px solid ${subtab===i?'#2563eb':'var(--border)'}`,
    background:subtab===i?'#2563eb':'var(--surface)',
    color:subtab===i?'white':'var(--text2)',
    fontSize:12, fontWeight:800, fontFamily:"'Inter',sans-serif",
    cursor:'pointer', transition:'all 0.15s'
  });

  const pilSty = p => ({
    padding:'5px 12px', borderRadius:10, fontSize:12, fontWeight:800, cursor:'pointer',
    border:`2px solid ${selId===p.id?(p.color||'#2563eb'):'var(--border)'}`,
    background:selId===p.id?(p.bg||'#eff6ff'):'var(--surface)',
    color:selId===p.id?(p.color||'#2563eb'):'var(--text2)',
    fontFamily:"'Inter',sans-serif"
  });

  const PanitiaPill = () => (
    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
      {panitia.map(p=>(
        <button key={p.id} style={pilSty(p)} onClick={()=>setSelId(p.id)}>{p.icon} {p.subjek}</button>
      ))}
      {panitia.length===0&&<span style={{fontSize:12,color:'var(--text3)',fontWeight:800}}>Tiada panitia. Pergi Tab "Senarai Panitia" untuk tambah.</span>}
    </div>
  );

  const NoSel = () => (
    <div style={{textAlign:'center',color:'var(--text3)',padding:40,fontSize:14,fontWeight:800}}>
      ☝️ Pilih panitia di atas dahulu
    </div>
  );

  const quickBtn = (label, onClick) => (
    <button onClick={onClick} style={{padding:'3px 8px',borderRadius:8,fontSize:10,fontWeight:800,
      border:'1.5px solid var(--border)',background:'var(--surface)',cursor:'pointer',
      fontFamily:"'Inter',sans-serif",color:'var(--text2)'}}>
      {label}
    </button>
  );

  const statsCards = [
    {ico:"📋",val:panitia.length,lbl:"Jumlah Panitia"},
    {ico:"👩‍🏫",val:ahli.length,lbl:"Jumlah Guru"},
    {ico:"📅",val:mesyuarat.filter(m=>m.status==="Selesai").length,lbl:"Mesyuarat Selesai"},
    {ico:"🎯",val:program.filter(p=>p.status==="Aktif").length,lbl:"Program Aktif"},
  ];

  return (
    <KurPage title="Panitia Mata Pelajaran" sub="Kurikulum · SK Darau, Kota Kinabalu" stats={statsCards}>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
        {['📋 Senarai Panitia','👩‍🏫 Ahli Panitia','📅 Mesyuarat','🎯 Program & Aktiviti','📊 Analisis Prestasi','📄 Laporan','📁 Fail Drive'].map((t,i)=>(
          <button key={i} style={tabSty(i)} onClick={()=>setSubtab(i)}>{t}</button>
        ))}
      </div>

      {loading?<div className="loading">⏳ Memuatkan…</div>:(<>

        {/* ── TAB 0: SENARAI PANITIA ── */}
        {subtab===0&&(
          <div>
            <div className="kur-header">
              <button className="btn-add" onClick={()=>{setFormPanitia(blankPanitia);setShowAddPanitia(true);}}>+ Tambah Panitia</button>
            </div>
            {panitia.length===0&&<div style={{color:'var(--text3)',padding:40,textAlign:'center',fontSize:14,fontWeight:800}}>Tiada panitia. Tambah panitia untuk memulakan.</div>}
            <div className="panitia-grid">
              {panitia.map(p=>(
                <div className="panitia-card" key={p.id}
                  style={{cursor:'pointer',outline:selId===p.id?`2.5px solid ${p.color||'#2563eb'}`:'none',outlineOffset:2}}
                  onClick={()=>setSelId(p.id)}>
                  <div className="panitia-head">
                    <div className="panitia-ico" style={{background:p.bg||"#eff6ff"}}>{p.icon}</div>
                    <div style={{flex:1}}>
                      <div className="panitia-name">{p.subjek}</div>
                      <div className="panitia-ketua">Ketua: {p.ketua}</div>
                    </div>
                    <div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                      <button className="btn-add" style={{padding:"4px 10px",fontSize:11}} onClick={()=>setEditPanitia({...p})}>✏️</button>
                      <button className="btn-del" onClick={()=>delPanitia(p.id)}>🗑</button>
                    </div>
                  </div>
                  <div className="panitia-body">
                    👩‍🏫 {ahli.filter(a=>a.panitia_id===p.id).length} guru &nbsp;·&nbsp;
                    📅 {mesyuarat.filter(m=>m.panitia_id===p.id).length} mesyuarat &nbsp;·&nbsp;
                    🎯 {program.filter(pr=>pr.panitia_id===p.id).length} program
                  </div>
                  <div className="panitia-foot">
                    <span className="badge b-green">{p.status}</span>
                    <div style={{display:'flex',gap:4}} onClick={e=>e.stopPropagation()}>
                      {quickBtn('👩‍🏫 Ahli', ()=>{setSelId(p.id);setSubtab(1);})}
                      {quickBtn('📅 Mesyuarat', ()=>{setSelId(p.id);setSubtab(2);})}
                      {quickBtn('📊 Analisis', ()=>{setSelId(p.id);setSubtab(4);})}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 1: AHLI PANITIA ── */}
        {subtab===1&&(
          <div>
            <PanitiaPill/>
            {!selId?<NoSel/>:(
              <>
                <div className="kur-header" style={{gap:8,marginBottom:10}}>
                  <button className="btn-add" onClick={()=>{setFormAhli(blankAhli);setShowAddAhli(true);}}>+ Tambah Ahli</button>
                  <span style={{fontSize:12,color:'var(--text3)',fontWeight:800,padding:'6px 0'}}>{ahli.filter(a=>a.panitia_id===selId).length} guru — Panitia {selPanitia?.subjek}</span>
                </div>
                <div className="kur-table-wrap">
                  <table className="kur-table">
                    <thead><tr><th>#</th><th>Nama Guru</th><th>Peranan</th><th>Kelas Diajar</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {ahli.filter(a=>a.panitia_id===selId).length===0&&<tr><td colSpan={6} style={{textAlign:'center',color:'var(--text3)',padding:28}}>Tiada ahli. Tambah ahli untuk panitia ini.</td></tr>}
                      {ahli.filter(a=>a.panitia_id===selId).map((a,i)=>(
                        <tr key={a.id}>
                          <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                          <td style={{fontWeight:800}}>{a.nama_guru}</td>
                          <td><span className={`badge ${a.peranan==='Ketua'?'b-red':a.peranan==='Setiausaha'?'b-yellow':'b-blue'}`}>{a.peranan}</span></td>
                          <td style={{fontSize:12,color:'var(--text3)'}}>{a.kelas_ajar||'—'}</td>
                          <td><span className={`badge ${a.status==='Aktif'?'b-green':'b-gray'}`}>{a.status}</span></td>
                          <td style={{display:'flex',gap:4}}>
                            <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditAhli({...a})}>✏️</button>
                            <button className="btn-del" onClick={()=>delAhli(a.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 2: MESYUARAT ── */}
        {subtab===2&&(
          <div>
            <PanitiaPill/>
            {!selId?<NoSel/>:(
              <>
                <div className="kur-header" style={{gap:8,marginBottom:10,flexWrap:'wrap'}}>
                  <button className="btn-add" onClick={()=>{setFormMesy(blankMesy);setShowAddMesy(true);}}>+ Tambah Mesyuarat</button>
                  {(()=>{const done=mesyuarat.filter(m=>m.panitia_id===selId&&m.status==='Selesai').length;return(
                    <div style={{padding:'6px 14px',borderRadius:10,fontSize:12,fontWeight:900,
                      background:done>=2?'#f0fdf4':'#fef2f2',
                      border:`2px solid ${done>=2?'#86efac':'#fca5a5'}`,
                      color:done>=2?'#15803d':'#dc2626'}}>
                      {done}/2 sesi minimum {done>=2?'✅ Cukup':'⚠️ Perlu tambah'}
                    </div>
                  );})()}
                </div>
                <div className="kur-table-wrap">
                  <table className="kur-table">
                    <thead><tr><th>#</th><th>Tarikh</th><th>Masa</th><th>Tempat</th><th>Agenda</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {mesyuarat.filter(m=>m.panitia_id===selId).length===0&&<tr><td colSpan={7} style={{textAlign:'center',color:'var(--text3)',padding:28}}>Tiada mesyuarat direkodkan.</td></tr>}
                      {mesyuarat.filter(m=>m.panitia_id===selId).map((m,i)=>(
                        <tr key={m.id}>
                          <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                          <td style={{fontWeight:800}}>{m.tarikh}</td>
                          <td style={{fontSize:12,color:'var(--text3)'}}>{m.masa||'—'}</td>
                          <td style={{fontSize:12}}>{m.tempat||'—'}</td>
                          <td style={{fontSize:12,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.agenda||'—'}</td>
                          <td><span className={`badge ${m.status==='Selesai'?'b-green':m.status==='Semasa'?'b-blue':'b-yellow'}`}>{m.status}</span></td>
                          <td style={{display:'flex',gap:4}}>
                            <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditMesy({...m})}>✏️</button>
                            <button className="btn-del" onClick={()=>delMesy(m.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 3: PROGRAM & AKTIVITI ── */}
        {subtab===3&&(
          <div>
            <PanitiaPill/>
            {!selId?<NoSel/>:(
              <>
                <div className="kur-header" style={{gap:8,marginBottom:10}}>
                  <button className="btn-add" onClick={()=>{setFormProg(blankProg);setShowAddProg(true);}}>+ Tambah Program</button>
                </div>
                <div className="kur-table-wrap">
                  <table className="kur-table">
                    <thead><tr><th>#</th><th>Nama Program</th><th>Jenis</th><th>Tarikh Mula</th><th>Tarikh Tamat</th><th>Sasaran</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {program.filter(p=>p.panitia_id===selId).length===0&&<tr><td colSpan={8} style={{textAlign:'center',color:'var(--text3)',padding:28}}>Tiada program. Tambah program untuk panitia ini.</td></tr>}
                      {program.filter(p=>p.panitia_id===selId).map((p,i)=>(
                        <tr key={p.id}>
                          <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                          <td style={{fontWeight:800}}>{p.nama}</td>
                          <td><span className={`badge ${p.jenis==='Pemulihan'?'b-red':p.jenis==='Pengayaan'?'b-green':p.jenis==='Bengkel'?'b-blue':'b-yellow'}`}>{p.jenis}</span></td>
                          <td style={{fontSize:12,color:'var(--text3)'}}>{p.tarikh_mula||'—'}</td>
                          <td style={{fontSize:12,color:'var(--text3)'}}>{p.tarikh_tamat||'—'}</td>
                          <td style={{fontSize:12}}>{p.sasaran||'—'}</td>
                          <td><span className={`badge ${p.status==='Aktif'?'b-green':p.status==='Selesai'?'b-blue':p.status==='Batal'?'b-red':'b-yellow'}`}>{p.status}</span></td>
                          <td style={{display:'flex',gap:4}}>
                            <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditProg({...p})}>✏️</button>
                            <button className="btn-del" onClick={()=>delProg(p.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 4: ANALISIS PRESTASI ── */}
        {subtab===4&&(
          <div>
            <PanitiaPill/>
            {!selId?<NoSel/>:(
              <>
                <div className="kur-header" style={{gap:8,marginBottom:10}}>
                  <button className="btn-add" onClick={()=>{setFormAnal(blankAnal);setShowAddAnal(true);}}>+ Tambah Analisis</button>
                  <span style={{fontSize:11,color:'var(--text3)',fontWeight:800,padding:'6px 0'}}>🔗 Data peperiksaan dari modul Peperiksaan &amp; Penilaian</span>
                </div>
                {analisis.filter(a=>a.panitia_id===selId).length>0&&(
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12,marginBottom:16}}>
                    {analisis.filter(a=>a.panitia_id===selId).map(a=>{
                      const pep=peperiksaanList.find(p=>String(p.id)===String(a.peperiksaan_id));
                      return(
                        <div key={a.id} style={{background:'var(--surface)',border:'2px solid var(--border)',borderRadius:12,padding:14,boxShadow:'var(--shadow)'}}>
                          <div style={{fontWeight:900,fontSize:13,marginBottom:2}}>{pep?.nama||'Peperiksaan'}</div>
                          <div style={{fontSize:10,color:'var(--text3)',marginBottom:10}}>{pep?.tarikh||'—'} · {pep?.kelas||''}</div>
                          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
                            <div style={{background:'#f0fdf4',borderRadius:8,padding:'6px',textAlign:'center'}}>
                              <div style={{fontWeight:900,fontSize:18,color:'#16a34a'}}>{a.peratus_lulus}%</div>
                              <div style={{fontSize:9,color:'#15803d',fontWeight:800}}>LULUS</div>
                            </div>
                            <div style={{background:'#eff6ff',borderRadius:8,padding:'6px',textAlign:'center'}}>
                              <div style={{fontWeight:900,fontSize:18,color:'#2563eb'}}>{a.peratus_cemerlang}%</div>
                              <div style={{fontSize:9,color:'#1d4ed8',fontWeight:800}}>CEMERLANG</div>
                            </div>
                          </div>
                          <div style={{fontSize:11,color:'var(--text2)',marginBottom:8}}>Min: <b>{a.min_markah}</b> · Murid: <b>{a.bil_murid}</b></div>
                          <div style={{display:'flex',gap:4}}>
                            <button className="btn-add" style={{padding:'3px 8px',fontSize:10,flex:1}} onClick={()=>setEditAnal({...a})}>✏️ Edit</button>
                            <button className="btn-del" style={{padding:'3px 6px',fontSize:10}} onClick={()=>delAnal(a.id)}>🗑</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="kur-table-wrap">
                  <table className="kur-table">
                    <thead><tr><th>#</th><th>Peperiksaan</th><th>Tarikh</th><th>Bil Murid</th><th>Min Markah</th><th>% Lulus</th><th>% Cemerlang</th><th>Catatan</th><th></th></tr></thead>
                    <tbody>
                      {analisis.filter(a=>a.panitia_id===selId).length===0&&<tr><td colSpan={9} style={{textAlign:'center',color:'var(--text3)',padding:28}}>Tiada analisis. Tambah analisis berdasarkan peperiksaan sedia ada.</td></tr>}
                      {analisis.filter(a=>a.panitia_id===selId).map((a,i)=>{
                        const pep=peperiksaanList.find(p=>String(p.id)===String(a.peperiksaan_id));
                        return(
                          <tr key={a.id}>
                            <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                            <td style={{fontWeight:800}}>{pep?.nama||'—'}</td>
                            <td style={{fontSize:12,color:'var(--text3)'}}>{pep?.tarikh||'—'}</td>
                            <td style={{fontWeight:800}}>{a.bil_murid}</td>
                            <td style={{fontWeight:800}}>{a.min_markah}</td>
                            <td><span style={{fontWeight:900,color:Number(a.peratus_lulus)>=80?'#16a34a':Number(a.peratus_lulus)>=60?'#f59e0b':'#dc2626'}}>{a.peratus_lulus}%</span></td>
                            <td><span style={{fontWeight:900,color:Number(a.peratus_cemerlang)>=30?'#2563eb':'#64748b'}}>{a.peratus_cemerlang}%</span></td>
                            <td style={{fontSize:12,color:'var(--text3)',maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.catatan||'—'}</td>
                            <td style={{display:'flex',gap:4}}>
                              <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditAnal({...a})}>✏️</button>
                              <button className="btn-del" onClick={()=>delAnal(a.id)}>🗑</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 5: LAPORAN ── */}
        {subtab===6&&(
          <div style={{borderRadius:14,overflow:'hidden',border:'1.5px solid var(--border)',marginTop:8}}>
            <div style={{padding:'10px 16px',background:'var(--card2)',fontWeight:800,fontSize:13,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span>📁 Fail Drive — Panitia Mata Pelajaran</span>
              <a href="https://drive.google.com/drive/folders/1W0Pp7ltSrZBJAPalmCelqpfAkQCP3eq2" target="_blank" rel="noreferrer" style={{fontSize:12,color:'var(--accent)',fontWeight:700,textDecoration:'none'}}>Buka dalam Drive ↗</a>
            </div>
            <iframe src="https://drive.google.com/embeddedfolderview?id=1W0Pp7ltSrZBJAPalmCelqpfAkQCP3eq2&usp=sharing#list" style={{width:'100%',height:'500px',border:'none',display:'block'}} title="Panitia Drive"/>
          </div>
        )}
        {subtab===5&&(
          <div>
            <PanitiaPill/>
            {!selId?<NoSel/>:(
              <>
                <div className="kur-header" style={{gap:8,marginBottom:10}}>
                  <button className="btn-add" onClick={()=>{setFormLap(blankLap);setShowAddLap(true);}}>+ Tambah Laporan</button>
                </div>
                <div style={{background:'var(--surface)',border:'2px solid var(--border)',borderRadius:14,padding:16,marginBottom:16,boxShadow:'var(--shadow)'}}>
                  <div style={{fontWeight:900,fontSize:14,marginBottom:12}}>📊 Ringkasan Panitia — {selPanitia?.subjek}</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:8}}>
                    {[
                      {bg:'#eff6ff',c:'#2563eb',val:ahli.filter(a=>a.panitia_id===selId).length,lbl:'Ahli Panitia'},
                      {bg:'#f0fdf4',c:'#16a34a',val:mesyuarat.filter(m=>m.panitia_id===selId&&m.status==='Selesai').length,lbl:'Mesyuarat Selesai'},
                      {bg:'#fff7ed',c:'#ea580c',val:program.filter(p=>p.panitia_id===selId).length,lbl:'Program'},
                      {bg:'#fdf4ff',c:'#a21caf',val:analisis.filter(a=>a.panitia_id===selId).length,lbl:'Analisis Prestasi'},
                      {bg:'#f0fdf4',c:'#16a34a',val:laporan.filter(l=>l.panitia_id===selId&&l.status==='Dikemukakan').length,lbl:'Laporan Dikemukakan'},
                    ].map((s,i)=>(
                      <div key={i} style={{background:s.bg,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
                        <div style={{fontWeight:900,fontSize:20,color:s.c}}>{s.val}</div>
                        <div style={{fontSize:11,color:s.c,fontWeight:800}}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="kur-table-wrap">
                  <table className="kur-table">
                    <thead><tr><th>#</th><th>Tajuk Laporan</th><th>Jenis</th><th>Tarikh</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {laporan.filter(l=>l.panitia_id===selId).length===0&&<tr><td colSpan={6} style={{textAlign:'center',color:'var(--text3)',padding:28}}>Tiada laporan direkodkan.</td></tr>}
                      {laporan.filter(l=>l.panitia_id===selId).map((l,i)=>(
                        <tr key={l.id}>
                          <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                          <td style={{fontWeight:800}}>{l.tajuk}</td>
                          <td><span className={`badge ${l.jenis==='Tahunan'?'b-blue':l.jenis==='Mesyuarat'?'b-green':l.jenis==='Program'?'b-yellow':'b-red'}`}>{l.jenis}</span></td>
                          <td style={{fontSize:12,color:'var(--text3)'}}>{l.tarikh||'—'}</td>
                          <td><span className={`badge ${l.status==='Dikemukakan'?'b-green':l.status==='Siap'?'b-blue':'b-yellow'}`}>{l.status}</span></td>
                          <td style={{display:'flex',gap:4}}>
                            <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditLap({...l})}>✏️</button>
                            <button className="btn-del" onClick={()=>delLap(l.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </>)}

      {/* ── MODALS: PANITIA ── */}
      {showAddPanitia&&<Modal title="Tambah Panitia" onClose={()=>setShowAddPanitia(false)}><form onSubmit={addPanitia}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Mata Pelajaran</label><input className="form-input" required value={formPanitia.subjek} onChange={e=>setFormPanitia(f=>({...f,subjek:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Ikon</label><input className="form-input" value={formPanitia.icon} onChange={e=>setFormPanitia(f=>({...f,icon:e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Nama Ketua Panitia</label><input className="form-input" required value={formPanitia.ketua} onChange={e=>setFormPanitia(f=>({...f,ketua:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editPanitia&&<Modal title={`Edit — ${editPanitia.subjek}`} onClose={()=>setEditPanitia(null)}><form onSubmit={updPanitia}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Mata Pelajaran</label><input className="form-input" required value={editPanitia.subjek} onChange={e=>setEditPanitia(f=>({...f,subjek:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Ikon</label><input className="form-input" value={editPanitia.icon} onChange={e=>setEditPanitia(f=>({...f,icon:e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Nama Ketua Panitia</label><input className="form-input" required value={editPanitia.ketua} onChange={e=>setEditPanitia(f=>({...f,ketua:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Status</label>
          <select className="form-input" value={editPanitia.status} onChange={e=>setEditPanitia(f=>({...f,status:e.target.value}))}>
            <option>Aktif</option><option>Tidak Aktif</option>
          </select>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}

      {/* ── MODALS: AHLI ── */}
      {showAddAhli&&<Modal title="Tambah Ahli Panitia" onClose={()=>setShowAddAhli(false)}><form onSubmit={addAhli}>
        <div className="form-field"><label className="form-label">Nama Guru</label><input className="form-input" required value={formAhli.nama_guru} onChange={e=>setFormAhli(f=>({...f,nama_guru:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Peranan</label>
            <select className="form-input" value={formAhli.peranan} onChange={e=>setFormAhli(f=>({...f,peranan:e.target.value}))}>
              <option>Ketua</option><option>Setiausaha</option><option>Ahli</option>
            </select>
          </div>
          <div className="form-field"><label className="form-label">Kelas Diajar</label><input className="form-input" placeholder="cth: Tahun 4 &amp; 5" value={formAhli.kelas_ajar} onChange={e=>setFormAhli(f=>({...f,kelas_ajar:e.target.value}))}/></div>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editAhli&&<Modal title={`Edit — ${editAhli.nama_guru}`} onClose={()=>setEditAhli(null)}><form onSubmit={updAhli}>
        <div className="form-field"><label className="form-label">Nama Guru</label><input className="form-input" required value={editAhli.nama_guru} onChange={e=>setEditAhli(f=>({...f,nama_guru:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Peranan</label>
            <select className="form-input" value={editAhli.peranan} onChange={e=>setEditAhli(f=>({...f,peranan:e.target.value}))}>
              <option>Ketua</option><option>Setiausaha</option><option>Ahli</option>
            </select>
          </div>
          <div className="form-field"><label className="form-label">Kelas Diajar</label><input className="form-input" value={editAhli.kelas_ajar} onChange={e=>setEditAhli(f=>({...f,kelas_ajar:e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Status</label>
          <select className="form-input" value={editAhli.status} onChange={e=>setEditAhli(f=>({...f,status:e.target.value}))}>
            <option>Aktif</option><option>Tidak Aktif</option>
          </select>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}

      {/* ── MODALS: MESYUARAT ── */}
      {showAddMesy&&<Modal title="Tambah Mesyuarat" onClose={()=>setShowAddMesy(false)}><form onSubmit={addMesy}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" type="date" required value={formMesy.tarikh} onChange={e=>setFormMesy(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Masa</label><input className="form-input" placeholder="cth: 2:00 PTG" value={formMesy.masa} onChange={e=>setFormMesy(f=>({...f,masa:e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Tempat</label><input className="form-input" placeholder="cth: Bilik Gerakan" value={formMesy.tempat} onChange={e=>setFormMesy(f=>({...f,tempat:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Agenda</label><textarea className="form-input" rows={3} placeholder="Senarai agenda mesyuarat..." value={formMesy.agenda} onChange={e=>setFormMesy(f=>({...f,agenda:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Status</label>
          <select className="form-input" value={formMesy.status} onChange={e=>setFormMesy(f=>({...f,status:e.target.value}))}>
            <option>Akan Datang</option><option>Semasa</option><option>Selesai</option>
          </select>
        </div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editMesy&&<Modal title={`Edit Mesyuarat — ${editMesy.tarikh}`} onClose={()=>setEditMesy(null)}><form onSubmit={updMesy}>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" type="date" value={editMesy.tarikh} onChange={e=>setEditMesy(f=>({...f,tarikh:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={editMesy.masa} onChange={e=>setEditMesy(f=>({...f,masa:e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Tempat</label><input className="form-input" value={editMesy.tempat} onChange={e=>setEditMesy(f=>({...f,tempat:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Agenda</label><textarea className="form-input" rows={2} value={editMesy.agenda} onChange={e=>setEditMesy(f=>({...f,agenda:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Minit Mesyuarat</label><textarea className="form-input" rows={3} placeholder="Ringkasan minit / keputusan mesyuarat..." value={editMesy.minit} onChange={e=>setEditMesy(f=>({...f,minit:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Status</label>
          <select className="form-input" value={editMesy.status} onChange={e=>setEditMesy(f=>({...f,status:e.target.value}))}>
            <option>Akan Datang</option><option>Semasa</option><option>Selesai</option>
          </select>
        </div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}

      {/* ── MODALS: PROGRAM ── */}
      {showAddProg&&<Modal title="Tambah Program / Aktiviti" onClose={()=>setShowAddProg(false)}><form onSubmit={addProg}>
        <div className="form-field"><label className="form-label">Nama Program</label><input className="form-input" required value={formProg.nama} onChange={e=>setFormProg(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jenis</label>
            <select className="form-input" value={formProg.jenis} onChange={e=>setFormProg(f=>({...f,jenis:e.target.value}))}>
              <option>Pemulihan</option><option>Pengayaan</option><option>Bengkel</option><option>Klinik Subjek</option><option>Pertandingan</option><option>Lawatan</option>
            </select>
          </div>
          <div className="form-field"><label className="form-label">Status</label>
            <select className="form-input" value={formProg.status} onChange={e=>setFormProg(f=>({...f,status:e.target.value}))}>
              <option>Rancangan</option><option>Aktif</option><option>Selesai</option><option>Batal</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh Mula</label><input className="form-input" type="date" value={formProg.tarikh_mula} onChange={e=>setFormProg(f=>({...f,tarikh_mula:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Tarikh Tamat</label><input className="form-input" type="date" value={formProg.tarikh_tamat} onChange={e=>setFormProg(f=>({...f,tarikh_tamat:e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Sasaran Murid</label><input className="form-input" placeholder="cth: Murid lemah Tahun 4 &amp; 5" value={formProg.sasaran} onChange={e=>setFormProg(f=>({...f,sasaran:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Catatan</label><textarea className="form-input" rows={2} value={formProg.catatan} onChange={e=>setFormProg(f=>({...f,catatan:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editProg&&<Modal title={`Edit — ${editProg.nama}`} onClose={()=>setEditProg(null)}><form onSubmit={updProg}>
        <div className="form-field"><label className="form-label">Nama Program</label><input className="form-input" required value={editProg.nama} onChange={e=>setEditProg(f=>({...f,nama:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jenis</label>
            <select className="form-input" value={editProg.jenis} onChange={e=>setEditProg(f=>({...f,jenis:e.target.value}))}>
              <option>Pemulihan</option><option>Pengayaan</option><option>Bengkel</option><option>Klinik Subjek</option><option>Pertandingan</option><option>Lawatan</option>
            </select>
          </div>
          <div className="form-field"><label className="form-label">Status</label>
            <select className="form-input" value={editProg.status} onChange={e=>setEditProg(f=>({...f,status:e.target.value}))}>
              <option>Rancangan</option><option>Aktif</option><option>Selesai</option><option>Batal</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Tarikh Mula</label><input className="form-input" type="date" value={editProg.tarikh_mula} onChange={e=>setEditProg(f=>({...f,tarikh_mula:e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Tarikh Tamat</label><input className="form-input" type="date" value={editProg.tarikh_tamat} onChange={e=>setEditProg(f=>({...f,tarikh_tamat:e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Sasaran Murid</label><input className="form-input" value={editProg.sasaran} onChange={e=>setEditProg(f=>({...f,sasaran:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Catatan</label><textarea className="form-input" rows={2} value={editProg.catatan} onChange={e=>setEditProg(f=>({...f,catatan:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}

      {/* ── MODALS: ANALISIS ── */}
      {showAddAnal&&<Modal title="Tambah Analisis Prestasi" onClose={()=>setShowAddAnal(false)}><form onSubmit={addAnal}>
        <div className="form-field"><label className="form-label">Peperiksaan (dari modul Peperiksaan &amp; Penilaian)</label>
          <select className="form-input" required value={formAnal.peperiksaan_id} onChange={e=>setFormAnal(f=>({...f,peperiksaan_id:e.target.value}))}>
            <option value="">— Pilih Peperiksaan —</option>
            {peperiksaanList.map(p=><option key={p.id} value={p.id}>{p.nama} · {p.tarikh}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Bilangan Murid</label><input className="form-input" type="number" min="0" value={formAnal.bil_murid} onChange={e=>setFormAnal(f=>({...f,bil_murid:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Min Markah</label><input className="form-input" type="number" min="0" max="100" step="0.1" value={formAnal.min_markah} onChange={e=>setFormAnal(f=>({...f,min_markah:+e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">% Lulus</label><input className="form-input" type="number" min="0" max="100" step="0.1" value={formAnal.peratus_lulus} onChange={e=>setFormAnal(f=>({...f,peratus_lulus:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">% Cemerlang (A)</label><input className="form-input" type="number" min="0" max="100" step="0.1" value={formAnal.peratus_cemerlang} onChange={e=>setFormAnal(f=>({...f,peratus_cemerlang:+e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Catatan / Pemerhatian</label><textarea className="form-input" rows={2} placeholder="Prestasi meningkat / menurun, sebab-sebab..." value={formAnal.catatan} onChange={e=>setFormAnal(f=>({...f,catatan:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editAnal&&<Modal title="Edit Analisis Prestasi" onClose={()=>setEditAnal(null)}><form onSubmit={updAnal}>
        <div className="form-field"><label className="form-label">Peperiksaan</label>
          <select className="form-input" value={editAnal.peperiksaan_id} onChange={e=>setEditAnal(f=>({...f,peperiksaan_id:e.target.value}))}>
            <option value="">— Pilih Peperiksaan —</option>
            {peperiksaanList.map(p=><option key={p.id} value={p.id}>{p.nama} · {p.tarikh}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Bilangan Murid</label><input className="form-input" type="number" min="0" value={editAnal.bil_murid} onChange={e=>setEditAnal(f=>({...f,bil_murid:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">Min Markah</label><input className="form-input" type="number" min="0" max="100" step="0.1" value={editAnal.min_markah} onChange={e=>setEditAnal(f=>({...f,min_markah:+e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">% Lulus</label><input className="form-input" type="number" min="0" max="100" step="0.1" value={editAnal.peratus_lulus} onChange={e=>setEditAnal(f=>({...f,peratus_lulus:+e.target.value}))}/></div>
          <div className="form-field"><label className="form-label">% Cemerlang (A)</label><input className="form-input" type="number" min="0" max="100" step="0.1" value={editAnal.peratus_cemerlang} onChange={e=>setEditAnal(f=>({...f,peratus_cemerlang:+e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Catatan / Pemerhatian</label><textarea className="form-input" rows={2} value={editAnal.catatan} onChange={e=>setEditAnal(f=>({...f,catatan:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}

      {/* ── MODALS: LAPORAN ── */}
      {showAddLap&&<Modal title="Tambah Laporan" onClose={()=>setShowAddLap(false)}><form onSubmit={addLap}>
        <div className="form-field"><label className="form-label">Tajuk Laporan</label><input className="form-input" required value={formLap.tajuk} onChange={e=>setFormLap(f=>({...f,tajuk:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jenis</label>
            <select className="form-input" value={formLap.jenis} onChange={e=>setFormLap(f=>({...f,jenis:e.target.value}))}>
              <option>Tahunan</option><option>Mesyuarat</option><option>Program</option><option>Analisis</option>
            </select>
          </div>
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" type="date" value={formLap.tarikh} onChange={e=>setFormLap(f=>({...f,tarikh:e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Status</label>
          <select className="form-input" value={formLap.status} onChange={e=>setFormLap(f=>({...f,status:e.target.value}))}>
            <option>Draf</option><option>Siap</option><option>Dikemukakan</option>
          </select>
        </div>
        <div className="form-field"><label className="form-label">Kandungan / Nota</label><textarea className="form-input" rows={4} placeholder="Ringkasan / kandungan laporan..." value={formLap.kandungan} onChange={e=>setFormLap(f=>({...f,kandungan:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">+ Tambah</button>
      </form></Modal>}
      {editLap&&<Modal title={`Edit — ${editLap.tajuk}`} onClose={()=>setEditLap(null)}><form onSubmit={updLap}>
        <div className="form-field"><label className="form-label">Tajuk Laporan</label><input className="form-input" required value={editLap.tajuk} onChange={e=>setEditLap(f=>({...f,tajuk:e.target.value}))}/></div>
        <div className="form-row">
          <div className="form-field"><label className="form-label">Jenis</label>
            <select className="form-input" value={editLap.jenis} onChange={e=>setEditLap(f=>({...f,jenis:e.target.value}))}>
              <option>Tahunan</option><option>Mesyuarat</option><option>Program</option><option>Analisis</option>
            </select>
          </div>
          <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" type="date" value={editLap.tarikh} onChange={e=>setEditLap(f=>({...f,tarikh:e.target.value}))}/></div>
        </div>
        <div className="form-field"><label className="form-label">Status</label>
          <select className="form-input" value={editLap.status} onChange={e=>setEditLap(f=>({...f,status:e.target.value}))}>
            <option>Draf</option><option>Siap</option><option>Dikemukakan</option>
          </select>
        </div>
        <div className="form-field"><label className="form-label">Kandungan / Nota</label><textarea className="form-input" rows={4} value={editLap.kandungan} onChange={e=>setEditLap(f=>({...f,kandungan:e.target.value}))}/></div>
        <button className="btn-primary" type="submit">💾 Simpan</button>
      </form></Modal>}
    </KurPage>
  );
}

// ─── 3. PEPERIKSAAN & PENILAIAN ───────────────────────────────────────────────
function Peperiksaan() {
  const TABS_PEP = ["📋 Senarai","📝 Markah Murid","📊 Analisis","🏆 Ranking","📅 Jadual Peprik"];
  const JENIS_LIST = ["Ujian 1","Pertengahan Tahun","Ujian 2","Akhir Tahun","Lain-lain"];
  const SUBJECT_LIST = ["BM","BI","Math","Sains","Sejarah","Geografi","PI/Moral","PJK","Seni","Muzik","TMK","RBT"];
  const BAND_DESC = {1:"Tahu",2:"Tahu dan Faham",3:"Tahu, Faham dan Boleh Buat",4:"Tahu, Faham, Boleh Buat dengan Beradab",5:"Tahu, Faham, Boleh Buat dengan Beradab Terpuji",6:"Tahu, Faham, Boleh Buat dengan Beradab Terpuji Mithali"};
  const STATUS_CYCLE = ["Akan Datang","Semasa","Selesai"];
  const badgeMap = { "Selesai":"b-green","Akan Datang":"b-yellow","Semasa":"b-blue" };

  const [subtab, setSubtab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Tab 0 state
  const [pepList, setPepList] = useState([]);
  const [showAddPep, setShowAddPep] = useState(false);
  const [editPep, setEditPep] = useState(null);
  const blankPep = { nama:"", jenis:"Ujian 1", tarikh_mula:"", tarikh_tamat:"", kelas_sasaran:"Semua", status:"Akan Datang" };
  const [formPep, setFormPep] = useState({...blankPep});

  // Tab 1 state
  const [selPepId, setSelPepId] = useState("");
  const [selKelas1, setSelKelas1] = useState("");
  const [selSubjek, setSelSubjek] = useState("BM");
  const [markahList, setMarkahList] = useState([]);
  const [muridList, setMuridList] = useState([]);
  const [markahEdit, setMarkahEdit] = useState({});
  const [savingMarkah, setSavingMarkah] = useState(false);

  // Tab 2 + 3 state (shared filter)
  const [analisisPepId, setAnalisisPepId] = useState("");
  const [analisisKelas, setAnalisisKelas] = useState("");
  const [analisisData, setAnalisisData] = useState([]);

  // Tab 4 state
  const [jadualList, setJadualList] = useState([]);
  const [showAddJadual, setShowAddJadual] = useState(false);
  const blankJadual = { peperiksaan_id:"", tarikh:"", masa_mula:"", masa_tamat:"", mata_pelajaran:"BM", kelas:"Semua", bilik:"Dewan", pengawas:"" };
  const [formJadual, setFormJadual] = useState({...blankJadual});
  const [filterJadualId, setFilterJadualId] = useState("");

  const isTahunRendah = (k) => /Tahun [123]/.test(k);

  const getGred = (m) => {
    if (m==null||m==="") return "-";
    const n = Number(m);
    if (n>=90) return "A+"; if (n>=80) return "A"; if (n>=70) return "B";
    if (n>=60) return "C"; if (n>=50) return "D"; return "E";
  };

  const loadAll = async () => {
    setLoading(true);
    const [r1,r2] = await Promise.all([
      supabase.from('peperiksaan').select('*').order('created_at',{ascending:false}),
      supabase.from('peperiksaan_jadual').select('*').order('tarikh'),
    ]);
    setPepList(r1.data||[]); setJadualList(r2.data||[]); setLoading(false);
  };

  const loadMurid = async (kelas) => {
    if (!kelas) return;
    const { data } = await supabase.from('hem_murid').select('id,nama,no_kelas').eq('kelas',kelas).order('nama');
    setMuridList(data||[]);
  };

  const loadMarkah = async (pepId, kelas, subjek) => {
    if (!pepId||!kelas||!subjek) return;
    const { data } = await supabase.from('peperiksaan_markah').select('*')
      .eq('peperiksaan_id',pepId).eq('kelas',kelas).eq('mata_pelajaran',subjek);
    setMarkahList(data||[]);
    const map = {};
    (data||[]).forEach(r => { map[r.nama_murid] = r.markah??r.band??""; });
    setMarkahEdit(map);
  };

  const loadAnalisis = async (pepId, kelas) => {
    if (!pepId) return;
    let q = supabase.from('peperiksaan_markah').select('*').eq('peperiksaan_id',pepId);
    if (kelas) q = q.eq('kelas',kelas);
    const { data } = await q;
    setAnalisisData(data||[]);
  };

  useEffect(()=>{ loadAll(); },[]);
  useEffect(()=>{ if(selKelas1) loadMurid(selKelas1); else setMuridList([]); },[selKelas1]);
  useEffect(()=>{ loadMarkah(selPepId,selKelas1,selSubjek); },[selPepId,selKelas1,selSubjek]);
  useEffect(()=>{ loadAnalisis(analisisPepId,analisisKelas); },[analisisPepId,analisisKelas]);

  // --- Tab 0 ---
  const handleAddPep = async (e) => {
    e.preventDefault();
    const ok = await dbRun(()=>supabase.from('peperiksaan').insert([formPep]));
    if (!ok) return;
    toast("Peperiksaan ditambah!","success"); setShowAddPep(false); setFormPep({...blankPep}); loadAll();
  };
  const handleEditPep = async (e) => {
    e.preventDefault();
    const { id, created_at, ...upd } = editPep;
    const ok = await dbRun(()=>supabase.from('peperiksaan').update(upd).eq('id',id));
    if (!ok) return;
    toast("Dikemaskini!","success"); setEditPep(null); loadAll();
  };
  const handleDelPep = async (id) => {
    const ok = await dbRun(()=>supabase.from('peperiksaan').delete().eq('id',id));
    if (ok) setPepList(d=>d.filter(r=>r.id!==id));
  };
  const cycleStatus = async (p) => {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(p.status)+1)%STATUS_CYCLE.length];
    const ok = await dbRun(()=>supabase.from('peperiksaan').update({status:next}).eq('id',p.id));
    if (ok) setPepList(d=>d.map(r=>r.id===p.id?{...r,status:next}:r));
  };

  // --- Tab 1 ---
  const handleSaveMarkah = async () => {
    if (!selPepId||!selKelas1||!selSubjek) return toast("Pilih peperiksaan, kelas dan subjek dulu.","error");
    setSavingMarkah(true);
    const isRendah = isTahunRendah(selKelas1);
    const upserts = muridList.map(m => {
      const val = markahEdit[m.nama]??"";
      if (val==="") return null;
      return {
        peperiksaan_id:selPepId, nama_murid:m.nama, kelas:selKelas1, mata_pelajaran:selSubjek,
        markah: isRendah?null:Number(val),
        band: isRendah?Number(val):null,
        gred: isRendah?null:getGred(val),
      };
    }).filter(Boolean);
    await supabase.from('peperiksaan_markah').delete()
      .eq('peperiksaan_id',selPepId).eq('kelas',selKelas1).eq('mata_pelajaran',selSubjek);
    if (upserts.length>0) {
      const ok = await dbRun(()=>supabase.from('peperiksaan_markah').insert(upserts));
      if (!ok) { setSavingMarkah(false); return; }
    }
    toast(`${upserts.length} rekod markah disimpan!`,"success");
    setSavingMarkah(false); loadMarkah(selPepId,selKelas1,selSubjek);
  };

  // --- Tab 4 ---
  const handleAddJadual = async (e) => {
    e.preventDefault();
    const ok = await dbRun(()=>supabase.from('peperiksaan_jadual').insert([formJadual]));
    if (!ok) return;
    toast("Jadual ditambah!","success"); setShowAddJadual(false); setFormJadual({...blankJadual}); loadAll();
  };
  const handleDelJadual = async (id) => {
    const ok = await dbRun(()=>supabase.from('peperiksaan_jadual').delete().eq('id',id));
    if (ok) setJadualList(d=>d.filter(r=>r.id!==id));
  };

  // --- Analisis compute ---
  const getAnalisisSummary = () => {
    const grouped = {};
    analisisData.forEach(r=>{ if(!grouped[r.mata_pelajaran]) grouped[r.mata_pelajaran]=[]; grouped[r.mata_pelajaran].push(r); });
    return Object.entries(grouped).map(([subj,rows])=>{
      const withM = rows.filter(r=>r.markah!==null);
      const withB = rows.filter(r=>r.band!==null);
      if (withM.length>0) {
        const marks = withM.map(r=>Number(r.markah));
        const purata = (marks.reduce((a,b)=>a+b,0)/marks.length).toFixed(1);
        const lulus = marks.filter(m=>m>=50).length;
        const cemerlang = marks.filter(m=>m>=80).length;
        return { subj, total:withM.length, purata, pctLulus:((lulus/withM.length)*100).toFixed(0), pctCemerlang:((cemerlang/withM.length)*100).toFixed(0), isPBD:false };
      } else {
        const bands = withB.map(r=>Number(r.band));
        const purata = (bands.reduce((a,b)=>a+b,0)/bands.length).toFixed(1);
        const lulus = bands.filter(b=>b>=3).length;
        return { subj, total:withB.length, purata, pctLulus:((lulus/withB.length)*100).toFixed(0), pctCemerlang:null, isPBD:true };
      }
    });
  };

  const getRanking = () => {
    const markahOnly = analisisData.filter(r=>r.markah!==null);
    const byMurid = {};
    markahOnly.forEach(r=>{
      if (!byMurid[r.nama_murid]) byMurid[r.nama_murid]={nama:r.nama_murid,kelas:r.kelas,total:0,count:0};
      byMurid[r.nama_murid].total+=Number(r.markah); byMurid[r.nama_murid].count+=1;
    });
    return Object.values(byMurid)
      .map(m=>({...m,purata:m.count>0?(m.total/m.count).toFixed(1):0}))
      .sort((a,b)=>b.total-a.total);
  };

  const selesai = pepList.filter(p=>p.status==="Selesai").length;
  const aktif = pepList.filter(p=>p.status==="Semasa").length;
  const selPep = pepList.find(p=>p.id===selPepId);
  const isRendahKelas = isTahunRendah(selKelas1);

  return (
    <KurPage title="Peperiksaan & Penilaian" sub="Kurikulum · SK Darau, Kota Kinabalu"
      stats={[
        {ico:"📝",val:pepList.length,lbl:"Jumlah Peperiksaan"},
        {ico:"✅",val:selesai,lbl:"Selesai"},
        {ico:"🔵",val:aktif,lbl:"Sedang Berjalan"},
        {ico:"⏳",val:pepList.length-selesai-aktif,lbl:"Akan Datang"},
      ]}>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {TABS_PEP.map((t,i)=>(
          <button key={i} onClick={()=>setSubtab(i)}
            style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,
              background:subtab===i?"var(--primary)":"var(--surface2)",color:subtab===i?"#fff":"var(--text2)",transition:"all .15s"}}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">⏳ Memuatkan…</div> : (<>

        {/* ── TAB 0: SENARAI PEPERIKSAAN ── */}
        {subtab===0 && (<>
          <div className="kur-header">
            <span style={{fontWeight:800,fontSize:14,color:"var(--text2)"}}>Senarai Peperiksaan Tahun Semasa</span>
            <button className="btn-add" onClick={()=>setShowAddPep(true)}>+ Tambah Peperiksaan</button>
          </div>
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead><tr><th>#</th><th>Nama Peperiksaan</th><th>Jenis</th><th>Tarikh Mula</th><th>Tarikh Tamat</th><th>Kelas Sasaran</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {pepList.length===0 && <tr><td colSpan={8} style={{textAlign:"center",color:"var(--text3)",padding:32}}>Tiada rekod. Tambah peperiksaan.</td></tr>}
                {pepList.map((p,i)=>(
                  <tr key={p.id}>
                    <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
                    <td style={{fontWeight:800}}>{p.nama}</td>
                    <td><span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:"var(--surface2)",fontWeight:700}}>{p.jenis||"—"}</span></td>
                    <td style={{color:"var(--text2)",fontSize:12}}>{p.tarikh_mula||p.tarikh||"—"}</td>
                    <td style={{color:"var(--text2)",fontSize:12}}>{p.tarikh_tamat||"—"}</td>
                    <td style={{fontSize:12}}>{p.kelas_sasaran||"Semua"}</td>
                    <td><span className={`badge ${badgeMap[p.status]||"b-gray"}`} style={{cursor:"pointer"}} onClick={()=>cycleStatus(p)} title="Klik tukar status">{p.status}</span></td>
                    <td style={{display:"flex",gap:4}}>
                      <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditPep({...p})}>✏️</button>
                      <button className="btn-del" onClick={()=>handleDelPep(p.id)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showAddPep && (
            <Modal title="Tambah Peperiksaan" onClose={()=>{setShowAddPep(false);setFormPep({...blankPep});}}>
              <form onSubmit={handleAddPep}>
                <div className="form-field"><label className="form-label">Nama Peperiksaan</label>
                  <input className="form-input" required value={formPep.nama} onChange={e=>setFormPep(f=>({...f,nama:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Jenis</label>
                    <select className="form-input" value={formPep.jenis} onChange={e=>setFormPep(f=>({...f,jenis:e.target.value}))}>
                      {JENIS_LIST.map(j=><option key={j}>{j}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label className="form-label">Kelas Sasaran</label>
                    <select className="form-input" value={formPep.kelas_sasaran} onChange={e=>setFormPep(f=>({...f,kelas_sasaran:e.target.value}))}>
                      <option>Semua</option>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Tarikh Mula</label>
                    <input className="form-input" type="date" value={formPep.tarikh_mula} onChange={e=>setFormPep(f=>({...f,tarikh_mula:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Tarikh Tamat</label>
                    <input className="form-input" type="date" value={formPep.tarikh_tamat} onChange={e=>setFormPep(f=>({...f,tarikh_tamat:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-field"><label className="form-label">Status</label>
                  <select className="form-input" value={formPep.status} onChange={e=>setFormPep(f=>({...f,status:e.target.value}))}>
                    {STATUS_CYCLE.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <button className="btn-primary" type="submit">+ Tambah</button>
              </form>
            </Modal>
          )}
          {editPep && (
            <Modal title={`Edit — ${editPep.nama}`} onClose={()=>setEditPep(null)}>
              <form onSubmit={handleEditPep}>
                <div className="form-field"><label className="form-label">Nama Peperiksaan</label>
                  <input className="form-input" required value={editPep.nama} onChange={e=>setEditPep(f=>({...f,nama:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Jenis</label>
                    <select className="form-input" value={editPep.jenis||""} onChange={e=>setEditPep(f=>({...f,jenis:e.target.value}))}>
                      {JENIS_LIST.map(j=><option key={j}>{j}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label className="form-label">Kelas Sasaran</label>
                    <select className="form-input" value={editPep.kelas_sasaran||"Semua"} onChange={e=>setEditPep(f=>({...f,kelas_sasaran:e.target.value}))}>
                      <option>Semua</option>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Tarikh Mula</label>
                    <input className="form-input" type="date" value={editPep.tarikh_mula||""} onChange={e=>setEditPep(f=>({...f,tarikh_mula:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Tarikh Tamat</label>
                    <input className="form-input" type="date" value={editPep.tarikh_tamat||""} onChange={e=>setEditPep(f=>({...f,tarikh_tamat:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-field"><label className="form-label">Status</label>
                  <select className="form-input" value={editPep.status} onChange={e=>setEditPep(f=>({...f,status:e.target.value}))}>
                    {STATUS_CYCLE.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
              </form>
            </Modal>
          )}
        </>)}

        {/* ── TAB 1: MARKAH MURID ── */}
        {subtab===1 && (<>
          <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div className="form-field" style={{marginBottom:0,minWidth:200}}>
              <label className="form-label">Peperiksaan</label>
              <select className="form-input" value={selPepId} onChange={e=>setSelPepId(e.target.value)}>
                <option value="">— Pilih Peperiksaan —</option>
                {pepList.map(p=><option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>
            <div className="form-field" style={{marginBottom:0,minWidth:160}}>
              <label className="form-label">Kelas</label>
              <select className="form-input" value={selKelas1} onChange={e=>setSelKelas1(e.target.value)}>
                <option value="">— Pilih Kelas —</option>
                {KELAS_LIST.map(k=><option key={k}>{k}</option>)}
              </select>
            </div>
            <div className="form-field" style={{marginBottom:0,minWidth:140}}>
              <label className="form-label">Mata Pelajaran</label>
              <select className="form-input" value={selSubjek} onChange={e=>setSelSubjek(e.target.value)}>
                {SUBJECT_LIST.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {!selPepId||!selKelas1 ? (
            <div style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
              <div style={{fontSize:32,marginBottom:8}}>📝</div>
              <div style={{fontWeight:700}}>Pilih peperiksaan dan kelas untuk masuk markah</div>
            </div>
          ) : (<>
            <div style={{marginBottom:12,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <span style={{fontWeight:800,fontSize:14}}>{selPep?.nama} — {selKelas1} — {selSubjek}</span>
              {isRendahKelas
                ? <span style={{fontSize:11,padding:"3px 10px",borderRadius:6,background:"#dbeafe",color:"#1d4ed8",fontWeight:700}}>🏫 PBD Band 1–6</span>
                : <span style={{fontSize:11,padding:"3px 10px",borderRadius:6,background:"#dcfce7",color:"#166534",fontWeight:700}}>📊 Markah 0–100</span>
              }
              <span style={{fontSize:11,color:"var(--text3)"}}>({muridList.length} murid)</span>
            </div>
            {muridList.length===0 ? (
              <div style={{textAlign:"center",padding:40,color:"var(--text3)"}}>Tiada murid dalam kelas ini. Pastikan data murid sudah dimuat naik.</div>
            ) : (
              <div className="kur-table-wrap">
                <table className="kur-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Nama Murid</th>
                      <th>{isRendahKelas?"Band (1–6)":"Markah (0–100)"}</th>
                      {!isRendahKelas && <th>Gred</th>}
                      {isRendahKelas && <th>Huraian Band</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {muridList.map((m,i)=>{
                      const val = markahEdit[m.nama]??"";
                      const gred = isRendahKelas?null:getGred(val);
                      const gc = gred==="A+"||gred==="A"?"#16a34a":gred==="B"?"#2563eb":gred==="C"?"#d97706":gred==="D"?"#ea580c":gred==="E"?"#dc2626":"var(--text3)";
                      return (
                        <tr key={m.id}>
                          <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
                          <td style={{fontWeight:700}}>{m.nama}</td>
                          <td>
                            <input type="number" min={isRendahKelas?1:0} max={isRendahKelas?6:100}
                              style={{width:80,padding:"4px 8px",borderRadius:6,border:"1.5px solid var(--border)",fontSize:13,fontWeight:700,textAlign:"center"}}
                              value={val} placeholder={isRendahKelas?"1–6":"0–100"}
                              onChange={e=>setMarkahEdit(prev=>({...prev,[m.nama]:e.target.value}))}
                            />
                          </td>
                          {!isRendahKelas && <td><span style={{fontWeight:800,color:gc}}>{gred}</span></td>}
                          {isRendahKelas && <td style={{fontSize:11,color:"var(--text2)"}}>{val?BAND_DESC[Number(val)]||"":""}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{marginTop:14}}>
              <button className="btn-primary" onClick={handleSaveMarkah} disabled={savingMarkah}>
                {savingMarkah?"⏳ Menyimpan…":"💾 Simpan Semua Markah"}
              </button>
            </div>
          </>)}
        </>)}

        {/* ── TAB 2: ANALISIS ── */}
        {subtab===2 && (<>
          <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div className="form-field" style={{marginBottom:0,minWidth:200}}>
              <label className="form-label">Peperiksaan</label>
              <select className="form-input" value={analisisPepId} onChange={e=>setAnalisisPepId(e.target.value)}>
                <option value="">— Pilih Peperiksaan —</option>
                {pepList.map(p=><option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>
            <div className="form-field" style={{marginBottom:0,minWidth:160}}>
              <label className="form-label">Kelas (kosong = semua)</label>
              <select className="form-input" value={analisisKelas} onChange={e=>setAnalisisKelas(e.target.value)}>
                <option value="">Semua Kelas</option>
                {KELAS_LIST.map(k=><option key={k}>{k}</option>)}
              </select>
            </div>
          </div>
          {!analisisPepId ? (
            <div style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
              <div style={{fontSize:32,marginBottom:8}}>📊</div>
              <div style={{fontWeight:700}}>Pilih peperiksaan untuk lihat analisis prestasi</div>
            </div>
          ) : (()=>{
            const summary = getAnalisisSummary();
            if (summary.length===0) return <div style={{textAlign:"center",padding:40,color:"var(--text3)"}}>Tiada data markah untuk peperiksaan ini. Masuk markah dahulu di tab Markah Murid.</div>;
            return (
              <div className="kur-table-wrap">
                <table className="kur-table">
                  <thead><tr><th>#</th><th>Mata Pelajaran</th><th>Bil Murid</th><th>Purata</th><th>% Lulus</th><th>% Cemerlang</th><th>Status</th></tr></thead>
                  <tbody>
                    {summary.map((s,i)=>{
                      const lulus = Number(s.pctLulus);
                      const stat = lulus>=80?"🟢 Baik":lulus>=60?"🟡 Sederhana":"🔴 Perlu Perhatian";
                      return (
                        <tr key={s.subj}>
                          <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
                          <td style={{fontWeight:800}}>{s.subj}</td>
                          <td>{s.total}</td>
                          <td style={{fontWeight:800,color:"var(--primary)"}}>{s.isPBD?`Band ${s.purata}`:s.purata}</td>
                          <td>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{flex:1,height:8,borderRadius:4,background:"var(--surface2)",overflow:"hidden",minWidth:60}}>
                                <div style={{height:"100%",borderRadius:4,background:lulus>=80?"#16a34a":lulus>=60?"#d97706":"#dc2626",width:`${lulus}%`}}/>
                              </div>
                              <span style={{fontWeight:700,fontSize:12,minWidth:32}}>{s.pctLulus}%</span>
                            </div>
                          </td>
                          <td style={{fontWeight:700}}>{s.isPBD?"—":s.pctCemerlang+"%"}</td>
                          <td>{stat}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </>)}

        {/* ── TAB 3: RANKING ── */}
        {subtab===3 && (<>
          <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div className="form-field" style={{marginBottom:0,minWidth:200}}>
              <label className="form-label">Peperiksaan</label>
              <select className="form-input" value={analisisPepId} onChange={e=>setAnalisisPepId(e.target.value)}>
                <option value="">— Pilih Peperiksaan —</option>
                {pepList.map(p=><option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>
            <div className="form-field" style={{marginBottom:0,minWidth:160}}>
              <label className="form-label">Kelas</label>
              <select className="form-input" value={analisisKelas} onChange={e=>setAnalisisKelas(e.target.value)}>
                <option value="">Semua Kelas</option>
                {KELAS_LIST.map(k=><option key={k}>{k}</option>)}
              </select>
            </div>
          </div>
          {!analisisPepId ? (
            <div style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
              <div style={{fontSize:32,marginBottom:8}}>🏆</div>
              <div style={{fontWeight:700}}>Pilih peperiksaan untuk lihat ranking murid</div>
            </div>
          ) : (()=>{
            const ranking = getRanking();
            if (ranking.length===0) return <div style={{textAlign:"center",padding:40,color:"var(--text3)"}}>Tiada data markah angka untuk ranking. Hanya Tahun 4–6 disokong (bukan PBD).</div>;
            return (
              <div className="kur-table-wrap">
                <table className="kur-table">
                  <thead><tr><th>Kedudukan</th><th>Nama Murid</th><th>Kelas</th><th>Jumlah Markah</th><th>Purata</th><th>Gred Purata</th></tr></thead>
                  <tbody>
                    {ranking.slice(0,30).map((m,i)=>{
                      const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":"";
                      const gred = getGred(m.purata);
                      return (
                        <tr key={m.nama} style={{background:i<3?"var(--surface2)":""}}>
                          <td style={{fontWeight:800,fontSize:16,color:i===0?"#ca8a04":i===1?"#64748b":i===2?"#b45309":"var(--text3)"}}>{medal} {i+1}</td>
                          <td style={{fontWeight:800}}>{m.nama}</td>
                          <td style={{color:"var(--text2)"}}>{m.kelas}</td>
                          <td style={{fontWeight:800,color:"var(--primary)"}}>{m.total}</td>
                          <td style={{fontWeight:700}}>{m.purata}</td>
                          <td><span style={{fontWeight:800,padding:"2px 8px",borderRadius:6,background:"var(--surface2)"}}>{gred}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </>)}

        {/* ── TAB 4: JADUAL PEPERIKSAAN ── */}
        {subtab===4 && (<>
          <div className="kur-header">
            <select className="form-input" style={{minWidth:200}} value={filterJadualId} onChange={e=>setFilterJadualId(e.target.value)}>
              <option value="">— Tapis ikut Peperiksaan —</option>
              {pepList.map(p=><option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
            <button className="btn-add" onClick={()=>setShowAddJadual(true)}>+ Tambah Jadual</button>
          </div>
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead><tr><th>#</th><th>Peperiksaan</th><th>Tarikh</th><th>Masa</th><th>Mata Pelajaran</th><th>Kelas</th><th>Bilik/Dewan</th><th>Pengawas</th><th></th></tr></thead>
              <tbody>
                {jadualList.filter(j=>!filterJadualId||j.peperiksaan_id===filterJadualId).length===0 && (
                  <tr><td colSpan={9} style={{textAlign:"center",color:"var(--text3)",padding:32}}>Tiada jadual peperiksaan. Tambah jadual.</td></tr>
                )}
                {jadualList.filter(j=>!filterJadualId||j.peperiksaan_id===filterJadualId).map((j,i)=>{
                  const pep = pepList.find(p=>p.id===j.peperiksaan_id);
                  return (
                    <tr key={j.id}>
                      <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
                      <td style={{fontWeight:700,fontSize:12}}>{pep?.nama||"—"}</td>
                      <td style={{color:"var(--text2)",fontSize:12}}>{j.tarikh}</td>
                      <td style={{fontSize:12}}>{j.masa_mula}–{j.masa_tamat}</td>
                      <td><span style={{fontWeight:800,padding:"2px 8px",borderRadius:6,background:SC[j.mata_pelajaran]||"var(--surface2)",color:SC[j.mata_pelajaran]?"#fff":"var(--text1)",fontSize:11}}>{j.mata_pelajaran}</span></td>
                      <td style={{fontSize:12}}>{j.kelas}</td>
                      <td style={{fontSize:12,color:"var(--text2)"}}>{j.bilik}</td>
                      <td style={{fontSize:12,color:"var(--text2)"}}>{j.pengawas||"—"}</td>
                      <td><button className="btn-del" onClick={()=>handleDelJadual(j.id)}>🗑</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {showAddJadual && (
            <Modal title="Tambah Jadual Peperiksaan" onClose={()=>{setShowAddJadual(false);setFormJadual({...blankJadual});}}>
              <form onSubmit={handleAddJadual}>
                <div className="form-field"><label className="form-label">Peperiksaan</label>
                  <select className="form-input" required value={formJadual.peperiksaan_id} onChange={e=>setFormJadual(f=>({...f,peperiksaan_id:e.target.value}))}>
                    <option value="">— Pilih —</option>
                    {pepList.map(p=><option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Tarikh</label>
                    <input className="form-input" type="date" required value={formJadual.tarikh} onChange={e=>setFormJadual(f=>({...f,tarikh:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Mata Pelajaran</label>
                    <select className="form-input" value={formJadual.mata_pelajaran} onChange={e=>setFormJadual(f=>({...f,mata_pelajaran:e.target.value}))}>
                      {SUBJECT_LIST.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Masa Mula</label>
                    <input className="form-input" type="time" value={formJadual.masa_mula} onChange={e=>setFormJadual(f=>({...f,masa_mula:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Masa Tamat</label>
                    <input className="form-input" type="time" value={formJadual.masa_tamat} onChange={e=>setFormJadual(f=>({...f,masa_tamat:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Kelas</label>
                    <select className="form-input" value={formJadual.kelas} onChange={e=>setFormJadual(f=>({...f,kelas:e.target.value}))}>
                      <option>Semua</option>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label className="form-label">Bilik / Dewan</label>
                    <input className="form-input" value={formJadual.bilik} onChange={e=>setFormJadual(f=>({...f,bilik:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-field"><label className="form-label">Pengawas</label>
                  <input className="form-input" value={formJadual.pengawas} onChange={e=>setFormJadual(f=>({...f,pengawas:e.target.value}))} placeholder="Nama guru pengawas"/>
                </div>
                <button className="btn-primary" type="submit">+ Tambah Jadual</button>
              </form>
            </Modal>
          )}
        </>)}

      </>)}
    </KurPage>
  );
}

// ─── 4. ERPH / REKOD MENGAJAR ─────────────────────────────────────────────────
const ERPH_URL = "https://erph-sk-darau.vercel.app/";

function RPHRekod() {
  return (
    <KurPage title="eRPH / Rekod Mengajar" sub="Kurikulum · SK Darau, Kota Kinabalu"
      stats={[
        {ico:"📄",lbl:"Sistem eRPH",val:"Aktif"},
        {ico:"🌐",lbl:"Platform",val:"Web"},
        {ico:"📝",lbl:"Rekod Mengajar",val:"Online"},
        {ico:"✅",lbl:"Status",val:"Online"},
      ]}>
      <EmbedFrame url={ERPH_URL} title="eRPH SK Darau" />
    </KurPage>
  );
}

// ─── 5. PROGRAM AKADEMIK ──────────────────────────────────────────────────────
function ProgramAkademik() {
  const TABS_PROG = ["📋 Senarai","📅 Takwim","👥 Peserta","📊 Laporan"];
  const JENIS_PROG = ["Intervensi","Pemulihan","Pengayaan","Kem Motivasi","Bengkel","Kelas Tambahan","Hari Terbuka","Program Bacaan","Lain-lain"];
  const STATUS_PROG = ["Akan Datang","Sedang Berjalan","Selesai"];
  const badgeMap = { "Sedang Berjalan":"b-green","Akan Datang":"b-yellow","Selesai":"b-gray" };
  const BULAN = ["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"];

  const [subtab, setSubtab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Tab 0
  const [progList, setProgList] = useState([]);
  const [showAddProg, setShowAddProg] = useState(false);
  const [editProg, setEditProg] = useState(null);
  const blankProg = { nama:"", jenis:"Intervensi", tarikh_mula:"", tarikh_tamat:"", sasaran_kelas:"Semua", pegawai:"", tempat:"", deskripsi:"", color:"#2563eb", status:"Akan Datang" };
  const [formProg, setFormProg] = useState({...blankProg});

  // Tab 2
  const [selProgId, setSelProgId] = useState("");
  const [pesertaList, setPesertaList] = useState([]);
  const [pesertaMurid, setPesertaMurid] = useState([]);
  const [selKelasPes, setSelKelasPes] = useState("");
  const [showAddPes, setShowAddPes] = useState(false);
  const blankPes = { program_id:"", nama_murid:"", kelas:"", hadir:true };
  const [formPes, setFormPes] = useState({...blankPes});

  // Tab 3
  const [selProgLap, setSelProgLap] = useState("");
  const [laporanList, setLaporanList] = useState([]);
  const [showAddLap, setShowAddLap] = useState(false);
  const blankLap = { program_id:"", pencapaian:"", impak:"", cadangan:"", tarikh_laporan:"" };
  const [formLap, setFormLap] = useState({...blankLap});
  const [editLap, setEditLap] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    const [r1,r2,r3] = await Promise.all([
      supabase.from('program_akademik').select('*').order('created_at',{ascending:false}),
      supabase.from('program_peserta').select('*').order('created_at'),
      supabase.from('program_laporan').select('*').order('created_at',{ascending:false}),
    ]);
    setProgList(r1.data||[]); setPesertaList(r2.data||[]); setLaporanList(r3.data||[]);
    setLoading(false);
  };

  const loadPesertaMurid = async (kelas) => {
    if (!kelas) return;
    const { data } = await supabase.from('hem_murid').select('id,nama,no_kelas').eq('kelas',kelas).order('nama');
    setPesertaMurid(data||[]);
  };

  useEffect(()=>{ loadAll(); },[]);
  useEffect(()=>{ if(selKelasPes) loadPesertaMurid(selKelasPes); },[selKelasPes]);

  // Tab 0 handlers
  const handleAddProg = async (e) => {
    e.preventDefault();
    const ok = await dbRun(()=>supabase.from('program_akademik').insert([formProg]));
    if (!ok) return;
    toast("Program ditambah!","success"); setShowAddProg(false); setFormProg({...blankProg}); loadAll();
  };
  const handleEditProg = async (e) => {
    e.preventDefault();
    const { id, created_at, ...upd } = editProg;
    const ok = await dbRun(()=>supabase.from('program_akademik').update(upd).eq('id',id));
    if (!ok) return;
    toast("Dikemaskini!","success"); setEditProg(null); loadAll();
  };
  const handleDelProg = async (id) => {
    const ok = await dbRun(()=>supabase.from('program_akademik').delete().eq('id',id));
    if (ok) setProgList(d=>d.filter(r=>r.id!==id));
  };

  // Tab 2 handlers
  const handleAddPes = async (e) => {
    e.preventDefault();
    const upserts = pesertaMurid.map(m=>({ program_id:selProgId, nama_murid:m.nama, kelas:selKelasPes, hadir:true }));
    if (upserts.length===0) return toast("Tiada murid dalam kelas ini.","error");
    await supabase.from('program_peserta').delete().eq('program_id',selProgId).eq('kelas',selKelasPes);
    const ok = await dbRun(()=>supabase.from('program_peserta').insert(upserts));
    if (!ok) return;
    toast(`${upserts.length} peserta didaftarkan!`,"success"); loadAll();
  };
  const toggleHadir = async (p) => {
    const ok = await dbRun(()=>supabase.from('program_peserta').update({hadir:!p.hadir}).eq('id',p.id));
    if (ok) setPesertaList(d=>d.map(r=>r.id===p.id?{...r,hadir:!r.hadir}:r));
  };
  const handleDelPes = async (id) => {
    const ok = await dbRun(()=>supabase.from('program_peserta').delete().eq('id',id));
    if (ok) setPesertaList(d=>d.filter(r=>r.id!==id));
  };

  // Tab 3 handlers
  const handleAddLap = async (e) => {
    e.preventDefault();
    const ok = await dbRun(()=>supabase.from('program_laporan').insert([{...formLap,program_id:selProgLap}]));
    if (!ok) return;
    toast("Laporan disimpan!","success"); setShowAddLap(false); setFormLap({...blankLap}); loadAll();
  };
  const handleEditLap = async (e) => {
    e.preventDefault();
    const { id, created_at, ...upd } = editLap;
    const ok = await dbRun(()=>supabase.from('program_laporan').update(upd).eq('id',id));
    if (!ok) return;
    toast("Dikemaskini!","success"); setEditLap(null); loadAll();
  };
  const handleDelLap = async (id) => {
    const ok = await dbRun(()=>supabase.from('program_laporan').delete().eq('id',id));
    if (ok) setLaporanList(d=>d.filter(r=>r.id!==id));
  };

  // Stats
  const aktif = progList.filter(p=>p.status==="Sedang Berjalan").length;
  const selesai = progList.filter(p=>p.status==="Selesai").length;

  // Takwim: group by month of tarikh_mula
  const byBulan = {};
  progList.forEach(p=>{
    const d = p.tarikh_mula ? new Date(p.tarikh_mula) : null;
    const key = d ? `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}` : "tiada-tarikh";
    const label = d ? `${BULAN[d.getMonth()]} ${d.getFullYear()}` : "Tiada Tarikh";
    if (!byBulan[key]) byBulan[key] = { label, items:[] };
    byBulan[key].items.push(p);
  });
  const takwimGroups = Object.entries(byBulan).sort(([a],[b])=>a.localeCompare(b));

  const filteredPeserta = pesertaList.filter(p=>!selProgId||p.program_id===selProgId);
  const filteredLaporan = laporanList.filter(l=>!selProgLap||l.program_id===selProgLap);
  const selProgObj = progList.find(p=>p.id===selProgId);
  const selProgLapObj = progList.find(p=>p.id===selProgLap);

  return (
    <KurPage title="Program Akademik" sub="Kurikulum · SK Darau, Kota Kinabalu"
      stats={[
        {ico:"🎯",val:progList.length,lbl:"Jumlah Program"},
        {ico:"🟢",val:aktif,lbl:"Sedang Berjalan"},
        {ico:"✅",val:selesai,lbl:"Selesai"},
        {ico:"⏳",val:progList.length-aktif-selesai,lbl:"Akan Datang"},
      ]}>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {TABS_PROG.map((t,i)=>(
          <button key={i} onClick={()=>setSubtab(i)}
            style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,
              background:subtab===i?"var(--primary)":"var(--surface2)",color:subtab===i?"#fff":"var(--text2)",transition:"all .15s"}}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">⏳ Memuatkan…</div> : (<>

        {/* ── TAB 0: SENARAI PROGRAM ── */}
        {subtab===0 && (<>
          <div className="kur-header">
            <span style={{fontWeight:800,fontSize:14,color:"var(--text2)"}}>Program Akademik {new Date().getFullYear()}</span>
            <button className="btn-add" onClick={()=>setShowAddProg(true)}>+ Tambah Program</button>
          </div>
          {progList.length===0 ? (
            <div style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
              <div style={{fontSize:32,marginBottom:8}}>🎯</div>
              <div style={{fontWeight:700}}>Tiada program. Tambah program akademik.</div>
            </div>
          ) : (
            <div className="prog-grid">
              {progList.map(p=>(
                <div className="prog-card" key={p.id}>
                  <div className="prog-card-accent" style={{background:p.color||"#2563eb"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div className="prog-title">{p.nama}</div>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      <span className={`badge ${badgeMap[p.status]||"b-gray"}`}>{p.status}</span>
                      <button className="btn-add" style={{padding:"3px 8px",fontSize:11}} onClick={()=>setEditProg({...p})}>✏️</button>
                      <button className="btn-del" onClick={()=>handleDelProg(p.id)}>🗑</button>
                    </div>
                  </div>
                  {p.jenis && <div style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:"var(--surface2)",display:"inline-block",fontWeight:700,marginBottom:6,color:"var(--text2)"}}>{p.jenis}</div>}
                  <div className="prog-date">📅 {p.tarikh_mula||p.tarikh||"—"}{p.tarikh_tamat?` → ${p.tarikh_tamat}`:""}</div>
                  {p.sasaran_kelas && <div style={{fontSize:11,color:"var(--text3)",marginTop:3}}>🏫 {p.sasaran_kelas}</div>}
                  {p.pegawai && <div style={{fontSize:11,color:"var(--text3)"}}>👤 {p.pegawai}</div>}
                  {p.tempat && <div style={{fontSize:11,color:"var(--text3)"}}>📍 {p.tempat}</div>}
                  {p.deskripsi && <div className="prog-desc" style={{marginTop:6}}>{p.deskripsi}</div>}
                </div>
              ))}
            </div>
          )}
          {showAddProg && (
            <Modal title="Tambah Program Akademik" onClose={()=>{setShowAddProg(false);setFormProg({...blankProg});}}>
              <form onSubmit={handleAddProg}>
                <div className="form-field"><label className="form-label">Nama Program</label>
                  <input className="form-input" required value={formProg.nama} onChange={e=>setFormProg(f=>({...f,nama:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Jenis</label>
                    <select className="form-input" value={formProg.jenis} onChange={e=>setFormProg(f=>({...f,jenis:e.target.value}))}>
                      {JENIS_PROG.map(j=><option key={j}>{j}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label className="form-label">Kelas Sasaran</label>
                    <select className="form-input" value={formProg.sasaran_kelas} onChange={e=>setFormProg(f=>({...f,sasaran_kelas:e.target.value}))}>
                      <option>Semua</option>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Tarikh Mula</label>
                    <input className="form-input" type="date" value={formProg.tarikh_mula} onChange={e=>setFormProg(f=>({...f,tarikh_mula:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Tarikh Tamat</label>
                    <input className="form-input" type="date" value={formProg.tarikh_tamat} onChange={e=>setFormProg(f=>({...f,tarikh_tamat:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Pegawai Bertanggungjawab</label>
                    <input className="form-input" value={formProg.pegawai} onChange={e=>setFormProg(f=>({...f,pegawai:e.target.value}))} placeholder="Nama guru/PK"/>
                  </div>
                  <div className="form-field"><label className="form-label">Tempat</label>
                    <input className="form-input" value={formProg.tempat} onChange={e=>setFormProg(f=>({...f,tempat:e.target.value}))} placeholder="cth: Dewan, Bilik..."/>
                  </div>
                </div>
                <div className="form-field"><label className="form-label">Deskripsi</label>
                  <textarea className="form-input" rows={2} value={formProg.deskripsi} onChange={e=>setFormProg(f=>({...f,deskripsi:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Status</label>
                    <select className="form-input" value={formProg.status} onChange={e=>setFormProg(f=>({...f,status:e.target.value}))}>
                      {STATUS_PROG.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label className="form-label">Warna Kad</label>
                    <input className="form-input" type="color" value={formProg.color} onChange={e=>setFormProg(f=>({...f,color:e.target.value}))} style={{height:38,padding:4}}/>
                  </div>
                </div>
                <button className="btn-primary" type="submit">+ Tambah</button>
              </form>
            </Modal>
          )}
          {editProg && (
            <Modal title={`Edit — ${editProg.nama}`} onClose={()=>setEditProg(null)}>
              <form onSubmit={handleEditProg}>
                <div className="form-field"><label className="form-label">Nama Program</label>
                  <input className="form-input" required value={editProg.nama} onChange={e=>setEditProg(f=>({...f,nama:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Jenis</label>
                    <select className="form-input" value={editProg.jenis||""} onChange={e=>setEditProg(f=>({...f,jenis:e.target.value}))}>
                      {JENIS_PROG.map(j=><option key={j}>{j}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label className="form-label">Kelas Sasaran</label>
                    <select className="form-input" value={editProg.sasaran_kelas||"Semua"} onChange={e=>setEditProg(f=>({...f,sasaran_kelas:e.target.value}))}>
                      <option>Semua</option>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Tarikh Mula</label>
                    <input className="form-input" type="date" value={editProg.tarikh_mula||""} onChange={e=>setEditProg(f=>({...f,tarikh_mula:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Tarikh Tamat</label>
                    <input className="form-input" type="date" value={editProg.tarikh_tamat||""} onChange={e=>setEditProg(f=>({...f,tarikh_tamat:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Pegawai</label>
                    <input className="form-input" value={editProg.pegawai||""} onChange={e=>setEditProg(f=>({...f,pegawai:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Tempat</label>
                    <input className="form-input" value={editProg.tempat||""} onChange={e=>setEditProg(f=>({...f,tempat:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-field"><label className="form-label">Deskripsi</label>
                  <textarea className="form-input" rows={2} value={editProg.deskripsi||""} onChange={e=>setEditProg(f=>({...f,deskripsi:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Status</label>
                    <select className="form-input" value={editProg.status} onChange={e=>setEditProg(f=>({...f,status:e.target.value}))}>
                      {STATUS_PROG.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label className="form-label">Warna Kad</label>
                    <input className="form-input" type="color" value={editProg.color||"#2563eb"} onChange={e=>setEditProg(f=>({...f,color:e.target.value}))} style={{height:38,padding:4}}/>
                  </div>
                </div>
                <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
              </form>
            </Modal>
          )}
        </>)}

        {/* ── TAB 1: TAKWIM ── */}
        {subtab===1 && (<>
          {takwimGroups.length===0 ? (
            <div style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
              <div style={{fontSize:32,marginBottom:8}}>📅</div>
              <div style={{fontWeight:700}}>Tiada program dengan tarikh. Tambah tarikh mula pada program.</div>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:24}}>
              {takwimGroups.map(([key,grp])=>(
                <div key={key}>
                  <div style={{fontWeight:900,fontSize:15,color:"var(--primary)",marginBottom:10,paddingBottom:6,borderBottom:"2px solid var(--primary)"}}>
                    📅 {grp.label}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {grp.items.map(p=>(
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,background:"var(--surface)",border:"1.5px solid var(--border)"}}>
                        <div style={{width:4,height:40,borderRadius:2,background:p.color||"#2563eb",flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:800,fontSize:13}}>{p.nama}</div>
                          <div style={{fontSize:11,color:"var(--text3)"}}>{p.jenis} · {p.sasaran_kelas||"Semua"} {p.pegawai?`· ${p.pegawai}`:""}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <span className={`badge ${badgeMap[p.status]||"b-gray"}`}>{p.status}</span>
                          {p.tarikh_tamat && <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>Tamat: {p.tarikh_tamat}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>)}

        {/* ── TAB 2: PESERTA ── */}
        {subtab===2 && (<>
          <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div className="form-field" style={{marginBottom:0,minWidth:220}}>
              <label className="form-label">Program</label>
              <select className="form-input" value={selProgId} onChange={e=>setSelProgId(e.target.value)}>
                <option value="">— Pilih Program —</option>
                {progList.map(p=><option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>
            <div className="form-field" style={{marginBottom:0,minWidth:160}}>
              <label className="form-label">Kelas (untuk daftar murid)</label>
              <select className="form-input" value={selKelasPes} onChange={e=>setSelKelasPes(e.target.value)}>
                <option value="">— Pilih Kelas —</option>
                {KELAS_LIST.map(k=><option key={k}>{k}</option>)}
              </select>
            </div>
            {selProgId && selKelasPes && pesertaMurid.length>0 && (
              <button className="btn-add" onClick={handleAddPes}>+ Daftar {pesertaMurid.length} Murid</button>
            )}
          </div>

          {!selProgId ? (
            <div style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
              <div style={{fontSize:32,marginBottom:8}}>👥</div>
              <div style={{fontWeight:700}}>Pilih program untuk lihat atau daftar peserta</div>
            </div>
          ) : (<>
            <div style={{marginBottom:10,fontWeight:800,fontSize:14}}>
              {selProgObj?.nama} — {filteredPeserta.length} peserta
              {filteredPeserta.length>0 && <span style={{marginLeft:8,fontSize:12,color:"#16a34a",fontWeight:700}}>✅ {filteredPeserta.filter(p=>p.hadir).length} hadir</span>}
            </div>
            {filteredPeserta.length===0 ? (
              <div style={{textAlign:"center",padding:40,color:"var(--text3)"}}>Tiada peserta. Pilih kelas dan klik "Daftar Murid".</div>
            ) : (
              <div className="kur-table-wrap">
                <table className="kur-table">
                  <thead><tr><th>#</th><th>Nama Murid</th><th>Kelas</th><th>Kehadiran</th><th></th></tr></thead>
                  <tbody>
                    {filteredPeserta.map((p,i)=>(
                      <tr key={p.id}>
                        <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
                        <td style={{fontWeight:700}}>{p.nama_murid}</td>
                        <td style={{color:"var(--text2)"}}>{p.kelas}</td>
                        <td>
                          <span style={{cursor:"pointer",fontSize:13,fontWeight:700,padding:"3px 10px",borderRadius:6,
                            background:p.hadir?"#dcfce7":"#fee2e2",color:p.hadir?"#166534":"#991b1b"}}
                            onClick={()=>toggleHadir(p)}>
                            {p.hadir?"✅ Hadir":"❌ Tidak Hadir"}
                          </span>
                        </td>
                        <td><button className="btn-del" onClick={()=>handleDelPes(p.id)}>🗑</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>)}
        </>)}

        {/* ── TAB 3: LAPORAN ── */}
        {subtab===3 && (<>
          <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div className="form-field" style={{marginBottom:0,minWidth:220}}>
              <label className="form-label">Program</label>
              <select className="form-input" value={selProgLap} onChange={e=>setSelProgLap(e.target.value)}>
                <option value="">— Pilih Program —</option>
                {progList.map(p=><option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>
            {selProgLap && <button className="btn-add" onClick={()=>{setFormLap({...blankLap,program_id:selProgLap});setShowAddLap(true);}}>+ Tambah Laporan</button>}
          </div>

          {!selProgLap ? (
            <div style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
              <div style={{fontSize:32,marginBottom:8}}>📊</div>
              <div style={{fontWeight:700}}>Pilih program untuk lihat atau tambah laporan penilaian</div>
            </div>
          ) : (<>
            {filteredLaporan.length===0 ? (
              <div style={{textAlign:"center",padding:40,color:"var(--text3)"}}>Tiada laporan lagi. Tambah laporan penilaian program.</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {filteredLaporan.map(l=>{
                  const prog = progList.find(p=>p.id===l.program_id);
                  return (
                    <div key={l.id} style={{padding:"14px 16px",borderRadius:12,background:"var(--surface)",border:"1.5px solid var(--border)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div style={{fontWeight:800,fontSize:13}}>{prog?.nama||"—"}</div>
                        <div style={{display:"flex",gap:4,alignItems:"center"}}>
                          <span style={{fontSize:11,color:"var(--text3)"}}>{l.tarikh_laporan||""}</span>
                          <button className="btn-add" style={{padding:"3px 8px",fontSize:11}} onClick={()=>setEditLap({...l})}>✏️</button>
                          <button className="btn-del" onClick={()=>handleDelLap(l.id)}>🗑</button>
                        </div>
                      </div>
                      {l.pencapaian && <div style={{marginBottom:6}}><span style={{fontWeight:700,fontSize:11,color:"var(--text3)"}}>PENCAPAIAN</span><div style={{fontSize:13,marginTop:2}}>{l.pencapaian}</div></div>}
                      {l.impak && <div style={{marginBottom:6}}><span style={{fontWeight:700,fontSize:11,color:"var(--text3)"}}>IMPAK</span><div style={{fontSize:13,marginTop:2}}>{l.impak}</div></div>}
                      {l.cadangan && <div><span style={{fontWeight:700,fontSize:11,color:"var(--text3)"}}>CADANGAN</span><div style={{fontSize:13,marginTop:2}}>{l.cadangan}</div></div>}
                    </div>
                  );
                })}
              </div>
            )}
          </>)}

          {showAddLap && (
            <Modal title="Tambah Laporan Program" onClose={()=>{setShowAddLap(false);setFormLap({...blankLap});}}>
              <form onSubmit={handleAddLap}>
                <div className="form-field"><label className="form-label">Tarikh Laporan</label>
                  <input className="form-input" type="date" value={formLap.tarikh_laporan} onChange={e=>setFormLap(f=>({...f,tarikh_laporan:e.target.value}))}/>
                </div>
                <div className="form-field"><label className="form-label">Pencapaian Program</label>
                  <textarea className="form-input" rows={3} value={formLap.pencapaian} onChange={e=>setFormLap(f=>({...f,pencapaian:e.target.value}))} placeholder="Nyatakan pencapaian dan outcome..."/>
                </div>
                <div className="form-field"><label className="form-label">Impak kepada Murid</label>
                  <textarea className="form-input" rows={2} value={formLap.impak} onChange={e=>setFormLap(f=>({...f,impak:e.target.value}))} placeholder="Impak yang diperhatikan..."/>
                </div>
                <div className="form-field"><label className="form-label">Cadangan Penambahbaikan</label>
                  <textarea className="form-input" rows={2} value={formLap.cadangan} onChange={e=>setFormLap(f=>({...f,cadangan:e.target.value}))} placeholder="Cadangan untuk program akan datang..."/>
                </div>
                <button className="btn-primary" type="submit">💾 Simpan Laporan</button>
              </form>
            </Modal>
          )}
          {editLap && (
            <Modal title="Edit Laporan" onClose={()=>setEditLap(null)}>
              <form onSubmit={handleEditLap}>
                <div className="form-field"><label className="form-label">Tarikh Laporan</label>
                  <input className="form-input" type="date" value={editLap.tarikh_laporan||""} onChange={e=>setEditLap(f=>({...f,tarikh_laporan:e.target.value}))}/>
                </div>
                <div className="form-field"><label className="form-label">Pencapaian</label>
                  <textarea className="form-input" rows={3} value={editLap.pencapaian||""} onChange={e=>setEditLap(f=>({...f,pencapaian:e.target.value}))}/>
                </div>
                <div className="form-field"><label className="form-label">Impak</label>
                  <textarea className="form-input" rows={2} value={editLap.impak||""} onChange={e=>setEditLap(f=>({...f,impak:e.target.value}))}/>
                </div>
                <div className="form-field"><label className="form-label">Cadangan</label>
                  <textarea className="form-input" rows={2} value={editLap.cadangan||""} onChange={e=>setEditLap(f=>({...f,cadangan:e.target.value}))}/>
                </div>
                <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
              </form>
            </Modal>
          )}
        </>)}

      </>)}
    </KurPage>
  );
}

// ─── 6. PUSAT SUMBER / NILAM ──────────────────────────────────────────────────
function PusatSumber() {
  const TABS_NIL = ["📚 Rekod NILAM","📖 Koleksi Buku","🏆 Ranking & Anugerah","📊 Laporan Kelas"];
  const GENRE_LIST = ["Cerita","Ilmiah","Agama","Sains","Sejarah","Biografi","Puisi","Komik","Majalah","Lain-lain"];
  const ANUGERAH = [
    {nama:"Gangsa",min:8,color:"#b45309",bg:"#fef3c7"},
    {nama:"Perak",min:16,color:"#64748b",bg:"#f1f5f9"},
    {nama:"Emas",min:24,color:"#ca8a04",bg:"#fefce8"},
    {nama:"Cemerlang",min:36,color:"#7c3aed",bg:"#ede9fe"},
    {nama:"Gemilang",min:48,color:"#0891b2",bg:"#ecfeff"},
    {nama:"Terbilang",min:60,color:"#16a34a",bg:"#dcfce7"},
  ];
  const getAnugerah = (b) => {
    let a = null;
    ANUGERAH.forEach(t=>{ if(b>=t.min) a=t; });
    return a;
  };

  const [subtab, setSubtab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Tab 0
  const [nilam, setNilam] = useState([]);
  const [filterKelas, setFilterKelas] = useState("");
  const [showAddNilam, setShowAddNilam] = useState(false);
  const [editNilam, setEditNilam] = useState(null);
  const blankNilam = { nama:"", kelas:"", buku_dibaca:0, sasaran:8 };
  const [formNilam, setFormNilam] = useState({...blankNilam});

  // Tab 1
  const [koleksi, setKoleksi] = useState([]);
  const [showAddKol, setShowAddKol] = useState(false);
  const [editKol, setEditKol] = useState(null);
  const blankKol = { tajuk:"", penulis:"", genre:"Cerita", bil_naskah:1, lokasi:"Rak A", status:"Ada" };
  const [formKol, setFormKol] = useState({...blankKol});
  const [qKol, setQKol] = useState("");

  const loadAll = async () => {
    setLoading(true);
    const [r1,r2] = await Promise.all([
      supabase.from('nilam').select('*').order('buku_dibaca',{ascending:false}),
      supabase.from('nilam_koleksi').select('*').order('tajuk'),
    ]);
    setNilam(r1.data||[]); setKoleksi(r2.data||[]); setLoading(false);
  };
  useEffect(()=>{ loadAll(); },[]);

  // Tab 0 handlers
  const handleAddNilam = async (e) => {
    e.preventDefault();
    const ok = await dbRun(()=>supabase.from('nilam').insert([{...formNilam,buku_dibaca:Number(formNilam.buku_dibaca),sasaran:Number(formNilam.sasaran)}]));
    if (!ok) return;
    toast("Rekod NILAM ditambah!","success"); setShowAddNilam(false); setFormNilam({...blankNilam}); loadAll();
  };
  const handleEditNilam = async (e) => {
    e.preventDefault();
    const { id, created_at, ...upd } = editNilam;
    const ok = await dbRun(()=>supabase.from('nilam').update({...upd,buku_dibaca:Number(upd.buku_dibaca),sasaran:Number(upd.sasaran)}).eq('id',id));
    if (!ok) return;
    toast("Dikemaskini!","success"); setEditNilam(null); loadAll();
  };
  const handleDelNilam = async (id) => {
    const ok = await dbRun(()=>supabase.from('nilam').delete().eq('id',id));
    if (ok) setNilam(d=>d.filter(r=>r.id!==id));
  };
  const adjustBuku = async (id, cur, delta) => {
    const val = Math.max(0, cur+delta);
    const ok = await dbRun(()=>supabase.from('nilam').update({buku_dibaca:val}).eq('id',id));
    if (ok) setNilam(d=>d.map(r=>r.id===id?{...r,buku_dibaca:val}:r));
  };

  // Tab 1 handlers
  const handleAddKol = async (e) => {
    e.preventDefault();
    const ok = await dbRun(()=>supabase.from('nilam_koleksi').insert([{...formKol,bil_naskah:Number(formKol.bil_naskah)}]));
    if (!ok) return;
    toast("Buku ditambah!","success"); setShowAddKol(false); setFormKol({...blankKol}); loadAll();
  };
  const handleEditKol = async (e) => {
    e.preventDefault();
    const { id, created_at, ...upd } = editKol;
    const ok = await dbRun(()=>supabase.from('nilam_koleksi').update({...upd,bil_naskah:Number(upd.bil_naskah)}).eq('id',id));
    if (!ok) return;
    toast("Dikemaskini!","success"); setEditKol(null); loadAll();
  };
  const handleDelKol = async (id) => {
    const ok = await dbRun(()=>supabase.from('nilam_koleksi').delete().eq('id',id));
    if (ok) setKoleksi(d=>d.filter(r=>r.id!==id));
  };

  // Computed
  const filteredNilam = nilam.filter(r=>!filterKelas||r.kelas===filterKelas);
  const totalBuku = nilam.reduce((a,r)=>a+(r.buku_dibaca||0),0);
  const capai = nilam.filter(r=>r.buku_dibaca>=r.sasaran).length;
  const totalKoleksi = koleksi.reduce((a,r)=>a+(r.bil_naskah||0),0);

  // Laporan: group nilam by kelas
  const byKelas = {};
  nilam.forEach(r=>{
    if (!byKelas[r.kelas]) byKelas[r.kelas]={kelas:r.kelas,murid:0,totalBuku:0,capai:0};
    byKelas[r.kelas].murid+=1;
    byKelas[r.kelas].totalBuku+=(r.buku_dibaca||0);
    if (r.buku_dibaca>=(r.sasaran||8)) byKelas[r.kelas].capai+=1;
  });
  const laporanKelas = Object.values(byKelas).sort((a,b)=>b.totalBuku-a.totalBuku);

  const filteredKol = koleksi.filter(r=>!qKol||r.tajuk?.toLowerCase().includes(qKol.toLowerCase())||r.penulis?.toLowerCase().includes(qKol.toLowerCase()));

  return (
    <KurPage title="Pusat Sumber / NILAM" sub="Kurikulum · SK Darau, Kota Kinabalu"
      stats={[
        {ico:"📚",val:totalKoleksi,lbl:"Koleksi Buku"},
        {ico:"👦",val:nilam.length,lbl:"Murid Berdaftar"},
        {ico:"📖",val:totalBuku,lbl:"Buku Dibaca"},
        {ico:"🏆",val:capai,lbl:"Capai Sasaran"},
      ]}>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {TABS_NIL.map((t,i)=>(
          <button key={i} onClick={()=>setSubtab(i)}
            style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,
              background:subtab===i?"var(--primary)":"var(--surface2)",color:subtab===i?"#fff":"var(--text2)",transition:"all .15s"}}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">⏳ Memuatkan…</div> : (<>

        {/* ── TAB 0: REKOD NILAM ── */}
        {subtab===0 && (<>
          <div className="kur-header">
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <select className="form-input" style={{minWidth:160}} value={filterKelas} onChange={e=>setFilterKelas(e.target.value)}>
                <option value="">Semua Kelas</option>
                {KELAS_LIST.map(k=><option key={k}>{k}</option>)}
              </select>
              <span style={{fontSize:12,color:"var(--text3)"}}>{filteredNilam.length} murid</span>
            </div>
            <button className="btn-add" onClick={()=>setShowAddNilam(true)}>+ Tambah Murid</button>
          </div>
          {filteredNilam.length===0 ? (
            <div style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
              <div style={{fontSize:32,marginBottom:8}}>📚</div>
              <div style={{fontWeight:700}}>Tiada rekod NILAM. Tambah murid.</div>
            </div>
          ) : (
            <div className="kur-table-wrap">
              <table className="kur-table">
                <thead><tr><th>#</th><th>Nama Murid</th><th>Kelas</th><th>Buku Dibaca</th><th>Sasaran</th><th>Anugerah</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {filteredNilam.map((r,i)=>{
                    const anugerah = getAnugerah(r.buku_dibaca||0);
                    const pct = Math.min(100,((r.buku_dibaca||0)/(r.sasaran||8))*100);
                    return (
                      <tr key={r.id}>
                        <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
                        <td style={{fontWeight:800}}>{r.nama}</td>
                        <td style={{color:"var(--text2)"}}>{r.kelas}</td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                            <button onClick={()=>adjustBuku(r.id,r.buku_dibaca,-1)} style={{border:"1px solid var(--border)",background:"var(--surface)",borderRadius:4,width:22,height:22,cursor:"pointer",fontWeight:900,lineHeight:1}}>-</button>
                            <span style={{fontWeight:900,color:"var(--primary)",minWidth:24,textAlign:"center"}}>{r.buku_dibaca||0}</span>
                            <button onClick={()=>adjustBuku(r.id,r.buku_dibaca,1)} style={{border:"1px solid var(--border)",background:"var(--surface)",borderRadius:4,width:22,height:22,cursor:"pointer",fontWeight:900,lineHeight:1}}>+</button>
                          </div>
                          <div className="nilam-bar-wrap">
                            <div className="nilam-bar" style={{width:`${pct}%`}}/>
                          </div>
                        </td>
                        <td style={{color:"var(--text3)"}}>{r.sasaran||8}</td>
                        <td>
                          {anugerah
                            ? <span style={{fontSize:11,padding:"2px 8px",borderRadius:6,fontWeight:800,background:anugerah.bg,color:anugerah.color}}>{anugerah.nama}</span>
                            : <span style={{fontSize:11,color:"var(--text3)"}}>—</span>}
                        </td>
                        <td><span className={`badge ${(r.buku_dibaca||0)>=(r.sasaran||8)?"b-green":"b-yellow"}`}>{(r.buku_dibaca||0)>=(r.sasaran||8)?"Capai ✓":"Dalam Proses"}</span></td>
                        <td style={{display:"flex",gap:4}}>
                          <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditNilam({...r})}>✏️</button>
                          <button className="btn-del" onClick={()=>handleDelNilam(r.id)}>🗑</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {showAddNilam && (
            <Modal title="Tambah Rekod NILAM" onClose={()=>{setShowAddNilam(false);setFormNilam({...blankNilam});}}>
              <form onSubmit={handleAddNilam}>
                <div className="form-field"><label className="form-label">Nama Murid</label>
                  <input className="form-input" required value={formNilam.nama} onChange={e=>setFormNilam(f=>({...f,nama:e.target.value}))}/>
                </div>
                <div className="form-field"><label className="form-label">Kelas</label>
                  <select className="form-input" required value={formNilam.kelas} onChange={e=>setFormNilam(f=>({...f,kelas:e.target.value}))}>
                    <option value="">— Pilih Kelas —</option>
                    {KELAS_LIST.map(k=><option key={k}>{k}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Buku Dibaca</label>
                    <input className="form-input" type="number" min="0" value={formNilam.buku_dibaca} onChange={e=>setFormNilam(f=>({...f,buku_dibaca:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Sasaran</label>
                    <input className="form-input" type="number" min="1" value={formNilam.sasaran} onChange={e=>setFormNilam(f=>({...f,sasaran:e.target.value}))}/>
                  </div>
                </div>
                <button className="btn-primary" type="submit">+ Tambah</button>
              </form>
            </Modal>
          )}
          {editNilam && (
            <Modal title={`Edit — ${editNilam.nama}`} onClose={()=>setEditNilam(null)}>
              <form onSubmit={handleEditNilam}>
                <div className="form-field"><label className="form-label">Nama Murid</label>
                  <input className="form-input" required value={editNilam.nama} onChange={e=>setEditNilam(f=>({...f,nama:e.target.value}))}/>
                </div>
                <div className="form-field"><label className="form-label">Kelas</label>
                  <select className="form-input" value={editNilam.kelas||""} onChange={e=>setEditNilam(f=>({...f,kelas:e.target.value}))}>
                    {KELAS_LIST.map(k=><option key={k}>{k}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Buku Dibaca</label>
                    <input className="form-input" type="number" min="0" value={editNilam.buku_dibaca||0} onChange={e=>setEditNilam(f=>({...f,buku_dibaca:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Sasaran</label>
                    <input className="form-input" type="number" min="1" value={editNilam.sasaran||8} onChange={e=>setEditNilam(f=>({...f,sasaran:e.target.value}))}/>
                  </div>
                </div>
                <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
              </form>
            </Modal>
          )}
        </>)}

        {/* ── TAB 1: KOLEKSI BUKU ── */}
        {subtab===1 && (<>
          <div className="kur-header">
            <div className="kur-search-wrap">
              <span className="kur-search-ico">🔍</span>
              <input className="kur-search" placeholder="Cari tajuk atau penulis…" value={qKol} onChange={e=>setQKol(e.target.value)}/>
            </div>
            <button className="btn-add" onClick={()=>setShowAddKol(true)}>+ Tambah Buku</button>
          </div>
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead><tr><th>#</th><th>Tajuk</th><th>Penulis</th><th>Genre</th><th>Bil Naskah</th><th>Lokasi</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filteredKol.length===0 && <tr><td colSpan={8} style={{textAlign:"center",color:"var(--text3)",padding:32}}>Tiada buku dalam koleksi.</td></tr>}
                {filteredKol.map((b,i)=>(
                  <tr key={b.id}>
                    <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
                    <td style={{fontWeight:800}}>{b.tajuk}</td>
                    <td style={{color:"var(--text2)",fontSize:12}}>{b.penulis||"—"}</td>
                    <td><span style={{fontSize:11,padding:"2px 7px",borderRadius:6,background:"var(--surface2)",fontWeight:700}}>{b.genre}</span></td>
                    <td style={{fontWeight:800,textAlign:"center"}}>{b.bil_naskah}</td>
                    <td style={{fontSize:12,color:"var(--text2)"}}>{b.lokasi||"—"}</td>
                    <td><span className={`badge ${b.status==="Ada"?"b-green":b.status==="Dipinjam"?"b-yellow":"b-red"}`}>{b.status}</span></td>
                    <td style={{display:"flex",gap:4}}>
                      <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditKol({...b})}>✏️</button>
                      <button className="btn-del" onClick={()=>handleDelKol(b.id)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showAddKol && (
            <Modal title="Tambah Buku Koleksi" onClose={()=>{setShowAddKol(false);setFormKol({...blankKol});}}>
              <form onSubmit={handleAddKol}>
                <div className="form-field"><label className="form-label">Tajuk Buku</label>
                  <input className="form-input" required value={formKol.tajuk} onChange={e=>setFormKol(f=>({...f,tajuk:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Penulis</label>
                    <input className="form-input" value={formKol.penulis} onChange={e=>setFormKol(f=>({...f,penulis:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Genre</label>
                    <select className="form-input" value={formKol.genre} onChange={e=>setFormKol(f=>({...f,genre:e.target.value}))}>
                      {GENRE_LIST.map(g=><option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Bil Naskah</label>
                    <input className="form-input" type="number" min="1" value={formKol.bil_naskah} onChange={e=>setFormKol(f=>({...f,bil_naskah:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Lokasi</label>
                    <input className="form-input" value={formKol.lokasi} onChange={e=>setFormKol(f=>({...f,lokasi:e.target.value}))} placeholder="cth: Rak A, Seksyen 1"/>
                  </div>
                </div>
                <div className="form-field"><label className="form-label">Status</label>
                  <select className="form-input" value={formKol.status} onChange={e=>setFormKol(f=>({...f,status:e.target.value}))}>
                    <option>Ada</option><option>Dipinjam</option><option>Hilang</option><option>Rosak</option>
                  </select>
                </div>
                <button className="btn-primary" type="submit">+ Tambah</button>
              </form>
            </Modal>
          )}
          {editKol && (
            <Modal title={`Edit — ${editKol.tajuk}`} onClose={()=>setEditKol(null)}>
              <form onSubmit={handleEditKol}>
                <div className="form-field"><label className="form-label">Tajuk Buku</label>
                  <input className="form-input" required value={editKol.tajuk} onChange={e=>setEditKol(f=>({...f,tajuk:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Penulis</label>
                    <input className="form-input" value={editKol.penulis||""} onChange={e=>setEditKol(f=>({...f,penulis:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Genre</label>
                    <select className="form-input" value={editKol.genre||"Cerita"} onChange={e=>setEditKol(f=>({...f,genre:e.target.value}))}>
                      {GENRE_LIST.map(g=><option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Bil Naskah</label>
                    <input className="form-input" type="number" min="1" value={editKol.bil_naskah||1} onChange={e=>setEditKol(f=>({...f,bil_naskah:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Lokasi</label>
                    <input className="form-input" value={editKol.lokasi||""} onChange={e=>setEditKol(f=>({...f,lokasi:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-field"><label className="form-label">Status</label>
                  <select className="form-input" value={editKol.status||"Ada"} onChange={e=>setEditKol(f=>({...f,status:e.target.value}))}>
                    <option>Ada</option><option>Dipinjam</option><option>Hilang</option><option>Rosak</option>
                  </select>
                </div>
                <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
              </form>
            </Modal>
          )}
        </>)}

        {/* ── TAB 2: RANKING & ANUGERAH ── */}
        {subtab===2 && (<>
          <div style={{marginBottom:16,display:"flex",gap:8,flexWrap:"wrap"}}>
            {ANUGERAH.map(a=>(
              <div key={a.nama} style={{padding:"8px 14px",borderRadius:10,background:a.bg,border:`1.5px solid ${a.color}`,minWidth:120,textAlign:"center"}}>
                <div style={{fontWeight:900,fontSize:13,color:a.color}}>{a.nama}</div>
                <div style={{fontSize:11,color:a.color,opacity:.8}}>{a.min}+ buku</div>
                <div style={{fontWeight:800,fontSize:18,color:a.color,marginTop:2}}>
                  {nilam.filter(r=>getAnugerah(r.buku_dibaca||0)?.nama===a.nama).length}
                </div>
                <div style={{fontSize:10,color:a.color,opacity:.7}}>murid</div>
              </div>
            ))}
          </div>
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead><tr><th>Kedudukan</th><th>Nama Murid</th><th>Kelas</th><th>Buku Dibaca</th><th>Anugerah</th></tr></thead>
              <tbody>
                {nilam.slice(0,50).map((r,i)=>{
                  const anugerah = getAnugerah(r.buku_dibaca||0);
                  const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":"";
                  return (
                    <tr key={r.id} style={{background:i<3?"var(--surface2)":""}}>
                      <td style={{fontWeight:800,fontSize:15,color:i===0?"#ca8a04":i===1?"#64748b":i===2?"#b45309":"var(--text3)"}}>{medal} {i+1}</td>
                      <td style={{fontWeight:800}}>{r.nama}</td>
                      <td style={{color:"var(--text2)"}}>{r.kelas}</td>
                      <td style={{fontWeight:900,color:"var(--primary)",fontSize:15}}>{r.buku_dibaca||0}</td>
                      <td>
                        {anugerah
                          ? <span style={{fontSize:12,padding:"3px 10px",borderRadius:6,fontWeight:800,background:anugerah.bg,color:anugerah.color}}>{anugerah.nama}</span>
                          : <span style={{fontSize:11,color:"var(--text3)"}}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>)}

        {/* ── TAB 3: LAPORAN KELAS ── */}
        {subtab===3 && (<>
          {laporanKelas.length===0 ? (
            <div style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
              <div style={{fontSize:32,marginBottom:8}}>📊</div>
              <div style={{fontWeight:700}}>Tiada data. Tambah rekod NILAM murid dahulu.</div>
            </div>
          ) : (
            <div className="kur-table-wrap">
              <table className="kur-table">
                <thead><tr><th>#</th><th>Kelas</th><th>Bil Murid</th><th>Jumlah Buku</th><th>Purata / Murid</th><th>% Capai Sasaran</th><th>Status Kelas</th></tr></thead>
                <tbody>
                  {laporanKelas.map((k,i)=>{
                    const purata = k.murid>0?(k.totalBuku/k.murid).toFixed(1):0;
                    const pctCapai = k.murid>0?((k.capai/k.murid)*100).toFixed(0):0;
                    const stat = Number(pctCapai)>=80?"🟢 Cemerlang":Number(pctCapai)>=50?"🟡 Sederhana":"🔴 Perlu Tingkat";
                    return (
                      <tr key={k.kelas}>
                        <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
                        <td style={{fontWeight:800}}>{k.kelas}</td>
                        <td>{k.murid}</td>
                        <td style={{fontWeight:800,color:"var(--primary)"}}>{k.totalBuku}</td>
                        <td style={{fontWeight:700}}>{purata}</td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{flex:1,height:8,borderRadius:4,background:"var(--surface2)",overflow:"hidden",minWidth:60}}>
                              <div style={{height:"100%",borderRadius:4,background:Number(pctCapai)>=80?"#16a34a":Number(pctCapai)>=50?"#d97706":"#dc2626",width:`${pctCapai}%`}}/>
                            </div>
                            <span style={{fontWeight:700,fontSize:12,minWidth:32}}>{pctCapai}%</span>
                          </div>
                        </td>
                        <td>{stat}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>)}

      </>)}
    </KurPage>
  );
}

// ─── 7. PERKEMBANGAN STAF ────────────────────────────────────────────────────
function PerkembanganStaf() {
  const TABS_STAF = ["📋 Rekod Kursus","👩‍🏫 Senarai Guru","📜 Sijil & Kelayakan","📊 Laporan CPD"];
  const JENIS_KURSUS = ["Pedagogi","Pentaksiran","Kepimpinan","ICT","Sukan & Kokurikulum","Agama","Kaunseling","Lain-lain"];
  const MOD_LIST = ["Fizikal","Dalam Talian","Hibrid"];
  const GRED_LIST = ["DG41","DG44","DG48","DG52","DG54","DGA29","DGA32","DGA34","DKPP","Lain-lain"];
  const STATUS_KURSUS = ["Akan Datang","Dalam Proses","Selesai"];
  const badgeFor = s => s==="Selesai"?"b-green":s==="Dalam Proses"?"b-blue":"b-yellow";

  const [subtab, setSubtab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Tab 0
  const [kursus, setKursus] = useState([]);
  const [showAddKursus, setShowAddKursus] = useState(false);
  const [editKursus, setEditKursus] = useState(null);
  const blankKursus = { peserta:"", kursus:"", jenis_kursus:"Pedagogi", tarikh:"", penganjur:"", jam_cpd:0, mod:"Fizikal", tempat:"", status:"Akan Datang" };
  const [formKursus, setFormKursus] = useState({...blankKursus});
  const [qKursus, setQKursus] = useState("");

  // Tab 1
  const [guruList, setGuruList] = useState([]);
  const [showAddGuru, setShowAddGuru] = useState(false);
  const [editGuru, setEditGuru] = useState(null);
  const blankGuru = { nama:"", jawatan:"Guru", gred:"DG41", opsyen:"", telefon:"", e_mel:"", tahun_perkhidmatan:"", status:"Aktif" };
  const [formGuru, setFormGuru] = useState({...blankGuru});
  const [qGuru, setQGuru] = useState("");

  // Tab 2
  const [sijilList, setSijilList] = useState([]);
  const [showAddSijil, setShowAddSijil] = useState(false);
  const [editSijil, setEditSijil] = useState(null);
  const blankSijil = { guru_nama:"", nama_sijil:"", institusi:"", tarikh_dapat:"", tarikh_tamat:"" };
  const [formSijil, setFormSijil] = useState({...blankSijil});
  const [filterGuruSijil, setFilterGuruSijil] = useState("");

  const loadAll = async () => {
    setLoading(true);
    const [r1,r2,r3] = await Promise.all([
      supabase.from('perkembangan_staf').select('*').order('created_at',{ascending:false}),
      supabase.from('staf_guru').select('*').order('nama'),
      supabase.from('staf_sijil').select('*').order('created_at',{ascending:false}),
    ]);
    setKursus(r1.data||[]); setGuruList(r2.data||[]); setSijilList(r3.data||[]); setLoading(false);
  };
  useEffect(()=>{ loadAll(); },[]);

  // Tab 0 handlers
  const handleAddKursus = async (e) => {
    e.preventDefault();
    const ok = await dbRun(()=>supabase.from('perkembangan_staf').insert([{...formKursus,jam_cpd:Number(formKursus.jam_cpd)}]));
    if (!ok) return;
    toast("Kursus ditambah!","success"); setShowAddKursus(false); setFormKursus({...blankKursus}); loadAll();
  };
  const handleEditKursus = async (e) => {
    e.preventDefault();
    const { id, created_at, ...upd } = editKursus;
    const ok = await dbRun(()=>supabase.from('perkembangan_staf').update({...upd,jam_cpd:Number(upd.jam_cpd)}).eq('id',id));
    if (!ok) return;
    toast("Dikemaskini!","success"); setEditKursus(null); loadAll();
  };
  const handleDelKursus = async (id) => {
    const ok = await dbRun(()=>supabase.from('perkembangan_staf').delete().eq('id',id));
    if (ok) setKursus(d=>d.filter(r=>r.id!==id));
  };
  const cycleKursusStatus = async (r) => {
    const next = STATUS_KURSUS[(STATUS_KURSUS.indexOf(r.status)+1)%STATUS_KURSUS.length];
    const ok = await dbRun(()=>supabase.from('perkembangan_staf').update({status:next}).eq('id',r.id));
    if (ok) setKursus(d=>d.map(x=>x.id===r.id?{...x,status:next}:x));
  };

  // Tab 1 handlers
  const handleAddGuru = async (e) => {
    e.preventDefault();
    const ok = await dbRun(()=>supabase.from('staf_guru').insert([formGuru]));
    if (!ok) return;
    toast("Guru ditambah!","success"); setShowAddGuru(false); setFormGuru({...blankGuru}); loadAll();
  };
  const handleEditGuru = async (e) => {
    e.preventDefault();
    const { id, created_at, ...upd } = editGuru;
    const ok = await dbRun(()=>supabase.from('staf_guru').update(upd).eq('id',id));
    if (!ok) return;
    toast("Dikemaskini!","success"); setEditGuru(null); loadAll();
  };
  const handleDelGuru = async (id) => {
    const ok = await dbRun(()=>supabase.from('staf_guru').delete().eq('id',id));
    if (ok) setGuruList(d=>d.filter(r=>r.id!==id));
  };

  // Tab 2 handlers
  const handleAddSijil = async (e) => {
    e.preventDefault();
    const ok = await dbRun(()=>supabase.from('staf_sijil').insert([formSijil]));
    if (!ok) return;
    toast("Sijil ditambah!","success"); setShowAddSijil(false); setFormSijil({...blankSijil}); loadAll();
  };
  const handleDelSijil = async (id) => {
    const ok = await dbRun(()=>supabase.from('staf_sijil').delete().eq('id',id));
    if (ok) setSijilList(d=>d.filter(r=>r.id!==id));
  };

  // CPD Laporan: group kursus by peserta, sum jam_cpd
  const cpdByGuru = {};
  kursus.filter(r=>r.status==="Selesai").forEach(r=>{
    if (!cpdByGuru[r.peserta]) cpdByGuru[r.peserta]={nama:r.peserta,jam:0,kursusCount:0};
    cpdByGuru[r.peserta].jam+=(Number(r.jam_cpd)||0);
    cpdByGuru[r.peserta].kursusCount+=1;
  });
  const cpdList = Object.values(cpdByGuru).sort((a,b)=>b.jam-a.jam);

  const filteredKursus = kursus.filter(r=>!qKursus||r.peserta?.toLowerCase().includes(qKursus.toLowerCase())||r.kursus?.toLowerCase().includes(qKursus.toLowerCase()));
  const filteredGuru = guruList.filter(r=>!qGuru||r.nama?.toLowerCase().includes(qGuru.toLowerCase())||r.opsyen?.toLowerCase().includes(qGuru.toLowerCase()));
  const filteredSijil = sijilList.filter(r=>!filterGuruSijil||r.guru_nama===filterGuruSijil);

  const selesai = kursus.filter(s=>s.status==="Selesai").length;
  const guruUniq = new Set(kursus.map(r=>r.peserta)).size;
  const totalCPD = kursus.filter(r=>r.status==="Selesai").reduce((a,r)=>a+(Number(r.jam_cpd)||0),0);

  return (
    <KurPage title="Perkembangan Staf" sub="Kurikulum · SK Darau, Kota Kinabalu"
      stats={[
        {ico:"📋",val:kursus.length,lbl:"Jumlah Kursus"},
        {ico:"✅",val:selesai,lbl:"Selesai"},
        {ico:"👩‍🏫",val:guruList.length||guruUniq,lbl:"Guru Berdaftar"},
        {ico:"⏱️",val:totalCPD,lbl:"Jam CPD Terkumpul"},
      ]}>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {TABS_STAF.map((t,i)=>(
          <button key={i} onClick={()=>setSubtab(i)}
            style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,
              background:subtab===i?"var(--primary)":"var(--surface2)",color:subtab===i?"#fff":"var(--text2)",transition:"all .15s"}}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">⏳ Memuatkan…</div> : (<>

        {/* ── TAB 0: REKOD KURSUS ── */}
        {subtab===0 && (<>
          <div className="kur-header">
            <div className="kur-search-wrap">
              <span className="kur-search-ico">🔍</span>
              <input className="kur-search" placeholder="Cari guru atau kursus…" value={qKursus} onChange={e=>setQKursus(e.target.value)}/>
            </div>
            <button className="btn-add" onClick={()=>setShowAddKursus(true)}>+ Tambah Kursus</button>
          </div>
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead><tr><th>Peserta</th><th>Kursus / Bengkel</th><th>Jenis</th><th>Tarikh</th><th>Penganjur</th><th>Jam CPD</th><th>Mod</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filteredKursus.length===0 && <tr><td colSpan={9} style={{textAlign:"center",color:"var(--text3)",padding:32}}>Tiada rekod kursus.</td></tr>}
                {filteredKursus.map(s=>(
                  <tr key={s.id}>
                    <td style={{fontWeight:800,fontSize:12}}>{s.peserta}</td>
                    <td style={{fontWeight:700}}>{s.kursus}</td>
                    <td><span style={{fontSize:11,padding:"2px 7px",borderRadius:6,background:"var(--surface2)",fontWeight:700}}>{s.jenis_kursus||"—"}</span></td>
                    <td style={{color:"var(--text3)",fontSize:12,whiteSpace:"nowrap"}}>{s.tarikh||"—"}</td>
                    <td style={{fontSize:12}}>{s.penganjur||"—"}</td>
                    <td style={{fontWeight:800,color:"var(--primary)",textAlign:"center"}}>{s.jam_cpd||0}</td>
                    <td style={{fontSize:11}}>{s.mod||"—"}</td>
                    <td>
                      <span className={`badge ${badgeFor(s.status)}`} style={{cursor:"pointer"}} onClick={()=>cycleKursusStatus(s)} title="Klik tukar status">{s.status}</span>
                    </td>
                    <td style={{display:"flex",gap:4}}>
                      <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditKursus({...s})}>✏️</button>
                      <button className="btn-del" onClick={()=>handleDelKursus(s.id)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showAddKursus && (
            <Modal title="Tambah Kursus / Bengkel" onClose={()=>{setShowAddKursus(false);setFormKursus({...blankKursus});}}>
              <form onSubmit={handleAddKursus}>
                <div className="form-field"><label className="form-label">Nama Peserta</label>
                  <input className="form-input" required value={formKursus.peserta} onChange={e=>setFormKursus(f=>({...f,peserta:e.target.value}))} placeholder="cth: Pn. Ramlah / Semua Guru"/>
                </div>
                <div className="form-field"><label className="form-label">Nama Kursus / Bengkel</label>
                  <input className="form-input" required value={formKursus.kursus} onChange={e=>setFormKursus(f=>({...f,kursus:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Jenis</label>
                    <select className="form-input" value={formKursus.jenis_kursus} onChange={e=>setFormKursus(f=>({...f,jenis_kursus:e.target.value}))}>
                      {JENIS_KURSUS.map(j=><option key={j}>{j}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label className="form-label">Mod</label>
                    <select className="form-input" value={formKursus.mod} onChange={e=>setFormKursus(f=>({...f,mod:e.target.value}))}>
                      {MOD_LIST.map(m=><option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Tarikh</label>
                    <input className="form-input" type="date" value={formKursus.tarikh} onChange={e=>setFormKursus(f=>({...f,tarikh:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Jam CPD</label>
                    <input className="form-input" type="number" min="0" value={formKursus.jam_cpd} onChange={e=>setFormKursus(f=>({...f,jam_cpd:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Penganjur</label>
                    <input className="form-input" value={formKursus.penganjur} onChange={e=>setFormKursus(f=>({...f,penganjur:e.target.value}))} placeholder="cth: JPN Sabah, IAB..."/>
                  </div>
                  <div className="form-field"><label className="form-label">Tempat</label>
                    <input className="form-input" value={formKursus.tempat} onChange={e=>setFormKursus(f=>({...f,tempat:e.target.value}))} placeholder="cth: Hotel Promenade KK"/>
                  </div>
                </div>
                <div className="form-field"><label className="form-label">Status</label>
                  <select className="form-input" value={formKursus.status} onChange={e=>setFormKursus(f=>({...f,status:e.target.value}))}>
                    {STATUS_KURSUS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <button className="btn-primary" type="submit">+ Tambah</button>
              </form>
            </Modal>
          )}
          {editKursus && (
            <Modal title={`Edit — ${editKursus.kursus}`} onClose={()=>setEditKursus(null)}>
              <form onSubmit={handleEditKursus}>
                <div className="form-field"><label className="form-label">Nama Peserta</label>
                  <input className="form-input" required value={editKursus.peserta} onChange={e=>setEditKursus(f=>({...f,peserta:e.target.value}))}/>
                </div>
                <div className="form-field"><label className="form-label">Nama Kursus</label>
                  <input className="form-input" required value={editKursus.kursus} onChange={e=>setEditKursus(f=>({...f,kursus:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Jenis</label>
                    <select className="form-input" value={editKursus.jenis_kursus||""} onChange={e=>setEditKursus(f=>({...f,jenis_kursus:e.target.value}))}>
                      {JENIS_KURSUS.map(j=><option key={j}>{j}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label className="form-label">Mod</label>
                    <select className="form-input" value={editKursus.mod||"Fizikal"} onChange={e=>setEditKursus(f=>({...f,mod:e.target.value}))}>
                      {MOD_LIST.map(m=><option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Tarikh</label>
                    <input className="form-input" type="date" value={editKursus.tarikh||""} onChange={e=>setEditKursus(f=>({...f,tarikh:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Jam CPD</label>
                    <input className="form-input" type="number" min="0" value={editKursus.jam_cpd||0} onChange={e=>setEditKursus(f=>({...f,jam_cpd:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Penganjur</label>
                    <input className="form-input" value={editKursus.penganjur||""} onChange={e=>setEditKursus(f=>({...f,penganjur:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Tempat</label>
                    <input className="form-input" value={editKursus.tempat||""} onChange={e=>setEditKursus(f=>({...f,tempat:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-field"><label className="form-label">Status</label>
                  <select className="form-input" value={editKursus.status} onChange={e=>setEditKursus(f=>({...f,status:e.target.value}))}>
                    {STATUS_KURSUS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
              </form>
            </Modal>
          )}
        </>)}

        {/* ── TAB 1: SENARAI GURU ── */}
        {subtab===1 && (<>
          <div className="kur-header">
            <div className="kur-search-wrap">
              <span className="kur-search-ico">🔍</span>
              <input className="kur-search" placeholder="Cari nama atau opsyen…" value={qGuru} onChange={e=>setQGuru(e.target.value)}/>
            </div>
            <button className="btn-add" onClick={()=>setShowAddGuru(true)}>+ Tambah Guru</button>
          </div>
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead><tr><th>#</th><th>Nama Guru</th><th>Jawatan</th><th>Gred</th><th>Opsyen</th><th>Telefon</th><th>Perkhidmatan</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filteredGuru.length===0 && <tr><td colSpan={9} style={{textAlign:"center",color:"var(--text3)",padding:32}}>Tiada guru berdaftar.</td></tr>}
                {filteredGuru.map((g,i)=>(
                  <tr key={g.id}>
                    <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
                    <td style={{fontWeight:800}}>{g.nama}</td>
                    <td style={{fontSize:12}}>{g.jawatan||"—"}</td>
                    <td><span style={{fontSize:11,padding:"2px 7px",borderRadius:6,background:"var(--surface2)",fontWeight:700}}>{g.gred||"—"}</span></td>
                    <td style={{fontSize:12,color:"var(--text2)"}}>{g.opsyen||"—"}</td>
                    <td style={{fontSize:12}}>{g.telefon||"—"}</td>
                    <td style={{fontSize:12,color:"var(--text3)"}}>{g.tahun_perkhidmatan||"—"} {g.tahun_perkhidmatan?"thn":""}</td>
                    <td><span className={`badge ${g.status==="Aktif"?"b-green":"b-gray"}`}>{g.status}</span></td>
                    <td style={{display:"flex",gap:4}}>
                      <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditGuru({...g})}>✏️</button>
                      <button className="btn-del" onClick={()=>handleDelGuru(g.id)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showAddGuru && (
            <Modal title="Tambah Guru" onClose={()=>{setShowAddGuru(false);setFormGuru({...blankGuru});}}>
              <form onSubmit={handleAddGuru}>
                <div className="form-field"><label className="form-label">Nama Guru</label>
                  <input className="form-input" required value={formGuru.nama} onChange={e=>setFormGuru(f=>({...f,nama:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Jawatan</label>
                    <input className="form-input" value={formGuru.jawatan} onChange={e=>setFormGuru(f=>({...f,jawatan:e.target.value}))} placeholder="cth: Guru Kelas, PK HEM..."/>
                  </div>
                  <div className="form-field"><label className="form-label">Gred</label>
                    <select className="form-input" value={formGuru.gred} onChange={e=>setFormGuru(f=>({...f,gred:e.target.value}))}>
                      {GRED_LIST.map(g=><option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Opsyen</label>
                    <input className="form-input" value={formGuru.opsyen} onChange={e=>setFormGuru(f=>({...f,opsyen:e.target.value}))} placeholder="cth: BM, Math, Sains..."/>
                  </div>
                  <div className="form-field"><label className="form-label">Tahun Perkhidmatan</label>
                    <input className="form-input" type="number" min="0" value={formGuru.tahun_perkhidmatan} onChange={e=>setFormGuru(f=>({...f,tahun_perkhidmatan:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Telefon</label>
                    <input className="form-input" value={formGuru.telefon} onChange={e=>setFormGuru(f=>({...f,telefon:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">E-mel</label>
                    <input className="form-input" type="email" value={formGuru.e_mel} onChange={e=>setFormGuru(f=>({...f,e_mel:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-field"><label className="form-label">Status</label>
                  <select className="form-input" value={formGuru.status} onChange={e=>setFormGuru(f=>({...f,status:e.target.value}))}>
                    <option>Aktif</option><option>Bersara</option><option>Tukar</option>
                  </select>
                </div>
                <button className="btn-primary" type="submit">+ Tambah</button>
              </form>
            </Modal>
          )}
          {editGuru && (
            <Modal title={`Edit — ${editGuru.nama}`} onClose={()=>setEditGuru(null)}>
              <form onSubmit={handleEditGuru}>
                <div className="form-field"><label className="form-label">Nama Guru</label>
                  <input className="form-input" required value={editGuru.nama} onChange={e=>setEditGuru(f=>({...f,nama:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Jawatan</label>
                    <input className="form-input" value={editGuru.jawatan||""} onChange={e=>setEditGuru(f=>({...f,jawatan:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Gred</label>
                    <select className="form-input" value={editGuru.gred||"DG41"} onChange={e=>setEditGuru(f=>({...f,gred:e.target.value}))}>
                      {GRED_LIST.map(g=><option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Opsyen</label>
                    <input className="form-input" value={editGuru.opsyen||""} onChange={e=>setEditGuru(f=>({...f,opsyen:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Tahun Perkhidmatan</label>
                    <input className="form-input" type="number" min="0" value={editGuru.tahun_perkhidmatan||""} onChange={e=>setEditGuru(f=>({...f,tahun_perkhidmatan:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Telefon</label>
                    <input className="form-input" value={editGuru.telefon||""} onChange={e=>setEditGuru(f=>({...f,telefon:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">E-mel</label>
                    <input className="form-input" value={editGuru.e_mel||""} onChange={e=>setEditGuru(f=>({...f,e_mel:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-field"><label className="form-label">Status</label>
                  <select className="form-input" value={editGuru.status||"Aktif"} onChange={e=>setEditGuru(f=>({...f,status:e.target.value}))}>
                    <option>Aktif</option><option>Bersara</option><option>Tukar</option>
                  </select>
                </div>
                <button className="btn-primary" type="submit">💾 Simpan Perubahan</button>
              </form>
            </Modal>
          )}
        </>)}

        {/* ── TAB 2: SIJIL & KELAYAKAN ── */}
        {subtab===2 && (<>
          <div className="kur-header">
            <select className="form-input" style={{minWidth:200}} value={filterGuruSijil} onChange={e=>setFilterGuruSijil(e.target.value)}>
              <option value="">Semua Guru</option>
              {guruList.map(g=><option key={g.id} value={g.nama}>{g.nama}</option>)}
            </select>
            <button className="btn-add" onClick={()=>setShowAddSijil(true)}>+ Tambah Sijil</button>
          </div>
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead><tr><th>#</th><th>Nama Guru</th><th>Nama Sijil / Kelayakan</th><th>Institusi</th><th>Tarikh Dapat</th><th>Tamat Tempoh</th><th></th></tr></thead>
              <tbody>
                {filteredSijil.length===0 && <tr><td colSpan={7} style={{textAlign:"center",color:"var(--text3)",padding:32}}>Tiada sijil berdaftar.</td></tr>}
                {filteredSijil.map((s,i)=>{
                  const tamat = s.tarikh_tamat ? new Date(s.tarikh_tamat) : null;
                  const luput = tamat && tamat < new Date();
                  return (
                    <tr key={s.id}>
                      <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
                      <td style={{fontWeight:700}}>{s.guru_nama}</td>
                      <td style={{fontWeight:800}}>{s.nama_sijil}</td>
                      <td style={{fontSize:12,color:"var(--text2)"}}>{s.institusi||"—"}</td>
                      <td style={{fontSize:12}}>{s.tarikh_dapat||"—"}</td>
                      <td>
                        {s.tarikh_tamat
                          ? <span style={{fontSize:11,padding:"2px 8px",borderRadius:6,fontWeight:700,background:luput?"#fee2e2":"#dcfce7",color:luput?"#991b1b":"#166534"}}>{s.tarikh_tamat} {luput?"⚠️ Luput":""}</span>
                          : <span style={{fontSize:11,color:"var(--text3)"}}>Tiada Tempoh</span>}
                      </td>
                      <td><button className="btn-del" onClick={()=>handleDelSijil(s.id)}>🗑</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {showAddSijil && (
            <Modal title="Tambah Sijil / Kelayakan" onClose={()=>{setShowAddSijil(false);setFormSijil({...blankSijil});}}>
              <form onSubmit={handleAddSijil}>
                <div className="form-field"><label className="form-label">Nama Guru</label>
                  <select className="form-input" required value={formSijil.guru_nama} onChange={e=>setFormSijil(f=>({...f,guru_nama:e.target.value}))}>
                    <option value="">— Pilih Guru —</option>
                    {guruList.map(g=><option key={g.id} value={g.nama}>{g.nama}</option>)}
                  </select>
                </div>
                <div className="form-field"><label className="form-label">Nama Sijil / Kelayakan</label>
                  <input className="form-input" required value={formSijil.nama_sijil} onChange={e=>setFormSijil(f=>({...f,nama_sijil:e.target.value}))} placeholder="cth: Sijil Kursus Dalam Perkhidmatan"/>
                </div>
                <div className="form-field"><label className="form-label">Institusi Penganugerahan</label>
                  <input className="form-input" value={formSijil.institusi} onChange={e=>setFormSijil(f=>({...f,institusi:e.target.value}))} placeholder="cth: IAB, KPM, UTM..."/>
                </div>
                <div className="form-row">
                  <div className="form-field"><label className="form-label">Tarikh Dapat</label>
                    <input className="form-input" type="date" value={formSijil.tarikh_dapat} onChange={e=>setFormSijil(f=>({...f,tarikh_dapat:e.target.value}))}/>
                  </div>
                  <div className="form-field"><label className="form-label">Tamat Tempoh (jika ada)</label>
                    <input className="form-input" type="date" value={formSijil.tarikh_tamat} onChange={e=>setFormSijil(f=>({...f,tarikh_tamat:e.target.value}))}/>
                  </div>
                </div>
                <button className="btn-primary" type="submit">+ Tambah Sijil</button>
              </form>
            </Modal>
          )}
        </>)}

        {/* ── TAB 3: LAPORAN CPD ── */}
        {subtab===3 && (<>
          <div style={{marginBottom:14,padding:"12px 16px",borderRadius:10,background:"var(--surface)",border:"1.5px solid var(--border)",display:"flex",gap:24,flexWrap:"wrap"}}>
            <div><span style={{fontSize:12,color:"var(--text3)",fontWeight:700}}>SASARAN CPD TAHUNAN</span><div style={{fontWeight:900,fontSize:20,color:"var(--primary)"}}>42 JAM</div></div>
            <div><span style={{fontSize:12,color:"var(--text3)",fontWeight:700}}>JUMLAH JAM TERKUMPUL</span><div style={{fontWeight:900,fontSize:20,color:"#16a34a"}}>{totalCPD} JAM</div></div>
            <div><span style={{fontSize:12,color:"var(--text3)",fontWeight:700}}>KURSUS SELESAI</span><div style={{fontWeight:900,fontSize:20}}>{selesai}</div></div>
          </div>
          {cpdList.length===0 ? (
            <div style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
              <div style={{fontSize:32,marginBottom:8}}>📊</div>
              <div style={{fontWeight:700}}>Tiada data CPD. Tambah kursus yang selesai.</div>
            </div>
          ) : (
            <div className="kur-table-wrap">
              <table className="kur-table">
                <thead><tr><th>#</th><th>Nama Guru</th><th>Bil Kursus</th><th>Jam CPD</th><th>Kemajuan (42 jam)</th><th>Status</th></tr></thead>
                <tbody>
                  {cpdList.map((g,i)=>{
                    const pct = Math.min(100,(g.jam/42)*100);
                    const stat = g.jam>=42?"✅ Mencapai Sasaran":g.jam>=21?"🟡 Separuh":"🔴 Perlu Tingkat";
                    return (
                      <tr key={g.nama}>
                        <td style={{color:"var(--text3)",fontWeight:800}}>{i+1}</td>
                        <td style={{fontWeight:800}}>{g.nama}</td>
                        <td style={{textAlign:"center"}}>{g.kursusCount}</td>
                        <td style={{fontWeight:900,color:"var(--primary)",fontSize:15}}>{g.jam}</td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{flex:1,height:8,borderRadius:4,background:"var(--surface2)",overflow:"hidden",minWidth:80}}>
                              <div style={{height:"100%",borderRadius:4,background:pct>=100?"#16a34a":pct>=50?"#d97706":"#dc2626",width:`${pct}%`}}/>
                            </div>
                            <span style={{fontWeight:700,fontSize:12,minWidth:36}}>{g.jam}/42</span>
                          </div>
                        </td>
                        <td style={{fontWeight:700,fontSize:12}}>{stat}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>)}

      </>)}
    </KurPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HEM — HAL EHWAL MURID (8 sub-modules)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── HEM 1. PENDAFTARAN & DATA MURID (APDM) ──────────────────────────────────
const TAHUN_COLORS = ['#2563eb','#0ea5e9','#6366f1','#0284c7','#7c3aed','#0891b2'];
const KELAS_NAMA_LIST = ["Unik","Aplikasi","Revolusi","Aspirasi","Dedikasi"];

function HemMurid() {
  const TABS_HM=['🏫 Senarai Kelas','👦 Murid','📊 Analisis','📋 Laporan'];
  const [subtab,setSubtab]=useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [q,setQ]=useState('');
  const [filterKelas,setFilterKelas]=useState('');
  const [filterTahun,setFilterTahun]=useState('');
  const [filterStatus,setFilterStatus]=useState('');
  const blank = { nama:"", kelas:"", ic:"", jantina:"Lelaki", telefon_wali:"", status:"Aktif" };
  const [form, setForm] = useState(blank);

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_murid').select('*').order('kelas').order('nama');
    setData(rows || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('hem_murid').insert([form]));
    if (!ok) return;
    toast("Murid berjaya ditambah!", "success");
    setShowAdd(false); setForm(blank); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const { nama, kelas, ic, jantina, telefon_wali, status } = editItem;
    const ok = await dbRun(() => supabase.from('hem_murid').update({ nama, kelas, ic, jantina, telefon_wali, status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Rekod dikemaskini!", "success"); setEditItem(null); load();
  };
  const handleDel = async (id) => {
    if (!window.confirm("Padam rekod murid ini?")) return;
    const ok = await dbRun(() => supabase.from('hem_murid').delete().eq('id', id));
    if (ok) { toast("Rekod dipadam.","success"); setData(d => d.filter(r => r.id !== id)); }
  };

  const aktif = data.filter(r => r.status === "Aktif").length;

  // build per-kelas stats using full KELAS_LIST (not just from data)
  const byKelas = KELAS_LIST.map(k => ({
    k,
    total: data.filter(r=>r.kelas===k).length,
    lelaki: data.filter(r=>r.kelas===k&&r.jantina==='Lelaki').length,
    perempuan: data.filter(r=>r.kelas===k&&r.jantina==='Perempuan').length,
    aktif: data.filter(r=>r.kelas===k&&r.status==='Aktif').length,
  }));

  // group by Tahun for structured view
  const kelasGroups = [1,2,3,4,5,6].map(t => ({
    tahun: t,
    color: TAHUN_COLORS[t-1],
    kelas: byKelas.filter(bk => bk.k.startsWith(`Tahun ${t} `)),
    total: data.filter(r => r.kelas?.startsWith(`Tahun ${t} `)).length,
  }));

  // filtered list for Murid tab
  const filtered = data.filter(r => {
    const matchQ = !q || r.nama.toLowerCase().includes(q.toLowerCase()) || r.ic?.includes(q);
    const matchK = !filterKelas || r.kelas === filterKelas;
    const matchT = !filterTahun || r.kelas?.startsWith(`Tahun ${filterTahun} `);
    const matchS = !filterStatus || r.status === filterStatus;
    return matchQ && matchK && matchT && matchS;
  });

  const TS = (i) => ({
    padding:'7px 18px', borderRadius:20, border:`2px solid ${subtab===i?'var(--accent)':'var(--divider)'}`,
    cursor:'pointer', fontWeight:800,
    background: subtab===i ? 'var(--accent)' : 'transparent',
    color: subtab===i ? '#fff' : 'var(--text2)', fontSize:13, transition:'all 0.15s',
  });

  const goMuridKelas = (k) => { setFilterKelas(k); setFilterTahun(''); setSubtab(1); };

  const MuridForm = ({ val, set, onSubmit, btnLabel }) => (
    <form onSubmit={onSubmit}>
      <div className="form-field">
        <label className="form-label">Nama Penuh</label>
        <input className="form-input" required value={val.nama} onChange={e=>set(f=>({...f,nama:e.target.value}))} placeholder="Nama penuh murid"/>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Kelas</label>
          <select className="form-input" required value={val.kelas} onChange={e=>set(f=>({...f,kelas:e.target.value}))}>
            <option value="">— Pilih Kelas —</option>
            {[1,2,3,4,5,6].map(t=>(
              <optgroup key={t} label={`── Tahun ${t} ──`}>
                {KELAS_NAMA_LIST.map(n=>(
                  <option key={n} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">No. IC</label>
          <input className="form-input" value={val.ic} onChange={e=>set(f=>({...f,ic:e.target.value}))} placeholder="cth: 120304-12-0011"/>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Jantina</label>
          <select className="form-input" value={val.jantina} onChange={e=>set(f=>({...f,jantina:e.target.value}))}>
            <option>Lelaki</option><option>Perempuan</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Status</label>
          <select className="form-input" value={val.status} onChange={e=>set(f=>({...f,status:e.target.value}))}>
            <option>Aktif</option><option>Tidak Aktif</option><option>Berpindah</option>
          </select>
        </div>
      </div>
      <div className="form-field">
        <label className="form-label">Tel. Wali</label>
        <input className="form-input" value={val.telefon_wali} onChange={e=>set(f=>({...f,telefon_wali:e.target.value}))} placeholder="cth: 011-2345678"/>
      </div>
      <button className="btn-primary" type="submit">{btnLabel}</button>
    </form>
  );

  return (
    <KurPage title="Pendaftaran & Data Murid" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        {ico:"👥",val:data.length,lbl:"Jumlah Murid"},
        {ico:"✅",val:aktif,lbl:"Aktif"},
        {ico:"👧",val:data.filter(r=>r.jantina==="Perempuan").length,lbl:"Perempuan"},
        {ico:"👦",val:data.filter(r=>r.jantina==="Lelaki").length,lbl:"Lelaki"},
      ]}>

      {/* Tab bar */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>
        {TABS_HM.map((t,i)=><button key={i} style={TS(i)} onClick={()=>setSubtab(i)}>{t}</button>)}
        <button className="btn-add" style={{marginLeft:'auto'}} onClick={()=>setShowAdd(true)}>+ Tambah Murid</button>
      </div>

      {loading ? <div className="loading">⏳ Memuatkan…</div> : (<>

        {/* ── TAB 0: SENARAI KELAS ── */}
        {subtab===0&&(
          <div>
            {kelasGroups.map(g=>(
              <div key={g.tahun} style={{marginBottom:20}}>
                {/* Tahun header */}
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{
                    padding:'5px 18px',borderRadius:20,
                    background:g.color,color:'#fff',
                    fontFamily:"'Playfair Display',serif",fontSize:15,letterSpacing:'0.02em',
                  }}>Tahun {g.tahun}</div>
                  <div style={{fontSize:12,color:'var(--text3)',fontWeight:700}}>
                    {g.total} murid
                  </div>
                  <div style={{flex:1,height:2,background:'var(--divider)',borderRadius:99}}/>
                </div>
                {/* 5 kelas cards */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10}}>
                  {g.kelas.map(bk=>{
                    const kelasNama = bk.k.replace(`Tahun ${g.tahun} `,'');
                    const pctL = bk.total ? Math.round(bk.lelaki/bk.total*100) : 0;
                    return (
                      <div key={bk.k}
                        onClick={()=>goMuridKelas(bk.k)}
                        style={{
                          background:`linear-gradient(145deg,rgba(255,255,255,0.88),${g.color}14)`,
                          border:`1.5px solid ${g.color}30`,
                          borderRadius:16, padding:'14px 12px',
                          cursor:'pointer', transition:'all 0.2s cubic-bezier(.34,1.56,.64,1)',
                          position:'relative', overflow:'hidden',
                          backdropFilter:'blur(12px)',
                        }}
                        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px) scale(1.03)';e.currentTarget.style.boxShadow=`0 10px 28px ${g.color}28`;e.currentTarget.style.borderColor=g.color;}}
                        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';e.currentTarget.style.borderColor=`${g.color}30`;}}
                      >
                        <div style={{position:'absolute',bottom:-12,right:-12,width:60,height:60,borderRadius:'50%',background:g.color,opacity:0.07}}/>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:g.color,marginBottom:4}}>{kelasNama}</div>
                        <div style={{fontSize:26,fontWeight:900,fontFamily:"'Playfair Display',serif",color:'var(--text)',lineHeight:1}}>{bk.total}</div>
                        <div style={{fontSize:11,color:'var(--text3)',fontWeight:700,marginTop:2}}>murid</div>
                        {bk.total>0&&(
                          <>
                            <div style={{display:'flex',gap:4,marginTop:8,fontSize:10,fontWeight:700}}>
                              <span style={{color:'#2563eb'}}>👦{bk.lelaki}</span>
                              <span style={{color:'#a855f7'}}>👧{bk.perempuan}</span>
                            </div>
                            <div style={{marginTop:6,height:4,borderRadius:99,background:'var(--divider)',overflow:'hidden'}}>
                              <div style={{height:'100%',background:g.color,width:`${pctL}%`,borderRadius:99}}/>
                            </div>
                          </>
                        )}
                        {bk.total===0&&(
                          <div style={{marginTop:8,fontSize:10,color:'var(--text3)',fontStyle:'italic'}}>Tiada murid</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 1: SENARAI MURID ── */}
        {subtab===1&&(<>
          {/* Search & filter bar */}
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12,alignItems:'center'}}>
            <div className="kur-search-wrap" style={{flex:1,minWidth:160}}>
              <span className="kur-search-ico">🔍</span>
              <input className="kur-search" placeholder="Cari nama atau No. IC…" value={q} onChange={e=>setQ(e.target.value)}/>
              {q&&<button onClick={()=>setQ('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:14,color:'var(--text3)'}}>✕</button>}
            </div>
            <select className="kur-select" value={filterTahun} onChange={e=>{setFilterTahun(e.target.value);setFilterKelas('');}}>
              <option value="">Semua Tahun</option>
              {[1,2,3,4,5,6].map(t=><option key={t} value={t}>Tahun {t}</option>)}
            </select>
            <select className="kur-select" value={filterKelas} onChange={e=>{setFilterKelas(e.target.value);setFilterTahun('');}}>
              <option value="">Semua Kelas</option>
              {[1,2,3,4,5,6].map(t=>(
                <optgroup key={t} label={`Tahun ${t}`}>
                  {KELAS_NAMA_LIST.map(n=><option key={n} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>)}
                </optgroup>
              ))}
            </select>
            <select className="kur-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value="">Semua Status</option>
              <option>Aktif</option><option>Tidak Aktif</option><option>Berpindah</option>
            </select>
            {(q||filterKelas||filterTahun||filterStatus)&&(
              <button onClick={()=>{setQ('');setFilterKelas('');setFilterTahun('');setFilterStatus('');}}
                style={{padding:'6px 12px',borderRadius:10,border:'1.5px solid var(--divider)',background:'var(--surface)',color:'var(--text3)',fontWeight:700,fontSize:12,cursor:'pointer'}}>
                ✕ Reset
              </button>
            )}
          </div>
          {/* Result count */}
          <div style={{fontSize:12,color:'var(--text3)',fontWeight:700,marginBottom:8}}>
            {filtered.length} rekod
            {filterKelas&&<span style={{marginLeft:8,padding:'2px 10px',borderRadius:20,background:'var(--accent-lt)',color:'var(--accent)',fontSize:11}}>📌 {filterKelas}</span>}
            {filterTahun&&<span style={{marginLeft:8,padding:'2px 10px',borderRadius:20,background:'#eff6ff',color:'#2563eb',fontSize:11}}>📌 Tahun {filterTahun}</span>}
          </div>
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead>
                <tr><th>#</th><th>Nama Murid</th><th>Kelas</th><th>No. IC</th><th>Jantina</th><th>Tel. Wali</th><th>Status</th><th style={{width:80}}></th></tr>
              </thead>
              <tbody>
                {filtered.length===0&&(
                  <tr><td colSpan={8} style={{textAlign:'center',color:'var(--text3)',padding:32}}>
                    {q||filterKelas||filterTahun||filterStatus ? '🔍 Tiada rekod sepadan.' : '📭 Tiada murid. Klik "+ Tambah Murid" untuk mula.'}
                  </td></tr>
                )}
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td style={{fontWeight:900,color:'var(--accent)',fontSize:12}}>{i+1}</td>
                    <td style={{fontWeight:800}}>{r.nama}</td>
                    <td>
                      <span style={{padding:'2px 8px',borderRadius:8,fontSize:11,fontWeight:700,
                        background: TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1]+'18',
                        color: TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1]}}>
                        {r.kelas}
                      </span>
                    </td>
                    <td style={{fontSize:12,color:'var(--text3)',fontFamily:'monospace'}}>{r.ic||'—'}</td>
                    <td><span className={`badge ${r.jantina==="Perempuan"?"b-purple":"b-blue"}`}>{r.jantina}</span></td>
                    <td style={{color:'var(--text3)',fontSize:13}}>{r.telefon_wali||'—'}</td>
                    <td><span className={`badge ${r.status==="Aktif"?"b-green":r.status==="Berpindah"?"b-yellow":"b-gray"}`}>{r.status}</span></td>
                    <td>
                      <div style={{display:'flex',gap:4}}>
                        <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditItem({...r})}>✏️</button>
                        <button className="btn-del" onClick={()=>handleDel(r.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}

        {/* ── TAB 2: ANALISIS ── */}
        {subtab===2&&(<>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            <div style={{background:'var(--surface)',borderRadius:16,padding:18,border:'1.5px solid var(--divider)'}}>
              <p style={{fontWeight:700,fontSize:14,marginBottom:14}}>👥 Agihan Jantina</p>
              {['Lelaki','Perempuan'].map(j=>{
                const n=data.filter(r=>r.jantina===j).length;
                const pct=data.length?Math.round(n/data.length*100):0;
                return(<div key={j} style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:5}}><span style={{fontWeight:700}}>{j}</span><span style={{fontWeight:800,color:j==='Lelaki'?'#2563eb':'#a855f7'}}>{n} ({pct}%)</span></div>
                  <div style={{background:'var(--divider)',borderRadius:99,height:12,overflow:'hidden'}}><div style={{height:'100%',background:j==='Lelaki'?'#2563eb':'#a855f7',width:`${pct}%`,borderRadius:99,transition:'width 0.6s ease'}}/></div>
                </div>);
              })}
            </div>
            <div style={{background:'var(--surface)',borderRadius:16,padding:18,border:'1.5px solid var(--divider)'}}>
              <p style={{fontWeight:700,fontSize:14,marginBottom:14}}>📊 Status Murid</p>
              {['Aktif','Tidak Aktif','Berpindah'].map(s=>{
                const n=data.filter(r=>r.status===s).length;
                const pct=data.length?Math.round(n/data.length*100):0;
                const clr=s==='Aktif'?'#16a34a':s==='Berpindah'?'#d97706':'#94a3b8';
                return(<div key={s} style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:5}}><span style={{fontWeight:700}}>{s}</span><span style={{fontWeight:800,color:clr}}>{n} ({pct}%)</span></div>
                  <div style={{background:'var(--divider)',borderRadius:99,height:12,overflow:'hidden'}}><div style={{height:'100%',background:clr,width:`${pct}%`,borderRadius:99,transition:'width 0.6s ease'}}/></div>
                </div>);
              })}
            </div>
          </div>
          <div style={{background:'var(--surface)',borderRadius:16,padding:18,border:'1.5px solid var(--divider)'}}>
            <p style={{fontWeight:700,fontSize:14,marginBottom:14}}>🏫 Murid Mengikut Kelas</p>
            {kelasGroups.map(g=>(
              <div key={g.tahun} style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:900,color:g.color,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:6}}>Tahun {g.tahun}</div>
                {g.kelas.map(bk=>{
                  const pct=data.length?Math.round(bk.total/data.length*100):0;
                  return(<div key={bk.k} style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:700,minWidth:110,color:'var(--text2)'}}>{bk.k.replace(`Tahun ${g.tahun} `,'')}</span>
                    <div style={{flex:1,background:'var(--divider)',borderRadius:99,height:12,overflow:'hidden'}}>
                      <div style={{height:'100%',background:g.color,width:`${pct}%`,borderRadius:99,opacity:0.75,transition:'width 0.6s ease'}}/>
                    </div>
                    <span style={{fontSize:12,fontWeight:800,minWidth:28,textAlign:'right',color:g.color}}>{bk.total}</span>
                    <span style={{fontSize:10,color:'#2563eb',minWidth:30}}>👦{bk.lelaki}</span>
                    <span style={{fontSize:10,color:'#a855f7',minWidth:30}}>👧{bk.perempuan}</span>
                  </div>);
                })}
              </div>
            ))}
          </div>
        </>)}

        {/* ── TAB 3: LAPORAN KELAS ── */}
        {subtab===3&&(<>
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead><tr><th>Kelas</th><th>Jumlah</th><th>Lelaki</th><th>Perempuan</th><th>Aktif</th><th>Tidak Aktif / Pindah</th></tr></thead>
              <tbody>
                {[1,2,3,4,5,6].flatMap(t=>[
                  <tr key={`hdr-${t}`} style={{background:TAHUN_COLORS[t-1]+'12'}}>
                    <td colSpan={6} style={{fontWeight:900,color:TAHUN_COLORS[t-1],fontSize:12,letterSpacing:'0.06em'}}>── TAHUN {t} ──</td>
                  </tr>,
                  ...byKelas.filter(bk=>bk.k.startsWith(`Tahun ${t} `)).map(r=>(
                    <tr key={r.k}>
                      <td style={{fontWeight:700,paddingLeft:20}}>{r.k}</td>
                      <td style={{fontWeight:800,color:'var(--accent)'}}>{r.total}</td>
                      <td style={{color:'#2563eb',fontWeight:700}}>{r.lelaki}</td>
                      <td style={{color:'#a855f7',fontWeight:700}}>{r.perempuan}</td>
                      <td style={{color:'#16a34a',fontWeight:700}}>{r.aktif}</td>
                      <td style={{color:'#94a3b8',fontWeight:700}}>{r.total-r.aktif}</td>
                    </tr>
                  )),
                ])}
                <tr style={{background:'var(--accent-lt)',fontWeight:900}}>
                  <td>JUMLAH KESELURUHAN</td>
                  <td style={{color:'var(--accent)'}}>{data.length}</td>
                  <td style={{color:'#2563eb'}}>{data.filter(r=>r.jantina==='Lelaki').length}</td>
                  <td style={{color:'#a855f7'}}>{data.filter(r=>r.jantina==='Perempuan').length}</td>
                  <td style={{color:'#16a34a'}}>{aktif}</td>
                  <td style={{color:'#94a3b8'}}>{data.length-aktif}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>)}

      </>)}

      {/* Modals */}
      {showAdd&&(
        <Modal title="➕ Tambah Murid Baru" onClose={()=>{setShowAdd(false);setForm(blank);}}>
          <MuridForm val={form} set={setForm} onSubmit={handleAdd} btnLabel="✅ Simpan Murid"/>
        </Modal>
      )}
      {editItem&&(
        <Modal title={`✏️ Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}>
          <MuridForm val={editItem} set={setEditItem} onSubmit={handleEdit} btnLabel="💾 Simpan Perubahan"/>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 2. DISIPLIN ─────────────────────────────────────────────────────────
const KESALAHAN_LIST = [
  "Ponteng Sekolah","Ponteng Kelas","Lewat ke Sekolah",
  "Tidak Menghormati Guru","Biadab / Bercakap Kasar",
  "Bergaduh / Berkelahi","Buli","Ugutan / Ancaman",
  "Merokok","Membawa / Menghisap Vape",
  "Membawa Telefon Bimbit","Membawa Senjata",
  "Tidak Berpakaian Kemas","Rambut Tidak Kemas",
  "Menipu / Meniru dalam Peperiksaan",
  "Vandalisma / Merosakkan Harta Sekolah",
  "Mencuri","Ganguan Seksual",
  "Lain-lain",
];
const TINDAKAN_LIST = [
  "Amaran Lisan","Surat Amaran","Denda",
  "Rotan","Digantung Persekolahan",
  "Dirujuk Kaunselor","Dirujuk Pengetua",
  "Panggil Ibu Bapa / Penjaga","Dibuang Sekolah","Lain-lain",
];

function HemDisiplin() {
  const TABS_DS = ['📋 Rekod Kes','📊 Analisis','⚠️ Murid Bermasalah'];
  const [subtab, setSubtab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [q, setQ] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKesalahan, setFilterKesalahan] = useState('');

  const blank = { nama_murid:"", kelas:"", tarikh: new Date().toISOString().slice(0,10), kesalahan:"", tindakan:"", status:"Dalam Proses" };
  const [form, setForm] = useState(blank);
  const badgeMap = { "Selesai":"b-green","Dalam Proses":"b-yellow","Dirujuk":"b-red" };
  const statusColor = { "Selesai":"#16a34a","Dalam Proses":"#d97706","Dirujuk":"#dc2626" };

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_disiplin').select('*').order('tarikh', { ascending: false });
    setData(rows || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('hem_disiplin').insert([form]));
    if (!ok) return;
    toast("Kes disiplin ditambah!", "success"); setShowAdd(false); setForm(blank); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const { nama_murid, kelas, tarikh, kesalahan, tindakan, status } = editItem;
    const ok = await dbRun(() => supabase.from('hem_disiplin').update({ nama_murid, kelas, tarikh, kesalahan, tindakan, status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Rekod dikemaskini!", "success"); setEditItem(null); load();
  };
  const handleDel = async (id) => {
    if (!window.confirm("Padam rekod kes disiplin ini?")) return;
    const ok = await dbRun(() => supabase.from('hem_disiplin').delete().eq('id', id));
    if (ok) { toast("Rekod dipadam.", "success"); setData(d => d.filter(r => r.id !== id)); }
  };

  const filtered = data.filter(r => {
    const matchQ = !q || r.nama_murid?.toLowerCase().includes(q.toLowerCase()) || r.kesalahan?.toLowerCase().includes(q.toLowerCase());
    const matchK = !filterKelas || r.kelas === filterKelas;
    const matchT = !filterTahun || r.kelas?.startsWith(`Tahun ${filterTahun} `);
    const matchS = !filterStatus || r.status === filterStatus;
    const matchKes = !filterKesalahan || r.kesalahan === filterKesalahan;
    return matchQ && matchK && matchT && matchS && matchKes;
  });

  // analytics
  const byKesalahan = Object.entries(
    data.reduce((a,r)=>{ a[r.kesalahan||'Lain-lain']=(a[r.kesalahan||'Lain-lain']||0)+1; return a; },{})
  ).sort((a,b)=>b[1]-a[1]).slice(0,10);

  const byKelas = KELAS_LIST.map(k=>({ kelas:k, count:data.filter(r=>r.kelas===k).length }))
    .filter(x=>x.count>0).sort((a,b)=>b.count-a.count).slice(0,10);

  const byMurid = Object.entries(
    data.reduce((a,r)=>{ const key=`${r.nama_murid}||${r.kelas}`; a[key]=(a[key]||0)+1; return a; },{})
  ).map(([k,c])=>({ nama:k.split('||')[0], kelas:k.split('||')[1], count:c }))
   .sort((a,b)=>b.count-a.count).slice(0,15);

  const maxKes = byKesalahan[0]?.[1]||1;
  const maxKls = byKelas[0]?.count||1;
  const selesai = data.filter(r=>r.status==="Selesai").length;
  const dalamProses = data.filter(r=>r.status==="Dalam Proses").length;
  const dirujuk = data.filter(r=>r.status==="Dirujuk").length;

  const TS = (i) => ({
    padding:'7px 18px', borderRadius:20,
    border:`2px solid ${subtab===i?'var(--accent)':'var(--divider)'}`,
    cursor:'pointer', fontWeight:800,
    background: subtab===i?'var(--accent)':'transparent',
    color: subtab===i?'#fff':'var(--text2)', fontSize:13, transition:'all 0.15s',
  });

  const fmtTarikh = (t) => {
    if (!t) return '—';
    const d = new Date(t);
    return isNaN(d) ? t : d.toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'numeric'});
  };

  const DisiplinForm = ({ val, set, onSubmit, btnLabel }) => (
    <form onSubmit={onSubmit}>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Nama Murid</label>
          <input className="form-input" required value={val.nama_murid} onChange={e=>set(f=>({...f,nama_murid:e.target.value}))} placeholder="Nama penuh murid"/>
        </div>
        <div className="form-field">
          <label className="form-label">Kelas</label>
          <select className="form-input" required value={val.kelas} onChange={e=>set(f=>({...f,kelas:e.target.value}))}>
            <option value="">— Pilih Kelas —</option>
            {[1,2,3,4,5,6].map(t=>(
              <optgroup key={t} label={`── Tahun ${t} ──`}>
                {KELAS_NAMA_LIST.map(n=><option key={n} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Tarikh Kejadian</label>
          <input className="form-input" type="date" required value={val.tarikh} onChange={e=>set(f=>({...f,tarikh:e.target.value}))}/>
        </div>
        <div className="form-field">
          <label className="form-label">Status</label>
          <select className="form-input" value={val.status} onChange={e=>set(f=>({...f,status:e.target.value}))}>
            <option>Dalam Proses</option><option>Selesai</option><option>Dirujuk</option>
          </select>
        </div>
      </div>
      <div className="form-field">
        <label className="form-label">Jenis Kesalahan</label>
        <select className="form-input" required value={val.kesalahan} onChange={e=>set(f=>({...f,kesalahan:e.target.value}))}>
          <option value="">— Pilih Kesalahan —</option>
          {KESALAHAN_LIST.map(k=><option key={k}>{k}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Tindakan Diambil</label>
        <select className="form-input" value={val.tindakan} onChange={e=>set(f=>({...f,tindakan:e.target.value}))}>
          <option value="">— Pilih Tindakan —</option>
          {TINDAKAN_LIST.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>
      <button className="btn-primary" type="submit">{btnLabel}</button>
    </form>
  );

  const hasFilter = q||filterKelas||filterTahun||filterStatus||filterKesalahan;

  return (
    <KurPage title="Disiplin Murid" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"📋", val:data.length, lbl:"Jumlah Kes" },
        { ico:"✅", val:selesai, lbl:"Selesai" },
        { ico:"⏳", val:dalamProses, lbl:"Dalam Proses" },
        { ico:"🚨", val:dirujuk, lbl:"Dirujuk" },
      ]}>

      {/* Tab bar */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>
        {TABS_DS.map((t,i)=><button key={i} style={TS(i)} onClick={()=>setSubtab(i)}>{t}</button>)}
        <button className="btn-add" style={{marginLeft:'auto'}} onClick={()=>setShowAdd(true)}>+ Tambah Kes</button>
      </div>

      {loading ? <div className="loading">⏳ Memuatkan…</div> : (<>

        {/* ── TAB 0: REKOD KES ── */}
        {subtab===0&&(<>
          {/* Search & filter */}
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10,alignItems:'center'}}>
            <div className="kur-search-wrap" style={{flex:1,minWidth:160,position:'relative'}}>
              <span className="kur-search-ico">🔍</span>
              <input className="kur-search" placeholder="Cari nama murid atau jenis kesalahan…" value={q} onChange={e=>setQ(e.target.value)}/>
              {q&&<button onClick={()=>setQ('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:14,color:'var(--text3)'}}>✕</button>}
            </div>
            <select className="kur-select" value={filterTahun} onChange={e=>{setFilterTahun(e.target.value);setFilterKelas('');}}>
              <option value="">Semua Tahun</option>
              {[1,2,3,4,5,6].map(t=><option key={t} value={t}>Tahun {t}</option>)}
            </select>
            <select className="kur-select" value={filterKelas} onChange={e=>{setFilterKelas(e.target.value);setFilterTahun('');}}>
              <option value="">Semua Kelas</option>
              {[1,2,3,4,5,6].map(t=>(
                <optgroup key={t} label={`Tahun ${t}`}>
                  {KELAS_NAMA_LIST.map(n=><option key={n} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>)}
                </optgroup>
              ))}
            </select>
            <select className="kur-select" value={filterKesalahan} onChange={e=>setFilterKesalahan(e.target.value)}>
              <option value="">Semua Kesalahan</option>
              {KESALAHAN_LIST.map(k=><option key={k}>{k}</option>)}
            </select>
            <select className="kur-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value="">Semua Status</option>
              <option>Dalam Proses</option><option>Selesai</option><option>Dirujuk</option>
            </select>
            {hasFilter&&(
              <button onClick={()=>{setQ('');setFilterKelas('');setFilterTahun('');setFilterStatus('');setFilterKesalahan('');}}
                style={{padding:'6px 12px',borderRadius:10,border:'1.5px solid var(--divider)',background:'var(--surface)',color:'var(--text3)',fontWeight:700,fontSize:12,cursor:'pointer'}}>
                ✕ Reset
              </button>
            )}
          </div>
          <div style={{fontSize:12,color:'var(--text3)',fontWeight:700,marginBottom:8}}>
            {filtered.length} rekod
            {filterKelas&&<span style={{marginLeft:8,padding:'2px 10px',borderRadius:20,background:'#fef2f2',color:'#dc2626',fontSize:11}}>📌 {filterKelas}</span>}
            {filterTahun&&<span style={{marginLeft:8,padding:'2px 10px',borderRadius:20,background:'#fef2f2',color:'#dc2626',fontSize:11}}>📌 Tahun {filterTahun}</span>}
            {filterKesalahan&&<span style={{marginLeft:8,padding:'2px 10px',borderRadius:20,background:'#fef2f2',color:'#dc2626',fontSize:11}}>📌 {filterKesalahan}</span>}
          </div>
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead>
                <tr><th>#</th><th>Nama Murid</th><th>Kelas</th><th>Tarikh</th><th>Kesalahan</th><th>Tindakan</th><th>Status</th><th style={{width:80}}></th></tr>
              </thead>
              <tbody>
                {filtered.length===0&&(
                  <tr><td colSpan={8} style={{textAlign:'center',color:'var(--text3)',padding:32}}>
                    {hasFilter ? '🔍 Tiada rekod sepadan.' : '📭 Tiada kes. Klik "+ Tambah Kes" untuk mula.'}
                  </td></tr>
                )}
                {filtered.map((r,i)=>(
                  <tr key={r.id}>
                    <td style={{fontWeight:900,color:'var(--accent)',fontSize:12}}>{i+1}</td>
                    <td style={{fontWeight:800}}>{r.nama_murid}</td>
                    <td>
                      <span style={{padding:'2px 8px',borderRadius:8,fontSize:11,fontWeight:700,
                        background: TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1]+'18',
                        color: TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1]}}>
                        {r.kelas}
                      </span>
                    </td>
                    <td style={{color:'var(--text3)',whiteSpace:'nowrap',fontSize:12}}>{fmtTarikh(r.tarikh)}</td>
                    <td>
                      <span style={{padding:'2px 10px',borderRadius:8,fontSize:11,fontWeight:700,background:'#fef2f2',color:'#dc2626'}}>
                        {r.kesalahan}
                      </span>
                    </td>
                    <td style={{fontSize:12,color:'var(--text2)'}}>{r.tindakan||'—'}</td>
                    <td><span className={`badge ${badgeMap[r.status]||'b-gray'}`}>{r.status}</span></td>
                    <td>
                      <div style={{display:'flex',gap:4}}>
                        <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditItem({...r})}>✏️</button>
                        <button className="btn-del" onClick={()=>handleDel(r.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}

        {/* ── TAB 1: ANALISIS ── */}
        {subtab===1&&(<>
          {/* Status summary cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:18}}>
            {[['✅','Selesai',selesai,'#16a34a'],['⏳','Dalam Proses',dalamProses,'#d97706'],['🚨','Dirujuk',dirujuk,'#dc2626']].map(([ico,lbl,val,clr])=>(
              <div key={lbl} style={{background:`${clr}10`,border:`1.5px solid ${clr}30`,borderRadius:16,padding:'16px 14px',textAlign:'center'}}>
                <div style={{fontSize:26,marginBottom:4}}>{ico}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,color:clr,lineHeight:1}}>{val}</div>
                <div style={{fontSize:12,color:'var(--text3)',fontWeight:700,marginTop:4}}>{lbl}</div>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {/* Jenis kesalahan */}
            <div style={{background:'var(--surface)',border:'1.5px solid var(--divider)',borderRadius:16,padding:18}}>
              <p style={{fontWeight:800,fontSize:14,marginBottom:14}}>🔴 Jenis Kesalahan Tertinggi</p>
              {byKesalahan.length===0&&<p style={{color:'var(--text3)',fontSize:13}}>Tiada data.</p>}
              {byKesalahan.map(([k,c])=>(
                <div key={k} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4,fontWeight:700}}>
                    <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',paddingRight:8}}>{k}</span>
                    <span style={{color:'#dc2626',fontWeight:900,flexShrink:0}}>{c} kes</span>
                  </div>
                  <div style={{background:'var(--divider)',borderRadius:99,height:10,overflow:'hidden'}}>
                    <div style={{height:'100%',background:'#dc2626',width:`${(c/maxKes)*100}%`,borderRadius:99,opacity:0.75,transition:'width 0.6s'}}/>
                  </div>
                </div>
              ))}
            </div>
            {/* Kes mengikut kelas */}
            <div style={{background:'var(--surface)',border:'1.5px solid var(--divider)',borderRadius:16,padding:18}}>
              <p style={{fontWeight:800,fontSize:14,marginBottom:14}}>🏫 Kes Mengikut Kelas</p>
              {byKelas.length===0&&<p style={{color:'var(--text3)',fontSize:13}}>Tiada data.</p>}
              {byKelas.map(({kelas,count})=>{
                const tc = TAHUN_COLORS[(parseInt(kelas?.split(' ')[1])||1)-1];
                return(
                  <div key={kelas} style={{marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4,fontWeight:700}}>
                      <span style={{color:tc}}>{kelas}</span>
                      <span style={{fontWeight:900}}>{count}</span>
                    </div>
                    <div style={{background:'var(--divider)',borderRadius:99,height:10,overflow:'hidden'}}>
                      <div style={{height:'100%',background:tc,width:`${(count/maxKls)*100}%`,borderRadius:99,opacity:0.7,transition:'width 0.6s'}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>)}

        {/* ── TAB 2: MURID BERMASALAH ── */}
        {subtab===2&&(<>
          <div style={{marginBottom:14,padding:'10px 14px',background:'#fef2f2',border:'1.5px solid #fca5a5',borderRadius:12,fontSize:13,color:'#dc2626',fontWeight:700}}>
            ⚠️ Senarai murid mengikut jumlah kes disiplin tertinggi. Semak rekod lanjut sebelum ambil tindakan.
          </div>
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead>
                <tr><th>#</th><th>Nama Murid</th><th>Kelas</th><th>Jumlah Kes</th><th>Kes Terkini</th><th>Status Terkini</th></tr>
              </thead>
              <tbody>
                {byMurid.length===0&&(
                  <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text3)',padding:32}}>📭 Tiada data rekod kes.</td></tr>
                )}
                {byMurid.map((m,i)=>{
                  const latest = data.find(r=>r.nama_murid===m.nama&&r.kelas===m.kelas);
                  const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
                  return (
                    <tr key={i} style={{background: i<3?'#fef2f2':''}}>
                      <td style={{fontWeight:900,color:i<3?'#dc2626':'var(--text3)',fontSize:13}}>{medal||i+1}</td>
                      <td style={{fontWeight:800}}>{m.nama}</td>
                      <td>
                        <span style={{padding:'2px 8px',borderRadius:8,fontSize:11,fontWeight:700,
                          background:TAHUN_COLORS[(parseInt(m.kelas?.split(' ')[1])||1)-1]+'18',
                          color:TAHUN_COLORS[(parseInt(m.kelas?.split(' ')[1])||1)-1]}}>
                          {m.kelas}
                        </span>
                      </td>
                      <td>
                        <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:i<3?'#dc2626':'var(--accent)'}}>{m.count}</span>
                        <span style={{fontSize:12,color:'var(--text3)',marginLeft:4}}>kes</span>
                      </td>
                      <td style={{fontSize:12,color:'var(--text2)'}}>{latest?.kesalahan||'—'}</td>
                      <td>{latest&&<span className={`badge ${badgeMap[latest.status]||'b-gray'}`}>{latest.status}</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>)}

      </>)}

      {showAdd&&(
        <Modal title="➕ Tambah Kes Disiplin" onClose={()=>{setShowAdd(false);setForm(blank);}}>
          <DisiplinForm val={form} set={setForm} onSubmit={handleAdd} btnLabel="✅ Simpan Kes"/>
        </Modal>
      )}
      {editItem&&(
        <Modal title={`✏️ Edit — ${editItem.nama_murid}`} onClose={()=>setEditItem(null)}>
          <DisiplinForm val={editItem} set={setEditItem} onSubmit={handleEdit} btnLabel="💾 Simpan Perubahan"/>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 3. BIMBINGAN & KAUNSELING ───────────────────────────────────────────
const JENIS_KES_KAUNSELING = [
  "Masalah Akademik & Pembelajaran",
  "Masalah Tingkah Laku & Disiplin",
  "Masalah Keluarga & Ibu Bapa",
  "Masalah Emosi & Perasaan",
  "Masalah Hubungan Sosial & Rakan Sebaya",
  "Buli — Pelaku",
  "Buli — Mangsa",
  "Masalah Kehadiran & Ponteng",
  "Masalah Keyakinan & Harga Diri",
  "Masalah Penyesuaian Diri",
  "Masalah Kecurian / Penyelewengan Harta",
  "Masalah Kebersihan & Kesihatan Diri",
  "Bantuan Psikologikal & Trauma",
  "Krisis / Kecemasan",
  "Program Bimbingan (Kerjaya Awal)",
  "Lain-lain",
];
const KS_ACCENT = "#0ea5e9";
const BULAN_LABEL = ["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogos","Sep","Okt","Nov","Dis"];

function HemKaunseling() {
  const TABS_KS = ['💬 Rekod Sesi','📊 Analisis','🔔 Tindak Lanjut'];
  const [subtab, setSubtab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [q, setQ] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterJenis, setFilterJenis] = useState('');

  const blank = {
    nama_murid:"", kelas:"",
    tarikh: new Date().toISOString().slice(0,10),
    jenis_kes:"", kaunselor:"", status:"Dalam Proses",
  };
  const [form, setForm] = useState(blank);

  const badgeMap = { "Selesai":"b-green","Dalam Proses":"b-blue","Dirujuk":"b-red" };

  const fmtTarikh = (t) => {
    if (!t) return '—';
    const d = new Date(t);
    return isNaN(d) ? t : d.toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'numeric'});
  };

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_kaunseling').select('*').order('tarikh', { ascending: false });
    setData(rows || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('hem_kaunseling').insert([form]));
    if (!ok) return;
    toast("Sesi kaunseling ditambah!", "success");
    setShowAdd(false); setForm(blank); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const { nama_murid, kelas, tarikh, jenis_kes, kaunselor, status } = editItem;
    const ok = await dbRun(() => supabase.from('hem_kaunseling').update({ nama_murid, kelas, tarikh, jenis_kes, kaunselor, status }).eq('id', editItem.id));
    if (!ok) return;
    toast("Rekod dikemaskini!", "success"); setEditItem(null); load();
  };
  const handleDel = async (id, nama) => {
    if (!window.confirm(`Padam sesi kaunseling ${nama}?`)) return;
    const ok = await dbRun(() => supabase.from('hem_kaunseling').delete().eq('id', id));
    if (ok) { toast("Rekod dipadam.", "info"); setData(d => d.filter(r => r.id !== id)); }
  };
  const quickStatus = async (id, status) => {
    const ok = await dbRun(() => supabase.from('hem_kaunseling').update({ status }).eq('id', id));
    if (ok) { setData(d => d.map(r => r.id===id ? {...r, status} : r)); toast(`Status: ${status}`, "success"); }
  };

  const filtered = data.filter(r => {
    const matchQ = !q || r.nama_murid?.toLowerCase().includes(q.toLowerCase()) || r.jenis_kes?.toLowerCase().includes(q.toLowerCase()) || r.kaunselor?.toLowerCase().includes(q.toLowerCase());
    const matchK = !filterKelas || r.kelas === filterKelas;
    const matchT = !filterTahun || r.kelas?.startsWith(`Tahun ${filterTahun} `);
    const matchS = !filterStatus || r.status === filterStatus;
    const matchJ = !filterJenis || r.jenis_kes === filterJenis;
    return matchQ && matchK && matchT && matchS && matchJ;
  });

  const pending = data.filter(r => r.status === "Dalam Proses" || r.status === "Dirujuk")
    .sort((a,b) => { if(a.status==="Dirujuk"&&b.status!=="Dirujuk") return -1; if(b.status==="Dirujuk"&&a.status!=="Dirujuk") return 1; return new Date(a.tarikh)-new Date(b.tarikh); });

  const selesai = data.filter(r => r.status === "Selesai").length;
  const dalamProses = data.filter(r => r.status === "Dalam Proses").length;
  const dirujuk = data.filter(r => r.status === "Dirujuk").length;
  const kaunselorList = [...new Set(data.map(r=>r.kaunselor).filter(Boolean))].sort();

  // murid berulang (>1 sesi)
  const muridCount = data.reduce((a,r)=>{ if(r.nama_murid) a[r.nama_murid]=(a[r.nama_murid]||0)+1; return a; },{});
  const muridBerulang = Object.entries(muridCount).filter(([,c])=>c>1).sort((a,b)=>b[1]-a[1]).slice(0,10);

  const byJenis = Object.entries(
    data.reduce((a,r)=>{ a[r.jenis_kes||'Lain-lain']=(a[r.jenis_kes||'Lain-lain']||0)+1; return a; },{})
  ).sort((a,b)=>b[1]-a[1]).slice(0,10);

  const byKaunselor = Object.entries(
    data.reduce((a,r)=>{ if(r.kaunselor) a[r.kaunselor]=(a[r.kaunselor]||0)+1; return a; },{})
  ).sort((a,b)=>b[1]-a[1]);

  const byKelas = KELAS_LIST.map(k=>({ kelas:k, count:data.filter(r=>r.kelas===k).length }))
    .filter(x=>x.count>0).sort((a,b)=>b.count-a.count).slice(0,10);

  // monthly trend — current year
  const curYear = new Date().getFullYear();
  const byBulan = BULAN_LABEL.map((b,i)=>({
    bulan:b,
    count: data.filter(r=>{ const d=new Date(r.tarikh); return !isNaN(d)&&d.getFullYear()===curYear&&d.getMonth()===i; }).length
  }));
  const maxBulan = Math.max(...byBulan.map(b=>b.count), 1);

  const maxJ = byJenis[0]?.[1]||1;
  const maxK = byKaunselor[0]?.[1]||1;
  const hasFilter = q||filterKelas||filterTahun||filterStatus||filterJenis;

  const TS = (i) => ({
    padding:'7px 18px', borderRadius:20,
    border:`2px solid ${subtab===i?KS_ACCENT:'var(--divider)'}`,
    cursor:'pointer', fontWeight:800,
    background: subtab===i?KS_ACCENT:'transparent',
    color: subtab===i?'#fff':'var(--text2)', fontSize:13, transition:'all 0.15s',
  });

  const KaunselingForm = ({ val, set, onSubmit, btnLabel }) => (
    <form onSubmit={onSubmit}>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Nama Murid *</label>
          <input className="form-input" required value={val.nama_murid}
            onChange={e=>set(f=>({...f,nama_murid:e.target.value}))} placeholder="Nama penuh murid"/>
        </div>
        <div className="form-field">
          <label className="form-label">Kelas *</label>
          <select className="form-input" required value={val.kelas} onChange={e=>set(f=>({...f,kelas:e.target.value}))}>
            <option value="">— Pilih Kelas —</option>
            {[1,2,3,4,5,6].map(t=>(
              <optgroup key={t} label={`Tahun ${t}`}>
                {KELAS_NAMA_LIST.map(n=><option key={n} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Tarikh Sesi *</label>
          <input className="form-input" type="date" required value={val.tarikh}
            onChange={e=>set(f=>({...f,tarikh:e.target.value}))}/>
        </div>
        <div className="form-field">
          <label className="form-label">Nama Kaunselor</label>
          <input className="form-input" value={val.kaunselor}
            onChange={e=>set(f=>({...f,kaunselor:e.target.value}))}
            placeholder="Nama kaunselor / guru bimbingan"
            list="kaunselor-list"/>
          <datalist id="kaunselor-list">
            {kaunselorList.map(k=><option key={k} value={k}/>)}
          </datalist>
        </div>
      </div>
      <div className="form-field">
        <label className="form-label">Jenis Kes *</label>
        <select className="form-input" required value={val.jenis_kes} onChange={e=>set(f=>({...f,jenis_kes:e.target.value}))}>
          <option value="">— Pilih Jenis Kes —</option>
          {JENIS_KES_KAUNSELING.map(k=><option key={k}>{k}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Status Sesi</label>
        <select className="form-input" value={val.status} onChange={e=>set(f=>({...f,status:e.target.value}))}>
          <option>Dalam Proses</option>
          <option>Selesai</option>
          <option>Dirujuk</option>
        </select>
      </div>
      <button className="btn-primary" type="submit" style={{background:KS_ACCENT}}>{btnLabel}</button>
    </form>
  );

  const SesiRow = ({ r, i, showActions=true }) => {
    const tc = TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1];
    return (
      <tr style={r.status==='Dirujuk'?{background:'#fef2f2'}:r.status==='Dalam Proses'?{background:'#f0f9ff'}:{}}>
        {i !== undefined && <td style={{fontWeight:900,color:KS_ACCENT,fontSize:12}}>{i+1}</td>}
        <td style={{fontWeight:800}}>{r.nama_murid}</td>
        <td><span style={{padding:'2px 8px',borderRadius:8,fontSize:11,fontWeight:700,background:tc+'18',color:tc}}>{r.kelas||'—'}</span></td>
        <td style={{color:'var(--text3)',whiteSpace:'nowrap',fontSize:12}}>{fmtTarikh(r.tarikh)}</td>
        <td><span style={{padding:'2px 9px',borderRadius:8,fontSize:11,fontWeight:700,background:'#eff6ff',color:'#2563eb',display:'block',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.jenis_kes||'—'}</span></td>
        <td style={{fontSize:12,color:'var(--text2)'}}>{r.kaunselor||'—'}</td>
        <td><span className={`badge ${badgeMap[r.status]||'b-gray'}`}>{r.status}</span></td>
        {showActions && (
          <td>
            <div style={{display:'flex',gap:4}}>
              <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditItem({...r})}>✏️</button>
              <button className="btn-del" onClick={()=>handleDel(r.id, r.nama_murid)}>🗑</button>
            </div>
          </td>
        )}
        {!showActions && (
          <td>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              {r.status!=="Selesai" && <button onClick={()=>quickStatus(r.id,"Selesai")} style={{padding:'3px 7px',fontSize:10,background:'#f0fdf4',border:'1px solid #86efac',borderRadius:6,cursor:'pointer',fontWeight:700,color:'#16a34a'}}>✓ Selesai</button>}
              {r.status!=="Dirujuk" && <button onClick={()=>quickStatus(r.id,"Dirujuk")} style={{padding:'3px 7px',fontSize:10,background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:6,cursor:'pointer',fontWeight:700,color:'#dc2626'}}>↗ Rujuk</button>}
              <button className="btn-add" style={{padding:'3px 7px',fontSize:10}} onClick={()=>setEditItem({...r})}>✏️</button>
            </div>
          </td>
        )}
      </tr>
    );
  };

  const thead8 = (<thead><tr><th>#</th><th>Nama Murid</th><th>Kelas</th><th>Tarikh</th><th>Jenis Kes</th><th>Kaunselor</th><th>Status</th><th></th></tr></thead>);
  const thead7 = (<thead><tr><th>Nama Murid</th><th>Kelas</th><th>Tarikh</th><th>Jenis Kes</th><th>Kaunselor</th><th>Status</th><th></th></tr></thead>);

  return (
    <KurPage title="Bimbingan & Kaunseling" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"💬", val:data.length, lbl:"Jumlah Sesi" },
        { ico:"✅", val:selesai, lbl:"Selesai" },
        { ico:"⏳", val:dalamProses, lbl:"Dalam Proses" },
        { ico:"🔔", val:dirujuk, lbl:"Dirujuk" },
      ]}>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18,alignItems:'center'}}>
        {TABS_KS.map((t,i)=><button key={i} style={TS(i)} onClick={()=>setSubtab(i)}>{t}</button>)}
        <button className="btn-add" style={{marginLeft:'auto',background:KS_ACCENT}} onClick={()=>setShowAdd(true)}>+ Tambah Sesi</button>
      </div>

      {loading ? <div className="loading">⏳ Memuatkan…</div> : (<>

        {/* ── TAB 0: REKOD SESI ── */}
        {subtab===0&&(<>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10,alignItems:'center'}}>
            <div className="kur-search-wrap" style={{flex:1,minWidth:180,position:'relative'}}>
              <span className="kur-search-ico">🔍</span>
              <input className="kur-search" placeholder="Cari nama murid, jenis kes atau kaunselor…"
                value={q} onChange={e=>setQ(e.target.value)}/>
              {q&&<button onClick={()=>setQ('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:14,color:'var(--text3)'}}>✕</button>}
            </div>
            <select className="kur-select" value={filterTahun} onChange={e=>{setFilterTahun(e.target.value);setFilterKelas('');}}>
              <option value="">Semua Tahun</option>
              {[1,2,3,4,5,6].map(t=><option key={t} value={t}>Tahun {t}</option>)}
            </select>
            <select className="kur-select" value={filterKelas} onChange={e=>{setFilterKelas(e.target.value);setFilterTahun('');}}>
              <option value="">Semua Kelas</option>
              {[1,2,3,4,5,6].map(t=>(
                <optgroup key={t} label={`Tahun ${t}`}>
                  {KELAS_NAMA_LIST.map(n=><option key={n} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>)}
                </optgroup>
              ))}
            </select>
            <select className="kur-select" value={filterJenis} onChange={e=>setFilterJenis(e.target.value)}>
              <option value="">Semua Jenis Kes</option>
              {JENIS_KES_KAUNSELING.map(k=><option key={k}>{k}</option>)}
            </select>
            <select className="kur-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value="">Semua Status</option>
              <option>Dalam Proses</option><option>Selesai</option><option>Dirujuk</option>
            </select>
            {hasFilter&&(
              <button onClick={()=>{setQ('');setFilterKelas('');setFilterTahun('');setFilterStatus('');setFilterJenis('');}}
                style={{padding:'6px 12px',borderRadius:10,border:'1.5px solid var(--divider)',background:'var(--surface)',color:'var(--text3)',fontWeight:700,fontSize:12,cursor:'pointer'}}>
                ✕ Reset
              </button>
            )}
          </div>
          <div style={{fontSize:12,color:'var(--text3)',fontWeight:700,marginBottom:8,display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
            <span>{filtered.length} rekod</span>
            {filterKelas&&<span style={{padding:'2px 10px',borderRadius:20,background:'#eff6ff',color:KS_ACCENT,fontSize:11}}>📌 {filterKelas}</span>}
            {filterTahun&&<span style={{padding:'2px 10px',borderRadius:20,background:'#eff6ff',color:KS_ACCENT,fontSize:11}}>📌 Tahun {filterTahun}</span>}
            {filterJenis&&<span style={{padding:'2px 10px',borderRadius:20,background:'#eff6ff',color:'#2563eb',fontSize:11}}>📌 {filterJenis}</span>}
            {filterStatus&&<span style={{padding:'2px 10px',borderRadius:20,background:'#eff6ff',color:'#16a34a',fontSize:11}}>📌 {filterStatus}</span>}
          </div>
          <div className="kur-table-wrap">
            <table className="kur-table">
              {thead8}
              <tbody>
                {filtered.length===0&&(
                  <tr><td colSpan={8} style={{textAlign:'center',color:'var(--text3)',padding:32}}>
                    {hasFilter ? '🔍 Tiada rekod sepadan.' : '📭 Tiada sesi. Klik "+ Tambah Sesi" untuk mula.'}
                  </td></tr>
                )}
                {filtered.map((r,i)=><SesiRow key={r.id} r={r} i={i}/>)}
              </tbody>
            </table>
          </div>
        </>)}

        {/* ── TAB 1: ANALISIS ── */}
        {subtab===1&&(<>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:18}}>
            {[['✅','Selesai',selesai,'#16a34a'],['⏳','Dalam Proses',dalamProses,KS_ACCENT],['🔔','Dirujuk',dirujuk,'#dc2626']].map(([ico,lbl,val,clr])=>(
              <div key={lbl} style={{background:`${clr}10`,border:`1.5px solid ${clr}30`,borderRadius:16,padding:'16px 14px',textAlign:'center'}}>
                <div style={{fontSize:26,marginBottom:4}}>{ico}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,color:clr,lineHeight:1}}>{val}</div>
                <div style={{fontSize:12,color:'var(--text3)',fontWeight:700,marginTop:4}}>{lbl}</div>
                <div style={{fontSize:10,color:'var(--text3)'}}>{data.length?Math.round(val/data.length*100):0}%</div>
              </div>
            ))}
          </div>

          {/* Monthly trend */}
          <div className="kur-card" style={{padding:16,marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>📈 Trend Sesi Bulanan {curYear}</div>
            <div style={{display:'flex',gap:4,alignItems:'flex-end',height:80}}>
              {byBulan.map(({bulan,count})=>(
                <div key={bulan} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <div style={{fontSize:9,color:'var(--text3)',fontWeight:700}}>{count||''}</div>
                  <div style={{width:'100%',background:KS_ACCENT,borderRadius:'4px 4px 0 0',height:`${count?(count/maxBulan)*60+6:2}px`,opacity:count?0.85:0.15,transition:'height 0.4s'}}></div>
                  <div style={{fontSize:8,color:'var(--text3)',fontWeight:700}}>{bulan}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            <div style={{background:'var(--surface)',border:'1.5px solid var(--divider)',borderRadius:16,padding:18}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:14}}>💬 Jenis Kes Tertinggi</div>
              {byJenis.length===0&&<div style={{color:'var(--text3)',fontSize:13}}>Tiada data.</div>}
              {byJenis.map(([k,c])=>(
                <div key={k} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4,fontWeight:700}}>
                    <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',paddingRight:8}}>{k}</span>
                    <span style={{color:KS_ACCENT,fontWeight:900,flexShrink:0}}>{c}</span>
                  </div>
                  <div style={{background:'var(--divider)',borderRadius:99,height:8,overflow:'hidden'}}>
                    <div style={{height:'100%',background:KS_ACCENT,width:`${(c/maxJ)*100}%`,borderRadius:99,transition:'width 0.6s'}}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:'var(--surface)',border:'1.5px solid var(--divider)',borderRadius:16,padding:18}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:14}}>👩‍💼 Sesi Mengikut Kaunselor</div>
              {byKaunselor.length===0&&<div style={{color:'var(--text3)',fontSize:13}}>Tiada data.</div>}
              {byKaunselor.map(([k,c])=>(
                <div key={k} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4,fontWeight:700}}>
                    <span>{k}</span><span style={{color:'var(--accent)',fontWeight:900}}>{c}</span>
                  </div>
                  <div style={{background:'var(--divider)',borderRadius:99,height:8,overflow:'hidden'}}>
                    <div style={{height:'100%',background:'var(--accent)',width:`${(c/maxK)*100}%`,borderRadius:99,transition:'width 0.6s'}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {byKelas.length>0&&(
            <div style={{background:'var(--surface)',border:'1.5px solid var(--divider)',borderRadius:16,padding:18,marginBottom:16}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:14}}>🏫 Sesi Mengikut Kelas</div>
              {byKelas.map(({kelas,count})=>{
                const tc = TAHUN_COLORS[(parseInt(kelas?.split(' ')[1])||1)-1];
                return(
                  <div key={kelas} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <span style={{fontSize:12,fontWeight:700,minWidth:130,color:tc}}>{kelas}</span>
                    <div style={{flex:1,background:'var(--divider)',borderRadius:99,height:8,overflow:'hidden'}}>
                      <div style={{height:'100%',background:tc,width:`${(count/byKelas[0].count)*100}%`,borderRadius:99,transition:'width 0.6s'}}/>
                    </div>
                    <span style={{fontSize:12,fontWeight:800,minWidth:24,textAlign:'right',color:tc}}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {muridBerulang.length>0&&(
            <div style={{background:'#fffbeb',border:'1.5px solid #fde68a',borderRadius:16,padding:18}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:12,color:'#d97706'}}>⚠️ Murid Berulang (lebih 1 sesi)</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {muridBerulang.map(([nama,count])=>(
                  <div key={nama} style={{background:'#fff',border:'1.5px solid #fde68a',borderRadius:10,padding:'6px 12px',display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontWeight:700,fontSize:12}}>{nama}</span>
                    <span style={{background:'#d97706',color:'#fff',borderRadius:99,padding:'1px 8px',fontSize:11,fontWeight:900}}>{count} sesi</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>)}

        {/* ── TAB 2: TINDAK LANJUT ── */}
        {subtab===2&&(<>
          <div style={{marginBottom:14,padding:'10px 14px',background:'#eff6ff',border:'1.5px solid #bfdbfe',borderRadius:12,fontSize:13,color:'#1d4ed8',fontWeight:700,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span>🔔 Sesi berstatus <strong>Dalam Proses</strong> atau <strong>Dirujuk</strong> yang perlu tindakan. ({pending.length} sesi)</span>
            <span style={{fontSize:11,fontWeight:700,color:KS_ACCENT}}>{dirujuk} Dirujuk · {dalamProses} Dalam Proses</span>
          </div>
          {pending.length===0 ? (
            <div style={{textAlign:'center',padding:48,color:'var(--text3)'}}>
              <div style={{fontSize:40,marginBottom:10}}>🎉</div>
              <div style={{fontWeight:800,fontSize:16}}>Tiada sesi tertunggak!</div>
              <div style={{fontSize:13,marginTop:4}}>Semua sesi telah diselesaikan.</div>
            </div>
          ) : (
            <div className="kur-table-wrap">
              <table className="kur-table">
                {thead7}
                <tbody>
                  {pending.map(r=><SesiRow key={r.id} r={r} showActions={false}/>)}
                </tbody>
              </table>
            </div>
          )}
        </>)}

      </>)}

      {showAdd&&(
        <Modal title="Tambah Sesi Kaunseling" onClose={()=>{setShowAdd(false);setForm(blank);}}>
          <KaunselingForm val={form} set={setForm} onSubmit={handleAdd} btnLabel="✅ Simpan Sesi"/>
        </Modal>
      )}
      {editItem&&(
        <Modal title={`Edit — ${editItem.nama_murid}`} onClose={()=>setEditItem(null)}>
          <KaunselingForm val={editItem} set={setEditItem} onSubmit={handleEdit} btnLabel="💾 Simpan Perubahan"/>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 4. KESIHATAN MURID ───────────────────────────────────────────────────
const JENIS_PEMERIKSAAN_LIST = [
  "Pemeriksaan Fizikal (Umum)",
  "Pemeriksaan Mata (Penglihatan)",
  "Pemeriksaan Telinga (Pendengaran)",
  "Pemeriksaan Pergigian (Gigi)",
  "Pemeriksaan Berat & Tinggi (BMI)",
  "Pemeriksaan Darah",
  "Ujian Urin",
  "Pemeriksaan Kulit",
  "Pemeriksaan Jantung",
  "Vaksinasi / Imunisasi",
  "Saringan Skoliosis (Tulang Belakang)",
  "Saringan Kaki Rata (Flat Foot)",
  "Saringan Kesihatan Mental",
  "Lain-lain",
];

function HemKesihatan() {
  const TABS_KH = ['🏥 Rekod', '📊 Analisis', '🚑 Perlu Tindakan'];
  const [subtab, setSubtab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [q, setQ] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const blank = { nama_murid:"", kelas:"", tarikh:"", jenis_pemeriksaan:"", catatan:"", status:"Normal" };
  const [form, setForm] = useState(blank);
  const badgeMap = { "Normal":"b-green", "Perlu Perhatian":"b-yellow", "Dirujuk":"b-red" };
  const KH_ACCENT = "#10b981";

  const fmtTarikh = (t) => {
    if (!t) return '—';
    const d = new Date(t);
    return isNaN(d) ? t : d.toLocaleDateString('ms-MY', { day:'numeric', month:'short', year:'numeric' });
  };

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
  const handleDel = async (id, nama) => {
    if (!window.confirm(`Padam rekod ${nama}?`)) return;
    const ok = await dbRun(() => supabase.from('hem_kesihatan').delete().eq('id', id));
    if (ok) { setData(d => d.filter(r => r.id !== id)); toast("Dipadam.", "info"); }
  };

  const namaMuridList = [...new Set(data.map(r => r.nama_murid).filter(Boolean))].sort();

  const filtered = data.filter(r => {
    if (q && !r.nama_murid?.toLowerCase().includes(q.toLowerCase()) && !r.jenis_pemeriksaan?.toLowerCase().includes(q.toLowerCase())) return false;
    if (filterTahun && !r.kelas?.startsWith(`Tahun ${filterTahun}`)) return false;
    if (filterKelas && r.kelas !== filterKelas) return false;
    if (filterJenis && r.jenis_pemeriksaan !== filterJenis) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const activeFilters = [filterTahun && `Tahun ${filterTahun}`, filterKelas, filterJenis, filterStatus].filter(Boolean);
  const resetFilters = () => { setQ(''); setFilterTahun(''); setFilterKelas(''); setFilterJenis(''); setFilterStatus(''); };

  const byJenis = Object.entries(data.reduce((a,r)=>{ const k=r.jenis_pemeriksaan||'Lain-lain'; a[k]=(a[k]||0)+1; return a; },{})).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const byKelas = [...new Set(data.map(r=>r.kelas).filter(Boolean))].sort().map(k=>({ kelas:k, count:data.filter(r=>r.kelas===k).length })).sort((a,b)=>b.count-a.count).slice(0,10);
  const byStatus = [["Normal","✅","#10b981"],["Perlu Perhatian","⚠️","#f59e0b"],["Dirujuk","🚑","#ef4444"]].map(([s,ico,col])=>({ s,ico,col, cnt:data.filter(r=>r.status===s).length }));
  const needAction = data.filter(r => r.status === "Perlu Perhatian" || r.status === "Dirujuk");
  const maxJ = byJenis[0]?.[1] || 1;
  const maxK = byKelas[0]?.count || 1;

  const KesihatanForm = ({ val, set, onSubmit, btnLabel }) => (
    <form onSubmit={onSubmit}>
      <datalist id="kh-nama-list">{namaMuridList.map(n => <option key={n} value={n}/>)}</datalist>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Nama Murid *</label>
          <input className="form-input" required list="kh-nama-list" placeholder="Nama penuh murid"
            value={val.nama_murid} onChange={e=>set(f=>({...f,nama_murid:e.target.value}))}/>
        </div>
        <div className="form-field">
          <label className="form-label">Kelas *</label>
          <select className="form-input" required value={val.kelas} onChange={e=>set(f=>({...f,kelas:e.target.value}))}>
            <option value="">— Pilih Kelas —</option>
            {[1,2,3,4,5,6].map(t=>(
              <optgroup key={t} label={`Tahun ${t}`}>
                {KELAS_NAMA_LIST.map(n=><option key={n} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Tarikh Pemeriksaan *</label>
          <input className="form-input" required type="date"
            value={val.tarikh} onChange={e=>set(f=>({...f,tarikh:e.target.value}))}/>
        </div>
        <div className="form-field">
          <label className="form-label">Jenis Pemeriksaan *</label>
          <select className="form-input" required value={val.jenis_pemeriksaan} onChange={e=>set(f=>({...f,jenis_pemeriksaan:e.target.value}))}>
            <option value="">— Pilih Jenis —</option>
            {JENIS_PEMERIKSAAN_LIST.map(j=><option key={j}>{j}</option>)}
          </select>
        </div>
      </div>
      <div className="form-field">
        <label className="form-label">Catatan / Penemuan</label>
        <textarea className="form-input" rows={2} placeholder="Maklumat tambahan, simptom, arahan doktor…"
          value={val.catatan} onChange={e=>set(f=>({...f,catatan:e.target.value}))}/>
      </div>
      <div className="form-field">
        <label className="form-label">Status</label>
        <select className="form-input" value={val.status} onChange={e=>set(f=>({...f,status:e.target.value}))}>
          <option>Normal</option>
          <option>Perlu Perhatian</option>
          <option>Dirujuk</option>
        </select>
      </div>
      <button className="btn-primary" type="submit" style={{background:KH_ACCENT}}>{btnLabel}</button>
    </form>
  );

  return (
    <KurPage title="Kesihatan Murid" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"🏥", val:data.length, lbl:"Jumlah Rekod" },
        { ico:"✅", val:byStatus[0].cnt, lbl:"Normal" },
        { ico:"⚠️", val:byStatus[1].cnt, lbl:"Perlu Perhatian" },
        { ico:"🚑", val:byStatus[2].cnt, lbl:"Dirujuk" },
      ]}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {TABS_KH.map((t,i)=>(
          <button key={i} onClick={()=>setSubtab(i)} style={{padding:"7px 16px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
            background:subtab===i?KH_ACCENT:"var(--card2)",color:subtab===i?"#fff":"var(--text2)"}}>
            {t}
          </button>
        ))}
      </div>

      {subtab===0 && (<>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8,alignItems:"center"}}>
          <input className="form-input" style={{maxWidth:200,marginBottom:0}} placeholder="🔍 Cari nama / pemeriksaan…"
            value={q} onChange={e=>setQ(e.target.value)}/>
          <select className="form-input" style={{maxWidth:120,marginBottom:0}} value={filterTahun} onChange={e=>{ setFilterTahun(e.target.value); setFilterKelas(''); }}>
            <option value="">Semua Tahun</option>
            {[1,2,3,4,5,6].map(t=><option key={t} value={t}>Tahun {t}</option>)}
          </select>
          <select className="form-input" style={{maxWidth:180,marginBottom:0}} value={filterKelas} onChange={e=>setFilterKelas(e.target.value)}>
            <option value="">Semua Kelas</option>
            {filterTahun
              ? KELAS_NAMA_LIST.map(n=><option key={n} value={`Tahun ${filterTahun} ${n}`}>Tahun {filterTahun} {n}</option>)
              : [1,2,3,4,5,6].flatMap(t=>KELAS_NAMA_LIST.map(n=><option key={`${t}${n}`} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>))
            }
          </select>
          <select className="form-input" style={{maxWidth:220,marginBottom:0}} value={filterJenis} onChange={e=>setFilterJenis(e.target.value)}>
            <option value="">Semua Jenis</option>
            {JENIS_PEMERIKSAAN_LIST.map(j=><option key={j}>{j}</option>)}
          </select>
          <select className="form-input" style={{maxWidth:160,marginBottom:0}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option>Normal</option><option>Perlu Perhatian</option><option>Dirujuk</option>
          </select>
          {(q||activeFilters.length>0) && <button onClick={resetFilters} style={{padding:"6px 12px",borderRadius:8,border:"1px solid var(--border)",background:"var(--card2)",cursor:"pointer",fontSize:12,color:"var(--text3)"}}>✕ Reset</button>}
          <button className="btn-add" style={{marginLeft:"auto",background:KH_ACCENT}} onClick={()=>setShowAdd(true)}>+ Tambah Rekod</button>
        </div>
        {activeFilters.length>0 && (
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
            {activeFilters.map(f=><span key={f} style={{background:KH_ACCENT+"22",color:KH_ACCENT,borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700}}>{f}</span>)}
            <span style={{fontSize:11,color:"var(--text3)",alignSelf:"center"}}>{filtered.length} rekod</span>
          </div>
        )}
        {loading ? <div className="loading">⏳ Memuatkan…</div> : (
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead><tr><th>#</th><th>Nama Murid</th><th>Kelas</th><th>Tarikh</th><th>Jenis Pemeriksaan</th><th>Catatan</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map((r,i) => (
                  <tr key={r.id} style={r.status==="Dirujuk"?{background:"#fef2f2"}:r.status==="Perlu Perhatian"?{background:"#fffbeb"}:{}}>
                    <td style={{color:"var(--text3)",fontSize:12}}>{i+1}</td>
                    <td style={{fontWeight:800}}>{r.nama_murid}</td>
                    <td><span style={{background:TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1]+'18',color:TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1],borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:700}}>{r.kelas}</span></td>
                    <td style={{color:"var(--text3)",whiteSpace:"nowrap",fontSize:12}}>{fmtTarikh(r.tarikh)}</td>
                    <td style={{fontSize:12}}>{r.jenis_pemeriksaan}</td>
                    <td style={{fontSize:11,color:"var(--text2)",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.catatan||'—'}</td>
                    <td><span className={`badge ${badgeMap[r.status]||"b-gray"}`}>{r.status}</span></td>
                    <td style={{display:"flex",gap:4}}>
                      <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...r})}>✏️</button>
                      <button className="btn-del" onClick={()=>handleDel(r.id, r.nama_murid)}>🗑</button>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan={8} style={{textAlign:"center",color:"var(--text3)",padding:24}}>Tiada rekod ditemui</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </>)}

      {subtab===1 && (<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
          {byStatus.map(({s,ico,col,cnt})=>(
            <div key={s} style={{textAlign:"center",padding:"16px 8px",background:col+"10",borderRadius:12,border:`1.5px solid ${col}30`}}>
              <div style={{fontSize:26}}>{ico}</div>
              <div style={{fontWeight:900,fontSize:28,color:col}}>{cnt}</div>
              <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{s}</div>
              <div style={{fontSize:10,color:"var(--text3)"}}>{data.length?Math.round(cnt/data.length*100):0}%</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div className="kur-card" style={{padding:16}}>
            <div style={{fontWeight:700,marginBottom:12,color:"var(--text2)"}}>Jenis Pemeriksaan</div>
            {byJenis.map(([k,c])=>(
              <div key={k} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8}}>{k}</span><b>{c}</b></div>
                <div style={{background:"var(--border)",borderRadius:4,height:8}}><div style={{width:`${(c/maxJ)*100}%`,height:8,borderRadius:4,background:KH_ACCENT}}></div></div>
              </div>
            ))}
            {byJenis.length===0 && <div style={{color:"var(--text3)",fontSize:13}}>Tiada data</div>}
          </div>
          <div className="kur-card" style={{padding:16}}>
            <div style={{fontWeight:700,marginBottom:12,color:"var(--text2)"}}>Rekod Mengikut Kelas</div>
            {byKelas.map(({kelas,count})=>(
              <div key={kelas} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span>{kelas}</span><b>{count}</b></div>
                <div style={{background:"var(--border)",borderRadius:4,height:8}}><div style={{width:`${(count/maxK)*100}%`,height:8,borderRadius:4,background:TAHUN_COLORS[(parseInt(kelas?.split(' ')[1])||1)-1]}}></div></div>
              </div>
            ))}
            {byKelas.length===0 && <div style={{color:"var(--text3)",fontSize:13}}>Tiada data</div>}
          </div>
        </div>
      </>)}

      {subtab===2 && (<>
        <div style={{background:"#fef2f2",border:"1.5px solid #fca5a5",borderRadius:12,padding:"10px 16px",marginBottom:12,display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:20}}>🚑</span>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:"#dc2626"}}>Murid Perlu Tindakan Segera</div>
            <div style={{fontSize:11,color:"#7f1d1d"}}>{needAction.length} murid dengan status Perlu Perhatian atau Dirujuk</div>
          </div>
        </div>
        <div className="kur-table-wrap">
          <table className="kur-table">
            <thead><tr><th>Nama Murid</th><th>Kelas</th><th>Tarikh</th><th>Jenis Pemeriksaan</th><th>Catatan</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {needAction.map(r=>(
                <tr key={r.id} style={r.status==="Dirujuk"?{background:"#fef2f2"}:{background:"#fffbeb"}}>
                  <td style={{fontWeight:800}}>{r.nama_murid}</td>
                  <td style={{color:"var(--text3)",fontSize:12}}>{r.kelas}</td>
                  <td style={{color:"var(--text3)",whiteSpace:"nowrap",fontSize:12}}>{fmtTarikh(r.tarikh)}</td>
                  <td style={{fontSize:12}}>{r.jenis_pemeriksaan}</td>
                  <td style={{fontSize:11,color:"var(--text2)"}}>{r.catatan||'—'}</td>
                  <td><span className={`badge ${badgeMap[r.status]||"b-gray"}`}>{r.status}</span></td>
                  <td><button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...r})}>✏️</button></td>
                </tr>
              ))}
              {needAction.length===0 && <tr><td colSpan={7} style={{textAlign:"center",color:"#10b981",padding:24,fontWeight:700}}>Semua murid dalam keadaan baik 🎉</td></tr>}
            </tbody>
          </table>
        </div>
      </>)}

      {showAdd && (
        <Modal title="Tambah Rekod Kesihatan" onClose={()=>setShowAdd(false)}>
          <KesihatanForm val={form} set={setForm} onSubmit={handleAdd} btnLabel="+ Tambah Rekod"/>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama_murid}`} onClose={()=>setEditItem(null)}>
          <KesihatanForm val={editItem} set={setEditItem} onSubmit={handleEdit} btnLabel="💾 Simpan Perubahan"/>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 5. BANTUAN PELAJARAN ─────────────────────────────────────────────────
const BANTUAN_TABS = ['📊 Statistik','👦 Murid','📋 Permohonan','🍱 RMT','⚙️ Jenis Bantuan'];
const BP_ACCENT = '#7c3aed';

function autoKategori(pendapatan) {
  const p = parseFloat(pendapatan) || 0;
  if (p <= 4850)  return 'B40';
  if (p <= 10960) return 'M40';
  return 'T20';
}

function HemBantuan() {
  const [tab, setTab]               = useState(0);
  const [murid, setMurid]           = useState([]);
  const [permohonan, setPermohonan] = useState([]);
  const [rmt, setRmt]               = useState([]);
  const [jenisList, setJenisList]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterKelas, setFilterKelas]   = useState('');
  const [filterTahun, setFilterTahun]   = useState(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState('');
  const [q, setQ]                   = useState('');
  const [qRmt, setQRmt]             = useState('');

  const [showAddMurid, setShowAddMurid] = useState(false);
  const [editMurid, setEditMurid]       = useState(null);
  const [showAddPerm, setShowAddPerm]   = useState(false);
  const [showAddJenis, setShowAddJenis] = useState(false);
  const [editJenis, setEditJenis]       = useState(null);

  const tahunNow = new Date().getFullYear().toString();
  const blankMurid = { no_daftar:'', nama:'', no_ic:'', kelas:'', jantina:'L', tarikh_lahir:'', nama_waris:'', no_tel:'', pekerjaan_waris:'', pendapatan:0, sumber:'', status:'Aktif' };
  const blankPerm  = { id_murid:'', no_daftar:'', nama_murid:'', kelas:'', jenis_id:'', nama_bantuan:'', tahun:tahunNow, jumlah:0, catatan:'' };
  const blankJenis = { nama:'', jenis:'Wang', jumlah_max:0, sumber:'KPM', catatan:'', status:'Aktif' };
  const [formMurid, setFormMurid] = useState(blankMurid);
  const [formPerm, setFormPerm]   = useState(blankPerm);
  const [formJenis, setFormJenis] = useState(blankJenis);

  const load = async () => {
    setLoading(true);
    const [mr, pr, rm, jn] = await Promise.all([
      supabase.from('bantuan_murid').select('*').neq('status','PADAM').order('nama'),
      supabase.from('bantuan_permohonan').select('*').neq('status','PADAM').order('created_at', { ascending:false }),
      supabase.from('bantuan_rmt').select('*').neq('status','PADAM').order('nama_murid'),
      supabase.from('bantuan_jenis').select('*').neq('status','PADAM').order('nama'),
    ]);
    setMurid(mr.data || []); setPermohonan(pr.data || []);
    setRmt(rm.data || []);   setJenisList(jn.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // ── MURID
  const handleAddMurid = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('bantuan_murid').insert([{ ...formMurid, kategori: autoKategori(formMurid.pendapatan) }]));
    if (!ok) return;
    toast('Murid ditambah!', 'success'); setShowAddMurid(false); setFormMurid(blankMurid); load();
  };
  const handleEditMurid = async (e) => {
    e.preventDefault();
    const { id, created_at, ...rest } = editMurid;
    const ok = await dbRun(() => supabase.from('bantuan_murid').update({ ...rest, kategori: autoKategori(rest.pendapatan) }).eq('id', id));
    if (!ok) return;
    toast('Dikemaskini!', 'success'); setEditMurid(null); load();
  };
  const handleDelMurid = async (id, nama) => {
    if (!window.confirm(`Padam murid "${nama}" daripada senarai?`)) return;
    const ok = await dbRun(() => supabase.from('bantuan_murid').update({ status:'PADAM' }).eq('id', id));
    if (ok) { setMurid(d => d.filter(r => r.id !== id)); toast('Dipadam.', 'info'); }
  };

  // ── PERMOHONAN
  const handleAddPerm = async (e) => {
    e.preventDefault();
    const jenis = jenisList.find(j => j.id === formPerm.jenis_id);
    const today = new Date().toISOString().split('T')[0];
    const ok = await dbRun(() => supabase.from('bantuan_permohonan').insert([{ ...formPerm, nama_bantuan: jenis?.nama || '', tarikh_mohon: today, status:'Mohon' }]));
    if (!ok) return;
    toast('Permohonan ditambah!', 'success'); setShowAddPerm(false); setFormPerm(blankPerm); load();
  };
  const handleStatusPerm = async (id, status) => {
    const today = new Date().toISOString().split('T')[0];
    const upd = { status };
    if (status === 'Lulus' || status === 'Dibayar') upd.tarikh_lulus = today;
    const ok = await dbRun(() => supabase.from('bantuan_permohonan').update(upd).eq('id', id));
    if (ok) { load(); toast('Status dikemaskini!', 'success'); }
  };
  const handleDelPerm = async (id) => {
    if (!window.confirm('Padam permohonan ini?')) return;
    const ok = await dbRun(() => supabase.from('bantuan_permohonan').update({ status:'PADAM' }).eq('id', id));
    if (ok) { setPermohonan(d => d.filter(r => r.id !== id)); toast('Dipadam.', 'info'); }
  };

  // ── RMT
  const handleAddRMT = async (idMurid) => {
    const m = murid.find(r => r.id === idMurid);
    if (!m) return;
    const yr = filterTahun || tahunNow;
    if (rmt.find(r => r.id_murid === idMurid && r.tahun === yr)) { toast('Sudah didaftarkan RMT ' + yr + '.'); return; }
    const ok = await dbRun(() => supabase.from('bantuan_rmt').insert([{ tahun:yr, id_murid:idMurid, no_daftar:m.no_daftar, nama_murid:m.nama, kelas:m.kelas, status:'Aktif' }]));
    if (ok) { load(); toast('Didaftarkan RMT!', 'success'); }
  };
  const handleDelRMT = async (id) => {
    if (!window.confirm('Padam rekod RMT ini?')) return;
    const ok = await dbRun(() => supabase.from('bantuan_rmt').update({ status:'PADAM' }).eq('id', id));
    if (ok) { setRmt(d => d.filter(r => r.id !== id)); toast('Dipadam.', 'info'); }
  };

  // ── JENIS
  const handleAddJenis = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('bantuan_jenis').insert([formJenis]));
    if (!ok) return;
    toast('Jenis ditambah!', 'success'); setShowAddJenis(false); setFormJenis(blankJenis); load();
  };
  const handleEditJenis = async (e) => {
    e.preventDefault();
    const { id, created_at, ...rest } = editJenis;
    const ok = await dbRun(() => supabase.from('bantuan_jenis').update(rest).eq('id', id));
    if (!ok) return;
    toast('Dikemaskini!', 'success'); setEditJenis(null); load();
  };
  const handleDelJenis = async (id, nama) => {
    if (!window.confirm(`Padam jenis bantuan "${nama}"?`)) return;
    const ok = await dbRun(() => supabase.from('bantuan_jenis').update({ status:'PADAM' }).eq('id', id));
    if (ok) { setJenisList(d => d.filter(r => r.id !== id)); toast('Dipadam.', 'info'); }
  };

  // ── COMPUTED
  const b40 = murid.filter(r => r.kategori === 'B40').length;
  const m40 = murid.filter(r => r.kategori === 'M40').length;
  const t20 = murid.filter(r => r.kategori === 'T20').length;
  const rmtTahun = rmt.filter(r => r.tahun === filterTahun);
  const lulusCount = permohonan.filter(r => r.status === 'Lulus' || r.status === 'Dibayar').length;
  const mohonCount = permohonan.filter(r => r.status === 'Mohon').length;
  const dibayarCount = permohonan.filter(r => r.status === 'Dibayar').length;
  const totalDibayar = permohonan.filter(r => r.status === 'Dibayar').reduce((s,r) => s + (parseFloat(r.jumlah)||0), 0);

  const filtMurid = murid.filter(r =>
    (!filterKelas || r.kelas === filterKelas) &&
    (!q || r.nama.toLowerCase().includes(q.toLowerCase()) || (r.no_daftar||'').toLowerCase().includes(q.toLowerCase()))
  );
  const filtPerm = permohonan.filter(r =>
    (!filterTahun  || r.tahun === filterTahun) &&
    (!filterKelas  || r.kelas === filterKelas) &&
    (!filterStatus || r.status === filterStatus)
  );
  const filtRmt = rmtTahun.filter(r =>
    (!filterKelas || r.kelas === filterKelas) &&
    (!qRmt || r.nama_murid?.toLowerCase().includes(qRmt.toLowerCase()) || (r.no_daftar||'').toLowerCase().includes(qRmt.toLowerCase()))
  );
  const totalJumlahFilt = filtPerm.reduce((s,r) => s+(parseFloat(r.jumlah)||0), 0);

  const katBadge    = k => k === 'B40' ? 'b-red' : k === 'M40' ? 'b-yellow' : 'b-gray';
  const statusBadge = s => s === 'Lulus' ? 'b-green' : s === 'Dibayar' ? 'b-blue' : s === 'Ditolak' ? 'b-red' : 'b-yellow';
  const fmtRM       = v => 'RM ' + parseFloat(v||0).toLocaleString('ms-MY', { minimumFractionDigits:2 });
  const fmtTarikh   = t => { if (!t) return '—'; const d = new Date(t); return isNaN(d)?t:d.toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'numeric'}); };

  const tabStyle = (i) => ({
    padding:'8px 14px', borderRadius:10, fontWeight:900, fontSize:12, cursor:'pointer',
    border:'2.5px solid', fontFamily:"'Inter',sans-serif",
    background: tab===i ? BP_ACCENT : 'var(--surface)',
    borderColor: tab===i ? BP_ACCENT : 'var(--border)',
    color: tab===i ? '#fff' : 'var(--text)', transition:'all 0.15s',
  });

  const KelasSelect = ({ val, set, field='kelas', required=false }) => (
    <select className="form-input" required={required} value={val[field]||''} onChange={e=>set(f=>({...f,[field]:e.target.value}))}>
      <option value="">— Pilih Kelas —</option>
      {[1,2,3,4,5,6].map(t=>(
        <optgroup key={t} label={`Tahun ${t}`}>
          {KELAS_NAMA_LIST.map(n=><option key={n} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>)}
        </optgroup>
      ))}
    </select>
  );

  const stats = [
    { ico:'👦', val:murid.length,  lbl:'Murid Berdaftar' },
    { ico:'❤️', val:b40,           lbl:'B40' },
    { ico:'🟡', val:m40,           lbl:'M40' },
    { ico:'🍱', val:rmtTahun.length, lbl:'RMT '+filterTahun },
    { ico:'📋', val:mohonCount,    lbl:'Menunggu Lulus' },
    { ico:'💰', val:dibayarCount,  lbl:'Telah Dibayar' },
  ];

  return (
    <KurPage title="Bantuan Pelajaran" sub="HEM · SK Darau, Kota Kinabalu" stats={stats}>
      <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:16}}>
        {BANTUAN_TABS.map((t,i) => <button key={i} style={tabStyle(i)} onClick={() => setTab(i)}>{t}</button>)}
      </div>

      {loading ? <div className="loading">⏳ Memuatkan…</div> : (<>

        {/* ── TAB 0: STATISTIK */}
        {tab === 0 && (
          <div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16}}>
              {[
                { lbl:'B40  (≤ RM4,850)',   val:b40, color:'#dc2626', bg:'#fef2f2', pct: murid.length?Math.round(b40/murid.length*100):0 },
                { lbl:'M40  (≤ RM10,960)', val:m40, color:'#d97706', bg:'#fffbeb', pct: murid.length?Math.round(m40/murid.length*100):0 },
                { lbl:'T20  (> RM10,960)', val:t20, color:'#475569', bg:'#f8fafc', pct: murid.length?Math.round(t20/murid.length*100):0 },
              ].map((c,i) => (
                <div key={i} style={{background:c.bg, border:`2px solid ${c.color}30`, borderRadius:14, padding:'16px 12px', textAlign:'center'}}>
                  <div style={{fontSize:26, fontFamily:"'Playfair Display',serif", color:c.color}}>{c.val}</div>
                  <div style={{fontSize:11, fontWeight:900, color:c.color, marginTop:2}}>{c.lbl}</div>
                  <div style={{fontSize:10, color:'#94a3b8', marginTop:4}}>{c.pct}% daripada murid</div>
                  <div style={{marginTop:8, height:5, borderRadius:99, background:`${c.color}20`}}>
                    <div style={{height:'100%', borderRadius:99, background:c.color, width:`${c.pct}%`, transition:'width 0.5s'}}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:'var(--card2)',borderRadius:12,padding:'12px 16px',marginBottom:16,display:'flex',gap:24,flexWrap:'wrap'}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontWeight:900,fontSize:20,color:BP_ACCENT}}>{fmtRM(totalDibayar)}</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>Jumlah Dibayar (semua tahun)</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontWeight:900,fontSize:20,color:'#10b981'}}>{lulusCount}</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>Permohonan Diluluskan</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontWeight:900,fontSize:20,color:'#f59e0b'}}>{mohonCount}</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>Menunggu Kelulusan</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontWeight:900,fontSize:20,color:'#6366f1'}}>{rmtTahun.length}</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>Pelajar RMT {filterTahun}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
              <div style={{fontWeight:900, fontSize:13}}>📊 Permohonan Bantuan</div>
              <select className="form-input" style={{maxWidth:100,marginBottom:0,fontSize:12}} value={filterTahun} onChange={e=>setFilterTahun(e.target.value)}>
                {['2023','2024','2025','2026'].map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
            <div style={{background:'var(--surface)', border:'2px solid var(--border)', borderRadius:14, padding:16}}>
              {jenisList.length === 0 && <div style={{fontSize:12, color:'var(--text3)'}}>Tiada jenis bantuan. Tambah di tab ⚙️.</div>}
              {jenisList.map(j => {
                const total = permohonan.filter(p => p.jenis_id===j.id && p.tahun===filterTahun).length;
                const lu    = permohonan.filter(p => p.jenis_id===j.id && p.tahun===filterTahun && (p.status==='Lulus'||p.status==='Dibayar')).length;
                const amt   = permohonan.filter(p => p.jenis_id===j.id && p.tahun===filterTahun && p.status==='Dibayar').reduce((s,p)=>s+(parseFloat(p.jumlah)||0),0);
                return (
                  <div key={j.id} style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                    <div style={{width:140, fontSize:12, fontWeight:800, flexShrink:0}}>{j.nama}</div>
                    <div style={{flex:1, height:8, background:'var(--border)', borderRadius:99, overflow:'hidden'}}>
                      <div style={{height:'100%', background:BP_ACCENT, borderRadius:99, width:`${total?lu/total*100:0}%`}}/>
                    </div>
                    <div style={{fontSize:11, color:'var(--text3)', flexShrink:0, textAlign:'right'}}>
                      <span style={{fontWeight:800}}>{lu}/{total}</span>
                      {amt>0 && <span style={{marginLeft:6,color:BP_ACCENT}}>{fmtRM(amt)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 1: MURID */}
        {tab === 1 && (
          <div>
            <div className="kur-header" style={{flexWrap:'wrap', gap:8}}>
              <button className="btn-add" style={{background:BP_ACCENT}} onClick={() => { setFormMurid(blankMurid); setShowAddMurid(true); }}>+ Tambah Murid</button>
              <div className="kur-search-wrap" style={{flex:1, minWidth:160}}>
                <span className="kur-search-ico">🔍</span>
                <input className="kur-search" placeholder="Cari nama / no. daftar…" value={q} onChange={e=>setQ(e.target.value)}/>
              </div>
              <select className="kur-select" value={filterKelas} onChange={e=>setFilterKelas(e.target.value)}>
                <option value="">Semua Kelas</option>
                {[1,2,3,4,5,6].flatMap(t=>KELAS_NAMA_LIST.map(n=><option key={`${t}${n}`} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>))}
              </select>
            </div>
            <div style={{fontSize:11,color:'var(--text3)',marginBottom:8,fontWeight:700}}>
              {filtMurid.length} murid · {filtMurid.filter(r=>r.kategori==='B40').length} B40 · {filtMurid.filter(r=>r.kategori==='M40').length} M40
            </div>
            <div className="kur-table-wrap">
              <table className="kur-table">
                <thead><tr><th>#</th><th>No. Daftar</th><th>Nama</th><th>Kelas</th><th>Kat.</th><th>Pendapatan</th><th>Waris / Tel</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {filtMurid.length === 0 && <tr><td colSpan={9} style={{textAlign:'center', color:'var(--text3)', padding:28}}>Tiada rekod.</td></tr>}
                  {filtMurid.map((r,i) => (
                    <tr key={r.id}>
                      <td style={{color:'var(--text3)',fontSize:12}}>{i+1}</td>
                      <td style={{fontFamily:'monospace', fontSize:12}}>{r.no_daftar||'—'}</td>
                      <td style={{fontWeight:800}}>{r.nama}</td>
                      <td><span style={{background:TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1]+'18',color:TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1],borderRadius:8,padding:'2px 8px',fontSize:11,fontWeight:700}}>{r.kelas||'—'}</span></td>
                      <td><span className={`badge ${katBadge(r.kategori)}`}>{r.kategori||'—'}</span></td>
                      <td style={{fontSize:12}}>{fmtRM(r.pendapatan)}</td>
                      <td style={{fontSize:11, color:'var(--text3)'}}>{r.nama_waris||'—'}{r.no_tel?` · ${r.no_tel}`:''}</td>
                      <td><span className={`badge ${r.status==='Aktif'?'b-green':'b-gray'}`}>{r.status}</span></td>
                      <td style={{display:'flex', gap:4}}>
                        <button className="btn-add" style={{padding:'4px 8px', fontSize:11}} onClick={() => setEditMurid({...r})}>✏️</button>
                        <button className="btn-add" style={{padding:'4px 8px', fontSize:11, background:'#eff6ff', borderColor:'#bfdbfe'}} title="Daftar RMT" onClick={() => handleAddRMT(r.id)}>🍱</button>
                        <button className="btn-del" onClick={() => handleDelMurid(r.id, r.nama)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: PERMOHONAN */}
        {tab === 2 && (
          <div>
            <div className="kur-header" style={{flexWrap:'wrap', gap:8}}>
              <button className="btn-add" style={{background:BP_ACCENT}} onClick={() => { setFormPerm(blankPerm); setShowAddPerm(true); }}>+ Tambah Permohonan</button>
              <select className="kur-select" value={filterTahun} onChange={e=>setFilterTahun(e.target.value)}>
                {['2023','2024','2025','2026'].map(y => <option key={y}>{y}</option>)}
              </select>
              <select className="kur-select" value={filterKelas} onChange={e=>setFilterKelas(e.target.value)}>
                <option value="">Semua Kelas</option>
                {[1,2,3,4,5,6].flatMap(t=>KELAS_NAMA_LIST.map(n=><option key={`${t}${n}`} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>))}
              </select>
              <select className="kur-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                <option value="">Semua Status</option>
                {['Mohon','Lulus','Dibayar','Ditolak'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {filtPerm.length>0 && (
              <div style={{fontSize:11,color:'var(--text3)',marginBottom:8,fontWeight:700,display:'flex',gap:16}}>
                <span>{filtPerm.length} rekod</span>
                <span style={{color:BP_ACCENT}}>Jumlah: {fmtRM(totalJumlahFilt)}</span>
              </div>
            )}
            <div className="kur-table-wrap">
              <table className="kur-table">
                <thead><tr><th>#</th><th>Nama Murid</th><th>Kelas</th><th>Bantuan</th><th>Tahun</th><th>Jumlah</th><th>Status</th><th>Tarikh Mohon</th><th></th></tr></thead>
                <tbody>
                  {filtPerm.length === 0 && <tr><td colSpan={9} style={{textAlign:'center', color:'var(--text3)', padding:28}}>Tiada rekod.</td></tr>}
                  {filtPerm.map((r,i) => (
                    <tr key={r.id} style={r.status==='Ditolak'?{background:'#fef2f2'}:r.status==='Dibayar'?{background:'#f0fdf4'}:r.status==='Lulus'?{background:'#f0f9ff'}:{}}>
                      <td style={{color:'var(--text3)',fontSize:12}}>{i+1}</td>
                      <td style={{fontWeight:800}}>{r.nama_murid}</td>
                      <td style={{fontSize:12, color:'var(--text3)'}}>{r.kelas}</td>
                      <td><span className="badge b-blue">{r.nama_bantuan}</span></td>
                      <td style={{fontSize:12}}>{r.tahun}</td>
                      <td style={{fontSize:12, fontWeight:800,color:BP_ACCENT}}>{fmtRM(r.jumlah)}</td>
                      <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                      <td style={{fontSize:11, color:'var(--text3)',whiteSpace:'nowrap'}}>{fmtTarikh(r.tarikh_mohon)}</td>
                      <td style={{display:'flex', gap:4, flexWrap:'wrap'}}>
                        {r.status === 'Mohon' && <>
                          <button className="btn-add" style={{padding:'3px 7px', fontSize:10, background:'#f0fdf4', borderColor:'#86efac'}} onClick={() => handleStatusPerm(r.id,'Lulus')}>✅ Lulus</button>
                          <button className="btn-add" style={{padding:'3px 7px', fontSize:10, background:'#fef2f2', borderColor:'#fca5a5', color:'#dc2626'}} onClick={() => handleStatusPerm(r.id,'Ditolak')}>✗ Tolak</button>
                        </>}
                        {r.status === 'Lulus' && (
                          <button className="btn-add" style={{padding:'3px 7px', fontSize:10, background:'#eff6ff', borderColor:'#bfdbfe'}} onClick={() => handleStatusPerm(r.id,'Dibayar')}>💰 Bayar</button>
                        )}
                        <button className="btn-del" onClick={() => handleDelPerm(r.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: RMT */}
        {tab === 3 && (
          <div>
            <div className="kur-header" style={{flexWrap:'wrap', gap:8}}>
              <select className="kur-select" value={filterTahun} onChange={e=>setFilterTahun(e.target.value)}>
                {['2023','2024','2025','2026'].map(y => <option key={y}>{y}</option>)}
              </select>
              <select className="kur-select" value={filterKelas} onChange={e=>setFilterKelas(e.target.value)}>
                <option value="">Semua Kelas</option>
                {[1,2,3,4,5,6].flatMap(t=>KELAS_NAMA_LIST.map(n=><option key={`${t}${n}`} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>))}
              </select>
              <div className="kur-search-wrap" style={{flex:1, minWidth:140}}>
                <span className="kur-search-ico">🔍</span>
                <input className="kur-search" placeholder="Cari nama / no. daftar…" value={qRmt} onChange={e=>setQRmt(e.target.value)}/>
              </div>
              <span style={{fontSize:12, color:'var(--text3)', fontWeight:800, padding:'8px 0'}}>
                {filtRmt.length} / {rmtTahun.length} pelajar RMT {filterTahun}
              </span>
            </div>
            <div style={{fontSize:11, color:'var(--text3)', marginBottom:10, fontWeight:700}}>
              💡 Klik 🍱 dalam tab Murid untuk daftarkan murid terus ke RMT.
            </div>
            <div className="kur-table-wrap">
              <table className="kur-table">
                <thead><tr><th>#</th><th>No. Daftar</th><th>Nama Murid</th><th>Kelas</th><th>Tahun</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {filtRmt.length === 0 && (
                    <tr><td colSpan={7} style={{textAlign:'center', color:'var(--text3)', padding:28}}>Tiada rekod RMT {filterTahun}.</td></tr>
                  )}
                  {filtRmt.map((r,i) => (
                    <tr key={r.id}>
                      <td style={{color:'var(--text3)',fontSize:12}}>{i+1}</td>
                      <td style={{fontFamily:'monospace', fontSize:12}}>{r.no_daftar||'—'}</td>
                      <td style={{fontWeight:800}}>{r.nama_murid}</td>
                      <td><span style={{background:TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1]+'18',color:TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1],borderRadius:8,padding:'2px 8px',fontSize:11,fontWeight:700}}>{r.kelas||'—'}</span></td>
                      <td style={{fontSize:12}}>{r.tahun}</td>
                      <td><span className={`badge ${r.status==='Aktif'?'b-green':'b-gray'}`}>{r.status}</span></td>
                      <td><button className="btn-del" onClick={() => handleDelRMT(r.id)}>🗑</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: JENIS BANTUAN */}
        {tab === 4 && (
          <div>
            <div className="kur-header">
              <button className="btn-add" style={{background:BP_ACCENT}} onClick={() => { setFormJenis(blankJenis); setShowAddJenis(true); }}>+ Tambah Jenis</button>
            </div>
            <div className="kur-table-wrap">
              <table className="kur-table">
                <thead><tr><th>Nama Bantuan</th><th>Jenis</th><th>Sumber</th><th>Jumlah Max</th><th>Disalurkan</th><th>Status</th><th>Catatan</th><th></th></tr></thead>
                <tbody>
                  {jenisList.length === 0 && <tr><td colSpan={8} style={{textAlign:'center', color:'var(--text3)', padding:28}}>Tiada jenis bantuan. Tambah untuk mula.</td></tr>}
                  {jenisList.map(r => {
                    const disalurkan = permohonan.filter(p=>p.jenis_id===r.id&&p.status==='Dibayar').reduce((s,p)=>s+(parseFloat(p.jumlah)||0),0);
                    return (
                      <tr key={r.id}>
                        <td style={{fontWeight:800}}>{r.nama}</td>
                        <td><span className="badge b-blue">{r.jenis}</span></td>
                        <td style={{fontSize:12}}>{r.sumber}</td>
                        <td style={{fontSize:12, fontWeight:800}}>{r.jumlah_max>0 ? fmtRM(r.jumlah_max) : '—'}</td>
                        <td style={{fontSize:12, fontWeight:800, color:BP_ACCENT}}>{disalurkan>0?fmtRM(disalurkan):'—'}</td>
                        <td><span className={`badge ${r.status==='Aktif'?'b-green':'b-gray'}`}>{r.status}</span></td>
                        <td style={{fontSize:11, color:'var(--text3)'}}>{r.catatan||'—'}</td>
                        <td style={{display:'flex', gap:4}}>
                          <button className="btn-add" style={{padding:'4px 8px', fontSize:11}} onClick={() => setEditJenis({...r})}>✏️</button>
                          <button className="btn-del" onClick={() => handleDelJenis(r.id, r.nama)}>🗑</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>)}

      {/* ── MODALS ── */}
      {showAddMurid && (
        <Modal title="Tambah Murid Berdaftar" onClose={() => setShowAddMurid(false)}>
          <form onSubmit={handleAddMurid}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">No. Daftar *</label><input className="form-input" required value={formMurid.no_daftar} onChange={e=>setFormMurid(f=>({...f,no_daftar:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Nama Murid *</label><input className="form-input" required value={formMurid.nama} onChange={e=>setFormMurid(f=>({...f,nama:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kelas</label><KelasSelect val={formMurid} set={setFormMurid}/></div>
              <div className="form-field"><label className="form-label">Jantina</label>
                <select className="form-input" value={formMurid.jantina} onChange={e=>setFormMurid(f=>({...f,jantina:e.target.value}))}>
                  <option value="L">Lelaki</option><option value="P">Perempuan</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">No. IC</label><input className="form-input" value={formMurid.no_ic} onChange={e=>setFormMurid(f=>({...f,no_ic:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Tarikh Lahir</label><input className="form-input" type="date" value={formMurid.tarikh_lahir} onChange={e=>setFormMurid(f=>({...f,tarikh_lahir:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Waris</label><input className="form-input" value={formMurid.nama_waris} onChange={e=>setFormMurid(f=>({...f,nama_waris:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">No. Tel Waris</label><input className="form-input" value={formMurid.no_tel} onChange={e=>setFormMurid(f=>({...f,no_tel:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Pekerjaan Waris</label><input className="form-input" value={formMurid.pekerjaan_waris} onChange={e=>setFormMurid(f=>({...f,pekerjaan_waris:e.target.value}))}/></div>
              <div className="form-field">
                <label className="form-label">Pendapatan Isi Rumah (RM)</label>
                <input className="form-input" type="number" min="0" value={formMurid.pendapatan} onChange={e=>setFormMurid(f=>({...f,pendapatan:e.target.value}))}/>
                <div style={{fontSize:10, color:'var(--text3)', marginTop:4}}>Auto-kategori: <strong style={{color:BP_ACCENT}}>{autoKategori(formMurid.pendapatan)}</strong></div>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Sumber Verifikasi</label><input className="form-input" placeholder="cth: APDM, Borang e-Kasih" value={formMurid.sumber} onChange={e=>setFormMurid(f=>({...f,sumber:e.target.value}))}/></div>
            <button className="btn-primary" type="submit" style={{background:BP_ACCENT}}>+ Tambah Murid</button>
          </form>
        </Modal>
      )}

      {editMurid && (
        <Modal title={`Edit — ${editMurid.nama}`} onClose={() => setEditMurid(null)}>
          <form onSubmit={handleEditMurid}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">No. Daftar</label><input className="form-input" value={editMurid.no_daftar||''} onChange={e=>setEditMurid(f=>({...f,no_daftar:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Nama</label><input className="form-input" value={editMurid.nama||''} onChange={e=>setEditMurid(f=>({...f,nama:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kelas</label><KelasSelect val={editMurid} set={setEditMurid}/></div>
              <div className="form-field"><label className="form-label">Jantina</label>
                <select className="form-input" value={editMurid.jantina||'L'} onChange={e=>setEditMurid(f=>({...f,jantina:e.target.value}))}>
                  <option value="L">Lelaki</option><option value="P">Perempuan</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Waris</label><input className="form-input" value={editMurid.nama_waris||''} onChange={e=>setEditMurid(f=>({...f,nama_waris:e.target.value}))}/></div>
              <div className="form-field">
                <label className="form-label">Pendapatan (RM)</label>
                <input className="form-input" type="number" min="0" value={editMurid.pendapatan||0} onChange={e=>setEditMurid(f=>({...f,pendapatan:e.target.value}))}/>
                <div style={{fontSize:10, color:'var(--text3)', marginTop:4}}>Auto-kategori: <strong style={{color:BP_ACCENT}}>{autoKategori(editMurid.pendapatan)}</strong></div>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={editMurid.status||'Aktif'} onChange={e=>setEditMurid(f=>({...f,status:e.target.value}))}>
                <option>Aktif</option><option>Tidak Aktif</option>
              </select>
            </div>
            <button className="btn-primary" type="submit" style={{background:BP_ACCENT}}>💾 Simpan</button>
          </form>
        </Modal>
      )}

      {showAddPerm && (
        <Modal title="Tambah Permohonan Bantuan" onClose={() => setShowAddPerm(false)}>
          <form onSubmit={handleAddPerm}>
            <div className="form-field"><label className="form-label">Murid *</label>
              <select className="form-input" required value={formPerm.id_murid} onChange={e => {
                const m = murid.find(r => r.id === e.target.value);
                setFormPerm(f => ({ ...f, id_murid:e.target.value, nama_murid:m?.nama||'', no_daftar:m?.no_daftar||'', kelas:m?.kelas||'' }));
              }}>
                <option value="">-- Pilih Murid --</option>
                {murid.map(m => <option key={m.id} value={m.id}>{m.nama} ({m.kelas})</option>)}
              </select>
            </div>
            <div className="form-field"><label className="form-label">Jenis Bantuan *</label>
              <select className="form-input" required value={formPerm.jenis_id} onChange={e=>setFormPerm(f=>({...f,jenis_id:e.target.value}))}>
                <option value="">-- Pilih Bantuan --</option>
                {jenisList.map(j => <option key={j.id} value={j.id}>{j.nama} ({j.jenis})</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tahun</label>
                <select className="form-input" value={formPerm.tahun} onChange={e=>setFormPerm(f=>({...f,tahun:e.target.value}))}>
                  {['2023','2024','2025','2026'].map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-label">Jumlah (RM)</label>
                <input className="form-input" type="number" min="0" step="0.01" value={formPerm.jumlah} onChange={e=>setFormPerm(f=>({...f,jumlah:e.target.value}))}/>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={formPerm.catatan} onChange={e=>setFormPerm(f=>({...f,catatan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit" style={{background:BP_ACCENT}}>+ Tambah Permohonan</button>
          </form>
        </Modal>
      )}

      {showAddJenis && (
        <Modal title="Tambah Jenis Bantuan" onClose={() => setShowAddJenis(false)}>
          <form onSubmit={handleAddJenis}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama *</label><input className="form-input" required value={formJenis.nama} onChange={e=>setFormJenis(f=>({...f,nama:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jenis</label>
                <select className="form-input" value={formJenis.jenis} onChange={e=>setFormJenis(f=>({...f,jenis:e.target.value}))}>
                  {['Makanan','Wang','Baucar','Lain-lain'].map(j=><option key={j}>{j}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Sumber</label><input className="form-input" placeholder="KPM / Zakat / PIBG" value={formJenis.sumber} onChange={e=>setFormJenis(f=>({...f,sumber:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jumlah Max (RM)</label><input className="form-input" type="number" min="0" value={formJenis.jumlah_max} onChange={e=>setFormJenis(f=>({...f,jumlah_max:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={formJenis.catatan} onChange={e=>setFormJenis(f=>({...f,catatan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit" style={{background:BP_ACCENT}}>+ Tambah</button>
          </form>
        </Modal>
      )}

      {editJenis && (
        <Modal title={`Edit — ${editJenis.nama}`} onClose={() => setEditJenis(null)}>
          <form onSubmit={handleEditJenis}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama</label><input className="form-input" value={editJenis.nama||''} onChange={e=>setEditJenis(f=>({...f,nama:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jenis</label>
                <select className="form-input" value={editJenis.jenis||'Wang'} onChange={e=>setEditJenis(f=>({...f,jenis:e.target.value}))}>
                  {['Makanan','Wang','Baucar','Lain-lain'].map(j=><option key={j}>{j}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Sumber</label><input className="form-input" value={editJenis.sumber||''} onChange={e=>setEditJenis(f=>({...f,sumber:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jumlah Max (RM)</label><input className="form-input" type="number" min="0" value={editJenis.jumlah_max||0} onChange={e=>setEditJenis(f=>({...f,jumlah_max:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Status</label>
                <select className="form-input" value={editJenis.status||'Aktif'} onChange={e=>setEditJenis(f=>({...f,status:e.target.value}))}>
                  <option>Aktif</option><option>Tidak Aktif</option>
                </select>
              </div>
              <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={editJenis.catatan||''} onChange={e=>setEditJenis(f=>({...f,catatan:e.target.value}))}/></div>
            </div>
            <button className="btn-primary" type="submit" style={{background:BP_ACCENT}}>💾 Simpan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 6. KESELAMATAN & 3K ──────────────────────────────────────────────────
const JENIS_3K = ["Kebersihan","Keselamatan","Kesihatan","Gotong-royong","Lain-lain"];
const TK_ACCENT = "#0d9488";

function Hem3K() {
  const TABS_3K = ['🛡️ Senarai', '📅 Paparan Bulanan', '📊 Ringkasan'];
  const [subtab, setSubtab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [q, setQ] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const blank = { tajuk:"", tarikh:"", jenis:"Kebersihan", lokasi:"", status:"Akan Datang" };
  const [form, setForm] = useState(blank);
  const badgeMap = { "Selesai":"b-green", "Akan Datang":"b-yellow", "Dalam Proses":"b-blue" };
  const BULAN = ["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogos","Sep","Okt","Nov","Dis"];
  const tahunList = [...new Set(data.map(r=>r.tarikh?.split('-')[0]||r.tarikh?.split(' ').pop()).filter(Boolean))].sort().reverse();

  const fmtTarikh = (t) => {
    if (!t) return '—';
    const d = new Date(t);
    return isNaN(d) ? t : d.toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'numeric'});
  };

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_3k').select('*').order('tarikh', { ascending: false });
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
  const handleDel = async (id, tajuk) => {
    if (!window.confirm(`Padam aktiviti "${tajuk}"?`)) return;
    const ok = await dbRun(() => supabase.from('hem_3k').delete().eq('id', id));
    if (ok) { setData(d => d.filter(r => r.id !== id)); toast("Dipadam.", "info"); }
  };

  const filtered = data.filter(r => {
    if (q && !r.tajuk?.toLowerCase().includes(q.toLowerCase()) && !r.lokasi?.toLowerCase().includes(q.toLowerCase())) return false;
    if (filterJenis && r.jenis !== filterJenis) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterTahun && !r.tarikh?.startsWith(filterTahun)) return false;
    return true;
  });
  const activeFilters = [filterJenis, filterStatus, filterTahun].filter(Boolean);
  const resetFilters = () => { setQ(''); setFilterJenis(''); setFilterStatus(''); setFilterTahun(''); };

  const selesai = data.filter(r => r.status === "Selesai").length;
  const pctSelesai = data.length ? Math.round(selesai/data.length*100) : 0;
  const byJenis = JENIS_3K.map(j=>({
    jenis:j,
    total:data.filter(r=>r.jenis===j).length,
    selesai:data.filter(r=>r.jenis===j&&r.status==="Selesai").length
  })).filter(j=>j.total>0);
  const maxJenis = byJenis[0]?.total||1;
  const byBulan = BULAN.map((b,i) => ({
    bulan:b, idx:i,
    items:data.filter(r=>{ const d=new Date(r.tarikh); return !isNaN(d)&&d.getMonth()===i&&(!filterTahun||r.tarikh?.startsWith(filterTahun)); })
  })).filter(b=>b.items.length>0);

  return (
    <KurPage title="Keselamatan & 3K" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"🛡️", val:data.length, lbl:"Aktiviti" },
        { ico:"✅", val:selesai, lbl:"Selesai" },
        { ico:"📅", val:data.filter(r=>r.status==="Akan Datang").length, lbl:"Akan Datang" },
        { ico:"🔄", val:data.filter(r=>r.status==="Dalam Proses").length, lbl:"Dalam Proses" },
      ]}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {TABS_3K.map((t,i)=>(
          <button key={i} onClick={()=>setSubtab(i)} style={{padding:"7px 16px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
            background:subtab===i?TK_ACCENT:"var(--card2)",color:subtab===i?"#fff":"var(--text2)"}}>
            {t}
          </button>
        ))}
      </div>

      {subtab===0 && (<>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8,alignItems:"center"}}>
          <input className="form-input" style={{maxWidth:200,marginBottom:0}} placeholder="🔍 Cari tajuk / lokasi…" value={q} onChange={e=>setQ(e.target.value)}/>
          <select className="form-input" style={{maxWidth:130,marginBottom:0}} value={filterTahun} onChange={e=>setFilterTahun(e.target.value)}>
            <option value="">Semua Tahun</option>
            {tahunList.map(y=><option key={y}>{y}</option>)}
          </select>
          <select className="form-input" style={{maxWidth:160,marginBottom:0}} value={filterJenis} onChange={e=>setFilterJenis(e.target.value)}>
            <option value="">Semua Jenis</option>{JENIS_3K.map(j=><option key={j}>{j}</option>)}
          </select>
          <select className="form-input" style={{maxWidth:160,marginBottom:0}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option><option>Akan Datang</option><option>Dalam Proses</option><option>Selesai</option>
          </select>
          {(q||activeFilters.length>0) && <button onClick={resetFilters} style={{padding:"6px 10px",borderRadius:8,border:"1px solid var(--border)",background:"var(--card2)",cursor:"pointer",fontSize:12,color:"var(--text3)"}}>✕ Reset</button>}
          <button className="btn-add" style={{marginLeft:"auto",background:TK_ACCENT}} onClick={()=>setShowAdd(true)}>+ Tambah Aktiviti</button>
        </div>
        {activeFilters.length>0 && (
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
            {activeFilters.map(f=><span key={f} style={{background:TK_ACCENT+"22",color:TK_ACCENT,borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700}}>{f}</span>)}
            <span style={{fontSize:11,color:"var(--text3)",alignSelf:"center"}}>{filtered.length} aktiviti</span>
          </div>
        )}
        {loading ? <div className="loading">⏳ Memuatkan…</div> : (
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead><tr><th>#</th><th>Tajuk Aktiviti</th><th>Tarikh</th><th>Jenis</th><th>Lokasi</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map((r,i) => (
                  <tr key={r.id} style={r.status==="Selesai"?{opacity:0.75}:{}}>
                    <td style={{color:"var(--text3)",fontSize:12}}>{i+1}</td>
                    <td style={{fontWeight:800}}>{r.tajuk}</td>
                    <td style={{color:"var(--text3)",whiteSpace:"nowrap",fontSize:12}}>{fmtTarikh(r.tarikh)}</td>
                    <td><span style={{background:TK_ACCENT+"20",color:TK_ACCENT,borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:700}}>{r.jenis}</span></td>
                    <td style={{color:"var(--text2)",fontSize:12}}>{r.lokasi||'—'}</td>
                    <td><span className={`badge ${badgeMap[r.status]||"b-gray"}`}>{r.status}</span></td>
                    <td style={{display:"flex",gap:4}}>
                      <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...r})}>✏️</button>
                      <button className="btn-del" onClick={()=>handleDel(r.id, r.tajuk)}>🗑</button>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan={7} style={{textAlign:"center",color:"var(--text3)",padding:24}}>Tiada rekod</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </>)}

      {subtab===1 && (<>
        <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
          <select className="form-input" style={{maxWidth:130,marginBottom:0}} value={filterTahun} onChange={e=>setFilterTahun(e.target.value)}>
            <option value="">Semua Tahun</option>
            {tahunList.map(y=><option key={y}>{y}</option>)}
          </select>
          <span style={{fontSize:12,color:"var(--text3)",fontWeight:700}}>{byBulan.reduce((s,b)=>s+b.items.length,0)} aktiviti</span>
        </div>
        {byBulan.length===0 ? <div style={{color:"var(--text3)",padding:24,textAlign:"center"}}>Tiada data bertarikh</div> :
        byBulan.map(({bulan,items})=>(
          <div key={bulan} className="kur-card" style={{marginBottom:12,padding:14}}>
            <div style={{fontWeight:800,marginBottom:10,color:TK_ACCENT,fontSize:15,display:"flex",justifyContent:"space-between"}}>
              <span>{bulan}</span>
              <span style={{fontSize:11,fontWeight:700,color:"var(--text3)"}}>{items.length} aktiviti</span>
            </div>
            {items.map(r=>(
              <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{r.tajuk}</div>
                  <div style={{fontSize:11,color:"var(--text3)"}}>{fmtTarikh(r.tarikh)}{r.lokasi?` · ${r.lokasi}`:''}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                  <span style={{background:TK_ACCENT+"20",color:TK_ACCENT,borderRadius:8,padding:"2px 7px",fontSize:10,fontWeight:700}}>{r.jenis}</span>
                  <span className={`badge ${badgeMap[r.status]||"b-gray"}`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </>)}

      {subtab===2 && (<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div className="kur-card" style={{padding:16}}>
            <div style={{fontWeight:700,marginBottom:12,color:"var(--text2)"}}>Aktiviti Mengikut Jenis</div>
            {byJenis.map(({jenis,total,selesai:s})=>(
              <div key={jenis} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span style={{fontWeight:700}}>{jenis}</span>
                  <span style={{color:"var(--text3)"}}><b style={{color:TK_ACCENT}}>{s}</b>/{total} selesai</span>
                </div>
                <div style={{background:"var(--border)",borderRadius:4,height:8,overflow:"hidden"}}>
                  <div style={{width:`${(total/maxJenis)*100}%`,height:8,borderRadius:4,background:TK_ACCENT+"40",position:"relative"}}>
                    <div style={{width:`${total?s/total*100:0}%`,height:"100%",borderRadius:4,background:TK_ACCENT}}></div>
                  </div>
                </div>
              </div>
            ))}
            {byJenis.length===0 && <div style={{color:"var(--text3)",fontSize:13}}>Tiada data</div>}
          </div>
          <div className="kur-card" style={{padding:16}}>
            <div style={{fontWeight:700,marginBottom:12,color:"var(--text2)"}}>Peratusan Selesai</div>
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:52,fontWeight:900,color:TK_ACCENT}}>{pctSelesai}%</div>
              <div style={{fontSize:13,color:"var(--text3)",marginTop:4}}>aktiviti telah selesai</div>
            </div>
            <div style={{background:"var(--border)",borderRadius:8,height:16,marginTop:8}}>
              <div style={{width:`${pctSelesai}%`,height:16,borderRadius:8,background:TK_ACCENT,transition:"width 0.5s"}}></div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text3)",marginTop:6}}>
              <span>✅ {selesai} selesai</span>
              <span>📋 {data.length} jumlah</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:16}}>
              {[["📅","Akan Datang","b-yellow"],["🔄","Dalam Proses","b-blue"]].map(([ico,s,b])=>(
                <div key={s} style={{textAlign:"center",padding:"8px",background:"var(--card2)",borderRadius:8}}>
                  <div style={{fontSize:18}}>{ico}</div>
                  <div style={{fontWeight:900,fontSize:18,color:"var(--accent)"}}>{data.filter(r=>r.status===s).length}</div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>)}

      {showAdd && (
        <Modal title="Tambah Aktiviti 3K" onClose={()=>setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-field"><label className="form-label">Tajuk Aktiviti *</label>
              <input className="form-input" required value={form.tajuk} placeholder="cth: Gotong-royong Bulanan"
                onChange={e=>setForm(f=>({...f,tajuk:e.target.value}))}/>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label>
                <input className="form-input" type="date" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/>
              </div>
              <div className="form-field"><label className="form-label">Jenis</label>
                <select className="form-input" value={form.jenis} onChange={e=>setForm(f=>({...f,jenis:e.target.value}))}>
                  {JENIS_3K.map(j=><option key={j}>{j}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Lokasi</label>
              <input className="form-input" value={form.lokasi} placeholder="cth: Padang sekolah"
                onChange={e=>setForm(f=>({...f,lokasi:e.target.value}))}/>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Akan Datang</option><option>Dalam Proses</option><option>Selesai</option>
              </select>
            </div>
            <button className="btn-primary" type="submit" style={{background:TK_ACCENT}}>+ Tambah Aktiviti</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.tajuk}`} onClose={()=>setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-field"><label className="form-label">Tajuk Aktiviti</label>
              <input className="form-input" value={editItem.tajuk} onChange={e=>setEditItem(f=>({...f,tajuk:e.target.value}))}/>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label>
                <input className="form-input" type="date" value={editItem.tarikh} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/>
              </div>
              <div className="form-field"><label className="form-label">Jenis</label>
                <select className="form-input" value={editItem.jenis} onChange={e=>setEditItem(f=>({...f,jenis:e.target.value}))}>
                  {JENIS_3K.map(j=><option key={j}>{j}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Lokasi</label>
              <input className="form-input" value={editItem.lokasi} onChange={e=>setEditItem(f=>({...f,lokasi:e.target.value}))}/>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                <option>Akan Datang</option><option>Dalam Proses</option><option>Selesai</option>
              </select>
            </div>
            <button className="btn-primary" type="submit" style={{background:TK_ACCENT}}>💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 7. PENGAWAS SEKOLAH ──────────────────────────────────────────────────
const JAWATAN_PENGAWAS = [
  "Ketua Pengawas",
  "Penolong Ketua Pengawas",
  "Ketua Pengawas Tingkat / Blok",
  "Pengawas Kantin",
  "Pengawas Perpustakaan",
  "Pengawas Biasa",
];
const PW_ACCENT = "#d97706";
const jawatanColor = (j) => {
  if (j==="Ketua Pengawas") return {bg:"#7c3aed20",col:"#7c3aed"};
  if (j==="Penolong Ketua Pengawas") return {bg:"#2563eb20",col:"#2563eb"};
  if (j==="Ketua Pengawas Tingkat / Blok") return {bg:"#0891b220",col:"#0891b2"};
  if (j==="Pengawas Kantin") return {bg:"#d9770620",col:"#d97706"};
  if (j==="Pengawas Perpustakaan") return {bg:"#05966920",col:"#059669"};
  return {bg:"#94a3b820",col:"#64748b"};
};

function HemPengawas() {
  const TABS_PW = ['🎖️ Senarai', '👑 Ikut Jawatan', '🏫 Ikut Kelas'];
  const [subtab, setSubtab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [q, setQ] = useState('');
  const [filterJawatan, setFilterJawatan] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const blank = { nama:"", kelas:"", jawatan:"Pengawas Biasa", tarikh_lantik:"", status:"Aktif" };
  const [form, setForm] = useState(blank);

  const fmtTarikh = (t) => {
    if (!t) return '—';
    const d = new Date(t);
    return isNaN(d) ? t : d.toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'numeric'});
  };

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_pengawas').select('*').order('jawatan').then(r=>({...r,data:(r.data||[]).sort((a,b)=>JAWATAN_PENGAWAS.indexOf(a.jawatan)-JAWATAN_PENGAWAS.indexOf(b.jawatan)||a.nama.localeCompare(b.nama))}));
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
  const handleDel = async (id, nama) => {
    if (!window.confirm(`Padam pengawas "${nama}"?`)) return;
    const ok = await dbRun(() => supabase.from('hem_pengawas').delete().eq('id', id));
    if (ok) { setData(d => d.filter(r => r.id !== id)); toast("Dipadam.", "info"); }
  };

  const filtered = data.filter(r => {
    if (q && !r.nama?.toLowerCase().includes(q.toLowerCase())) return false;
    if (filterJawatan && r.jawatan !== filterJawatan) return false;
    if (filterKelas && r.kelas !== filterKelas) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });
  const activeFilters = [filterJawatan, filterKelas, filterStatus].filter(Boolean);
  const resetFilters = () => { setQ(''); setFilterJawatan(''); setFilterKelas(''); setFilterStatus(''); };

  const byJawatan = JAWATAN_PENGAWAS.map(j=>({ jawatan:j, list:data.filter(r=>r.jawatan===j&&r.status==="Aktif") })).filter(j=>j.list.length>0);
  const byTahun = [1,2,3,4,5,6].map(t=>({
    tahun:t,
    list:data.filter(r=>r.kelas?.startsWith(`Tahun ${t}`))
  })).filter(t=>t.list.length>0);

  const aktif = data.filter(r => r.status === "Aktif").length;
  return (
    <KurPage title="Pengawas Sekolah" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"🎖️", val:data.length, lbl:"Pengawas" },
        { ico:"✅", val:aktif, lbl:"Aktif" },
        { ico:"👑", val:data.filter(r=>r.jawatan==="Ketua Pengawas").length, lbl:"Ketua" },
        { ico:"🏅", val:data.filter(r=>r.jawatan==="Pengawas Biasa").length, lbl:"Biasa" },
      ]}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {TABS_PW.map((t,i)=>(
          <button key={i} onClick={()=>setSubtab(i)} style={{padding:"7px 16px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
            background:subtab===i?PW_ACCENT:"var(--card2)",color:subtab===i?"#fff":"var(--text2)"}}>
            {t}
          </button>
        ))}
      </div>

      {subtab===0 && (<>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8,alignItems:"center"}}>
          <input className="form-input" style={{maxWidth:200,marginBottom:0}} placeholder="🔍 Cari nama…" value={q} onChange={e=>setQ(e.target.value)}/>
          <select className="form-input" style={{maxWidth:220,marginBottom:0}} value={filterJawatan} onChange={e=>setFilterJawatan(e.target.value)}>
            <option value="">Semua Jawatan</option>{JAWATAN_PENGAWAS.map(j=><option key={j}>{j}</option>)}
          </select>
          <select className="form-input" style={{maxWidth:180,marginBottom:0}} value={filterKelas} onChange={e=>setFilterKelas(e.target.value)}>
            <option value="">Semua Kelas</option>
            {[1,2,3,4,5,6].flatMap(t=>KELAS_NAMA_LIST.map(n=><option key={`${t}${n}`} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>))}
          </select>
          <select className="form-input" style={{maxWidth:140,marginBottom:0}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option><option>Aktif</option><option>Tidak Aktif</option>
          </select>
          {(q||activeFilters.length>0) && <button onClick={resetFilters} style={{padding:"6px 10px",borderRadius:8,border:"1px solid var(--border)",background:"var(--card2)",cursor:"pointer",fontSize:12,color:"var(--text3)"}}>✕ Reset</button>}
          <button className="btn-add" style={{marginLeft:"auto",background:PW_ACCENT}} onClick={()=>setShowAdd(true)}>+ Tambah Pengawas</button>
        </div>
        {activeFilters.length>0 && (
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
            {activeFilters.map(f=><span key={f} style={{background:PW_ACCENT+"22",color:PW_ACCENT,borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700}}>{f}</span>)}
            <span style={{fontSize:11,color:"var(--text3)",alignSelf:"center"}}>{filtered.length} pengawas</span>
          </div>
        )}
        {loading ? <div className="loading">⏳ Memuatkan…</div> : (
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead><tr><th>#</th><th>Nama</th><th>Kelas</th><th>Jawatan</th><th>Tarikh Lantik</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map((r, i) => {
                  const jc = jawatanColor(r.jawatan);
                  return (
                    <tr key={r.id}>
                      <td style={{fontWeight:900,color:PW_ACCENT}}>{i+1}</td>
                      <td style={{fontWeight:800}}>{r.nama}</td>
                      <td><span style={{background:TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1]+'18',color:TAHUN_COLORS[(parseInt(r.kelas?.split(' ')[1])||1)-1],borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:700}}>{r.kelas||'—'}</span></td>
                      <td><span style={{background:jc.bg,color:jc.col,borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:700}}>{r.jawatan}</span></td>
                      <td style={{color:"var(--text3)",whiteSpace:"nowrap",fontSize:12}}>{fmtTarikh(r.tarikh_lantik)}</td>
                      <td><span className={`badge ${r.status==="Aktif"?"b-green":"b-gray"}`}>{r.status}</span></td>
                      <td style={{display:"flex",gap:4}}>
                        <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...r})}>✏️</button>
                        <button className="btn-del" onClick={()=>handleDel(r.id, r.nama)}>🗑</button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0 && <tr><td colSpan={7} style={{textAlign:"center",color:"var(--text3)",padding:24}}>Tiada rekod</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </>)}

      {subtab===1 && (<>
        {byJawatan.length===0 && <div style={{color:"var(--text3)",padding:24,textAlign:"center"}}>Tiada pengawas aktif</div>}
        {byJawatan.map(({jawatan,list})=>{
          const jc = jawatanColor(jawatan);
          return (
            <div key={jawatan} style={{background:jc.bg,border:`1.5px solid ${jc.col}30`,borderRadius:14,marginBottom:14,padding:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontWeight:800,fontSize:14,color:jc.col}}>{jawatan}</div>
                <span style={{background:jc.col,color:"#fff",borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700}}>{list.length} orang</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
                {list.map((r,i)=>(
                  <div key={r.id} style={{background:"#fff",borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8,border:`1px solid ${jc.col}20`}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:jc.col,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,flexShrink:0}}>{i+1}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:12}}>{r.nama}</div>
                      <div style={{fontSize:10,color:"var(--text3)"}}>{r.kelas||'—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </>)}

      {subtab===2 && (<>
        {byTahun.length===0 && <div style={{color:"var(--text3)",padding:24,textAlign:"center"}}>Tiada data kelas</div>}
        {byTahun.map(({tahun,list})=>(
          <div key={tahun} style={{background:TAHUN_COLORS[tahun-1]+'10',border:`1.5px solid ${TAHUN_COLORS[tahun-1]}30`,borderRadius:14,marginBottom:12,padding:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontWeight:800,fontSize:14,color:TAHUN_COLORS[tahun-1]}}>Tahun {tahun}</div>
              <span style={{background:TAHUN_COLORS[tahun-1],color:"#fff",borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700}}>{list.length} pengawas</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {list.map(r=>{
                const jc = jawatanColor(r.jawatan);
                return (
                  <div key={r.id} style={{background:"#fff",borderRadius:8,padding:"5px 10px",fontSize:12,display:"flex",gap:6,alignItems:"center",border:`1px solid ${TAHUN_COLORS[tahun-1]}20`}}>
                    <span style={{fontWeight:700}}>{r.nama}</span>
                    <span style={{background:jc.bg,color:jc.col,borderRadius:6,padding:"1px 6px",fontSize:10,fontWeight:700}}>{r.jawatan}</span>
                    {r.status!=="Aktif" && <span style={{fontSize:10,color:"var(--text3)"}}>(Tidak Aktif)</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </>)}

      {showAdd && (
        <Modal title="Tambah Pengawas" onClose={()=>setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama *</label>
                <input className="form-input" required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/>
              </div>
              <div className="form-field"><label className="form-label">Kelas</label>
                <select className="form-input" value={form.kelas} onChange={e=>setForm(f=>({...f,kelas:e.target.value}))}>
                  <option value="">— Pilih Kelas —</option>
                  {[1,2,3,4,5,6].map(t=>(
                    <optgroup key={t} label={`Tahun ${t}`}>
                      {KELAS_NAMA_LIST.map(n=><option key={n} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Jawatan</label>
                <select className="form-input" value={form.jawatan} onChange={e=>setForm(f=>({...f,jawatan:e.target.value}))}>
                  {JAWATAN_PENGAWAS.map(j=><option key={j}>{j}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-label">Tarikh Lantik</label>
                <input className="form-input" type="date" value={form.tarikh_lantik} onChange={e=>setForm(f=>({...f,tarikh_lantik:e.target.value}))}/>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Aktif</option><option>Tidak Aktif</option>
              </select>
            </div>
            <button className="btn-primary" type="submit" style={{background:PW_ACCENT}}>+ Tambah Pengawas</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama}`} onClose={()=>setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama</label>
                <input className="form-input" value={editItem.nama} onChange={e=>setEditItem(f=>({...f,nama:e.target.value}))}/>
              </div>
              <div className="form-field"><label className="form-label">Kelas</label>
                <select className="form-input" value={editItem.kelas||''} onChange={e=>setEditItem(f=>({...f,kelas:e.target.value}))}>
                  <option value="">— Pilih Kelas —</option>
                  {[1,2,3,4,5,6].map(t=>(
                    <optgroup key={t} label={`Tahun ${t}`}>
                      {KELAS_NAMA_LIST.map(n=><option key={n} value={`Tahun ${t} ${n}`}>Tahun {t} {n}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Jawatan</label>
                <select className="form-input" value={editItem.jawatan} onChange={e=>setEditItem(f=>({...f,jawatan:e.target.value}))}>
                  {JAWATAN_PENGAWAS.map(j=><option key={j}>{j}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-label">Tarikh Lantik</label>
                <input className="form-input" type="date" value={editItem.tarikh_lantik||''} onChange={e=>setEditItem(f=>({...f,tarikh_lantik:e.target.value}))}/>
              </div>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                <option>Aktif</option><option>Tidak Aktif</option>
              </select>
            </div>
            <button className="btn-primary" type="submit" style={{background:PW_ACCENT}}>💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM 8. KOPERASI ──────────────────────────────────────────────────────────
const KP_ACCENT = "#e11d48";
const KAT_LIST = ["Alat Tulis","Pakaian","Makanan & Minuman","Buku","Lain-lain"];
const KAT_COLORS = {
  "Alat Tulis":    { bg:"#2563eb20", col:"#2563eb" },
  "Pakaian":       { bg:"#7c3aed20", col:"#7c3aed" },
  "Makanan & Minuman":{ bg:"#d9770620", col:"#d97706" },
  "Buku":          { bg:"#05966920", col:"#059669" },
  "Lain-lain":     { bg:"#64748b20", col:"#64748b" },
};

function HemKoperasi() {
  const TABS_KP = ['🏪 Inventori', '📊 Analisis Stok', '💰 Nilai & Laporan'];
  const [subtab, setSubtab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [q, setQ] = useState('');
  const [filterKat, setFilterKat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const blank = { nama_produk:"", kategori:"Alat Tulis", stok:0, harga:0, status:"Tersedia" };
  const [form, setForm] = useState(blank);

  const fmtRM = v => 'RM ' + parseFloat(v||0).toLocaleString('ms-MY', { minimumFractionDigits:2 });
  const stokStatus = (stok) => stok === 0 ? 'Habis' : stok < 10 ? 'Sedikit' : 'Tersedia';
  const stokBadge = (stok) => stok === 0 ? 'b-red' : stok < 10 ? 'b-yellow' : 'b-green';

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('hem_koperasi').select('*').order('kategori').then(r=>({...r,data:(r.data||[]).sort((a,b)=>a.kategori.localeCompare(b.kategori)||a.nama_produk.localeCompare(b.nama_produk))}));
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
  const handleDel = async (id, nama) => {
    if (!window.confirm(`Padam produk "${nama}"?`)) return;
    const ok = await dbRun(() => supabase.from('hem_koperasi').delete().eq('id', id));
    if (ok) { setData(d => d.filter(r => r.id !== id)); toast("Dipadam.", "info"); }
  };
  const adjustStok = async (id, cur, delta) => {
    const val = Math.max(0, cur + delta);
    const ok = await dbRun(() => supabase.from('hem_koperasi').update({ stok: val }).eq('id', id));
    if (ok) setData(d => d.map(r => r.id === id ? {...r, stok:val} : r));
  };

  const filtered = data.filter(r => {
    if (q && !r.nama_produk?.toLowerCase().includes(q.toLowerCase())) return false;
    if (filterKat && r.kategori !== filterKat) return false;
    if (filterStatus) {
      const ss = stokStatus(r.stok);
      if (filterStatus !== ss) return false;
    }
    return true;
  });
  const activeFilters = [filterKat, filterStatus].filter(Boolean);
  const resetFilters = () => { setQ(''); setFilterKat(''); setFilterStatus(''); };

  const byKat = KAT_LIST.map(k => ({
    kat:k,
    count:data.filter(r=>r.kategori===k).length,
    stok:data.filter(r=>r.kategori===k).reduce((a,r)=>a+(r.stok||0),0),
    nilai:data.filter(r=>r.kategori===k).reduce((a,r)=>a+(r.stok||0)*(r.harga||0),0),
  })).filter(k=>k.count>0);

  const lowStock = data.filter(r=>r.stok>0 && r.stok<10).sort((a,b)=>a.stok-b.stok);
  const habis = data.filter(r=>r.stok===0);
  const totalNilai = data.reduce((a,r)=>a+(r.stok||0)*(r.harga||0),0);
  const totalStok = data.reduce((a,r)=>a+(r.stok||0),0);
  const maxStok = byKat.length ? Math.max(...byKat.map(k=>k.stok),1) : 1;
  const maxNilai = byKat.length ? Math.max(...byKat.map(k=>k.nilai),1) : 1;
  const top5 = [...data].sort((a,b)=>((b.stok||0)*(b.harga||0))-((a.stok||0)*(a.harga||0))).slice(0,5);

  return (
    <KurPage title="Koperasi Sekolah" sub="HEM · SK Darau, Kota Kinabalu"
      stats={[
        { ico:"🏪", val:data.length, lbl:"Produk" },
        { ico:"📦", val:totalStok, lbl:"Jumlah Unit" },
        { ico:"⚠️", val:lowStock.length, lbl:"Stok Rendah" },
        { ico:"🚫", val:habis.length, lbl:"Kehabisan" },
      ]}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {TABS_KP.map((t,i)=>(
          <button key={i} onClick={()=>setSubtab(i)} style={{padding:"7px 16px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
            background:subtab===i?KP_ACCENT:"var(--card2)",color:subtab===i?"#fff":"var(--text2)"}}>
            {t}
          </button>
        ))}
      </div>

      {subtab===0 && (<>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8,alignItems:"center"}}>
          <input className="form-input" style={{maxWidth:200,marginBottom:0}} placeholder="🔍 Cari produk…" value={q} onChange={e=>setQ(e.target.value)}/>
          <select className="form-input" style={{maxWidth:180,marginBottom:0}} value={filterKat} onChange={e=>setFilterKat(e.target.value)}>
            <option value="">Semua Kategori</option>{KAT_LIST.map(k=><option key={k}>{k}</option>)}
          </select>
          <select className="form-input" style={{maxWidth:140,marginBottom:0}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option>Tersedia</option><option>Sedikit</option><option>Habis</option>
          </select>
          {(q||activeFilters.length>0) && <button onClick={resetFilters} style={{padding:"6px 10px",borderRadius:8,border:"1px solid var(--border)",background:"var(--card2)",cursor:"pointer",fontSize:12,color:"var(--text3)"}}>✕ Reset</button>}
          <button className="btn-add" style={{marginLeft:"auto",background:KP_ACCENT}} onClick={()=>setShowAdd(true)}>+ Tambah Produk</button>
        </div>
        {activeFilters.length>0 && (
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
            {activeFilters.map(f=><span key={f} style={{background:KP_ACCENT+"22",color:KP_ACCENT,borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700}}>{f}</span>)}
            <span style={{fontSize:11,color:"var(--text3)",alignSelf:"center"}}>{filtered.length} produk</span>
          </div>
        )}
        {loading ? <div className="loading">⏳ Memuatkan…</div> : (
          <div className="kur-table-wrap">
            <table className="kur-table">
              <thead><tr><th>#</th><th>Nama Produk</th><th>Kategori</th><th>Stok</th><th>Harga</th><th>Nilai</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map((r,i) => {
                  const kc = KAT_COLORS[r.kategori]||KAT_COLORS["Lain-lain"];
                  return (
                    <tr key={r.id} style={r.stok===0?{background:"#fef2f2"}:r.stok<10?{background:"#fffbeb"}:{}}>
                      <td style={{color:"var(--text3)",fontSize:12}}>{i+1}</td>
                      <td style={{fontWeight:800}}>{r.nama_produk}</td>
                      <td><span style={{background:kc.bg,color:kc.col,borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:700}}>{r.kategori}</span></td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <button onClick={()=>adjustStok(r.id,r.stok,-1)} style={{border:"1px solid var(--border)",background:"var(--surface)",borderRadius:4,width:22,height:22,cursor:"pointer",fontWeight:900,lineHeight:1}}>−</button>
                          <span style={{fontWeight:900,minWidth:26,textAlign:"center",color:r.stok===0?"#dc2626":r.stok<10?"#d97706":"var(--accent)"}}>{r.stok}</span>
                          <button onClick={()=>adjustStok(r.id,r.stok,1)} style={{border:"1px solid var(--border)",background:"var(--surface)",borderRadius:4,width:22,height:22,cursor:"pointer",fontWeight:900,lineHeight:1}}>+</button>
                        </div>
                      </td>
                      <td style={{fontWeight:700,fontSize:12}}>{fmtRM(r.harga)}</td>
                      <td style={{fontWeight:700,fontSize:12,color:KP_ACCENT}}>{fmtRM((r.stok||0)*(r.harga||0))}</td>
                      <td><span className={`badge ${stokBadge(r.stok)}`}>{stokStatus(r.stok)}</span></td>
                      <td style={{display:"flex",gap:4}}>
                        <button className="btn-add" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setEditItem({...r})}>✏️</button>
                        <button className="btn-del" onClick={()=>handleDel(r.id, r.nama_produk)}>🗑</button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0 && <tr><td colSpan={8} style={{textAlign:"center",color:"var(--text3)",padding:24}}>Tiada rekod</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </>)}

      {subtab===1 && (<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div className="kur-card" style={{padding:16}}>
            <div style={{fontWeight:700,marginBottom:12,color:"var(--text2)"}}>Unit Stok Mengikut Kategori</div>
            {byKat.map(({kat,stok})=>{
              const kc = KAT_COLORS[kat]||KAT_COLORS["Lain-lain"];
              return (
                <div key={kat} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                    <span style={{fontWeight:700,color:kc.col}}>{kat}</span><b>{stok} unit</b>
                  </div>
                  <div style={{background:"var(--border)",borderRadius:4,height:8}}>
                    <div style={{width:`${(stok/maxStok)*100}%`,height:8,borderRadius:4,background:kc.col}}></div>
                  </div>
                </div>
              );
            })}
            {byKat.length===0 && <div style={{color:"var(--text3)",fontSize:13}}>Tiada data</div>}
          </div>
          <div className="kur-card" style={{padding:16}}>
            <div style={{fontWeight:700,marginBottom:12,color:"var(--text2)"}}>⚠️ Amaran Stok ({lowStock.length+habis.length} produk)</div>
            {habis.map(r=>(
              <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--border)"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:12}}>{r.nama_produk}</div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>{r.kategori}</div>
                </div>
                <span className="badge b-red">Habis</span>
              </div>
            ))}
            {lowStock.map(r=>(
              <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--border)"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:12}}>{r.nama_produk}</div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>{r.kategori}</div>
                </div>
                <span className="badge b-yellow">{r.stok} unit</span>
              </div>
            ))}
            {lowStock.length===0 && habis.length===0 && <div style={{color:"#10b981",fontSize:13,fontWeight:700,marginTop:8}}>Semua stok mencukupi 👍</div>}
          </div>
        </div>
        <div className="kur-card" style={{padding:16}}>
          <div style={{fontWeight:700,marginBottom:12,color:"var(--text2)"}}>Nilai Stok Mengikut Kategori</div>
          {byKat.map(({kat,nilai})=>{
            const kc = KAT_COLORS[kat]||KAT_COLORS["Lain-lain"];
            return (
              <div key={kat} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span style={{fontWeight:700}}>{kat}</span><b style={{color:KP_ACCENT}}>{fmtRM(nilai)}</b>
                </div>
                <div style={{background:"var(--border)",borderRadius:4,height:8}}>
                  <div style={{width:`${(nilai/maxNilai)*100}%`,height:8,borderRadius:4,background:kc.col}}></div>
                </div>
              </div>
            );
          })}
        </div>
      </>)}

      {subtab===2 && (<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
          {[
            {ico:"💰",label:"Jumlah Nilai Stok",val:fmtRM(totalNilai),col:KP_ACCENT},
            {ico:"📦",label:"Jumlah Unit",val:totalStok,col:"#2563eb"},
            {ico:"🏪",label:"Jenis Produk",val:data.length,col:"#059669"},
          ].map(c=>(
            <div key={c.label} style={{background:c.col+"10",border:`1.5px solid ${c.col}30`,borderRadius:12,padding:"14px 12px",textAlign:"center"}}>
              <div style={{fontSize:22}}>{c.ico}</div>
              <div style={{fontWeight:900,fontSize:20,color:c.col,marginTop:4}}>{c.val}</div>
              <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{c.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div className="kur-card" style={{padding:16}}>
            <div style={{fontWeight:700,marginBottom:12,color:"var(--text2)"}}>Nilai Mengikut Kategori</div>
            <table className="kur-table" style={{fontSize:12}}>
              <thead><tr><th>Kategori</th><th>Produk</th><th>Unit</th><th>Nilai</th></tr></thead>
              <tbody>
                {byKat.map(({kat,count,stok,nilai})=>{
                  const kc = KAT_COLORS[kat]||KAT_COLORS["Lain-lain"];
                  return (
                    <tr key={kat}>
                      <td><span style={{background:kc.bg,color:kc.col,borderRadius:6,padding:"1px 7px",fontSize:11,fontWeight:700}}>{kat}</span></td>
                      <td style={{textAlign:"center"}}>{count}</td>
                      <td style={{fontWeight:700,textAlign:"center"}}>{stok}</td>
                      <td style={{fontWeight:800,color:KP_ACCENT}}>{fmtRM(nilai)}</td>
                    </tr>
                  );
                })}
                <tr style={{borderTop:"2px solid var(--border)"}}>
                  <td style={{fontWeight:800}}>JUMLAH</td>
                  <td style={{fontWeight:800,textAlign:"center"}}>{data.length}</td>
                  <td style={{fontWeight:800,textAlign:"center"}}>{totalStok}</td>
                  <td style={{fontWeight:900,color:KP_ACCENT}}>{fmtRM(totalNilai)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="kur-card" style={{padding:16}}>
            <div style={{fontWeight:700,marginBottom:12,color:"var(--text2)"}}>🏆 Top 5 Produk Bernilai Tinggi</div>
            {top5.map((r,i)=>{
              const nilai = (r.stok||0)*(r.harga||0);
              const kc = KAT_COLORS[r.kategori]||KAT_COLORS["Lain-lain"];
              return (
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:KP_ACCENT,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.nama_produk}</div>
                    <div style={{fontSize:10,color:kc.col,fontWeight:700}}>{r.kategori} · {r.stok} unit</div>
                  </div>
                  <div style={{fontWeight:800,fontSize:12,color:KP_ACCENT,flexShrink:0}}>{fmtRM(nilai)}</div>
                </div>
              );
            })}
            {top5.length===0 && <div style={{color:"var(--text3)",fontSize:13}}>Tiada data</div>}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["Tersedia","b-green",data.filter(r=>r.stok>=10).length,"#10b981"],["Sedikit (< 10)","b-yellow",lowStock.length,"#d97706"],["Habis","b-red",habis.length,"#dc2626"]].map(([s,b,c,col])=>(
            <div key={s} style={{textAlign:"center",padding:"12px 8px",background:col+"10",border:`1.5px solid ${col}30`,borderRadius:10}}>
              <div style={{fontWeight:900,fontSize:24,color:col}}>{c}</div>
              <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{s}</div>
            </div>
          ))}
        </div>
      </>)}

      {showAdd && (
        <Modal title="Tambah Produk Koperasi" onClose={()=>setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div className="form-field"><label className="form-label">Nama Produk *</label>
              <input className="form-input" required value={form.nama_produk} placeholder="cth: Buku Tulis A4"
                onChange={e=>setForm(f=>({...f,nama_produk:e.target.value}))}/>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kategori</label>
                <select className="form-input" value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value}))}>
                  {KAT_LIST.map(k=><option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  <option>Tersedia</option><option>Tidak Tersedia</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Stok (unit)</label>
                <input className="form-input" type="number" min="0" value={form.stok} onChange={e=>setForm(f=>({...f,stok:e.target.value}))}/>
              </div>
              <div className="form-field"><label className="form-label">Harga Seunit (RM)</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.harga} onChange={e=>setForm(f=>({...f,harga:e.target.value}))}/>
                {(form.stok>0&&form.harga>0) && <div style={{fontSize:10,color:KP_ACCENT,marginTop:4,fontWeight:700}}>Nilai: {fmtRM(form.stok*form.harga)}</div>}
              </div>
            </div>
            <button className="btn-primary" type="submit" style={{background:KP_ACCENT}}>+ Tambah Produk</button>
          </form>
        </Modal>
      )}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama_produk}`} onClose={()=>setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-field"><label className="form-label">Nama Produk</label>
              <input className="form-input" value={editItem.nama_produk} onChange={e=>setEditItem(f=>({...f,nama_produk:e.target.value}))}/>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kategori</label>
                <select className="form-input" value={editItem.kategori} onChange={e=>setEditItem(f=>({...f,kategori:e.target.value}))}>
                  {KAT_LIST.map(k=><option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-label">Status</label>
                <select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                  <option>Tersedia</option><option>Tidak Tersedia</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Stok (unit)</label>
                <input className="form-input" type="number" min="0" value={editItem.stok} onChange={e=>setEditItem(f=>({...f,stok:e.target.value}))}/>
              </div>
              <div className="form-field"><label className="form-label">Harga Seunit (RM)</label>
                <input className="form-input" type="number" min="0" step="0.01" value={editItem.harga} onChange={e=>setEditItem(f=>({...f,harga:e.target.value}))}/>
                {(editItem.stok>0&&editItem.harga>0) && <div style={{fontSize:10,color:KP_ACCENT,marginTop:4,fontWeight:700}}>Nilai: {fmtRM(editItem.stok*editItem.harga)}</div>}
              </div>
            </div>
            <button className="btn-primary" type="submit" style={{background:KP_ACCENT}}>💾 Simpan Perubahan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ─── HEM ROUTER ───────────────────────────────────────────────────────────────
function DriveFolderView({folderId,title,driveUrl}) {
  return(
    <div style={{borderRadius:12,overflow:'hidden',border:'1.5px solid var(--border)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',background:'var(--card2)',borderBottom:'1px solid var(--border)'}}>
        <span style={{fontWeight:800,fontSize:14}}>📁 {title} — Google Drive</span>
        <a href={driveUrl} target="_blank" rel="noreferrer" style={{fontSize:12,color:'var(--accent)',fontWeight:700,textDecoration:'none'}}>Buka dalam Drive ↗</a>
      </div>
      <iframe src={`https://drive.google.com/embeddedfolderview?id=${folderId}&usp=sharing#list`} style={{width:'100%',height:'580px',border:'none',display:'block'}} title={title}/>
    </div>
  );
}

function DrivePanelInline({folderId, title}) {
  const [open,setOpen]=useState(false);
  if(!folderId) return null;
  return(
    <div style={{marginTop:28}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 18px',borderRadius:open?'10px 10px 0 0':10,border:'1.5px solid var(--border)',background:'var(--card2)',cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:"'Inter',sans-serif"}}>
        <span>📁 Fail Drive — {title}</span>
        <span style={{fontSize:12,color:'var(--text2)',fontWeight:600}}>{open?'▲ Tutup':'▼ Buka Fail'}</span>
      </button>
      {open&&(
        <div style={{border:'1.5px solid var(--border)',borderTop:'none',borderRadius:'0 0 10px 10px',overflow:'hidden'}}>
          <iframe src={`https://drive.google.com/embeddedfolderview?id=${folderId}&usp=sharing#list`} style={{width:'100%',height:'450px',border:'none',display:'block'}} title={title}/>
          <div style={{padding:'8px 16px',background:'var(--card2)',borderTop:'1px solid var(--border)',textAlign:'right'}}>
            <a href={`https://drive.google.com/drive/folders/${folderId}`} target="_blank" rel="noreferrer" style={{fontSize:12,color:'var(--accent)',fontWeight:700,textDecoration:'none'}}>Buka dalam Drive ↗</a>
          </div>
        </div>
      )}
    </div>
  );
}

function HEMPage({ subId, onNav }) {
  const m = MODULES.find(x => x.id === "hem");
  const idx = m?.ids.indexOf(subId) ?? -1;
  const sName = idx >= 0 ? m.subs[idx] : "";

  const HEM_DRIVE = {
    apdm:      { id:"15U3dHSxAis1unvw6PI27H0EpSqa8HprV", title:"Pendaftaran & Data Murid" },
    disiplin:  { id:"1p8E4yEQY2gBKdxgz78JBwvsGECje9YfV", title:"Disiplin" },
    kaunseling:{ id:"1fo_ZYOxHKLznK5tsiCQ93EdFf6uEHMh8", title:"Bimbingan & Kaunseling" },
    kesihatan: { id:"1Q6Q3YHQ0d8l2y07PPQ9G1FEtAmEUcT0-", title:"Kesihatan Murid" },
    bantuan:   { id:"11sxDYUKrH28F3L2v9ugwSFuh19Kax6SU", title:"Bantuan Pelajaran" },
    "3k":      { id:"1J2Lnakm5PGnGMHj2jC6iqeRnazhpbmiX", title:"Keselamatan & 3K" },
    pengawas:  { id:"1EVx6xidDAe6RPZ59gjYs1I1YyaQ-UppJ", title:"Pengawas Sekolah" },
    koperasi:  { id:"1MmS81hGV-b_uQuj2qZMHe7-P3dvoVY40", title:"Koperasi" },
  };

  const views = {
    apdm:      <HemMurid />,
    disiplin:  <HemDisiplin />,
    kaunseling:<HemKaunseling />,
    kesihatan: <HemKesihatan />,
    bantuan:   <HemBantuan />,
    "3k":      <Hem3K />,
    pengawas:  <HemPengawas />,
    koperasi:  <HemKoperasi />,
    drive:     <DriveFolderView folderId="1f6LkG3TTJPgWwAOw52KR_4tiJl7UfW2J" title="eHEM (Semua Fail)" driveUrl="https://drive.google.com/drive/folders/1f6LkG3TTJPgWwAOw52KR_4tiJl7UfW2J?usp=drive_link"/>,
  };

  return (
    <div>
      <div className="pg-top" style={{marginBottom:14}}>
        <div className="pg-chip" style={{color:"#0077b6",borderColor:"#bfdbfe"}}
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
              fontFamily:"'Inter',sans-serif",
              cursor:"pointer", transition:"all 0.15s",
            }}>
            {s}
          </button>
        ))}
      </div>

      {views[subId] || <div style={{color:"var(--text2)",padding:40,textAlign:"center"}}>Pilih sub-modul</div>}
      {HEM_DRIVE[subId] && <DrivePanelInline folderId={HEM_DRIVE[subId].id} title={HEM_DRIVE[subId].title}/>}
    </div>
  );
}

// ─── KURIKULUM ROUTER ─────────────────────────────────────────────────────────
function KurikulumPage({ subId, onNav }) {
  const m = MODULES.find(x=>x.id==="kurikulum");
  const idx = m?.ids.indexOf(subId)??-1;
  const sName = idx>=0 ? m.subs[idx] : "";

  const KURI_DRIVE={
    jadual:      {id:'1lG9qzqqsrSiWyNDTl8W4BOfDIlfM512G', title:'Jadual Waktu'},
    panitia:     {id:'1W0Pp7ltSrZBJAPalmCelqpfAkQCP3eq2', title:'Panitia Mata Pelajaran'},
    peperiksaan: {id:'1pX2fNNQVRZEU-QlxrPFxCxSPxma9vU_x', title:'Peperiksaan & Penilaian'},
    rph:         {id:'1KjyvY-C14uWHR3LQwOZYcgNGZ7a9hsSx', title:'eRPH / Rekod Mengajar'},
    program:     {id:'1yShIibPJ_s2Jk7pgC3kBfLMl3_C_obFW', title:'Program Akademik'},
    pss:         {id:'1nZmMOMkPnGwgW6tajq5jJJ5RgIaGPypy', title:'Pusat Sumber / NILAM'},
    staf:        {id:'1ZgM5TAkFNoQMVybLOaEBU-lUl5Z13Y05', title:'Perkembangan Staf'},
  };
  const views = {
    jadual:      <JadualWaktu />,
    panitia:     <PanitiaMP />,
    peperiksaan: <Peperiksaan />,
    rph:         <RPHRekod />,
    program:     <ProgramAkademik />,
    pss:         <PusatSumber />,
    staf:        <PerkembanganStaf />,
    drive:       <DriveFolderView folderId="1KHz86mCyZEpISrkoZIlgZ9D2S6_PClUv" title="eKurikulum" driveUrl="https://drive.google.com/drive/folders/1KHz86mCyZEpISrkoZIlgZ9D2S6_PClUv?usp=drive_link"/>,
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
              fontFamily:"'Inter',sans-serif",
              cursor:"pointer", transition:"all 0.15s",
              backdropFilter:"blur(12px)",
            }}>
            {s}
          </button>
        ))}
      </div>

      {views[subId] || <div style={{color:"var(--text2)",padding:40,textAlign:"center"}}>Pilih sub-modul</div>}
      {KURI_DRIVE[subId]&&<DrivePanelInline folderId={KURI_DRIVE[subId].id} title={KURI_DRIVE[subId].title}/>}
    </div>
  );
}

// ─── KOKURIKULUM — SHARED DATA ───────────────────────────────────────────────
const GURU_KOKU = [
  "Cikgu Rosnah Bt Ali","Cikgu Hafiz Bin Salleh","Cikgu Laila Bt Hamid",
  "Cikgu Azman Bin Yusof","Cikgu Nora Bt Jamil","Cikgu Farid Bin Hassan",
  "Cikgu Azhar Bin Daud","Cikgu Nordin Bin Musa","Cikgu Aminah Bt Rahmat",
  "Cikgu Rajan A/L Kumar","Cikgu Priya A/P Rajan","Pn. Halimah Bt Mohd",
];

const TAHUN_LIST = ["Tahun 1","Tahun 2","Tahun 3","Tahun 4","Tahun 5","Tahun 6"];

function gradeOPR(total) {
  if (total >= 25) return "A";
  if (total >= 19) return "B";
  if (total >= 13) return "C";
  if (total >= 7)  return "D";
  return "E";
}

// ─── KOKURIKULUM — SUB-PAGES ─────────────────────────────────────────────────
function printOPR(rows, kelas) {
  const now = new Date();
  const tarikhCetak = now.toLocaleDateString('ms-MY',{day:'2-digit',month:'long',year:'numeric'});
  const masaCetak = now.toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'});
  const w = window.open('','_blank','width=1000,height=750');
  w.document.write(`<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8">
<title>Laporan OPR Kokurikulum - SK Darau</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:28px;font-size:12px;color:#000}
.hdr{text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:14px}
.hdr h2{font-size:15px;font-weight:bold;text-transform:uppercase}.hdr h3{font-size:13px;font-weight:normal}
.meta{display:flex;justify-content:space-between;margin-bottom:12px;font-size:11px}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:5px 6px;text-align:center;font-size:11px}
th{background:#ddd;font-weight:bold}td.name{text-align:left}
.gA{color:#16a34a;font-weight:bold}.gB{color:#2563eb;font-weight:bold}.gC{color:#d97706;font-weight:bold}.gD{color:#dc2626;font-weight:bold}.gE{color:#7f1d1d;font-weight:bold}
.footer{margin-top:32px;display:flex;justify-content:space-between}
.sbox{text-align:center}.sline{border-top:1px solid #000;width:200px;margin:38px auto 4px}
@media print{button{display:none!important}}</style></head><body>
<div class="hdr"><h2>Laporan Penilaian Kokurikulum (OPR)</h2><h3>SK Darau, Kota Kinabalu, Sabah</h3><p style="margin-top:5px;font-size:11px">Tahun Pelajaran 2025</p></div>
<div class="meta"><span><b>Kelas:</b> ${kelas||'Semua Kelas'}</span><span><b>Tarikh:</b> ${tarikhCetak} &nbsp;|&nbsp; <b>Masa:</b> ${masaCetak}</span><span><b>Jumlah Murid:</b> ${rows.length}</span></div>
<table><thead>
<tr><th rowspan="2">Bil.</th><th rowspan="2">Nama Murid</th><th rowspan="2">Kelas</th>
<th colspan="2">Kelab/Persatuan (A)</th><th colspan="2">Badan Beruniform (B)</th><th colspan="2">Sukan/Permainan (C)</th>
<th rowspan="2">Jumlah<br/>(30)</th><th rowspan="2">Gred</th><th rowspan="2">Catatan</th></tr>
<tr><th>Nama</th><th>Markah</th><th>Nama</th><th>Markah</th><th>Nama</th><th>Markah</th></tr>
</thead><tbody>
${rows.map((r,i)=>`<tr><td>${i+1}</td><td class="name">${r.nama}</td><td>${r.kelas}</td>
<td class="name" style="font-size:10px">${r.kelab}</td><td>${r.mKelab}</td>
<td class="name" style="font-size:10px">${r.uniform}</td><td>${r.mUniform}</td>
<td class="name" style="font-size:10px">${r.sukan}</td><td>${r.mSukan}</td>
<td style="font-weight:bold">${r.jumlah}</td><td class="g${r.gred}">${r.gred}</td>
<td style="font-size:10px">${r.catatan||'—'}</td></tr>`).join('')}
</tbody></table>
<div class="footer">
<div class="sbox"><div class="sline"></div><div>Disediakan Oleh</div><div style="font-size:10px;margin-top:3px">(GPK Kokurikulum)</div></div>
<div class="sbox"><div class="sline"></div><div>Disahkan Oleh</div><div style="font-size:10px;margin-top:3px">(Guru Besar)</div></div>
</div>
<p style="text-align:center;margin-top:18px;font-size:10px;color:#666">Jana oleh Sistem EduDashboard SK Darau &nbsp;|&nbsp; ${tarikhCetak} ${masaCetak}</p>
<div style="text-align:center;margin-top:14px"><button onclick="window.print()" style="padding:8px 24px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer">🖨️ Cetak / Simpan PDF</button></div>
</body></html>`);
  w.document.close(); w.focus();
}

// ── Kelab PAJSK helpers ──────────────────────────────────────────────────────
const JWTN_KELAB = ['Pengerusi','Naib Pengerusi','Setiausaha','Bendahari','AJK','Ahli Aktif','Ahli Biasa'];
const JWTN_KELAB_MK = {'Pengerusi':10,'Naib Pengerusi':8,'Setiausaha':7,'Bendahari':7,'AJK':6,'Ahli Aktif':4,'Ahli Biasa':1};
const PRGKT_MK = {'Antarabangsa':20,'Kebangsaan':18,'Negeri':15,'Daerah':12,'Zon':10,'Sekolah':8,'Tiada':0};
const PENCPN_MK = {
  'Johan (Kebangsaan/Antbgs)':20,'Naib Johan (Kebangsaan/Antbgs)':18,
  'Johan (Negeri)':16,'Naib Johan (Negeri)':14,
  'Johan (Daerah/Zon)':12,'Naib Johan (Daerah/Zon)':10,
  'Tempat 3 (Daerah/Zon)':8,'Penyertaan (Daerah ke atas)':5,
  'Pencapaian Sekolah':3,'Tiada':0,
};
const KMTMN_MK = {1:3,2:5,3:8,4:10};
const KHDMT_MK = {'Penganjur Utama':10,'AJK Penganjur':8,'Peserta Aktif':6,'Peserta':4,'Ahli Biasa':2};
const KELAB_KATEGORI = ['Akademik','Bahasa','Sains & Matematik','Kebudayaan','Hobi','Agama','Kemasyarakatan'];

function gradeKelabPAJSK(t){if(t>=88)return'A';if(t>=66)return'B';if(t>=44)return'C';if(t>=22)return'D';return'E';}
function computePAJSKKelab(r){
  const mJ=JWTN_KELAB_MK[r.jawatan]??1;
  const mK=r.kehadiran_total>0?Math.round(r.kehadiran_hadir/r.kehadiran_total*40):0;
  const mP=PRGKT_MK[r.peringkat]??0;
  const mC=PENCPN_MK[r.pencapaian]??0;
  const mKo=KMTMN_MK[r.komitmen]??5;
  const mKh=KHDMT_MK[r.khidmat]??2;
  const total=mJ+mK+mP+mC+mKo+mKh;
  return{mJ,mK,mP,mC,mKo,mKh,total,gred:gradeKelabPAJSK(total)};
}

function KelabPersatuan() {
  const [subtab, setSubtab]             = useState(0);
  const [kelab, setKelab]               = useState([]);
  const [ahli, setAhli]                 = useState([]);
  const [perjumpaan, setPerjumpaan]     = useState([]);
  const [pajsk, setPajsk]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedId, setSelectedId]     = useState(null);
  const [q, setQ]                       = useState('');
  const [filterJenis, setFilterJenis]   = useState('');
  const [showAddKelab, setShowAddKelab] = useState(false);
  const [editKelab, setEditKelab]       = useState(null);
  const [showAddAhli, setShowAddAhli]   = useState(false);
  const [editAhli, setEditAhli]         = useState(null);
  const [showAddPjp, setShowAddPjp]     = useState(false);
  const [editPjp, setEditPjp]           = useState(null);
  const [editPajsk, setEditPajsk]       = useState(null);

  const tahunNow = new Date().getFullYear().toString();
  const blankKelab = {nama:'',jenis:'Kelab',kategori:'Akademik',guru_penasihat:GURU_KOKU[0],guru_penasihat_2:'',guru_penasihat_3:'',hari:'Rabu',masa:'2:00 PM',lokasi:'',tarikh_tubuh:'',min_sesi:12,tahun:tahunNow,status:'Aktif'};
  const blankAhli  = {no_daftar:'',nama_murid:'',kelas:'',jawatan:'Ahli Biasa',tarikh_sertai:'',status:'Aktif'};
  const blankPjp   = {tarikh:'',masa_mula:'2:00 PM',masa_tamat:'4:00 PM',tajuk:'',aktiviti:'',hadir_murid:0,guru_hadir:'',status:'Selesai',catatan:''};
  const blankPajsk = {jawatan:'Ahli Biasa',kehadiran_hadir:0,kehadiran_total:12,peringkat:'Sekolah',pencapaian:'Tiada',komitmen:2,khidmat:'Ahli Biasa'};

  const [formKelab, setFormKelab] = useState(blankKelab);
  const [formAhli,  setFormAhli]  = useState(blankAhli);
  const [formPjp,   setFormPjp]   = useState(blankPjp);

  const load = async () => {
    setLoading(true);
    const [k,a,p,pj] = await Promise.all([
      supabase.from('koku_kelab').select('*').neq('status','PADAM').order('nama'),
      supabase.from('koku_kelab_ahli').select('*').neq('status','PADAM').order('nama_murid'),
      supabase.from('koku_kelab_perjumpaan').select('*').neq('status','PADAM').order('tarikh',{ascending:false}),
      supabase.from('koku_kelab_pajsk').select('*').order('nama_murid'),
    ]);
    setKelab(k.data||[]); setAhli(a.data||[]);
    setPerjumpaan(p.data||[]); setPajsk(pj.data||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const selectedKelab = kelab.find(k=>k.id===selectedId);

  // ── KELAB CRUD
  const handleAddKelab = async e=>{
    e.preventDefault();
    const ok=await dbRun(()=>supabase.from('koku_kelab').insert([formKelab]));
    if(!ok)return;
    toast('Kelab ditambah!','success');setShowAddKelab(false);setFormKelab(blankKelab);load();
  };
  const handleEditKelab = async e=>{
    e.preventDefault();
    const{id,created_at,...rest}=editKelab;
    const ok=await dbRun(()=>supabase.from('koku_kelab').update(rest).eq('id',id));
    if(!ok)return;
    toast('Dikemaskini!','success');setEditKelab(null);load();
  };
  const handleDelKelab = async id=>{
    const ok=await dbRun(()=>supabase.from('koku_kelab').update({status:'PADAM'}).eq('id',id));
    if(ok){setKelab(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}
  };

  // ── AHLI CRUD
  const handleAddAhli = async e=>{
    e.preventDefault();
    const ok=await dbRun(()=>supabase.from('koku_kelab_ahli').insert([{...formAhli,kelab_id:selectedId,tahun:tahunNow}]));
    if(!ok)return;
    toast('Ahli ditambah!','success');setShowAddAhli(false);setFormAhli(blankAhli);load();
  };
  const handleEditAhli = async e=>{
    e.preventDefault();
    const{id,created_at,...rest}=editAhli;
    const ok=await dbRun(()=>supabase.from('koku_kelab_ahli').update(rest).eq('id',id));
    if(!ok)return;
    toast('Dikemaskini!','success');setEditAhli(null);load();
  };
  const handleDelAhli = async id=>{
    const ok=await dbRun(()=>supabase.from('koku_kelab_ahli').update({status:'PADAM'}).eq('id',id));
    if(ok){setAhli(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}
  };

  // ── PERJUMPAAN CRUD
  const handleAddPjp = async e=>{
    e.preventDefault();
    const ok=await dbRun(()=>supabase.from('koku_kelab_perjumpaan').insert([{...formPjp,kelab_id:selectedId}]));
    if(!ok)return;
    toast('Rekod ditambah!','success');setShowAddPjp(false);setFormPjp(blankPjp);load();
  };
  const handleEditPjp = async e=>{
    e.preventDefault();
    const{id,created_at,...rest}=editPjp;
    const ok=await dbRun(()=>supabase.from('koku_kelab_perjumpaan').update(rest).eq('id',id));
    if(!ok)return;
    toast('Dikemaskini!','success');setEditPjp(null);load();
  };
  const handleDelPjp = async id=>{
    const ok=await dbRun(()=>supabase.from('koku_kelab_perjumpaan').update({status:'PADAM'}).eq('id',id));
    if(ok){setPerjumpaan(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}
  };

  // ── PAJSK upsert
  const handleSavePajsk = async e=>{
    e.preventDefault();
    const exists=pajsk.find(p=>p.ahli_id===editPajsk.ahli_id&&p.kelab_id===selectedId);
    const payload={...editPajsk,kelab_id:selectedId};
    let ok;
    if(exists){
      const{ahli_id,kelab_id,nama_murid,kelas,...upd}=payload;
      ok=await dbRun(()=>supabase.from('koku_kelab_pajsk').update(upd).eq('id',exists.id));
    } else {
      ok=await dbRun(()=>supabase.from('koku_kelab_pajsk').insert([payload]));
    }
    if(!ok)return;
    toast('Markah disimpan!','success');setEditPajsk(null);load();
  };

  // ── COMPUTED
  const ahliByKelab   = id=>ahli.filter(a=>a.kelab_id===id);
  const pjpByKelab    = id=>perjumpaan.filter(p=>p.kelab_id===id);
  const pajskByKelab  = id=>pajsk.filter(p=>p.kelab_id===id);
  const filteredKelab = kelab.filter(k=>
    (!filterJenis||k.jenis===filterJenis)&&
    (!q||k.nama.toLowerCase().includes(q.toLowerCase())||
      (k.guru_penasihat||'').toLowerCase().includes(q.toLowerCase()))
  );

  const tabStyle=i=>({
    padding:'7px 14px',borderRadius:9,fontWeight:900,fontSize:12,cursor:'pointer',
    border:'2.5px solid',fontFamily:"'Inter',sans-serif",
    background:subtab===i?'var(--accent)':'var(--surface)',
    borderColor:subtab===i?'var(--accent)':'var(--border)',
    color:subtab===i?'#fff':'var(--text)',transition:'all 0.15s',
  });

  // Kelab selector pill (tabs 1-3)
  function KelabPill(){
    return(
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14,padding:'10px 12px',background:'var(--surface)',border:'2px solid var(--border)',borderRadius:12}}>
        <span style={{fontSize:11,fontWeight:900,color:'var(--text3)',alignSelf:'center',marginRight:4}}>KELAB:</span>
        {kelab.map(k=>{
          const cnt=ahliByKelab(k.id).length;
          const active=selectedId===k.id;
          return(
            <button key={k.id} onClick={()=>setSelectedId(k.id)} style={{
              padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:800,
              border:'2px solid',cursor:'pointer',fontFamily:"'Inter',sans-serif",transition:'all 0.12s',
              background:active?'var(--accent)':'var(--surface)',
              borderColor:active?'var(--accent)':'var(--border)',
              color:active?'#fff':'var(--text)',
            }}>{k.nama} <span style={{opacity:0.7,fontSize:10}}>({cnt})</span></button>
          );
        })}
        {kelab.length===0&&<span style={{fontSize:12,color:'var(--text3)'}}>Tiada kelab. Tambah dalam tab Senarai.</span>}
      </div>
    );
  }

  function NoSelection(){
    return <div style={{textAlign:'center',padding:48,color:'var(--text3)',fontWeight:800,fontSize:14}}>
      👆 Pilih kelab di atas untuk lihat rekod
    </div>;
  }

  const sesiSelesai=id=>pjpByKelab(id).filter(p=>p.status==='Selesai').length;
  const minSesi=selectedKelab?.min_sesi||12;

  const statsCards=[
    {ico:'🏛️',val:kelab.filter(k=>k.jenis==='Kelab').length,lbl:'Kelab'},
    {ico:'📋',val:kelab.filter(k=>k.jenis==='Persatuan').length,lbl:'Persatuan'},
    {ico:'✅',val:kelab.filter(k=>k.status==='Aktif').length,lbl:'Aktif'},
    {ico:'👥',val:ahli.length,lbl:'Jumlah Ahli'},
  ];

  return(
    <KurPage title="Kelab & Persatuan" sub="Kokurikulum · SK Darau" stats={statsCards}>
      {/* tab strip */}
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
        {['🏛️ Senarai Kelab','👥 Ahli','📅 Rekod Perjumpaan','📊 Penilaian PAJSK'].map((t,i)=>(
          <button key={i} style={tabStyle(i)} onClick={()=>setSubtab(i)}>{t}</button>
        ))}
      </div>

      {loading?<div className="loading">⏳ Memuatkan…</div>:(<>

        {/* ── SUB-TAB 0: SENARAI KELAB */}
        {subtab===0&&(
          <div>
            <div className="kur-header" style={{flexWrap:'wrap',gap:8}}>
              <button className="btn-add" onClick={()=>{setFormKelab(blankKelab);setShowAddKelab(true);}}>+ Tambah Kelab</button>
              <div className="kur-search-wrap" style={{flex:1,minWidth:160}}>
                <span className="kur-search-ico">🔍</span>
                <input className="kur-search" placeholder="Cari nama / guru…" value={q} onChange={e=>setQ(e.target.value)}/>
              </div>
              <select className="kur-select" value={filterJenis} onChange={e=>setFilterJenis(e.target.value)}>
                <option value="">Semua Jenis</option><option>Kelab</option><option>Persatuan</option>
              </select>
            </div>
            <div className="kur-table-wrap">
              <table className="kur-table">
                <thead><tr><th>#</th><th>Nama</th><th>Jenis</th><th>Kategori</th><th>Guru Penasihat</th><th>Hari/Masa</th><th>Ahli</th><th>Sesi</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {filteredKelab.length===0&&<tr><td colSpan={10} style={{textAlign:'center',color:'var(--text3)',padding:28}}>Tiada kelab/persatuan.</td></tr>}
                  {filteredKelab.map((k,i)=>{
                    const cnt=ahliByKelab(k.id).length;
                    const sesi=sesiSelesai(k.id);
                    return(
                      <tr key={k.id} style={{cursor:'pointer'}} onClick={()=>{setSelectedId(k.id);setSubtab(1);}}>
                        <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                        <td style={{fontWeight:800,color:'var(--accent)'}}>{k.nama}</td>
                        <td><span className={`badge ${k.jenis==='Kelab'?'b-blue':'b-green'}`}>{k.jenis}</span></td>
                        <td style={{fontSize:12}}>{k.kategori}</td>
                        <td style={{fontSize:12}}>{k.guru_penasihat}</td>
                        <td style={{fontSize:12,color:'var(--text3)'}}>{k.hari} {k.masa}</td>
                        <td style={{fontWeight:800}}>{cnt}</td>
                        <td>
                          <span style={{fontSize:12,fontWeight:800,color:sesi>=k.min_sesi?'#16a34a':'#dc2626'}}>
                            {sesi}/{k.min_sesi}
                          </span>
                        </td>
                        <td><span className={`badge ${k.status==='Aktif'?'b-green':'b-gray'}`}>{k.status}</span></td>
                        <td style={{display:'flex',gap:4}} onClick={e=>e.stopPropagation()}>
                          <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditKelab({...k})}>✏️</button>
                          <button className="btn-del" onClick={()=>handleDelKelab(k.id)}>🗑</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SUB-TAB 1: AHLI */}
        {subtab===1&&(
          <div>
            <KelabPill/>
            {!selectedId?<NoSelection/>:(
              <>
                <div className="kur-header" style={{gap:8,marginBottom:10}}>
                  <button className="btn-add" onClick={()=>{setFormAhli(blankAhli);setShowAddAhli(true);}}>+ Tambah Ahli</button>
                  <span style={{fontSize:12,color:'var(--text3)',fontWeight:800,padding:'6px 0'}}>
                    {ahliByKelab(selectedId).length} ahli — {selectedKelab?.nama}
                  </span>
                </div>
                <div className="kur-table-wrap">
                  <table className="kur-table">
                    <thead><tr><th>#</th><th>No. Daftar</th><th>Nama Murid</th><th>Kelas</th><th>Jawatan</th><th>Tarikh Sertai</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {ahliByKelab(selectedId).length===0&&<tr><td colSpan={8} style={{textAlign:'center',color:'var(--text3)',padding:28}}>Tiada ahli. Tambah ahli untuk kelab ini.</td></tr>}
                      {ahliByKelab(selectedId).map((a,i)=>(
                        <tr key={a.id}>
                          <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                          <td style={{fontFamily:'monospace',fontSize:12}}>{a.no_daftar||'—'}</td>
                          <td style={{fontWeight:800}}>{a.nama_murid}</td>
                          <td style={{fontSize:12,color:'var(--text3)'}}>{a.kelas}</td>
                          <td><span className={`badge ${a.jawatan==='Pengerusi'?'b-red':a.jawatan==='Naib Pengerusi'?'b-yellow':a.jawatan==='AJK'?'b-blue':'b-gray'}`}>{a.jawatan}</span></td>
                          <td style={{fontSize:12,color:'var(--text3)'}}>{a.tarikh_sertai||'—'}</td>
                          <td><span className={`badge ${a.status==='Aktif'?'b-green':'b-gray'}`}>{a.status}</span></td>
                          <td style={{display:'flex',gap:4}}>
                            <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditAhli({...a})}>✏️</button>
                            <button className="btn-del" onClick={()=>handleDelAhli(a.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SUB-TAB 2: PERJUMPAAN */}
        {subtab===2&&(
          <div>
            <KelabPill/>
            {!selectedId?<NoSelection/>:(
              <>
                <div className="kur-header" style={{gap:8,marginBottom:10,flexWrap:'wrap'}}>
                  <button className="btn-add" onClick={()=>{setFormPjp(blankPjp);setShowAddPjp(true);}}>+ Tambah Perjumpaan</button>
                  <div style={{
                    padding:'6px 14px',borderRadius:10,fontSize:12,fontWeight:900,
                    background:sesiSelesai(selectedId)>=minSesi?'#f0fdf4':'#fef2f2',
                    border:`2px solid ${sesiSelesai(selectedId)>=minSesi?'#86efac':'#fca5a5'}`,
                    color:sesiSelesai(selectedId)>=minSesi?'#15803d':'#dc2626',
                  }}>
                    {sesiSelesai(selectedId)}/{minSesi} sesi {sesiSelesai(selectedId)>=minSesi?'✅ Cukup':'⚠️ Perlu tambah'}
                  </div>
                </div>
                <div className="kur-table-wrap">
                  <table className="kur-table">
                    <thead><tr><th>#</th><th>Tarikh</th><th>Masa</th><th>Tajuk</th><th>Aktiviti</th><th>Hadir</th><th>Guru Hadir</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {pjpByKelab(selectedId).length===0&&<tr><td colSpan={9} style={{textAlign:'center',color:'var(--text3)',padding:28}}>Tiada rekod perjumpaan.</td></tr>}
                      {pjpByKelab(selectedId).map((p,i)=>(
                        <tr key={p.id}>
                          <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                          <td style={{fontWeight:800,fontSize:12}}>{p.tarikh||'—'}</td>
                          <td style={{fontSize:11,color:'var(--text3)'}}>{p.masa_mula}–{p.masa_tamat}</td>
                          <td style={{fontWeight:700}}>{p.tajuk||'—'}</td>
                          <td style={{fontSize:12,color:'var(--text3)',maxWidth:180}}>{p.aktiviti||'—'}</td>
                          <td style={{fontWeight:800}}>{p.hadir_murid}</td>
                          <td style={{fontSize:12}}>{p.guru_hadir||'—'}</td>
                          <td><span className={`badge ${p.status==='Selesai'?'b-green':'b-yellow'}`}>{p.status}</span></td>
                          <td style={{display:'flex',gap:4}}>
                            <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditPjp({...p})}>✏️</button>
                            <button className="btn-del" onClick={()=>handleDelPjp(p.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SUB-TAB 3: PENILAIAN PAJSK */}
        {subtab===3&&(
          <div>
            <KelabPill/>
            {!selectedId?<NoSelection/>:(
              <>
                <div style={{fontSize:11,color:'var(--text3)',fontWeight:700,marginBottom:10}}>
                  💡 Markah PAJSK per ahli untuk <strong>{selectedKelab?.nama}</strong>. Klik ✏️ untuk isi/kemaskini markah.
                </div>
                <div className="kur-table-wrap">
                  <table className="kur-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Nama Murid</th><th>Kelas</th><th>Jawatan</th>
                        <th>Kehadiran</th><th>Peringkat</th><th>Pencapaian</th>
                        <th>Komitmen</th><th>Khidmat</th><th>Jumlah</th><th>Gred</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ahliByKelab(selectedId).length===0&&(
                        <tr><td colSpan={12} style={{textAlign:'center',color:'var(--text3)',padding:28}}>Tiada ahli. Tambah ahli dalam tab Ahli dahulu.</td></tr>
                      )}
                      {ahliByKelab(selectedId).map((a,i)=>{
                        const rec=pajsk.find(p=>p.ahli_id===a.id&&p.kelab_id===selectedId);
                        const r=rec?computePAJSKKelab(rec):null;
                        return(
                          <tr key={a.id}>
                            <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                            <td style={{fontWeight:800}}>{a.nama_murid}</td>
                            <td style={{fontSize:12,color:'var(--text3)'}}>{a.kelas}</td>
                            <td><span className="badge b-blue" style={{fontSize:10}}>{rec?.jawatan||a.jawatan}</span></td>
                            {r?(
                              <>
                                <td style={{fontSize:12}}>{rec.kehadiran_hadir}/{rec.kehadiran_total} <span style={{color:'var(--text3)'}}>({r.mK}mk)</span></td>
                                <td style={{fontSize:11}}>{rec.peringkat} <span style={{color:'var(--text3)'}}>({r.mP})</span></td>
                                <td style={{fontSize:11}}>{rec.pencapaian?.split('(')[0]} <span style={{color:'var(--text3)'}}>({r.mC})</span></td>
                                <td style={{fontSize:12}}>{rec.komitmen}/4 <span style={{color:'var(--text3)'}}>({r.mKo})</span></td>
                                <td style={{fontSize:11}}>{rec.khidmat} <span style={{color:'var(--text3)'}}>({r.mKh})</span></td>
                                <td style={{fontWeight:900,fontSize:15}}>{r.total}<span style={{fontSize:10,color:'var(--text3)'}}>/110</span></td>
                                <td><span className={`badge ${GRED_COLOR[r.gred]||'b-gray'}`}>{r.gred}</span></td>
                              </>
                            ):(
                              <td colSpan={7} style={{color:'var(--text3)',fontSize:12,fontStyle:'italic'}}>Belum diisi markah</td>
                            )}
                            <td>
                              <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditPajsk({
                                ahli_id:a.id, no_daftar:a.no_daftar, nama_murid:a.nama_murid, kelas:a.kelas,
                                ...(rec||{jawatan:a.jawatan,kehadiran_hadir:0,kehadiran_total:minSesi,peringkat:'Sekolah',pencapaian:'Tiada',komitmen:2,khidmat:'Ahli Biasa'}),
                              })}>✏️</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </>)}

      {/* ── MODAL: TAMBAH/EDIT KELAB */}
      {(showAddKelab||editKelab)&&(
        <Modal title={editKelab?`Edit — ${editKelab.nama}`:'Tambah Kelab / Persatuan'} onClose={()=>{setShowAddKelab(false);setEditKelab(null);}}>
          <form onSubmit={editKelab?handleEditKelab:handleAddKelab}>
            {(()=>{const v=editKelab||formKelab;const s=editKelab?setEditKelab:setFormKelab;return(<>
              <div className="form-field"><label className="form-label">Nama *</label><input className="form-input" required value={v.nama} onChange={e=>s(f=>({...f,nama:e.target.value}))}/></div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Jenis</label>
                  <select className="form-input" value={v.jenis} onChange={e=>s(f=>({...f,jenis:e.target.value}))}>
                    <option>Kelab</option><option>Persatuan</option>
                  </select>
                </div>
                <div className="form-field"><label className="form-label">Kategori</label>
                  <select className="form-input" value={v.kategori} onChange={e=>s(f=>({...f,kategori:e.target.value}))}>
                    {KELAB_KATEGORI.map(k=><option key={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-field"><label className="form-label">Guru Penasihat 1</label>
                <select className="form-input" value={v.guru_penasihat} onChange={e=>s(f=>({...f,guru_penasihat:e.target.value}))}>
                  {GURU_KOKU.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Guru Penasihat 2</label>
                  <select className="form-input" value={v.guru_penasihat_2||''} onChange={e=>s(f=>({...f,guru_penasihat_2:e.target.value}))}>
                    <option value="">—</option>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-field"><label className="form-label">Guru Penasihat 3</label>
                  <select className="form-input" value={v.guru_penasihat_3||''} onChange={e=>s(f=>({...f,guru_penasihat_3:e.target.value}))}>
                    <option value="">—</option>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Hari Perjumpaan</label>
                  <select className="form-input" value={v.hari} onChange={e=>s(f=>({...f,hari:e.target.value}))}>
                    {['Isnin','Selasa','Rabu','Khamis','Jumaat'].map(h=><option key={h}>{h}</option>)}
                  </select>
                </div>
                <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={v.masa} onChange={e=>s(f=>({...f,masa:e.target.value}))}/></div>
              </div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" placeholder="Bilik / Padang" value={v.lokasi||''} onChange={e=>s(f=>({...f,lokasi:e.target.value}))}/></div>
                <div className="form-field"><label className="form-label">Tarikh Ditubuhkan</label><input className="form-input" placeholder="Jan 2020" value={v.tarikh_tubuh||''} onChange={e=>s(f=>({...f,tarikh_tubuh:e.target.value}))}/></div>
              </div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Min. Sesi / Tahun</label><input className="form-input" type="number" min="1" value={v.min_sesi||12} onChange={e=>s(f=>({...f,min_sesi:+e.target.value}))}/></div>
                <div className="form-field"><label className="form-label">Status</label>
                  <select className="form-input" value={v.status} onChange={e=>s(f=>({...f,status:e.target.value}))}>
                    <option>Aktif</option><option>Tidak Aktif</option>
                  </select>
                </div>
              </div>
            </>);})()}
            <button className="btn-primary" type="submit">{editKelab?'💾 Simpan':'+ Tambah'}</button>
          </form>
        </Modal>
      )}

      {/* ── MODAL: TAMBAH/EDIT AHLI */}
      {(showAddAhli||editAhli)&&(
        <Modal title={editAhli?`Edit — ${editAhli.nama_murid}`:'Tambah Ahli'} onClose={()=>{setShowAddAhli(false);setEditAhli(null);}}>
          <form onSubmit={editAhli?handleEditAhli:handleAddAhli}>
            {(()=>{const v=editAhli||formAhli;const s=editAhli?setEditAhli:setFormAhli;return(<>
              <div className="form-row">
                <div className="form-field"><label className="form-label">No. Daftar</label><input className="form-input" value={v.no_daftar||''} onChange={e=>s(f=>({...f,no_daftar:e.target.value}))}/></div>
                <div className="form-field"><label className="form-label">Nama Murid *</label><input className="form-input" required value={v.nama_murid||''} onChange={e=>s(f=>({...f,nama_murid:e.target.value}))}/></div>
              </div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Kelas</label>
                  <select className="form-input" value={v.kelas||''} onChange={e=>s(f=>({...f,kelas:e.target.value}))}>
                    <option value="">—</option>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}
                  </select>
                </div>
                <div className="form-field"><label className="form-label">Jawatan</label>
                  <select className="form-input" value={v.jawatan||'Ahli Biasa'} onChange={e=>s(f=>({...f,jawatan:e.target.value}))}>
                    {JWTN_KELAB.map(j=><option key={j}>{j}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Tarikh Sertai</label><input className="form-input" type="date" value={v.tarikh_sertai||''} onChange={e=>s(f=>({...f,tarikh_sertai:e.target.value}))}/></div>
                <div className="form-field"><label className="form-label">Status</label>
                  <select className="form-input" value={v.status||'Aktif'} onChange={e=>s(f=>({...f,status:e.target.value}))}>
                    <option>Aktif</option><option>Tidak Aktif</option>
                  </select>
                </div>
              </div>
            </>);})()}
            <button className="btn-primary" type="submit">{editAhli?'💾 Simpan':'+ Tambah Ahli'}</button>
          </form>
        </Modal>
      )}

      {/* ── MODAL: TAMBAH/EDIT PERJUMPAAN */}
      {(showAddPjp||editPjp)&&(
        <Modal title={editPjp?'Edit Rekod Perjumpaan':'Tambah Rekod Perjumpaan'} onClose={()=>{setShowAddPjp(false);setEditPjp(null);}}>
          <form onSubmit={editPjp?handleEditPjp:handleAddPjp}>
            {(()=>{const v=editPjp||formPjp;const s=editPjp?setEditPjp:setFormPjp;return(<>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Tarikh *</label><input className="form-input" type="date" required value={v.tarikh||''} onChange={e=>s(f=>({...f,tarikh:e.target.value}))}/></div>
                <div className="form-field"><label className="form-label">Guru Hadir</label>
                  <select className="form-input" value={v.guru_hadir||''} onChange={e=>s(f=>({...f,guru_hadir:e.target.value}))}>
                    <option value="">—</option>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Masa Mula</label><input className="form-input" value={v.masa_mula||''} onChange={e=>s(f=>({...f,masa_mula:e.target.value}))}/></div>
                <div className="form-field"><label className="form-label">Masa Tamat</label><input className="form-input" value={v.masa_tamat||''} onChange={e=>s(f=>({...f,masa_tamat:e.target.value}))}/></div>
              </div>
              <div className="form-field"><label className="form-label">Tajuk Aktiviti *</label><input className="form-input" required value={v.tajuk||''} onChange={e=>s(f=>({...f,tajuk:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Huraian Aktiviti</label><input className="form-input" value={v.aktiviti||''} onChange={e=>s(f=>({...f,aktiviti:e.target.value}))}/></div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Bil. Murid Hadir</label><input className="form-input" type="number" min="0" value={v.hadir_murid||0} onChange={e=>s(f=>({...f,hadir_murid:+e.target.value}))}/></div>
                <div className="form-field"><label className="form-label">Status</label>
                  <select className="form-input" value={v.status||'Selesai'} onChange={e=>s(f=>({...f,status:e.target.value}))}>
                    <option>Selesai</option><option>Ditangguh</option><option>Batal</option>
                  </select>
                </div>
              </div>
              <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={v.catatan||''} onChange={e=>s(f=>({...f,catatan:e.target.value}))}/></div>
            </>);})()}
            <button className="btn-primary" type="submit">{editPjp?'💾 Simpan':'+ Tambah Rekod'}</button>
          </form>
        </Modal>
      )}

      {/* ── MODAL: PENILAIAN PAJSK */}
      {editPajsk&&(
        <Modal title={`Markah PAJSK — ${editPajsk.nama_murid}`} onClose={()=>setEditPajsk(null)}>
          <form onSubmit={handleSavePajsk}>
            <div style={{background:'var(--accent-lt)',borderRadius:10,padding:'10px 12px',marginBottom:12}}>
              <div style={{fontWeight:900,fontSize:11,color:'var(--accent)',marginBottom:8}}>📌 PENGLIBATAN (50 markah)</div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Jawatan</label>
                  <select className="form-input" value={editPajsk.jawatan||'Ahli Biasa'} onChange={e=>setEditPajsk(f=>({...f,jawatan:e.target.value}))}>
                    {JWTN_KELAB.map(j=><option key={j}>{j} ({JWTN_KELAB_MK[j]} mk)</option>)}
                  </select>
                </div>
                <div className="form-field"><label className="form-label">Komitmen (1-4)</label>
                  <select className="form-input" value={editPajsk.komitmen||2} onChange={e=>setEditPajsk(f=>({...f,komitmen:+e.target.value}))}>
                    {[1,2,3,4].map(v=><option key={v} value={v}>{v} ({KMTMN_MK[v]} mk)</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Peringkat Penyertaan</label>
                  <select className="form-input" value={editPajsk.peringkat||'Sekolah'} onChange={e=>setEditPajsk(f=>({...f,peringkat:e.target.value}))}>
                    {Object.entries(PRGKT_MK).map(([k,v])=><option key={k}>{k} ({v} mk)</option>)}
                  </select>
                </div>
                <div className="form-field"><label className="form-label">Khidmat Sumbangan</label>
                  <select className="form-input" value={editPajsk.khidmat||'Ahli Biasa'} onChange={e=>setEditPajsk(f=>({...f,khidmat:e.target.value}))}>
                    {Object.entries(KHDMT_MK).map(([k,v])=><option key={k}>{k} ({v} mk)</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{background:'#f0fdf4',borderRadius:10,padding:'10px 12px',marginBottom:12}}>
              <div style={{fontWeight:900,fontSize:11,color:'#15803d',marginBottom:8}}>📅 PENYERTAAN — Kehadiran (40 markah)</div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Sesi Hadir</label><input className="form-input" type="number" min="0" value={editPajsk.kehadiran_hadir||0} onChange={e=>setEditPajsk(f=>({...f,kehadiran_hadir:+e.target.value}))}/></div>
                <div className="form-field"><label className="form-label">Jumlah Sesi</label><input className="form-input" type="number" min="1" value={editPajsk.kehadiran_total||minSesi} onChange={e=>setEditPajsk(f=>({...f,kehadiran_total:+e.target.value}))}/></div>
              </div>
              <div style={{fontSize:11,color:'#15803d',fontWeight:800}}>
                Markah kehadiran: {editPajsk.kehadiran_total>0?Math.round(editPajsk.kehadiran_hadir/editPajsk.kehadiran_total*40):0}/40
              </div>
            </div>
            <div style={{background:'#fffbeb',borderRadius:10,padding:'10px 12px',marginBottom:12}}>
              <div style={{fontWeight:900,fontSize:11,color:'#b45309',marginBottom:8}}>🏆 PRESTASI — Pencapaian (20 markah)</div>
              <div className="form-field"><label className="form-label">Pencapaian Tertinggi</label>
                <select className="form-input" value={editPajsk.pencapaian||'Tiada'} onChange={e=>setEditPajsk(f=>({...f,pencapaian:e.target.value}))}>
                  {Object.entries(PENCPN_MK).map(([k,v])=><option key={k}>{k} ({v} mk)</option>)}
                </select>
              </div>
            </div>
            {(()=>{const r=computePAJSKKelab(editPajsk);return(
              <div style={{textAlign:'center',background:'var(--surface)',border:'2px solid var(--border)',borderRadius:10,padding:'12px',marginBottom:12}}>
                <div style={{fontSize:11,color:'var(--text3)',fontWeight:800,marginBottom:4}}>JUMLAH MARKAH PAJSK</div>
                <div style={{fontSize:26,fontWeight:900,fontFamily:"'Playfair Display',serif",color:'var(--accent)'}}>
                  {r.total}<span style={{fontSize:14,color:'var(--text3)'}}>/110</span>
                </div>
                <div style={{fontSize:13,fontWeight:900}}>Gred: <span className={`badge ${GRED_COLOR[r.gred]||'b-gray'}`}>{r.gred}</span></div>
                <div style={{fontSize:10,color:'var(--text3)',marginTop:6}}>
                  Jawatan:{r.mJ} + Kehadiran:{r.mK} + Peringkat:{r.mP} + Pencapaian:{r.mC} + Komitmen:{r.mKo} + Khidmat:{r.mKh}
                </div>
              </div>
            );})()}
            <button className="btn-primary" type="submit">💾 Simpan Markah</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

// ── Badan Beruniform helpers ─────────────────────────────────────────────────
const JENIS_UNIFORM=['Pengakap','Pandu Puteri','Bulan Sabit Merah','Puteri Islam','TKRS','Kadet Bomba'];
const PANGKAT_UNIFORM=['Ketua Pasukan','Penolong Ketua Pasukan','Pemimpin','AJK','Ahli Biasa'];
const PANGKAT_MK={'Ketua Pasukan':10,'Penolong Ketua Pasukan':8,'Pemimpin':6,'AJK':4,'Ahli Biasa':2};
function computePAJSKUniform(r){
  const mJ=PANGKAT_MK[r.pangkat]??2;
  const mK=r.kehadiran_total>0?Math.round(r.kehadiran_hadir/r.kehadiran_total*40):0;
  const mP=PRGKT_MK[r.peringkat]??0;
  const mC=PENCPN_MK[r.pencapaian]??0;
  const mKo=KMTMN_MK[r.komitmen]??5;
  const mKh=KHDMT_MK[r.khidmat]??2;
  const total=mJ+mK+mP+mC+mKo+mKh;
  return{mJ,mK,mP,mC,mKo,mKh,total,gred:gradeKelabPAJSK(total)};
}

function BadanBeruniform() {
  const [subtab,setSubtab]=useState(0);
  const [badan,setBadan]=useState([]);
  const [ahli,setAhli]=useState([]);
  const [latihan,setLatihan]=useState([]);
  const [pajsk,setPajsk]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedId,setSelectedId]=useState(null);
  const [q,setQ]=useState('');
  const [filterJenis,setFilterJenis]=useState('');
  const [showAddBadan,setShowAddBadan]=useState(false);
  const [editBadan,setEditBadan]=useState(null);
  const [showAddAhli,setShowAddAhli]=useState(false);
  const [editAhli,setEditAhli]=useState(null);
  const [showAddLat,setShowAddLat]=useState(false);
  const [editLat,setEditLat]=useState(null);
  const [editPajsk,setEditPajsk]=useState(null);
  const tahunNow=new Date().getFullYear().toString();
  const blankBadan={nama:'',jenis:'Pengakap',guru_penasihat:GURU_KOKU[0],guru_penasihat_2:'',hari:'Rabu',masa:'2:00 PM',lokasi:'',min_latihan:10,tahun:tahunNow,status:'Aktif'};
  const blankAhli={no_daftar:'',nama_murid:'',kelas:'',pangkat:'Ahli Biasa',status:'Aktif'};
  const blankLat={tarikh:'',masa_mula:'2:00 PM',masa_tamat:'4:00 PM',aktiviti:'',lokasi:'',hadir:0,guru_hadir:'',catatan:''};
  const blankPajsk={pangkat:'Ahli Biasa',kehadiran_hadir:0,kehadiran_total:10,peringkat:'Tiada',pencapaian:'Tiada',komitmen:2,khidmat:'Ahli Biasa'};
  const [formBadan,setFormBadan]=useState(blankBadan);
  const [formAhli,setFormAhli]=useState(blankAhli);
  const [formLat,setFormLat]=useState(blankLat);
  const load=async()=>{
    setLoading(true);
    const[b,a,l,p]=await Promise.all([
      supabase.from('koku_uniform').select('*').neq('status','PADAM').order('nama'),
      supabase.from('koku_uniform_ahli').select('*').neq('status','PADAM').order('nama_murid'),
      supabase.from('koku_uniform_latihan').select('*').order('tarikh',{ascending:false}),
      supabase.from('koku_uniform_pajsk').select('*').order('nama_murid'),
    ]);
    setBadan(b.data||[]);setAhli(a.data||[]);setLatihan(l.data||[]);setPajsk(p.data||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);
  const selectedBadan=badan.find(b=>b.id===selectedId);
  // ── BADAN CRUD
  const handleAddBadan=async e=>{e.preventDefault();const ok=await dbRun(()=>supabase.from('koku_uniform').insert([formBadan]));if(!ok)return;toast('Badan ditambah!','success');setShowAddBadan(false);setFormBadan(blankBadan);load();};
  const handleEditBadan=async e=>{e.preventDefault();const{id,created_at,...rest}=editBadan;const ok=await dbRun(()=>supabase.from('koku_uniform').update(rest).eq('id',id));if(!ok)return;toast('Dikemaskini!','success');setEditBadan(null);load();};
  const handleDelBadan=async id=>{const ok=await dbRun(()=>supabase.from('koku_uniform').update({status:'PADAM'}).eq('id',id));if(ok){setBadan(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}};
  // ── AHLI CRUD
  const handleAddAhli=async e=>{e.preventDefault();const ok=await dbRun(()=>supabase.from('koku_uniform_ahli').insert([{...formAhli,uniform_id:selectedId,tahun:tahunNow}]));if(!ok)return;toast('Ahli ditambah!','success');setShowAddAhli(false);setFormAhli(blankAhli);load();};
  const handleEditAhli=async e=>{e.preventDefault();const{id,created_at,...rest}=editAhli;const ok=await dbRun(()=>supabase.from('koku_uniform_ahli').update(rest).eq('id',id));if(!ok)return;toast('Dikemaskini!','success');setEditAhli(null);load();};
  const handleDelAhli=async id=>{const ok=await dbRun(()=>supabase.from('koku_uniform_ahli').update({status:'PADAM'}).eq('id',id));if(ok){setAhli(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}};
  // ── LATIHAN CRUD
  const handleAddLat=async e=>{e.preventDefault();const ok=await dbRun(()=>supabase.from('koku_uniform_latihan').insert([{...formLat,uniform_id:selectedId}]));if(!ok)return;toast('Rekod ditambah!','success');setShowAddLat(false);setFormLat(blankLat);load();};
  const handleEditLat=async e=>{e.preventDefault();const{id,created_at,...rest}=editLat;const ok=await dbRun(()=>supabase.from('koku_uniform_latihan').update(rest).eq('id',id));if(!ok)return;toast('Dikemaskini!','success');setEditLat(null);load();};
  const handleDelLat=async id=>{const ok=await dbRun(()=>supabase.from('koku_uniform_latihan').update({status:'PADAM'}).eq('id',id));if(ok){setLatihan(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}};
  // ── PAJSK upsert
  const handleSavePajsk=async e=>{
    e.preventDefault();
    const exists=pajsk.find(p=>p.ahli_id===editPajsk.ahli_id&&p.uniform_id===selectedId);
    const payload={...editPajsk,uniform_id:selectedId};
    let ok;
    if(exists){const{ahli_id,uniform_id,nama_murid,kelas,...upd}=payload;ok=await dbRun(()=>supabase.from('koku_uniform_pajsk').update(upd).eq('id',exists.id));}
    else{ok=await dbRun(()=>supabase.from('koku_uniform_pajsk').insert([payload]));}
    if(!ok)return;toast('Markah disimpan!','success');setEditPajsk(null);load();
  };
  // ── COMPUTED
  const ahliByBadan=id=>ahli.filter(a=>a.uniform_id===id);
  const latihanByBadan=id=>latihan.filter(l=>l.uniform_id===id);
  const pajskByBadan=id=>pajsk.filter(p=>p.uniform_id===id);
  const filteredBadan=badan.filter(b=>(!filterJenis||b.jenis===filterJenis)&&(!q||b.nama.toLowerCase().includes(q.toLowerCase())||(b.guru_penasihat||'').toLowerCase().includes(q.toLowerCase())));
  const latihanCount=id=>latihanByBadan(id).length;
  const tabStyle=i=>({padding:'7px 14px',borderRadius:9,fontWeight:900,fontSize:12,cursor:'pointer',border:'2.5px solid',fontFamily:"'Inter',sans-serif",background:subtab===i?'var(--accent)':'var(--surface)',borderColor:subtab===i?'var(--accent)':'var(--border)',color:subtab===i?'#fff':'var(--text)',transition:'all 0.15s'});
  function UniformPill(){return(<div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14,padding:'10px 12px',background:'var(--surface)',border:'2px solid var(--border)',borderRadius:12}}><span style={{fontSize:11,fontWeight:900,color:'var(--text3)',alignSelf:'center',marginRight:4}}>BADAN:</span>{badan.map(b=>{const cnt=ahliByBadan(b.id).length;const active=selectedId===b.id;return(<button key={b.id} onClick={()=>setSelectedId(b.id)} style={{padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:800,border:'2px solid',cursor:'pointer',fontFamily:"'Inter',sans-serif",transition:'all 0.12s',background:active?'var(--accent)':'var(--surface)',borderColor:active?'var(--accent)':'var(--border)',color:active?'#fff':'var(--text)'}}>{b.nama} <span style={{opacity:0.7,fontSize:10}}>({cnt})</span></button>);})}{badan.length===0&&<span style={{fontSize:12,color:'var(--text3)'}}>Tiada badan. Tambah dalam tab Senarai.</span>}</div>);}
  function NoSelection(){return<div style={{textAlign:'center',padding:48,color:'var(--text3)',fontWeight:800,fontSize:14}}>👆 Pilih badan beruniform di atas untuk lihat rekod</div>;}
  const statsCards=[{ico:'🎖️',val:badan.length,lbl:'Badan Beruniform'},{ico:'✅',val:badan.filter(b=>b.status==='Aktif').length,lbl:'Aktif'},{ico:'👥',val:ahli.length,lbl:'Jumlah Ahli'},{ico:'📅',val:latihan.length,lbl:'Rekod Latihan'}];
  return(
    <KurPage title="Badan Beruniform" sub="Kokurikulum · SK Darau" stats={statsCards}>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
        {['🎖️ Senarai Badan','👥 Ahli','📅 Rekod Latihan','📊 Penilaian PAJSK'].map((t,i)=>(<button key={i} style={tabStyle(i)} onClick={()=>setSubtab(i)}>{t}</button>))}
      </div>
      {loading?<div className="loading">⏳ Memuatkan…</div>:(<>

        {/* SUB-TAB 0: SENARAI */}
        {subtab===0&&(<div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12,alignItems:'center'}}>
            <input className="kur-search" placeholder="🔍 Cari badan / guru…" value={q} onChange={e=>setQ(e.target.value)} style={{flex:1,minWidth:160}}/>
            <select className="kur-select" value={filterJenis} onChange={e=>setFilterJenis(e.target.value)}><option value="">Semua Jenis</option>{JENIS_UNIFORM.map(j=><option key={j}>{j}</option>)}</select>
            <button className="btn-add" onClick={()=>{setFormBadan(blankBadan);setShowAddBadan(true)}}>+ Tambah</button>
          </div>
          <div className="kur-table-wrap"><table className="kur-table">
            <thead><tr><th>#</th><th>Nama Badan</th><th>Jenis</th><th>Guru Penasihat</th><th>Hari/Masa</th><th>Latihan</th><th>Status</th><th></th></tr></thead>
            <tbody>{filteredBadan.map((b,i)=>{
              const lat=latihanCount(b.id);const min=b.min_latihan||10;const ok=lat>=min;
              return(<tr key={b.id} style={{cursor:'pointer'}} onClick={()=>{setSelectedId(b.id);setSubtab(1);}}>
                <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                <td style={{fontWeight:900}}>{b.nama}</td>
                <td><span className="badge b-blue">{b.jenis}</span></td>
                <td>{b.guru_penasihat}</td>
                <td style={{fontSize:12}}>{b.hari} {b.masa}</td>
                <td><span className={`badge ${ok?'b-green':'b-red'}`}>{lat}/{min}</span></td>
                <td><span className={`badge ${b.status==='Aktif'?'b-green':'b-gray'}`}>{b.status}</span></td>
                <td onClick={e=>e.stopPropagation()} style={{display:'flex',gap:4}}>
                  <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditBadan({...b})}>✏️</button>
                  <button className="btn-del" onClick={()=>handleDelBadan(b.id)}>🗑</button>
                </td>
              </tr>);
            })}</tbody>
          </table></div>
          {showAddBadan&&<Modal title="Tambah Badan Beruniform" onClose={()=>setShowAddBadan(false)}><form onSubmit={handleAddBadan}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Badan</label><input className="form-input" required value={formBadan.nama} onChange={e=>setFormBadan(f=>({...f,nama:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jenis</label><select className="form-input" value={formBadan.jenis} onChange={e=>setFormBadan(f=>({...f,jenis:e.target.value}))}>{JENIS_UNIFORM.map(j=><option key={j}>{j}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Guru Penasihat</label><select className="form-input" value={formBadan.guru_penasihat} onChange={e=>setFormBadan(f=>({...f,guru_penasihat:e.target.value}))}>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Guru Penasihat 2</label><select className="form-input" value={formBadan.guru_penasihat_2} onChange={e=>setFormBadan(f=>({...f,guru_penasihat_2:e.target.value}))}><option value="">-</option>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Hari</label><select className="form-input" value={formBadan.hari} onChange={e=>setFormBadan(f=>({...f,hari:e.target.value}))}>{['Isnin','Selasa','Rabu','Khamis','Jumaat'].map(h=><option key={h}>{h}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={formBadan.masa} onChange={e=>setFormBadan(f=>({...f,masa:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Min Latihan</label><input className="form-input" type="number" min="1" value={formBadan.min_latihan} onChange={e=>setFormBadan(f=>({...f,min_latihan:+e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" value={formBadan.lokasi} onChange={e=>setFormBadan(f=>({...f,lokasi:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={formBadan.status} onChange={e=>setFormBadan(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form></Modal>}
          {editBadan&&<Modal title={`Edit — ${editBadan.nama}`} onClose={()=>setEditBadan(null)}><form onSubmit={handleEditBadan}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Badan</label><input className="form-input" required value={editBadan.nama} onChange={e=>setEditBadan(f=>({...f,nama:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jenis</label><select className="form-input" value={editBadan.jenis} onChange={e=>setEditBadan(f=>({...f,jenis:e.target.value}))}>{JENIS_UNIFORM.map(j=><option key={j}>{j}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Guru Penasihat</label><select className="form-input" value={editBadan.guru_penasihat} onChange={e=>setEditBadan(f=>({...f,guru_penasihat:e.target.value}))}>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Guru Penasihat 2</label><select className="form-input" value={editBadan.guru_penasihat_2||''} onChange={e=>setEditBadan(f=>({...f,guru_penasihat_2:e.target.value}))}><option value="">-</option>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Hari</label><select className="form-input" value={editBadan.hari} onChange={e=>setEditBadan(f=>({...f,hari:e.target.value}))}>{['Isnin','Selasa','Rabu','Khamis','Jumaat'].map(h=><option key={h}>{h}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={editBadan.masa||''} onChange={e=>setEditBadan(f=>({...f,masa:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Min Latihan</label><input className="form-input" type="number" min="1" value={editBadan.min_latihan||10} onChange={e=>setEditBadan(f=>({...f,min_latihan:+e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" value={editBadan.lokasi||''} onChange={e=>setEditBadan(f=>({...f,lokasi:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editBadan.status} onChange={e=>setEditBadan(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
            <button className="btn-primary" type="submit">💾 Simpan</button>
          </form></Modal>}
        </div>)}

        {/* SUB-TAB 1: AHLI */}
        {subtab===1&&(<div>
          <UniformPill/>
          {!selectedId?<NoSelection/>:(<>
            <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
              <span style={{fontWeight:900,fontSize:14,flex:1}}>{selectedBadan?.nama} — Senarai Ahli</span>
              <button className="btn-add" onClick={()=>{setFormAhli(blankAhli);setShowAddAhli(true)}}>+ Tambah</button>
            </div>
            <div className="kur-table-wrap"><table className="kur-table">
              <thead><tr><th>#</th><th>No. Daftar</th><th>Nama Murid</th><th>Kelas</th><th>Pangkat</th><th>Status</th><th></th></tr></thead>
              <tbody>{ahliByBadan(selectedId).map((a,i)=>(
                <tr key={a.id}>
                  <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                  <td style={{fontSize:12,color:'var(--text3)'}}>{a.no_daftar}</td>
                  <td style={{fontWeight:800}}>{a.nama_murid}</td>
                  <td>{a.kelas}</td>
                  <td><span className={`badge ${a.pangkat==='Ketua Pasukan'?'b-blue':a.pangkat==='Penolong Ketua Pasukan'?'b-green':a.pangkat==='Pemimpin'?'b-yellow':'b-gray'}`}>{a.pangkat}</span></td>
                  <td><span className={`badge ${a.status==='Aktif'?'b-green':'b-red'}`}>{a.status}</span></td>
                  <td style={{display:'flex',gap:4}}>
                    <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditAhli({...a})}>✏️</button>
                    <button className="btn-del" onClick={()=>handleDelAhli(a.id)}>🗑</button>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          </>)}
          {showAddAhli&&<Modal title="Tambah Ahli" onClose={()=>setShowAddAhli(false)}><form onSubmit={handleAddAhli}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">No. Daftar</label><input className="form-input" value={formAhli.no_daftar} onChange={e=>setFormAhli(f=>({...f,no_daftar:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={formAhli.nama_murid} onChange={e=>setFormAhli(f=>({...f,nama_murid:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={formAhli.kelas} onChange={e=>setFormAhli(f=>({...f,kelas:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Pangkat</label><select className="form-input" value={formAhli.pangkat} onChange={e=>setFormAhli(f=>({...f,pangkat:e.target.value}))}>{PANGKAT_UNIFORM.map(p=><option key={p}>{p}</option>)}</select></div>
            </div>
            <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={formAhli.status} onChange={e=>setFormAhli(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form></Modal>}
          {editAhli&&<Modal title={`Edit — ${editAhli.nama_murid}`} onClose={()=>setEditAhli(null)}><form onSubmit={handleEditAhli}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">No. Daftar</label><input className="form-input" value={editAhli.no_daftar||''} onChange={e=>setEditAhli(f=>({...f,no_daftar:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={editAhli.nama_murid} onChange={e=>setEditAhli(f=>({...f,nama_murid:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={editAhli.kelas||''} onChange={e=>setEditAhli(f=>({...f,kelas:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Pangkat</label><select className="form-input" value={editAhli.pangkat} onChange={e=>setEditAhli(f=>({...f,pangkat:e.target.value}))}>{PANGKAT_UNIFORM.map(p=><option key={p}>{p}</option>)}</select></div>
            </div>
            <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editAhli.status} onChange={e=>setEditAhli(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
            <button className="btn-primary" type="submit">💾 Simpan</button>
          </form></Modal>}
        </div>)}

        {/* SUB-TAB 2: REKOD LATIHAN */}
        {subtab===2&&(<div>
          <UniformPill/>
          {!selectedId?<NoSelection/>:(<>
            <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
              <span style={{fontWeight:900,fontSize:14,flex:1}}>{selectedBadan?.nama} — Rekod Latihan</span>
              <span className={`badge ${latihanCount(selectedId)>=(selectedBadan?.min_latihan||10)?'b-green':'b-red'}`}>{latihanCount(selectedId)}/{selectedBadan?.min_latihan||10} sesi</span>
              <button className="btn-add" onClick={()=>{setFormLat(blankLat);setShowAddLat(true)}}>+ Tambah</button>
            </div>
            <div className="kur-table-wrap"><table className="kur-table">
              <thead><tr><th>#</th><th>Tarikh</th><th>Masa</th><th>Aktiviti</th><th>Lokasi</th><th>Hadir</th><th>Guru</th><th></th></tr></thead>
              <tbody>{latihanByBadan(selectedId).map((l,i)=>(
                <tr key={l.id}>
                  <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                  <td style={{fontWeight:800}}>{l.tarikh}</td>
                  <td style={{fontSize:12}}>{l.masa_mula}–{l.masa_tamat}</td>
                  <td>{l.aktiviti}</td>
                  <td style={{fontSize:12,color:'var(--text3)'}}>{l.lokasi}</td>
                  <td><span className="badge b-blue">{l.hadir}</span></td>
                  <td style={{fontSize:12}}>{l.guru_hadir}</td>
                  <td style={{display:'flex',gap:4}}>
                    <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditLat({...l})}>✏️</button>
                    <button className="btn-del" onClick={()=>handleDelLat(l.id)}>🗑</button>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          </>)}
          {showAddLat&&<Modal title="Tambah Rekod Latihan" onClose={()=>setShowAddLat(false)}><form onSubmit={handleAddLat}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" type="date" required value={formLat.tarikh} onChange={e=>setFormLat(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Masa Mula</label><input className="form-input" value={formLat.masa_mula} onChange={e=>setFormLat(f=>({...f,masa_mula:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Masa Tamat</label><input className="form-input" value={formLat.masa_tamat} onChange={e=>setFormLat(f=>({...f,masa_tamat:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Aktiviti</label><input className="form-input" value={formLat.aktiviti} onChange={e=>setFormLat(f=>({...f,aktiviti:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" value={formLat.lokasi} onChange={e=>setFormLat(f=>({...f,lokasi:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Hadir</label><input className="form-input" type="number" min="0" value={formLat.hadir} onChange={e=>setFormLat(f=>({...f,hadir:+e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Guru Hadir</label><select className="form-input" value={formLat.guru_hadir} onChange={e=>setFormLat(f=>({...f,guru_hadir:e.target.value}))}><option value="">-</option>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
            </div>
            <div className="form-field"><label className="form-label">Catatan</label><textarea className="form-input" rows={2} value={formLat.catatan} onChange={e=>setFormLat(f=>({...f,catatan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form></Modal>}
          {editLat&&<Modal title="Edit Rekod Latihan" onClose={()=>setEditLat(null)}><form onSubmit={handleEditLat}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" type="date" required value={editLat.tarikh} onChange={e=>setEditLat(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Masa Mula</label><input className="form-input" value={editLat.masa_mula||''} onChange={e=>setEditLat(f=>({...f,masa_mula:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Masa Tamat</label><input className="form-input" value={editLat.masa_tamat||''} onChange={e=>setEditLat(f=>({...f,masa_tamat:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Aktiviti</label><input className="form-input" value={editLat.aktiviti||''} onChange={e=>setEditLat(f=>({...f,aktiviti:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" value={editLat.lokasi||''} onChange={e=>setEditLat(f=>({...f,lokasi:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Hadir</label><input className="form-input" type="number" min="0" value={editLat.hadir||0} onChange={e=>setEditLat(f=>({...f,hadir:+e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Guru Hadir</label><select className="form-input" value={editLat.guru_hadir||''} onChange={e=>setEditLat(f=>({...f,guru_hadir:e.target.value}))}><option value="">-</option>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
            </div>
            <div className="form-field"><label className="form-label">Catatan</label><textarea className="form-input" rows={2} value={editLat.catatan||''} onChange={e=>setEditLat(f=>({...f,catatan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">💾 Simpan</button>
          </form></Modal>}
        </div>)}

        {/* SUB-TAB 3: PENILAIAN PAJSK */}
        {subtab===3&&(<div>
          <UniformPill/>
          {!selectedId?<NoSelection/>:(<>
            <div style={{marginBottom:12,fontWeight:900,fontSize:14}}>{selectedBadan?.nama} — Penilaian PAJSK</div>
            <div className="kur-table-wrap"><table className="kur-table">
              <thead><tr><th>#</th><th>Nama</th><th>Kelas</th><th>Pangkat</th><th>Jwtn(10)</th><th>Hadr(40)</th><th>Prgkt(20)</th><th>Pcpn(20)</th><th>Ktmn(10)</th><th>Khdmt(10)</th><th>Jumlah</th><th>Gred</th><th></th></tr></thead>
              <tbody>{ahliByBadan(selectedId).map((a,i)=>{
                const rec=pajskByBadan(selectedId).find(p=>p.ahli_id===a.id);
                const r=rec?computePAJSKUniform(rec):null;
                return(<tr key={a.id}>
                  <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                  <td style={{fontWeight:800}}>{a.nama_murid}</td>
                  <td>{a.kelas}</td>
                  <td><span className="badge b-blue" style={{fontSize:10}}>{a.pangkat}</span></td>
                  {r?(<>
                    <td style={{textAlign:'center'}}>{r.mJ}</td><td style={{textAlign:'center'}}>{r.mK}</td>
                    <td style={{textAlign:'center'}}>{r.mP}</td><td style={{textAlign:'center'}}>{r.mC}</td>
                    <td style={{textAlign:'center'}}>{r.mKo}</td><td style={{textAlign:'center'}}>{r.mKh}</td>
                    <td style={{textAlign:'center',fontWeight:900}}>{r.total}</td>
                    <td><span className={`badge ${r.gred==='A'?'b-green':r.gred==='B'?'b-blue':r.gred==='C'?'b-yellow':'b-red'}`}>{r.gred}</span></td>
                  </>):(<><td colSpan={7} style={{color:'var(--text3)',fontSize:12,textAlign:'center'}}>— Belum ada markah —</td><td></td></>)}
                  <td><button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditPajsk(rec?{...rec}:{...blankPajsk,ahli_id:a.id,nama_murid:a.nama_murid,kelas:a.kelas,pangkat:a.pangkat,uniform_id:selectedId})}>✏️</button></td>
                </tr>);
              })}</tbody>
            </table></div>
          </>)}
          {editPajsk&&<Modal title={`Markah PAJSK — ${editPajsk.nama_murid}`} onClose={()=>setEditPajsk(null)}>
            <form onSubmit={handleSavePajsk}>
              <div className="form-field"><label className="form-label">Pangkat</label><select className="form-input" value={editPajsk.pangkat||'Ahli Biasa'} onChange={e=>setEditPajsk(f=>({...f,pangkat:e.target.value}))}>{PANGKAT_UNIFORM.map(p=><option key={p}>{p}</option>)}</select></div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Kehadiran (hadir)</label><input className="form-input" type="number" min="0" value={editPajsk.kehadiran_hadir||0} onChange={e=>setEditPajsk(f=>({...f,kehadiran_hadir:+e.target.value}))}/></div>
                <div className="form-field"><label className="form-label">Kehadiran (jumlah)</label><input className="form-input" type="number" min="1" value={editPajsk.kehadiran_total||10} onChange={e=>setEditPajsk(f=>({...f,kehadiran_total:+e.target.value}))}/></div>
              </div>
              <div className="form-field"><label className="form-label">Peringkat Pertandingan</label><select className="form-input" value={editPajsk.peringkat} onChange={e=>setEditPajsk(f=>({...f,peringkat:e.target.value}))}>{Object.keys(PRGKT_MK).map(p=><option key={p}>{p}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Pencapaian Tertinggi</label><select className="form-input" value={editPajsk.pencapaian} onChange={e=>setEditPajsk(f=>({...f,pencapaian:e.target.value}))}>{Object.keys(PENCPN_MK).map(p=><option key={p}>{p}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Komitmen (1-4)</label><select className="form-input" value={editPajsk.komitmen} onChange={e=>setEditPajsk(f=>({...f,komitmen:+e.target.value}))}>{[1,2,3,4].map(n=><option key={n} value={n}>{n} — {KMTMN_MK[n]} markah</option>)}</select></div>
              <div className="form-field"><label className="form-label">Khidmat Masyarakat</label><select className="form-input" value={editPajsk.khidmat} onChange={e=>setEditPajsk(f=>({...f,khidmat:e.target.value}))}>{Object.keys(KHDMT_MK).map(k=><option key={k}>{k}</option>)}</select></div>
              {(()=>{const r=computePAJSKUniform(editPajsk);return(
                <div style={{background:'var(--surface)',border:'2px solid var(--border)',borderRadius:10,padding:'10px 14px',marginTop:8}}>
                  <div style={{fontWeight:900,fontSize:12,marginBottom:6}}>Pratonton Markah</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,fontSize:11}}>
                    <span>Pangkat: <b>{r.mJ}</b></span><span>Kehadiran: <b>{r.mK}</b></span><span>Peringkat: <b>{r.mP}</b></span>
                    <span>Pencapaian: <b>{r.mC}</b></span><span>Komitmen: <b>{r.mKo}</b></span><span>Khidmat: <b>{r.mKh}</b></span>
                  </div>
                  <div style={{marginTop:8,fontWeight:900,fontSize:16,color:'var(--accent)'}}>Jumlah: {r.total}/110 — Gred {r.gred}</div>
                </div>
              );})()}
              <button className="btn-primary" type="submit" style={{marginTop:10}}>💾 Simpan Markah</button>
            </form>
          </Modal>}
        </div>)}

      </>)}
    </KurPage>
  );
}

// ── Sukan & Permainan helpers ────────────────────────────────────────────────
const JWTN_SUKAN=['Kapten Pasukan','Timbalan Kapten','Pemain Teras','Pemain','Ahli Biasa'];
const JWTN_SUKAN_MK={'Kapten Pasukan':10,'Timbalan Kapten':8,'Pemain Teras':6,'Pemain':4,'Ahli Biasa':2};
const KAT_SUKAN=['Lelaki','Perempuan','Campuran'];
function computePAJSKSukan(r){
  const mJ=JWTN_SUKAN_MK[r.jawatan]??2;
  const mK=r.kehadiran_total>0?Math.round(r.kehadiran_hadir/r.kehadiran_total*40):0;
  const mP=PRGKT_MK[r.peringkat]??0;
  const mC=PENCPN_MK[r.pencapaian]??0;
  const mKo=KMTMN_MK[r.komitmen]??5;
  const mKh=KHDMT_MK[r.khidmat]??2;
  const total=mJ+mK+mP+mC+mKo+mKh;
  return{mJ,mK,mP,mC,mKo,mKh,total,gred:gradeKelabPAJSK(total)};
}

function SukanPermainan() {
  const [subtab,setSubtab]=useState(0);
  const [sukan,setSukan]=useState([]);
  const [atlet,setAtlet]=useState([]);
  const [latihan,setLatihan]=useState([]);
  const [pajsk,setPajsk]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedId,setSelectedId]=useState(null);
  const [q,setQ]=useState('');
  const [filterKat,setFilterKat]=useState('');
  const [showAddSukan,setShowAddSukan]=useState(false);
  const [editSukan,setEditSukan]=useState(null);
  const [showAddAtlet,setShowAddAtlet]=useState(false);
  const [editAtlet,setEditAtlet]=useState(null);
  const [showAddLat,setShowAddLat]=useState(false);
  const [editLat,setEditLat]=useState(null);
  const [editPajsk,setEditPajsk]=useState(null);
  const tahunNow=new Date().getFullYear().toString();
  const blankSukan={nama:'',kategori:'Campuran',guru_jurulatih:GURU_KOKU[0],guru_jurulatih_2:'',hari:'Rabu',masa:'2:00 PM',lokasi:'',min_latihan:10,tahun:tahunNow,status:'Aktif'};
  const blankAtlet={no_daftar:'',nama_murid:'',kelas:'',jawatan:'Ahli Biasa',status:'Aktif'};
  const blankLat={tarikh:'',jenis:'Latihan',lawan:'',aktiviti:'',lokasi:'',hadir:0,guru_hadir:'',catatan:''};
  const blankPajsk={jawatan:'Ahli Biasa',kehadiran_hadir:0,kehadiran_total:10,peringkat:'Tiada',pencapaian:'Tiada',komitmen:2,khidmat:'Ahli Biasa'};
  const [formSukan,setFormSukan]=useState(blankSukan);
  const [formAtlet,setFormAtlet]=useState(blankAtlet);
  const [formLat,setFormLat]=useState(blankLat);
  const load=async()=>{
    setLoading(true);
    const[s,a,l,p]=await Promise.all([
      supabase.from('koku_sukan').select('*').neq('status','PADAM').order('nama'),
      supabase.from('koku_sukan_atlet').select('*').neq('status','PADAM').order('nama_murid'),
      supabase.from('koku_sukan_latihan').select('*').order('tarikh',{ascending:false}),
      supabase.from('koku_sukan_pajsk').select('*').order('nama_murid'),
    ]);
    setSukan(s.data||[]);setAtlet(a.data||[]);setLatihan(l.data||[]);setPajsk(p.data||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);
  const selectedSukan=sukan.find(s=>s.id===selectedId);
  // ── SUKAN CRUD
  const handleAddSukan=async e=>{e.preventDefault();const ok=await dbRun(()=>supabase.from('koku_sukan').insert([formSukan]));if(!ok)return;toast('Sukan ditambah!','success');setShowAddSukan(false);setFormSukan(blankSukan);load();};
  const handleEditSukan=async e=>{e.preventDefault();const{id,created_at,...rest}=editSukan;const ok=await dbRun(()=>supabase.from('koku_sukan').update(rest).eq('id',id));if(!ok)return;toast('Dikemaskini!','success');setEditSukan(null);load();};
  const handleDelSukan=async id=>{const ok=await dbRun(()=>supabase.from('koku_sukan').update({status:'PADAM'}).eq('id',id));if(ok){setSukan(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}};
  // ── ATLET CRUD
  const handleAddAtlet=async e=>{e.preventDefault();const ok=await dbRun(()=>supabase.from('koku_sukan_atlet').insert([{...formAtlet,sukan_id:selectedId,tahun:tahunNow}]));if(!ok)return;toast('Atlet ditambah!','success');setShowAddAtlet(false);setFormAtlet(blankAtlet);load();};
  const handleEditAtlet=async e=>{e.preventDefault();const{id,created_at,...rest}=editAtlet;const ok=await dbRun(()=>supabase.from('koku_sukan_atlet').update(rest).eq('id',id));if(!ok)return;toast('Dikemaskini!','success');setEditAtlet(null);load();};
  const handleDelAtlet=async id=>{const ok=await dbRun(()=>supabase.from('koku_sukan_atlet').update({status:'PADAM'}).eq('id',id));if(ok){setAtlet(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}};
  // ── LATIHAN CRUD
  const handleAddLat=async e=>{e.preventDefault();const ok=await dbRun(()=>supabase.from('koku_sukan_latihan').insert([{...formLat,sukan_id:selectedId}]));if(!ok)return;toast('Rekod ditambah!','success');setShowAddLat(false);setFormLat(blankLat);load();};
  const handleEditLat=async e=>{e.preventDefault();const{id,created_at,...rest}=editLat;const ok=await dbRun(()=>supabase.from('koku_sukan_latihan').update(rest).eq('id',id));if(!ok)return;toast('Dikemaskini!','success');setEditLat(null);load();};
  const handleDelLat=async id=>{const ok=await dbRun(()=>supabase.from('koku_sukan_latihan').update({status:'PADAM'}).eq('id',id));if(ok){setLatihan(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}};
  // ── PAJSK upsert
  const handleSavePajsk=async e=>{
    e.preventDefault();
    const exists=pajsk.find(p=>p.atlet_id===editPajsk.atlet_id&&p.sukan_id===selectedId);
    const payload={...editPajsk,sukan_id:selectedId};
    let ok;
    if(exists){const{atlet_id,sukan_id,nama_murid,kelas,...upd}=payload;ok=await dbRun(()=>supabase.from('koku_sukan_pajsk').update(upd).eq('id',exists.id));}
    else{ok=await dbRun(()=>supabase.from('koku_sukan_pajsk').insert([payload]));}
    if(!ok)return;toast('Markah disimpan!','success');setEditPajsk(null);load();
  };
  // ── COMPUTED
  const atletBySukan=id=>atlet.filter(a=>a.sukan_id===id);
  const latihanBySukan=id=>latihan.filter(l=>l.sukan_id===id);
  const pajskBySukan=id=>pajsk.filter(p=>p.sukan_id===id);
  const filteredSukan=sukan.filter(s=>(!filterKat||s.kategori===filterKat)&&(!q||s.nama.toLowerCase().includes(q.toLowerCase())||(s.guru_jurulatih||'').toLowerCase().includes(q.toLowerCase())));
  const latihanCount=id=>latihanBySukan(id).length;
  const tabStyle=i=>({padding:'7px 14px',borderRadius:9,fontWeight:900,fontSize:12,cursor:'pointer',border:'2.5px solid',fontFamily:"'Inter',sans-serif",background:subtab===i?'var(--accent)':'var(--surface)',borderColor:subtab===i?'var(--accent)':'var(--border)',color:subtab===i?'#fff':'var(--text)',transition:'all 0.15s'});
  function SukanPill(){return(<div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14,padding:'10px 12px',background:'var(--surface)',border:'2px solid var(--border)',borderRadius:12}}><span style={{fontSize:11,fontWeight:900,color:'var(--text3)',alignSelf:'center',marginRight:4}}>SUKAN:</span>{sukan.map(s=>{const cnt=atletBySukan(s.id).length;const active=selectedId===s.id;return(<button key={s.id} onClick={()=>setSelectedId(s.id)} style={{padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:800,border:'2px solid',cursor:'pointer',fontFamily:"'Inter',sans-serif",transition:'all 0.12s',background:active?'var(--accent)':'var(--surface)',borderColor:active?'var(--accent)':'var(--border)',color:active?'#fff':'var(--text)'}}>{s.nama} <span style={{opacity:0.7,fontSize:10}}>({cnt})</span></button>);})}{sukan.length===0&&<span style={{fontSize:12,color:'var(--text3)'}}>Tiada sukan. Tambah dalam tab Senarai.</span>}</div>);}
  function NoSelection(){return<div style={{textAlign:'center',padding:48,color:'var(--text3)',fontWeight:800,fontSize:14}}>👆 Pilih sukan di atas untuk lihat rekod</div>;}
  const statsCards=[{ico:'⚽',val:sukan.length,lbl:'Jenis Sukan'},{ico:'✅',val:sukan.filter(s=>s.status==='Aktif').length,lbl:'Aktif'},{ico:'🏃',val:atlet.length,lbl:'Jumlah Atlet'},{ico:'📅',val:latihan.length,lbl:'Rekod Latihan'}];
  return(
    <KurPage title="Sukan & Permainan" sub="Kokurikulum · SK Darau" stats={statsCards}>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
        {['⚽ Senarai Sukan','🏃 Atlet','📅 Rekod Latihan','📊 Penilaian PAJSK'].map((t,i)=>(<button key={i} style={tabStyle(i)} onClick={()=>setSubtab(i)}>{t}</button>))}
      </div>
      {loading?<div className="loading">⏳ Memuatkan…</div>:(<>

        {/* SUB-TAB 0: SENARAI */}
        {subtab===0&&(<div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12,alignItems:'center'}}>
            <input className="kur-search" placeholder="🔍 Cari sukan / guru…" value={q} onChange={e=>setQ(e.target.value)} style={{flex:1,minWidth:160}}/>
            <select className="kur-select" value={filterKat} onChange={e=>setFilterKat(e.target.value)}><option value="">Semua Kategori</option>{KAT_SUKAN.map(k=><option key={k}>{k}</option>)}</select>
            <button className="btn-add" onClick={()=>{setFormSukan(blankSukan);setShowAddSukan(true)}}>+ Tambah</button>
          </div>
          <div className="kur-table-wrap"><table className="kur-table">
            <thead><tr><th>#</th><th>Nama Sukan</th><th>Kategori</th><th>Guru Jurulatih</th><th>Hari/Masa</th><th>Latihan</th><th>Status</th><th></th></tr></thead>
            <tbody>{filteredSukan.map((s,i)=>{
              const lat=latihanCount(s.id);const min=s.min_latihan||10;const ok=lat>=min;
              return(<tr key={s.id} style={{cursor:'pointer'}} onClick={()=>{setSelectedId(s.id);setSubtab(1);}}>
                <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                <td style={{fontWeight:900}}>{s.nama}</td>
                <td><span className={`badge ${s.kategori==='Lelaki'?'b-blue':s.kategori==='Perempuan'?'b-green':'b-yellow'}`}>{s.kategori}</span></td>
                <td>{s.guru_jurulatih}</td>
                <td style={{fontSize:12}}>{s.hari} {s.masa}</td>
                <td><span className={`badge ${ok?'b-green':'b-red'}`}>{lat}/{min}</span></td>
                <td><span className={`badge ${s.status==='Aktif'?'b-green':'b-gray'}`}>{s.status}</span></td>
                <td onClick={e=>e.stopPropagation()} style={{display:'flex',gap:4}}>
                  <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditSukan({...s})}>✏️</button>
                  <button className="btn-del" onClick={()=>handleDelSukan(s.id)}>🗑</button>
                </td>
              </tr>);
            })}</tbody>
          </table></div>
          {showAddSukan&&<Modal title="Tambah Sukan" onClose={()=>setShowAddSukan(false)}><form onSubmit={handleAddSukan}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Sukan</label><input className="form-input" required value={formSukan.nama} onChange={e=>setFormSukan(f=>({...f,nama:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kategori</label><select className="form-input" value={formSukan.kategori} onChange={e=>setFormSukan(f=>({...f,kategori:e.target.value}))}>{KAT_SUKAN.map(k=><option key={k}>{k}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Guru Jurulatih</label><select className="form-input" value={formSukan.guru_jurulatih} onChange={e=>setFormSukan(f=>({...f,guru_jurulatih:e.target.value}))}>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Guru Jurulatih 2</label><select className="form-input" value={formSukan.guru_jurulatih_2} onChange={e=>setFormSukan(f=>({...f,guru_jurulatih_2:e.target.value}))}><option value="">-</option>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Hari</label><select className="form-input" value={formSukan.hari} onChange={e=>setFormSukan(f=>({...f,hari:e.target.value}))}>{['Isnin','Selasa','Rabu','Khamis','Jumaat'].map(h=><option key={h}>{h}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={formSukan.masa} onChange={e=>setFormSukan(f=>({...f,masa:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Min Latihan</label><input className="form-input" type="number" min="1" value={formSukan.min_latihan} onChange={e=>setFormSukan(f=>({...f,min_latihan:+e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" value={formSukan.lokasi} onChange={e=>setFormSukan(f=>({...f,lokasi:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={formSukan.status} onChange={e=>setFormSukan(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form></Modal>}
          {editSukan&&<Modal title={`Edit — ${editSukan.nama}`} onClose={()=>setEditSukan(null)}><form onSubmit={handleEditSukan}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Sukan</label><input className="form-input" required value={editSukan.nama} onChange={e=>setEditSukan(f=>({...f,nama:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kategori</label><select className="form-input" value={editSukan.kategori} onChange={e=>setEditSukan(f=>({...f,kategori:e.target.value}))}>{KAT_SUKAN.map(k=><option key={k}>{k}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Guru Jurulatih</label><select className="form-input" value={editSukan.guru_jurulatih} onChange={e=>setEditSukan(f=>({...f,guru_jurulatih:e.target.value}))}>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Guru Jurulatih 2</label><select className="form-input" value={editSukan.guru_jurulatih_2||''} onChange={e=>setEditSukan(f=>({...f,guru_jurulatih_2:e.target.value}))}><option value="">-</option>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Hari</label><select className="form-input" value={editSukan.hari||'Rabu'} onChange={e=>setEditSukan(f=>({...f,hari:e.target.value}))}>{['Isnin','Selasa','Rabu','Khamis','Jumaat'].map(h=><option key={h}>{h}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={editSukan.masa||''} onChange={e=>setEditSukan(f=>({...f,masa:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Min Latihan</label><input className="form-input" type="number" min="1" value={editSukan.min_latihan||10} onChange={e=>setEditSukan(f=>({...f,min_latihan:+e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" value={editSukan.lokasi||''} onChange={e=>setEditSukan(f=>({...f,lokasi:e.target.value}))}/></div>
            <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editSukan.status} onChange={e=>setEditSukan(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
            <button className="btn-primary" type="submit">💾 Simpan</button>
          </form></Modal>}
        </div>)}

        {/* SUB-TAB 1: ATLET */}
        {subtab===1&&(<div>
          <SukanPill/>
          {!selectedId?<NoSelection/>:(<>
            <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
              <span style={{fontWeight:900,fontSize:14,flex:1}}>{selectedSukan?.nama} — Senarai Atlet</span>
              <button className="btn-add" onClick={()=>{setFormAtlet(blankAtlet);setShowAddAtlet(true)}}>+ Tambah</button>
            </div>
            <div className="kur-table-wrap"><table className="kur-table">
              <thead><tr><th>#</th><th>No. Daftar</th><th>Nama Murid</th><th>Kelas</th><th>Jawatan</th><th>Status</th><th></th></tr></thead>
              <tbody>{atletBySukan(selectedId).map((a,i)=>(
                <tr key={a.id}>
                  <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                  <td style={{fontSize:12,color:'var(--text3)'}}>{a.no_daftar}</td>
                  <td style={{fontWeight:800}}>{a.nama_murid}</td>
                  <td>{a.kelas}</td>
                  <td><span className={`badge ${a.jawatan==='Kapten Pasukan'?'b-blue':a.jawatan==='Timbalan Kapten'?'b-green':a.jawatan==='Pemain Teras'?'b-yellow':'b-gray'}`}>{a.jawatan}</span></td>
                  <td><span className={`badge ${a.status==='Aktif'?'b-green':'b-red'}`}>{a.status}</span></td>
                  <td style={{display:'flex',gap:4}}>
                    <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditAtlet({...a})}>✏️</button>
                    <button className="btn-del" onClick={()=>handleDelAtlet(a.id)}>🗑</button>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          </>)}
          {showAddAtlet&&<Modal title="Tambah Atlet" onClose={()=>setShowAddAtlet(false)}><form onSubmit={handleAddAtlet}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">No. Daftar</label><input className="form-input" value={formAtlet.no_daftar} onChange={e=>setFormAtlet(f=>({...f,no_daftar:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={formAtlet.nama_murid} onChange={e=>setFormAtlet(f=>({...f,nama_murid:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={formAtlet.kelas} onChange={e=>setFormAtlet(f=>({...f,kelas:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jawatan</label><select className="form-input" value={formAtlet.jawatan} onChange={e=>setFormAtlet(f=>({...f,jawatan:e.target.value}))}>{JWTN_SUKAN.map(j=><option key={j}>{j}</option>)}</select></div>
            </div>
            <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={formAtlet.status} onChange={e=>setFormAtlet(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form></Modal>}
          {editAtlet&&<Modal title={`Edit — ${editAtlet.nama_murid}`} onClose={()=>setEditAtlet(null)}><form onSubmit={handleEditAtlet}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">No. Daftar</label><input className="form-input" value={editAtlet.no_daftar||''} onChange={e=>setEditAtlet(f=>({...f,no_daftar:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={editAtlet.nama_murid} onChange={e=>setEditAtlet(f=>({...f,nama_murid:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kelas</label><input className="form-input" value={editAtlet.kelas||''} onChange={e=>setEditAtlet(f=>({...f,kelas:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jawatan</label><select className="form-input" value={editAtlet.jawatan} onChange={e=>setEditAtlet(f=>({...f,jawatan:e.target.value}))}>{JWTN_SUKAN.map(j=><option key={j}>{j}</option>)}</select></div>
            </div>
            <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editAtlet.status} onChange={e=>setEditAtlet(f=>({...f,status:e.target.value}))}><option>Aktif</option><option>Tidak Aktif</option></select></div>
            <button className="btn-primary" type="submit">💾 Simpan</button>
          </form></Modal>}
        </div>)}

        {/* SUB-TAB 2: REKOD LATIHAN */}
        {subtab===2&&(<div>
          <SukanPill/>
          {!selectedId?<NoSelection/>:(<>
            <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
              <span style={{fontWeight:900,fontSize:14,flex:1}}>{selectedSukan?.nama} — Rekod Latihan/Pertandingan</span>
              <span className={`badge ${latihanCount(selectedId)>=(selectedSukan?.min_latihan||10)?'b-green':'b-red'}`}>{latihanCount(selectedId)}/{selectedSukan?.min_latihan||10} sesi</span>
              <button className="btn-add" onClick={()=>{setFormLat(blankLat);setShowAddLat(true)}}>+ Tambah</button>
            </div>
            <div className="kur-table-wrap"><table className="kur-table">
              <thead><tr><th>#</th><th>Tarikh</th><th>Jenis</th><th>Lawan/Aktiviti</th><th>Lokasi</th><th>Hadir</th><th>Guru</th><th></th></tr></thead>
              <tbody>{latihanBySukan(selectedId).map((l,i)=>(
                <tr key={l.id}>
                  <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                  <td style={{fontWeight:800}}>{l.tarikh}</td>
                  <td><span className={`badge ${l.jenis==='Pertandingan'?'b-blue':'b-green'}`}>{l.jenis}</span></td>
                  <td>{l.lawan||l.aktiviti}</td>
                  <td style={{fontSize:12,color:'var(--text3)'}}>{l.lokasi}</td>
                  <td><span className="badge b-blue">{l.hadir}</span></td>
                  <td style={{fontSize:12}}>{l.guru_hadir}</td>
                  <td style={{display:'flex',gap:4}}>
                    <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditLat({...l})}>✏️</button>
                    <button className="btn-del" onClick={()=>handleDelLat(l.id)}>🗑</button>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          </>)}
          {showAddLat&&<Modal title="Tambah Rekod Latihan/Pertandingan" onClose={()=>setShowAddLat(false)}><form onSubmit={handleAddLat}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" type="date" required value={formLat.tarikh} onChange={e=>setFormLat(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jenis</label><select className="form-input" value={formLat.jenis} onChange={e=>setFormLat(f=>({...f,jenis:e.target.value}))}><option>Latihan</option><option>Pertandingan</option></select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Lawan/Pasukan</label><input className="form-input" value={formLat.lawan} onChange={e=>setFormLat(f=>({...f,lawan:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Aktiviti</label><input className="form-input" value={formLat.aktiviti} onChange={e=>setFormLat(f=>({...f,aktiviti:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" value={formLat.lokasi} onChange={e=>setFormLat(f=>({...f,lokasi:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Hadir</label><input className="form-input" type="number" min="0" value={formLat.hadir} onChange={e=>setFormLat(f=>({...f,hadir:+e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Guru Hadir</label><select className="form-input" value={formLat.guru_hadir} onChange={e=>setFormLat(f=>({...f,guru_hadir:e.target.value}))}><option value="">-</option>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
            </div>
            <div className="form-field"><label className="form-label">Catatan</label><textarea className="form-input" rows={2} value={formLat.catatan} onChange={e=>setFormLat(f=>({...f,catatan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form></Modal>}
          {editLat&&<Modal title="Edit Rekod" onClose={()=>setEditLat(null)}><form onSubmit={handleEditLat}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" type="date" required value={editLat.tarikh} onChange={e=>setEditLat(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Jenis</label><select className="form-input" value={editLat.jenis||'Latihan'} onChange={e=>setEditLat(f=>({...f,jenis:e.target.value}))}><option>Latihan</option><option>Pertandingan</option></select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Lawan/Pasukan</label><input className="form-input" value={editLat.lawan||''} onChange={e=>setEditLat(f=>({...f,lawan:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Aktiviti</label><input className="form-input" value={editLat.aktiviti||''} onChange={e=>setEditLat(f=>({...f,aktiviti:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Lokasi</label><input className="form-input" value={editLat.lokasi||''} onChange={e=>setEditLat(f=>({...f,lokasi:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Hadir</label><input className="form-input" type="number" min="0" value={editLat.hadir||0} onChange={e=>setEditLat(f=>({...f,hadir:+e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Guru Hadir</label><select className="form-input" value={editLat.guru_hadir||''} onChange={e=>setEditLat(f=>({...f,guru_hadir:e.target.value}))}><option value="">-</option>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
            </div>
            <div className="form-field"><label className="form-label">Catatan</label><textarea className="form-input" rows={2} value={editLat.catatan||''} onChange={e=>setEditLat(f=>({...f,catatan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">💾 Simpan</button>
          </form></Modal>}
        </div>)}

        {/* SUB-TAB 3: PENILAIAN PAJSK */}
        {subtab===3&&(<div>
          <SukanPill/>
          {!selectedId?<NoSelection/>:(<>
            <div style={{marginBottom:12,fontWeight:900,fontSize:14}}>{selectedSukan?.nama} — Penilaian PAJSK</div>
            <div className="kur-table-wrap"><table className="kur-table">
              <thead><tr><th>#</th><th>Nama</th><th>Kelas</th><th>Jawatan</th><th>Jwtn(10)</th><th>Hadr(40)</th><th>Prgkt(20)</th><th>Pcpn(20)</th><th>Ktmn(10)</th><th>Khdmt(10)</th><th>Jumlah</th><th>Gred</th><th></th></tr></thead>
              <tbody>{atletBySukan(selectedId).map((a,i)=>{
                const rec=pajskBySukan(selectedId).find(p=>p.atlet_id===a.id);
                const r=rec?computePAJSKSukan(rec):null;
                return(<tr key={a.id}>
                  <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                  <td style={{fontWeight:800}}>{a.nama_murid}</td>
                  <td>{a.kelas}</td>
                  <td><span className="badge b-blue" style={{fontSize:10}}>{a.jawatan}</span></td>
                  {r?(<>
                    <td style={{textAlign:'center'}}>{r.mJ}</td><td style={{textAlign:'center'}}>{r.mK}</td>
                    <td style={{textAlign:'center'}}>{r.mP}</td><td style={{textAlign:'center'}}>{r.mC}</td>
                    <td style={{textAlign:'center'}}>{r.mKo}</td><td style={{textAlign:'center'}}>{r.mKh}</td>
                    <td style={{textAlign:'center',fontWeight:900}}>{r.total}</td>
                    <td><span className={`badge ${r.gred==='A'?'b-green':r.gred==='B'?'b-blue':r.gred==='C'?'b-yellow':'b-red'}`}>{r.gred}</span></td>
                  </>):(<><td colSpan={7} style={{color:'var(--text3)',fontSize:12,textAlign:'center'}}>— Belum ada markah —</td><td></td></>)}
                  <td><button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditPajsk(rec?{...rec}:{...blankPajsk,atlet_id:a.id,nama_murid:a.nama_murid,kelas:a.kelas,jawatan:a.jawatan,sukan_id:selectedId})}>✏️</button></td>
                </tr>);
              })}</tbody>
            </table></div>
          </>)}
          {editPajsk&&<Modal title={`Markah PAJSK — ${editPajsk.nama_murid}`} onClose={()=>setEditPajsk(null)}>
            <form onSubmit={handleSavePajsk}>
              <div className="form-field"><label className="form-label">Jawatan</label><select className="form-input" value={editPajsk.jawatan||'Ahli Biasa'} onChange={e=>setEditPajsk(f=>({...f,jawatan:e.target.value}))}>{JWTN_SUKAN.map(j=><option key={j}>{j}</option>)}</select></div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Kehadiran (hadir)</label><input className="form-input" type="number" min="0" value={editPajsk.kehadiran_hadir||0} onChange={e=>setEditPajsk(f=>({...f,kehadiran_hadir:+e.target.value}))}/></div>
                <div className="form-field"><label className="form-label">Kehadiran (jumlah)</label><input className="form-input" type="number" min="1" value={editPajsk.kehadiran_total||10} onChange={e=>setEditPajsk(f=>({...f,kehadiran_total:+e.target.value}))}/></div>
              </div>
              <div className="form-field"><label className="form-label">Peringkat Pertandingan</label><select className="form-input" value={editPajsk.peringkat} onChange={e=>setEditPajsk(f=>({...f,peringkat:e.target.value}))}>{Object.keys(PRGKT_MK).map(p=><option key={p}>{p}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Pencapaian Tertinggi</label><select className="form-input" value={editPajsk.pencapaian} onChange={e=>setEditPajsk(f=>({...f,pencapaian:e.target.value}))}>{Object.keys(PENCPN_MK).map(p=><option key={p}>{p}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Komitmen (1-4)</label><select className="form-input" value={editPajsk.komitmen} onChange={e=>setEditPajsk(f=>({...f,komitmen:+e.target.value}))}>{[1,2,3,4].map(n=><option key={n} value={n}>{n} — {KMTMN_MK[n]} markah</option>)}</select></div>
              <div className="form-field"><label className="form-label">Khidmat Masyarakat</label><select className="form-input" value={editPajsk.khidmat} onChange={e=>setEditPajsk(f=>({...f,khidmat:e.target.value}))}>{Object.keys(KHDMT_MK).map(k=><option key={k}>{k}</option>)}</select></div>
              {(()=>{const r=computePAJSKSukan(editPajsk);return(
                <div style={{background:'var(--surface)',border:'2px solid var(--border)',borderRadius:10,padding:'10px 14px',marginTop:8}}>
                  <div style={{fontWeight:900,fontSize:12,marginBottom:6}}>Pratonton Markah</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,fontSize:11}}>
                    <span>Jawatan: <b>{r.mJ}</b></span><span>Kehadiran: <b>{r.mK}</b></span><span>Peringkat: <b>{r.mP}</b></span>
                    <span>Pencapaian: <b>{r.mC}</b></span><span>Komitmen: <b>{r.mKo}</b></span><span>Khidmat: <b>{r.mKh}</b></span>
                  </div>
                  <div style={{marginTop:8,fontWeight:900,fontSize:16,color:'var(--accent)'}}>Jumlah: {r.total}/110 — Gred {r.gred}</div>
                </div>
              );})()}
              <button className="btn-primary" type="submit" style={{marginTop:10}}>💾 Simpan Markah</button>
            </form>
          </Modal>}
        </div>)}

      </>)}
    </KurPage>
  );
}

function PAJSKPage() {
  const TABS_PAJSK=['📋 Rekod PAJSK','📊 Analisis','🏆 Ranking'];
  const [subtab,setSubtab]=useState(0);
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [viewItem,setViewItem]=useState(null);
  const [filterKelas,setFilterKelas]=useState('');
  const [q,setQ]=useState('');
  const tahunNow=new Date().getFullYear().toString();
  const blank={nama_murid:'',kelas:'',m_kelab:0,m_uniform:0,m_sukan:0,catatan:'',tahun:tahunNow};
  const [form,setForm]=useState(blank);
  const load=async()=>{setLoading(true);const{data:d}=await supabase.from('koku_pajsk_ringkasan').select('*').neq('status','PADAM').order('nama_murid');setData(d||[]);setLoading(false);};
  useEffect(()=>{load();},[]);
  const handleAdd=async e=>{
    e.preventDefault();const jumlah=form.m_kelab+form.m_uniform+form.m_sukan;
    const ok=await dbRun(()=>supabase.from('koku_pajsk_ringkasan').insert([{...form,jumlah,gred:gradeOPR(jumlah)}]));
    if(!ok)return;toast('Ditambah!','success');setShowAdd(false);setForm(blank);load();
  };
  const handleEdit=async e=>{
    e.preventDefault();const{id,created_at,...rest}=editItem;
    const jumlah=rest.m_kelab+rest.m_uniform+rest.m_sukan;
    const ok=await dbRun(()=>supabase.from('koku_pajsk_ringkasan').update({...rest,jumlah,gred:gradeOPR(jumlah)}).eq('id',id));
    if(!ok)return;toast('Dikemaskini!','success');setEditItem(null);load();
  };
  const handleDel=async id=>{const ok=await dbRun(()=>supabase.from('koku_pajsk_ringkasan').update({status:'PADAM'}).eq('id',id));if(ok){setData(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}};
  const gc={A:'b-green',B:'b-blue',C:'b-yellow',D:'b-red',E:'b-red'};
  const filtered=data.filter(d=>(!filterKelas||d.kelas===filterKelas)&&(!q||d.nama_murid.toLowerCase().includes(q.toLowerCase())));

  // Analisis: grade distribution per kelas
  const byKelasGred={};
  data.forEach(d=>{
    if(!byKelasGred[d.kelas])byKelasGred[d.kelas]={kelas:d.kelas,A:0,B:0,C:0,D:0,E:0,total:0,sumJml:0};
    byKelasGred[d.kelas][d.gred]=(byKelasGred[d.kelas][d.gred]||0)+1;
    byKelasGred[d.kelas].total+=1; byKelasGred[d.kelas].sumJml+=(d.jumlah||0);
  });
  const analisisRows=Object.values(byKelasGred).sort((a,b)=>a.kelas.localeCompare(b.kelas));

  return(
    <KurPage title="PAJSK" sub="Kokurikulum · SK Darau"
      stats={[{ico:'🏅',val:data.length,lbl:'Murid Dinilai'},{ico:'⭐',val:data.filter(d=>d.gred==='A').length,lbl:'Gred A'},{ico:'📊',val:data.length?Math.round(data.reduce((s,d)=>s+d.jumlah,0)/data.length):0,lbl:'Purata Jumlah'},{ico:'🎯',val:30,lbl:'Markah Penuh'}]}>
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {TABS_PAJSK.map((t,i)=><button key={i} onClick={()=>setSubtab(i)}
          style={{padding:'7px 14px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,
            background:subtab===i?'var(--primary)':'var(--surface2)',color:subtab===i?'#fff':'var(--text2)',transition:'all .15s'}}>{t}</button>)}
      </div>
      {loading?<div className="loading">⏳ Memuatkan…</div>:(<>

        {/* TAB 0 */}
        {subtab===0&&(<>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12,alignItems:'center'}}>
            <input className="kur-search" placeholder="Cari nama murid…" value={q} onChange={e=>setQ(e.target.value)} style={{flex:1,minWidth:150}}/>
            <select className="kur-select" value={filterKelas} onChange={e=>setFilterKelas(e.target.value)}><option value="">Semua Kelas</option>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}</select>
            <button className="btn-add" onClick={()=>{setForm(blank);setShowAdd(true)}}>+ Tambah Murid</button>
          </div>
          <div className="kur-table-wrap"><table className="kur-table">
            <thead>
              <tr><th rowSpan="2">#</th><th rowSpan="2">Nama Murid</th><th rowSpan="2">Kelas</th><th style={{background:'#eff6ff'}}>A — Kelab</th><th style={{background:'#f0fdf4'}}>B — Uniform</th><th style={{background:'#fefce8'}}>C — Sukan</th><th rowSpan="2">Jml(30)</th><th rowSpan="2">Gred</th><th rowSpan="2">Catatan</th><th rowSpan="2"></th></tr>
              <tr><th style={{background:'#eff6ff',fontSize:10}}>/10</th><th style={{background:'#f0fdf4',fontSize:10}}>/10</th><th style={{background:'#fefce8',fontSize:10}}>/10</th></tr>
            </thead>
            <tbody>{filtered.map((p,i)=>(
              <tr key={p.id}>
                <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                <td style={{fontWeight:800}}>{p.nama_murid}</td><td style={{fontSize:12}}>{p.kelas}</td>
                <td style={{fontWeight:700,color:'#2563eb'}}>{p.m_kelab}</td>
                <td style={{fontWeight:700,color:'#16a34a'}}>{p.m_uniform}</td>
                <td style={{fontWeight:700,color:'#d97706'}}>{p.m_sukan}</td>
                <td style={{fontWeight:800,fontSize:15}}>{p.jumlah}</td>
                <td><span className={`badge ${gc[p.gred]||'b-gray'}`}>{p.gred}</span></td>
                <td style={{color:'var(--text2)',fontSize:12}}>{p.catatan||'—'}</td>
                <td style={{display:'flex',gap:4}}>
                  <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
                  <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
          {showAdd&&<Modal title="Tambah Rekod PAJSK" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={form.nama_murid} onChange={e=>setForm(f=>({...f,nama_murid:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><select className="form-input" value={form.kelas} onChange={e=>setForm(f=>({...f,kelas:e.target.value}))}><option value="">-</option>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}</select></div>
            </div>
            <p style={{fontSize:12,color:'var(--text2)',margin:'4px 0 8px'}}>Markah 0–10 setiap komponen. Jumlah maks = 30.</p>
            <div className="form-row">
              <div className="form-field"><label className="form-label">A — Kelab (/10)</label><input className="form-input" type="number" min="0" max="10" value={form.m_kelab} onChange={e=>setForm(f=>({...f,m_kelab:+e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">B — Uniform (/10)</label><input className="form-input" type="number" min="0" max="10" value={form.m_uniform} onChange={e=>setForm(f=>({...f,m_uniform:+e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">C — Sukan (/10)</label><input className="form-input" type="number" min="0" max="10" value={form.m_sukan} onChange={e=>setForm(f=>({...f,m_sukan:+e.target.value}))}/></div>
            </div>
            <p style={{fontSize:13,fontWeight:700,marginBottom:8}}>Jumlah: {form.m_kelab+form.m_uniform+form.m_sukan}/30 — Gred: {gradeOPR(form.m_kelab+form.m_uniform+form.m_sukan)}</p>
            <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={form.catatan} onChange={e=>setForm(f=>({...f,catatan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form></Modal>}
          {editItem&&<Modal title={`Edit — ${editItem.nama_murid}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Nama Murid</label><input className="form-input" required value={editItem.nama_murid} onChange={e=>setEditItem(f=>({...f,nama_murid:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Kelas</label><select className="form-input" value={editItem.kelas} onChange={e=>setEditItem(f=>({...f,kelas:e.target.value}))}><option value="">-</option>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">A — Kelab (/10)</label><input className="form-input" type="number" min="0" max="10" value={editItem.m_kelab} onChange={e=>setEditItem(f=>({...f,m_kelab:+e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">B — Uniform (/10)</label><input className="form-input" type="number" min="0" max="10" value={editItem.m_uniform} onChange={e=>setEditItem(f=>({...f,m_uniform:+e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">C — Sukan (/10)</label><input className="form-input" type="number" min="0" max="10" value={editItem.m_sukan} onChange={e=>setEditItem(f=>({...f,m_sukan:+e.target.value}))}/></div>
            </div>
            <p style={{fontSize:13,fontWeight:700,marginBottom:8}}>Jumlah: {editItem.m_kelab+editItem.m_uniform+editItem.m_sukan}/30 — Gred: {gradeOPR(editItem.m_kelab+editItem.m_uniform+editItem.m_sukan)}</p>
            <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={editItem.catatan} onChange={e=>setEditItem(f=>({...f,catatan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">💾 Simpan</button>
          </form></Modal>}
        </>)}

        {/* TAB 1: ANALISIS */}
        {subtab===1&&(<>
          {analisisRows.length===0?<div style={{textAlign:'center',padding:60,color:'var(--text3)'}}>Tiada data. Tambah rekod PAJSK dahulu.</div>:(
            <div className="kur-table-wrap"><table className="kur-table">
              <thead><tr><th>Kelas</th><th>Bil Murid</th><th>Purata(/30)</th><th style={{color:'#16a34a'}}>A</th><th style={{color:'#2563eb'}}>B</th><th style={{color:'#d97706'}}>C</th><th style={{color:'#ea580c'}}>D</th><th style={{color:'#dc2626'}}>E</th><th>Status Kelas</th></tr></thead>
              <tbody>{analisisRows.map(r=>{
                const purata=r.total?(r.sumJml/r.total).toFixed(1):0;
                const pctA=r.total?((r.A/r.total)*100).toFixed(0):0;
                const stat=Number(pctA)>=60?'🟢 Cemerlang':Number(pctA)>=30?'🟡 Sederhana':'🔴 Perlu Tingkat';
                return(<tr key={r.kelas}>
                  <td style={{fontWeight:800}}>{r.kelas}</td><td>{r.total}</td>
                  <td style={{fontWeight:800,color:'var(--primary)'}}>{purata}</td>
                  <td style={{fontWeight:700,color:'#16a34a'}}>{r.A}</td><td style={{fontWeight:700,color:'#2563eb'}}>{r.B}</td>
                  <td style={{fontWeight:700,color:'#d97706'}}>{r.C}</td><td style={{fontWeight:700,color:'#ea580c'}}>{r.D}</td>
                  <td style={{fontWeight:700,color:'#dc2626'}}>{r.E||0}</td>
                  <td style={{fontWeight:700,fontSize:12}}>{stat}</td>
                </tr>);
              })}</tbody>
            </table></div>
          )}
        </>)}

        {/* TAB 2: RANKING */}
        {subtab===2&&(<>
          {data.length===0?<div style={{textAlign:'center',padding:60,color:'var(--text3)'}}>Tiada data rekod PAJSK.</div>:(
            <div className="kur-table-wrap"><table className="kur-table">
              <thead><tr><th>Kedudukan</th><th>Nama Murid</th><th>Kelas</th><th>A-Kelab</th><th>B-Uniform</th><th>C-Sukan</th><th>Jumlah(/30)</th><th>Gred</th></tr></thead>
              <tbody>{[...data].sort((a,b)=>b.jumlah-a.jumlah).slice(0,30).map((p,i)=>{
                const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
                return(<tr key={p.id} style={{background:i<3?'var(--surface2)':''}}>
                  <td style={{fontWeight:800,fontSize:15,color:i===0?'#ca8a04':i===1?'#64748b':i===2?'#b45309':'var(--text3)'}}>{medal} {i+1}</td>
                  <td style={{fontWeight:800}}>{p.nama_murid}</td>
                  <td style={{color:'var(--text2)'}}>{p.kelas}</td>
                  <td style={{color:'#2563eb',fontWeight:700}}>{p.m_kelab}</td>
                  <td style={{color:'#16a34a',fontWeight:700}}>{p.m_uniform}</td>
                  <td style={{color:'#d97706',fontWeight:700}}>{p.m_sukan}</td>
                  <td style={{fontWeight:900,fontSize:15,color:'var(--primary)'}}>{p.jumlah}</td>
                  <td><span className={`badge ${gc[p.gred]||'b-gray'}`}>{p.gred}</span></td>
                </tr>);
              })}</tbody>
            </table></div>
          )}
        </>)}

      </>)}
    </KurPage>
  );
}

// jawatan options per category
const JAWATAN_KELAB    = ['Ahli Biasa','AJK','Naib Pengerusi','Pengerusi'];
const JAWATAN_UNIFORM  = ['Ahli','Penolong Ketua Pasukan','Ketua Pasukan'];
const JAWATAN_SUKAN    = ['Ahli','Kapten','Jurulatih'];
const GRED_COLOR       = { A:'b-green', B:'b-blue', C:'b-yellow', D:'b-red', E:'b-red' };

// jawatan contributes bonus mark (0–2) on top of base markah
function jawatanBonus(j, opts) {
  const idx = opts.indexOf(j);
  if (idx <= 0) return 0;
  if (idx === 1) return 1;
  return 2;
}

// Module-level — must NOT be inside ProfilMuridKoku (inner component = unmount on every render = lost focus)
function ProfilFormFields({ val, set, tahunNow }) {
  return (<>
    <div className="form-row">
      <div className="form-field"><label className="form-label">No. Daftar</label><input className="form-input" value={val.no_daftar||''} onChange={e=>set(f=>({...f,no_daftar:e.target.value}))}/></div>
      <div className="form-field"><label className="form-label">Nama Murid *</label><input className="form-input" required value={val.nama||''} onChange={e=>set(f=>({...f,nama:e.target.value}))}/></div>
    </div>
    <div className="form-row">
      <div className="form-field"><label className="form-label">Kelas</label>
        <select className="form-input" value={val.kelas||''} onChange={e=>set(f=>({...f,kelas:e.target.value}))}>
          <option value="">—</option>{KELAS_LIST.map(k=><option key={k}>{k}</option>)}
        </select>
      </div>
      <div className="form-field"><label className="form-label">Tahun</label>
        <select className="form-input" value={val.tahun||tahunNow} onChange={e=>set(f=>({...f,tahun:e.target.value}))}>
          {['2023','2024','2025','2026'].map(y=><option key={y}>{y}</option>)}
        </select>
      </div>
    </div>
    <div style={{background:'var(--accent-lt)', borderRadius:10, padding:'10px 12px', marginBottom:10}}>
      <div style={{fontWeight:900, fontSize:11, color:'var(--accent)', marginBottom:8, letterSpacing:'0.06em'}}>🏛️ KELAB / PERSATUAN</div>
      <div className="form-field"><label className="form-label">Nama Kelab/Persatuan</label><input className="form-input" value={val.kelab||''} onChange={e=>set(f=>({...f,kelab:e.target.value}))}/></div>
      <div className="form-row">
        <div className="form-field"><label className="form-label">Jawatan</label>
          <select className="form-input" value={val.jawatan_kelab||'Ahli Biasa'} onChange={e=>set(f=>({...f,jawatan_kelab:e.target.value}))}>
            {JAWATAN_KELAB.map(j=><option key={j}>{j}</option>)}
          </select>
        </div>
        <div className="form-field"><label className="form-label">Markah (/10)</label>
          <input className="form-input" type="number" min="0" max="10" value={val.m_kelab??5} onChange={e=>set(f=>({...f,m_kelab:+e.target.value}))}/>
        </div>
      </div>
    </div>
    <div style={{background:'#f0fdf4', borderRadius:10, padding:'10px 12px', marginBottom:10}}>
      <div style={{fontWeight:900, fontSize:11, color:'#15803d', marginBottom:8, letterSpacing:'0.06em'}}>🎖️ BADAN BERUNIFORM</div>
      <div className="form-field"><label className="form-label">Nama Badan Beruniform</label><input className="form-input" value={val.uniform||''} onChange={e=>set(f=>({...f,uniform:e.target.value}))}/></div>
      <div className="form-row">
        <div className="form-field"><label className="form-label">Pangkat/Jawatan</label>
          <select className="form-input" value={val.pangkat_uniform||'Ahli'} onChange={e=>set(f=>({...f,pangkat_uniform:e.target.value}))}>
            {JAWATAN_UNIFORM.map(j=><option key={j}>{j}</option>)}
          </select>
        </div>
        <div className="form-field"><label className="form-label">Markah (/10)</label>
          <input className="form-input" type="number" min="0" max="10" value={val.m_uniform??5} onChange={e=>set(f=>({...f,m_uniform:+e.target.value}))}/>
        </div>
      </div>
    </div>
    <div style={{background:'#fffbeb', borderRadius:10, padding:'10px 12px', marginBottom:10}}>
      <div style={{fontWeight:900, fontSize:11, color:'#b45309', marginBottom:8, letterSpacing:'0.06em'}}>⚽ SUKAN & PERMAINAN</div>
      <div className="form-field"><label className="form-label">Jenis Sukan/Permainan</label><input className="form-input" value={val.sukan||''} onChange={e=>set(f=>({...f,sukan:e.target.value}))}/></div>
      <div className="form-row">
        <div className="form-field"><label className="form-label">Jawatan</label>
          <select className="form-input" value={val.jawatan_sukan||'Ahli'} onChange={e=>set(f=>({...f,jawatan_sukan:e.target.value}))}>
            {JAWATAN_SUKAN.map(j=><option key={j}>{j}</option>)}
          </select>
        </div>
        <div className="form-field"><label className="form-label">Markah (/10)</label>
          <input className="form-input" type="number" min="0" max="10" value={val.m_sukan??5} onChange={e=>set(f=>({...f,m_sukan:+e.target.value}))}/>
        </div>
      </div>
    </div>
    <div className="form-field"><label className="form-label">Catatan</label>
      <input className="form-input" placeholder="Catatan tambahan (jika ada)" value={val.catatan||''} onChange={e=>set(f=>({...f,catatan:e.target.value}))}/>
    </div>
  </>);
}

function ProfilMuridKoku() {
  const [subtab, setSubtab]         = useState(0);
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [q, setQ]                   = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());
  const [filterGred, setFilterGred]   = useState('');
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const tahunNow = new Date().getFullYear().toString();
  const blank = {
    no_daftar:'', nama:'', kelas:'', tahun:tahunNow,
    kelab:'', jawatan_kelab:'Ahli Biasa', m_kelab:5,
    uniform:'', pangkat_uniform:'Ahli',   m_uniform:5,
    sukan:'',  jawatan_sukan:'Ahli',       m_sukan:5,
    catatan:'', status:'Aktif',
  };
  const [form, setForm] = useState(blank);

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from('koku_profil_murid').select('*')
      .neq('status','PADAM').order('kelas').order('nama');
    setData(rows || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await dbRun(() => supabase.from('koku_profil_murid').insert([form]));
    if (!ok) return;
    toast('Profil ditambah!', 'success'); setShowAdd(false); setForm(blank); load();
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    const { id, created_at, ...rest } = editItem;
    const ok = await dbRun(() => supabase.from('koku_profil_murid').update(rest).eq('id', id));
    if (!ok) return;
    toast('Dikemaskini!', 'success'); setEditItem(null); load();
  };
  const handleDel = async (id) => {
    const ok = await dbRun(() => supabase.from('koku_profil_murid').update({ status:'PADAM' }).eq('id', id));
    if (ok) { setData(d => d.filter(r => r.id !== id)); toast('Dipadam.', 'success'); }
  };

  // computed
  const jumlah = r => (r.m_kelab||0) + (r.m_uniform||0) + (r.m_sukan||0);

  const filtered = data.filter(r =>
    (!filterTahun  || r.tahun === filterTahun) &&
    (!filterKelas  || r.kelas === filterKelas) &&
    (!filterGred   || gradeOPR(jumlah(r)) === filterGred) &&
    (!q || r.nama.toLowerCase().includes(q.toLowerCase()) || (r.no_daftar||'').toLowerCase().includes(q.toLowerCase()))
  );

  // stats
  const aGred   = data.filter(r => gradeOPR(jumlah(r)) === 'A').length;
  const bGred   = data.filter(r => gradeOPR(jumlah(r)) === 'B').length;
  const lengkap = data.filter(r => r.kelab && r.uniform && r.sukan).length;
  const avgMark = data.length ? (data.reduce((s,r) => s + jumlah(r), 0) / data.length).toFixed(1) : 0;

  // kelas coverage for statistik tab
  const kelasCoverage = KELAS_LIST.map(k => {
    const yr = data.filter(r => r.kelas === k && r.tahun === filterTahun);
    const grads = { A:0, B:0, C:0, D:0, E:0 };
    yr.forEach(r => { grads[gradeOPR(jumlah(r))]++; });
    return { kelas:k, total:yr.length, grads };
  }).filter(c => c.total > 0);

  const gradeDist = ['A','B','C','D','E'].map(g => ({
    gred: g,
    count: data.filter(r => r.tahun === filterTahun && gradeOPR(jumlah(r)) === g).length,
    color: g==='A'?'#22c55e': g==='B'?'#3b82f6': g==='C'?'#f59e0b': '#ef4444',
  }));
  const distMax = Math.max(...gradeDist.map(g => g.count), 1);

  const subTabStyle = (i) => ({
    padding:'7px 14px', borderRadius:9, fontWeight:900, fontSize:12, cursor:'pointer',
    border:'2.5px solid', fontFamily:"'Inter',sans-serif",
    background: subtab===i ? 'var(--accent)' : 'var(--surface)',
    borderColor: subtab===i ? 'var(--accent)' : 'var(--border)',
    color: subtab===i ? '#fff' : 'var(--text)', transition:'all 0.15s',
  });

  const statsCards = [
    { ico:'👦', val:data.length,  lbl:'Jumlah Rekod' },
    { ico:'⭐', val:aGred,        lbl:'Gred A' },
    { ico:'📊', val:avgMark,      lbl:'Purata Markah' },
    { ico:'✅', val:lengkap,      lbl:'Profil Lengkap' },
  ];

  return (
    <KurPage title="Profil Murid Kokurikulum" sub="Kokurikulum · SK Darau" stats={statsCards}>

      {/* Sub-tab strip */}
      <div style={{display:'flex', gap:6, marginBottom:16, flexWrap:'wrap'}}>
        <button style={subTabStyle(0)} onClick={() => setSubtab(0)}>📋 Senarai Murid</button>
        <button style={subTabStyle(1)} onClick={() => setSubtab(1)}>📊 Statistik</button>
      </div>

      {loading ? <div className="loading">⏳ Memuatkan…</div> : (<>

        {/* ── SUBTAB 0: SENARAI ── */}
        {subtab === 0 && (
          <div>
            {/* Top toolbar — row 1: add + search */}
            <div style={{display:'flex', gap:8, marginBottom:8, flexWrap:'wrap'}}>
              <button className="btn-add" style={{whiteSpace:'nowrap'}} onClick={() => { setForm(blank); setShowAdd(true); }}>+ Tambah Profil</button>
              <div className="kur-search-wrap" style={{flex:1, minWidth:140}}>
                <span className="kur-search-ico">🔍</span>
                <input className="kur-search" placeholder="Cari nama / no. daftar…" value={q} onChange={e=>setQ(e.target.value)}/>
              </div>
            </div>
            {/* row 2: filters */}
            <div style={{display:'flex', gap:8, marginBottom:10, flexWrap:'wrap'}}>
              <select className="kur-select" style={{flex:1, minWidth:90}} value={filterTahun} onChange={e=>setFilterTahun(e.target.value)}>
                {['2023','2024','2025','2026'].map(y=><option key={y}>{y}</option>)}
              </select>
              <select className="kur-select" style={{flex:1, minWidth:110}} value={filterGred} onChange={e=>setFilterGred(e.target.value)}>
                <option value="">Semua Gred</option>
                {['A','B','C','D','E'].map(g=><option key={g}>{g}</option>)}
              </select>
            </div>

            {/* Kelas pill selector */}
            <div style={{background:'var(--surface)', border:'2px solid var(--border)', borderRadius:12, padding:'10px 12px', marginBottom:12}}>
              <button
                onClick={() => setFilterKelas('')}
                style={{
                  padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:900,
                  border:'2px solid', cursor:'pointer', marginBottom:8, marginRight:6,
                  fontFamily:"'Inter',sans-serif", transition:'all 0.15s',
                  background: filterKelas==='' ? 'var(--accent)' : 'var(--surface)',
                  borderColor: filterKelas==='' ? 'var(--accent)' : 'var(--border)',
                  color: filterKelas==='' ? '#fff' : 'var(--text)',
                }}>
                Semua ({data.length})
              </button>
              {[1,2,3,4,5,6].map(t => {
                const suffix = ['Unik','Aplikasi','Revolusi','Aspirasi','Dedikasi'];
                return (
                  <div key={t} style={{display:'flex', alignItems:'center', gap:5, flexWrap:'wrap', marginBottom:5}}>
                    <span style={{fontSize:10, fontWeight:900, color:'var(--text3)', minWidth:42, letterSpacing:'0.04em'}}>THN {t}</span>
                    {suffix.map(s => {
                      const k = `Tahun ${t} ${s}`;
                      const cnt = data.filter(r => r.kelas === k).length;
                      const active = filterKelas === k;
                      return (
                        <button key={k} onClick={() => setFilterKelas(active ? '' : k)} style={{
                          padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:800,
                          border:'2px solid', cursor:'pointer', fontFamily:"'Inter',sans-serif",
                          transition:'all 0.12s',
                          background: active ? 'var(--accent)' : 'var(--surface)',
                          borderColor: active ? 'var(--accent)' : 'var(--border)',
                          color: active ? '#fff' : cnt===0 ? 'var(--text3)' : 'var(--text)',
                          opacity: cnt===0 ? 0.45 : 1,
                        }}>
                          {s}{cnt > 0 && <span style={{opacity:0.7, fontSize:9}}> ({cnt})</span>}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Card list on mobile, table on desktop */}
            {filtered.length === 0 && (
              <div style={{textAlign:'center', padding:32, color:'var(--text3)', fontSize:14}}>Tiada rekod. Tambah profil murid.</div>
            )}

            {isMobile ? (
              <div>
                {filtered.map((r, i) => {
                  const j = jumlah(r); const g = gradeOPR(j);
                  return (
                    <div key={r.id} className="murid-card">
                      <div className="murid-card-row">
                        <div style={{flex:1}}>
                          <div style={{fontWeight:900, fontSize:14}}>{r.nama}</div>
                          {r.no_daftar && <div style={{fontSize:10, color:'var(--text3)', fontFamily:'monospace'}}>{r.no_daftar}</div>}
                          <div style={{fontSize:11, color:'var(--text2)', marginTop:2}}>{r.kelas} · {r.tahun}</div>
                        </div>
                        <div style={{textAlign:'center', minWidth:52}}>
                          <div style={{fontWeight:900, fontSize:20, lineHeight:1}}>{j}<span style={{fontSize:10, color:'var(--text3)'}}>/30</span></div>
                          <span className={`badge ${GRED_COLOR[g]||'b-gray'}`} style={{fontSize:12, marginTop:4, display:'inline-block'}}>{g}</span>
                        </div>
                      </div>
                      <div className="murid-card-acts">
                        <div className="murid-card-act">
                          <div className="murid-card-act-label">🏛️ Kelab</div>
                          <div className="murid-card-act-name">{r.kelab||'—'}</div>
                          <div className="murid-card-act-mark">{r.m_kelab??0}/10</div>
                        </div>
                        <div className="murid-card-act">
                          <div className="murid-card-act-label">🎖️ Uniform</div>
                          <div className="murid-card-act-name">{r.uniform||'—'}</div>
                          <div className="murid-card-act-mark">{r.m_uniform??0}/10</div>
                        </div>
                        <div className="murid-card-act">
                          <div className="murid-card-act-label">⚽ Sukan</div>
                          <div className="murid-card-act-name">{r.sukan||'—'}</div>
                          <div className="murid-card-act-mark">{r.m_sukan??0}/10</div>
                        </div>
                      </div>
                      <div style={{display:'flex', gap:6, justifyContent:'flex-end'}}>
                        <button className="btn-add" style={{padding:'6px 14px', fontSize:12}} onClick={() => setEditItem({...r})}>✏️ Edit</button>
                        <button className="btn-del" style={{padding:'6px 10px', fontSize:12}} onClick={() => handleDel(r.id)}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="kur-table-wrap">
                <table className="kur-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Nama</th><th>Kelas</th>
                      <th>Kelab / Jawatan</th>
                      <th>Uniform / Pangkat</th>
                      <th>Sukan / Jawatan</th>
                      <th>Jml</th><th>Gred</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => {
                      const j = jumlah(r);
                      const g = gradeOPR(j);
                      return (
                        <tr key={r.id}>
                          <td style={{color:'var(--text3)', fontWeight:800}}>{i+1}</td>
                          <td>
                            <div style={{fontWeight:800}}>{r.nama}</div>
                            {r.no_daftar && <div style={{fontSize:10, color:'var(--text3)', fontFamily:'monospace'}}>{r.no_daftar}</div>}
                          </td>
                          <td style={{fontSize:12, color:'var(--text3)'}}>{r.kelas}</td>
                          <td>
                            <div style={{fontSize:12, fontWeight:700}}>{r.kelab||'—'}</div>
                            {r.jawatan_kelab && <span className="badge b-blue" style={{fontSize:9, marginTop:2}}>{r.jawatan_kelab}</span>}
                            <div style={{fontSize:11, color:'var(--text3)', marginTop:2}}>Markah: <strong>{r.m_kelab??'—'}</strong>/10</div>
                          </td>
                          <td>
                            <div style={{fontSize:12, fontWeight:700}}>{r.uniform||'—'}</div>
                            {r.pangkat_uniform && <span className="badge b-green" style={{fontSize:9, marginTop:2}}>{r.pangkat_uniform}</span>}
                            <div style={{fontSize:11, color:'var(--text3)', marginTop:2}}>Markah: <strong>{r.m_uniform??'—'}</strong>/10</div>
                          </td>
                          <td>
                            <div style={{fontSize:12, fontWeight:700}}>{r.sukan||'—'}</div>
                            {r.jawatan_sukan && <span className="badge b-yellow" style={{fontSize:9, marginTop:2}}>{r.jawatan_sukan}</span>}
                            <div style={{fontSize:11, color:'var(--text3)', marginTop:2}}>Markah: <strong>{r.m_sukan??'—'}</strong>/10</div>
                          </td>
                          <td style={{fontWeight:900, fontSize:15}}>{j}<span style={{fontSize:10, color:'var(--text3)', fontWeight:400}}>/30</span></td>
                          <td><span className={`badge ${GRED_COLOR[g]||'b-gray'}`}>{g}</span></td>
                          <td style={{display:'flex', gap:4}}>
                            <button className="btn-add" style={{padding:'4px 8px', fontSize:11}} onClick={() => setEditItem({...r})}>✏️</button>
                            <button className="btn-del" onClick={() => handleDel(r.id)}>🗑</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SUBTAB 1: STATISTIK ── */}
        {subtab === 1 && (
          <div>
            <div style={{display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center'}}>
              <span style={{fontSize:12, fontWeight:900, color:'var(--text3)'}}>Tahun:</span>
              <select className="kur-select" value={filterTahun} onChange={e=>setFilterTahun(e.target.value)}>
                {['2023','2024','2025','2026'].map(y=><option key={y}>{y}</option>)}
              </select>
            </div>

            {/* Grade distribution — horizontal bars on mobile, vertical bars on desktop */}
            <div style={{background:'var(--surface)', border:'2px solid var(--border)', borderRadius:14, padding:16, marginBottom:16}}>
              <div style={{fontWeight:900, fontSize:13, marginBottom:14}}>📊 Agihan Gred OPR — {filterTahun}</div>
              {isMobile ? (
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {gradeDist.map(g => (
                    <div key={g.gred} style={{display:'flex', alignItems:'center', gap:10}}>
                      <span style={{fontSize:13, fontWeight:900, color:g.color, minWidth:56}}>Gred {g.gred}</span>
                      <div style={{flex:1, background:'var(--divider)', borderRadius:99, height:18, overflow:'hidden'}}>
                        <div style={{width:`${g.count/distMax*100}%`, minWidth:g.count>0?8:0, background:g.color, height:'100%', borderRadius:99, transition:'width 0.4s'}}/>
                      </div>
                      <span style={{fontSize:13, fontWeight:900, color:g.color, minWidth:24, textAlign:'right'}}>{g.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{display:'flex', alignItems:'flex-end', gap:12, height:120}}>
                  {gradeDist.map(g => (
                    <div key={g.gred} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
                      <div style={{fontSize:12, fontWeight:900, color:g.color}}>{g.count}</div>
                      <div style={{width:'100%', borderRadius:'6px 6px 0 0', background:g.color, opacity:0.85, height:`${Math.max(g.count/distMax*90, g.count>0?8:0)}px`, transition:'height 0.4s'}}/>
                      <div style={{fontSize:13, fontWeight:900, color:g.color}}>Gred {g.gred}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coverage by kelas */}
            <div style={{background:'var(--surface)', border:'2px solid var(--border)', borderRadius:14, padding:16}}>
              <div style={{fontWeight:900, fontSize:13, marginBottom:14}}>🏫 Pecahan Gred Mengikut Kelas — {filterTahun}</div>
              {kelasCoverage.length === 0 && <div style={{fontSize:12, color:'var(--text3)'}}>Tiada data untuk {filterTahun}.</div>}
              {kelasCoverage.map(c => (
                <div key={c.kelas} style={{marginBottom:14}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}>
                    <span style={{fontSize:13, fontWeight:800}}>{c.kelas}</span>
                    <span style={{fontSize:11, color:'var(--text3)'}}>{c.total} murid</span>
                  </div>
                  <div style={{display:'flex', height:16, borderRadius:99, overflow:'hidden', gap:1}}>
                    {['A','B','C','D','E'].map(g => {
                      const clr = g==='A'?'#22c55e': g==='B'?'#3b82f6': g==='C'?'#f59e0b':'#ef4444';
                      const pct = c.total ? c.grads[g]/c.total*100 : 0;
                      return pct > 0 ? (
                        <div key={g} style={{width:`${pct}%`, background:clr, minWidth:4}} title={`Gred ${g}: ${c.grads[g]}`}/>
                      ) : null;
                    })}
                  </div>
                  <div style={{display:'flex', gap:10, marginTop:5, flexWrap:'wrap'}}>
                    {['A','B','C','D','E'].map(g => c.grads[g] > 0 && (
                      <span key={g} style={{fontSize:11, color:'var(--text2)', fontWeight:700}}>
                        <strong style={{color:g==='A'?'#16a34a':g==='B'?'#2563eb':g==='C'?'#d97706':'#dc2626'}}>{g}</strong>: {c.grads[g]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>)}

      {/* ── MODAL TAMBAH ── */}
      {showAdd && (
        <Modal title="Tambah Profil Murid Kokurikulum" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <ProfilFormFields val={form} set={setForm} tahunNow={tahunNow}/>
            <div style={{
              background:'var(--surface)', border:'2px solid var(--border)', borderRadius:10,
              padding:'10px 12px', marginBottom:12, textAlign:'center',
            }}>
              <div style={{fontSize:11, color:'var(--text3)', fontWeight:800, marginBottom:4}}>JUMLAH OPR</div>
              <div style={{fontSize:24, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'var(--accent)'}}>
                {(form.m_kelab||0)+(form.m_uniform||0)+(form.m_sukan||0)}<span style={{fontSize:14, color:'var(--text3)'}}>/30</span>
              </div>
              <div style={{fontSize:13, fontWeight:900}}>Gred: <span>{gradeOPR((form.m_kelab||0)+(form.m_uniform||0)+(form.m_sukan||0))}</span></div>
            </div>
            <button className="btn-primary" type="submit">+ Tambah Profil</button>
          </form>
        </Modal>
      )}

      {/* ── MODAL EDIT ── */}
      {editItem && (
        <Modal title={`Edit — ${editItem.nama}`} onClose={() => setEditItem(null)}>
          <form onSubmit={handleEdit}>
            <ProfilFormFields val={editItem} set={setEditItem} tahunNow={tahunNow}/>
            <div style={{
              background:'var(--surface)', border:'2px solid var(--border)', borderRadius:10,
              padding:'10px 12px', marginBottom:12, textAlign:'center',
            }}>
              <div style={{fontSize:11, color:'var(--text3)', fontWeight:800, marginBottom:4}}>JUMLAH OPR</div>
              <div style={{fontSize:24, fontWeight:900, fontFamily:"'Playfair Display',serif", color:'var(--accent)'}}>
                {(editItem.m_kelab||0)+(editItem.m_uniform||0)+(editItem.m_sukan||0)}<span style={{fontSize:14, color:'var(--text3)'}}>/30</span>
              </div>
              <div style={{fontSize:13, fontWeight:900}}>Gred: <span>{gradeOPR((editItem.m_kelab||0)+(editItem.m_uniform||0)+(editItem.m_sukan||0))}</span></div>
            </div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-input" value={editItem.status||'Aktif'} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}>
                <option>Aktif</option><option>Tidak Aktif</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">💾 Simpan</button>
          </form>
        </Modal>
      )}
    </KurPage>
  );
}

function PencapaianKoku() {
  const TABS_PCP=['📋 Senarai Pencapaian','📊 Statistik','🌟 Murid Cemerlang'];
  const [subtab,setSubtab]=useState(0);
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [filterTahap,setFilterTahap]=useState('');
  const [filterKat,setFilterKat]=useState('');
  const blank={acara:'',kategori:'Umum',tahap:'Daerah',penyertaan:'Pasukan',peserta:1,tempat:'',tarikh:'',status:'Akan Datang',catatan:''};
  const [form,setForm]=useState(blank);
  const load=async()=>{setLoading(true);const{data:d}=await supabase.from('koku_pencapaian').select('*').order('tarikh',{ascending:false});setData(d||[]);setLoading(false);};
  useEffect(()=>{load();},[]);
  const handleAdd=async e=>{e.preventDefault();const ok=await dbRun(()=>supabase.from('koku_pencapaian').insert([form]));if(!ok)return;toast('Ditambah!','success');setShowAdd(false);setForm(blank);load();};
  const handleEdit=async e=>{e.preventDefault();const{id,created_at,...rest}=editItem;const ok=await dbRun(()=>supabase.from('koku_pencapaian').update(rest).eq('id',id));if(!ok)return;toast('Dikemaskini!','success');setEditItem(null);load();};
  const handleDel=async id=>{const ok=await dbRun(()=>supabase.from('koku_pencapaian').update({status:'PADAM'}).eq('id',id));if(ok){setData(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}};
  const stColor={Selesai:'b-green','Akan Datang':'b-yellow',Semasa:'b-blue'};
  const TAHAP=['Sekolah','Zon','Daerah','Negeri','Kebangsaan','Antarabangsa'];
  const KAT_PCPN=['Sukan','Kelab','Uniform','Akademik','Umum'];
  const filtered=data.filter(d=>(!filterTahap||d.tahap===filterTahap)&&(!filterKat||d.kategori===filterKat));
  const byKat=KAT_PCPN.map(k=>({kat:k,count:data.filter(d=>d.kategori===k).length,selesai:data.filter(d=>d.kategori===k&&d.status==='Selesai').length}));
  const byTahap=TAHAP.map(t=>({tahap:t,count:data.filter(d=>d.tahap===t).length})).filter(x=>x.count>0).sort((a,b)=>b.count-a.count);
  const cemerlang=data.filter(d=>['Johan','Ke-1','1','Naib Johan','Ke-2','2'].some(k=>d.tempat?.includes(k))).sort((a,b)=>TAHAP.indexOf(b.tahap)-TAHAP.indexOf(a.tahap));
  return(
    <KurPage title="Pencapaian" sub="Kokurikulum · SK Darau"
      stats={[{ico:'🏆',val:data.length,lbl:'Acara'},{ico:'✅',val:data.filter(d=>d.status==='Selesai').length,lbl:'Selesai'},{ico:'🥇',val:cemerlang.length,lbl:'Johan/Pertama'},{ico:'🌟',val:[...new Set(data.map(d=>d.tahap))].length,lbl:'Peringkat'}]}>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
        {TABS_PCP.map((t,i)=><button key={i} onClick={()=>setSubtab(i)} style={{padding:'7px 16px',borderRadius:20,border:'none',cursor:'pointer',fontWeight:subtab===i?700:400,background:subtab===i?'var(--accent)':'var(--card2)',color:subtab===i?'#fff':'var(--text1)',fontSize:13}}>{t}</button>)}
      </div>
      {loading?<div className="loading">⏳ Memuatkan…</div>:(<>
        {subtab===0&&(<>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12,alignItems:'center'}}>
            <select className="kur-select" value={filterTahap} onChange={e=>setFilterTahap(e.target.value)}><option value="">Semua Peringkat</option>{TAHAP.map(t=><option key={t}>{t}</option>)}</select>
            <select className="kur-select" value={filterKat} onChange={e=>setFilterKat(e.target.value)}><option value="">Semua Kategori</option>{KAT_PCPN.map(k=><option key={k}>{k}</option>)}</select>
            <button className="btn-add" onClick={()=>{setForm(blank);setShowAdd(true)}}>+ Tambah Pencapaian</button>
          </div>
          <div className="kur-table-wrap"><table className="kur-table">
            <thead><tr><th>#</th><th>Acara</th><th>Kategori</th><th>Peringkat</th><th>Penyertaan</th><th>Peserta</th><th>Tempat</th><th>Tarikh</th><th>Status</th><th></th></tr></thead>
            <tbody>{filtered.map((p,i)=>(
              <tr key={p.id}>
                <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                <td style={{fontWeight:800}}>{p.acara}</td>
                <td><span className="badge b-blue">{p.kategori}</span></td>
                <td><span className="badge b-blue">{p.tahap}</span></td>
                <td><span className={`badge ${p.penyertaan==='Murid'?'b-yellow':'b-green'}`}>{p.penyertaan}</span></td>
                <td>{p.peserta}</td>
                <td style={{fontWeight:700,color:'#f59e0b'}}>{p.tempat}</td>
                <td style={{color:'var(--text2)',fontSize:12}}>{p.tarikh}</td>
                <td><span className={`badge ${stColor[p.status]||'b-gray'}`}>{p.status}</span></td>
                <td style={{display:'flex',gap:4}}>
                  <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
                  <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
          {showAdd&&<Modal title="Tambah Pencapaian" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
            <div className="form-field"><label className="form-label">Nama Acara</label><input className="form-input" required value={form.acara} onChange={e=>setForm(f=>({...f,acara:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kategori</label><select className="form-input" value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value}))}>{KAT_PCPN.map(k=><option key={k}>{k}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Peringkat</label><select className="form-input" value={form.tahap} onChange={e=>setForm(f=>({...f,tahap:e.target.value}))}>{TAHAP.map(t=><option key={t}>{t}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Penyertaan</label><select className="form-input" value={form.penyertaan} onChange={e=>setForm(f=>({...f,penyertaan:e.target.value}))}><option>Murid</option><option>Pasukan</option></select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Bil. Peserta</label><input className="form-input" type="number" min="1" value={form.peserta} onChange={e=>setForm(f=>({...f,peserta:+e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Tempat/Kedudukan</label><input className="form-input" required value={form.tempat} onChange={e=>setForm(f=>({...f,tempat:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" type="date" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select></div>
            </div>
            <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={form.catatan} onChange={e=>setForm(f=>({...f,catatan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form></Modal>}
          {editItem&&<Modal title={`Edit — ${editItem.acara}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
            <div className="form-field"><label className="form-label">Nama Acara</label><input className="form-input" required value={editItem.acara} onChange={e=>setEditItem(f=>({...f,acara:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Kategori</label><select className="form-input" value={editItem.kategori||'Umum'} onChange={e=>setEditItem(f=>({...f,kategori:e.target.value}))}>{KAT_PCPN.map(k=><option key={k}>{k}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Peringkat</label><select className="form-input" value={editItem.tahap} onChange={e=>setEditItem(f=>({...f,tahap:e.target.value}))}>{TAHAP.map(t=><option key={t}>{t}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Penyertaan</label><select className="form-input" value={editItem.penyertaan} onChange={e=>setEditItem(f=>({...f,penyertaan:e.target.value}))}><option>Murid</option><option>Pasukan</option></select></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Bil. Peserta</label><input className="form-input" type="number" min="1" value={editItem.peserta} onChange={e=>setEditItem(f=>({...f,peserta:+e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Tempat/Kedudukan</label><input className="form-input" required value={editItem.tempat} onChange={e=>setEditItem(f=>({...f,tempat:e.target.value}))}/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" type="date" value={editItem.tarikh||''} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select></div>
            </div>
            <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={editItem.catatan||''} onChange={e=>setEditItem(f=>({...f,catatan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">💾 Simpan</button>
          </form></Modal>}
        </>)}
        {subtab===1&&(<>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div style={{background:'var(--card2)',borderRadius:12,padding:16}}>
              <p style={{fontWeight:700,marginBottom:10,fontSize:14}}>📂 Pencapaian Mengikut Kategori</p>
              <table className="kur-table">
                <thead><tr><th>Kategori</th><th>Jumlah</th><th>Selesai</th><th>Bar</th></tr></thead>
                <tbody>{byKat.map(r=>(
                  <tr key={r.kat}>
                    <td><span className="badge b-blue">{r.kat}</span></td>
                    <td style={{fontWeight:700}}>{r.count}</td>
                    <td style={{color:'#16a34a',fontWeight:700}}>{r.selesai}</td>
                    <td><div style={{background:'#e2e8f0',borderRadius:4,height:10,width:100}}><div style={{background:'var(--accent)',borderRadius:4,height:10,width:`${data.length?Math.round(r.count/data.length*100):0}%`}}/></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div style={{background:'var(--card2)',borderRadius:12,padding:16}}>
              <p style={{fontWeight:700,marginBottom:10,fontSize:14}}>🌐 Pencapaian Mengikut Peringkat</p>
              <table className="kur-table">
                <thead><tr><th>Peringkat</th><th>Jumlah</th><th>Bar</th></tr></thead>
                <tbody>{byTahap.map(r=>(
                  <tr key={r.tahap}>
                    <td><span className="badge b-yellow">{r.tahap}</span></td>
                    <td style={{fontWeight:700}}>{r.count}</td>
                    <td><div style={{background:'#e2e8f0',borderRadius:4,height:10,width:100}}><div style={{background:'#f59e0b',borderRadius:4,height:10,width:`${data.length?Math.round(r.count/data.length*100):0}%`}}/></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          <div style={{background:'var(--card2)',borderRadius:12,padding:16,marginTop:16,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,textAlign:'center'}}>
            {['Sekolah','Zon','Daerah','Negeri','Kebangsaan','Antarabangsa'].map(t=>{const n=data.filter(d=>d.tahap===t).length;return(<div key={t} style={{padding:12,background:'var(--bg)',borderRadius:8}}><div style={{fontSize:22,fontWeight:800,color:'var(--accent)'}}>{n}</div><div style={{fontSize:11,color:'var(--text2)'}}>{t}</div></div>);})}
          </div>
        </>)}
        {subtab===2&&(<>
          <p style={{fontSize:13,color:'var(--text2)',marginBottom:12}}>Rekod yang mencapai Johan, Naib Johan, Ke-1 atau Ke-2 (disusun peringkat tertinggi dahulu)</p>
          {cemerlang.length===0?<div style={{textAlign:'center',padding:40,color:'var(--text2)'}}>Tiada rekod cemerlang lagi.</div>:(
          <div className="kur-table-wrap"><table className="kur-table">
            <thead><tr><th>#</th><th>Acara</th><th>Kategori</th><th>Peringkat</th><th>Tempat</th><th>Peserta</th><th>Tarikh</th></tr></thead>
            <tbody>{cemerlang.map((p,i)=>(
              <tr key={p.id} style={{background:i<3?'rgba(245,158,11,0.08)':''}}>
                <td style={{fontWeight:800,color:i===0?'#f59e0b':i===1?'#94a3b8':i===2?'#cd7f32':'var(--text3)'}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
                <td style={{fontWeight:800}}>{p.acara}</td>
                <td><span className="badge b-blue">{p.kategori}</span></td>
                <td><span className="badge b-yellow">{p.tahap}</span></td>
                <td style={{fontWeight:700,color:'#f59e0b'}}>{p.tempat}</td>
                <td>{p.peserta}</td>
                <td style={{fontSize:12,color:'var(--text2)'}}>{p.tarikh}</td>
              </tr>
            ))}</tbody>
          </table></div>)}
        </>)}
      </>)}
    </KurPage>
  );
}

function OPRFormFields({val,set}) {
  const [driveInput,setDriveInput]=useState('');
  const parseDriveId=url=>{
    const m=url.match(/\/d\/([a-zA-Z0-9_-]+)/)||url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return m?m[1]:(url.match(/^[a-zA-Z0-9_-]{25,}$/)?url:null);
  };
  const addLink=()=>{
    const id=parseDriveId(driveInput.trim());
    if(!id){toast('Link tidak sah. Paste link Share dari Google Drive.','error');return;}
    const links=val.gambar_links||[];
    if(links.length>=4){toast('Maksimum 4 gambar sahaja.','error');return;}
    if(links.includes(id)){toast('Link sudah ditambah.','error');return;}
    set(f=>({...f,gambar_links:[...links,id]}));setDriveInput('');
  };
  const removeLink=id=>set(f=>({...f,gambar_links:(f.gambar_links||[]).filter(x=>x!==id)}));
  return(
    <>
      <div className="form-row">
        <div className="form-field"><label className="form-label">Tarikh *</label><input className="form-input" type="date" required value={val.tarikh||''} onChange={e=>set(f=>({...f,tarikh:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Masa</label><input className="form-input" type="time" value={val.masa||''} onChange={e=>set(f=>({...f,masa:e.target.value}))}/></div>
      </div>
      <div className="form-field"><label className="form-label">Nama Program *</label><input className="form-input" required placeholder="Contoh: Kem Literasi Membaca" value={val.nama_program||''} onChange={e=>set(f=>({...f,nama_program:e.target.value}))}/></div>
      <div className="form-row">
        <div className="form-field"><label className="form-label">Penganjur / Guru Bertanggungjawab</label><input className="form-input" value={val.penganjur||''} onChange={e=>set(f=>({...f,penganjur:e.target.value}))}/></div>
        <div className="form-field"><label className="form-label">Sasaran / Peserta</label><input className="form-input" placeholder="Contoh: Murid Tahun 4, 5, 6" value={val.sasaran||''} onChange={e=>set(f=>({...f,sasaran:e.target.value}))}/></div>
      </div>
      <div className="form-field"><label className="form-label">Impak / Outcome</label><textarea className="form-input" rows={3} placeholder="Huraikan impak atau hasil program ini..." value={val.impak||''} onChange={e=>set(f=>({...f,impak:e.target.value}))}/></div>
      <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={val.catatan||''} onChange={e=>set(f=>({...f,catatan:e.target.value}))}/></div>
      <div className="form-field">
        <label className="form-label">📸 Gambar Program (Google Drive)</label>
        <div style={{display:'flex',gap:6,marginBottom:6}}>
          <input className="form-input" placeholder="Paste link Share Google Drive di sini..." value={driveInput} onChange={e=>setDriveInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addLink())} style={{flex:1,fontSize:12}}/>
          <button type="button" className="btn-add" onClick={addLink} style={{whiteSpace:'nowrap',padding:'6px 14px'}}>+ Tambah</button>
        </div>
        <div style={{fontSize:10,color:'var(--text3)',marginBottom:8,lineHeight:1.6}}>
          💡 Drive → klik kanan fail → <b>Share</b> → "Anyone with the link" → Copy link → Paste di atas
        </div>
        {(val.gambar_links||[]).length>0&&(
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>
            {(val.gambar_links||[]).map((id,i)=>(
              <div key={id} style={{position:'relative',width:90,height:68,borderRadius:8,overflow:'visible',border:'1.5px solid var(--border)',borderRadius:8,background:'var(--card2)'}}>
                <img src={`https://drive.google.com/thumbnail?id=${id}&sz=w200`} style={{width:90,height:68,objectFit:'cover',borderRadius:7,display:'block'}} onError={e=>e.target.style.display='none'}/>
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,borderRadius:7,zIndex:-1}}>📷</div>
                <div style={{position:'absolute',bottom:2,left:2,background:'rgba(0,0,0,0.55)',color:'#fff',fontSize:9,borderRadius:3,padding:'1px 4px'}}>{i+1}</div>
                <button type="button" onClick={()=>removeLink(id)} style={{position:'absolute',top:-7,right:-7,width:18,height:18,borderRadius:'50%',background:'#ef4444',color:'white',border:'2px solid white',cursor:'pointer',fontSize:11,lineHeight:'14px',textAlign:'center',padding:0,zIndex:10}}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function OPRPage() {
  const OPR_ACCENT='#0891b2';
  const DOMAINS=[
    {id:'kurikulum',  label:'Kurikulum',   icon:'📚',color:'#2563eb'},
    {id:'hem',        label:'HEM',         icon:'👫',color:'#0ea5e9'},
    {id:'kokurikulum',label:'Kokurikulum', icon:'🏅',color:'#6366f1'},
    {id:'prasekolah', label:'Prasekolah',  icon:'🌈',color:'#7c3aed'},
  ];
  const TAHUN_OPTS=['2024','2025','2026','2027'];
  const tahunNow=new Date().getFullYear().toString();
  const [domain,setDomain]=useState('kurikulum');
  const [subtab,setSubtab]=useState(0);
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [viewItem,setViewItem]=useState(null);
  const [q,setQ]=useState('');
  const [filterTahun,setFilterTahun]=useState(tahunNow);
  const blank={domain:'kurikulum',tarikh:'',masa:'',nama_program:'',penganjur:'',sasaran:'',impak:'',catatan:'',tahun:tahunNow,gambar_links:[]};
  const [form,setForm]=useState(blank);

  const load=async()=>{
    setLoading(true);
    const{data:d}=await supabase.from('opr_program').select('*').neq('status','PADAM').order('tarikh',{ascending:false});
    setData(d||[]);setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const curDomain=DOMAINS.find(d=>d.id===domain);
  const domainData=data.filter(r=>r.domain===domain&&(!filterTahun||r.tahun===filterTahun));
  const filtered=domainData.filter(r=>!q||r.nama_program.toLowerCase().includes(q.toLowerCase())||(r.penganjur||'').toLowerCase().includes(q.toLowerCase()));

  const handleAdd=async e=>{
    e.preventDefault();
    const ok=await dbRun(()=>supabase.from('opr_program').insert([{...form,domain,tahun:filterTahun}]));
    if(!ok)return;toast('Program ditambah!','success');setShowAdd(false);setForm({...blank,domain,tahun:filterTahun});load();
  };
  const handleEdit=async e=>{
    e.preventDefault();
    const{id,created_at,...rest}=editItem;
    const ok=await dbRun(()=>supabase.from('opr_program').update(rest).eq('id',id));
    if(!ok)return;toast('Dikemaskini!','success');setEditItem(null);load();
  };
  const handleDel=async id=>{
    if(!confirm('Padam rekod program ini?'))return;
    const ok=await dbRun(()=>supabase.from('opr_program').update({status:'PADAM'}).eq('id',id));
    if(ok){setData(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}
  };

  const fmtT=t=>t?new Date(t).toLocaleDateString('ms-MY',{day:'2-digit',month:'short',year:'numeric'}):'—';

  const printProgram=(rows,domLabel)=>{
    const w=window.open('','_blank');
    const tbl=rows.map((r,i)=>`<tr><td>${i+1}</td><td style="white-space:nowrap">${fmtT(r.tarikh)}</td><td>${r.masa||'—'}</td><td style="font-weight:700">${r.nama_program}</td><td>${r.penganjur||'—'}</td><td>${r.sasaran||'—'}</td><td>${r.impak||'—'}</td><td>${r.catatan||'—'}</td></tr>`).join('');
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Laporan OPR</title><style>body{font-family:Arial,sans-serif;font-size:11px;margin:24px}h2{text-align:center;font-size:16px;margin:0 0 3px}h3{text-align:center;font-size:11px;font-weight:400;margin:0 0 16px;color:#555}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:5px 7px;vertical-align:top}th{background:#0891b2;color:#fff;font-size:10px;text-align:left}tr:nth-child(even){background:#f5f5f5}.meta{text-align:right;font-size:10px;color:#888;margin-bottom:6px}@media print{.no-print{display:none}}</style></head><body><h2>Laporan OPR — ${domLabel}</h2><h3>SK Darau, Kota Kinabalu, Sabah &nbsp;|&nbsp; Tahun Pelajaran ${filterTahun}</h3><div class="meta">Dijana: ${new Date().toLocaleDateString('ms-MY')} &nbsp;|&nbsp; Jumlah Program: ${rows.length}</div><table><thead><tr><th>#</th><th>Tarikh</th><th>Masa</th><th>Nama Program</th><th>Penganjur/Guru</th><th>Sasaran/Peserta</th><th>Impak / Outcome</th><th>Catatan</th></tr></thead><tbody>${tbl}</tbody></table><br><button class="no-print" onclick="window.print()" style="padding:8px 20px;background:#0891b2;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">🖨️ Cetak PDF</button></body></html>`);
    w.document.close();
  };

  const printSingleProgram=(r,domLabel,domIcon)=>{
    const w=window.open('','_blank');
    const photos=(r.gambar_links||[]);
    const tarikhCetak=new Date().toLocaleDateString('ms-MY',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const masaCetak=new Date().toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'});
    const show4=photos.slice(0,4);
    const photoColHtml=show4.length>0?`
      <div class="right-col">
        <div class="sec-title"><span class="sec-ico">📸</span>GAMBAR PROGRAM</div>
        <div class="photo-grid">${show4.map(id=>`<div class="photo-wrap"><img src="https://drive.google.com/thumbnail?id=${id}&sz=w400" alt="Gambar" onerror="this.parentElement.style.display='none'"/></div>`).join('')}</div>
        <p class="photo-note">* Gambar dari Google Drive. Kongsi sebagai "Anyone with the link".</p>
      </div>`:'';
    const hasPhotos=show4.length>0;
    const catatanHtml=r.catatan?`<div class="sec-full"><div class="sec-title"><span class="sec-ico">📝</span>CATATAN TAMBAHAN</div><div class="sec-body">${r.catatan}</div></div>`:'';
    w.document.write(`<!DOCTYPE html><html lang="ms"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<title>OPR — ${r.nama_program}</title><style>
@page{size:A4 portrait;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:210mm;max-height:297mm;overflow:hidden;font-family:'Inter',sans-serif;font-size:11px;color:#1a1a1a;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}

/* ── HEADER ── */
.hdr{background:linear-gradient(135deg,#001e3a 0%,#003d6b 38%,#0077b6 70%,#005f99 100%);color:#fff;position:relative;overflow:hidden}
.hdr-orb1{position:absolute;width:180px;height:180px;border-radius:50%;background:rgba(212,160,23,0.12);top:-70px;right:80px;pointer-events:none}
.hdr-orb2{position:absolute;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,0.05);bottom:-40px;left:32%;pointer-events:none}
.hdr-inner{display:flex;align-items:center;gap:18px;padding:16px 28px;position:relative;z-index:1}
.logo-ring{width:64px;height:64px;border-radius:50%;background:#fff;padding:4px;box-shadow:0 0 0 2.5px rgba(212,160,23,0.65),0 4px 14px rgba(0,0,0,0.3);flex-shrink:0;overflow:hidden}
.logo-ring img{width:100%;height:100%;object-fit:contain;border-radius:50%}
.hdr-txt{flex:1}
.hdr-txt h1{font-family:'Playfair Display',serif;font-size:19px;font-weight:800;letter-spacing:0.5px;text-shadow:0 2px 5px rgba(0,0,0,0.22);margin-bottom:3px;line-height:1.1}
.hdr-txt h2{font-size:10px;font-weight:500;opacity:0.80;letter-spacing:0.4px;margin-bottom:8px}
.badge{display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,rgba(212,160,23,0.28),rgba(212,160,23,0.1));border:1.5px solid rgba(212,160,23,0.68);padding:3px 14px;border-radius:20px;font-size:9.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#fde68a}
.hdr-right-logo{width:64px;height:64px;object-fit:contain;flex-shrink:0;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.28))}
.gold-bar{height:3.5px;background:linear-gradient(90deg,#b8860b 0%,#d4a017 25%,#f0c040 50%,#d4a017 75%,#b8860b 100%)}

/* ── TITLE BAND ── */
.title-band{background:linear-gradient(90deg,#e8f4fd,#f0f9ff);border-left:4px solid #0077b6;padding:9px 28px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #dbeafe}
.title-band h3{font-family:'Playfair Display',serif;font-size:13.5px;font-weight:700;color:#002d56;flex:1;letter-spacing:0.2px}
.domain-tag{display:inline-flex;align-items:center;gap:4px;background:#0077b618;color:#005f99;border:1.5px solid #0077b630;border-radius:20px;padding:3px 12px;font-size:10px;font-weight:700;white-space:nowrap}

/* ── CONTENT ── */
.content{padding:10px 28px 14px}
.meta{display:flex;justify-content:flex-end;align-items:center;gap:5px;font-size:8.5px;color:#94a3b8;font-weight:500;margin-bottom:10px;padding-bottom:7px;border-bottom:1px dashed #e2e8f0;letter-spacing:0.2px}
.meta-dot{width:2.5px;height:2.5px;border-radius:50%;background:#cbd5e1}

/* ── TWO-COLUMN LAYOUT ── */
.two-col{display:grid;grid-template-columns:${hasPhotos?'1.15fr 1fr':'1fr'};gap:14px;margin-bottom:10px;align-items:start}
.left-col{}
.right-col{}

/* ── INFO TABLE ── */
.info-table{width:100%;border-collapse:collapse;margin-bottom:9px;border:1.5px solid #e2e8f0;border-radius:8px;overflow:hidden}
.info-table tr:last-child td{border-bottom:none}
.info-table td{padding:6px 11px;font-size:10.5px;border-bottom:1px solid #f1f5f9;vertical-align:top}
.info-table .lbl{width:40%;font-weight:700;color:#64748b;background:#f8fafc;font-size:9.5px;letter-spacing:0.3px;text-transform:uppercase}
.info-table .val{color:#1e293b;font-weight:500;line-height:1.4}
.info-table .val strong{color:#002d56;font-weight:800;font-family:'Playfair Display',serif;font-size:11.5px}

/* ── SECTION ── */
.sec-title{display:flex;align-items:center;gap:6px;font-size:9px;font-weight:800;letter-spacing:1.2px;color:#0077b6;text-transform:uppercase;padding-bottom:5px;margin-bottom:8px;border-bottom:2px solid #0077b6}
.sec-ico{font-size:11px;line-height:1}
.sec-body{background:linear-gradient(135deg,#f8fafc,#f0f9ff);border:1px solid #dbeafe;border-radius:7px;padding:9px 12px;font-size:10.5px;line-height:1.7;color:#334155;white-space:pre-wrap;font-weight:500}
.sec-full{margin-bottom:9px}

/* ── PHOTOS 2x2 ── */
.photo-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.photo-wrap{aspect-ratio:4/3;overflow:hidden;border-radius:7px;border:1px solid #e2e8f0;background:#f8fafc}
.photo-wrap img{width:100%;height:100%;object-fit:cover;display:block}
.photo-note{font-size:8px;color:#94a3b8;margin-top:5px;font-style:italic}

/* ── SIGNATURE ── */
.sig-wrap{margin-top:10px}
.sig-gold{height:2.5px;background:linear-gradient(90deg,#b8860b,#f0c040,#b8860b);border-radius:2px;margin-bottom:10px}
.sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.sig-box{text-align:center}
.sig-label{font-size:10px;font-weight:600;color:#64748b;margin-bottom:30px}
.sig-line{border-top:1.5px solid #334155;padding-top:5px}
.sig-name{font-family:'Playfair Display',serif;font-size:10.5px;font-weight:700;color:#1e293b}
.sig-role{font-size:9px;color:#94a3b8;margin-top:2px;font-weight:500}

/* ── DOC FOOTER ── */
.doc-footer{margin-top:10px;text-align:center;font-size:8px;color:#94a3b8;font-weight:500;letter-spacing:0.3px;padding-top:8px;border-top:1px solid #f1f5f9}

/* ── PRINT BUTTON ── */
.print-btn{display:block;margin:14px auto 0;padding:10px 40px;background:linear-gradient(135deg,#003d6b,#0077b6);color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;font-family:'Inter',sans-serif;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(0,119,182,0.3)}

@media print{
  .print-btn{display:none!important}
  html,body{overflow:hidden;max-height:297mm}
}
</style></head><body>

<div class="hdr">
  <div class="hdr-orb1"></div>
  <div class="hdr-orb2"></div>
  <div class="hdr-inner">
    <div class="logo-ring">
      <img src="https://i.postimg.cc/pdhvk3Q2/images.jpg" alt="SK Darau"/>
    </div>
    <div class="hdr-txt">
      <h1>SEKOLAH KEBANGSAAN DARAU</h1>
      <h2>Kota Kinabalu, Sabah &nbsp;·&nbsp; Malaysia</h2>
      <div class="badge">📋 &nbsp;LAPORAN PROGRAM OPR</div>
    </div>
    <img src="https://i.postimg.cc/zDCxwvZm/download-(1).png" alt="Logo" class="hdr-right-logo"/>
  </div>
</div>
<div class="gold-bar"></div>

<div class="title-band">
  <h3>${r.nama_program}</h3>
  <span class="domain-tag">${domIcon} ${domLabel}</span>
</div>

<div class="content">
  <div class="meta">
    <span>Dijana: ${tarikhCetak}</span>
    <span class="meta-dot"></span>
    <span>${masaCetak}</span>
    <span class="meta-dot"></span>
    <span>Tahun Pelajaran ${r.tahun||filterTahun}</span>
  </div>

  <div class="two-col">
    <div class="left-col">
      <table class="info-table">
        <tr><td class="lbl">Nama Program</td><td class="val"><strong>${r.nama_program}</strong></td></tr>
        <tr><td class="lbl">Domain</td><td class="val">${domIcon} ${domLabel}</td></tr>
        <tr><td class="lbl">Tarikh Program</td><td class="val">${fmtT(r.tarikh)}</td></tr>
        <tr><td class="lbl">Masa Program</td><td class="val">${r.masa||'—'}</td></tr>
        <tr><td class="lbl">Penganjur / Guru</td><td class="val">${r.penganjur||'—'}</td></tr>
        <tr><td class="lbl">Sasaran / Peserta</td><td class="val">${r.sasaran||'—'}</td></tr>
        <tr><td class="lbl">Tahun Pelajaran</td><td class="val">${r.tahun||filterTahun}</td></tr>
      </table>
      <div class="sec-title" style="margin-top:2px"><span class="sec-ico">🎯</span>IMPAK / OUTCOME PROGRAM</div>
      <div class="sec-body">${r.impak||'—'}</div>
    </div>
    ${photoColHtml}
  </div>

  ${catatanHtml}

  <div class="sig-wrap">
    <div class="sig-gold"></div>
    <div class="sig-grid">
      <div class="sig-box">
        <div class="sig-label">Disediakan oleh:</div>
        <div class="sig-line">
          <div class="sig-name">${r.penganjur||'................................................'}</div>
          <div class="sig-role">(Guru Bertanggungjawab)</div>
        </div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Disahkan oleh:</div>
        <div class="sig-line">
          <div class="sig-name">................................................</div>
          <div class="sig-role">(Pengetua / GPK)</div>
        </div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    Dokumen ini dijana secara automatik oleh Sistem EduDashboard SK Darau &nbsp;·&nbsp; ${tarikhCetak} ${masaCetak}
  </div>
</div>

<button class="print-btn" onclick="window.print()">🖨️ &nbsp;Cetak / Simpan PDF</button>
</body></html>`);
    w.document.close();
  };

  return(
    <KurPage title="OPR — Pelaporan Program" sub="OPR · SK Darau"
      stats={[
        {ico:'📋',val:data.filter(r=>r.tahun===filterTahun).length,lbl:'Program Tahun Ini'},
        {ico:'📚',val:data.filter(r=>r.domain==='kurikulum'&&r.tahun===filterTahun).length,lbl:'Kurikulum'},
        {ico:'👫',val:data.filter(r=>r.domain==='hem'&&r.tahun===filterTahun).length,lbl:'HEM'},
        {ico:'🏅',val:data.filter(r=>r.domain==='kokurikulum'&&r.tahun===filterTahun).length,lbl:'Kokurikulum'},
      ]}>

      {/* Domain tabs */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
        {DOMAINS.map(d=>(
          <button key={d.id} onClick={()=>{setDomain(d.id);setSubtab(0);setQ('');}}
            style={{padding:'8px 18px',borderRadius:20,border:`2px solid ${domain===d.id?d.color:'var(--border)'}`,cursor:'pointer',fontWeight:domain===d.id?800:500,background:domain===d.id?d.color:'var(--surface)',color:domain===d.id?'#fff':'var(--text1)',fontSize:13,transition:'all 0.15s'}}>
            {d.icon} {d.label}
          </button>
        ))}
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6}}>
          <label style={{fontSize:12,color:'var(--text2)'}}>Tahun:</label>
          <select className="kur-select" value={filterTahun} onChange={e=>setFilterTahun(e.target.value)}>{TAHUN_OPTS.map(y=><option key={y}>{y}</option>)}</select>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:6,marginBottom:14}}>
        {['📋 Rekod Program','🖨️ Jana PDF'].map((t,i)=>(
          <button key={i} onClick={()=>setSubtab(i)}
            style={{padding:'6px 14px',borderRadius:16,border:'none',cursor:'pointer',fontWeight:subtab===i?700:400,background:subtab===i?OPR_ACCENT:'var(--card2)',color:subtab===i?'#fff':'var(--text1)',fontSize:12}}>
            {t}
          </button>
        ))}
      </div>

      {loading?<div className="loading">⏳ Memuatkan…</div>:(<>
        {subtab===0&&(<>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12,alignItems:'center'}}>
            <div style={{padding:'6px 14px',borderRadius:10,background:`${curDomain.color}18`,color:curDomain.color,fontWeight:800,fontSize:13,border:`1.5px solid ${curDomain.color}30`}}>
              {curDomain.icon} {curDomain.label} — {filtered.length} program
            </div>
            <input className="kur-search" placeholder="Cari nama program / penganjur…" value={q} onChange={e=>setQ(e.target.value)} style={{flex:1,minWidth:160}}/>
            <button className="btn-add" onClick={()=>{setForm({...blank,domain,tahun:filterTahun});setShowAdd(true);}}>+ Tambah Program</button>
          </div>

          <div className="kur-table-wrap"><table className="kur-table">
            <thead><tr><th>#</th><th>Tarikh</th><th>Masa</th><th>Nama Program</th><th>Penganjur/Guru</th><th>Sasaran/Peserta</th><th>Impak / Outcome</th><th>Catatan</th><th></th></tr></thead>
            <tbody>{filtered.length===0
              ?<tr><td colSpan={8} style={{textAlign:'center',padding:28,color:'var(--text3)',fontSize:13}}>Tiada rekod. Klik "+ Tambah Program" untuk mula.</td></tr>
              :filtered.map((r,i)=>(
              <tr key={r.id}>
                <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                <td style={{fontSize:12,whiteSpace:'nowrap'}}>{fmtT(r.tarikh)}</td>
                <td style={{fontSize:12}}>{r.masa||'—'}</td>
                <td style={{fontWeight:700,cursor:'pointer',color:'#0891b2'}} onClick={()=>setViewItem({...r})} title="Klik untuk lihat butiran & gambar">{r.nama_program} {(r.gambar_links||[]).length>0&&<span style={{fontSize:10,background:'#0891b215',border:'1px solid #0891b230',borderRadius:10,padding:'1px 6px',marginLeft:4,fontWeight:600}}>📷{(r.gambar_links||[]).length}</span>}</td>
                <td style={{fontSize:12}}>{r.penganjur||'—'}</td>
                <td style={{fontSize:12,color:'var(--text2)'}}>{r.sasaran||'—'}</td>
                <td style={{fontSize:12,maxWidth:220}}>{r.impak||'—'}</td>
                <td style={{fontSize:11,color:'var(--text3)'}}>{r.catatan||'—'}</td>
                <td style={{display:'flex',gap:4}}>
                  <button className="btn-add" style={{padding:'4px 8px',fontSize:11,background:'#0891b2',color:'white'}} onClick={()=>printSingleProgram(r,curDomain.label,curDomain.icon)} title="Jana PDF">🖨️</button>
                  <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditItem({...r})}>✏️</button>
                  <button className="btn-del" onClick={()=>handleDel(r.id)}>🗑</button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>

          {showAdd&&<Modal title={`Tambah Program — ${curDomain.icon} ${curDomain.label}`} onClose={()=>setShowAdd(false)}>
            <form onSubmit={handleAdd}>
              <OPRFormFields val={form} set={setForm}/>
              <button className="btn-primary" type="submit">+ Tambah Program</button>
            </form>
          </Modal>}

          {editItem&&<Modal title={`Edit — ${editItem.nama_program}`} onClose={()=>setEditItem(null)}>
            <form onSubmit={handleEdit}>
              <OPRFormFields val={editItem} set={setEditItem}/>
              <button className="btn-primary" type="submit">💾 Simpan</button>
            </form>
          </Modal>}

          {viewItem&&<Modal title={`${curDomain.icon} ${viewItem.nama_program}`} onClose={()=>setViewItem(null)}>
            <div>
              <div style={{display:'grid',gridTemplateColumns:'140px 1fr',gap:'6px 12px',fontSize:13,marginBottom:16,background:'var(--card2)',borderRadius:10,padding:14}}>
                {[['Tarikh',fmtT(viewItem.tarikh)],['Masa',viewItem.masa||'—'],['Penganjur',viewItem.penganjur||'—'],['Sasaran/Peserta',viewItem.sasaran||'—'],['Tahun',viewItem.tahun||filterTahun]].map(([k,v])=>(
                  <>{k==='Tarikh'?null:null}<span key={k+'k'} style={{fontWeight:700,color:'var(--text2)',fontSize:12}}>{k}</span><span key={k+'v'}>{v}</span></>
                ))}
              </div>
              {viewItem.impak&&<div style={{marginBottom:14}}>
                <div style={{fontWeight:800,fontSize:10,color:'#0891b2',textTransform:'uppercase',letterSpacing:1,marginBottom:6,paddingBottom:4,borderBottom:'2px solid #0891b2'}}>🎯 Impak / Outcome</div>
                <div style={{background:'var(--card2)',borderRadius:8,padding:12,fontSize:13,lineHeight:1.8,whiteSpace:'pre-wrap'}}>{viewItem.impak}</div>
              </div>}
              {viewItem.catatan&&<div style={{marginBottom:14}}>
                <div style={{fontWeight:800,fontSize:10,color:'#0891b2',textTransform:'uppercase',letterSpacing:1,marginBottom:6,paddingBottom:4,borderBottom:'2px solid #0891b2'}}>📝 Catatan</div>
                <div style={{background:'var(--card2)',borderRadius:8,padding:12,fontSize:13,lineHeight:1.8}}>{viewItem.catatan}</div>
              </div>}
              {(viewItem.gambar_links||[]).length>0&&<div style={{marginBottom:16}}>
                <div style={{fontWeight:800,fontSize:10,color:'#0891b2',textTransform:'uppercase',letterSpacing:1,marginBottom:10,paddingBottom:4,borderBottom:'2px solid #0891b2'}}>📸 Gambar Program ({(viewItem.gambar_links||[]).length} gambar)</div>
                <div style={{display:'grid',gridTemplateColumns:(viewItem.gambar_links||[]).length===1?'1fr':'repeat(2,1fr)',gap:10}}>
                  {(viewItem.gambar_links||[]).map((id,idx)=>(
                    <div key={id} style={{aspectRatio:'4/3',borderRadius:10,overflow:'hidden',background:'var(--card2)',border:'1.5px solid var(--border)',position:'relative'}}>
                      <img src={`https://drive.google.com/thumbnail?id=${id}&sz=w800`} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={e=>{e.target.style.display='none';}}/>
                      <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.35))',padding:'6px 8px 4px',color:'white',fontSize:10,fontWeight:700}}>Gambar {idx+1}</div>
                    </div>
                  ))}
                </div>
                <p style={{fontSize:10,color:'var(--text3)',marginTop:8}}>* Gambar dari Google Drive. Pastikan fail dikongsi "Anyone with the link".</p>
              </div>}
              {(viewItem.gambar_links||[]).length===0&&<div style={{textAlign:'center',padding:'16px 0',color:'var(--text3)',fontSize:13}}>Tiada gambar dilampirkan untuk program ini.</div>}
              <div style={{display:'flex',gap:8,marginTop:4}}>
                <button className="btn-primary" style={{flex:1,padding:'10px'}} onClick={()=>printSingleProgram(viewItem,curDomain.label,curDomain.icon)}>🖨️ Jana PDF (dengan gambar)</button>
                <button className="btn-add" style={{padding:'10px 16px'}} onClick={()=>{setEditItem({...viewItem});setViewItem(null);}}>✏️ Edit</button>
              </div>
            </div>
          </Modal>}
        </>)}

        {subtab===1&&(<>
          <div style={{textAlign:'center',padding:'36px 20px'}}>
            <div style={{fontSize:48,marginBottom:10}}>{curDomain.icon}</div>
            <p style={{fontWeight:800,fontSize:17,marginBottom:4}}>Jana Laporan OPR — {curDomain.label}</p>
            <p style={{color:'var(--text2)',marginBottom:24,fontSize:13}}>
              PDF akan menyenaraikan semua program bagi domain <b>{curDomain.label}</b> untuk tahun pelajaran <b>{filterTahun}</b>.
            </p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,maxWidth:320,margin:'0 auto 28px'}}>
              <div style={{background:'var(--card2)',borderRadius:10,padding:14,textAlign:'center'}}>
                <div style={{fontWeight:900,fontSize:24,color:curDomain.color}}>{filtered.length}</div>
                <div style={{fontSize:11,color:'var(--text2)',marginTop:3}}>Program</div>
              </div>
              <div style={{background:'var(--card2)',borderRadius:10,padding:14,textAlign:'center'}}>
                <div style={{fontWeight:900,fontSize:24,color:'#16a34a'}}>{[...new Set(filtered.map(r=>r.penganjur).filter(Boolean))].length}</div>
                <div style={{fontSize:11,color:'var(--text2)',marginTop:3}}>Penganjur</div>
              </div>
              <div style={{background:'var(--card2)',borderRadius:10,padding:14,textAlign:'center'}}>
                <div style={{fontWeight:900,fontSize:24,color:'#f59e0b'}}>{filterTahun}</div>
                <div style={{fontSize:11,color:'var(--text2)',marginTop:3}}>Tahun</div>
              </div>
            </div>
            {filtered.length===0
              ?<p style={{color:'var(--text3)',fontSize:13}}>Tiada rekod untuk dijana. Tambah program dahulu.</p>
              :<button className="btn-primary" style={{padding:'13px 40px',fontSize:15,borderRadius:12}}
                  onClick={()=>printProgram(filtered,`${curDomain.icon} ${curDomain.label}`)}>
                  🖨️ Jana PDF Sekarang
                </button>
            }
          </div>
        </>)}
      </>)}
    </KurPage>
  );
}

function TakwimKokurikulum() {
  const TABS_TKW=['📋 Senarai Aktiviti','📆 Paparan Bulanan','📊 Ringkasan'];
  const [subtab,setSubtab]=useState(0);
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [filterJenis,setFilterJenis]=useState('');
  const [filterStatus,setFilterStatus]=useState('');
  const blank={aktiviti:'',jenis:'Umum',tarikh:'',masa:'',tempat:'',penanggung_jawab:GURU_KOKU[0],status:'Akan Datang',catatan:''};
  const [form,setForm]=useState(blank);
  const load=async()=>{setLoading(true);const{data:d}=await supabase.from('koku_takwim').select('*').order('tarikh');setData(d||[]);setLoading(false);};
  useEffect(()=>{load();},[]);
  const handleAdd=async e=>{e.preventDefault();const ok=await dbRun(()=>supabase.from('koku_takwim').insert([form]));if(!ok)return;toast('Ditambah!','success');setShowAdd(false);setForm(blank);load();};
  const handleEdit=async e=>{e.preventDefault();const{id,created_at,...rest}=editItem;const ok=await dbRun(()=>supabase.from('koku_takwim').update(rest).eq('id',id));if(!ok)return;toast('Dikemaskini!','success');setEditItem(null);load();};
  const handleDel=async id=>{const ok=await dbRun(()=>supabase.from('koku_takwim').update({status:'PADAM'}).eq('id',id));if(ok){setData(d=>d.filter(r=>r.id!==id));toast('Dipadam.','success');}};
  const stC={Selesai:'b-green','Akan Datang':'b-yellow',Semasa:'b-blue'};
  const JENIS_TKW=['Sukan','Kelab','Uniform','Akademik','Umum'];
  const BULAN=['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogs','Sep','Okt','Nov','Dis'];
  const filtered=data.filter(d=>(!filterJenis||d.jenis===filterJenis)&&(!filterStatus||d.status===filterStatus));
  const byBulan=BULAN.map((b,i)=>({bulan:b,idx:i,items:data.filter(d=>{if(!d.tarikh)return false;const m=new Date(d.tarikh).getMonth();return m===i;})})).filter(x=>x.items.length>0);
  const byJenis=JENIS_TKW.map(j=>({jenis:j,total:data.filter(d=>d.jenis===j).length,selesai:data.filter(d=>d.jenis===j&&d.status==='Selesai').length})).filter(x=>x.total>0);
  return(
    <KurPage title="Takwim Kokurikulum" sub="Kokurikulum · SK Darau"
      stats={[{ico:'📅',val:data.length,lbl:'Aktiviti'},{ico:'✅',val:data.filter(d=>d.status==='Selesai').length,lbl:'Selesai'},{ico:'⏳',val:data.filter(d=>d.status==='Akan Datang').length,lbl:'Akan Datang'},{ico:'📍',val:[...new Set(data.map(d=>d.tempat).filter(Boolean))].length,lbl:'Lokasi'}]}>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
        {TABS_TKW.map((t,i)=><button key={i} onClick={()=>setSubtab(i)} style={{padding:'7px 16px',borderRadius:20,border:'none',cursor:'pointer',fontWeight:subtab===i?700:400,background:subtab===i?'var(--accent)':'var(--card2)',color:subtab===i?'#fff':'var(--text1)',fontSize:13}}>{t}</button>)}
      </div>
      {loading?<div className="loading">⏳ Memuatkan…</div>:(<>
        {subtab===0&&(<>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12,alignItems:'center'}}>
            <select className="kur-select" value={filterJenis} onChange={e=>setFilterJenis(e.target.value)}><option value="">Semua Jenis</option>{JENIS_TKW.map(j=><option key={j}>{j}</option>)}</select>
            <select className="kur-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="">Semua Status</option><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select>
            <button className="btn-add" onClick={()=>{setForm(blank);setShowAdd(true)}}>+ Tambah Aktiviti</button>
          </div>
          <div className="kur-table-wrap"><table className="kur-table">
            <thead><tr><th>#</th><th>Aktiviti</th><th>Jenis</th><th>Tarikh</th><th>Masa</th><th>Tempat</th><th>Penanggung Jawab</th><th>Status</th><th></th></tr></thead>
            <tbody>{filtered.map((p,i)=>(
              <tr key={p.id}>
                <td style={{color:'var(--text3)',fontWeight:800}}>{i+1}</td>
                <td style={{fontWeight:800}}>{p.aktiviti}</td>
                <td><span className="badge b-blue">{p.jenis}</span></td>
                <td style={{color:'var(--text2)',fontSize:12}}>{p.tarikh}</td>
                <td>{p.masa}</td><td>{p.tempat}</td>
                <td style={{fontSize:12}}>{p.penanggung_jawab}</td>
                <td><span className={`badge ${stC[p.status]||'b-gray'}`}>{p.status}</span></td>
                <td style={{display:'flex',gap:4}}>
                  <button className="btn-add" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditItem({...p})}>✏️</button>
                  <button className="btn-del" onClick={()=>handleDel(p.id)}>🗑</button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
          {showAdd&&<Modal title="Tambah Aktiviti" onClose={()=>setShowAdd(false)}><form onSubmit={handleAdd}>
            <div className="form-field"><label className="form-label">Nama Aktiviti</label><input className="form-input" required value={form.aktiviti} onChange={e=>setForm(f=>({...f,aktiviti:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Jenis</label><select className="form-input" value={form.jenis} onChange={e=>setForm(f=>({...f,jenis:e.target.value}))}>{JENIS_TKW.map(j=><option key={j}>{j}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" type="date" value={form.tarikh} onChange={e=>setForm(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={form.masa} onChange={e=>setForm(f=>({...f,masa:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Tempat</label><input className="form-input" value={form.tempat} onChange={e=>setForm(f=>({...f,tempat:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Penanggung Jawab</label><select className="form-input" value={form.penanggung_jawab} onChange={e=>setForm(f=>({...f,penanggung_jawab:e.target.value}))}>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select></div>
            </div>
            <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={form.catatan} onChange={e=>setForm(f=>({...f,catatan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">+ Tambah</button>
          </form></Modal>}
          {editItem&&<Modal title={`Edit — ${editItem.aktiviti}`} onClose={()=>setEditItem(null)}><form onSubmit={handleEdit}>
            <div className="form-field"><label className="form-label">Nama Aktiviti</label><input className="form-input" required value={editItem.aktiviti} onChange={e=>setEditItem(f=>({...f,aktiviti:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Jenis</label><select className="form-input" value={editItem.jenis||'Umum'} onChange={e=>setEditItem(f=>({...f,jenis:e.target.value}))}>{JENIS_TKW.map(j=><option key={j}>{j}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Tarikh</label><input className="form-input" type="date" value={editItem.tarikh||''} onChange={e=>setEditItem(f=>({...f,tarikh:e.target.value}))}/></div>
              <div className="form-field"><label className="form-label">Masa</label><input className="form-input" value={editItem.masa||''} onChange={e=>setEditItem(f=>({...f,masa:e.target.value}))}/></div>
            </div>
            <div className="form-field"><label className="form-label">Tempat</label><input className="form-input" value={editItem.tempat||''} onChange={e=>setEditItem(f=>({...f,tempat:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Penanggung Jawab</label><select className="form-input" value={editItem.penanggung_jawab||GURU_KOKU[0]} onChange={e=>setEditItem(f=>({...f,penanggung_jawab:e.target.value}))}>{GURU_KOKU.map(g=><option key={g}>{g}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Status</label><select className="form-input" value={editItem.status} onChange={e=>setEditItem(f=>({...f,status:e.target.value}))}><option>Akan Datang</option><option>Semasa</option><option>Selesai</option></select></div>
            </div>
            <div className="form-field"><label className="form-label">Catatan</label><input className="form-input" value={editItem.catatan||''} onChange={e=>setEditItem(f=>({...f,catatan:e.target.value}))}/></div>
            <button className="btn-primary" type="submit">💾 Simpan</button>
          </form></Modal>}
        </>)}
        {subtab===1&&(<>
          {byBulan.length===0?<div style={{textAlign:'center',padding:40,color:'var(--text2)'}}>Tiada aktiviti dengan tarikh ditetapkan.</div>:(
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {byBulan.map(({bulan,items})=>(
              <div key={bulan} style={{background:'var(--card2)',borderRadius:12,padding:16}}>
                <p style={{fontWeight:700,fontSize:15,marginBottom:10}}>📆 {bulan} <span style={{fontWeight:400,fontSize:13,color:'var(--text2)'}}>({items.length} aktiviti)</span></p>
                <table className="kur-table">
                  <thead><tr><th>Aktiviti</th><th>Jenis</th><th>Tarikh</th><th>Masa</th><th>Tempat</th><th>Status</th></tr></thead>
                  <tbody>{items.map(p=>(
                    <tr key={p.id}>
                      <td style={{fontWeight:700}}>{p.aktiviti}</td>
                      <td><span className="badge b-blue">{p.jenis}</span></td>
                      <td style={{fontSize:12,color:'var(--text2)'}}>{p.tarikh}</td>
                      <td style={{fontSize:12}}>{p.masa}</td>
                      <td style={{fontSize:12}}>{p.tempat}</td>
                      <td><span className={`badge ${stC[p.status]||'b-gray'}`}>{p.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ))}
          </div>)}
        </>)}
        {subtab===2&&(<>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div style={{background:'var(--card2)',borderRadius:12,padding:16}}>
              <p style={{fontWeight:700,marginBottom:10,fontSize:14}}>📂 Aktiviti Mengikut Jenis</p>
              <table className="kur-table">
                <thead><tr><th>Jenis</th><th>Jumlah</th><th>Selesai</th><th>Bar</th></tr></thead>
                <tbody>{byJenis.map(r=>(
                  <tr key={r.jenis}>
                    <td><span className="badge b-blue">{r.jenis}</span></td>
                    <td style={{fontWeight:700}}>{r.total}</td>
                    <td style={{color:'#16a34a',fontWeight:700}}>{r.selesai}</td>
                    <td><div style={{background:'#e2e8f0',borderRadius:4,height:10,width:100}}><div style={{background:'var(--accent)',borderRadius:4,height:10,width:`${data.length?Math.round(r.total/data.length*100):0}%`}}/></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div style={{background:'var(--card2)',borderRadius:12,padding:16}}>
              <p style={{fontWeight:700,marginBottom:10,fontSize:14}}>✅ Status Keseluruhan</p>
              {['Akan Datang','Semasa','Selesai'].map(s=>{const n=data.filter(d=>d.status===s).length;const pct=data.length?Math.round(n/data.length*100):0;return(<div key={s} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:3}}><span><span className={`badge ${stC[s]}`}>{s}</span></span><span style={{fontWeight:700}}>{n} ({pct}%)</span></div>
                <div style={{background:'#e2e8f0',borderRadius:4,height:10}}><div style={{background:s==='Selesai'?'#16a34a':s==='Semasa'?'#2563eb':'#d97706',borderRadius:4,height:10,width:`${pct}%`}}/></div>
              </div>);})}
              <div style={{marginTop:16,paddingTop:12,borderTop:'1px solid var(--border)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:18}}>{data.length?Math.round(data.filter(d=>d.status==='Selesai').length/data.length*100):0}%</div><div style={{fontSize:11,color:'var(--text2)'}}>% Selesai</div></div>
                <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:18}}>{[...new Set(data.map(d=>d.penanggung_jawab).filter(Boolean))].length}</div><div style={{fontSize:11,color:'var(--text2)'}}>Guru Terlibat</div></div>
              </div>
            </div>
          </div>
        </>)}
      </>)}
    </KurPage>
  );
}

function KokurikulumPage({ subId, onNav }) {
  const m = MODULES.find(x=>x.id==="kokurikulum");
  const idx = m?.ids.indexOf(subId)??-1;
  const sName = idx>=0 ? m.subs[idx] : "";

  const KOKU_DRIVE = {
    kelab:      { id:"1wFtxuux7tXmRoZVI9BkhlcypldUW7vyt", title:"Kelab & Persatuan" },
    uniform:    { id:"1sUjvtWxlGP8xYA7dEvrkxUoOdrs1nVwW", title:"Badan Beruniform" },
    sukan:      { id:"1LQF8gXWk2ia_b1p08UaEvaXjaabEuSWo", title:"Sukan & Permainan" },
    pajsk:      { id:"1ZZfrczGl4mZF8CO1VZTsM7YyFsE4UWFf", title:"PAJSK" },
    profil:     { id:"1106_i4zpD_zCjUZ2Zi0Wwz5VgUuCIIR2", title:"Profil Murid Koku" },
    pencapaian: { id:"1WsNgIv6j87bp__RbMGbECPeKW6T_aP2i", title:"Pencapaian" },
    takwim:     { id:"139jzC-Eeak6xdBvaKBHhCDZmOq-Sjwrz",  title:"Takwim Kokurikulum" },
  };

  const views = {
    kelab:      <KelabPersatuan />,
    uniform:    <BadanBeruniform />,
    sukan:      <SukanPermainan />,
    pajsk:      <PAJSKPage />,
    profil:     <ProfilMuridKoku />,
    pencapaian: <PencapaianKoku />,
    takwim:     <TakwimKokurikulum />,
    drive:      <DriveFolderView folderId="1ZB8Efb6JMklpAFNuzhts_OlGGwBk5_c6" title="eKokurikulum (Semua Fail)" driveUrl="https://drive.google.com/drive/folders/1ZB8Efb6JMklpAFNuzhts_OlGGwBk5_c6?usp=sharing"/>,
  };

  return (
    <div>
      <div className="pg-top" style={{marginBottom:14}}>
        <div className="pg-chip" style={{color:"#0077b6",borderColor:"#bfdbfe"}} onClick={()=>onNav(null,null)}>🏠 Papan Pemuka</div>
        <span className="pg-sep">›</span>
        <div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`}}>{m.icon} {m.label}</div>
        {sName&&<><span className="pg-sep">›</span><div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`,background:m.light}}>{sName}</div></>}
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
        {m.subs.map((s,i)=>(
          <button key={m.ids[i]} onClick={()=>onNav("kokurikulum",m.ids[i])} style={{padding:"7px 14px",borderRadius:12,border:`1.5px solid ${subId===m.ids[i]?m.color:"var(--border)"}`,background:subId===m.ids[i]?m.color:"var(--surface)",color:subId===m.ids[i]?"white":"var(--text2)",fontSize:12,fontWeight:800,fontFamily:"'Inter',sans-serif",cursor:"pointer",transition:"all 0.15s"}}>
            {s}
          </button>
        ))}
      </div>
      {views[subId] || <div style={{color:"var(--text2)",padding:40,textAlign:"center"}}>Pilih sub-modul</div>}
      {KOKU_DRIVE[subId] && <DrivePanelInline folderId={KOKU_DRIVE[subId].id} title={KOKU_DRIVE[subId].title}/>}
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
          <button key={m.ids[i]} onClick={()=>onNav("pentadbiran",m.ids[i])} style={{padding:"7px 14px",borderRadius:12,border:`1.5px solid ${subId===m.ids[i]?m.color:"var(--border)"}`,background:subId===m.ids[i]?m.color:"var(--surface)",color:subId===m.ids[i]?"white":"var(--text2)",fontSize:12,fontWeight:800,fontFamily:"'Inter',sans-serif",cursor:"pointer",transition:"all 0.15s"}}>
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
  return (
    <div style={{marginTop:24,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"60px 20px",borderRadius:20,border:"2px dashed var(--border)",background:"var(--surface)",minHeight:300,gap:20}}>
      <div style={{fontSize:52}}>🌐</div>
      <div style={{fontWeight:900,fontSize:20,color:"var(--text1)",textAlign:"center"}}>{title}</div>
      <div style={{fontSize:13,color:"var(--text3)",fontWeight:700,background:"var(--surface2)",padding:"6px 14px",borderRadius:8,fontFamily:"monospace",maxWidth:480,wordBreak:"break-all",textAlign:"center"}}>{url}</div>
      <a href={url} target="_blank" rel="noopener noreferrer"
        style={{display:"inline-flex",alignItems:"center",gap:8,padding:"14px 32px",borderRadius:12,
          background:"var(--primary)",color:"white",fontSize:15,fontWeight:900,textDecoration:"none",
          boxShadow:"0 4px 16px rgba(37,99,235,.3)",transition:"opacity .15s"}}
        onMouseEnter={e=>e.currentTarget.style.opacity=".85"}
        onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
        <span style={{fontSize:18}}>↗</span> Buka {title}
      </a>
      <div style={{fontSize:11,color:"var(--text3)"}}>Akan dibuka dalam tab baru</div>
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
function ICTPage({ onNav }) {
  const m = MODULES.find(x=>x.id==="ict");
  return (
    <div>
      <div className="pg-top" style={{marginBottom:14}}>
        <div className="pg-chip" style={{color:"#2563eb",borderColor:"#bfdbfe"}} onClick={()=>onNav(null,null)}>🏠 Papan Pemuka</div>
        <span className="pg-sep">›</span>
        <div className="pg-chip" style={{color:m.color,borderColor:`${m.color}40`}}>{m.icon} {m.label}</div>
      </div>
      <div className="pg-title">ICT / Makmal</div>
      <div className="pg-sub">Modul ICT · SK Darau, Kota Kinabalu</div>
      <EmbedFrame url={ICT_APP_URL} title="Dashboard ICT Sekolah" />
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
          <button key={m.ids[i]} onClick={()=>onNav("prasekolah",m.ids[i])} style={{padding:"7px 14px",borderRadius:12,border:`1.5px solid ${subId===m.ids[i]?m.color:"var(--border)"}`,background:subId===m.ids[i]?m.color:"var(--surface)",color:subId===m.ids[i]?"white":"var(--text2)",fontSize:12,fontWeight:800,fontFamily:"'Inter',sans-serif",cursor:"pointer",transition:"all 0.15s"}}>
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
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [sbOpen, setSbOpen] = useState(false);
  const [exp, setExp] = useState("");
  const [actMod, setActMod] = useState(null);
  const [actSub, setActSub] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("edu-theme") || "light");
  const [unreadTickets, setUnreadTickets] = useState(0);

  useEffect(() => {
    localStorage.removeItem("edu-user");

    // Detect invite / password-reset from URL hash — force set-password screen
    const urlHash = window.location.hash;
    const isInvite   = urlHash.includes('type=invite');
    const isRecovery = urlHash.includes('type=recovery');
    const needsReset = isInvite || isRecovery;
    if (needsReset) {
      setShowReset(true);
      window.history.replaceState(null, '', window.location.pathname);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !needsReset) {
        const u = session.user;
        const name = u.user_metadata?.name || u.user_metadata?.full_name || u.email.split("@")[0];
        const role = u.user_metadata?.role || "Guru";
        setUser({ name, role, email: u.email });
      }
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setShowReset(true);
        return;
      }
      if (!session) { setUser(null); setShowReset(false); return; }
      // Don't auto-login when set-password screen is active
      if (event === "SIGNED_IN" && needsReset) return;
      const u = session.user;
      const name = u.user_metadata?.name || u.user_metadata?.full_name || u.email.split("@")[0];
      const role = u.user_metadata?.role || "Guru";
      setUser({ name, role, email: u.email });
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("edu-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!user || user.email !== import.meta.env.VITE_ADMIN_EMAIL) return; // super admin only
    const fetchUnread = () =>
      supabase.from("support_tickets").select("id", { count:"exact", head:true })
        .eq("dibaca_admin", false).then(({ count }) => setUnreadTickets(count || 0));
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const onNav = (mod, sub) => { setActMod(mod); setActSub(sub); if(mod) setExp(mod); };
  const m = MODULES.find(x=>x.id===actMod);
  const idx = m?.ids.indexOf(actSub)??-1;
  const sName = idx>=0 ? m.subs[idx] : "";
  const initials = user ? user.name.split(" ").map(w=>w[0]).join("").slice(0,2) : "";

  // Public view — no auth needed
  const isPublicMode = new URLSearchParams(window.location.search).has('public');
  if (isPublicMode) return <PublicView />;

  if (!authChecked) return (
    <><style>{CSS}</style>
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#dbeafe,#eff6ff,#e0f2fe)"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#2563eb",animation:"float 2s ease-in-out infinite"}}>🏫 &nbsp;Memuatkan...</div>
    </div></>
  );

  if (showReset) return <WelcomeSetPassword onDone={(u)=>{ setShowReset(false); setUser(u); }}/>;

  if (!user) return <Login onLogin={u=>setUser(u)}/>;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <Sidebar open={sbOpen} onClose={()=>setSbOpen(false)}
          exp={exp} setExp={setExp} actMod={actMod} actSub={actSub}
          onNav={onNav} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); }}
          unreadTickets={unreadTickets}/>

        <div className="main">
          <div className="topbar">
            <button className="tb-hamburger" onClick={()=>setSbOpen(true)}>☰</button>
            <div className="tb-bread">
              <span style={{cursor:"pointer",fontSize:16}} onClick={()=>onNav(null,null)}>🏠</span>
              {actMod==="admin"&&<><span className="tb-sep">›</span><span className="cur">⚙️ Panel Admin</span></>}
              {actMod==="support"&&<><span className="tb-sep">›</span><span className="cur">🆘 Bantuan & Aduan</span></>}
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
              : actMod==="support"
                ? <SupportPanel user={user}/>
                : actMod==="admin"
                  ? <AdminPanel />
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
                            : actMod==="opr"
                              ? actSub==="drive"
                                ? <DriveFolderView folderId="1uzANo3j3XIorOcABBpSkgrQ9jp9TZr-N" title="ePBD SK Darau" driveUrl="https://drive.google.com/drive/folders/1uzANo3j3XIorOcABBpSkgrQ9jp9TZr-N?usp=drive_link"/>
                                : <OPRPage />
                              : <Page modId={actMod} subId={actSub}/>}
          </div>
        </div>
      </div>
      <Toast />
    </>
  );
}
