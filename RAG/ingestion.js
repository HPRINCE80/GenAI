import {PDFParse} from "pdf-parse"
import {parse} from "path"
import "dotenv/config"
import fs from "fs/promises"
import {Pinecone} from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere"


const parser = new PDFParse({
    data: await fs.readFile("./story.pdf")
})

const text = (await parser.getText({ pageJoiner: "" })).text;

const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize:500,
    chunkOverlap:100,
});

const chunks = await textSplitter.splitText(text);


const embeddings = new CohereEmbeddings({
    model : "embed-v5.0-fast",
    apiKey: process.env.COHERE_API_KEY
})

const vectors = await embeddings.embedDocuments(chunks)


const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY});

const index = pc.Index({
    name:"cohort-rag",
    host:"https://cohort-rag-xg6uzh1.svc.aped-4627-b74a.pinecone.io"
});

await index.documents.upsert({
    documents: vectors.map((vector, index) => {
        return {
            _id: `chunk-${index}`,
            embeddings: vector,
            content: chunks[index]
        }
    })
})