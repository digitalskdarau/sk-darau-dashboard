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
function Wave({ color = "#eff6ff", flip = false }) {
  return (
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none"
      style={{ width:"100%", height:32, display:"block", transform: flip?"scaleY(-1)":"none" }}>
      <path d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z" fill={color}/>
    </svg>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Poppins:wght@700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
html { font-size: 16px; }
body {
  font-family: 'Nunito', sans-serif;
  background: #f0f5ff;
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
}
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #93c5fd; border-radius: 4px; }

/* ── KEYFRAMES ── */
@keyframes float {
  0%,100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes wiggle {
  0%,100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}
@keyframes pop {
  0% { transform: scale(0.92); opacity:0; }
  100% { transform: scale(1); opacity:1; }
}
@keyframes slideUp {
  0% { transform: translateY(16px); opacity:0; }
  100% { transform: translateY(0); opacity:1; }
}
@keyframes pulse-ring {
  0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.3); }
  50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ══════════════════════════════════
   LOGIN
══════════════════════════════════ */
.login-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 20px 16px;
  background: linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 55%, #3b82f6 100%);
  position: relative; overflow: hidden;
}

/* floating blobs */
.blob {
  position: absolute; border-radius: 50%;
  pointer-events: none; filter: blur(1px);
  animation: float 6s ease-in-out infinite;
}

.login-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 420px;
  background: white;
  border-radius: 28px;
  padding: 36px 28px 32px;
  box-shadow: 0 28px 72px rgba(0,0,0,0.22);
  animation: pop 0.45s cubic-bezier(.34,1.56,.64,1) both;
}

.lc-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.lc-mark {
  width: 52px; height: 52px; border-radius: 16px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  box-shadow: 0 6px 20px rgba(37,99,235,0.35);
  animation: pulse-ring 2.5s ease-in-out infinite;
}
.lc-name { font-family:'Poppins',sans-serif; font-size:18px; font-weight:900; color:#0f172a; }
.lc-school { font-size:12px; color:#64748b; font-weight:600; margin-top:1px; }

.lc-greet { margin-bottom:22px; padding-bottom:22px; border-bottom:2.5px dashed #dbeafe; }
.lc-greet h1 {
  font-family:'Poppins',sans-serif;
  font-size:24px; font-weight:900; color:#0f172a;
  margin-bottom:4px; line-height:1.2;
}
.lc-greet p { font-size:14px; color:#64748b; font-weight:600; }

.lc-hint {
  background: linear-gradient(135deg,#f0fdf4,#dcfce7);
  border: 2.5px solid #86efac;
  border-radius: 14px; padding:13px 15px;
  margin-bottom:22px;
  display:flex; align-items:flex-start; gap:10px;
}
.lc-hint-ico { font-size:20px; flex-shrink:0; animation:wiggle 2s ease-in-out infinite; }
.lc-hint-body { font-size:13px; color:#15803d; font-weight:700; line-height:1.5; }
.lc-hint-body small { display:block; font-weight:600; color:#16a34a; margin-top:3px; }

.lc-field { margin-bottom:16px; }
.lc-label {
  display:block; font-size:11.5px; font-weight:900;
  color:#1d4ed8; letter-spacing:0.07em;
  text-transform:uppercase; margin-bottom:8px;
}
.lc-input {
  width:100%; padding:13px 16px;
  background:#f8faff; border:2.5px solid #dbeafe; border-radius:14px;
  font-size:15px; font-weight:700;
  font-family:'Nunito',sans-serif; color:#0f172a;
  outline:none; transition: all 0.2s;
}
.lc-input:focus { border-color:#3b82f6; box-shadow:0 0 0 4px rgba(59,130,246,0.13); background:white; }
.lc-input::placeholder { color:#cbd5e1; font-weight:500; }

.lc-pw { position:relative; }
.lc-pw .lc-input { padding-right:50px; }
.lc-pw-btn {
  position:absolute; right:14px; top:50%; transform:translateY(-50%);
  background:none; border:none; cursor:pointer; font-size:20px; padding:4px;
  transition: transform 0.15s;
}
.lc-pw-btn:hover { transform: translateY(-50%) scale(1.15); }

.lc-err {
  background:#fef2f2; border:2.5px solid #fca5a5;
  border-radius:12px; padding:12px 14px;
  font-size:13.5px; color:#dc2626; font-weight:700;
  margin-bottom:14px; display:flex; gap:8px; align-items:center;
}
.lc-btn {
  width:100%; padding:15px;
  background: linear-gradient(135deg,#1d4ed8,#3b82f6);
  border:none; border-radius:16px;
  color:white; font-size:16px; font-weight:900;
  font-family:'Nunito',sans-serif;
  cursor:pointer; margin-top:4px;
  box-shadow: 0 6px 24px rgba(37,99,235,0.38);
  transition: all 0.22s; letter-spacing:0.02em;
  position:relative; overflow:hidden;
}
.lc-btn::after {
  content:''; position:absolute; inset:0;
  background: linear-gradient(135deg,rgba(255,255,255,0.15),transparent);
  pointer-events:none;
}
.lc-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 32px rgba(37,99,235,0.45); }
.lc-btn:active { transform:translateY(0); }
.lc-btn:disabled { opacity:0.6; cursor:not-allowed; }
.lc-foot { text-align:center; margin-top:18px; font-size:12px; color:#94a3b8; font-weight:600; }

/* ══════════════════════════════════
   APP SHELL
══════════════════════════════════ */
.app { display:flex; min-height:100vh; }

/* ── SIDEBAR ── */
.sidebar {
  width:262px; flex-shrink:0;
  background:white;
  border-right:2.5px solid #dbeafe;
  display:flex; flex-direction:column;
  height:100vh; position:sticky; top:0;
  overflow-y:auto;
  box-shadow: 2px 0 20px rgba(37,99,235,0.08);
  transition: transform 0.3s cubic-bezier(.4,0,.2,1);
  z-index:200;
}
.sb-overlay {
  display:none; position:fixed; inset:0;
  background:rgba(15,23,42,0.45); z-index:190;
  backdrop-filter:blur(3px);
}

.sb-top { padding:18px 16px 14px; border-bottom:2.5px solid #dbeafe; }
.sb-logo { display:flex; align-items:center; gap:10px; }
.sb-mark {
  width:40px; height:40px; border-radius:12px; flex-shrink:0;
  background:linear-gradient(135deg,#1d4ed8,#3b82f6);
  display:flex; align-items:center; justify-content:center;
  font-size:20px; box-shadow:0 4px 14px rgba(37,99,235,0.3);
}
.sb-name { font-family:'Poppins',sans-serif; font-size:13.5px; font-weight:900; color:#0f172a; }
.sb-school { font-size:11px; color:#64748b; font-weight:600; margin-top:1px; }

/* fun mood strip */
.sb-mood {
  margin-top:14px; padding:10px 12px;
  background:linear-gradient(135deg,#eff6ff,#f5f3ff);
  border:2px dashed #c7d2fe; border-radius:12px;
  display:flex; align-items:center; gap:8px;
}
.sb-mood-ico { font-size:22px; animation:float 3s ease-in-out infinite; }
.sb-mood-text { font-size:12px; font-weight:700; color:#4338ca; line-height:1.3; }
.sb-mood-sub { font-size:10.5px; color:#818cf8; font-weight:600; }

.sb-nav { flex:1; padding:10px; overflow-y:auto; }
.sb-sec-lbl {
  font-size:9.5px; font-weight:900; color:#93c5fd;
  letter-spacing:0.12em; text-transform:uppercase;
  padding:12px 8px 5px;
}
.sb-btn {
  width:100%; display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:14px; margin-bottom:3px;
  background:transparent; border:none; cursor:pointer;
  color:#475569; font-size:13.5px; font-weight:700;
  font-family:'Nunito',sans-serif; text-align:left;
  transition: all 0.18s;
}
.sb-btn:hover { background:#eff6ff; color:#2563eb; transform:translateX(2px); }
.sb-btn.dash { background:linear-gradient(135deg,#eff6ff,#e0e7ff); color:#1d4ed8; font-weight:800; border:2.5px solid #bfdbfe; }
.sb-btn.act { background:#eff6ff; color:#1d4ed8; font-weight:800; border-left:4px solid #2563eb; padding-left:8px; }
.sb-ico { font-size:17px; width:24px; text-align:center; flex-shrink:0; }
.sb-chev { margin-left:auto; font-size:10px; color:#93c5fd; font-weight:900; transition:transform 0.22s; }
.sb-chev.open { transform:rotate(90deg); }

.subnav { padding-left:10px; margin-left:22px; border-left:3px solid #dbeafe; padding-bottom:3px; }
.sub-btn {
  width:100%; display:flex; align-items:center; gap:8px;
  padding:8px 10px; border-radius:10px; margin-bottom:2px;
  background:transparent; border:none; cursor:pointer;
  color:#64748b; font-size:13px; font-weight:600;
  font-family:'Nunito',sans-serif; text-align:left; transition:all 0.12s;
}
.sub-btn:hover { color:#2563eb; background:#eff6ff; }
.sub-btn.act { color:#1d4ed8; background:#dbeafe; font-weight:800; }
.sub-dot { width:6px; height:6px; border-radius:50%; background:currentColor; flex-shrink:0; opacity:0.5; }

.sb-foot { padding:12px 10px; border-top:2.5px solid #dbeafe; }
.sb-user {
  display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:14px;
  background:#f0f5ff; border:2.5px solid #dbeafe; margin-bottom:8px;
}
.sb-av {
  width:38px; height:38px; border-radius:12px; flex-shrink:0;
  background:linear-gradient(135deg,#1d4ed8,#6366f1);
  display:flex; align-items:center; justify-content:center;
  color:white; font-size:13px; font-weight:900;
}
.sb-uname { font-size:13px; font-weight:800; color:#0f172a; }
.sb-urole { font-size:11px; color:#64748b; font-weight:600; }
.sb-out {
  width:100%; display:flex; align-items:center; gap:8px;
  padding:9px 12px; border-radius:10px;
  background:transparent; border:none; cursor:pointer;
  color:#94a3b8; font-size:13.5px; font-weight:700;
  font-family:'Nunito',sans-serif; transition:all 0.15s;
}
.sb-out:hover { background:#fef2f2; color:#ef4444; }

/* ── TOPBAR ── */
.topbar {
  height:60px; background:white;
  border-bottom:2.5px solid #dbeafe;
  display:flex; align-items:center;
  padding:0 18px; gap:12px;
  position:sticky; top:0; z-index:100;
  box-shadow:0 2px 14px rgba(37,99,235,0.08);
}
.tb-hamburger {
  display:none;
  background:#eff6ff; border:2.5px solid #dbeafe; border-radius:11px;
  width:40px; height:40px; align-items:center; justify-content:center;
  cursor:pointer; font-size:19px; flex-shrink:0;
  transition: transform 0.15s;
}
.tb-hamburger:hover { transform:scale(1.08); }
.tb-bread {
  display:flex; align-items:center; gap:6px;
  font-size:13px; color:#64748b; font-weight:600;
  min-width:0; flex:1;
}
.tb-bread .cur { color:#0f172a; font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tb-sep { color:#93c5fd; font-weight:900; flex-shrink:0; }
.tb-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.tb-notif {
  width:38px; height:38px; border-radius:11px;
  background:#f0f5ff; border:2.5px solid #dbeafe;
  display:flex; align-items:center; justify-content:center;
  font-size:18px; cursor:pointer; position:relative;
  transition:transform 0.15s;
}
.tb-notif:hover { transform:scale(1.1) rotate(-8deg); }
.tb-dot { position:absolute; top:6px; right:6px; width:8px; height:8px; border-radius:50%; background:#ef4444; border:2px solid white; }
.tb-user {
  display:flex; align-items:center; gap:8px;
  padding:5px 12px 5px 5px; border-radius:30px;
  background:#f0f5ff; border:2.5px solid #dbeafe; cursor:pointer;
  transition:border-color 0.15s;
}
.tb-user:hover { border-color:#93c5fd; }
.tb-uav {
  width:30px; height:30px; border-radius:50%;
  background:linear-gradient(135deg,#1d4ed8,#6366f1);
  display:flex; align-items:center; justify-content:center;
  color:white; font-size:11px; font-weight:900; flex-shrink:0;
}
.tb-uname { font-size:13px; font-weight:800; color:#0f172a; white-space:nowrap; }

/* ── CONTENT ── */
.main { flex:1; min-width:0; display:flex; flex-direction:column; }
.content { flex:1; padding:20px 18px 40px; }

/* ── HERO ── */
.hero {
  border-radius:24px; margin-bottom:6px;
  background:linear-gradient(135deg,#1e3a8a,#1d4ed8 50%,#3b82f6);
  color:white; position:relative; overflow:hidden;
  border:2.5px solid rgba(147,197,253,0.3);
  box-shadow:0 10px 40px rgba(30,58,138,0.24);
  animation: slideUp 0.5s ease both;
}
.hero-body { padding:28px 24px 0; position:relative; z-index:1; }
.hero-dots {
  position:absolute; inset:0; pointer-events:none;
  background-image:radial-gradient(rgba(255,255,255,0.1) 1.5px,transparent 1.5px);
  background-size:24px 24px;
}
.hero-bubble {
  position:absolute; border-radius:50%; pointer-events:none;
  background:rgba(255,255,255,0.06);
}
.hero-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
.hero-emoji { font-size:52px; animation:float 4s ease-in-out infinite; line-height:1; }
.hero-title {
  font-family:'Poppins',sans-serif;
  font-size:22px; font-weight:900; margin-bottom:5px; line-height:1.2;
}
.hero-sub { font-size:14px; opacity:0.75; font-weight:600; }
.hero-date { font-size:12px; opacity:0.5; margin-top:4px; font-weight:600; }
.hero-tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; }
.hero-tag {
  display:flex; align-items:center; gap:5px;
  background:rgba(255,255,255,0.12); border:1.5px solid rgba(255,255,255,0.2);
  border-radius:30px; padding:5px 13px;
  font-size:12px; font-weight:800; backdrop-filter:blur(6px);
  transition:background 0.15s;
}

/* ── STATS ── */
.stats-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-bottom:22px; }
.stat-card {
  background:white; border-radius:20px; padding:18px 16px;
  border:2.5px solid #dbeafe; position:relative; overflow:hidden;
  box-shadow:0 3px 12px rgba(37,99,235,0.08);
  transition:all 0.22s; cursor:default;
  animation:slideUp 0.5s ease both;
}
.stat-card:hover { transform:translateY(-4px) rotate(-0.5deg); box-shadow:0 12px 28px rgba(37,99,235,0.15); border-color:#93c5fd; }
.stat-bar { position:absolute; left:0; top:0; bottom:0; width:5px; border-radius:20px 0 0 20px; }
.stat-stripe {
  position:absolute; right:-12px; bottom:-12px;
  width:70px; height:70px; border-radius:50%;
  opacity:0.06;
}
.stat-ico { font-size:32px; margin-bottom:10px; display:block; }
.stat-val { font-family:'Poppins',sans-serif; font-size:28px; font-weight:900; color:#0f172a; line-height:1; }
.stat-lbl { font-size:13px; color:#64748b; font-weight:700; margin-top:3px; }
.stat-note {
  font-size:11.5px; font-weight:700; margin-top:10px;
  padding-top:10px; border-top:2px dashed #e0e7ff;
  display:flex; align-items:center; gap:5px;
}

/* ── SECTION ── */
.sec-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; margin-top:22px; }
.sec-title { font-family:'Poppins',sans-serif; font-size:17px; font-weight:900; color:#0f172a; display:flex; align-items:center; gap:8px; }
.sec-sub { font-size:12.5px; color:#94a3b8; font-weight:700; }

/* ── UPDATES ── */
.updates { display:flex; flex-direction:column; gap:10px; margin-bottom:4px; }
.upd-card {
  background:white; border-radius:16px; padding:14px 16px;
  border:2.5px solid #dbeafe; display:flex; align-items:center; gap:12px;
  box-shadow:0 2px 8px rgba(37,99,235,0.06);
  transition:all 0.2s; animation:slideUp 0.5s ease both;
}
.upd-card:hover { transform:translateX(4px); border-color:#93c5fd; }
.upd-ico {
  width:42px; height:42px; border-radius:13px;
  display:flex; align-items:center; justify-content:center;
  font-size:20px; flex-shrink:0;
  transition:transform 0.2s;
}
.upd-card:hover .upd-ico { transform:scale(1.15) rotate(-5deg); }
.upd-text { flex:1; font-size:13.5px; font-weight:700; color:#0f172a; }
.upd-time { font-size:11.5px; color:#94a3b8; font-weight:600; margin-top:2px; }
.upd-tag { font-size:11.5px; font-weight:800; padding:4px 10px; border-radius:20px; white-space:nowrap; flex-shrink:0; }

/* ── MODULE CARDS ── */
.mods-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.mc {
  background:white; border-radius:20px; padding:18px 16px;
  border:2.5px solid #dbeafe; cursor:pointer;
  box-shadow:0 3px 12px rgba(37,99,235,0.08);
  transition:all 0.22s; position:relative; overflow:hidden;
  animation:slideUp 0.5s ease both;
}
.mc:hover { transform:translateY(-4px) rotate(0.5deg); box-shadow:0 14px 32px rgba(37,99,235,0.16); border-color:#93c5fd; }
.mc-blob {
  position:absolute; bottom:-18px; right:-18px;
  width:80px; height:80px; border-radius:50%; opacity:0.08;
}
.mc-tag {
  display:inline-flex; align-items:center; gap:4px;
  font-size:10.5px; font-weight:800; padding:3px 10px;
  border-radius:20px; margin-bottom:12px;
  border:2px solid currentColor;
}
.mc-ico-wrap { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.mc-ico {
  width:48px; height:48px; border-radius:15px;
  font-size:24px; display:flex; align-items:center; justify-content:center;
  transition:transform 0.2s;
}
.mc:hover .mc-ico { transform:scale(1.1) rotate(-5deg); }
.mc-count {
  font-family:'Poppins',sans-serif;
  font-size:13px; font-weight:900; color:#94a3b8;
  background:#f0f5ff; border:2px solid #dbeafe;
  border-radius:20px; padding:3px 10px;
}
.mc-name { font-family:'Poppins',sans-serif; font-weight:900; font-size:14px; color:#0f172a; margin-bottom:10px; }
.mc-pills { display:flex; flex-wrap:wrap; gap:5px; }
.mc-pill {
  padding:4px 10px; border-radius:9px;
  font-size:11.5px; font-weight:700; cursor:pointer;
  transition:all 0.14s; border:1.5px solid transparent;
}
.mc-pill:hover { transform:scale(1.05); }
.mc-more { padding:4px 10px; border-radius:9px; font-size:11.5px; font-weight:700; background:#f0f5ff; color:#94a3b8; }

/* ── PAGE VIEW ── */
.pg-top { display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
.pg-chip {
  display:flex; align-items:center; gap:5px;
  padding:5px 12px; border-radius:20px; border:2px solid currentColor;
  font-size:12px; font-weight:800; cursor:pointer; transition:all 0.15s;
}
.pg-chip:hover { transform:scale(1.05); }
.pg-sep { color:#93c5fd; font-weight:900; font-size:14px; }
.pg-title { font-family:'Poppins',sans-serif; font-size:24px; font-weight:900; color:#0f172a; margin-bottom:4px; }
.pg-sub { font-size:14px; color:#64748b; font-weight:600; margin-bottom:22px; }
.pg-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px; }
.pgs {
  background:white; border-radius:18px; padding:18px 14px;
  border:2.5px solid #dbeafe; text-align:center;
  box-shadow:0 3px 10px rgba(37,99,235,0.07);
  transition:transform 0.2s;
}
.pgs:hover { transform:translateY(-3px); }
.pgs-ico { font-size:28px; margin-bottom:8px; display:block; }
.pgs-val { font-family:'Poppins',sans-serif; font-size:20px; font-weight:900; color:#0f172a; }
.pgs-lbl { font-size:12px; color:#94a3b8; font-weight:700; margin-top:3px; }

.placeholder {
  background:white; border-radius:22px;
  border:2.5px dashed #bfdbfe;
  padding:56px 28px; text-align:center;
  box-shadow:0 3px 16px rgba(37,99,235,0.08);
  position:relative; overflow:hidden;
}
.ph-float { position:absolute; border-radius:50%; pointer-events:none; opacity:0.06; }
.ph-ico {
  width:84px; height:84px; border-radius:24px;
  font-size:40px; display:inline-flex; align-items:center; justify-content:center;
  margin-bottom:18px;
  animation:float 3.5s ease-in-out infinite;
  box-shadow:0 8px 24px rgba(37,99,235,0.15);
}
.ph-title { font-family:'Poppins',sans-serif; font-size:20px; font-weight:900; color:#0f172a; margin-bottom:10px; }
.ph-text { font-size:14.5px; color:#64748b; font-weight:600; line-height:1.7; max-width:340px; margin:0 auto 24px; }
.ph-btn {
  display:inline-flex; align-items:center; gap:8px;
  background:linear-gradient(135deg,#eff6ff,#e0e7ff);
  border:2.5px solid #bfdbfe; border-radius:14px;
  padding:12px 24px; font-size:14px; font-weight:900; color:#2563eb;
  font-family:'Nunito',sans-serif;
  animation:pulse-ring 2.5s ease-in-out infinite;
}

/* ══════════════════════════════════
   RESPONSIVE
══════════════════════════════════ */
@media (max-width:768px) {
  .sidebar { position:fixed; left:0; top:0; bottom:0; transform:translateX(-100%); box-shadow:4px 0 28px rgba(0,0,0,0.15); }
  .sidebar.open { transform:translateX(0); }
  .sb-overlay.open { display:block; }
  .tb-hamburger { display:flex; }
  .tb-uname { display:none; }
  .content { padding:16px 14px 36px; }
  .hero-body { padding:22px 18px 0; }
  .hero-title { font-size:19px; }
  .hero-emoji { font-size:40px; }
  .stats-grid { gap:10px; }
  .mods-grid { gap:10px; }
  .mc { padding:15px 14px; }
  .pg-stats { gap:8px; }
  .pgs { padding:14px 10px; }
}
@media (max-width:380px) {
  .login-card { padding:28px 18px 24px; }
  .stats-grid { grid-template-columns:1fr 1fr; }
  .mods-grid { grid-template-columns:1fr 1fr; }
}
@media (min-width:769px) {
  .stats-grid { grid-template-columns:repeat(4,1fr); }
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
      {/* floating blobs */}
      {[
        { w:220, h:220, bg:"rgba(255,255,255,0.07)", top:"5%", left:"5%", delay:"0s" },
        { w:160, h:160, bg:"rgba(99,102,241,0.2)", bottom:"10%", right:"5%", delay:"2s" },
        { w:100, h:100, bg:"rgba(255,255,255,0.05)", top:"40%", right:"15%", delay:"1s" },
        { w:80,  h:80,  bg:"rgba(255,255,255,0.08)", bottom:"30%", left:"10%", delay:"3s" },
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
            <div>
              <div className="sb-mood-text">{g}</div>
            </div>
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

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function Overview({ onNav, user }) {
  const today = new Date().toLocaleDateString("ms-MY",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const initials = user.name.split(" ").map(w=>w[0]).join("").slice(0,2);
  const greetHour = new Date().getHours();
  const greetWord = greetHour < 12 ? "Selamat Pagi" : greetHour < 17 ? "Selamat Petang" : "Selamat Malam";

  return (
    <div>
      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-dots"/>
        <div className="hero-bubble" style={{width:200,height:200,top:-80,right:-60}}/>
        <div className="hero-bubble" style={{width:120,height:120,bottom:0,right:80}}/>

        <div className="hero-body">
          <div className="hero-top">
            <div style={{flex:1}}>
              <div className="hero-title">{greetWord}, Cikgu {user.name.split(" ")[0]}! 🎉</div>
              <div className="hero-sub">Sistem berjalan lancar — jom mulakan hari!</div>
              <div className="hero-date">{today}</div>
              <div className="hero-tags" style={{marginBottom:28}}>
                <div className="hero-tag">✅ Semua Modul Aktif</div>
                <div className="hero-tag">📅 Penggal 2 · 2025</div>
                <div className="hero-tag">👋 Hai, {initials}!</div>
              </div>
            </div>
            <div className="hero-emoji">🏫</div>
          </div>
        </div>
        <Wave color="#f0f5ff"/>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        {[
          {lbl:"Jumlah Murid", val:387, ico:"👦", color:"#2563eb", note:"📈 +12 tahun ini"},
          {lbl:"Jumlah Guru", val:34, ico:"👩‍🏫", color:"#0ea5e9", note:"🆕 2 baru bulan ini"},
          {lbl:"Kehadiran", val:94, ico:"✅", color:"#6366f1", suffix:"%", note:"⬆️ Naik 2.1%"},
          {lbl:"Aktiviti Minggu", val:8, ico:"📅", color:"#0284c7", note:"🏅 3 kokurikulum"},
        ].map((s,i)=>(
          <div className="stat-card" key={i} style={{animationDelay:`${i*0.08}s`}}>
            <div className="stat-bar" style={{background:s.color}}/>
            <div className="stat-stripe" style={{background:s.color}}/>
            <div className="stat-ico">{s.ico}</div>
            <div className="stat-val"><Count to={s.val} suffix={s.suffix||""}/></div>
            <div className="stat-lbl">{s.lbl}</div>
            <div className="stat-note" style={{color:s.color}}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* ── Updates ── */}
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

      {/* ── Modules ── */}
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
        <div className="ph-float" style={{width:180,height:180,background:m.color,top:-40,right:-40}}/>
        <div className="ph-float" style={{width:120,height:120,background:m.color,bottom:-30,left:-30}}/>
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
