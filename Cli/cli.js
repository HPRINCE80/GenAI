#!/usr/bin/env node

import "dotenv/config";
import main from "./src/main.js";

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
