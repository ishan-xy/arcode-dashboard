// src/pages/guest.tsx
// Guest flow: upload GLB → get QR code without authentication.
// Requires backend: POST /guest/model (no auth, returns { qr_code, query })

import { createSignal } from "solid-js";
import { API_BASE_URL } from "../../config";

type GuestResult = {
  qr_code: string;
  query: string;
  ar_url: string;
};

function Guest() {
  const [file, setFile] = createSignal<File | null>(null);
  const [displayName, setDisplayName] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [result, setResult] = createSignal<GuestResult | null>(null);
  const [dragOver, setDragOver] = createSignal(false);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".glb")) {
      setError("Only .glb files are supported.");
      return;
    }
    setError("");
    setFile(f);
    if (!displayName()) setDisplayName(f.name.replace(".glb", ""));
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!file()) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("model", file()!);
    formData.set("displayName", displayName());
    formData.set("online", "true");

    try {
      // POST /guest/model — no Authorization header
      const response = await fetch(`${API_BASE_URL}/guest/model`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setResult({
        qr_code: `${API_BASE_URL}${data.qr_code}`,
        query: data.query,
        ar_url: `${API_BASE_URL}/model/files/${data.query}`,
      });
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const r = result();
    if (!r) return;
    const a = document.createElement("a");
    a.href = r.qr_code;
    a.download = `${result()!.query}-qr.png`;
    a.click();
  };

  const reset = () => {
    setResult(null);
    setFile(null);
    setDisplayName("");
    setError("");
  };

  return (
    <div class="grid-bg" style="min-height:100vh; padding:40px 24px;">
      <div style="max-width:560px; margin:0 auto;" class="fade-in-up">
        {/* Nav */}
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:48px;">
          <a href="/" style="display:flex; align-items:center; gap:8px; text-decoration:none;">
            <div style="width:28px; height:28px; border:2px solid var(--accent); border-radius:6px; display:flex; align-items:center; justify-content:center;">
              <div style="width:10px; height:10px; background:var(--accent); border-radius:2px;" />
            </div>
            <span style="font-family:var(--font-mono); font-size:11px; color:var(--accent); letter-spacing:0.15em; text-transform:uppercase;">AR Code</span>
          </a>
          <a href="/login" style="color:var(--text3); font-family:var(--font-mono); font-size:11px; text-decoration:none; text-transform:uppercase; letter-spacing:0.08em; border:1px solid var(--border); padding:7px 14px; border-radius:6px;">
            Sign In →
          </a>
        </div>

        {result() ? (
          /* ── Result Screen ── */
          <div class="ar-card fade-in-up" style="padding:36px; text-align:center;">
            <div style="font-family:var(--font-mono); font-size:11px; color:var(--green); text-transform:uppercase; letter-spacing:0.15em; margin-bottom:16px;">
              ✓ Model uploaded successfully
            </div>
            <h2 style="font-size:22px; font-weight:800; margin:0 0 8px; letter-spacing:-0.02em;">Your AR QR Code</h2>
            <p style="color:var(--text2); font-size:13px; margin:0 0 28px; line-height:1.5;">
              Scan this with your phone to view the 3D model in augmented reality.
            </p>

            {/* QR Code */}
            <div style="display:inline-block; background:white; padding:16px; border-radius:12px; margin-bottom:28px;">
              <img src={result()!.qr_code} alt="QR Code" style="width:200px; height:200px; display:block;" />
            </div>

            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:28px;">
              <button class="btn-primary" style="width:100%;" onClick={downloadQR}>
                Download QR Code
              </button>
              <a
                href={result()!.ar_url}
                target="_blank"
                style="display:block; text-align:center; padding:11px; border:1px solid var(--border); border-radius:8px; color:var(--text2); font-size:13px; font-family:var(--font-mono); text-decoration:none; transition:border-color 0.2s;"
              >
                Preview AR Link ↗
              </a>
            </div>

            <div style="padding:14px; background:var(--surface2); border-radius:8px; font-family:var(--font-mono); font-size:11px; color:var(--text3); text-align:left; margin-bottom:24px; line-height:1.6;">
              <span style="color:var(--text2);">Note:</span> Guest uploads may expire. To save your models permanently and manage them, create a free account.
            </div>

            <div style="display:flex; gap:10px;">
              <button class="btn-ghost" style="flex:1;" onClick={reset}>Upload Another</button>
              <a href="/signup" style="flex:1; display:flex; align-items:center; justify-content:center; background:var(--accent); color:var(--bg); border-radius:8px; font-weight:700; font-size:13px; text-decoration:none; text-transform:uppercase; letter-spacing:0.05em;">
                Create Account
              </a>
            </div>
          </div>
        ) : (
          /* ── Upload Form ── */
          <>
            <div style="margin-bottom:36px;">
              <div style="display:inline-block; background:var(--accent-glow); border:1px solid rgba(0,212,255,0.2); border-radius:20px; padding:5px 14px; font-family:var(--font-mono); font-size:11px; color:var(--accent); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:16px;">
                Guest Upload — No Account Needed
              </div>
              <h1 style="font-size:32px; font-weight:800; margin:0 0 12px; letter-spacing:-0.02em;">
                Upload a 3D Model
              </h1>
              <p style="color:var(--text2); font-size:14px; line-height:1.6; margin:0;">
                Upload your GLB file and instantly get a QR code to view it in AR on any mobile device.
              </p>
            </div>

            <form onSubmit={handleSubmit} style="display:flex; flex-direction:column; gap:20px;">
              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={`border:2px dashed ${dragOver() ? "var(--accent)" : file() ? "var(--green)" : "var(--border2)"}; border-radius:12px; padding:36px 24px; text-align:center; cursor:pointer; transition:all 0.2s; background:${file() ? "var(--green-glow)" : dragOver() ? "var(--accent-glow)" : "var(--surface)"};`}
                onClick={() => (document.getElementById("glb-input") as HTMLInputElement)?.click()}
              >
                <input
                  id="glb-input"
                  type="file"
                  accept=".glb"
                  style="display:none"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                {file() ? (
                  <div>
                    <div style="font-size:28px; margin-bottom:8px;">📦</div>
                    <div style="font-weight:700; color:var(--green); font-size:14px; margin-bottom:4px;">{file()!.name}</div>
                    <div style="font-family:var(--font-mono); font-size:11px; color:var(--text3);">
                      {(file()!.size / 1024 / 1024).toFixed(2)} MB · GLB
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style="font-size:32px; margin-bottom:12px;">⬆</div>
                    <div style="font-weight:700; margin-bottom:6px;">Drop your GLB file here</div>
                    <div style="font-family:var(--font-mono); font-size:11px; color:var(--text3);">or click to browse · .glb files only</div>
                  </div>
                )}
              </div>

              {/* Display Name */}
              <div>
                <label style="display:block; font-family:var(--font-mono); font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">Display Name</label>
                <input
                  class="ar-input"
                  type="text"
                  value={displayName()}
                  onInput={(e) => setDisplayName(e.target.value)}
                  placeholder="My Awesome Model"
                  required
                />
              </div>

              {error() && (
                <div style="background:rgba(255,68,102,0.08); border:1px solid rgba(255,68,102,0.25); border-radius:6px; padding:10px 14px; font-family:var(--font-mono); font-size:12px; color:var(--red);">
                  {error()}
                </div>
              )}

              <button class="btn-primary" type="submit" disabled={loading() || !file()} style="width:100%; padding:14px;">
                {loading() ? "Uploading & Generating QR..." : "Upload & Generate QR →"}
              </button>
            </form>

            <p style="text-align:center; margin-top:20px; font-family:var(--font-mono); font-size:11px; color:var(--text3);">
              Want to save and manage your models?{" "}
              <a href="/signup" style="color:var(--accent); text-decoration:none;">Create a free account</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Guest;