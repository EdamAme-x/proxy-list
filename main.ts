import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

type Proxy = {
  host: string;
  port: number;
};

const app = new Hono();

app.get("*", async (c) => {
  const resp = await fetch("https://free-proxy-list.net/");
  const data = await resp.text();
  const dom = new DOMParser().parseFromString(data, "text/html");

  return c.html(dom.body.outerHTML);
});

Deno.serve(app.fetch);
