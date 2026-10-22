import { createSiteServer } from './server.mjs';

const production = process.env.NODE_ENV === 'production';
let port = Number(process.env.PORT || 3000);
const host = process.env.HOST || (production ? '0.0.0.0' : '127.0.0.1');

const server = createSiteServer({
  root: production ? 'dist' : '.',
  allowedHost: production ? (process.env.PUBLIC_HOST || 'tech.thalyson.com') : undefined,
});

server.on('listening', () => {
  const address = server.address();
  const currentPort = typeof address === 'object' ? address.port : port;
  console.log(`\n💻 thalyson.tech rodando com sucesso!`);
  console.log(`👉 Acesse: http://${host}:${currentPort}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && !production && !process.env.PORT) {
    console.log(`⚠️  Porta ${port} já está em uso por outro projeto.`);
    port++;
    console.log(`🔄 Tentando porta alternativa ${port}...`);
    server.listen(port, host);
  } else {
    console.error(`❌ Erro ao iniciar servidor na porta ${port}:`, err.message);
    process.exit(1);
  }
});

server.listen(port, host);

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  });
}
