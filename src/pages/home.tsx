// src/pages/home.tsx
import { useNavigate } from "@solidjs/router";
import { getCookie } from "../utils/cookies";

function Home() {
  const navigate = useNavigate();

  const token = getCookie("token");
  if (token) navigate("/upload", { replace: true });

  return (
    <div class="grid-bg" style="min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 24px; position:relative; overflow:hidden;">
      {/* Ambient glow */}
      <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:600px; height:600px; background:radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%); pointer-events:none;" />

      <div class="fade-in-up" style="text-align:center; max-width:560px; z-index:1;">
        {/* Logo mark */}
        <div style="display:inline-flex; align-items:center; gap:10px; margin-bottom:40px;">
          <div style="width:40px; height:40px; border:2px solid var(--accent); border-radius:8px; display:flex; align-items:center; justify-content:center; position:relative;">
            <div style="width:16px; height:16px; background:var(--accent); border-radius:3px;" />
            <div style="position:absolute; inset:-6px; border:1px solid rgba(0,212,255,0.2); border-radius:12px;" />
          </div>
          <span style="font-family:var(--font-mono); font-size:13px; color:var(--accent); letter-spacing:0.15em; text-transform:uppercase;">AR Code</span>
        </div>

        <h1 style="font-size:clamp(36px,6vw,64px); font-weight:800; line-height:1.05; letter-spacing:-0.02em; margin:0 0 16px; color:var(--text);">
          Share 3D Models<br />
          <span style="color:var(--accent);">in Augmented Reality</span>
        </h1>

        <p style="color:var(--text2); font-size:16px; line-height:1.6; margin:0 0 48px; font-weight:400;">
          Upload a GLB model, generate a QR code, scan it with your phone —
          and watch your model come alive in the real world.
        </p>

        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <button class="btn-primary" style="padding:14px 32px; font-size:15px;" onClick={() => navigate("/guest")}>
            Try Without Account
          </button>
          <button class="btn-ghost" style="padding:14px 32px; font-size:15px;" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>

        <p style="margin-top:20px; font-family:var(--font-mono); font-size:11px; color:var(--text3);">
          No account needed for guest uploads · GLB format supported
        </p>
      </div>

      {/* Feature pills */}
      <div style="position:absolute; bottom:40px; display:flex; gap:20px; flex-wrap:wrap; justify-content:center; z-index:1;">
        {["GLB Upload", "QR Generation", "AR Preview", "Model Dashboard"].map((f) => (
          <span style="font-family:var(--font-mono); font-size:11px; color:var(--text3); border:1px solid var(--border); padding:6px 14px; border-radius:20px; letter-spacing:0.08em; text-transform:uppercase;">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Home;