// src/pages/signup.tsx
import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { getCookie, setCookie } from "../utils/cookies";
import { API_BASE_URL } from "../../config";

function Signup() {
  const [name, setName] = createSignal("");
  const [username, setUsername] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const navigate = useNavigate();

  onMount(() => {
    if (getCookie("token")) navigate("/upload", { replace: true });
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name(),
          username: username(),
          email: email(),
          password: password(),
        }),
      });
      if (!response.ok) throw new Error("Signup failed");
      const data = await response.json();
      setCookie("token", data.token);
      navigate("/upload", { replace: true });
    } catch {
      setError("Signup failed. Username or email may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="grid-bg" style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;">
      <div class="fade-in-up" style="width:100%; max-width:420px;">
        {/* Header */}
        <div style="text-align:center; margin-bottom:40px;">
          <a href="/" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; margin-bottom:32px;">
            <div style="width:32px; height:32px; border:2px solid var(--accent); border-radius:6px; display:flex; align-items:center; justify-content:center;">
              <div style="width:12px; height:12px; background:var(--accent); border-radius:2px;" />
            </div>
            <span style="font-family:var(--font-mono); font-size:12px; color:var(--accent); letter-spacing:0.15em; text-transform:uppercase;">AR Code</span>
          </a>
          <h1 style="font-size:28px; font-weight:800; margin:0 0 8px; letter-spacing:-0.02em;">Create account</h1>
          <p style="color:var(--text2); font-size:14px; margin:0;">Start uploading and managing AR models</p>
        </div>

        {/* Card */}
        <div class="ar-card" style="padding:32px;">
          <form onSubmit={handleSubmit} style="display:flex; flex-direction:column; gap:18px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
              <div>
                <label style="display:block; font-family:var(--font-mono); font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">Full Name</label>
                <input class="ar-input" type="text" value={name()} onInput={(e) => setName(e.target.value)} placeholder="John Doe" required />
              </div>
              <div>
                <label style="display:block; font-family:var(--font-mono); font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">Username</label>
                <input class="ar-input" type="text" value={username()} onInput={(e) => setUsername(e.target.value)} placeholder="johndoe" required />
              </div>
            </div>
            <div>
              <label style="display:block; font-family:var(--font-mono); font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">Email</label>
              <input class="ar-input" type="email" value={email()} onInput={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label style="display:block; font-family:var(--font-mono); font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">Password</label>
              <input class="ar-input" type="password" value={password()} onInput={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            {error() && (
              <div style="background:rgba(255,68,102,0.08); border:1px solid rgba(255,68,102,0.25); border-radius:6px; padding:10px 14px; font-family:var(--font-mono); font-size:12px; color:var(--red);">
                {error()}
              </div>
            )}

            <button class="btn-green" type="submit" disabled={loading()} style="width:100%; margin-top:4px;">
              {loading() ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <div style="text-align:center; margin-top:24px; padding-top:24px; border-top:1px solid var(--border);">
            <span style="color:var(--text3); font-size:13px;">Already have an account? </span>
            <a href="/login" style="color:var(--accent); font-size:13px; text-decoration:none; font-weight:600;">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;