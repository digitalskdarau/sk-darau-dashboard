import { useState, useEffect } from "react";

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

const UPDATES = [
  { icon:"📅", text:"Mesyuarat Kurikulum Bil.3 — Jumaat ini 2:00 PM", tag:"Segera", tc:"#ef4444", bg:"#fef2f2" },
  { icon:"📋", text:"PAJSK suku 2 perlu dikemaskini sebelum 30 Jun", tag:"Peringatan", tc:"#f59e0b", bg:"#fffbeb" },
  { icon:"📦", text:"Laporan Aset JKPAK Q2 berjaya dijana", tag:"Selesai", tc:"#22c55e", bg:"#f0fdf4" },
  { icon:"👦", text:"12 murid baharu didaftarkan minggu ini", tag:"Baharu", tc:"#2563eb", bg:"#eff6ff" },
];

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
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800&display=swap');

/* ══ THEME TOKENS ══════════════════════════════════════════════════════════ */
:root {
  --bg:           #eef2ff;
  --bg2:          #f8faff;
  --surface:      rgba(255,255,255,0.72);
  --surface-s:    #ffffff;
  --border:       rgba(147,197,253,0.5);
  --border-s:     #dbeafe;
  --divider:      rgba(147,197,253,0.3);
  --shadow:       0 2px 16px rgba(37,99,235,0.08);
  --shadow-md:    0 8px 32px rgba(37,99,235,0.12);
  --shadow-lg:    0 16px 48px rgba(37,99,235,0.16);
  --text:         #0f172a;
  --text2:        #475569;
  --text3:        #94a3b8;
  --accent:       #2563eb;
  --accent-lt:    #eff6ff;
  --accent-ring:  rgba(37,99,235,0.2);
  --sb-bg:        rgba(255,255,255,0.92);
  --tb-bg:        rgba(255,255,255,0.88);
  --input-bg:     #f8faff;
  --input-br:     #dbeafe;
  --scroll:       #93c5fd;
  --aurora1:      rgba(37,99,235,0.06);
  --aurora2:      rgba(99,102,241,0.04);
  --aurora3:      rgba(14,165,233,0.03);
  --blur:         blur(20px) saturate(160%);
}

[data-theme="dark"] {
  --bg:           #050b19;
  --bg2:          #091223;
  --surface:      rgba(8,18,42,0.72);
  --surface-s:    #0c1832;
  --border:       rgba(255,255,255,0.065);
  --border-s:     rgba(255,255,255,0.065);
  --divider:      rgba(255,255,255,0.05);
  --shadow:       0 2px 16px rgba(0,0,0,0.45);
  --shadow-md:    0 8px 32px rgba(0,0,0,0.55);
  --shadow-lg:    0 16px 48px rgba(0,0,0,0.65);
  --text:         #e2e8f0;
  --text2:        #94a3b8;
  --text3:        #3d4d63;
  --accent:       #3b82f6;
  --accent-lt:    rgba(59,130,246,0.1);
  --accent-ring:  rgba(59,130,246,0.15);
  --sb-bg:        rgba(5,11,25,0.96);
  --tb-bg:        rgba(5,11,25,0.9);
  --input-bg:     rgba(255,255,255,0.04);
  --input-br:     rgba(255,255,255,0.08);
  --scroll:       #1e3a8a;
  --aurora1:      rgba(37,99,235,0.14);
  --aurora2:      rgba(99,102,241,0.10);
  --aurora3:      rgba(14,165,233,0.08);
}

/* ══ BASE ══════════════════════════════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
html { font-size:16px; }

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
  min-height: 100vh;
  transition: background 0.35s, color 0.35s;
  position: relative;
}

body::before {
  content:'';
  position:fixed; inset:0;
  pointer-events:none; z-index:0;
  background:
    radial-gradient(ellipse 70% 55% at 10% 10%, var(--aurora1) 0%, transparent 55%),
    radial-gradient(ellipse 55% 45% at 90% 90%, var(--aurora2) 0%, transparent 55%),
    radial-gradient(ellipse 40% 60% at 60% -10%, var(--aurora3) 0%, transparent 50%);
  transition: background 0.6s;
}

::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-thumb { background:var(--scroll); border-radius:4px; }

/* ══ KEYFRAMES ═════════════════════════════════════════════════════════════ */
@keyframes float {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-8px); }
}
@keyframes wiggle {
  0%,100% { transform:rotate(-2deg); }
  50%     { transform:rotate(2deg); }
}
@keyframes pop {
  0%   { transform:scale(0.92); opacity:0; }
  100% { transform:scale(1); opacity:1; }
}
@keyframes slideUp {
  0%   { transform:translateY(18px); opacity:0; }
  100% { transform:translateY(0); opacity:1; }
}
@keyframes pulse-ring {
  0%,100% { box-shadow:0 0 0 0 var(--accent-ring); }
  50%     { box-shadow:0 0 0 8px transparent; }
}
@keyframes cycleIn {
  0%   { opacity:0; transform:translateY(10px); }
  18%  { opacity:1; transform:translateY(0); }
  78%  { opacity:1; transform:translateY(0); }
  100% { opacity:0; transform:translateY(-10px); }
}
@keyframes shimmer {
  0%   { background-position:200% center; }
  100% { background-position:-200% center; }
}
@keyframes glow-pulse {
  0%,100% { opacity:0.5; }
  50%     { opacity:1; }
}

.cycle-text {
  display:inline-block;
  animation: cycleIn 3.8s cubic-bezier(.4,0,.2,1) forwards;
}

/* ══ GLASS UTILITY ═════════════════════════════════════════════════════════ */
.glass {
  background: var(--surface);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  transition: background 0.35s, border-color 0.35s, box-shadow 0.35s;
}

/* ══════════════════════════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════════════════════════ */
.login-page {
  min-height:100vh;
  display:flex; align-items:center; justify-content:center;
  padding:20px 16px;
  background:linear-gradient(160deg,#0f1f4a 0%,#1d4ed8 55%,#3b82f6 100%);
  position:relative; overflow:hidden;
}

.blob {
  position:absolute; border-radius:50%;
  pointer-events:none;
  animation:float 6s ease-in-out infinite;
}

.login-card {
  position:relative; z-index:1;
  width:100%; max-width:420px;
  background:rgba(255,255,255,0.94);
  backdrop-filter:blur(24px) saturate(180%);
  -webkit-backdrop-filter:blur(24px) saturate(180%);
  border-radius:28px;
  padding:36px 28px 32px;
  border:1px solid rgba(255,255,255,0.6);
  box-shadow:0 32px 80px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.8);
  animation:pop 0.45s cubic-bezier(.34,1.56,.64,1) both;
}

.lc-logo { display:flex; align-items:center; gap:12px; margin-bottom:24px; }
.lc-mark {
  width:52px; height:52px; border-radius:16px; flex-shrink:0;
  background:linear-gradient(135deg,#1d4ed8,#3b82f6);
  display:flex; align-items:center; justify-content:center;
  font-size:24px;
  box-shadow:0 8px 24px rgba(37,99,235,0.4);
  animation:pulse-ring 2.5s ease-in-out infinite;
}
.lc-name { font-family:'Playfair Display',serif; font-size:18px; font-weight:900; color:#0f172a; }
.lc-school { font-size:12px; color:#64748b; font-weight:600; margin-top:1px; font-style:italic; }

.lc-greet { margin-bottom:22px; padding-bottom:22px; border-bottom:2px dashed rgba(147,197,253,0.5); }
.lc-greet h1 {
  font-family:'Playfair Display',serif;
  font-size:24px; font-weight:900; color:#0f172a;
  margin-bottom:4px; line-height:1.2;
}
.lc-greet p { font-size:14px; color:#64748b; font-weight:600; font-style:italic; }

.lc-hint {
  background:linear-gradient(135deg,#f0fdf4,#dcfce7);
  border:2px solid #86efac; border-radius:14px;
  padding:13px 15px; margin-bottom:22px;
  display:flex; align-items:flex-start; gap:10px;
}
.lc-hint-ico { font-size:20px; flex-shrink:0; animation:wiggle 2s ease-in-out infinite; }
.lc-hint-body { font-size:13px; color:#15803d; font-weight:700; line-height:1.5; }
.lc-hint-body small { display:block; font-weight:600; color:#16a34a; margin-top:3px; }

.lc-field { margin-bottom:16px; }
.lc-label {
  display:block; font-size:11px; font-weight:900;
  color:#1d4ed8; letter-spacing:0.1em;
  text-transform:uppercase; margin-bottom:8px;
}
.lc-input {
  width:100%; padding:13px 16px;
  background:#f8faff; border:2px solid #dbeafe; border-radius:14px;
  font-size:15px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif; color:#0f172a;
  outline:none; transition:all 0.2s;
  box-shadow:inset 0 2px 6px rgba(37,99,235,0.04);
}
.lc-input:focus { border-color:#3b82f6; box-shadow:0 0 0 4px rgba(59,130,246,0.13),inset 0 2px 6px rgba(37,99,235,0.04); background:white; }
.lc-input::placeholder { color:#cbd5e1; font-weight:500; }

.lc-pw { position:relative; }
.lc-pw .lc-input { padding-right:50px; }
.lc-pw-btn {
  position:absolute; right:14px; top:50%; transform:translateY(-50%);
  background:none; border:none; cursor:pointer; font-size:20px; padding:4px;
  transition:transform 0.15s;
}
.lc-pw-btn:hover { transform:translateY(-50%) scale(1.15); }

.lc-err {
  background:#fef2f2; border:2px solid #fca5a5;
  border-radius:12px; padding:12px 14px;
  font-size:13.5px; color:#dc2626; font-weight:700;
  margin-bottom:14px; display:flex; gap:8px; align-items:center;
}
.lc-btn {
  width:100%; padding:15px;
  background:linear-gradient(135deg,#1d4ed8,#3b82f6);
  border:none; border-radius:16px;
  color:white; font-size:16px; font-weight:900;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; margin-top:4px;
  box-shadow:0 6px 24px rgba(37,99,235,0.4);
  transition:all 0.22s; letter-spacing:0.02em;
  position:relative; overflow:hidden;
}
.lc-btn::after {
  content:''; position:absolute; inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,0.18),transparent);
  pointer-events:none;
}
.lc-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 36px rgba(37,99,235,0.48); }
.lc-btn:active { transform:translateY(0); }
.lc-btn:disabled { opacity:0.6; cursor:not-allowed; }
.lc-foot { text-align:center; margin-top:18px; font-size:12px; color:#94a3b8; font-weight:600; }

/* ══════════════════════════════════════════════════════════════════════════
   APP SHELL
══════════════════════════════════════════════════════════════════════════ */
.app { display:flex; min-height:100vh; position:relative; z-index:1; }

/* ── SIDEBAR ── */
.sidebar {
  width:262px; flex-shrink:0;
  background:var(--sb-bg);
  backdrop-filter:var(--blur);
  -webkit-backdrop-filter:var(--blur);
  border-right:1px solid var(--border);
  display:flex; flex-direction:column;
  height:100vh; position:sticky; top:0;
  overflow-y:auto;
  box-shadow:2px 0 24px rgba(0,0,0,0.08);
  transition:transform 0.3s cubic-bezier(.4,0,.2,1), background 0.35s, border-color 0.35s;
  z-index:200;
}
.sb-overlay {
  display:none; position:fixed; inset:0;
  background:rgba(5,11,25,0.55); z-index:190;
  backdrop-filter:blur(6px);
}

.sb-top {
  padding:18px 16px 14px;
  border-bottom:1px solid var(--divider);
  transition:border-color 0.35s;
}
.sb-logo { display:flex; align-items:center; gap:10px; }
.sb-mark {
  width:40px; height:40px; border-radius:12px; flex-shrink:0;
  background:linear-gradient(135deg,#1d4ed8,#3b82f6);
  display:flex; align-items:center; justify-content:center;
  font-size:20px; box-shadow:0 4px 16px rgba(37,99,235,0.35);
}
.sb-name { font-family:'Playfair Display',serif; font-size:13.5px; font-weight:900; color:var(--text); transition:color 0.35s; }
.sb-school { font-size:11px; color:var(--text3); font-weight:600; margin-top:1px; font-style:italic; transition:color 0.35s; }

.sb-mood {
  margin-top:14px; padding:10px 12px;
  background:var(--accent-lt);
  border:1px dashed var(--border);
  border-radius:14px;
  display:flex; align-items:center; gap:8px;
  transition:background 0.35s, border-color 0.35s;
}
.sb-mood-ico { font-size:22px; animation:float 3s ease-in-out infinite; }
.sb-mood-text { font-size:12px; font-weight:700; color:var(--accent); line-height:1.3; transition:color 0.35s; }

.sb-nav { flex:1; padding:10px; overflow-y:auto; }
.sb-sec-lbl {
  font-size:9.5px; font-weight:900; color:var(--text3);
  letter-spacing:0.12em; text-transform:uppercase;
  padding:12px 8px 5px; transition:color 0.35s;
}
.sb-btn {
  width:100%; display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:14px; margin-bottom:3px;
  background:transparent; border:none; cursor:pointer;
  color:var(--text2); font-size:13.5px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif; text-align:left;
  transition:all 0.18s;
}
.sb-btn:hover { background:var(--accent-lt); color:var(--accent); transform:translateX(2px); }
.sb-btn.dash {
  background:var(--accent-lt);
  color:var(--accent); font-weight:800;
  border:1.5px solid var(--border);
}
.sb-btn.act {
  background:var(--accent-lt); color:var(--accent); font-weight:800;
  border-left:3px solid var(--accent); padding-left:9px;
}
.sb-ico { font-size:17px; width:24px; text-align:center; flex-shrink:0; }
.sb-chev { margin-left:auto; font-size:10px; color:var(--text3); font-weight:900; transition:transform 0.22s, color 0.35s; }
.sb-chev.open { transform:rotate(90deg); }

.subnav { padding-left:10px; margin-left:22px; border-left:2px solid var(--divider); padding-bottom:3px; transition:border-color 0.35s; }
.sub-btn {
  width:100%; display:flex; align-items:center; gap:8px;
  padding:8px 10px; border-radius:10px; margin-bottom:2px;
  background:transparent; border:none; cursor:pointer;
  color:var(--text2); font-size:13px; font-weight:600;
  font-family:'Plus Jakarta Sans',sans-serif; text-align:left; transition:all 0.12s;
}
.sub-btn:hover { color:var(--accent); background:var(--accent-lt); }
.sub-btn.act { color:var(--accent); background:var(--accent-lt); font-weight:800; }
.sub-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; opacity:0.45; }

.sb-foot {
  padding:12px 10px;
  border-top:1px solid var(--divider);
  transition:border-color 0.35s;
}
.sb-user {
  display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:14px;
  background:var(--accent-lt); border:1px solid var(--border);
  margin-bottom:8px;
  transition:background 0.35s, border-color 0.35s;
}
.sb-av {
  width:38px; height:38px; border-radius:12px; flex-shrink:0;
  background:linear-gradient(135deg,#1d4ed8,#6366f1);
  display:flex; align-items:center; justify-content:center;
  color:white; font-size:13px; font-weight:900;
  box-shadow:0 3px 10px rgba(37,99,235,0.3);
}
.sb-uname { font-size:13px; font-weight:800; color:var(--text); transition:color 0.35s; }
.sb-urole { font-size:11px; color:var(--text3); font-weight:600; font-style:italic; transition:color 0.35s; }
.sb-out {
  width:100%; display:flex; align-items:center; gap:8px;
  padding:9px 12px; border-radius:10px;
  background:transparent; border:none; cursor:pointer;
  color:var(--text3); font-size:13.5px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.15s;
}
.sb-out:hover { background:rgba(239,68,68,0.08); color:#ef4444; }

/* ── TOPBAR ── */
.topbar {
  height:60px;
  background:var(--tb-bg);
  backdrop-filter:var(--blur);
  -webkit-backdrop-filter:var(--blur);
  border-bottom:1px solid var(--border);
  display:flex; align-items:center;
  padding:0 18px; gap:12px;
  position:sticky; top:0; z-index:100;
  box-shadow:0 2px 16px rgba(0,0,0,0.06);
  transition:background 0.35s, border-color 0.35s;
}
.tb-hamburger {
  display:none;
  background:var(--accent-lt); border:1px solid var(--border); border-radius:11px;
  width:40px; height:40px; align-items:center; justify-content:center;
  cursor:pointer; font-size:19px; flex-shrink:0;
  transition:transform 0.15s, background 0.35s;
}
.tb-hamburger:hover { transform:scale(1.08); }
.tb-bread {
  display:flex; align-items:center; gap:6px;
  font-size:13px; color:var(--text2); font-weight:600;
  min-width:0; flex:1; transition:color 0.35s;
}
.tb-bread .cur { color:var(--text); font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; transition:color 0.35s; }
.tb-sep { color:var(--text3); font-weight:900; flex-shrink:0; transition:color 0.35s; }
.tb-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }

.tb-theme {
  width:38px; height:38px; border-radius:11px;
  background:var(--accent-lt); border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  font-size:17px; cursor:pointer;
  transition:all 0.2s; flex-shrink:0;
}
.tb-theme:hover { transform:scale(1.1) rotate(12deg); box-shadow:0 4px 12px var(--accent-ring); }

.tb-notif {
  width:38px; height:38px; border-radius:11px;
  background:var(--accent-lt); border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  font-size:18px; cursor:pointer; position:relative;
  transition:all 0.2s;
}
.tb-notif:hover { transform:scale(1.1) rotate(-8deg); }
.tb-dot { position:absolute; top:7px; right:7px; width:8px; height:8px; border-radius:50%; background:#ef4444; border:2px solid var(--surface-s); }
.tb-user {
  display:flex; align-items:center; gap:8px;
  padding:5px 12px 5px 5px; border-radius:30px;
  background:var(--accent-lt); border:1px solid var(--border); cursor:pointer;
  transition:all 0.2s;
}
.tb-user:hover { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-ring); }
.tb-uav {
  width:30px; height:30px; border-radius:50%;
  background:linear-gradient(135deg,#1d4ed8,#6366f1);
  display:flex; align-items:center; justify-content:center;
  color:white; font-size:11px; font-weight:900; flex-shrink:0;
}
.tb-uname { font-size:13px; font-weight:800; color:var(--text); white-space:nowrap; transition:color 0.35s; }

/* ── CONTENT ── */
.main { flex:1; min-width:0; display:flex; flex-direction:column; }
.content { flex:1; padding:20px 18px 40px; }

/* ── HERO ── */
.hero {
  border-radius:24px; margin-bottom:6px;
  background:linear-gradient(135deg,#0f1f4a,#1d4ed8 50%,#2563eb);
  color:white; position:relative; overflow:hidden;
  border:1px solid rgba(147,197,253,0.2);
  box-shadow:0 12px 48px rgba(15,31,74,0.35);
  animation:slideUp 0.5s ease both;
}
[data-theme="dark"] .hero {
  box-shadow:0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.15);
}
.hero-glow {
  position:absolute; border-radius:50%; pointer-events:none;
  filter:blur(40px); opacity:0.3; animation:glow-pulse 4s ease-in-out infinite;
}
.hero-dots {
  position:absolute; inset:0; pointer-events:none;
  background-image:radial-gradient(rgba(255,255,255,0.08) 1px,transparent 1px);
  background-size:20px 20px;
}
.hero-body { padding:28px 24px 0; position:relative; z-index:1; }
.hero-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
.hero-emoji { font-size:52px; animation:float 4s ease-in-out infinite; line-height:1; flex-shrink:0; }
.hero-title {
  font-family:'Playfair Display',serif;
  font-size:22px; font-weight:900; margin-bottom:6px; line-height:1.2;
}
.hero-sub { font-size:14px; opacity:0.8; font-weight:600; font-style:italic; min-height:22px; }
.hero-date { font-size:12px; opacity:0.45; margin-top:5px; font-weight:600; font-style:italic; }
.hero-tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; margin-bottom:28px; }
.hero-tag {
  display:flex; align-items:center; gap:5px;
  background:rgba(255,255,255,0.1);
  border:1px solid rgba(255,255,255,0.18);
  border-radius:30px; padding:5px 14px;
  font-size:12px; font-weight:700;
  backdrop-filter:blur(8px);
  transition:background 0.15s;
}
.hero-tag:hover { background:rgba(255,255,255,0.18); }

/* ── BENTO STATS ── */
.bento-grid {
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:12px; margin-bottom:22px;
}
.bento-card {
  background:var(--surface);
  backdrop-filter:var(--blur);
  -webkit-backdrop-filter:var(--blur);
  border:1px solid var(--border);
  border-radius:20px; padding:20px 18px;
  position:relative; overflow:hidden;
  box-shadow:var(--shadow);
  transition:all 0.25s;
  animation:slideUp 0.5s ease both;
}
.bento-card:hover {
  transform:translateY(-4px);
  box-shadow:var(--shadow-md);
  border-color:var(--accent);
}
[data-theme="dark"] .bento-card:hover {
  box-shadow:var(--shadow-md), 0 0 20px var(--accent-ring);
}
.bento-accent-bar {
  position:absolute; left:0; top:0; bottom:0; width:4px; border-radius:20px 0 0 20px;
}
.bento-bg-circle {
  position:absolute; border-radius:50%; right:-18px; bottom:-18px;
  width:80px; height:80px; opacity:0.06;
}
.bento-ico { font-size:30px; margin-bottom:10px; display:block; }
.bento-val {
  font-family:'Playfair Display',serif;
  font-size:30px; font-weight:900; color:var(--text); line-height:1;
  transition:color 0.35s;
}
.bento-lbl { font-size:13px; color:var(--text2); font-weight:700; margin-top:4px; font-style:italic; transition:color 0.35s; }
.bento-note {
  font-size:11.5px; font-weight:700; margin-top:12px;
  padding-top:10px; border-top:1px dashed var(--divider);
  display:flex; align-items:center; gap:5px;
  transition:border-color 0.35s;
}

/* featured bento card — spans 2 cols */
.bento-featured {
  grid-column:span 2;
  padding:24px 22px;
  background:linear-gradient(135deg, var(--surface), var(--surface));
}
[data-theme="dark"] .bento-featured {
  background:rgba(37,99,235,0.06);
  border-color:rgba(59,130,246,0.18);
}
.bento-featured .bento-val { font-size:44px; }
.bento-featured .bento-lbl { font-size:15px; }
.bento-featured-inner { display:flex; align-items:center; justify-content:space-between; }
.bento-featured-left {}
.bento-featured-right { text-align:right; }
.bento-progress {
  width:120px; height:8px; border-radius:99px;
  background:var(--divider); margin-top:8px; overflow:hidden;
  margin-left:auto;
}
.bento-progress-fill {
  height:100%; border-radius:99px;
  background:linear-gradient(90deg,#22c55e,#4ade80);
  box-shadow:0 0 8px rgba(34,197,94,0.4);
}

/* ── SECTION HEADER ── */
.sec-hd {
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:14px; margin-top:24px;
}
.sec-title {
  font-family:'Playfair Display',serif;
  font-size:17px; font-weight:900; color:var(--text);
  display:flex; align-items:center; gap:8px;
  transition:color 0.35s;
}
.sec-sub { font-size:12.5px; color:var(--text3); font-weight:700; font-style:italic; transition:color 0.35s; }

/* ── UPDATES ── */
.updates { display:flex; flex-direction:column; gap:10px; margin-bottom:4px; }
.upd-card {
  background:var(--surface);
  backdrop-filter:var(--blur);
  -webkit-backdrop-filter:var(--blur);
  border:1px solid var(--border);
  border-radius:16px; padding:14px 16px;
  display:flex; align-items:center; gap:12px;
  box-shadow:var(--shadow);
  transition:all 0.2s; animation:slideUp 0.5s ease both;
}
.upd-card:hover {
  transform:translateX(4px);
  border-color:var(--accent);
  box-shadow:var(--shadow-md);
}
.upd-ico {
  width:42px; height:42px; border-radius:13px;
  display:flex; align-items:center; justify-content:center;
  font-size:20px; flex-shrink:0;
  transition:transform 0.2s;
}
.upd-card:hover .upd-ico { transform:scale(1.15) rotate(-5deg); }
.upd-text { flex:1; font-size:13.5px; font-weight:700; color:var(--text); transition:color 0.35s; }
.upd-tag { font-size:11.5px; font-weight:800; padding:4px 11px; border-radius:20px; white-space:nowrap; flex-shrink:0; }

/* ── MODULE CARDS ── */
.mods-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.mc {
  background:var(--surface);
  backdrop-filter:var(--blur);
  -webkit-backdrop-filter:var(--blur);
  border:1px solid var(--border);
  border-radius:20px; padding:18px 16px;
  cursor:pointer; box-shadow:var(--shadow);
  transition:all 0.25s; position:relative; overflow:hidden;
  animation:slideUp 0.5s ease both;
}
.mc:hover {
  transform:translateY(-5px) rotate(0.3deg);
  box-shadow:var(--shadow-lg);
  border-color:var(--accent);
}
[data-theme="dark"] .mc:hover {
  box-shadow:var(--shadow-lg), 0 0 24px var(--accent-ring);
}
.mc-blob {
  position:absolute; bottom:-20px; right:-20px;
  width:90px; height:90px; border-radius:50%; opacity:0.07;
  transition:transform 0.3s;
}
.mc:hover .mc-blob { transform:scale(1.3); }
.mc-tag {
  display:inline-flex; align-items:center; gap:4px;
  font-size:10.5px; font-weight:800; padding:3px 10px;
  border-radius:20px; margin-bottom:12px;
  border:1.5px solid currentColor;
  background:rgba(currentColor, 0.06);
}
.mc-ico-wrap { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.mc-ico {
  width:48px; height:48px; border-radius:15px;
  font-size:24px; display:flex; align-items:center; justify-content:center;
  transition:transform 0.2s;
}
[data-theme="dark"] .mc-ico { filter:brightness(0.75); }
.mc:hover .mc-ico { transform:scale(1.1) rotate(-5deg); }
.mc-count {
  font-family:'Playfair Display',serif;
  font-size:12px; font-weight:900; color:var(--text3);
  background:var(--accent-lt); border:1px solid var(--border);
  border-radius:20px; padding:3px 10px;
  transition:all 0.35s;
}
.mc-name {
  font-family:'Playfair Display',serif;
  font-weight:900; font-size:14px; color:var(--text);
  margin-bottom:10px; transition:color 0.35s;
}
.mc-pills { display:flex; flex-wrap:wrap; gap:5px; }
.mc-pill {
  padding:4px 10px; border-radius:9px;
  font-size:11.5px; font-weight:700; cursor:pointer;
  transition:all 0.14s; border:1px solid transparent;
}
[data-theme="dark"] .mc-pill { filter:brightness(0.7); }
.mc-pill:hover { transform:scale(1.05); filter:brightness(1) !important; }
.mc-more { padding:4px 10px; border-radius:9px; font-size:11.5px; font-weight:700; background:var(--accent-lt); color:var(--text3); }

/* ── PAGE VIEW ── */
.pg-top { display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
.pg-chip {
  display:flex; align-items:center; gap:5px;
  padding:5px 12px; border-radius:20px; border:1.5px solid currentColor;
  font-size:12px; font-weight:800; cursor:pointer; transition:all 0.15s;
}
.pg-chip:hover { transform:scale(1.05); }
.pg-sep { color:var(--text3); font-weight:900; font-size:14px; transition:color 0.35s; }
.pg-title {
  font-family:'Playfair Display',serif;
  font-size:24px; font-weight:900; color:var(--text);
  margin-bottom:4px; transition:color 0.35s;
}
.pg-sub { font-size:14px; color:var(--text2); font-weight:600; margin-bottom:22px; font-style:italic; transition:color 0.35s; }
.pg-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px; }
.pgs {
  background:var(--surface);
  backdrop-filter:var(--blur);
  -webkit-backdrop-filter:var(--blur);
  border:1px solid var(--border);
  border-radius:18px; padding:18px 14px;
  text-align:center;
  box-shadow:var(--shadow);
  transition:all 0.2s;
}
.pgs:hover { transform:translateY(-3px); box-shadow:var(--shadow-md); }
.pgs-ico { font-size:28px; margin-bottom:8px; display:block; }
.pgs-val { font-family:'Playfair Display',serif; font-size:20px; font-weight:900; color:var(--text); transition:color 0.35s; }
.pgs-lbl { font-size:12px; color:var(--text3); font-weight:700; margin-top:3px; font-style:italic; transition:color 0.35s; }

.placeholder {
  background:var(--surface);
  backdrop-filter:var(--blur);
  -webkit-backdrop-filter:var(--blur);
  border-radius:22px; border:2px dashed var(--border);
  padding:56px 28px; text-align:center;
  box-shadow:var(--shadow);
  position:relative; overflow:hidden;
  transition:background 0.35s, border-color 0.35s;
}
.ph-float { position:absolute; border-radius:50%; pointer-events:none; opacity:0.05; }
.ph-ico {
  width:84px; height:84px; border-radius:24px;
  font-size:40px; display:inline-flex; align-items:center; justify-content:center;
  margin-bottom:18px;
  animation:float 3.5s ease-in-out infinite;
  box-shadow:0 8px 28px rgba(37,99,235,0.18);
}
[data-theme="dark"] .ph-ico { filter:brightness(0.7); }
.ph-title {
  font-family:'Playfair Display',serif;
  font-size:20px; font-weight:900; color:var(--text);
  margin-bottom:10px; transition:color 0.35s;
}
.ph-text { font-size:14.5px; color:var(--text2); font-weight:600; line-height:1.7; max-width:340px; margin:0 auto 24px; font-style:italic; transition:color 0.35s; }
.ph-btn {
  display:inline-flex; align-items:center; gap:8px;
  background:var(--accent-lt); border:1.5px solid var(--border);
  border-radius:14px; padding:12px 24px;
  font-size:14px; font-weight:900; color:var(--accent);
  font-family:'Plus Jakarta Sans',sans-serif;
  animation:pulse-ring 2.5s ease-in-out infinite;
  transition:all 0.35s;
}

/* ══════════════════════════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════════════════════════ */
@media (max-width:768px) {
  .sidebar { position:fixed; left:0; top:0; bottom:0; transform:translateX(-100%); box-shadow:4px 0 32px rgba(0,0,0,0.18); }
  .sidebar.open { transform:translateX(0); }
  .sb-overlay.open { display:block; }
  .tb-hamburger { display:flex; }
  .tb-uname { display:none; }
  .content { padding:16px 14px 36px; }
  .hero-body { padding:22px 18px 0; }
  .hero-title { font-size:19px; }
  .hero-emoji { font-size:38px; }
  .bento-grid { gap:10px; }
  .bento-featured { grid-column:span 2; }
  .bento-featured .bento-val { font-size:32px; }
  .bento-progress { width:80px; }
  .mods-grid { gap:10px; }
  .mc { padding:15px 14px; }
  .pg-stats { gap:8px; }
  .pgs { padding:14px 10px; }
}
@media (max-width:380px) {
  .login-card { padding:28px 18px 24px; }
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

  const STATS = [
    { lbl:"Jumlah Murid",   val:387, ico:"👦",   color:"#2563eb", note:"📈 +12 tahun ini",       featured:true,  progress:77 },
    { lbl:"Jumlah Guru",    val:34,  ico:"👩‍🏫",  color:"#0ea5e9", note:"🆕 2 baru bulan ini" },
    { lbl:"Kehadiran",      val:94,  ico:"✅",    color:"#6366f1", note:"⬆️ Naik 2.1%",           suffix:"%" },
    { lbl:"Aktiviti Minggu",val:8,   ico:"📅",    color:"#0284c7", note:"🏅 3 kokurikulum" },
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
            {s.featured ? (
              <div className="bento-featured-inner">
                <div className="bento-featured-left">
                  <span className="bento-ico">{s.ico}</span>
                  <div className="bento-val"><Count to={s.val} suffix={s.suffix||""}/></div>
                  <div className="bento-lbl">{s.lbl}</div>
                  <div className="bento-note" style={{color:s.color}}>{s.note}</div>
                </div>
                <div className="bento-featured-right">
                  <div style={{fontSize:11,color:"var(--text3)",fontWeight:700,marginBottom:6,fontStyle:"italic"}}>Kapasiti sekolah</div>
                  <div style={{fontSize:28,fontFamily:"'Playfair Display',serif",fontWeight:900,color:s.color}}>77%</div>
                  <div className="bento-progress">
                    <div className="bento-progress-fill" style={{width:"77%"}}/>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <span className="bento-ico">{s.ico}</span>
                <div className="bento-val"><Count to={s.val} suffix={s.suffix||""}/></div>
                <div className="bento-lbl">{s.lbl}</div>
                <div className="bento-note" style={{color:s.color}}>{s.note}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Updates */}
      <div className="sec-hd">
        <div className="sec-title">📌 Notis & Kemaskini</div>
        <span className="sec-sub">{UPDATES.length} item</span>
      </div>
      <div className="updates" style={{marginBottom:8}}>
        {UPDATES.map((u,i)=>(
          <div className="upd-card" key={i} style={{animationDelay:`${i*0.07}s`}}>
            <div className="upd-ico" style={{background:u.bg}}>{u.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="upd-text">{u.text}</div>
            </div>
            <div className="upd-tag" style={{background:u.bg,color:u.tc}}>{u.tag}</div>
          </div>
        ))}
      </div>

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

  if (!user) return <Login onLogin={u=>setUser(u)}/>;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <Sidebar open={sbOpen} onClose={()=>setSbOpen(false)}
          exp={exp} setExp={setExp} actMod={actMod} actSub={actSub}
          onNav={onNav} user={user} onLogout={()=>setUser(null)}/>

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
              : <Page modId={actMod} subId={actSub}/>}
          </div>
        </div>
      </div>
    </>
  );
}
