# Compranet (2018-2019)

CompraNet es el sistema electrónico de información pública gubernamental sobre adquisiciones, arrendamientos y servicios, así como obras públicas y servicios relacionados con las mismas. Los datos de contratos del año 2018 en adelante tienen una estructura ligeramente diferente de los años anteriores.

Origen de los datos: [https://sites.google.com/site/cnetuc/descargas](https://sites.google.com/site/cnetuc/descargas)

### Mapeo de campos

|COLUMNA|TIPO/VALORES|OCDS|
|-------|------------|----|
|Orden de gobierno|**string**<br><br>"APF"<BR>"GE"<BR>"GM"|parties.govLevel = "country"<br>parties.govLevel = "region"<BR>parties.govLevel = "city"|
|Siglas de la Institución|**string**|parties.memberOf.initials|
|Institución|**string**|*Para parties.role = "buyer":*<br><br>parties.memberOf.id<br>parties.memberOf.name|
|Clave de la UC|**string**|*(no se usa)*|
|Nombre de la UC|**string**<br><br>"SIGLAS-Nombre_UC Clave_UC"<br><br>“Iniciales Estado-Nombre Dependencia-Nombre_UC Clave_UC”<br><br>"Iniciales_Estado-Nombre_Municipio-Nombre_UC Clave_UC"|tender.procuringEntity.id<br>tender.procuringEntity.name<br>buyer.id<br>buyer.name<br><br>*Para parties.role = "buyer":*<br> <br>parties.id<br>parties.name|
|Responsable de la UC|**string**|*Para parties.role = "buyer":*<br><br>parties.contactPoint.id<br>parties.contactPoint.name|
|Código del expediente|**number**|tender.id|
|Referencia del expediente|**string**|*(no se usa)*|
|Clave CUCOP|**string**|*(no se usa)*|
|Título del expediente|**string**|tender.title|
|Plantilla del expediente|**string**|tender.procurementMethodDetailsTemplateMxCnet|
|Fundamento legal|**string**|tender.procurementMethodRationale|
|Número del procedimiento|**string**|id<br>ocid|
|Fecha de fallo|**date**|awards.date|
|Fecha de publicación|**datetime**|contracts.tenderPeriod.startDate|
|Fecha de apertura|**datetime**|contracts.tenderPeriod.endDate|
|Carácter del procedimiento|**string**<br><br>"Nacional"<br>"Internacional"<br>"Internacional bajo TLC"|tender.procurementMethodCharacterMxCnet|
|Tipo de contratación|**string**<br><br>"Servicios"<br>"Adquisiciones"<br>"Arrendamientos"<br>"Obra Pública"<br>"Servicios Relacionados con la OP"|tender.additionalProcurementCategories<br><br>tender.mainProcurementCategory *(mapeado a codelist)*|
|Tipo de procedimiento|**string**<br><br>"Adjudicación directa"<br>"Adjudicación Directa Federal"<br>"Invitación a Cuando Menos 3 Personas"<br>"Licitación Pública"<br>"Otro"<br>"Proyecto de Convocatoria"|tender.procurementMethod *(mapeado a codelist)*<br><br>tender.procurementMethodMxCnet|
|Forma de participación|**string**<br><br>"Electrónica"<br>"Mixta"<br>"Presencial"|tender.submissionMethod *(mapeado a codelist)*<br><br>tender.submissionMethodDetails|
|Código del contrato|**number**|awards.id<br>contracts.id<br>contracts.awardID|
|Núm. de control del contrato|**string**|*(no se usa)*|
|Título del contrato|**string**|awards.title<br>contracts.title|
|Descripción del contrato|**string**|contracts.description<br>awards.description|
|Fecha de inicio del contrato|**date**|contracts.period.startDate|
|Fecha de fin del contrato|**date**|contracts.period.endDate|
|Importe del contrato|**number**|contracts.value.amount<br>awards.value.amount|
|Moneda del contrato|**string**|planning.budget.budgetBreakdown.amount.currency<br>awards.value.currency<br>contracts.value.currency|
|Estatus del contrato|**string**<br><br>"Activo"<br>"Expirado"<br>"Terminado"|contracts.status *(mapeado a codelist)*<br><br>contracts.statusMxCnet<br><br>tag *(mapeado a codelist)*|
|Convenio modificatorio|**number**<br><br>0<br>1|contracts.amendments.id|
|Clave del programa federal|**string**|planning.budget.project<br>planning.budget.projectID|
|Fecha de firma del contrato|**date**|contracts.dateSigned|
|Contrato marco|**???**|contracts.hasFramework|
|Compra consolidada|**number**<br><br>0<br>1|buyer.consolidatedProcessMxCnet|
|Contrato plurianual|**number**<br><br>0<br>1|contracts.period.multiyearContractMxCnet<br>tender.contractPeriod.multiyearContractMxCnet|
|Clave de cartera SHCP|**string**|*(no se usa)*|
|Folio en el RUPC|**number**|*Para parties.role = "supplier":*<br><br>parties.identifier.id|
|RFC|**string**|*Para parties.role = "supplier":* <br><br>parties.additionalIdentifiers.id|
|Proveedor o contratista|**string**|awards.suppliers.name<br>awards.suppliers.id <br><br>*Para parties.role = "supplier":*<br><br>parties.name<br>parties.id <br>parties.identifier.legalName|
|Estratificación de la empresa|**string**<br><br>"Mediana"<br>"Micro"<br>"No MIPYME"<br>"Pequeña"|*Para parties.role = "supplier":*<br><br>parties.details.scaleReportedBySupplierMxCnet|
|Clave del país de la empresa|**string**|*Para parties.role = "supplier":*<br><br>parties.address.countryName|
|RFC verificado en el SAT|**number**<br><br>0<br>1|*Para parties.role = "supplier":* <br><br>parties.additionalIdentifiers.verified|
|Crédito externo|**number**<br><br>0<br>1|*(no se usa)*|
|Organismo financiero|**string**|*Para parties.role = "funder":*<br><br>parties.id<br>parties.name|
|Dirección del anuncio|**string**|awards.documents.url|

### Mapeos a codelists OCDS

#### Tipos de Contratación (tender.mainProcurementCategory)

|VALOR ORIGINAL|VALOR OCDS|
|--------------|----------|
|Servicios|services|
|Adquisiciones|goods|
|Arrendamientos|goods|
|Obra Pública|works|
|Servicios Relacionados con la OP|works|

#### Tipos de Procedimiento (tender.procurementMethod)

|VALOR ORIGINAL|VALOR OCDS|
|--------------|----------|
|Licitacion Publica|open|
|Licitacion Publica Con Osd|open|
|Licitacion Publica Estatal|open|
|Invitacion A Cuando Menos 3 Personas|limited|
|Adjudicacion Directa|direct|
|Adjudicacion Directa Federal|direct|
|Convenio|direct|
|Proyecto de Convocatoria|Determinado por el valor de PLANTILLA_EXPEDIENTE:<br><br>*07. Proyecto de Convocatoria a la Licitación Pública<br>*open<br><br>*05. Adjudicación Directa LAASSP*<br>01. Licitación Pública LAASSP<br>02. Licitación Pública LOPSRM*<br>direct<br><br>*04. Invitación a Cuando Menos Tres Personas LOPSRM<br>03. Invitación a Cuando Menos Tres Personas LAASSP*<br>limited|

#### Formas de Procedimiento (tender.submissionMethod)

|VALOR ORIGINAL|VALOR OCDS|
|--------------|----------|
|Electrónica||
|Mixta||
|Presencial|inPerson|

#### Estatus y Etiqueta de Contrato (tag, contracts.status)

|VALOR ORIGINAL|VALOR OCDS|
|--------------|----------|
|Activo|contract|
|Expirado|contractTermination|
|Terminado|contractTermination|
