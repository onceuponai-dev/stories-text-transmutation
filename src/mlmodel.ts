

const modelWorker = new Worker(
    new URL('@/modelWorker.ts', import.meta.url),
    { type: 'module' }
);

const callbacks: any = {};

modelWorker.onmessage = (event) => {
  const { id, ...data } = event.data;
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
};

export const forward = (() => {
  let id = 0;
  return (sentences: Array<string>) => {
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise((onSuccess) => {
      callbacks[id] = onSuccess;

      //const modelID = "jinaai/jina-embeddings-v2-small-en";
      const modelID ="intfloat/e5-small-v2"
      modelWorker.postMessage({
        modelID,
        sentences,
        id,
      });
    });
  };
})();


