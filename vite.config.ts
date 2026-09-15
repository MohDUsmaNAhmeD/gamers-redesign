import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function apiPlugin(): Plugin {
  return {
    name: "vercel-api-dev",
    configureServer(server) {
      const env = loadEnv("development", process.cwd(), ["VITE_", "NEXT_PUBLIC_", "FULLSTACK_", "SUPABASE_"]);
      for (const [key, value] of Object.entries(env)) {
        if (!(key in process.env)) process.env[key] = value;
      }

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || "/", `http://${req.headers.host}`);
        if (!url.pathname.startsWith("/api/")) return next();

        const name = url.pathname.split("/api/")[1]?.split("/")[0];
        if (!name) return next();

        let body: any = undefined;
        try {
          const modPath = join(__dirname, "api", `${name}.js`);
          const mod = await import(pathToFileURL(modPath).href + "?t=" + Date.now());

          body = await new Promise<any>((resolve) => {
            if (req.method === "GET" || req.method === "OPTIONS") return resolve(undefined);
            let data = "";
            req.on("data", (chunk) => (data += chunk));
            req.on("end", () => {
              try { resolve(JSON.parse(data)); } catch { resolve(undefined); }
            });
          });

          const query = Object.fromEntries(url.searchParams.entries());

          const fakeRes = {
            statusCode: 200,
            headers: {} as Record<string, string>,
            setHeader(k: string, v: string) { this.headers[k] = v; },
            status(code: number) { this.statusCode = code; return this; },
            json(data: any) {
              res.writeHead(this.statusCode, { "Content-Type": "application/json", ...this.headers });
              res.end(JSON.stringify(data));
            },
            end(data?: any) {
              res.writeHead(this.statusCode, this.headers);
              res.end(data);
            },
          };

          await mod.default({ method: req.method, query, body, headers: req.headers }, fakeRes);
        } catch (err: any) {
          console.error(`API /api/${name} error:`, err?.message || err);
          if (name === "catalog") {
            // @ts-ignore mock data is a JavaScript serverless fallback
            const { MOCK_PRODUCTS, MOCK_CATEGORIES } = await import("./api/mockData.js");
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ products: MOCK_PRODUCTS, categories: MOCK_CATEGORIES }));
            return;
          }
          if (name === "cart") {
            // Attempt the local in-memory cart fallback before giving up
            try {
              // @ts-ignore fallback local module
              const { localGetCart, localMutateCart } = await import("./api/localCart.js");
              const cartId = url.searchParams.get("id") || (body as any)?.id || "";
              if (req.method === "GET") {
                const cart = await localGetCart(cartId);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(cart));
                return;
              }
              if (req.method === "PUT" && body) {
                const { action, product_id, quantity } = body as any;
                const result = await localMutateCart(cartId, action, product_id, quantity);
                if (result.error) {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ error: result.error }));
                } else {
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(JSON.stringify(result.cart));
                }
                return;
              }
            } catch {
              // fall through to generic error below
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ id: url.searchParams.get("id") || (body as any)?.id || "", items: [], saved_items: [] }));
            return;
          }
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err?.message || "Internal server error" }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react(), tailwindcss(), apiPlugin()];
  try {
    // @ts-ignore
    const m = await import("./.vite-source-tags.js");
    plugins.push(m.sourceTags());
  } catch {}

  const env = loadEnv(mode, process.cwd(), ["VITE_", "NEXT_PUBLIC_"]);
  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins,
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
    define: processEnvDefines,
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/gsap/')) return 'experience-motion';
            if (id.includes('three.core.js')) return 'chest-core';
            if (id.includes('node_modules/three/')) return 'chest-engine';
          },
        },
      },
    },
  };
});
