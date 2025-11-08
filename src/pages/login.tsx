import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { API_BASE_URL } from "../../config";

function Login() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const navigate = useNavigate();

  onMount(() => {
    // Check if user is already logged in
    const token = getCookie("token");
    if (token) {
      navigate("/upload", { replace: true });
    }
  });

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const setCookie = (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email(),
          password: password(),
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      
      // Save token as cookie
      setCookie("token", data.token);
      
      // Navigate to upload page
      navigate("/upload", { replace: true });
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style="max-width: 400px; margin: 100px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">Email:</label>
          <input
            type="email"
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
            required
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
          />
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">Password:</label>
          <input
            type="password"
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
            required
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
          />
        </div>
        {error() && (
          <div style="color: red; margin-bottom: 15px; font-size: 14px;">
            {error()}
          </div>
        )}
        <button
          type="submit"
          disabled={loading()}
          style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          {loading() ? "Logging in..." : "Login"}
        </button>
        <div style="text-align: center; margin-top: 15px;">
          <a href="/signup" style="color: #007bff; text-decoration: none;">
            Don't have an account? Sign up
          </a>
        </div>
      </form>
    </div>
  );
}

export default Login;