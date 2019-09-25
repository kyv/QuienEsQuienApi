# Compranet (2010-2017)

CompraNet es el sistema electrónico de información pública gubernamental sobre adquisiciones, arrendamientos y servicios, así como obras públicas y servicios relacionados con las mismas.

Origen de los datos: [https://sites.google.com/site/cnetuc/descargas](https://sites.google.com/site/cnetuc/descargas)

### Mapeo de campos

|COLUMNA|TIPO/VALORES|OCDS|
|-------|------------|----|
|GOBIERNO|**string**<br><br>"APF"<BR>"GE"<BR>"GM"|parties.govLevel = "country"<br>parties.govLevel = "region"<BR>parties.govLevel = "city"|
|SIGLAS|**string**|parties.memberOf.initials|
|DEPENDENCIA|**string**|*Para parties.role = "buyer":*<br><br>parties.memberOf.id<br>parties.memberOf.name|
|CLAVEUC|**string**|*(no se usa)*|
|NOMBRE_DE_LA_UC|**string**<br><br>"SIGLAS-Nombre_UC Clave_UC"<br><br>“Iniciales Estado-Nombre Dependencia-Nombre_UC Clave_UC”<br><br>"Iniciales_Estado-Nombre_Municipio-Nombre_UC Clave_UC"|tender.procuringEntity.id<br>tender.procuringEntity.name<br>buyer.id<br>buyer.name<br><br>*Para parties.role = "buyer":*<br> <br>parties.id<br>parties.name|
|RESPONSABLE|**string**|*Para parties.role = "buyer":*<br><br>parties.contactPoint.id<br>parties.contactPoint.name|
|CODIGO_EXPEDIENTE|**number**|tender.id|
|TITULO_EXPEDIENTE|**string**|tender.title|
|PLANTILLA_EXPEDIENTE|**string**|tender.procurementMethodDetailsTemplateMxCnet|
|NUMERO_PROCEDIMIENTO|**string**|id<br>ocid|
|EXP_F_FALLO|**date**|awards.date|
|PROC_F_PUBLICACION|**datetime**|contracts.tenderPeriod.startDate|
|FECHA_APERTURA_PROPOSICIONES|**datetime**|contracts.tenderPeriod.endDate|
|CARACTER|**string**<br><br>"Nacional"<br>"Internacional"<br>"Internacional bajo TLC"|tender.procurementMethodCharacterMxCnet|
|TIPO_CONTRATACION|**string**<br><br>"Servicios"<br>"Adquisiciones"<br>"Arrendamientos"<br>"Obra Pública"<br>"Servicios Relacionados con la OP"|tender.additionalProcurementCategories<br><br>tender.mainProcurementCategory *(mapeado a codelist)*|
|TIPO_PROCEDIMIENTO|**string**<br><br>"Adjudicación directa"<br>"Adjudicación Directa Federal"<br>"Invitación a Cuando Menos 3 Personas"<br>"Licitación Pública"<br>"Otro"<br>"Proyecto de Convocatoria"|tender.procurementMethod *(mapeado a codelist)*<br><br>tender.procurementMethodMxCnet|
|FORMA_PROCEDIMIENTO|**string**<br><br>"Electrónica"<br>"Mixta"<br>"Presencial"|tender.submissionMethod *(mapeado a codelist)*<br><br>tender.submissionMethodDetails|
|CODIGO_CONTRATO|**number**|awards.id<br>contracts.id<br>contracts.awardID|
|TITULO_CONTRATO|**string**|awards.title<br>contracts.title|
|FECHA_INICIO|**date**|contracts.period.startDate|
|FECHA_FIN|**date**|contracts.period.endDate|
|IMPORTE_CONTRATO|**number**|contracts.value.amount<br>awards.value.amount|
|MONEDA|**string**|planning.budget.budgetBreakdown.amount.currency<br>awards.value.currency<br>contracts.value.currency|
|ESTATUS_CONTRATO|**string**<br><br>"Activo"<br>"Expirado"<br>"Terminado"|contracts.status *(mapeado a codelist)*<br><br>contracts.statusMxCnet<br><br>tag *(mapeado a codelist)*|
|ARCHIVADO|**string**<br><br>"Si"<br>"No"|contracts.filedMxCnet|
|CONVENIO_MODIFICATORIO|**number**<br><br>0<br>1|contracts.amendments.id|
|RAMO|**number**|planning.budget.budgetBreakdown.budgetClassifications.origin|
|CLAVE_PROGRAMA|**string**|planning.budget.project<br>planning.budget.projectID|
|APORTACION_FEDERAL|**number**|planning.budget.budgetBreakdown.amount.amount|
|FECHA_CELEBRACION|**date**|contracts.dateSigned|
|CONTRATO_MARCO|**???**|contracts.hasFramework|
|IDENTIFICADOR_CM|**string**|contracts.framework|
|COMPRA_CONSOLIDADA|**number**<br><br>0<br>1|buyer.consolidatedProcessMxCnet|
|PLURIANUAL|**number**<br><br>0<br>1|contracts.period.multiyearContractMxCnet<br>tender.contractPeriod.multiyearContractMxCnet|
|CLAVE_CARTERA_SHCP|**string**|*(no se usa)*|
|ESTRATIFICACION_MUC|**string**<br><br>"Mediana"<br>"Micro"<br>"No MIPYME"<br>"Pequeña"|*Para parties.role = "supplier":*<br><br>parties.details.scaleReportedByBuyerMxCnet|
|FOLIO_RUPC|**number**|*Para parties.role = "supplier":*<br><br>parties.identifier.id|
|PROVEEDOR_CONTRATISTA|**string**|awards.suppliers.name<br>awards.suppliers.id <br><br>*Para parties.role = "supplier":*<br><br>parties.name<br>parties.id <br>parties.identifier.legalName|
|ESTRATIFICACION_MPC|**string**<br><br>"Mediana"<br>"Micro"<br>"No MIPYME"<br>"Pequeña"|*Para parties.role = "supplier":*<br><br>parties.details.scaleReportedBySupplierMxCnet|
|SIGLAS_PAIS|**string**|*Para parties.role = "supplier":*<br><br>parties.address.countryName|
|ESTATUS_EMPRESA|**string**<br><br>"HABILITADO"|*(no se usa)*|
|CUENTA_ADMINISTRADA_POR|**string**<br><br>"PoC"<br>"UC"|*(no se usa)*|
|C_EXTERNO|**number**<br><br>0<br>1|*(no se usa)*|
|ORGANISMO|**string**|*Para parties.role = "funder":*<br><br>parties.id<br>parties.name|
|ANUNCIO|**string**|awards.documents.url|

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
|Electrónica|electronicSubmission|
|Mixta|electronicSubmission|
|Presencial|inPerson|

#### Estatus y Etiqueta de Contrato (tag, contracts.status)

|VALOR ORIGINAL|VALOR OCDS|
|--------------|----------|
|Activo|contract|
|Expirado|contractTermination|
|Terminado|contractTermination|
