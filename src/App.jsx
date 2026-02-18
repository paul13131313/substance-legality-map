import { useState, useMemo } from "react";
import { substances, countries, categories } from "./data/substances";

// ステータス → 色のみ。ラベルは凡例に1回だけ出す
const STATUS_COLORS = {
  death:       "#7f1d1d",
  severe:      "#991b1b",
  banned:      "#dc2626",
  inhale:      "#dc2626",
  banMedical:  "#9333ea",
  decrim:      "#f97316",
  prescription:"#3b82f6",
  medicalOnly: "#3b82f6",
  partial:     "#eab308",
  grey:        "#a3a3a3",
  defacto:     "#22c55e",
  legal:       "#10b981",
  unknown:     "#27272a",
};

const getStatusKey = (status) => {
  if (!status) return "unknown";
  if (status.includes("死刑")) return "death";
  if (status.includes("禁止（厳罰）")) return "severe";
  if (status.includes("非犯罪化")) return "decrim";
  if ((status.includes("処方箋合法") || status.includes("処方箋必要") || status.includes("医療用合法")) && !status.includes("禁止")) {
    return status.includes("医療用合法") ? "medicalOnly" : "prescription";
  }
  if (status.includes("処方可") && status.includes("禁止")) return "banMedical";
  if (status.includes("禁止（吸引目的）")) return "inhale";
  if (status.includes("合法") && status.includes("禁止")) return "partial";
  if (status.includes("グレーゾーン") || status.includes("グレー")) return "grey";
  if (status.includes("禁止")) return "banned";
  if (status.includes("容認") || status.includes("コーヒーショップ")) return "defacto";
  if (status.includes("合法")) return "legal";
  return "unknown";
};

const getShortLabel = (status) => {
  if (!status) return "";
  const k = getStatusKey(status);
  const map = {
    death: "死刑", severe: "厳罰", banned: "禁止", inhale: "禁止",
    banMedical: "禁/医", decrim: "非犯罪", prescription: "処方", medicalOnly: "医療",
    partial: "一部", grey: "灰", defacto: "容認", legal: "合法", unknown: "",
  };
  return map[k] || "";
};

const depColor = (dep) => {
  if (dep.includes("非常に高")) return "#ef4444";
  if (dep.includes("高")) return "#f97316";
  if (dep.includes("中〜高")) return "#f59e0b";
  if (dep.includes("中")) return "#eab308";
  if (dep.includes("低〜中")) return "#84cc16";
  if (dep.includes("低")) return "#22c55e";
  return "#555";
};

const LEGEND = [
  { color: STATUS_COLORS.legal, label: "合法" },
  { color: STATUS_COLORS.defacto, label: "容認" },
  { color: STATUS_COLORS.partial, label: "一部" },
  { color: STATUS_COLORS.prescription, label: "処方/医療" },
  { color: STATUS_COLORS.banMedical, label: "禁止/医療可" },
  { color: STATUS_COLORS.decrim, label: "非犯罪化" },
  { color: STATUS_COLORS.grey, label: "グレー" },
  { color: STATUS_COLORS.banned, label: "禁止" },
  { color: STATUS_COLORS.death, label: "厳罰/死刑" },
];

export default function App() {
  const [cat, setCat] = useState("すべて");
  const [shown, setShown] = useState(["JP","US","NL","DE","PT","TH","AU","CA","UK","CN","SG","KR"]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [newOnly, setNewOnly] = useState(false);

  const list = useMemo(() =>
    substances.filter(s => {
      if (cat !== "すべて" && s.category !== cat) return false;
      if (newOnly && !s.newFlag) return false;
      if (q && !s.name.includes(q) && !s.category.includes(q) && !s.note.includes(q)) return false;
      return true;
    }), [cat, q, newOnly]);

  const toggle = (code) =>
    setShown(p => p.includes(code) ? (p.length > 1 ? p.filter(c => c !== code) : p) : [...p, code]);

  const cols = countries.filter(c => shown.includes(c.code));

  return (
    <div className="min-h-screen text-gray-100" style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "linear-gradient(180deg, #06060a 0%, #0a0c14 30%, #080a10 100%)",
    }}>
      {/* Hero */}
      <header className="pt-16 pb-12 px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-4">Substance Legality Map</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3"
          style={{ background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          依存性物質 国際合法性マップ
        </h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
          {substances.length}種の依存性物質 × {countries.length}カ国<br />
          <span className="text-gray-600">依存性の高い順 → 違法性の高い順</span>
        </p>
      </header>

      <div className="max-w-[1600px] mx-auto px-6">
        {/* Legend - 横一行、ドットだけ */}
        <div className="flex items-center justify-center gap-4 mb-10 flex-wrap">
          {LEGEND.map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
              <span className="text-[11px] text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Filters - 1行にまとめる */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <input className="bg-transparent border-b border-white/10 px-0 py-1 text-sm text-white placeholder-gray-700 w-40 focus:outline-none focus:border-white/30 transition-colors"
            placeholder="検索..." value={q} onChange={e => setQ(e.target.value)} />
          <button onClick={() => setNewOnly(!newOnly)}
            className={`text-[11px] px-2.5 py-1 rounded transition-all ${newOnly ? "text-amber-400 bg-amber-500/10" : "text-gray-600 hover:text-gray-400"}`}>
            🆕 最新変化のみ
          </button>
          <span className="w-px h-4 bg-white/10 mx-1" />
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`text-[11px] px-2 py-0.5 rounded transition-all ${cat === c ? "text-white bg-white/10" : "text-gray-600 hover:text-gray-400"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Country selector */}
        <div className="flex flex-wrap items-center gap-1.5 mb-8">
          {countries.map(c => (
            <button key={c.code} onClick={() => toggle(c.code)}
              className={`text-[11px] px-1.5 py-0.5 rounded transition-all ${shown.includes(c.code) ? "text-gray-300" : "text-gray-700 hover:text-gray-500"}`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Heatmap chart */}
        <div className="overflow-x-auto">
          {/* Column headers (国名) - 1回だけ */}
          <div className="flex items-end mb-1" style={{ paddingLeft: "260px" }}>
            {cols.map(c => (
              <div key={c.code} className="text-center shrink-0" style={{ width: "52px" }}>
                <span className="text-[10px] text-gray-600 leading-none">{c.name.replace(/^.+\s/, '')}</span>
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-px">
            {list.map((s, i) => {
              const isOpen = open === i;
              return (
                <div key={i}>
                  <div className="flex items-center cursor-pointer group transition-all"
                    style={{ background: isOpen ? "rgba(255,255,255,0.03)" : "transparent" }}
                    onClick={() => setOpen(isOpen ? null : i)}>

                    {/* Left: substance info */}
                    <div className="shrink-0 py-2 pr-4 flex items-center gap-3" style={{ width: "260px" }}>
                      {/* Dependence bar */}
                      <div className="w-1 h-6 rounded-full shrink-0" style={{ background: depColor(s.dependence) }} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {s.newFlag && <span className="text-[10px] text-amber-500">N</span>}
                          <span className="text-[13px] font-medium text-gray-200 truncate group-hover:text-white transition-colors">{s.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-600">{s.category}</span>
                      </div>
                    </div>

                    {/* Right: heatmap cells */}
                    <div className="flex items-center">
                      {cols.map(c => {
                        const status = s[c.code];
                        const color = STATUS_COLORS[getStatusKey(status)];
                        return (
                          <div key={c.code} className="shrink-0 flex items-center justify-center" style={{ width: "52px", height: "32px" }}
                            title={`${c.name.replace(/^.+\s/, '')}: ${status}`}>
                            <div className="w-8 h-5 rounded-[3px] flex items-center justify-center transition-all group-hover:scale-110"
                              style={{ background: color }}>
                              <span className="text-[8px] font-medium text-white/80 leading-none">{getShortLabel(status)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="pl-[260px] pr-4 pb-5 pt-1">
                      <p className="text-[12px] text-gray-400 leading-relaxed mb-4 max-w-2xl">{s.note}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-1">
                        {countries.map(c => {
                          const status = s[c.code];
                          const color = STATUS_COLORS[getStatusKey(status)];
                          return (
                            <div key={c.code} className="flex items-center gap-2 py-0.5">
                              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: color }} />
                              <span className="text-[11px] text-gray-500 w-14 shrink-0">{c.name.replace(/^.+\s/, '')}</span>
                              <span className="text-[11px] text-gray-400 truncate" title={status}>{status}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {list.length === 0 && (
            <div className="text-center py-20 text-gray-600 text-sm">該当なし</div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-12 mt-8 border-t border-white/5">
          <p className="text-[11px] text-gray-700 leading-relaxed">
            データ確認 2025年2月 — 法律は随時変更されます<br />
            参考情報のみ。渡航・ビジネスの判断には各国公式情報をご確認ください
          </p>
        </footer>
      </div>
    </div>
  );
}
