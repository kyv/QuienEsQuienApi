# Torre de Control

El proyecto [Torre de Control](https://torredecontrol.projectpoder.org/) es una iniciativa de PODER para el monitoreo de la construcción, financiamiento y viabilidad del Nuevo Aeropuerto Internacional de la Ciudad de México. Utiliza datos de contrataciones del Grupo Aeroportuario de la Ciudad de México (GACM) y otras dependencias relacionadas obtenidos desde Compranet y a través de solicitudes de acceso a la información. Estos contratos se recopilan en un CSV con una estructura propia.

Origen de los datos: recopilación manual.

### Mapeo de campos

|COLUMNA|TIPO/VALORES|VALOR MAPEADO|OBSERVACIONES|
|-------|------------|-------------|-------------|
|CONTRACT_TITLE_STRING|**(string)**|awards.title<br>contracts.title<br>tender.title||
|CONTRACT_NUM_PROC_STRING|**(string)**|awards.id<br>contracts.awardID<br>contracts.id<br>id<br>ocid<br>tender.id||
|CONTRACT_DEPENDENCY_STRING|**(string)**|buyer.name<br>tender.procuringEntity.id<br>tender.procuringEntity.name<br><br>*Para parties con roles = "buyer":*<br><br>parties.id<br>parties.name||
|CONTRACT_TYPE_PROC_STRING|**(string)**<br><br>Adjudicación Directa Federal: direct<br>Convenio: direct<br>Invitación a Cuando Menos 3 Personas: limited<br>Licitación Pública: open|tender.procurementMethod *(mapeado a codelist)*<br><br>tender.procurementMethodDetails||
|CONTRACT_TYPE_STRING|**(string)**<br><br>Adquisiciones<br>Arrendamientos<br>Obra Pública: works<br>Servicios<br>Servicios Relacionados con la OP|tender.mainProcurementCategory*(mapeado a codelist)*<br><br>tender.additionalProcurementCategories||
|CONTRACT_REFERENCES_STRING|**(string)**|awards.documents.url|URL del contrato en compranet|
|CONTRACT_PROVIDER_ORG_STRING|**(string)**|awards.suppliers.id<br>awards.suppliers.name<br><br>*Para parties con role = "supplier":*<br><br>parties.id<br>parties.name|Cuando el campo está lleno, el proveedor es una empresa o compañía|
|ORG_OTHER_NAMES_ARRAY|**(string)**<br><br>Separado por ;|parties.additionalIdentifiers|Siglas o nombre abreviado de la empresa o compañía|
|ORG_INITIALS_STRING|**(string)**|parties.additionalIdentifiers|Siglas de algunas instituciones como UNAM|
|CONTRACT_PROVIDER_PERSON_STRING|**(string)**|awards.suppliers.name<br>awards.suppliers.name<br><br>*Para parties con roles = "supplier":*<br><br>parties.id<br>parties.name|Cuando el campo está lleno, el proveedor es una persona|
|CONTRACT_AMOUNT_STRING|**(number)**|awards.value.amount<br>contracts.value.amount||
|ORG_COUNTRY_STRING|**(string)**|parties.address.countryName||
|ORG_STATE_STRING|**(string)**|parties.address.region||
|ORG_CITY_STRING|**(string)**|parties.address.locality||
|ORG_ZONE_STRING|**(string)**|parties.address.streetAddress|Se concatena después del campo siguiente|
|ORG_STREET_STRING|**(string)**|parties.address.streetAddress||
|ORG_ZIPCODE_STRING|**(number)**|parties.address.postalCode||
|ORG_PHONES_ARRAY|**(string)**<br>Separado por ;|parties.contactPoint.telephone||
|ORG_WEBSITE_STRING|**(string)**|parties.contactPoint.url||
|ORG_EMAILS_ARRAY|**(string)**|parties.contactPoint.email||

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
|Adjudicación Directa Federal|direct|
|Convenio|direct|
|Invitación a Cuando Menos 3 Personas|limited|
|Licitación Pública|open|
