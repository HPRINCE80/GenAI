import { ChatCohere, CohereEmbeddings } from "@langchain/cohere";
import { Pinecone } from "@pinecone-database/pinecone";
import { HumanMessage } from "@langchain/core/messages";
import "dotenv/config";

const userInput = "can you share prince projects ?";

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  model: "embed-english-v3.0",
});

const vector = await embeddings.embedQuery(userInput);
// console.log("Query vector dimension:", vector.length); // should be 1024

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index({
  host: "first-rag-3roy8zg.svc.aped-4627-b74a.pinecone.io",
});

const results = await index.documents.search({
  topK: 3,
  scoreBy: [{
    type: "dense_vector",
    field: "embedding",
    values: vector,
  }],
  includeFields: ["content"],
});

const context = results.matches
  .map((match) => match.content)
  .filter(Boolean)
  .join("\n\n");

const model = new ChatCohere({
  model: "command-a-03-2025",
  apiKey: process.env.COHERE_API_KEY,
});

const response = await model.invoke([
  new HumanMessage(
    `Answer the question using the context below. If the context doesn't contain the answer, say so.\n\nContext:\n${context}\n\nQuestion: ${userInput}`
  ),
]);

console.log(response.content);