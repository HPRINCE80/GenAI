import fs from "node:fs/promises";
import { CONFIG_DIR } from "./constant.js";
import path from "node:path";

export async function getsettingfilepath() {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    const settingfilepath = path.join(CONFIG_DIR, "settings.json");

    let content;
    try {
        content = await fs.readFile(settingfilepath, "utf-8");
    } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") {
            try {
                await fs.writeFile(settingfilepath, "{}\n", { flag: "wx" });
            } catch (writeError) {
                if (writeError instanceof Error && "code" in writeError && writeError.code === "EEXIST") {
                    return getsettingfilepath();
                }

                throw writeError;
            }

            return {};
        }

        throw error;
    }

    let settings;
    try {
        settings = JSON.parse(content);
    } catch (error) {
        throw new Error(`Settings file contains invalid JSON: ${settingfilepath}`, { cause: error });
    }

    if (settings === null || typeof settings !== "object" || Array.isArray(settings)) {
        throw new Error(`Settings file must contain a JSON object: ${settingfilepath}`);
    }

    return settings;
}

export async function saveAPIkey(apikey) {
    const settingfilepath = path.join(CONFIG_DIR, "settings.json");
    const settings = await getsettingfilepath();
    settings.apiKey = apikey;
    await fs.writeFile(settingfilepath, `${JSON.stringify(settings, null, 2)}\n`);
}


export async function getApikey() {
    const setting = await getsettingfilepath();
    return setting.apiKey || null;
}