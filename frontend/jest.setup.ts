import dotenv from "dotenv";
import fetch from "node-fetch";

(globalThis as any).fetch = fetch;
dotenv.config({ path: ".env.local" });
