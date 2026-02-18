import { useState, useMemo } from "react";
import { substances, countries, categories } from "./data/substances";

const STATUS_CONFIG = {
  death:       { bg: "#450a0a", border: "#991b1b", text: "#fca5a5", label: "禁止★死刑",   dot: "#dc2626" },
  severe:      { bg: "#450a0a", border: "#991b1b", text: "#fca5a5", label: "禁止★厳罰",   dot: "#dc2626" },
  banned:      { bg: "#1c0a0a", border: "#7f1d1d", text: "#f87171", label: "禁止",         dot: "#ef4444" },
  banMedical:  { bg: "#1a0a2e", border: "#6b21a8", text: "#c084fc", label: "禁止/医療可",   dot: "#a855f7" },
  decrim:      { bg: "#1a1200", border: "#92400e", text: "#fb923c", label: "非犯罪化",     dot: "#f97316" },
  prescription:{ bg: "#0a1628", border: "#1e40af", text: "#93c5fd", label: "処方箋のみ",   dot: "#3b82f6" },
  medicalOnly: { bg: "#0a1628", border: "#1e40af", text: "#93c5fd", label: "医療のみ合法", dot: "#3b82f6" },
  partial:     { bg: "#1a1a00", border: "#a16207", text: "#fbbf24", label: "部分合法",     dot: "#eab308" },
  grey:        { bg: "#1a1a00", border: "#a16207", text: "#fde047", label: "グレー",       dot: "#facc15" },
  defacto:     { bg: "#0a1a0a", border: "#166534", text: "#86efac", label: "事実上合法",   dot: "#22c55e" },
  legal:       { bg: "#0a1a0a", border: "#166534", text: "#4ade80", label: "合法",         dot: "#22c55e" },
  unknown:     { bg: "#111", border: "#333", text: "#666", label: "-",               dot: "#444" },
  inhale:      { bg: "#1c0a0a", border: "#7f1d1d", text: "#f87171", label: "吸引目的禁止", dot: "#ef4444" },
};

const getStatusKey = (status) => {
  if (!status) return "unknown";
  if (status.includes("死刑")) return "death";
  if (status.includes("禁止（厳罰）")) return "severe";
  if (status.includes("非犯罪化")) return "decrim";
  if ((status.includes("処方箋合法") || status.includes("処方箋必要") || status.includes("医療用合法")) && !status.includes("禁止")) {
    if (status.includes("医療用合法")) return "medicalOnly";
    return "prescription";
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

const getConfig = (status) => STATUS_CONFIG[getStatusKey(status)];

const depLabel = (dep) => {
  if (dep.includes("非常に高")) return { text: "EXTREME", color: "#ef4444" };
  if (dep.includes("高")) return { text: "HIGH", color: "#f97316" };
  if (dep.includes("中〜高")) return { text: "MED-HIGH", color: "#f59e0b" };
  if (dep.includes("中")) return { text: "MEDIUM", color: "#eab308" };
  if (dep.includes("低〜中")) return { text: "LOW-MED", color: "#84cc16" };
  if (dep.includes("低")) return { text: "LOW", color: "#22c55e" };
  return { text: dep, color: "#888" };
};

const LEGEND = [
  { key: "legal", label: "合法" },
  { key: "defacto", label: "事実上合法" },
  { key: "partial", label: "部分合法" },
  { key: "prescription", label: "処方箋/医療" },
  { key: "banMedical", label: "禁止/医療可" },
  { key: "decrim", label: "非犯罪化" },
  { key: "grey", label: "グレー" },
  { key: "banned", label: "禁止" },
  { key: "death", label: "厳罰/死刑" },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [selectedCountries, setSelectedCountries] = useState(["JP","US","NL","DE","PT","TH","AU","CA","UK","CN","SG","KR"]);
  const [search, setSearch] = useState("");
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [showNewOnly, setShowNewOnly] = useState(false);

  const filtered = useMemo(() => {
    return substances.filter(s => {
      if (selectedCategory !== "すべて" && s.category !== selectedCategory) return false;
      if (showNewOnly && !s.newFlag) return false;
      if (search && !s.name.includes(search) && !s.category.includes(search) && !s.note.includes(search)) return false;
      return true;
    });
  }, [selectedCategory, search, showNewOnly]);

  const toggleCountry = (code) => {
    setSelectedCountries(prev =>
      prev.includes(code) ? (prev.length > 1 ? prev.filter(c => c !== code) : prev) : [...prev, code]
    );
  };

  const activeCountries = countries.filter(c => selectedCountries.includes(c.code));

  return (
    <div className="min-h-screen bg-[#08090c] text-gray-100" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-5">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">🌏</span>
            <h1 className="text-2xl font-bold tracking-tight text-white">依存性物質 国際合法性マップ</h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">{substances.length}種 × {countries.length}カ国 — 依存性が高い順・違法性が高い順に並んでいます</p>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-6 py-4">
        {/* Info bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
            📅 2025年2月確認
          </span>
          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            🆕 2024年〜変化あり
          </span>
          <span className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400/60">
            ⚠️ 参考情報のみ
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {LEGEND.map(l => {
            const c = STATUS_CONFIG[l.key];
            return (
              <span key={l.key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
                {l.label}
              </span>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <div className="relative">
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 w-52 focus:outline-none focus:border-white/25 transition-colors"
              placeholder="検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowNewOnly(!showNewOnly)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${showNewOnly ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20"}`}
          >
            🆕 最新の変化のみ
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {categories.map(c => (
            <button key={c} onClick={() => setSelectedCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${selectedCategory === c ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20"}`}
            >{c}</button>
          ))}
        </div>

        {/* Country Toggle */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          <span className="text-xs text-gray-600 self-center mr-1">国:</span>
          {countries.map(c => (
            <button key={c.code} onClick={() => toggleCountry(c.code)}
              className={`text-xs px-2 py-1 rounded-md border transition-all ${selectedCountries.includes(c.code) ? "bg-teal-500/15 border-teal-500/30 text-teal-300" : "bg-white/3 border-white/8 text-gray-600 hover:text-gray-400"}`}
            >{c.name}</button>
          ))}
        </div>

        {/* Grid */}
        <div className="space-y-2">
          {filtered.map((s, i) => {
            const dep = depLabel(s.dependence);
            const isExpanded = expandedIdx === i;
            return (
              <div key={i}
                className="rounded-xl border transition-all cursor-pointer group"
                style={{
                  background: isExpanded ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                  borderColor: isExpanded ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                }}
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
              >
                {/* Main row */}
                <div className="px-4 py-3">
                  {/* Substance name + meta */}
                  <div className="flex items-start justify-between gap-4 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {s.newFlag && <span className="text-amber-400 text-xs shrink-0">🆕</span>}
                      <span className="text-sm font-semibold text-white truncate">{s.name}</span>
                      <span className="text-xs text-gray-600 shrink-0">{s.route}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                        style={{ background: `${dep.color}15`, color: dep.color, border: `1px solid ${dep.color}30` }}>
                        {dep.text}
                      </span>
                      <span className="text-[10px] text-gray-600 px-2 py-0.5 rounded-md bg-white/5">{s.category}</span>
                    </div>
                  </div>

                  {/* Country status grid */}
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(activeCountries.length, 12)}, minmax(0, 1fr))` }}>
                    {activeCountries.map(c => {
                      const status = s[c.code];
                      const cfg = getConfig(status);
                      return (
                        <div key={c.code} className="rounded-lg px-1.5 py-1.5 text-center transition-all group-hover:scale-[1.01]"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                          title={`${c.name}: ${status}`}
                        >
                          <div className="text-[9px] text-gray-500 mb-0.5 leading-tight truncate">{c.name.replace(/^.+\s/, '')}</div>
                          <div className="text-[10px] font-medium leading-tight truncate" style={{ color: cfg.text }}>{cfg.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/5 pt-3">
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">{s.note}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
                      {countries.map(c => {
                        const status = s[c.code];
                        const cfg = getConfig(status);
                        return (
                          <div key={c.code} className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                            <span className="text-[10px] text-gray-500 w-16 shrink-0">{c.name}</span>
                            <span className="text-[10px] truncate" style={{ color: cfg.text }} title={status}>{status}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-[10px] text-gray-600">📅 データ確認: {s.updated}</div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-600">該当する物質が見つかりません</div>
          )}
        </div>

        {/* Footer */}
        <p className="text-gray-700 text-xs mt-8 mb-4 text-center">
          ※ 法律は随時変更されます。参考情報のみ。渡航・ビジネス等の実際の判断には各国の公式情報・専門家にご相談ください。
        </p>
      </div>
    </div>
  );
}
