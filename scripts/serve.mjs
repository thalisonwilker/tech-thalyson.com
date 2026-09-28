import { createSiteServer } from './server.mjs';

const production = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || (production ? '0.0.0.0' : '127.0.0.1');
const server = createSiteServer({
  root: production ? 'dist' : '.',
  allowedHost: production ? (process.env.PUBLIC_HOST || 'tech.thalyson.com') : undefined,
});

server.listen(port, host, () => console.log(`tw.tech escutando em ${host}:${port}`));
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  });
}
