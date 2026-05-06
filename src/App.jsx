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

const UPDATES = [
  { icon:"📅", text:"Mesyuarat Kurikulum Bil.3 — Jumaat ini 2:00 PM", tag:"Segera", tc:"#ef4444", bg:"#fef2f2" },
  { icon:"📋", text:"PAJSK suku 2 perlu dikemaskini sebelum 30 Jun", tag:"Peringatan", tc:"#f59e0b", bg:"#fffbeb" },
  { icon:"📦", text:"Laporan Aset JKPAK Q2 berjaya dijana", tag:"Selesai", tc:"#22c55e", bg:"#f0fdf4" },
  { icon:"👦", text:"12 murid baharu didaftarkan minggu ini", tag:"Baharu", tc:"#2563eb", bg:"#eff6ff" },
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

const KELAS_LIST = ["Tahun 4 Angsana","Tahun 5 Seroja","Tahun 6 Emas","Tahun 1 Mawar","Tahun 2 Cempaka","Tahun 3 Kenanga"];

const WAKTU_SLOTS = [
  "7:30 – 8:00","8:00 – 8:30","8:30 – 9:00","9:00 – 9:30","9:30 – 10:00",
  "REHAT","10:30 – 11:00","11:00 – 11:30","11:30 – 12:00","12:00 – 12:30","12:30 – 1:00"
];

// each row = [Isnin, Selasa, Rabu, Khamis, Jumaat]
const JADUAL_DB = {
  "Tahun 4 Angsana": [
    [{s:"BM",g:"Pn.Ramlah"},{s:"Math",g:"En.Azmi"},{s:"BI",g:"Pn.Susan"},{s:"Sains",g:"En.Hafiz"},{s:"BM",g:"Pn.Ramlah"}],
    [{s:"BM",g:"Pn.Ramlah"},{s:"Math",g:"En.Azmi"},{s:"BI",g:"Pn.Susan"},{s:"BM",g:"Pn.Ramlah"},{s:"Math",g:"En.Azmi"}],
    [{s:"Math",g:"En.Azmi"},{s:"BM",g:"Pn.Ramlah"},{s:"Sains",g:"En.Hafiz"},{s:"BI",g:"Pn.Susan"},{s:"Sejarah",g:"Pn.Kartini"}],
    [{s:"Sains",g:"En.Hafiz"},{s:"BI",g:"Pn.Susan"},{s:"Math",g:"En.Azmi"},{s:"Math",g:"En.Azmi"},{s:"BI",g:"Pn.Susan"}],
    [{s:"PI",g:"Ust.Fadzli"},{s:"Sejarah",g:"Pn.Kartini"},{s:"PI",g:"Ust.Fadzli"},{s:"PI",g:"Ust.Fadzli"},{s:"PI",g:"Ust.Fadzli"}],
    null, // REHAT
    [{s:"BI",g:"Pn.Susan"},{s:"Sains",g:"En.Hafiz"},{s:"BM",g:"Pn.Ramlah"},{s:"Sejarah",g:"Pn.Kartini"},{s:"Sains",g:"En.Hafiz"}],
    [{s:"Sejarah",g:"Pn.Kartini"},{s:"PI",g:"Ust.Fadzli"},{s:"PJ",g:"En.Rahman"},{s:"PSV",g:"Pn.Liza"},{s:"PJ",g:"En.Rahman"}],
    [{s:"PJ",g:"En.Rahman"},{s:"PSV",g:"Pn.Liza"},{s:"Muzik",g:"En.Farid"},{s:"RBT",g:"En.Jefri"},{s:"PSV",g:"Pn.Liza"}],
    [{s:"RBT",g:"En.Jefri"},{s:"Muzik",g:"En.Farid"},{s:"Sejarah",g:"Pn.Kartini"},{s:"PJ",g:"En.Rahman"},{s:"Muzik",g:"En.Farid"}],
    [{s:"PSV",g:"Pn.Liza"},{s:"RBT",g:"En.Jefri"},{s:"RBT",g:"En.Jefri"},{s:"Muzik",g:"En.Farid"},{s:"RBT",g:"En.Jefri"}],
  ],
  "Tahun 5 Seroja": [
    [{s:"Math",g:"En.Azmi"},{s:"BM",g:"Pn.Ramlah"},{s:"Sains",g:"En.Hafiz"},{s:"BI",g:"Pn.Susan"},{s:"Math",g:"En.Azmi"}],
    [{s:"Math",g:"En.Azmi"},{s:"BM",g:"Pn.Ramlah"},{s:"Sains",g:"En.Hafiz"},{s:"BM",g:"Pn.Ramlah"},{s:"BM",g:"Pn.Ramlah"}],
    [{s:"BI",g:"Pn.Susan"},{s:"Sains",g:"En.Hafiz"},{s:"BM",g:"Pn.Ramlah"},{s:"Math",g:"En.Azmi"},{s:"BI",g:"Pn.Susan"}],
    [{s:"BM",g:"Pn.Ramlah"},{s:"Math",g:"En.Azmi"},{s:"BI",g:"Pn.Susan"},{s:"Sains",g:"En.Hafiz"},{s:"Sains",g:"En.Hafiz"}],
    [{s:"PI",g:"Ust.Fadzli"},{s:"PI",g:"Ust.Fadzli"},{s:"Sejarah",g:"Pn.Kartini"},{s:"PI",g:"Ust.Fadzli"},{s:"PI",g:"Ust.Fadzli"}],
    null,
    [{s:"Sains",g:"En.Hafiz"},{s:"BI",g:"Pn.Susan"},{s:"Math",g:"En.Azmi"},{s:"BM",g:"Pn.Ramlah"},{s:"Sejarah",g:"Pn.Kartini"}],
    [{s:"Sejarah",g:"Pn.Kartini"},{s:"Sejarah",g:"Pn.Kartini"},{s:"PI",g:"Ust.Fadzli"},{s:"Sejarah",g:"Pn.Kartini"},{s:"PJ",g:"En.Rahman"}],
    [{s:"PSV",g:"Pn.Liza"},{s:"PJ",g:"En.Rahman"},{s:"PSV",g:"Pn.Liza"},{s:"PJ",g:"En.Rahman"},{s:"RBT",g:"En.Jefri"}],
    [{s:"Muzik",g:"En.Farid"},{s:"RBT",g:"En.Jefri"},{s:"RBT",g:"En.Jefri"},{s:"PSV",g:"Pn.Liza"},{s:"PSV",g:"Pn.Liza"}],
    [{s:"RBT",g:"En.Jefri"},{s:"Muzik",g:"En.Farid"},{s:"Muzik",g:"En.Farid"},{s:"Muzik",g:"En.Farid"},{s:"Muzik",g:"En.Farid"}],
  ],
  "Tahun 6 Emas": [
    [{s:"BM",g:"Pn.Ramlah"},{s:"BI",g:"Pn.Susan"},{s:"Math",g:"En.Azmi"},{s:"BM",g:"Pn.Ramlah"},{s:"BI",g:"Pn.Susan"}],
    [{s:"BM",g:"Pn.Ramlah"},{s:"BI",g:"Pn.Susan"},{s:"Sains",g:"En.Hafiz"},{s:"BM",g:"Pn.Ramlah"},{s:"Math",g:"En.Azmi"}],
    [{s:"Math",g:"En.Azmi"},{s:"Math",g:"En.Azmi"},{s:"BM",g:"Pn.Ramlah"},{s:"Sains",g:"En.Hafiz"},{s:"BM",g:"Pn.Ramlah"}],
    [{s:"Sains",g:"En.Hafiz"},{s:"Sains",g:"En.Hafiz"},{s:"BI",g:"Pn.Susan"},{s:"Math",g:"En.Azmi"},{s:"Sains",g:"En.Hafiz"}],
    [{s:"PI",g:"Ust.Fadzli"},{s:"Sejarah",g:"Pn.Kartini"},{s:"PI",g:"Ust.Fadzli"},{s:"Sejarah",g:"Pn.Kartini"},{s:"PI",g:"Ust.Fadzli"}],
    null,
    [{s:"BI",g:"Pn.Susan"},{s:"BM",g:"Pn.Ramlah"},{s:"Sains",g:"En.Hafiz"},{s:"BI",g:"Pn.Susan"},{s:"Math",g:"En.Azmi"}],
    [{s:"Sejarah",g:"Pn.Kartini"},{s:"Math",g:"En.Azmi"},{s:"Sejarah",g:"Pn.Kartini"},{s:"PI",g:"Ust.Fadzli"},{s:"Sejarah",g:"Pn.Kartini"}],
    [{s:"PJ",g:"En.Rahman"},{s:"PSV",g:"Pn.Liza"},{s:"PJ",g:"En.Rahman"},{s:"PSV",g:"Pn.Liza"},{s:"PJ",g:"En.Rahman"}],
    [{s:"Muzik",g:"En.Farid"},{s:"RBT",g:"En.Jefri"},{s:"Muzik",g:"En.Farid"},{s:"RBT",g:"En.Jefri"},{s:"PSV",g:"Pn.Liza"}],
    [{s:"RBT",g:"En.Jefri"},{s:"Muzik",g:"En.Farid"},{s:"RBT",g:"En.Jefri"},{s:"Muzik",g:"En.Farid"},{s:"RBT",g:"En.Jefri"}],
  ],
};
// Default same jadual for other classes
["Tahun 1 Mawar","Tahun 2 Cempaka","Tahun 3 Kenanga"].forEach(k => { JADUAL_DB[k] = JADUAL_DB["Tahun 4 Angsana"]; });

const PANITIA_DATA = [
  { sub:"Bahasa Malaysia",    ico:"📖", color:"#2563eb", bg:"#eff6ff", ketua:"Pn. Ramlah Ahmad",  ahli:5, mesyuarat:"15 Apr 2025", status:"Aktif" },
  { sub:"Bahasa Inggeris",    ico:"🌍", color:"#0891b2", bg:"#ecfeff", ketua:"Pn. Susan Lim",     ahli:4, mesyuarat:"12 Apr 2025", status:"Aktif" },
  { sub:"Matematik",          ico:"🔢", color:"#ea580c", bg:"#fff7ed", ketua:"En. Azmi Hassan",   ahli:5, mesyuarat:"10 Apr 2025", status:"Aktif" },
  { sub:"Sains",              ico:"🔬", color:"#16a34a", bg:"#f0fdf4", ketua:"En. Hafiz Ibrahim", ahli:4, mesyuarat:"17 Apr 2025", status:"Aktif" },
  { sub:"Sejarah",            ico:"📜", color:"#92400e", bg:"#fef3c7", ketua:"Pn. Kartini Mohd",  ahli:3, mesyuarat:"20 Apr 2025", status:"Aktif" },
  { sub:"Pendidikan Islam",   ico:"🕌", color:"#a16207", bg:"#fefce8", ketua:"Ust. Fadzli Rahim", ahli:3, mesyuarat:"18 Apr 2025", status:"Aktif" },
  { sub:"PJ & Kesihatan",     ico:"⚽", color:"#dc2626", bg:"#fef2f2", ketua:"En. Rahman Othman",  ahli:3, mesyuarat:"22 Apr 2025", status:"Aktif" },
  { sub:"Pend. Seni & Muzik", ico:"🎨", color:"#db2777", bg:"#fdf2f8", ketua:"Pn. Liza Azman",    ahli:4, mesyuarat:"19 Apr 2025", status:"Aktif" },
];

const PEPX_DATA = [
  { nama:"Ujian Bulan Mac",            tarikh:"14 – 16 Mac 2025",  kelas:"Tahun 1–6", status:"Selesai",  badge:"b-green"  },
  { nama:"Penilaian 1 (PBS)",          tarikh:"28 Apr – 2 Mei 2025", kelas:"Tahun 1–6", status:"Selesai", badge:"b-green" },
  { nama:"Peperiksaan Pertengahan Tahun", tarikh:"16 – 20 Jun 2025", kelas:"Tahun 1–6", status:"Akan Datang", badge:"b-yellow" },
  { nama:"Ujian Bulan Ogos",           tarikh:"11 – 13 Ogos 2025", kelas:"Tahun 1–6",  status:"Akan Datang", badge:"b-yellow" },
  { nama:"UPSR Percubaan",             tarikh:"1 – 5 Sep 2025",    kelas:"Tahun 6",    status:"Akan Datang", badge:"b-blue"  },
  { nama:"Peperiksaan Akhir Tahun",    tarikh:"3 – 7 Nov 2025",    kelas:"Tahun 1–6",  status:"Akan Datang", badge:"b-purple" },
  { nama:"UPSR",                       tarikh:"18 – 20 Nov 2025",  kelas:"Tahun 6",    status:"Akan Datang", badge:"b-red"   },
];

const RPH_DATA = [
  { guru:"Pn. Ramlah Ahmad",   subj:"BM",      kelas:"Thn 4",  minggu:"Minggu 16", status:"Hantar",  badge:"b-green"  },
  { guru:"Pn. Susan Lim",      subj:"BI",      kelas:"Thn 5",  minggu:"Minggu 16", status:"Hantar",  badge:"b-green"  },
  { guru:"En. Azmi Hassan",    subj:"Math",    kelas:"Thn 6",  minggu:"Minggu 16", status:"Hantar",  badge:"b-green"  },
  { guru:"En. Hafiz Ibrahim",  subj:"Sains",   kelas:"Thn 4",  minggu:"Minggu 16", status:"Hantar",  badge:"b-green"  },
  { guru:"Pn. Kartini Mohd",   subj:"Sejarah", kelas:"Thn 5",  minggu:"Minggu 16", status:"Hantar",  badge:"b-green"  },
  { guru:"Ust. Fadzli Rahim",  subj:"PI",      kelas:"Thn 4",  minggu:"Minggu 16", status:"Tertunggak", badge:"b-red" },
  { guru:"En. Rahman Othman",  subj:"PJ",      kelas:"Thn 3",  minggu:"Minggu 16", status:"Tertunggak", badge:"b-red" },
  { guru:"Pn. Liza Azman",     subj:"PSV",     kelas:"Thn 2",  minggu:"Minggu 16", status:"Hantar",  badge:"b-green"  },
  { guru:"En. Farid Noor",     subj:"Muzik",   kelas:"Thn 1",  minggu:"Minggu 15", status:"Tertunggak", badge:"b-red" },
  { guru:"En. Jefri Alias",    subj:"RBT",     kelas:"Thn 5",  minggu:"Minggu 16", status:"Semak",   badge:"b-yellow" },
];

const PROGRAM_DATA = [
  { nama:"Program NILAM Sekolah",   tarikh:"Jan – Nov 2025",   desc:"Program membaca buku, sasaran 8 buku / murid.",  color:"#2563eb", badge:"b-green",  status:"Sedang Berjalan" },
  { nama:"Bulan Bahasa Kebangsaan", tarikh:"Oktober 2025",     desc:"Pelbagai pertandingan bahasa melayu peringkat sekolah.", color:"#0891b2", badge:"b-yellow", status:"Akan Datang" },
  { nama:"Minggu Sains & Matematik",tarikh:"Jun 2025",         desc:"Ekshibisi sains, kuiz matematik, lawatan ilmiah.", color:"#16a34a", badge:"b-yellow", status:"Akan Datang" },
  { nama:"Hari Kecemerlangan Akademik", tarikh:"Dis 2025",    desc:"Anugerah pelajar cemerlang dan hadiah keputusan akhir tahun.", color:"#a16207", badge:"b-purple", status:"Akan Datang" },
  { nama:"Program LINUS / PROTIM",  tarikh:"Feb – Nov 2025",  desc:"Intervensi bacaan, tulisan dan nombor untuk murid sasar.", color:"#7c3aed", badge:"b-green",  status:"Sedang Berjalan" },
  { nama:"Program Mentor Mentee",   tarikh:"Mac – Okt 2025",  desc:"Pasangan guru-murid untuk sokong peningkatan akademik.", color:"#dc2626", badge:"b-green",  status:"Sedang Berjalan" },
];

const NILAM_DATA = [
  { nama:"Ahmad Fariz",    kelas:"Thn 6 Emas",  buku:14, sasaran:8 },
  { nama:"Nurul Aina",     kelas:"Thn 5 Seroja",buku:12, sasaran:8 },
  { nama:"Haziq Danial",   kelas:"Thn 6 Emas",  buku:11, sasaran:8 },
  { nama:"Siti Mariam",    kelas:"Thn 4 Angsana",buku:10, sasaran:8 },
  { nama:"Zulaikha",       kelas:"Thn 5 Seroja",buku:9,  sasaran:8 },
  { nama:"Irfan Haiqal",   kelas:"Thn 6 Emas",  buku:9,  sasaran:8 },
  { nama:"Aisyah Batrisyia",kelas:"Thn 3 Kenanga",buku:8, sasaran:8 },
  { nama:"Muhammad Amir",  kelas:"Thn 4 Angsana",buku:7, sasaran:8 },
];

const STAF_DATA = [
  { nama:"Semua Guru",            kursus:"Bengkel PBS & Pentaksiran Bilik Darjah", tarikh:"18 Jan 2025",  anjur:"JPN Sabah",    status:"Selesai",  badge:"b-green"  },
  { nama:"Pn. Ramlah, Pn. Susan", kursus:"Penulisan Buku Teks KSSR Semakan",       tarikh:"5 Feb 2025",   anjur:"KPM",          status:"Selesai",  badge:"b-green"  },
  { nama:"En. Azmi, En. Hafiz",   kursus:"STEM dalam PdP Matematik & Sains",        tarikh:"20 Mac 2025",  anjur:"IAB",          status:"Selesai",  badge:"b-green"  },
  { nama:"Semua Guru",            kursus:"PLC Sekolah (Lesson Study)",              tarikh:"10 Apr 2025",  anjur:"Dalaman",      status:"Selesai",  badge:"b-green"  },
  { nama:"En. Jefri, En. Farid",  kursus:"Kursus ICT & Pembelajaran Digital",       tarikh:"15 Mei 2025",  anjur:"BTPN Sabah",   status:"Akan Datang", badge:"b-yellow" },
  { nama:"Semua Guru",            kursus:"Bengkel Penulisan RPH Berkualiti",         tarikh:"7 Jun 2025",   anjur:"Dalaman",      status:"Akan Datang", badge:"b-yellow" },
  { nama:"Pn. Liza, Ust. Fadzli", kursus:"Kursus Penilaian Prestasi PSV & PI",     tarikh:"2 Julai 2025", anjur:"JPN Sabah",    status:"Akan Datang", badge:"b-blue"   },
];

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
      fontFamily:"'Plus Jakarta Sans',sans-serif", maxWidth:340,
      animation:"fadeIn 0.2s ease",
    }}>
      {isErr ? "❌ " : "✅ "}{t.msg}
    </div>
  );
}

// ─── DB HELPER ───────────────────────────────────────────────────────────────
async function dbRun(fn) {
  const result = await fn();
  if (result?.error) {
    toast(result.error.message || "Ralat Supabase — semak RLS policy");
    return false;
  }
  return true;
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
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:17px; font-weight:900; color:var(--text);
  display:flex; align-items:center; gap:8px;
  transition:color 0.35s; letter-spacing:-0.01em;
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
  font-family:'Plus Jakarta Sans',sans-serif;
  font-weight:900; font-size:14px; color:var(--text);
  margin-bottom:10px; transition:color 0.35s; letter-spacing:-0.01em;
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
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:24px; font-weight:900; color:var(--text);
  margin-bottom:4px; transition:color 0.35s; letter-spacing:-0.01em;
}
.pg-sub { font-size:14px; color:var(--text2); font-weight:700; margin-bottom:22px; transition:color 0.35s; }
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
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:20px; font-weight:900; color:var(--text);
  margin-bottom:10px; transition:color 0.35s; letter-spacing:-0.01em;
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

/* ══ KURIKULUM PAGES ══════════════════════════════════════════════════════ */
.kur-header {
  display:flex; align-items:center; gap:10px; margin-bottom:18px; flex-wrap:wrap;
}
.kur-select {
  padding:9px 14px; border-radius:12px;
  background:var(--surface); border:1px solid var(--border);
  color:var(--text); font-size:13px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer;
  outline:none; backdrop-filter:var(--blur); transition:all 0.2s;
}
.kur-select:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-ring); }
.kur-search-wrap { position:relative; flex:1; min-width:180px; }
.kur-search-ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:15px; pointer-events:none; }
.kur-search {
  width:100%; padding:9px 14px 9px 38px;
  border-radius:12px; background:var(--surface); border:1px solid var(--border);
  color:var(--text); font-size:13px; font-weight:600;
  font-family:'Plus Jakarta Sans',sans-serif;
  outline:none; backdrop-filter:var(--blur); transition:all 0.2s;
}
.kur-search:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-ring); }
.kur-search::placeholder { color:var(--text3); }

/* stats row */
.kur-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:18px; }
.kur-stat {
  background:var(--surface); backdrop-filter:var(--blur);
  border:1px solid var(--border); border-radius:16px;
  padding:16px 14px; text-align:center;
  box-shadow:var(--shadow); transition:all 0.2s;
}
.kur-stat:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); }
.kur-stat-ico { font-size:24px; margin-bottom:6px; display:block; }
.kur-stat-val { font-size:22px; font-weight:900; color:var(--text); font-family:'Plus Jakarta Sans',sans-serif; }
.kur-stat-lbl { font-size:11px; color:var(--text3); font-weight:700; font-style:italic; margin-top:2px; }

/* timetable */
.jadual-wrap {
  overflow-x:auto; border-radius:18px;
  border:1px solid var(--border); box-shadow:var(--shadow);
}
.jadual-table { width:100%; border-collapse:collapse; min-width:640px; }
.jadual-table th {
  padding:11px 8px; text-align:center;
  font-size:11.5px; font-weight:900; text-transform:uppercase;
  letter-spacing:0.06em; color:var(--accent);
  background:var(--accent-lt); border-bottom:1px solid var(--border);
  white-space:nowrap;
}
.jadual-table th:first-child { text-align:left; padding-left:16px; min-width:110px; }
.jadual-table td {
  padding:7px 5px; text-align:center; vertical-align:middle;
  border-bottom:1px solid var(--divider);
  background:var(--surface); transition:background 0.35s;
}
.jadual-table td:first-child {
  text-align:left; padding-left:16px;
  font-size:11.5px; font-weight:800; color:var(--text2);
  white-space:nowrap; background:var(--accent-lt);
  border-right:1px solid var(--border);
}
.jadual-table tr:last-child td { border-bottom:none; }
.jadual-cell {
  display:inline-flex; flex-direction:column; align-items:center;
  padding:6px 8px; border-radius:10px; min-width:82px;
  cursor:default; transition:all 0.15s;
}
.jadual-cell:hover { transform:scale(1.06); box-shadow:var(--shadow-md); }
.jadual-cell-sub { font-size:11.5px; font-weight:800; color:var(--text); transition:color 0.35s; }
.jadual-cell-guru { font-size:10px; font-weight:600; color:var(--text2); margin-top:1px; transition:color 0.35s; }
.jadual-rehat td {
  padding:6px 16px !important;
  background:var(--divider) !important;
  font-size:10.5px; font-weight:900; color:var(--text3) !important;
  letter-spacing:0.1em; text-transform:uppercase;
}
.j-match .jadual-cell { outline:2px solid var(--accent); outline-offset:1px; }
.j-dim { opacity:0.2; pointer-events:none; }

/* panitia grid */
.panitia-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.panitia-card {
  background:var(--surface); backdrop-filter:var(--blur);
  border:1px solid var(--border); border-radius:18px;
  padding:18px 16px; box-shadow:var(--shadow); transition:all 0.22s;
}
.panitia-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-md); border-color:var(--accent); }
.panitia-head { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.panitia-ico { width:42px; height:42px; border-radius:13px; display:flex; align-items:center; justify-content:center; font-size:21px; flex-shrink:0; }
.panitia-name { font-size:14px; font-weight:900; color:var(--text); transition:color 0.35s; }
.panitia-ketua { font-size:12px; color:var(--text2); font-weight:600; font-style:italic; transition:color 0.35s; }
.panitia-body { font-size:12.5px; color:var(--text2); margin-bottom:10px; transition:color 0.35s; }
.panitia-foot { display:flex; gap:6px; flex-wrap:wrap; }

/* generic table */
.kur-table-wrap {
  overflow-x:auto; border-radius:16px;
  border:1px solid var(--border); box-shadow:var(--shadow);
}
.kur-table { width:100%; border-collapse:collapse; min-width:480px; }
.kur-table th {
  padding:11px 14px; text-align:left;
  font-size:11px; font-weight:900; text-transform:uppercase;
  letter-spacing:0.06em; color:var(--accent);
  background:var(--accent-lt); border-bottom:1px solid var(--border);
  white-space:nowrap;
}
.kur-table td {
  padding:11px 14px; font-size:13px; font-weight:600;
  color:var(--text); border-bottom:1px solid var(--divider);
  background:var(--surface); transition:background 0.35s, color 0.35s;
}
.kur-table tr:last-child td { border-bottom:none; }
.kur-table tr:hover td { background:var(--accent-lt); }

/* badges */
.badge { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:800; white-space:nowrap; display:inline-block; }
.b-green  { background:#f0fdf4; color:#15803d; }
.b-yellow { background:#fffbeb; color:#a16207; }
.b-red    { background:#fef2f2; color:#dc2626; }
.b-blue   { background:#eff6ff; color:#1d4ed8; }
.b-purple { background:#f5f3ff; color:#6d28d9; }
.b-gray   { background:#f8fafc; color:#475569; }
[data-theme="dark"] .b-green  { background:rgba(34,197,94,0.12);  color:#4ade80; }
[data-theme="dark"] .b-yellow { background:rgba(234,179,8,0.12);  color:#facc15; }
[data-theme="dark"] .b-red    { background:rgba(239,68,68,0.12);  color:#f87171; }
[data-theme="dark"] .b-blue   { background:rgba(59,130,246,0.12); color:#60a5fa; }
[data-theme="dark"] .b-purple { background:rgba(139,92,246,0.12); color:#a78bfa; }
[data-theme="dark"] .b-gray   { background:rgba(71,85,105,0.18);  color:#94a3b8; }

/* nilam/progress bar */
.nilam-bar-wrap { width:100%; height:7px; border-radius:99px; background:var(--divider); overflow:hidden; margin-top:5px; }
.nilam-bar { height:100%; border-radius:99px; background:linear-gradient(90deg,#2563eb,#6366f1); }

/* program card */
.prog-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.prog-card {
  background:var(--surface); backdrop-filter:var(--blur);
  border:1px solid var(--border); border-radius:18px;
  padding:18px 16px; box-shadow:var(--shadow); transition:all 0.22s;
  position:relative; overflow:hidden;
}
.prog-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-md); }
.prog-card-accent { position:absolute; top:0; left:0; right:0; height:3px; border-radius:18px 18px 0 0; }
.prog-title { font-size:14px; font-weight:900; color:var(--text); margin-bottom:5px; transition:color 0.35s; }
.prog-date { font-size:12px; color:var(--text3); font-weight:600; margin-bottom:8px; font-style:italic; transition:color 0.35s; }
.prog-desc { font-size:12.5px; color:var(--text2); line-height:1.6; transition:color 0.35s; }

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
  background:rgba(5,11,25,0.65);
  backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
  display:flex; align-items:center; justify-content:center;
  padding:20px; animation:fadeIn 0.15s ease;
}
.modal-card {
  background:var(--surface-s); border:1px solid var(--border);
  border-radius:20px; width:100%; max-width:440px;
  box-shadow:var(--shadow-lg);
  animation:pop 0.22s cubic-bezier(.34,1.56,.64,1) both;
}
.modal-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 20px; border-bottom:1px solid var(--divider);
}
.modal-title { font-size:15px; font-weight:900; color:var(--text); font-family:'Plus Jakarta Sans',sans-serif; }
.modal-close {
  width:30px; height:30px; border-radius:8px;
  background:var(--accent-lt); border:1px solid var(--border);
  color:var(--text2); cursor:pointer; font-size:13px;
  display:flex; align-items:center; justify-content:center; transition:all 0.15s;
}
.modal-close:hover { background:rgba(239,68,68,0.1); color:#ef4444; }
.modal-body { padding:20px; }

/* Forms */
.form-field { margin-bottom:13px; }
.form-label { display:block; font-size:10.5px; font-weight:900; color:var(--accent); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px; }
.form-input {
  width:100%; padding:9px 13px;
  background:var(--input-bg); border:1px solid var(--input-br);
  border-radius:10px; color:var(--text);
  font-size:13px; font-weight:600;
  font-family:'Plus Jakarta Sans',sans-serif;
  outline:none; transition:all 0.2s;
}
.form-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-ring); }
.form-input:disabled { opacity:0.55; cursor:not-allowed; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.btn-primary {
  width:100%; padding:11px;
  background:linear-gradient(135deg,#1d4ed8,#3b82f6);
  border:none; border-radius:12px;
  color:white; font-size:14px; font-weight:900;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; margin-top:4px;
  box-shadow:0 4px 14px rgba(37,99,235,0.3); transition:all 0.2s;
}
.btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(37,99,235,0.4); }
.btn-add {
  display:flex; align-items:center; gap:6px;
  padding:8px 16px; border-radius:11px;
  background:var(--accent); border:none; color:white;
  font-size:12.5px; font-weight:800;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; transition:all 0.2s;
  box-shadow:0 3px 10px rgba(37,99,235,0.25);
}
.btn-add:hover { transform:translateY(-1px); box-shadow:0 5px 14px rgba(37,99,235,0.38); }
.btn-del {
  padding:4px 9px; border-radius:7px;
  background:transparent; border:1px solid transparent;
  color:var(--text3); font-size:12px; cursor:pointer;
  font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.15s;
}
.btn-del:hover { background:rgba(239,68,68,0.1); color:#ef4444; border-color:rgba(239,68,68,0.2); }
.loading { padding:48px; text-align:center; color:var(--text3); font-size:14px; font-weight:700; animation:float 2s ease-in-out infinite; }
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

// ─── HELPERS ─────────────────────────────────────────────────────────────────
async function seedOnce(table, rows) {
  const { count } = await supabase.from(table).select('*', { count:'exact', head:true });
  if (count === 0) await supabase.from(table).insert(rows);
}

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
  const [kelas, setKelas] = useState("Tahun 4 Angsana");
  const [q, setQ] = useState("");
  const [editCell, setEditCell] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { count } = await supabase.from('jadual_waktu').select('*',{count:'exact',head:true});
      if (count === 0) {
        const jadualRows = [];
        KELAS_LIST.forEach(k => {
          const slots = JADUAL_DB[k]; if (!slots) return;
          slots.forEach((row, ri) => {
            if (!row) return;
            row.forEach((cell, ci) => {
              jadualRows.push({ kelas:k, hari:HARI[ci], waktu_slot:ri, subjek:cell.s, guru:cell.g });
            });
          });
        });
        await supabase.from('jadual_waktu').insert(jadualRows);
      }
    };
    init();
  }, []);

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
    await seedOnce('panitia', PANITIA_DATA.map(p=>({ subjek:p.sub, icon:p.ico, color:p.color, bg:p.bg, ketua:p.ketua, jumlah_ahli:p.ahli, tarikh_mesyuarat:p.mesyuarat, status:p.status })));
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
    await seedOnce('peperiksaan', PEPX_DATA.map(p=>({ nama:p.nama, tarikh:p.tarikh, kelas:p.kelas, status:p.status })));
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
    await seedOnce('rph', RPH_DATA.map(r=>({ guru:r.guru, subjek:r.subj, kelas:r.kelas, minggu:r.minggu, status:r.status })));
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
                    <select style={{border:"none",background:"transparent",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:12,color:"inherit"}}
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
    await seedOnce('program_akademik', PROGRAM_DATA.map(p=>({ nama:p.nama, tarikh:p.tarikh, deskripsi:p.desc, color:p.color, status:p.status })));
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
    await seedOnce('nilam', NILAM_DATA.map(r=>({ nama:r.nama, kelas:r.kelas, buku_dibaca:r.buku, sasaran:r.sasaran })));
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
    await seedOnce('perkembangan_staf', STAF_DATA.map(s=>({ peserta:s.nama, kursus:s.kursus, tarikh:s.tarikh, penganjur:s.anjur, status:s.status })));
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
        { ico:"👩‍🏫", val:34, lbl:"Guru Terlibat" },
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
              fontFamily:"'Plus Jakarta Sans',sans-serif",
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
              : actMod==="kurikulum"
                ? <KurikulumPage subId={actSub} onNav={onNav}/>
                : <Page modId={actMod} subId={actSub}/>}
          </div>
        </div>
      </div>
      <Toast />
    </>
  );
}
