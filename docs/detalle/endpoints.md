# Endpoints de consulta
## /societies
Devuelve un listado de empresas o sociedades.
Si se especifica la expansión de referencias, también se listarán las memberships y los contracts de la organización.

### Filtros
#### id
El identificador único de la empresa o sociedad. Tipo de dato: string.
#### name
El nombre parcial o completo de la empresa o sociedad. Realiza la búsqueda en nombres principales y alternativos. Tipo de dato: string o regular expression.
#### country
El nombre del país o código ISO 3166-1 alpha-2 para el país al que pertenece. Tipo de dato: string.
#### source
El nombre de la fuente desde la cual fue importada la información. Tipo de dato: string.
#### contract_count_min
Número mínimo de contratos en los que participa la empresa o sociedad. Tipo de dato: entero. Default: 0.
#### contract_count_max
Número máximo de contratos en los que participa la empresa o sociedad. Tipo de dato: entero. Default: 0 (no aplica el límite superior).
#### contracted_amount_min
#### contracted_amount_max

## /institutions
Devuelve un listado de instituciones públicas.
Si se especifica la expansión de referencias, también se listarán las memberships y los contracts de la organización.

### Filtros
#### id
El identificador único de la institución. Tipo de dato: string.
#### name
El nombre parcial o completo de la institución. Realiza la búsqueda en nombres principales y alternativos. Tipo de dato: string o regular expression.
#### country
El nombre del país o código ISO 3166-1 alpha-2 para el país al que pertenece. Tipo de dato: string.
#### source
El nombre de la fuente desde la cual fue importada la información. Tipo de dato: string.
#### contract_count_min
Número mínimo de contratos en los que participa la institución. Tipo de dato: entero. Default: 0.
#### contract_count_max
Número máximo de contratos en los que participa la institución. Tipo de dato: entero. Default: 0 (no aplica el límite superior).
#### contracted_amount_min
#### contracted_amount_max

## /persons
Devuelve una person.
Si se especifica la expansión de referencias, también se listarán las memberships y los contracts de la persona.

### Filtros
#### id
El identificador único de la persona. Tipo de dato: string.
#### name
El nombre parcial o completo de la persona. Realiza la búsqueda en nombres principales y alternativos. Tipo de dato: string o regular expression.
#### gender
El sexo asociado a la persona. Tipo de dato: string. Default: all. Valores posibles: male, female, other. Nota: se utiliza el nombre gender para el filtro con el propósito de evitar censura por parte de sistemas automatizados.
#### country
El nombre del país o código ISO 3166-1 alpha-2 para el país al que pertenece. Tipo de dato: string.
#### source
El nombre de la fuente desde la cual fue importada la información. Tipo de dato: string.
#### contract_count_min
Número mínimo de contratos en los que participa la persona. Tipo de dato: entero. Default: 0.
#### contract_count_max
Número máximo de contratos en los que participa la persona. Tipo de dato: entero. Default: 0 (no aplica el límite superior).
#### contracted_amount_min
#### contracted_amount_max

## /contracts
Devuelve una OCDS recordPackage o un OCDS Record.

### Filtros
#### id
El identificador único del proceso de contratación (ocid). Tipo de dato: string.
#### title
El título del contrato. Tipo de dato: string o regular expression.
#### amount_min
El importe nominal mínimo del contrato. Tipo de dato: float (sin separador de miles y con '.' como separador de decimales). Default: 0.
#### amount_max
El importe nominal máximo del contrato. Tipo de dato: float (sin separador de miles y con '.' como separador de decimales). Default: 0.
#### currency
La moneda utilizada para especificar los importes de los procesos de contratación. Tipo de dato: string.
#### start_date_min
El valor más antiguo para el cual evaluar la fecha de inicio del contrato de los procesos de contratación. Tipo de dato: date. Default: 0000-00-00T00:00:00Z (sin límite inferior en el rango).
#### start_date_max
El valor más reciente para el cual evaluar la fecha de inicio del contrato en los procesos de contratación. Tipo de dato: date. Default: 0000-00-00T00:00:00Z (sin límite superior en el rango).
#### end_date_min
El valor más antiguo para el cual evaluar la fecha de finalización del contrato de los procesos de contratación. Tipo de dato: date. Default: 0000-00-00T00:00:00Z (sin límite inferior en el rango).
#### end_date_max
El valor más reciente para el cual evaluar la fecha de finalización del contrato en los procesos de contratación. Tipo de dato: date. Default: 0000-00-00T00:00:00Z (sin límite superior en el rango).
#### party_name
El nombre de una empresa, sociedad, institución o persona que participa en uno o varios procesos de contratación. Tipo de dato: string o regular expression.
#### party_type
En conjunto con **party_name**, especifica su rol dentro de los procesos de contratación. Devuelve un listado de procesos de contratación en los cuales **party_name** participa como **party_type**. Valores posibles: buyer, supplier, funder, all.
#### procurement_method
El procedimiento bajo el cual se realizó el proceso de contratación (adjudicación directa, licitación, etc.). Tipo de dato: string. Valores posibles: open, selective, limited, direct, all. Default: all.

## /sources
Devuelve una source y todas las source_run para ella.

### Filtros
#### id
El identificador único para una fuente de datos. Tipo de dato: string.

