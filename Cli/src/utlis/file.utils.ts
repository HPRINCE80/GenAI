import fs from "node:fs/promises";
import { CONFIG_DIR } from "./constant.js";
import path from "node:path";

export async function getsettingfilepath(): Promise<Record<string, unknown>> {
    try {
        await fs.access(CONFIG_DIR);
    } catch {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
    }

    const settingfilepath = path.join(CONFIG_DIR, "settings.json")
    try {
        await fs.access(settingfilepath);
        const content = await fs.readFile(settingfilepath, "utf-8");
        return JSON.parse(content) as Record<string, unknown>;
    } catch {
        await fs.writeFile(settingfilepath, JSON.stringify({}));
        return {};
    }
}
export async function saveAPIkey(apikey: string): Promise<void> {
    const settingfilepath = path.join(CONFIG_DIR, "setting");
}