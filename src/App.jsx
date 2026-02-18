import { useState } from "react";
import { substances, countries } from "./data/substances";

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
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen text-gray-200" style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "linear-gradient(170deg, #07080c 0%, #0c0e18 40%, #08090e 100%)",
    }}>

      {/* Header */}
      <header className="px-8 pt-16 pb-12 max-w-[1600px] mx-auto">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gray-700 mb-8 font-medium">
          Substance Legality Map
        </p>
        <h1 className="text-lg font-medium tracking-tight text-gray-400 mb-3">
          依存性物質の国際合法性
        </h1>
        <p className="text-[12px] text-gray-700 leading-relaxed">
          {substances.length}種 × {countries.length}カ国
        </p>
      </header>

      <div className="max-w-[1600px] mx-auto px-8">

        {/* Legend */}
        <div className="flex items-center gap-5 mb-14 flex-wrap">
          {LEGEND.map(([k, l]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="w-[8px] h-[8px] rounded-[2px]" style={{ background: COLORS[k] }} />
              <span className="text-[10px] text-gray-700">{l}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="overflow-x-auto">
          {/* Column header */}
          <div className="flex items-end mb-3" style={{ paddingLeft: "200px" }}>
            {countries.map(c => (
              <div key={c.code} className="shrink-0 text-center" style={{ width: "48px" }}>
                <span className="text-[8px] text-gray-700 tracking-wider">{shortName(c.name)}</span>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 200px, rgba(255,255,255,0.04) 100%)" }} />

          {/* Rows */}
          {substances.map((s, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <div
                  className="flex items-center cursor-pointer group"
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {/* Left label */}
                  <div className="shrink-0 flex items-center gap-2 pr-4 py-[6px]" style={{ width: "200px" }}>
                    <div className="w-[2px] h-[16px] rounded-full shrink-0 opacity-60" style={{ background: depColor(s.dependence) }} />
                    <span className="text-[11px] text-gray-500 truncate group-hover:text-gray-300 transition-colors">{s.name}</span>
                  </div>

                  {/* Cells */}
                  <div className="flex items-center">
                    {countries.map(c => {
                      const color = COLORS[classify(s[c.code])];
                      return (
                        <div key={c.code} className="shrink-0 flex items-center justify-center" style={{ width: "48px", height: "26px" }}
                          title={`${shortName(c.name)}: ${s[c.code]}`}>
                          <div className="w-[28px] h-[12px] rounded-[2px] transition-transform group-hover:scale-y-[1.3]"
                            style={{ background: color, opacity: 0.8 }} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detail */}
                {isOpen && (
                  <div className="pb-6 pt-2" style={{ paddingLeft: "200px" }}>
                    <p className="text-[11px] text-gray-600 leading-[1.9] mb-5 max-w-2xl">{s.note}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-[5px]">
                      {countries.map(c => {
                        const color = COLORS[classify(s[c.code])];
                        return (
                          <div key={c.code} className="flex items-start gap-2">
                            <span className="w-[5px] h-[5px] rounded-[1px] shrink-0 mt-[5px]" style={{ background: color }} />
                            <div className="min-w-0">
                              <span className="text-[9px] text-gray-700">{shortName(c.name)}</span>
                              <span className="text-[9px] text-gray-600 ml-1.5 truncate" title={s[c.code]}>{s[c.code]}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Row separator - subtle */}
                {!isOpen && (i + 1) % 5 === 0 && i < substances.length - 1 && (
                  <div className="h-px my-1" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 200px, rgba(255,255,255,0.03) 100%)" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="py-20 mt-16">
          <div className="h-px mb-12" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }} />
          <p className="text-[10px] text-gray-800 text-center leading-[2]">
            法律は随時変更されます — 参考情報のみ<br />
            渡航・ビジネスの判断には各国公式情報をご確認ください
          </p>
        </footer>
      </div>
    </div>
  );
}
