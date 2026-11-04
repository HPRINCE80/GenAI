import os from "node:os";
import path from "node:path";

export const HOME_DIR = os.homedir();
export const CONFIG_DIR = path.join(HOME_DIR, ".beta");
