import { useState, useMemo } from "react";
import { substances, countries, categories } from "./data/substances";

// 判定順序: 死刑 > 非犯罪化 > 処方・医療（純粋） > 禁止/医療可 > 部分合法 > グレー > 禁止 > 合法
const getStatusColor = (status) => {
  if (!status) return "bg-gray-100 text-gray-400";
  if (status.includes("死刑")) return "bg-red-900 text-white";
  if (status.includes("禁止（厳罰）")) return "bg-red-900 text-white";
  if (status.includes("非犯罪化")) return "bg-orange-400 text-white";
  if ((status.includes("処方箋合法") || status.includes("処方箋必要") || status.includes("医療用合法")) && !status.includes("禁止")) return "bg-blue-500 text-white";
  if (status.includes("処方可") && status.includes("禁止")) return "bg-purple-600 text-white";
  if (status.includes("合法") && status.includes("禁止")) return "bg-yellow-500 text-gray-900";
  if (status.includes("グレーゾーン") || status.includes("グレー")) return "bg-yellow-400 text-gray-800";
  if (status.includes("禁止")) return "bg-red-500 text-white";
  if (status.includes("議論") || status.includes("実験中")) return "bg-yellow-400 text-gray-800";
  if (status.includes("容認") || status.includes("コーヒーショップ")) return "bg-green-600 text-white";
  if (status.includes("合法")) return "bg-green-500 text-white";
  return "bg-gray-200 text-gray-700";
};

const getShortStatus = (status) => {
  if (!status) return "-";
  if (status.includes("死刑")) return "禁止★死刑";
  if (status.includes("禁止（厳罰）")) return "禁止★厳罰";
  if (status.includes("非犯罪化")) return "非犯罪化";
  if ((status.includes("処方箋合法") || status.includes("処方箋必要")) && !status.includes("禁止")) return "処方箋のみ";
  if (status.includes("医療用合法") && !status.includes("禁止")) return "医療のみ合法";
  if (status.includes("処方可") && status.includes("禁止")) return "禁止/医療可";
  if (status.includes("禁止（吸引目的）")) return "吸引目的禁止";
  if (status.includes("合法") && status.includes("禁止")) return "部分合法";
  if (status.includes("グレーゾーン") || status.includes("グレー")) return "グレー";
  if (status.includes("容認") || status.includes("コーヒーショップ")) return "事実上合法";
  if (status.includes("合法（無規制）")) return "合法（規制なし）";
  if (status.includes("合法")) return "合法";
  if (status.includes("禁止")) return "禁止";
  return status.substring(0, 12);
};

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [selectedCountries, setSelectedCountries] = useState(["JP", "US", "NL", "DE", "PT", "AU", "CA", "UK", "SG"]);
  const [search, setSearch] = useState("");
  const [showDetail, setShowDetail] = useState(null);
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

  const legend = [
    { color: "bg-green-500", label: "合法" },
    { color: "bg-green-600", label: "事実上合法" },
    { color: "bg-yellow-500", label: "部分合法（一部禁止）" },
    { color: "bg-blue-500", label: "処方箋/医療のみ" },
    { color: "bg-purple-600", label: "禁止/医療可" },
    { color: "bg-orange-400", label: "非犯罪化" },
    { color: "bg-yellow-400", label: "グレーゾーン" },
    { color: "bg-red-500", label: "禁止" },
    { color: "bg-red-900", label: "禁止（厳罰・死刑）" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 font-sans">
      <h1 className="text-2xl font-bold mb-1 text-white">🌏 依存性物質 国際合法性マップ</h1>
      <p className="text-gray-400 text-sm">{substances.length}種の依存性物質 × {countries.length}カ国の法的地位</p>

      {/* Data timestamp */}
      <div className="flex flex-wrap gap-2 mt-2 mb-4 text-xs">
        <span className="bg-gray-800 border border-gray-600 px-2 py-1 rounded text-gray-300">
          📅 データ最終確認：<strong className="text-white">2025年2月</strong>（法律は随時変更されます）
        </span>
        <span className="bg-yellow-950 border border-yellow-700 px-2 py-1 rounded text-yellow-300">
          🆕 = 2024年以降に主要な変化があった物質
        </span>
        <span className="bg-gray-900 border border-red-800 px-2 py-1 rounded text-gray-500">
          ⚠️ 参考情報のみ。渡航前は各国の公式情報を必ず確認
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {legend.map(l => (
          <span key={l.label} className={`${l.color} text-white text-xs px-2 py-1 rounded`}>{l.label}</span>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <input
          className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white placeholder-gray-500 w-48"
          placeholder="物質名・キーワード検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          onClick={() => setShowNewOnly(!showNewOnly)}
          className={`text-xs px-3 py-1 rounded border transition-colors ${showNewOnly ? "bg-yellow-700 border-yellow-500 text-white" : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"}`}
        >
          🆕 2024年以降の変化のみ表示
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1 mb-4">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`text-xs px-2 py-1 rounded border transition-colors ${selectedCategory === c ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Country Toggle */}
      <div className="flex flex-wrap gap-1 mb-4">
        <span className="text-xs text-gray-500 self-center mr-1">国を選択:</span>
        {countries.map(c => (
          <button
            key={c.code}
            onClick={() => toggleCountry(c.code)}
            className={`text-xs px-2 py-1 rounded border transition-colors ${selectedCountries.includes(c.code) ? "bg-teal-700 border-teal-500 text-white" : "bg-gray-800 border-gray-700 text-gray-500"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="text-xs border-collapse min-w-full">
          <thead>
            <tr className="bg-gray-800">
              <th className="text-left px-3 py-2 border-b border-gray-700 text-gray-300 min-w-36 sticky left-0 bg-gray-800 z-10">物質</th>
              <th className="text-left px-2 py-2 border-b border-gray-700 text-gray-400 min-w-20">カテゴリ</th>
              <th className="text-left px-2 py-2 border-b border-gray-700 text-gray-400 min-w-16">依存性</th>
              {countries.filter(c => selectedCountries.includes(c.code)).map(c => (
                <th key={c.code} className="px-2 py-2 border-b border-gray-700 text-gray-300 min-w-20 text-center">{c.name}</th>
              ))}
              <th className="text-left px-2 py-2 border-b border-gray-700 text-gray-500 min-w-16">確認日</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={i}
                className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => setShowDetail(showDetail === i ? null : i)}
              >
                <td className="px-3 py-2 font-medium text-white sticky left-0 bg-gray-900 hover:bg-gray-800 border-r border-gray-800">
                  <div className="flex items-center gap-1">
                    {s.newFlag && <span className="text-yellow-400">🆕</span>}
                    <span>{s.name}</span>
                  </div>
                  <div className="text-gray-500">{s.route}</div>
                </td>
                <td className="px-2 py-2 text-gray-400">{s.category}</td>
                <td className="px-2 py-2 text-gray-300">{s.dependence}</td>
                {countries.filter(c => selectedCountries.includes(c.code)).map(c => {
                  const status = s[c.code];
                  return (
                    <td key={c.code} className="px-1 py-1 text-center">
                      <span className={`inline-block text-xs px-1 py-0.5 rounded ${getStatusColor(status)}`}>
                        {getShortStatus(status)}
                      </span>
                    </td>
                  );
                })}
                <td className="px-2 py-2 text-gray-600">{s.updated}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={99} className="text-center py-8 text-gray-500">該当する物質が見つかりません</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {showDetail !== null && filtered[showDetail] && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-600 p-4 shadow-2xl z-50 max-h-80 overflow-y-auto">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-lg font-bold text-white">{filtered[showDetail].name}</h2>
              <span className="text-xs text-gray-500">データ確認: {filtered[showDetail].updated}</span>
            </div>
            <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-white text-xl ml-4">✕</button>
          </div>
          <p className="text-gray-300 text-sm mb-3">{filtered[showDetail].note}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {countries.map(c => (
              <div key={c.code} className="flex items-center gap-1">
                <span className="text-xs text-gray-400 w-20 shrink-0">{c.name}</span>
                <span
                  className={`text-xs px-1 py-0.5 rounded flex-1 text-center truncate ${getStatusColor(filtered[showDetail][c.code])}`}
                  title={filtered[showDetail][c.code]}
                >
                  {getShortStatus(filtered[showDetail][c.code])}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-gray-700 pt-3">
            <p className="text-xs text-gray-500 mb-1">詳細（選択中の国）:</p>
            <div className="space-y-1">
              {countries.filter(c => selectedCountries.includes(c.code)).map(c => (
                <div key={c.code} className="text-xs text-gray-400">
                  <span className="text-gray-300">{c.name}</span>: {filtered[showDetail][c.code]}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-gray-700 text-xs mt-4">
        ※ 法律は随時変更されます。この情報は参考目的のみです。渡航・ビジネス等の実際の判断には各国の公式情報・専門家にご相談ください。
      </p>
    </div>
  );
}
