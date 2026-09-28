FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config for static site
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files
COPY index.html styles.css robots.txt sitemap.xml /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets
COPY data   /usr/share/nginx/html/data

EXPOSE 8080
