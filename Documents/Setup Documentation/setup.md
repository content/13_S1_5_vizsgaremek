```
Ampss
web --> .env file
web/next/apps --> .env file
string generator: https://www.random.org/strings/ UPLOADTHING_TOKEN=
cd web/apps
bun install 
cd next 
bun install
cd ../..
cd packages/database
bun run drizzle-kit generate
létrehozni studify nevezetű database-t ha nincs
bun run drizzle-kit migrate
cd ../..
cd apps/next
database-en belül .sql fileok beszúrása a database-be.
//tesztelés frontend
bun cypress install
bun cypress open
//
bun run dev
```