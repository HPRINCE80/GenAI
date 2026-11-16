import { PDFParse } from "pdf-parse";
import "dotenv/config";
import fs from "fs/promises";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";

// ...PDF parsing and chunking...
const parser = new PDFParse({
  data: await fs.readFile("./story.pdf"),
});

const { text } = await parser.getText({ pageJoiner: "" });
await parser.destroy();

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});

const chunks = await textSplitter.splitText(text);

const embeddings = new CohereEmbeddings({
  model: "embed-english-v3.0",
  apiKey: process.env.COHERE_API_KEY,
});

const vectors = await embeddings.embedDocuments(chunks);
console.log("Vector dimension:", vectors[0]?.length); // 1024 hona chahiye

if (vectors.some((vector) => vector.length !== 1024)) {
  throw new Error("Embedding dimension index ke 1024 dimensions se match nahi karti.");
}



const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// ...Pinecone client and index...
const index = pc.Index({
    name: "first-rag",
    host: "https://first-rag-3roy8zg.svc.aped-4627-b74a.pinecone.io"
});
await index.documents.upsert({
  documents: vectors.map((vector, i) => ({
    _id: `chunk-${i}`,
    embedding: vector,
    content: chunks[i],
  })),
});