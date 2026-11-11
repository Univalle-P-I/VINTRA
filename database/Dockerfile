FROM postgis/postgis:16-3.6

WORKDIR /database

COPY migrations/ /docker-entrypoint-initdb.d/
COPY triggers/ /docker-entrypoint-initdb.d/
COPY seeders/ /docker-entrypoint-initdb.d/

EXPOSE 5432