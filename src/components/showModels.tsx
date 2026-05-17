// src/components/showModels.tsx
import { createResource, For, Suspense, onMount, createSignal, Show } from "solid-js";
import { API_BASE_URL } from "../../config";
import ModelViewer from "./ModelViewer";

type ShowModelsProps = {
  token: string | null;
  onRefetchReady?: (refetchFn: () => void) => void;
};

type Model = {
  id: string;
  display_name: string;
  qr_code: string;
  query: string;
  uploaded_at: string;
  online: boolean;
};

function ShowModels(props: ShowModelsProps) {
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [editName, setEditName] = createSignal("");
  const [renamingId, setRenamingId] = createSignal<string | null>(null);
  const [qrModalModel, setQrModalModel] = createSignal<Model | null>(null);

  const fetchModels = async (): Promise<Model[]> => {
    const response = await fetch(`${API_BASE_URL}/model`, {
      headers: { Authorization: `${props.token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch models");
    return response.json();
  };

  const [modelsResource, { refetch }] = createResource(fetchModels);

  onMount(() => {
    if (props.onRefetchReady) props.onRefetchReady(refetch);
  });

  const handleToggleOnline = async (model: Model) => {
    await fetch(`${API_BASE_URL}/model/${model.query}`, {
      method: "PUT",
      headers: { Authorization: `${props.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ online: !model.online, display_name: model.display_name, refresh_qr_code: false }),
    });
    refetch();
  };

  const handleDelete = async (query: string) => {
    if (!confirm("Delete this model? This cannot be undone.")) return;
    await fetch(`${API_BASE_URL}/model/${query}`, {
      method: "DELETE",
      headers: { Authorization: `${props.token}` },
    });
    refetch();
  };

  const startRename = (model: Model) => {
    setEditingId(model.query);
    setEditName(model.display_name);
  };

  const handleRename = async (model: Model) => {
    if (!editName().trim()) return;
    setRenamingId(model.query);
    await fetch(`${API_BASE_URL}/model/${model.query}`, {
      method: "PUT",
      headers: { Authorization: `${props.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: editName(), online: model.online, refresh_qr_code: false }),
    });
    setEditingId(null);
    setRenamingId(null);
    refetch();
  };

  const handleRefreshQR = async (model: Model) => {
    await fetch(`${API_BASE_URL}/model/${model.query}`, {
      method: "PUT",
      headers: { Authorization: `${props.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: model.display_name, online: model.online, refresh_qr_code: true }),
    });
    refetch();
  };

  const downloadQR = (model: Model) => {
    const a = document.createElement("a");
    a.href = `${API_BASE_URL}${model.qr_code}`;
    a.download = `${model.query}-qr.png`;
    a.click();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style="margin-top:40px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
        <h2 style="font-size:18px; font-weight:800; letter-spacing:-0.01em; margin:0;">Your Models</h2>
        <button
          class="btn-ghost"
          style="font-size:12px; padding:7px 14px;"
          onClick={refetch}
        >
          ↻ Refresh
        </button>
      </div>

      <Suspense fallback={
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:16px;">
          {Array(3).fill(0).map(() => (
            <div style="background:var(--surface); border:1px solid var(--border); border-radius:12px; height:300px; animation:pulse 1.5s ease infinite;" />
          ))}
        </div>
      }>
        <Show
          when={modelsResource() && modelsResource()!.length > 0}
          fallback={
            <div style="text-align:center; padding:60px 24px; border:1px dashed var(--border); border-radius:12px;">
              <div style="font-size:36px; margin-bottom:12px; opacity:0.4;">📦</div>
              <div style="font-weight:700; margin-bottom:6px;">No models yet</div>
              <div style="font-family:var(--font-mono); font-size:12px; color:var(--text3);">Upload your first GLB model above</div>
            </div>
          }
        >
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:16px;">
            <For each={modelsResource()}>
              {(model) => (
                <div class="ar-card" style="padding:0; overflow:hidden; display:flex; flex-direction:column;">
                  {/* 3D Preview */}
                  <div style="position:relative;">
                    <ModelViewer
                      modelUrl={`/model/files/${model.query}`}
                      displayName={model.display_name}
                    />
                    {/* Online badge */}
                    <div style="position:absolute; top:8px; right:8px;">
                      <span class={model.online ? "tag tag-online" : "tag tag-offline"}>
                        <span style={`display:inline-block; width:5px; height:5px; border-radius:50%; background:${model.online ? "var(--green)" : "var(--text3)"};`} />
                        {model.online ? "Live" : "Offline"}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div style="padding:14px; flex:1; display:flex; flex-direction:column; gap:10px;">
                    {/* Name / rename */}
                    {editingId() === model.query ? (
                      <div style="display:flex; gap:6px;">
                        <input
                          class="ar-input"
                          style="font-size:12px; padding:6px 10px; flex:1;"
                          value={editName()}
                          onInput={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRename(model); if (e.key === "Escape") setEditingId(null); }}
                          autofocus
                        />
                        <button
                          class="btn-primary"
                          style="padding:6px 10px; font-size:11px;"
                          onClick={() => handleRename(model)}
                          disabled={!!renamingId()}
                        >✓</button>
                        <button class="btn-ghost" style="padding:6px 8px; font-size:11px;" onClick={() => setEditingId(null)}>✕</button>
                      </div>
                    ) : (
                      <div
                        style="font-weight:700; font-size:13px; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
                        title={`Click to rename: ${model.display_name}`}
                        onClick={() => startRename(model)}
                      >
                        {model.display_name}
                        <span style="font-size:10px; color:var(--text3); margin-left:4px; opacity:0.6;">✎</span>
                      </div>
                    )}

                    <div style="font-family:var(--font-mono); font-size:10px; color:var(--text3);">{formatDate(model.uploaded_at)}</div>

                    {/* Toggle online */}
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; user-select:none;">
                      <div class="toggle">
                        <input type="checkbox" checked={model.online} onChange={() => handleToggleOnline(model)} />
                        <div class="toggle-slider" />
                      </div>
                      <span style="font-size:12px; color:var(--text2);">{model.online ? "Published" : "Unpublished"}</span>
                    </label>

                    {/* Actions */}
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:auto;">
                      <button
                        style="flex:1; padding:6px 8px; background:var(--surface2); border:1px solid var(--border); border-radius:6px; color:var(--text2); font-size:11px; font-family:var(--font-mono); cursor:pointer; transition:all 0.2s; min-width:0;"
                        onClick={() => setQrModalModel(model)}
                      >
                        QR Code
                      </button>
                      <button
                        style="flex:1; padding:6px 8px; background:var(--surface2); border:1px solid var(--border); border-radius:6px; color:var(--text2); font-size:11px; font-family:var(--font-mono); cursor:pointer; transition:all 0.2s; min-width:0;"
                        onClick={() => handleRefreshQR(model)}
                        title="Generate a new QR code"
                      >
                        ↻ QR
                      </button>
                      <button class="btn-danger" style="flex:1; min-width:0;" onClick={() => handleDelete(model.query)}>Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>

        {modelsResource.error && (
          <div style="color:var(--red); font-family:var(--font-mono); font-size:12px; padding:16px; border:1px solid rgba(255,68,102,0.2); border-radius:8px;">
            Error: {modelsResource.error.message}
          </div>
        )}
      </Suspense>

      {/* QR Modal */}
      <Show when={qrModalModel()}>
        {(model) => (
          <div
            style="position:fixed; inset:0; background:rgba(7,10,15,0.85); backdrop-filter:blur(8px); z-index:50; display:flex; align-items:center; justify-content:center; padding:24px;"
            onClick={() => setQrModalModel(null)}
          >
            <div
              class="ar-card"
              style="max-width:340px; width:100%; padding:32px; text-align:center;"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style="font-size:16px; font-weight:800; margin:0 0 6px;">{model().display_name}</h3>
              <p style="color:var(--text3); font-family:var(--font-mono); font-size:11px; margin:0 0 24px;">Scan to view in Augmented Reality</p>
              <div style="display:inline-block; background:white; padding:16px; border-radius:10px; margin-bottom:24px;">
                <img src={`${API_BASE_URL}${model().qr_code}`} alt="QR" style="width:200px; height:200px; display:block;" />
              </div>
              <div style="display:flex; gap:10px;">
                <button class="btn-ghost" style="flex:1;" onClick={() => setQrModalModel(null)}>Close</button>
                <button class="btn-primary" style="flex:1;" onClick={() => downloadQR(model())}>Download</button>
              </div>
              <a
                href={`${API_BASE_URL}/model/files/${model().query}`}
                target="_blank"
                style="display:block; margin-top:12px; font-family:var(--font-mono); font-size:11px; color:var(--text3); text-decoration:none; text-transform:uppercase; letter-spacing:0.08em;"
              >
                Open AR Link ↗
              </a>
            </div>
          </div>
        )}
      </Show>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default ShowModels;