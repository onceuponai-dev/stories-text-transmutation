import init, { Model } from "./build/m.js";


function getModelData(modelID: string) {
  let base_url = `https://huggingface.co/${modelID}/resolve/main`;
  let weightsURL = `${base_url}/model.safetensor`;
  let tokenizerURL = `${base_url}/tokenizer.json`;
  let configURL = `${base_url}/config.json`;

  return {
    modelID,
    weightsURL,
    tokenizerURL,
    configURL
  };
}

async function fetchArrayBuffer(url: string): Promise<Uint8Array> {
  const cacheName = "model-candle-cache";
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(url);
  if (cachedResponse) {
    const data = await cachedResponse.arrayBuffer();
    return new Uint8Array(data);
  }
  const res = await fetch(url, { cache: "force-cache" });
  cache.put(url, res.clone());
  return new Uint8Array(await res.arrayBuffer());
}

class ModelBuilder {
  static instance: { [key: string]: Model } = {};

  static async getInstance(modelID: string): Promise<Model> {
    if (!this.instance[modelID]) {
      await init();
      let modelData = getModelData(modelID);
      console.log("Loading Model");
      //self.postMessage({ status: "loading", message: "Loading Model" });
      const [weightsArrayU8, tokenizerArrayU8, mel_filtersArrayU8] =
        await Promise.all([
          fetchArrayBuffer(modelData.weightsURL),
          fetchArrayBuffer(modelData.tokenizerURL),
          fetchArrayBuffer(modelData.configURL),
        ]);

      this.instance[modelID] = new Model(
        weightsArrayU8,
        tokenizerArrayU8,
        mel_filtersArrayU8
      );

      console.log("Model loaded");
    } else {
      console.log("Model Already Loaded");
      //self.postMessage({ status: "ready", message: "Model Already Loaded" });
    }
    return this.instance[modelID];
  }
}

self.addEventListener("message", async (event: MessageEvent) => {
  const {
    id,
    modelID,
    sentences,
    normalize = true,
  } = event.data;
  try {
    console.log("Starting Model");
    //self.postMessage({ status: "ready", message: "Starting Model" });
    const model = await ModelBuilder.getInstance(modelID);
    console.log("Calculating Embeddings");
    //self.postMessage({status: "embedding",message: "Calculating Embeddings",});
    const output = model.forward({
      sentences: sentences,
      normalize_embeddings: normalize,
    });

    self.postMessage({ results: output.data, id });
  } catch (e: any) {
    self.postMessage({ error: e.message, id });
  }
});