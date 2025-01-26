import { voyageApiKey } from "./config";

interface VoyageResponse {
  ids: string[];
  values: number[][];
}

const voyageUrl = "https://api.voyageai.com/v1/embeddings";

async function getEmbeddings(texts: string[], apiKey: string) {
  const response = await fetch(voyageUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "voyage-01",
      input: texts,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data: VoyageResponse = await response.json();
  return data;
}

const r = await getEmbeddings(["Hello, world!", "airplane"], voyageApiKey);

console.log(r);

(r as any).data.map((x: any) => {
  console.log(x.embedding.length);
});
