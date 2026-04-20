import fs from 'fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (e) => {
  console.error("DOM ERROR:", e);
});
virtualConsole.on("log", (l) => {
  console.log("DOM LOG:", l);
});
virtualConsole.on("warn", (w) => {
  console.log("DOM WARN:", w);
});
virtualConsole.on("jsdomError", (e) => {
  console.error("JSDOM ERROR:", e);
});

const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>`, {
  url: "https://journal-frontend-orpin.vercel.app/",
  runScripts: "dangerously",
  virtualConsole
});

dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 0);

const scriptContent = fs.readFileSync('vercel-index.js', 'utf-8');

try {
  dom.window.eval(scriptContent);
  setTimeout(() => {
    console.log("Script evaluated successfully. #root HTML is:");
    console.log(dom.window.document.getElementById('root').innerHTML);
  }, 100);
} catch (e) {
  console.error("Error evaluating script:", e);
}
