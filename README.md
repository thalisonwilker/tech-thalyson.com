# thalyson.tech — Thalyson Wilker

Site estático, responsivo e sem dependências de execução. Inspirado no projeto `thalisonwilker`, com os cinco eventos e o endereço do canal presentes na referência.

## Executar

Com Node.js 22 ou superior: `npm run dev`. Abra http://localhost:3000.

## Publicar

`npm run build` gera `dist/`. `npm test` verifica o servidor de produção, domínio, arquivos públicos e health check após o build.

O deploy usa Docker no Fly.io, na região São Paulo (`gru`), com uma máquina compartilhada de 256 MB. O endereço oficial é `https://tech.thalyson.com`.

### GitHub Actions

O workflow `.github/workflows/deploy.yml` faz build, testes e validação da imagem em pull requests e pushes na `main`. Após os checks, pushes na `main` publicam automaticamente no Fly. Também pode ser executado manualmente pela aba Actions.

O token deve existir apenas no secret `FLY_API_TOKEN` do GitHub. Nunca inclua credenciais nos arquivos ou commits. Para rotação, prefira um token de deploy restrito à aplicação.

### Configuração inicial do Fly e DNS

A aplicação configurada em `fly.toml` é `tech-thalyson-com`. Para uma conta nova, crie-a na organização desejada antes do primeiro deploy:

```sh
fly apps create tech-thalyson-com --org SUA_ORGANIZACAO
fly deploy --remote-only --ha=false
fly certs add tech.thalyson.com
fly certs check tech.thalyson.com
```

No provedor DNS, configure o registro `tech` usando o destino retornado por `fly certs add`. Se necessário, adicione o registro de validação informado pelo Fly. O certificado só será emitido após a validação DNS.

O Fly mantém seu hostname padrão, mas o servidor retorna 404 para ele e outros hosts em produção. Apenas `tech.thalyson.com` serve o site. `/healthz` responde sem essa restrição para os checks internos. HTTPS é obrigatório no proxy do Fly.

## Conteúdo

Edite `index.html` para atualizar eventos, apresentação e links. `styles.css` contém a identidade visual. A foto original está em `assets/thalyson-evento.jpg`. `data/events.json` preserva os dados de referência importados; a página é HTML estático e não lê esse arquivo automaticamente.

A seção de vídeos leva ao canal real no YouTube. Não foram inventados títulos, miniaturas ou links de vídeos individuais.
