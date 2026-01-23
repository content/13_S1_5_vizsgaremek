import { connectionString } from "./config"; 
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "mysql",
    schema: "./schema",
    out: "./migrations",
    introspect: {
        casing: 'preserve',
    },
    dbCredentials: {
        url: connectionString || ""
    }
});