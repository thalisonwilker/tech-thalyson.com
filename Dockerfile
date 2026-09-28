FROM node:22-alpine AS build
WORKDIR /app
COPY package.json index.html styles.css robots.txt sitemap.xml ./
COPY assets ./assets
COPY scripts/build.mjs ./scripts/build.mjs
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=8080 HOST=0.0.0.0 PUBLIC_HOST=tech.thalyson.com
WORKDIR /app
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node scripts/serve.mjs scripts/server.mjs ./scripts/
USER node
EXPOSE 8080
CMD ["node", "scripts/serve.mjs"]
