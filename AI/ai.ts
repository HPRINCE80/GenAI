import { ChatGroq } from "@langchain/groq";
import { config } from "dotenv";
import rl from "readline/promises";
config();
import tool from "langchain"

const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API_KEY,
});

const readline = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const events = []

const createEventTool = tool(
    async function ({  date, title, description}) {
        events.push({
            date,
            title,
            description
        })
        return "Event Created"
    },{
        name:"createEvent",
        description: "create a new event with a date , title & description"
    }
)

type Msg = { role: "user" | "assistant" | "system"; content: string };
const messages: Msg[] = [];

async function main() {
  while (true) {
    const userInput = await readline.question("You: ");

    if (userInput.trim().toLowerCase() === "exit") {
      readline.close();
      break;
    }

    messages.push({ role: "user", content: userInput });

    const stream = await model.stream(messages);

    let aiMessage = "";
    process.stdout.write("AI: ");
    for await (const chunk of stream) {
      const text = typeof chunk.content === "string" ? chunk.content : "";
      aiMessage += text;
      process.stdout.write(text);
    }

    messages.push({ role: "assistant", content: aiMessage });
    process.stdout.write("\n\n");
  }
}

main();