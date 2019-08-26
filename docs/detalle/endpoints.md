# Endpoints de consulta
## /companies
Devuelve un listado de objetos JSON tipo [Popolo Organization](http://www.popoloproject.com/specs/organization.html).

Devuelve un listado de empresas o asociaciones civiles.
Si se especifica la expansión de referencias, también se listarán las memberships y un resúmen de los contracts de la organización.

### Filtros
#### id
El identificador único de la empresa o sociedad. Tipo de dato: string.
#### name
El nombre parcial o completo de la empresa o sociedad. Realiza la búsqueda en nombres principales y alternativos. Tipo de dato: string o regular expression.
#### contract_count.supplier
Número de contratos en los que participa la empresa o sociedad. Tipo de dato: entero. Default: vacío.

Nota: soporta sintaxis de mínimo y máximo. Para mínimo poner `contract_count.supplier=>10` para máximo `contract_count.supplier=<100`. Para mínimo y máximo se pueden poner dos veces `contract_count.supplier=>10&contract_count.supplier=>10`.
#### contract_amount.supplier
Importe de contratos provistos por esta empresa. Es importante notar que los importes se están sumando en sus valores absolutos sin considerar las diferencias de monedas. Tipo de dato: entero. Default: vacío.

Nota: soporta sintaxis de mínimo y máximo. Para mínimo poner `contract_count.supplier=>10` para máximo `contract_count.supplier=<100`. Para mínimo y máximo se pueden poner dos veces `contract_count.supplier=>10&contract_count.supplier=>10`.


#### country (no implementado)
El nombre del país o código ISO 3166-1 alpha-2 para el país al que pertenece. Tipo de dato: string.
#### source (no implementado)
El nombre de la fuente desde la cual fue importada la información. Tipo de dato: string.


## /institutions
Devuelve un listado de objetos JSON tipo [Popolo Organization](http://www.popoloproject.com/specs/organization.html).

Devuelve un listado de instituciones públicas.
Si se especifica la expansión de referencias, también se listarán las memberships y los contracts de la organización.

### Filtros
#### id
El identificador único de la institución. Tipo de dato: string.
#### name
El nombre parcial o completo de la institución. Realiza la búsqueda en nombres principales y alternativos. Tipo de dato: string o regular expression.

#### contract_count.supplier y contract_count.buyer
Número de contratos en los que participa la institución. Muchas aparecen en contratos como comprador y como proveedor, por lo tanto se las puede filtrar u ordenar por ambos criterios. Tipo de dato: entero. Default: vacío.

Nota: soporta sintaxis de mínimo y máximo. Para mínimo poner `contract_count.supplier=>10` para máximo `contract_count.supplier=<100`. Para mínimo y máximo se pueden poner dos veces `contract_count.supplier=>10&contract_count.supplier=>10`.
#### contract_amount.supplier y contract_amount.buyer
Importe de contratos comprados o provistos por esta institución. Muchas aparecen en contratos como comprador y como proveedor, por lo tanto se las puede filtrar u ordenar por ambos criterios. Es importante notar que los importes se están sumando en sus valores absolutos sin considerar las diferencias de monedas. Tipo de dato: entero. Default: vacío.

Nota: soporta sintaxis de mínimo y máximo. Para mínimo poner `contract_count.supplier=>10` para máximo `contract_count.supplier=<100`. Para mínimo y máximo se pueden poner dos veces `contract_count.supplier=>10&contract_count.supplier=>10`.


## /persons
Devuelve un listado de objetos JSON tipo [Popolo Person](http://www.popoloproject.com/specs/person.html).

Si se especifica la expansión de referencias, también se listarán las memberships y los contracts de la persona.

### Filtros
#### id
El identificador único de la persona. Tipo de dato: string.
#### name
El nombre parcial o completo de la persona. Realiza la búsqueda en nombres principales y alternativos. Tipo de dato: string o regular expression.


#### contract_count.supplier y contract_count.buyer
Número de contratos en los que participa la persona. Muchas aparecen en contratos como comprador (responsable de unidad compradora) y como proveedor, por lo tanto se las puede filtrar u ordenar por ambos criterios. Tipo de dato: entero. Default: vacío.

Nota: soporta sintaxis de mínimo y máximo. Para mínimo poner `contract_count.supplier=>10` para máximo `contract_count.supplier=<100`. Para mínimo y máximo se pueden poner dos veces `contract_count.supplier=>10&contract_count.supplier=>10`.
#### contract_amount.supplier y contract_amount.buyer
Importe de contratos comprados o provistos por esta persona. Muchas aparecen en contratos como comprador (responsable de unidad compradora) y como proveedor, por lo tanto se las puede filtrar u ordenar por ambos criterios. Es importante notar que los importes se están sumando en sus valores absolutos sin considerar las diferencias de monedas. Tipo de dato: entero. Default: vacío.

Nota: soporta sintaxis de mínimo y máximo. Para mínimo poner `contract_count.supplier=>10` para máximo `contract_count.supplier=<100`. Para mínimo y máximo se pueden poner dos veces `contract_count.supplier=>10&contract_count.supplier=>10`.



#### gender (no implementado)
El sexo asociado a la persona. Tipo de dato: string. Default: all. Valores posibles: male, female, other. Nota: se utiliza el nombre gender para el filtro con el propósito de evitar censura por parte de sistemas automatizados.
#### country (no implementado)
El nombre del país o código ISO 3166-1 alpha-2 para el país al que pertenece. Tipo de dato: string.
#### source (no implementado)
El nombre de la fuente desde la cual fue importada la información. Tipo de dato: string.




  { htmlFieldName: "tipo-adquisicion", apiFieldNames:["compiledRelease.tender.procurementMethodMxCnet"], fieldLabel:"Tipo de procedimiento", type:"string", collections: ["contracts"] },
  { htmlFieldName: "size", apiFieldNames:["limit"], fieldLabel:"Resultados por página", type:"integer", hidden: true, collections: ["all"] },
  { htmlFieldName: "page", apiFieldNames:["offset"], fieldLabel:"Página", type:"integer", hidden: true, collections: ["all"] },
]


## /contracts
Devuelve un [OCDS recordPackage](https://standard.open-contracting.org/latest/en/schema/record_package/). Que incluye un listado de records, cada uno con sus release (de cada fuente) y su compiledRelease, este último es el que se utiliza para los filtros.

### Filtros
#### ocid
El identificador único del proceso de contratación (ocid). Tipo de dato: string.
#### Título: compiledRelease.contracts.title
El título del contrato. Tipo de dato: string o regular expression.
## Proveedor: compiledRelease.awards.suppliers.name
## Dependencia: compiledRelease.parties.memberOf.name
#### Fecha de inicio: compiledRelease.contracts.period.startDate
Fecha de inicio del contrato de los procesos de contratación. Tipo de dato: date (0000-00-00T00:00:00Z). Default: vacío.
#### Fecha de fin: compiledRelease.contracts.period.endDate
Fecha de fin del contrato de los procesos de contratación. Tipo de dato: date (0000-00-00T00:00:00Z). Default: vacío.

#### compiledRelease.total_amount
El importe nominal del proceso de contratación (suma de todos las adjudicaciones de este proceso). Tipo de dato: float (sin separador de miles y con '.' como separador de decimales). Default: vacío.

#### procurement_method
El procedimiento bajo el cual se realizó el proceso de contratación (adjudicación directa, licitación, etc.). Tipo de dato: string. Valores posibles: open, selective, limited, direct. Default: vacío.

#### currency (no implementado)
La moneda utilizada para especificar los importes de los procesos de contratación. Tipo de dato: string.

## /csv

Este endpoint genera versiones en CSV de los anteriores. La misma consulta se pone luego del /csv.

Ejemplo: Si tenemos una búsqueda de contratos ordenada por el importe `https://api.quienesquien.wiki/v2/contracts?sort=-compiledRelease.total_amount` y queremos el resultado en CSV podemos agregar CSV luego del v2 y antes del contracts, así: `https://api.quienesquien.wiki/v2/csv/contracts?sort=-compiledRelease.total_amount`

Lo mismo resulta válido para los otros endpoints.

## /sources (no implementado)
Devuelve una source.
