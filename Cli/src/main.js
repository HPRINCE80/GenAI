import { saveAPIkey, getApikey } from "./utlis/file.utils.js";
import rl from "./utlis/readline.js"

async function main() {
    try {
        let apiKey = await getApikey();
        if (!apiKey) {
            if (!process.stdin.isTTY) {
                throw new Error("No API key is configured. Run `beta` in an interactive terminal to add one.");
            }

            apiKey = (await rl.question("Please enter your API key: ")).trim();
            if (!apiKey) {
                throw new Error("API key cannot be empty.");
            }

            await saveAPIkey(apiKey);
        }

        console.log("API key:", apiKey);
    } finally {
        rl.close();
    }
}

export default main;