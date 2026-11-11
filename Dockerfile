FROM nginx:alpine

# Copy all static website files to Nginx serve directory
COPY . /usr/share/nginx/html

# Replace default Nginx config with our port 8080 config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
