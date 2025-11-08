import { onMount, Suspense, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { API_BASE_URL } from "../../config";
import ShowModels from "../components/showModels";

function Upload() {
  const [refetchModels, setRefetchModels] = createSignal<() => void>();
  const navigate = useNavigate();

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const token = getCookie("token");

  onMount(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  });

  const logout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/login", { replace: true });
  };
  async function handleUpload(event: Event) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    formData.set("online", formData.get("online") === "on" ? "true" : "false");

    try {
      const response = await fetch(`${API_BASE_URL}/model`, {
        method: "POST",
        headers: { Authorization: `${token}` },
        body: formData,
      });

      if (!response.ok) {
        alert("Upload failed");
        console.error("Upload failed", await response.text());
        return;
      }

      alert("Upload successful");
      refetchModels()?.();
      form.reset();
    } catch (err) {
      console.error("Error during upload", err);
      alert("An error occurred during upload");
    }
  }

  return (
    <div class="max-w-5xl mx-auto mt-20 p-6 bg-gray-900 text-white rounded-2xl shadow-lg">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold tracking-wide">Upload Model</h2>
        <button
          onClick={logout}
          class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition"
        >
          Logout
        </button>
      </div>

      <p class="text-gray-300 mb-6">
        You are successfully logged in and can upload models below.
      </p>

      <form
        id="upload-form"
        onSubmit={handleUpload}
        class="bg-gray-800 p-5 rounded-xl flex flex-col gap-4"
      >
        <div>
          <label class="block text-sm font-semibold mb-1">Model File</label>
          <input
            type="file"
            name="model"
            required
            class="block w-full text-gray-300 border border-gray-600 rounded-md bg-gray-700 file:bg-gray-600 file:border-0 file:px-3 file:py-2 file:rounded-md hover:file:bg-gray-500"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Display Name</label>
          <input
            type="text"
            name="displayName"
            placeholder="Enter model name"
            required
            class="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-green-500"
          />
        </div>

        <label class="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="online"
            id="online"
            class="accent-green-500"
          />
          <span>Publish Online</span>
        </label>

        <button
          type="submit"
          class="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md font-medium text-white transition"
        >
          Upload File
        </button>
      </form>

      <div class="mt-10">
        <Suspense fallback={<div>Loading models...</div>}>
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
