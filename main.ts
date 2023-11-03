import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { DOMParser, Element, Node, NodeList } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { assert } from "https://deno.land/std@0.205.0/assert/mod.ts";

type Proxy = {
  host: string;
  port: number;
};

type HTMLCollectionOf<T extends Node> = T[];

const app = new Hono();

app.get("*", async (c) => {
  const resp = await fetch("https://free-proxy-list.net/");
  const data = await resp.text();
  const dom = new DOMParser().parseFromString(data, "text/html");
  assert(dom)

  const trs: NodeList = dom?.querySelectorAll("#list > div > div.table-responsive > div > table > tbody > tr");
  const proxys: Proxy[] = [];

  for (let i = 0; i < trs?.length; i++) {
    const tr: Element = trs[i] as Element;
    const tds = tr?.querySelectorAll("td");
    if (tds) {
      const host: string = tds[0].textContent;
      const port: number = parseInt(tds[1].textContent);
      proxys.push({ host, port });
    }
  }
 
  return c.jsonT(proxys);
});

Deno.serve(app.fetch);
