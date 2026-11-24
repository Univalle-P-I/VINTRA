FROM postgis/postgis:16-3.6

WORKDIR /database

COPY migrations/ /database/migrations/
COPY seeders/ /database/seeders/
COPY triggers/ /database/triggers/

EXPOSE 5432