## POT (Portal de Obligaciones de Transparencia)

El Portal de Obligaciones de Transparencia (POT), es el sistema que mantiene el cumplimiento histórico a las obligaciones de transparencia que se consideraron en la abrogada Ley Federal de Transparencia y Acceso a la Información Pública Gubernamental (LFTAIPG).

Origen de los datos: [http://portaltransparencia.gob.mx/pot/fichaOpenData.do?method=fichaOpenData&fraccion=contrato](http://portaltransparencia.gob.mx/pot/fichaOpenData.do?method=fichaOpenData&fraccion=contrato)

### Mapeo de campos

|COLUMNA|TIPO/VALORES|OCDS|
|-------|------------|----|
|Institución|**string**|*Para parties.role = "buyer"*:<br><br>parties.parties.memberOf.name<br>parties.id|
|Número de Contrato|**string**|ocid<br>id<br>tender.id<br>awards.id<br>contracts.id<br>contracts.awardID|
|Procedimiento de contratación|**string**<br><br>"ADJUDICACION DIRECTA"<br>"INVITACIÓN A TRES PERSONAS"<br>"LICITACIÓN PÚBLICA INTERNACIONAL"<br>"LICITACIÓN PÚBLICA NACIONAL"<br>"OTROS"<br>*(variantes de las anteriores)*|tender.procurementMethod *(mapeado a codelist)*<br><br>tender.procurementMethodDetails|
|Nombre de la persona a que se asignó el contrato|**string**|awards.suppliers.id<br>awards.suppliers.name<br><br>*Para parties.role = "supplier":*<br><br>parties.id<br>parties.name|
|Fecha de celebración del Contrato|**date**|contracts.dateSigned|
|Monto del Contrato|**number**|awards.value.amount<br>contracts.value.amount|
|Unidad Administrativa que celebró el Contrato|**string**|tender.procuringEntity.id<br>tender.procuringEntity.name<br>buyer.id<br>buyer.name<br><br>*Para parties.role = "buyer":*<br><br>parties.id<br>parties.name|
|Objeto del Contrato|**string**|tender.title<br>awards.title<br>contracts.title|
|Fecha Inicio del Contrato|**date**|contracts.period.startDate|
|Fecha de Terminación del Contrato|**date**|contracts.period.endDate|
|Documento: Sitio en Internet|**string**|awards.documents.url|
|Convenio Modificatorio|**string**<br><br>"Si"<br>"No"|contracts.amendments.id|

### Mapeos a codelists OCDS

#### Tipos de Procedimiento (tender.procurementMethod)

|VALOR ORIGINAL|VALOR OCDS|
|--------------|----------|
|LICITACI N P BLICA|open|
|LICITACIÓN PÚBLICA|open|
|LICITACION PÚBLICA|open|
|LICITACION PUBLICA NACIONAL|open|
|LICITACIÓN PÚBLICA NACIONAL|open|
|LICITACION PUBLICA NACIONAL AMPLIACION|open|
|LICITACION PUBLICA INTERNACIONAL|open|
|LICITACION PÚBLICA INTERNACIONAL|open|
|LICITACIÓN PUBLICA INTERNACIONAL|open|
|LICITACIÓN PÚBLICA INTERNACIONAL|open|
|LICITACION PUBLICA  ART. 27  FRACCIÓN I Y ART. 41 - LOPSRM|open|
|LICITACIÓN PÚBLICA 26-I-LAASSP|open|
|LICITACIÓN PÚBLICA ART. 26-I-LAASSP|open|
|OTRO|open|
|OTROS|open|
|INVITACIÓN 26-II-LAASSP|limited|
|INVITACIÓN A 3 ART. 41-X-LAASSP|limited|
|INVITACION A TRES PERSONAS|limited|
|INVITACIÓN A TRES PERSONAS|limited|
|INVITACION A CUANDO MENOS TRES PERSONAS|limited|
|INVITACIÓN A CUANDO MENOS TRES PERSONAS|limited|
|INVITACION A CUENDO MENOS TRES PERSONAS|limited|
|INVITACIÓN A CUANDO MENOS TRES PERSONAS 26-II-LAASSP|limited|
|INVITACIÓN TRES PERSONAS|limited|
|INVITACIÓN ART. 26-II-LAASSP|limited|
|ADJUDICACI N DIRECTA|direct|
|ADJUDICACIÓN DIRECTA|direct|
|ADJUDICACION DIRECTA|direct|
|ADJUDICACIÓN DIRECTA  ART. 27  FRACCIÓN III Y ART. 43 - LOPSRM|direct|
|ADJUDICACIÓN DIRECTA 41-I-LAASSP|direct|
|ADJUDICACIÓN DIRECTA 41-III-LAASSP|direct|
|ADJUDICACIÓN DIRECTA 41-X Y XIV-LAASSP|direct|
|ADJUDICACIÓN DIRECTA ART-1-LAASSP|direct|
|ADJUDICACIÓN DIRECTA ART. 1-LAASSP|direct|
|ADJUDICACIÓN DIRECTA ART. 41-I-LAASSP|direct|
|ADJUDICACIÓN DIRECTA ART. 41-III-LAASSP|direct|
|ADJUDICACIÓN DIRECTA ART. 41-V-LAASSP|direct|
|ADJUDICACIÓN DIRECTA ART. 42-LAASSP|direct|
|ADJUDICACION DIRECTA., ART. 1-LAASSP|direct|
|ADJUDICACION DIRECTA|direct|
