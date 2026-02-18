import { useState } from "react";
import { substances, countries } from "./data/substances";

const COLORS = {
  death:       ["#5c1010", "#8b1a2a"],
  severe:      ["#7a1520", "#a32030"],
  banned:      ["#c41e1e", "#e04838"],
  inhale:      ["#c41e1e", "#e04838"],
  banMedical:  ["#7c28c8", "#a855f7"],
  decrim:      ["#e06010", "#f59e3b"],
  prescription:["#2563c0", "#4d8ef7"],
  medicalOnly: ["#2563c0", "#4d8ef7"],
  partial:     ["#ca9a08", "#ecd34d"],
  grey:        ["#52525b", "#7e7e8a"],
  defacto:     ["#16a34a", "#34d67a"],
  legal:       ["#0d9473", "#2edba8"],
  unknown:     ["#1e1e22", "#2e2e34"],
};

const flat = (key) => COLORS[key][0];
const grad = (key) => `linear-gradient(135deg, ${COLORS[key][0]}, ${COLORS[key][1]})`;

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
  if (d.includes("非常に高")) return "#e5e5e5";
  if (d.includes("高")) return "#a3a3a3";
  if (d.includes("中〜高")) return "#737373";
  if (d.includes("中")) return "#525252";
  if (d.includes("低〜中")) return "#3f3f46";
  if (d.includes("低")) return "#27272a";
  return "#1c1c1e";
};

const shortName = (name) => name.replace(/^.+\s/, "");

const LABEL = {
  death: "死刑", severe: "厳罰", banned: "禁止", inhale: "禁止",
  banMedical: "禁/医", decrim: "非犯", prescription: "処方", medicalOnly: "医療",
  partial: "一部", grey: "灰", defacto: "容認", legal: "合法", unknown: "",
};

export default function App() {
  const [open, setOpen] = useState(null);
  const [hover, setHover] = useState(null);

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

        {/* Chart */}
        <div>
          {/* Column header */}
          <div className="flex items-end mb-2" style={{ paddingLeft: "180px" }}>
            {countries.map(c => (
              <div key={c.code} className="shrink-0 text-center" style={{ width: "clamp(32px, 4.2vw, 52px)" }}>
                <span className="text-[8px] text-gray-700 tracking-wider whitespace-nowrap">{shortName(c.name)}</span>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="h-px mb-2" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 180px, rgba(255,255,255,0.04) 100%)" }} />

          {/* Rows */}
          {substances.map((s, i) => {
            const isOpen = open === i;
            const isHover = hover === i;
            return (
              <div key={i}>
                <div
                  className="flex items-center cursor-pointer group"
                  style={{ position: "relative", zIndex: isHover ? 10 : 1 }}
                  onClick={() => setOpen(isOpen ? null : i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  {/* Left label */}
                  <div className="shrink-0 flex items-center gap-2 pr-3 py-[3px]" style={{ width: "180px" }}>
                    <div className="w-[2px] h-[16px] rounded-full shrink-0 opacity-60" style={{ background: depColor(s.dependence) }} />
                    <div className="min-w-0 flex items-baseline gap-1.5">
                      {s.newFlag && <span className="text-[7px] tracking-[0.08em] font-semibold text-amber-600/70 uppercase shrink-0">new</span>}
                      <span className="text-[11px] text-gray-500 truncate group-hover:text-gray-300 transition-colors">{s.name}</span>
                    </div>
                  </div>

                  {/* Cells */}
                  <div className="flex items-center flex-1" style={{ gap: "1px" }}>
                    {countries.map((c, ci) => {
                      const key = classify(s[c.code]);
                      return (
                        <div key={c.code} className="shrink-0 flex items-center justify-center"
                          style={{ width: "clamp(30px, 4.1vw, 52px)", height: "22px" }}
                          title={`${shortName(c.name)}: ${s[c.code]}`}>
                          <div className="rounded-[2px] flex items-center justify-center"
                            style={{
                              background: grad(key),
                              opacity: 0.88,
                              width: "clamp(26px, 3.6vw, 44px)",
                              height: "16px",
                              filter: isHover ? "blur(0.3px) brightness(1.15) saturate(1.2)" : "none",
                              transform: isHover ? `scale(1.08) rotate(${(ci % 3 - 1) * 0.5}deg)` : "none",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}>
                            <span style={{
                              fontSize: "7px",
                              fontWeight: 600,
                              color: "rgba(255,255,255,0.7)",
                              letterSpacing: "0.02em",
                              lineHeight: 1,
                              userSelect: "none",
                            }}>{LABEL[key]}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detail */}
                {isOpen && (
                  <div className="pb-5 pt-2" style={{ paddingLeft: "180px" }}>
                    <p className="text-[11px] text-gray-600 leading-[1.9] mb-4 max-w-2xl text-left">{s.note}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-[4px]">
                      {countries.map(c => {
                        const key = classify(s[c.code]);
                        return (
                          <div key={c.code} className="flex items-center gap-1.5">
                            <span className="w-[6px] h-[6px] rounded-[1px] shrink-0" style={{ background: flat(key) }} />
                            <span className="text-[9px] text-gray-600 truncate" title={s[c.code]}>
                              <span className="text-gray-700">{shortName(c.name)}</span>
                              {" "}{s[c.code]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Row separator - subtle */}
                {!isOpen && (i + 1) % 5 === 0 && i < substances.length - 1 && (
                  <div className="h-px my-0.5" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 180px, rgba(255,255,255,0.03) 100%)" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="py-20 mt-16">
          <div className="h-px mb-12" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }} />
          <p className="text-[10px] text-gray-800 text-left leading-[2]">
            法律は随時変更されます — 参考情報のみ<br />
            渡航・ビジネスの判断には各国公式情報をご確認ください
          </p>
        </footer>
      </div>
    </div>
  );
}
