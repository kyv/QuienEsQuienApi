## Compranet 3.0

CompraNet es el sistema electrónico de información pública gubernamental sobre adquisiciones, arrendamientos y servicios, así como obras públicas y servicios relacionados con las mismas. Hasta 2011, el sistema se llamaba Compranet 3.0 y los datos de contratos publicados en este sistema tienen una estructura distinta a los que se publicaron posteriormente en la versión siguiente de Compranet.

Origen de los datos: [https://sites.google.com/site/cnetuc/contratos_cnet_3](https://sites.google.com/site/cnetuc/contratos_cnet_3)

### Mapeo de campos

|COLUMNA|TIPO/VALORES|OCDS|
|-------|------------|----|
|DEPENDENCIA / ENTIDAD|**string**|*Para parties.role = "buyer":*<br><br>parties.memberOf.name<br>parties.memberOf.id *(simple+lavanderia)*|
|NOMBRE UC|**string**|tender.procuringEntity.id<br>tender.procuringEntity.name <br>buyer.id<br>buyer.name<br><br>*Para parties.role = "buyer":*<br><br>parties.id<br>parties.name<br>parties.identifier.legalName|
|CLAVE UC|**string**|*Para parties.role = "buyer":*<br><br>parties.identifier.id|
|NUMERO DE PROCEDIMIENTO|**string**|id<br>ocid<br>tender.id|
|TIPO DE PROCEDIMIENTO|**string**<br><br>"Adjudicación Directa"<br>"Invitación a 3"<br>"Licitación Pública"|tender.procurementMethod *(mapeado a codelist)*<br><br>tender.procurementMethodDetails|
|TIPO CONTRATACION|**string**<br><br>"Servicios"<br>"Adquisiciones"<br>"Arrendamientos"<br>"Obra Pública"<br>"Servicios Relacionados con la OP"|tender.mainProcurementCategory *(mapeado a codelist)*<br><br>tender.additionalProcurementCategories|
|CARACTER|**string**<br>"Nacional"<br>"Internacional"|tender.procurementMethodCharacterMxCnet|
|NUMERO DE CONTRATO|**string**|awards.id<br>contracts.id<br>contracts.awardID|
|REFERENCIA DE LA CONTRATACION|**string**|tender.title<br>awards.title<br>contracts.title|
|FECHA DE SUSCRIPCION DE CONTRATO|**date**|contracts.date<br>contracts.period.startDate|
|IMPORTE MN SIN IVA|**number**|awards.value.amount<br>contracts.value.amount|
|RAZON SOCIAL|**string**|awards.suppliers.id<br>awards.suppliers.name<br><br>*Para parties.role = "supplier":*<br><br>parties.id<br>parties.name|
|URL DEL CONTRATO|**string**|awards.documents.url|

### Mapeos a codelists OCDS

#### Tipos de Contratación (tender.mainProcurementCategory)

|VALOR ORIGINAL|VALOR OCDS|
|--------------|----------|
|Adquisiciones|goods|
|Arrendamientos|goods|
|Obra Pública|works|
|Servicios Relacionados con la OP|works|
|Servicios|services|

#### Tipos de Procedimiento (tender.procurementMethod)

|VALOR ORIGINAL|VALOR OCDS|
|--------------|----------|
|Licitación Pública|open|
|Invitacion a 3|limited|
|Adjudicacion Directa|direct|
