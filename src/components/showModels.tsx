import { createResource, For, Suspense, onMount } from "solid-js";
import { API_BASE_URL } from "../../config";

type ShowModelsProps = { 
    token: string;
    onRefetchReady?: (refetchFn: ()=> void) => void;
};
type Model = {
  id: string;
  display_name: string;
  qr_code: URL;
  query: string;
  uploaded_at: string;
  online: boolean;
};

function ShowModels(props: ShowModelsProps) {
  const fetchModels = async (token: string): Promise<Model[]> => {
    const response = await fetch(`${API_BASE_URL}/model`, {
      method: "GET",
      headers: { Authorization: `${token}` },
    });

    if (!response.ok) {
      console.error("Failed to fetch models");
      throw new Error("Failed to fetch models");
    }

    return await response.json();
  };

  const [modelsResource, { refetch }] = createResource(() => props.token, fetchModels);
  onMount(() => {
    if (props.onRefetchReady) props.onRefetchReady(refetch);
  });
  const handleOnlineToggle = async (modelQuery: string, checked: boolean, displayName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/model/${modelQuery}`, {
        method: "PATCH", // use PATCH since backend uses UpdateModel
        headers: {
          Authorization: `${props.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          online: checked,
          refresh_qr_code: false,
          display_name: displayName,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update model online status");
        throw new Error("Failed to update model online status");
      }

      refetch();
    } catch (error) {
      console.error("Error updating model online status:", error);
    }
  };

  const handleDelete = async (modelQuery: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/model/${modelQuery}`, {
        method: "DELETE",
        headers: { Authorization: `${props.token}` },
      });

      if (!response.ok) {
        console.error("Failed to delete model");
        throw new Error("Failed to delete model");
      }

      refetch();
    } catch (error) {
      console.error("Error deleting model:", error);
    }
  };

  return (
    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-4 text-white">Available Models</h2>

      <Suspense fallback={<div class="text-gray-400">Loading...</div>}>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          <For each={modelsResource()} fallback={<div>No models found.</div>}>
            {(model) => (
              <div class="flex flex-col bg-gray-800 p-4 rounded-xl shadow-md hover:scale-[1.02] transition-transform">
                <img
                  src={`${API_BASE_URL}${model.qr_code.toString()}`}
                  alt={model.display_name}
                  class="w-full aspect-square object-cover rounded-md mb-3"
                />

                <div class="flex flex-col gap-1 text-center">
                  <p class="font-semibold text-white truncate">{model.display_name}</p>
                  <p class="text-xs text-gray-400 truncate">{model.query}</p>
                </div>

                <div class="flex items-center justify-between mt-3">
                  <label class="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      class="accent-green-500"
                      checked={model.online}
                      onChange={(e) =>
                        handleOnlineToggle(
                          model.query,
                          (e.target as HTMLInputElement).checked,
                          model.display_name
                        )
                      }
                    />
                    <span class="text-gray-300">Online</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDelete(model.query)}
                    class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>

        {modelsResource.error && (
          <div class="text-red-400 mt-4">
            Error fetching models: {modelsResource.error.message}
          </div>
        )}
      </Suspense>
    </div>
  );
}

export default ShowModels;
