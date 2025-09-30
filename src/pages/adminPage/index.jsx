// src/pages/admin/AdminRegionsPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet";
import Wrapper from "../../components/wrapper"; // adjust path if needed
import regionsData from "../../data/services/regionsDataDB"; // your local JSON/JS export
import "./styles.scss";

const LOCAL_STORAGE_KEY = "admin_regions_data";

/**
 * Helper UI pieces:
 * - Primitive editors (text, number, checkbox)
 * - RecursiveEditor: walks objects/arrays and renders appropriate controls
 *
 * Note: this component intentionally does not try to infer complex custom controls
 * (e.g. date pickers, image upload). It uses simple inputs so you can edit every field.
 */

/* ---------- Primitive input ---------- */
const PrimitiveInput = ({ value, onChange, name }) => {
  const t = typeof value;
  if (t === "boolean") {
    return (
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="small">{name}</span>
      </label>
    );
  }

  // choose textarea for long strings
  if (t === "string" && value.length > 80) {
    return (
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    );
  }

  if (t === "number") {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        className="input"
      />
    );
  }

  // default to text
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input"
    />
  );
};

/* ---------- RecursiveEditor ---------- */
const RecursiveEditor = ({ data, onChange, path = "" }) => {
  // data can be primitive / array / object
  const t = Array.isArray(data) ? "array" : typeof data;

  if (t === "array") {
    // array of primitives or objects
    return (
      <div className="recursive-array">
        {(data || []).map((item, idx) => (
          <div key={idx} className="suboption" style={{ marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontWeight: 700 }}>{path ? `${path}[${idx}]` : `Item ${idx + 1}`}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn"
                    onClick={() => {
                      const next = JSON.parse(JSON.stringify(data));
                      next.splice(idx, 1);
                      onChange(next);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* render item recursively */}
              <RecursiveEditor
                data={item}
                onChange={(v) => {
                  const next = JSON.parse(JSON.stringify(data));
                  next[idx] = v;
                  onChange(next);
                }}
                path={`${path}[${idx}]`}
              />
            </div>
          </div>
        ))}

        <div style={{ marginTop: 8 }}>
          <button
            className="btn"
            onClick={() => {
              // push a sensible default element (object or empty string)
              const next = JSON.parse(JSON.stringify(data || []));
              const sample = (data && data.length > 0 && typeof data[0] === "object") ? {} : "";
              next.push(sample);
              onChange(next);
            }}
          >
            Add item
          </button>
        </div>
      </div>
    );
  }

  if (t === "object") {
    // object: render each key
    return (
      <div className="recursive-object">
        {Object.keys(data || {}).map((key) => {
          const val = data[key];
          const valType = Array.isArray(val) ? "array" : typeof val;
          return (
            <div key={key} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6 }}>
                {key}
              </label>

              {valType === "object" && (
                <div style={{ borderLeft: "2px solid #eee", paddingLeft: 10 }}>
                  <RecursiveEditor
                    data={val}
                    onChange={(v) => {
                      const next = { ...data, [key]: v };
                      onChange(next);
                    }}
                    path={path ? `${path}.${key}` : key}
                  />
                </div>
              )}

              {valType === "array" && (
                <RecursiveEditor
                  data={val}
                  onChange={(v) => {
                    const next = { ...data, [key]: v };
                    onChange(next);
                  }}
                  path={path ? `${path}.${key}` : key}
                />
              )}

              {valType !== "object" && valType !== "array" && (
                <PrimitiveInput
                  value={val}
                  name={key}
                  onChange={(v) => {
                    const next = { ...data, [key]: v };
                    onChange(next);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // primitive fallback (should be handled by parent)
  return (
    <PrimitiveInput
      value={data}
      onChange={(v) => onChange(v)}
      name={path || "value"}
    />
  );
};

/* ---------- Main AdminRegionsPage component ---------- */
export default function AdminRegionsPage({ defaultCity = "Bangalore" }) {
  const [city, setCity] = useState(defaultCity);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeRegion, setActiveRegion] = useState(null);
  const [activeCategory, setActiveCategory] = useState("artists");
  const [selectedItem, setSelectedItem] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed);
        const first = Object.keys(parsed?.regions || {})[0] || null;
        setActiveRegion(first);
      } else {
        const clone = JSON.parse(JSON.stringify(regionsData));
        setData(clone);
        const first = Object.keys(clone?.regions || {})[0] || null;
        setActiveRegion(first);
      }
    } catch (e) {
      console.error("Load error", e);
      setError("Failed to load local data");
    } finally {
      setLoading(false);
    }
  }, []);

  const regions = useMemo(() => (data?.regions ? Object.keys(data.regions) : []), [data]);

  const listForActive = useCallback(() => {
    if (!data || !activeRegion) return [];
    return data.regions[activeRegion]?.[activeCategory] || [];
  }, [data, activeRegion, activeCategory]);

  function openEditor(item) {
    setSelectedItem(JSON.parse(JSON.stringify(item)));
    setDirty(false);
  }
  function closeEditor() {
    setSelectedItem(null);
    setDirty(false);
  }

  function persistLocalData(newData) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error("Persist failed", e);
    }
  }

  async function saveSelected() {
    if (!selectedItem || !activeRegion) return;
    try {
      const updated = JSON.parse(JSON.stringify(data));
      updated.regions[activeRegion][activeCategory] = updated.regions[activeRegion][activeCategory] || [];
      const list = updated.regions[activeRegion][activeCategory];
      const idx = list.findIndex(
        (i) =>
          (i.id && selectedItem.id && i.id === selectedItem.id) ||
          (i.title && selectedItem.title && i.title === selectedItem.title)
      );
      if (idx >= 0) list[idx] = selectedItem;
      else list.push(selectedItem);

      setData(updated);
      setDirty(false);
      persistLocalData(updated);
      closeEditor();
    } catch (e) {
      window.alert("Save failed: " + (e.message || e));
    }
  }

  function deleteItem(id) {
    if (!activeRegion) return;
    if (!window.confirm("Delete this item?")) return;
    try {
      const updated = JSON.parse(JSON.stringify(data));
      updated.regions[activeRegion][activeCategory] =
        (updated.regions[activeRegion][activeCategory] || []).filter(
          (i) => i.id !== id && i.title !== id
        );
      setData(updated);
      persistLocalData(updated);
      if (selectedItem && (selectedItem.id === id || selectedItem.title === id)) closeEditor();
    } catch (e) {
      window.alert("Delete failed: " + (e.message || e));
    }
  }

  function addNewItem() {
    const base = {
      id: `tmp-${Date.now()}`,
      title: "New Item",
      image: "",
      price: { min: 0, max: 0 },
      baseFare: 0,
      baseHours: 0,
      extraPerHour: 0,
      subOptions: [],
    };
    openEditor(base);
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-6">No data found</div>;

  return (
    <Wrapper headerLeftType="home" headertext="Admin" footer={false}>
      <Helmet>
        <title>Admin — Regions</title>
      </Helmet>

      <div className="admin-page px-4 py-6">
        <div className="max-w-7xl mx-auto card">
          <div className="">
            {/* <div>
              <h1>Region Editor — {city}</h1>
              <p className="text-muted">Full editable view — edit every field from JSON</p>
            </div> */}

            <div className="action-row">
              <select value={city} onChange={(e) => setCity(e.target.value)} className="input">
                <option>Bangalore</option>
              </select>
              {/* <button
                className="btn"
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(data || {}, null, 2));
                  window.alert("Copied");
                }}
              >
                Copy JSON
              </button>
              <button
                className="btn"
                onClick={() => {
                  localStorage.removeItem(LOCAL_STORAGE_KEY);
                  window.location.reload();
                }}
              >
                Reset
              </button> */}
            </div>
          </div>

          <div className="columns">
            <aside>
              <div>
                <h3 className="text-sm font-medium">Regions</h3>
                <div className="region-list">
                  {regions.length === 0 && <div className="text-xs text-muted">No regions loaded</div>}
                  {regions.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setActiveRegion(r);
                        setSelectedItem(null);
                      }}
                      className={`region-btn ${r === activeRegion ? "active" : ""}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <h3 className="text-sm font-medium">Category</h3>
                <div className="category-list">
                  {[
                    { key: "artists", label: "Artists" },
                    { key: "props", label: "Props" },
                    { key: "liveCounters", label: "Live Counters" },
                  ].map((c) => (
                    <button
                      key={c.key}
                      onClick={() => {
                        setActiveCategory(c.key);
                        setSelectedItem(null);
                      }}
                      className={`cat-btn ${c.key === activeCategory ? "active" : ""}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="add-cta">
                <button className="btn" onClick={addNewItem} style={{ background: "#16a34a", color: "#fff", borderColor: "#13843f" }}>
                  Add New {activeCategory.slice(0, -1)}
                </button>
              </div>
            </aside>

            <main>
              <h2 style={{ marginBottom: 12 }}>{activeRegion || "—"} · {activeCategory}</h2>

              <div className="list-grid">
                {(listForActive() || []).map((item) => (
                  <div key={item.id || item.title} className="item-card">
                    <div className="item-meta">
                      <div className="thumb">
                        {item.image ? <img src={item.image} alt={item.title} /> : <div style={{ padding: 8 }}>No image</div>}
                      </div>
                      <div className="info">
                        <div className="title">{item.title}</div>
                        <div className="meta">{(item.subOptions || []).length} packages</div>
                        <div className="id">{item.id}</div>
                      </div>
                    </div>

                    <div className="item-actions">
                      <button className="btn" onClick={() => openEditor(item)}>Edit</button>
                      <button className="btn" onClick={() => deleteItem(item.id)} style={{ color: "#c53030" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </main>

            <aside className="editor-panel">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <h3>{selectedItem ? selectedItem.title || "Editing item" : "Editor"}</h3>
                  <div className="status">{selectedItem ? "Editing — full JSON fields" : "Select an item to edit or add new"}</div>
                </div>
                <div style={{ fontSize: 12, color: "#999" }}>{dirty ? "Unsaved" : "Saved"}</div>
              </div>

              {!selectedItem ? (
                <div className="text-muted">Select an item to edit (you can edit every nested field)</div>
              ) : (
                <>
                  {/* Top-level fields quick: id, title, image */}
                  <label className="small">ID</label>
                  <input className="input" value={selectedItem.id || ""} onChange={(e) => { setSelectedItem(prev => ({ ...prev, id: e.target.value })); setDirty(true); }} />

                  <label className="small">Title</label>
                  <input className="input" value={selectedItem.title || ""} onChange={(e) => { setSelectedItem(prev => ({ ...prev, title: e.target.value })); setDirty(true); }} />

                  <label className="small">Image URL</label>
                  <input className="input" value={selectedItem.image || ""} onChange={(e) => { setSelectedItem(prev => ({ ...prev, image: e.target.value })); setDirty(true); }} />

                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Full fields</div>
                    <RecursiveEditor
                      data={selectedItem}
                      onChange={(v) => {
                        setSelectedItem(v);
                        setDirty(true);
                      }}
                    />
                  </div>

                  <div className="editor-footer" style={{ marginTop: 12 }}>
                    <div className="small">{dirty ? "You have unsaved changes" : "All changes saved locally"}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn" onClick={closeEditor}>Close</button>
                      <button className="save-btn" disabled={!dirty} onClick={saveSelected}>{dirty ? "Save" : "Saved"}</button>
                    </div>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
