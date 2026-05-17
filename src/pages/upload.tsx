// src/pages/upload.tsx
import { onMount, Suspense, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { getCookie, deleteCookie } from "../utils/cookies";
import { API_BASE_URL } from "../../config";
import ShowModels from "../components/showModels";

function Upload() {
  const [refetchModels, setRefetchModels] = createSignal<() => void>();
  const [file, setFile] = createSignal<File | null>(null);
  const [displayName, setDisplayName] = createSignal("");
  const [online, setOnline] = createSignal(true);
  const [uploading, setUploading] = createSignal(false);
  const [dragOver, setDragOver] = createSignal(false);
  const navigate = useNavigate();

  const token = getCookie("token");

  onMount(() => {
    if (!token) navigate("/login", { replace: true });
  });

  const logout = () => {
    deleteCookie("token");
    navigate("/login", { replace: true });
  };

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".glb")) {
      alert("Only .glb files are supported.");
      return;
    }
    setFile(f);
    if (!displayName()) setDisplayName(f.name.replace(".glb", ""));
  };

  const handleUpload = async (e: Event) => {
    e.preventDefault();
    if (!file()) return;
    setUploading(true);

    const formData = new FormData();
    formData.set("model", file()!);
    formData.set("displayName", displayName());
    formData.set("online", online() ? "true" : "false");

    try {
      const response = await fetch(`${API_BASE_URL}/model`, {
        method: "POST",
        headers: { Authorization: `${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      setFile(null);
      setDisplayName("");
      setOnline(true);
      (document.getElementById("glb-input-auth") as HTMLInputElement).value = "";
      refetchModels()?.();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div class="grid-bg" style="min-height:100vh;">
      {/* Topbar */}
      <div style="position:sticky; top:0; z-index:10; background:rgba(7,10,15,0.9); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); padding:0 32px; height:56px; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:28px; height:28px; border:2px solid var(--accent); border-radius:6px; display:flex; align-items:center; justify-content:center;">
            <div style="width:10px; height:10px; background:var(--accent); border-radius:2px;" />
          </div>
          <span style="font-family:var(--font-mono); font-size:12px; color:var(--accent); letter-spacing:0.15em; text-transform:uppercase;">AR Code</span>
          <span style="width:1px; height:16px; background:var(--border); margin:0 4px;" />
          <span style="font-family:var(--font-mono); font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em;">Dashboard</span>
        </div>
        <button class="btn-danger" style="font-size:12px; padding:6px 14px;" onClick={logout}>
          Sign Out
        </button>
      </div>

      <div style="max-width:1100px; margin:0 auto; padding:40px 24px;">
        {/* Upload section */}
        <div style="margin-bottom:48px;" class="fade-in-up">
          <h1 style="font-size:22px; font-weight:800; margin:0 0 24px; letter-spacing:-0.02em;">
            Upload Model
          </h1>

          <form onSubmit={handleUpload}>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start;">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer?.files[0]; if (f) handleFile(f); }}
                style={`border:2px dashed ${dragOver() ? "var(--accent)" : file() ? "var(--green)" : "var(--border2)"}; border-radius:12px; padding:28px 20px; text-align:center; cursor:pointer; transition:all 0.2s; background:${file() ? "var(--green-glow)" : dragOver() ? "var(--accent-glow)" : "var(--surface)"};`}
                onClick={() => (document.getElementById("glb-input-auth") as HTMLInputElement)?.click()}
              >
                <input
                  id="glb-input-auth"
                  type="file"
                  accept=".glb"
                  style="display:none"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                {file() ? (
                  <div>
                    <div style="font-size:24px; margin-bottom:6px;">📦</div>
                    <div style="font-weight:700; color:var(--green); font-size:13px; margin-bottom:2px; word-break:break-all;">{file()!.name}</div>
                    <div style="font-family:var(--font-mono); font-size:10px; color:var(--text3);">{(file()!.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                ) : (
                  <div>
                    <div style="font-size:28px; margin-bottom:8px; opacity:0.6;">⬆</div>
                    <div style="font-weight:700; font-size:13px; margin-bottom:4px;">Drop GLB file here</div>
                    <div style="font-family:var(--font-mono); font-size:10px; color:var(--text3);">or click to browse</div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div>
                  <label style="display:block; font-family:var(--font-mono); font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">Display Name</label>
                  <input
                    class="ar-input"
                    type="text"
                    value={displayName()}
                    onInput={(e) => setDisplayName(e.target.value)}
                    placeholder="My 3D Model"
                    required
                  />
                </div>

                <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:12px 14px; background:var(--surface); border:1px solid var(--border); border-radius:8px;">
                  <div class="toggle">
                    <input type="checkbox" checked={online()} onChange={(e) => setOnline(e.target.checked)} />
                    <div class="toggle-slider" />
                  </div>
                  <div>
                    <div style="font-size:13px; font-weight:600;">Publish Online</div>
                    <div style="font-family:var(--font-mono); font-size:10px; color:var(--text3); margin-top:1px;">Make QR code active immediately</div>
                  </div>
                </label>

                <button class="btn-primary" type="submit" disabled={uploading() || !file()} style="width:100%; padding:13px;">
                  {uploading() ? "Uploading..." : "Upload & Generate QR →"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Divider */}
        <div style="border-top:1px solid var(--border); margin-bottom:40px;" />

        {/* Models list */}
        <Suspense fallback={<div style="color:var(--text3); font-family:var(--font-mono); font-size:12px;">Loading models...</div>}>
          <ShowModels
            token={token}
            onRefetchReady={(fn) => setRefetchModels(() => fn)}
          />
        </Suspense>
      </div>
    </div>
  );
}

export default Upload;