FROM nginx:1.23.1

WORKDIR /usr/share/nginx/html
COPY . ./
RUN mkdir roms -p
VOLUME /usr/share/nginx/html/roms 
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]

