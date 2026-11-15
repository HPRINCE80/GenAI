import {ChatCohere, CohereEmbeddings} from "@langchain/cohere"
import "dotenv/config"
import {Pincone} from "@pincone-database/pinecone"
import {HumanMessage, ToolMessage, AIMessage} from "langchain"


const userInput = "How was the Arav's first job experience ?"


const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model:'embed-v5.0-fast',
})


const vector = await embeddings.embedQuery(userInput)


const pc = new Pincone({apiKey : process.env.PINECONE_API_KEY});
const index = pc.Index({
    name: "cohort-rag",
    host: "https://cohort-rag-xg6uzh1.svc.aped-4627-b74a.pinecone.io"
});

const results = await index.documents.search({
    topK: 3,
    scoreBy:[
        {
            type: 'dense_vector',
            fields: ['embedding'],
            values: vector,
        }
    ],
    includeFields: ['content']
})



const model = new ChatCohere({
    model: "command-a-03-2025",
    apiKey: process.env.COHERE_API_KEY
})

const message = [];


message.push(new HumanMessage(userInput))


message.push(new ToolMessage({
    content:JSON.stringify(results)
}))


const aiResponse = await model.stream(message)


for await (const chunk of aiResponse) {
    process.stdout.write(chunk.text)
}