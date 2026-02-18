import { useState, useMemo } from "react";
import { substances, countries, categories } from "./data/substances";

const COLORS = {
  death:       "#7f1d1d",
  severe:      "#991b1b",
  banned:      "#dc2626",
  inhale:      "#dc2626",
  banMedical:  "#9333ea",
  decrim:      "#f97316",
  prescription:"#3b82f6",
  medicalOnly: "#3b82f6",
  partial:     "#eab308",
  grey:        "#71717a",
  defacto:     "#22c55e",
  legal:       "#10b981",
  unknown:     "#27272a",
};

const classify = (s) => {
  if (!s) return "unknown";
  if (s.includes("死刑")) return "death";
  if (s.includes("禁止（厳罰）")) return "severe";
  if (s.includes("非犯罪化")) return "decrim";
  if ((s.includes("処方箋合法") || s.includes("処方箋必要") || s.includes("医療用合法")) && !s.includes("禁止"))
    return s.includes("医療用合法") ? "medicalOnly" : "prescription";
  if (s.includes("処方可") && s.includes("禁止")) return "banMedical";
  if (s.includes("禁止（吸引目的）")) return "inhale";
  if (s.includes("合法") && s.includes("禁止")) return "partial";
  if (s.includes("グレーゾーン") || s.includes("グレー")) return "grey";
  if (s.includes("禁止")) return "banned";
  if (s.includes("容認") || s.includes("コーヒーショップ")) return "defacto";
  if (s.includes("合法")) return "legal";
  return "unknown";
};

const depColor = (d) => {
  if (d.includes("非常に高")) return "#ef4444";
  if (d.includes("高")) return "#f97316";
  if (d.includes("中〜高")) return "#f59e0b";
  if (d.includes("中")) return "#eab308";
  if (d.includes("低〜中")) return "#a3e635";
  if (d.includes("低")) return "#22c55e";
  return "#555";
};

const shortName = (name) => name.replace(/^.+\s/, "");

const LEGEND = [
  ["legal","合法"],["defacto","容認"],["partial","一部合法"],
  ["prescription","処方/医療"],["banMedical","禁/医療可"],["decrim","非犯罪化"],
  ["grey","グレー"],["banned","禁止"],["death","厳罰/死刑"],
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

  const toggle = (c) =>
    setShown(p => p.includes(c) ? (p.length > 1 ? p.filter(x => x !== c) : p) : [...p, c]);

  const cols = countries.filter(c => shown.includes(c.code));

  return (
    <div className="min-h-screen text-gray-200" style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "linear-gradient(170deg, #07080c 0%, #0c0e18 40%, #08090e 100%)",
    }}>

      {/* Header */}
      <header className="px-8 pt-14 pb-10 max-w-[1600px] mx-auto">
        <p className="text-[10px] tracking-[0.35em] uppercase text-gray-600 mb-6 font-medium">
          Substance Legality Map
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-gray-300 mb-2">
          依存性物質の国際合法性
        </h1>
        <p className="text-[13px] text-gray-600 leading-relaxed">
          {substances.length}種 × {countries.length}カ国&emsp;·&emsp;2025年2月確認
        </p>
      </header>

      <div className="max-w-[1600px] mx-auto px-8">

        {/* Legend */}
        <div className="flex items-center gap-5 mb-10 flex-wrap">
          {LEGEND.map(([k, l]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="w-[10px] h-[10px] rounded-[2px]" style={{ background: COLORS[k] }} />
              <span className="text-[11px] text-gray-600">{l}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <input
            className="bg-transparent border-b border-white/8 px-0 py-1.5 text-[13px] text-white placeholder-gray-700 w-44 focus:outline-none focus:border-white/20 transition-colors"
            placeholder="検索..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button onClick={() => setNewOnly(!newOnly)}
            className={`text-[11px] transition-colors ${newOnly ? "text-amber-400" : "text-gray-700 hover:text-gray-500"}`}>
            🆕 最新変化のみ
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1 mb-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`text-[11px] px-2 py-1 rounded-sm transition-colors ${cat === c ? "text-gray-200 bg-white/[0.06]" : "text-gray-700 hover:text-gray-500"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1 mb-12">
          {countries.map(c => (
            <button key={c.code} onClick={() => toggle(c.code)}
              className={`text-[11px] px-1.5 py-0.5 rounded-sm transition-colors ${shown.includes(c.code) ? "text-gray-400" : "text-gray-800 hover:text-gray-600"}`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="overflow-x-auto">
          {/* Column header */}
          <div className="flex items-end mb-2" style={{ paddingLeft: "240px" }}>
            {cols.map(c => (
              <div key={c.code} className="shrink-0 text-center" style={{ width: "48px" }}>
                <span className="text-[9px] text-gray-600 tracking-wide">{shortName(c.name)}</span>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="h-px mb-3" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 240px, rgba(255,255,255,0.06) 100%)" }} />

          {/* Rows */}
          {list.map((s, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <div
                  className="flex items-center cursor-pointer group"
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {/* Left label */}
                  <div className="shrink-0 flex items-center gap-2.5 pr-5 py-[7px]" style={{ width: "240px" }}>
                    <div className="w-[3px] h-[18px] rounded-full shrink-0 opacity-70" style={{ background: depColor(s.dependence) }} />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1">
                        {s.newFlag && <span className="text-[9px] text-amber-600 font-medium">N</span>}
                        <span className="text-[12px] text-gray-400 truncate group-hover:text-gray-200 transition-colors">{s.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cells */}
                  <div className="flex items-center">
                    {cols.map(c => {
                      const color = COLORS[classify(s[c.code])];
                      return (
                        <div key={c.code} className="shrink-0 flex items-center justify-center" style={{ width: "48px", height: "28px" }}
                          title={`${shortName(c.name)}: ${s[c.code]}`}>
                          <div className="w-[30px] h-[14px] rounded-[2px] transition-transform group-hover:scale-y-125"
                            style={{ background: color, opacity: 0.85 }} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detail */}
                {isOpen && (
                  <div className="pb-6 pt-2" style={{ paddingLeft: "240px" }}>
                    <p className="text-[12px] text-gray-500 leading-[1.8] mb-5 max-w-2xl">{s.note}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-[6px]">
                      {countries.map(c => {
                        const color = COLORS[classify(s[c.code])];
                        return (
                          <div key={c.code} className="flex items-start gap-2">
                            <span className="w-[6px] h-[6px] rounded-[1px] shrink-0 mt-[5px]" style={{ background: color }} />
                            <div className="min-w-0">
                              <span className="text-[10px] text-gray-600">{shortName(c.name)}</span>
                              <span className="text-[10px] text-gray-500 ml-1.5 truncate" title={s[c.code]}>{s[c.code]}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Row separator - subtle */}
                {!isOpen && (i + 1) % 5 === 0 && i < list.length - 1 && (
                  <div className="h-px my-1" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 240px, rgba(255,255,255,0.04) 100%)" }} />
                )}
              </div>
            );
          })}

          {list.length === 0 && (
            <div className="text-center py-24 text-gray-700 text-[13px]">該当する物質がありません</div>
          )}
        </div>

        {/* Footer */}
        <footer className="py-16 mt-12">
          <div className="h-px mb-10" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)" }} />
          <p className="text-[11px] text-gray-800 text-center leading-[1.8]">
            法律は随時変更されます — 参考情報のみ<br />
            渡航・ビジネスの判断には各国公式情報をご確認ください
          </p>
        </footer>
      </div>
    </div>
  );
}
