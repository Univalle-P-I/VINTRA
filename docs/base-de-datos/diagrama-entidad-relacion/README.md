# Sobre el Diagrama Entidad-Relación

El [`Diagrama ER`](/docs/base-de-datos/diagrama-entidad-relacion/DER-BD_v2.pdf) cuenta con **29 tablas**. 10 de ellas son tablas de registros (logs) señaladas en un color _azul_, y las 19 restantes pertenecen a tablas de datos, catalogos y transaccionales, coloreadas en un color _verde_.
Para conocer más información acerca de las características de cada atributo en las tablas consulte lo documento en el titular [**3. Diccionario de Datos**](/docs/base-de-datos/README.md).
Para conocer más acerca de las relaciones consulte lo documentado en el titular [**4. Relaciones con el Modelo de Dominio**](/docs/base-de-datos/README.md).

> Aclaración: todas las tablas `*_log` cuenta con una llave foránea (FK) hacia su tabla entidad como objeto que fue modificado; sin embargo, por seguimiento conserva un segunda llave foránea (FK) hacia user_account(id), como actor. Asociando al registro el actor que realiza tal modificación.

Ultima fecha de modificación: 5/11/2026
