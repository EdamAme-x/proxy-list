import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { DOMParser, Element, Node, NodeList } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { assert } from "https://deno.land/std@0.205.0/assert/mod.ts";

type Proxy = {
  host: string;
  port: number;
};

const app: Hono = new Hono();

function shuffle(array: Proxy[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

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
      if (host.startsWith("127.")) {
        continue;
      }
      proxys.push({ host, port });
    }
  }
 
  return c.json(shuffle(proxys));
});

Deno.serve(app.fetch);
