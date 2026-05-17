// src/pages/upload.tsx
import { onMount, Suspense, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { getCookie, deleteCookie } from "../utils/cookies";
import { API_BASE_URL } from "../../config";
import ShowModels from "../components/showModels";

function Upload() {
  const [refetchModels, setRefetchModels] = createSignal<() => void>();
  const [glbFile, setGlbFile] = createSignal<File | null>(null);
  const [usdzFile, setUsdzFile] = createSignal<File | null>(null);
  const [displayName, setDisplayName] = createSignal("");
  const [online, setOnline] = createSignal(true);
  const [uploading, setUploading] = createSignal(false);
  const [glbDragOver, setGlbDragOver] = createSignal(false);
  const [usdzDragOver, setUsdzDragOver] = createSignal(false);
  const navigate = useNavigate();

  const token = getCookie("token");

  onMount(() => {
    if (!token) navigate("/login", { replace: true });
  });

  const logout = () => {
    deleteCookie("token");
    navigate("/login", { replace: true });
  };

  const handleGlbFile = (f: File) => {
    if (!f.name.endsWith(".glb")) {
      alert("Only .glb files are supported for the 3D model.");
      return;
    }
    setGlbFile(f);
    if (!displayName()) setDisplayName(f.name.replace(".glb", ""));
  };

  const handleUsdzFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".usdz")) {
      alert("Only .usdz files are supported for the iPhone model.");
      return;
    }
    setUsdzFile(f);
  };

  const handleUpload = async (e: Event) => {
    e.preventDefault();
    if (!glbFile()) return;
    setUploading(true);

    const formData = new FormData();
    formData.set("model", glbFile()!);
    if (usdzFile()) formData.set("usdz", usdzFile()!);
    formData.set("displayName", displayName());
    formData.set("online", online() ? "true" : "false");

    try {
      const response = await fetch(`${API_BASE_URL}/model`, {
        method: "POST",
        headers: { Authorization: `${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      setGlbFile(null);
      setUsdzFile(null);
      setDisplayName("");
      setOnline(true);
      (document.getElementById("glb-input-auth") as HTMLInputElement).value = "";
      (document.getElementById("usdz-input-auth") as HTMLInputElement).value = "";
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
          <h1 style="font-size:22px; font-weight:800; margin:0 0 6px; letter-spacing:-0.02em;">Upload Model</h1>
          <p style="color:var(--text3); font-family:var(--font-mono); font-size:11px; margin:0 0 24px;">
            GLB is required for Android &amp; desktop · USDZ is required for iPhone / iPad AR
          </p>

          <form onSubmit={handleUpload}>
            {/* ── File inputs row ── */}
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">

              {/* GLB drop zone */}
              <div>
                <div style="font-family:var(--font-mono); font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                  <span style="color:var(--red);">*</span> GLB File
                  <span style="background:var(--surface2); border:1px solid var(--border); border-radius:4px; padding:1px 6px; font-size:9px; color:var(--text3);">Android · Desktop · Web</span>
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setGlbDragOver(true); }}
                  onDragLeave={() => setGlbDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setGlbDragOver(false); const f = e.dataTransfer?.files[0]; if (f) handleGlbFile(f); }}
                  style={`border:2px dashed ${glbDragOver() ? "var(--accent)" : glbFile() ? "var(--green)" : "var(--border2)"}; border-radius:12px; padding:24px 16px; text-align:center; cursor:pointer; transition:all 0.2s; background:${glbFile() ? "var(--green-glow)" : glbDragOver() ? "var(--accent-glow)" : "var(--surface)"};`}
                  onClick={() => (document.getElementById("glb-input-auth") as HTMLInputElement)?.click()}
                >
                  <input id="glb-input-auth" type="file" accept=".glb" style="display:none" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGlbFile(f); }} />
                  {glbFile() ? (
                    <div>
                      <div style="font-size:22px; margin-bottom:4px;">📦</div>
                      <div style="font-weight:700; color:var(--green); font-size:12px; margin-bottom:2px; word-break:break-all;">{glbFile()!.name}</div>
                      <div style="font-family:var(--font-mono); font-size:10px; color:var(--text3);">{(glbFile()!.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  ) : (
                    <div>
                      <div style="font-size:24px; margin-bottom:6px; opacity:0.5;">⬆</div>
                      <div style="font-weight:700; font-size:12px; margin-bottom:3px;">Drop .glb here</div>
                      <div style="font-family:var(--font-mono); font-size:10px; color:var(--text3);">or click to browse</div>
                    </div>
                  )}
                </div>
              </div>

              {/* USDZ drop zone */}
              <div>
                <div style="font-family:var(--font-mono); font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                  USDZ File
                  <span style="background:var(--surface2); border:1px solid var(--border); border-radius:4px; padding:1px 6px; font-size:9px; color:var(--text3);">iPhone · iPad</span>
                  <span style="font-size:9px; color:var(--text3); opacity:0.7;">optional</span>
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setUsdzDragOver(true); }}
                  onDragLeave={() => setUsdzDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setUsdzDragOver(false); const f = e.dataTransfer?.files[0]; if (f) handleUsdzFile(f); }}
                  style={`border:2px dashed ${usdzDragOver() ? "var(--accent)" : usdzFile() ? "var(--green)" : "var(--border2)"}; border-radius:12px; padding:24px 16px; text-align:center; cursor:pointer; transition:all 0.2s; background:${usdzFile() ? "var(--green-glow)" : usdzDragOver() ? "var(--accent-glow)" : "var(--surface)"};`}
                  onClick={() => (document.getElementById("usdz-input-auth") as HTMLInputElement)?.click()}
                >
                  <input id="usdz-input-auth" type="file" accept=".usdz" style="display:none" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUsdzFile(f); }} />
                  {usdzFile() ? (
                    <div>
                      <div style="font-size:22px; margin-bottom:4px;">📱</div>
                      <div style="font-weight:700; color:var(--green); font-size:12px; margin-bottom:2px; word-break:break-all;">{usdzFile()!.name}</div>
                      <div style="font-family:var(--font-mono); font-size:10px; color:var(--text3);">{(usdzFile()!.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  ) : (
                    <div>
                      <div style="font-size:24px; margin-bottom:6px; opacity:0.5;">📱</div>
                      <div style="font-weight:700; font-size:12px; margin-bottom:3px;">Drop .usdz here</div>
                      <div style="font-family:var(--font-mono); font-size:10px; color:var(--text3);">or click to browse</div>
                    </div>
                  )}
                </div>

                {/* iPhone warning — shown only when no USDZ */}
                {!usdzFile() && (
                  <div style="margin-top:8px; padding:9px 12px; background:rgba(255,170,0,0.07); border:1px solid rgba(255,170,0,0.2); border-radius:8px; display:flex; gap:8px; align-items:flex-start;">
                    <span style="font-size:13px; flex-shrink:0;">⚠️</span>
                    <span style="font-family:var(--font-mono); font-size:10px; color:#ffaa00; line-height:1.5;">
                      Without a USDZ file, AR will <strong>not work on iPhone / iPad</strong>. Apple devices require USDZ for Quick Look AR.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Settings row */}
            <div style="display:grid; grid-template-columns:1fr auto auto; gap:14px; align-items:end;">
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

              <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:10px 14px; background:var(--surface); border:1px solid var(--border); border-radius:8px; white-space:nowrap; height:42px;">
                <div class="toggle">
                  <input type="checkbox" checked={online()} onChange={(e) => setOnline(e.target.checked)} />
                  <div class="toggle-slider" />
                </div>
                <div>
                  <div style="font-size:12px; font-weight:600;">Publish</div>
                  <div style="font-family:var(--font-mono); font-size:9px; color:var(--text3);">Active QR</div>
                </div>
              </label>

              <button class="btn-primary" type="submit" disabled={uploading() || !glbFile()} style="padding:0 24px; height:42px; white-space:nowrap;">
                {uploading() ? "Uploading..." : "Upload & Generate QR →"}
              </button>
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