import { connectionString } from "./config"; 
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "mysql",
    schema: "./schema",
    out: "./migrations",
    dbCredentials: {
        url: connectionString || ""
    }
});