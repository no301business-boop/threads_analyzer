import { useState, useMemo, useRef } from "react";

const Y = "#FFD93D";
const R = "#FF6B6B";
const B = "#4ECDC4";
const G = "#A8E6CF";
const P = "#C9B1FF";
const DARK = "#0a0a0a";
const CARD = "#141414";
const BORDER = "#1f1f1f";

const POST_TYPES = ["あるある・共感系", "Tips・ノウハウ系", "選択肢・リプ誘発系", "ブラックジョーク系", "副業チラ見せ", "セミナー導線"];
const DAYS = ["月", "火", "水", "木", "金", "土", "日"];
const HOURS = ["7時", "8時", "12時", "21時", "その他"];

const SAMPLE_POSTS = [
  { id: 1, text: "もしもし、風間くん？\n\n月曜の何が一番嫌ゾか？\n①満員電車②上司の顔③仕事そのもの④全部\n\nちなみにオラは④だったゾ。", type: "選択肢・リプ誘発系", day: "日", hour: "21時", likes: 24, imps: 820, replies: 8, images: [] },
  { id: 2, text: "もしもし、風間くん？\n\n残業してる人が「頑張ってる」で\n定時で帰る人が「やる気ない」になる会社、\n逃げた方がいいゾ。", type: "ブラックジョーク系", day: "木", hour: "21時", likes: 18, imps: 640, replies: 3, images: [] },
  { id: 3, text: "もしもし、風間くん？\n\nオラがいたブラック会社の特徴だゾ。\n1.有給取ると白い目\n2.飲み会が強制参加\n...\n風間くんの会社、いくつ当てはまるゾか？", type: "あるある・共感系", day: "火", hour: "7時", likes: 31, imps: 1100, replies: 12, images: [] },
  { id: 4, text: "もしもし、風間くん？\n\n転職理由の答え方3選\n本音→前向き変換で評価ガラッと変わるゾ。", type: "Tips・ノウハウ系", day: "土", hour: "8時", likes: 9, imps: 290, replies: 1, images: [] },
  { id: 5, text: "もしもし、風間くん？\n\n給料日に明細見て\n「今月乗り越えられるゾか…」って\nなってた会社員、のはらダゾ。", type: "あるある・共感系", day: "水", hour: "7時", likes: 22, imps: 780, replies: 5, images: [] },
];

export default function App() {
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [tab, setTab] = useState("dashboard");
  const [form, setForm] = useState({ text: "", type: POST_TYPES[0], day: "月", hour: "7時", likes: "", imps: "", replies: "", images: [] });
  const [editId, setEditId] = useState(null);
  const fileRef = useRef(null);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const avgLikes = posts.length ? Math.round(posts.reduce((a, p) => a + p.likes, 0) / posts.length) : 0;
  const totalImps = posts.reduce((a, p) => a + p.imps, 0);
  const topPost = posts.length ? [...posts].sort((a, b) => b.likes - a.likes)[0] : null;

  const dayStats = useMemo(() => {
    return DAYS.map(day => {
      const ps = posts.filter(p => p.day === day);
      return { day, avg: ps.length ? Math.round(ps.reduce((a, p) => a + p.likes, 0) / ps.length) : 0, count: ps.length };
    });
  }, [posts]);

  const typeStats = useMemo(() => {
    return POST_TYPES.map(type => {
      const ps = posts.filter(p => p.type === type);
      return { type, avg: ps.length ? Math.round(ps.reduce((a, p) => a + p.likes, 0) / ps.length) : 0, count: ps.length };
    }).filter(t => t.count > 0).sort((a, b) => b.avg - a.avg);
  }, [posts]);

  const hourStats = useMemo(() => {
    return HOURS.map(hour => {
      const ps = posts.filter(p => p.hour === hour);
      return { hour, avg: ps.length ? Math.round(ps.reduce((a, p) => a + p.likes, 0) / ps.length) : 0, count: ps.length };
    }).filter(h => h.count > 0);
  }, [posts]);

  const maxDayAvg = Math.max(...dayStats.map(d => d.avg), 1);
  const maxTypeAvg = Math.max(...typeStats.map(t => t.avg), 1);
  const maxHourAvg = Math.max(...hourStats.map(h => h.avg), 1);

  const handleImage = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const current = form.images || [];
    const remaining = 4 - current.length;
    const toLoad = files.slice(0, remaining);
    let loaded = [];
    toLoad.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        loaded.push(ev.target.result);
        if (loaded.length === toLoad.length) {
          setForm(f => ({ ...f, images: [...(f.images || []), ...loaded] }));
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (idx) => {
    setForm(f => ({ ...f, images: (f.images || []).filter((_, i) => i !== idx) }));
  };

  const handleSubmit = () => {
    if (!form.text || !form.likes || !form.imps) return;
    const entry = { ...form, likes: Number(form.likes), imps: Number(form.imps), replies: Number(form.replies) || 0, images: form.images || [] };
    if (editId !== null) {
      setPosts(posts.map(p => p.id === editId ? { ...entry, id: editId } : p));
      setEditId(null);
    } else {
      setPosts([...posts, { ...entry, id: Date.now() }]);
    }
    setForm({ text: "", type: POST_TYPES[0], day: "月", hour: "7時", likes: "", imps: "", replies: "", images: [] });
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleEdit = (post) => {
    setForm({ text: post.text, type: post.type, day: post.day, hour: post.hour, likes: String(post.likes), imps: String(post.imps), replies: String(post.replies), images: post.images || [] });
    setEditId(post.id);
    setTab("add");
  };

  const handleDelete = (id) => setPosts(posts.filter(p => p.id !== id));

  const runAI = async () => {
    if (posts.length === 0) return;
    setAiLoading(true);
    setAiResult("");
    setTab("ai");
    try {
      const summary = posts.map(p =>
        `・タイプ:${p.type} 曜日:${p.day} 時間:${p.hour} いいね:${p.likes} インプ:${p.imps} リプ:${p.replies}\n  本文: ${p.text.slice(0, 60)}`
      ).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `Threadsの「係長のはら」アカウントの投稿データを分析してください。\n\n${summary}\n\n## 📊 全体サマリー\n## 🏆 伸びた投稿の共通点\n## 😔 伸びなかった原因\n## 🎯 次に投稿すべきタイプ TOP3\n## ⏰ 最適な投稿時間・曜日\n## 💡 今週試してほしい投稿ネタ2本` }]
        })
      });
      const data = await res.json();
      setAiResult(data.content?.map(c => c.text || "").join("") || "取得できませんでした。");
    } catch (e) {
      setAiResult("エラーが発生しました。");
    }
    setAiLoading(false);
  };

  const tabs = [
    { id: "dashboard", label: "ダッシュボード", icon: "📊" },
    { id: "posts", label: "投稿一覧", icon: "📋" },
    { id: "add", label: editId ? "編集中" : "投稿追加", icon: editId ? "✏️" : "➕" },
    { id: "ai", label: "AI分析", icon: "🤖" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: DARK, fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif", color: "#f0f0f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .tab-btn{transition:all .2s;cursor:pointer;border:1px solid #1f1f1f;font-family:inherit}
        .card{transition:transform .15s}
        input,select,textarea{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:#f0f0f0;font-family:inherit;padding:10px 12px;font-size:13px;width:100%;outline:none;}
        input:focus,select:focus,textarea:focus{border-color:#FFD93D;}
        select option{background:#1a1a1a;}
        .btn{cursor:pointer;font-family:inherit;font-weight:700;border:none;border-radius:8px;padding:10px 20px;font-size:13px;transition:all .2s;}
        .del-btn{cursor:pointer;font-size:11px;padding:3px 8px;border-radius:4px;border:1px solid #333;background:transparent;color:#555;font-family:inherit;}
        .edit-btn{cursor:pointer;font-size:11px;padding:3px 8px;border-radius:4px;border:1px solid #333;background:transparent;color:#555;font-family:inherit;}
      `}</style>

      <div style={{ background: "linear-gradient(135deg, #1a1200, #0a0a0a)", borderBottom: `1px solid ${BORDER}`, padding: "18px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: `linear-gradient(135deg, ${Y}, #ffb300)`, borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📞</div>
          <div>
            <div style={{ fontSize: 16, color: Y, fontWeight: 900 }}>係長のはら 投稿分析アプリ</div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>投稿データを入力してAIが次の戦略を提案するゾ</div>
          </div>
          <button className="btn" onClick={runAI} style={{ marginLeft: "auto", background: `linear-gradient(135deg, ${P}, #9b6fff)`, color: "#fff", fontSize: 12, padding: "8px 16px" }}>🤖 AI分析</button>
        </div>
      </div>

      <div style={{ background: "#0f0f0f", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 6, padding: "8px 16px" }}>
          {tabs.map(t => (
            <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)}
              style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: tab === t.id ? Y + "22" : "#1a1a1a", color: tab === t.id ? Y : "#555", borderColor: tab === t.id ? Y : undefined }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px" }}>
        {tab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "総投稿数", value: posts.length, unit: "本", color: Y },
                { label: "平均いいね", value: avgLikes, unit: "❤️", color: R },
                { label: "総インプ", value: totalImps >= 1000 ? (totalImps / 1000).toFixed(1) + "k" : totalImps, unit: "👁", color: B },
              ].map((k, i) => (
                <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 12px", textAlign: "center", borderTop: `2px solid ${k.color}` }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>{k.unit} {k.label}</div>
                </div>
              ))}
            </div>
            {topPost && (
              <div style={{ background: CARD, border: `1px solid ${Y}44`, borderRadius: 12, padding: "16px 20px", borderLeft: `3px solid ${Y}` }}>
                <div style={{ fontSize: 11, color: Y, fontWeight: 700, marginBottom: 10 }}>🏆 最高パフォーマンス投稿</div>
                <pre style={{ fontSize: 12, color: "#ccc", whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.7, marginBottom: 10 }}>{topPost.text.slice(0, 100)}...</pre>
                <div style={{ display: "flex", gap: 12 }}>
                  {[["❤️", topPost.likes], ["👁", topPost.imps], ["💬", topPost.replies]].map(([icon, val], i) => (
                    <span key={i} style={{ fontSize: 12, color: Y, fontWeight: 700 }}>{icon} {val}</span>
                  ))}
                  <span style={{ fontSize: 11, color: "#555", marginLeft: "auto" }}>{topPost.day}曜 {topPost.hour}</span>
                </div>
              </div>
            )}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px", borderLeft: `3px solid ${B}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: B, marginBottom: 16 }}>曜日別 平均いいね数</div>
              {dayStats.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 24, fontSize: 12, fontWeight: 700, color: d.avg === Math.max(...dayStats.map(x => x.avg)) ? Y : "#666" }}>{d.day}</div>
                  <div style={{ flex: 1, height: 8, background: "#1e1e1e", borderRadius: 4 }}>
                    <div style={{ height: "100%", width: `${(d.avg / maxDayAvg) * 100}%`, background: d.avg === Math.max(...dayStats.map(x => x.avg)) ? Y : B, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc", width: 30, textAlign: "right" }}>{d.avg}</div>
                  <div style={{ fontSize: 10, color: "#444", width: 30 }}>{d.count}本</div>
                </div>
              ))}
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px", borderLeft: `3px solid ${G}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: G, marginBottom: 16 }}>投稿タイプ別 平均いいね数</div>
              {typeStats.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: i === 0 ? Y : "#666", width: 120, flexShrink: 0 }}>{t.type}</div>
                  <div style={{ flex: 1, height: 8, background: "#1e1e1e", borderRadius: 4 }}>
                    <div style={{ height: "100%", width: `${(t.avg / maxTypeAvg) * 100}%`, background: i === 0 ? Y : G, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc", width: 30, textAlign: "right" }}>{t.avg}</div>
                  <div style={{ fontSize: 10, color: "#444", width: 30 }}>{t.count}本</div>
                </div>
              ))}
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px", borderLeft: `3px solid ${R}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: R, marginBottom: 16 }}>時間帯別 平均いいね数</div>
              <div style={{ display: "flex", gap: 10 }}>
                {hourStats.map((h, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 6 }}>
                      <div style={{ width: "60%", background: h.avg === Math.max(...hourStats.map(x => x.avg)) ? R : "#2a2a2a", borderRadius: "4px 4px 0 0", height: `${(h.avg / maxHourAvg) * 80}px`, minHeight: 4 }} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#ccc" }}>{h.avg}</div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{h.hour}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "posts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 13, color: "#666" }}>全{posts.length}件</div>
              <button className="btn" onClick={() => { setEditId(null); setForm({ text: "", type: POST_TYPES[0], day: "月", hour: "7時", likes: "", imps: "", replies: "", images: [] }); setTab("add"); }} style={{ background: Y + "22", color: Y, fontSize: 12, padding: "6px 14px" }}>＋ 追加</button>
            </div>
            {[...posts].sort((a, b) => b.likes - a.likes).map((post, i) => (
              <div key={post.id} className="card" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px", borderLeft: `3px solid ${i === 0 ? Y : BORDER}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ background: B + "22", color: B, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{post.type}</span>
                    <span style={{ background: "#2a2a2a", color: "#888", fontSize: 10, padding: "2px 8px", borderRadius: 4 }}>{post.day}曜 {post.hour}</span>
                    {post.images && post.images.length > 0 && <span style={{ background: G + "22", color: G, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>🖼 画像{post.images.length}枚</span>}
                    {i === 0 && <span style={{ background: Y + "22", color: Y, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>🏆 TOP</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="edit-btn" onClick={() => handleEdit(post)}>編集</button>
                    <button className="del-btn" onClick={() => handleDelete(post.id)}>削除</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  {post.images && post.images.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {post.images.slice(0, 3).map((img, j) => (
                        <div key={j} style={{ position: "relative" }}>
                          <img src={img} alt={`画像${j+1}`} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: `1px solid ${BORDER}` }} />
                          {j === 2 && post.images.length > 3 && (
                            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>+{post.images.length - 3}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <pre style={{ fontSize: 12, color: "#bbb", whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.7, flex: 1 }}>{post.text.slice(0, 80)}{post.text.length > 80 ? "..." : ""}</pre>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  {[["❤️ いいね", post.likes, R], ["👁 インプ", post.imps, B], ["💬 リプ", post.replies, G]].map(([label, val, color], j) => (
                    <div key={j} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color }}>{val}</div>
                      <div style={{ fontSize: 10, color: "#555" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "add" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: Y }}>{editId ? "投稿を編集するゾ" : "新しい投稿を追加するゾ"}</div>
            <div>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 6, fontWeight: 700 }}>投稿本文</div>
              <textarea rows={5} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="もしもし、風間くん？..." style={{ resize: "vertical" }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: "#666", fontWeight: 700 }}>投稿画像（最大4枚・任意）</div>
                {(form.images || []).length > 0 && (form.images || []).length < 4 && (
                  <button onClick={() => fileRef.current?.click()} style={{ fontSize: 11, color: B, background: B + "22", border: `1px solid ${B}44`, borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontFamily: "inherit" }}>＋ 追加</button>
                )}
              </div>
              {(form.images || []).length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
                  {(form.images || []).map((img, idx) => (
                    <div key={idx} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: `1px solid ${BORDER}` }}>
                      <img src={img} alt={`画像${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={() => removeImage(idx)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", color: "#fff", fontSize: 10 }}>✕</button>
                      <div style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(0,0,0,0.6)", borderRadius: 3, fontSize: 9, color: "#fff", padding: "1px 5px" }}>{idx + 1}</div>
                    </div>
                  ))}
                  {(form.images || []).length < 4 && (
                    <div onClick={() => fileRef.current?.click()} style={{ aspectRatio: "1", borderRadius: 8, border: "2px dashed #2a2a2a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#111", gap: 4 }}>
                      <div style={{ fontSize: 20 }}>＋</div>
                      <div style={{ fontSize: 9, color: "#555" }}>追加</div>
                    </div>
                  )}
                </div>
              )}
              {(form.images || []).length === 0 && (
                <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed #2a2a2a", borderRadius: 10, padding: "24px 16px", cursor: "pointer", textAlign: "center", background: "#111" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🖼</div>
                  <div style={{ fontSize: 13, color: "#555" }}>タップして画像を選択するゾ</div>
                  <div style={{ fontSize: 11, color: "#333", marginTop: 4 }}>最大4枚・JPG・PNG・GIF対応</div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImage} style={{ display: "none" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["投稿タイプ", "type", POST_TYPES], ["曜日", "day", DAYS], ["投稿時間", "hour", HOURS]].map(([label, key, opts]) => (
                <div key={key}>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 6, fontWeight: 700 }}>{label}</div>
                  <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              {[["いいね数 ※必須", "likes", "例: 24"], ["インプ数 ※必須", "imps", "例: 820"], ["リプ数", "replies", "例: 8"]].map(([label, key, ph]) => (
                <div key={key}>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 6, fontWeight: 700 }}>{label}</div>
                  <input type="number" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} />
                </div>
              ))}
            </div>
            <button className="btn" onClick={handleSubmit} style={{ background: `linear-gradient(135deg, ${Y}, #ffb300)`, color: "#000", fontSize: 14, padding: "14px" }}>
              {editId ? "✅ 更新するゾ" : "➕ 追加するゾ"}
            </button>
            {editId && (
              <button className="btn" onClick={() => { setEditId(null); setForm({ text: "", type: POST_TYPES[0], day: "月", hour: "7時", likes: "", imps: "", replies: "", images: [] }); if (fileRef.current) fileRef.current.value = ""; }} style={{ background: "#1a1a1a", color: "#666", border: `1px solid ${BORDER}` }}>
                キャンセル
              </button>
            )}
          </div>
        )}

        {tab === "ai" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {aiLoading && (
              <div style={{ background: CARD, border: `1px solid ${P}44`, borderRadius: 12, padding: "40px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🤖</div>
                <div style={{ fontSize: 14, color: P, fontWeight: 700 }}>AI分析中だゾ...</div>
              </div>
            )}
            {!aiLoading && !aiResult && (
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "40px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>📊</div>
                <div style={{ fontSize: 14, color: "#666" }}>右上の「AI分析」ボタンを押すゾ</div>
                <button className="btn" onClick={runAI} style={{ marginTop: 20, background: `linear-gradient(135deg, ${P}, #9b6fff)`, color: "#fff" }}>🤖 今すぐ分析するゾ</button>
              </div>
            )}
            {!aiLoading && aiResult && (
              <div style={{ background: CARD, border: `1px solid ${P}44`, borderRadius: 12, padding: "20px", borderLeft: `3px solid ${P}` }}>
                <div style={{ fontSize: 11, color: P, fontWeight: 700, marginBottom: 16 }}>🤖 AI分析レポート</div>
                <div style={{ fontSize: 13, color: "#ddd", lineHeight: 2, whiteSpace: "pre-wrap" }}>{aiResult}</div>
                <button className="btn" onClick={runAI} style={{ marginTop: 20, background: P + "22", color: P, border: `1px solid ${P}44`, fontSize: 12 }}>🔄 再分析するゾ</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
