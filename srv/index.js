import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import express from 'express';
import helmet from 'helmet';
import logger from 'morgan';
import ejs from 'ejs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.resolve(__dirname, 'index.html.ejs');
const template = ejs.compile(await fs.readFile(TEMPLATE_PATH, 'utf-8'));

const MANIFEST_PATH = path.resolve(__dirname, '../dist/manifest.json');
const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'));

const app = express();
app.use(logger('dev'));
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  next();
});
app.use(helmet.contentSecurityPolicy({
  // useDefaults: false,
  directives: {
    upgradeInsecureRequests: null,
    scriptSrc: [
      (req, res) => `'nonce-${res.locals.cspNonce}'`,
    ],
  },
}));
app.use(express.static(path.resolve(__dirname, '../dist')));
app.use((req, res) => {
  const { chunks: CHUNKS, entrypoints: { main: ENTRIES } } = manifest;

  const html = template({
    NONCE: res.locals.cspNonce,
    CHUNKS,
    ENTRIES,
  });

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.status(200);
  res.send(html);
});

app.listen(8081, () => {
  console.log('Backend listening at http://127.0.0.1:8081/');
});
