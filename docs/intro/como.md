# Cómo consultar
La API está disponible vía HTTPS en https://api.quienesquien.wiki/v1/

## Filtros
Consultar cada endpoint (o extremo de la API) sin parámetros hará que se devuelva el total de las entradas, utilizando los límites por defecto. Si quieres modificar la consulta, expandiendo las referencias o limitándola a aquellas entradas que coincidan con ciertos criterios, debes usar los filtros.

Hay algunos filtros genéricos que aplican a todos los endpoints, y otros que aplican a cada endpoint en particular. Listaremos aquí los genéricos.

## size
La cantidad de registros que se incluyen en cada página de resultados. Default: 25 registros. Tipo: 1000 >= entero > 0.

## offset
El número de registros a omitir desde el principio. Default: 0 registros (página inicial). Tipo: entero >= 0. Si el offset es mayor al número total de registro devuelve una respuesta vacía.

## expand_references
Bandera que indica si se incluyen referencias a otras colecciones dentro de cada documento en la respuesta. Default: false. Tipo: boolean.

## include_custom_fields
Bandera que indica los campos adicionales que se desea incluir dentro de cada documento en la respuesta. Default: none. Valores posibles: all, none, listado de campos. Tipo: array. Si algún campo solicitado no existe, no incluye información adicional en la respuesta.

En las bases de datos de QQW existen muchos datos adicionales a los estándares utilizados para cada tipo de dato. TODO: hacer el listado de los fields disponibles para cada tipo de dato.

## updated_since
Limitar el conjunto de resultados a aquellos cuya fecha de última actualización sea posterior al valor del filtro. Tipo: date. Default: 0000-00-00T00:00:00Z.
