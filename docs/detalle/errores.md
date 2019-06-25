# Mensajes de error
## Entidad inexistente
## Parámetro inexistente
```json
{

    "message": "Validation errors",
    "errors": [
        {
            "code": "INVALID_REQUEST_PARAMETER",
            "errors": [
                {
                    "code": "PATTERN",
                    "params": [
                        "^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$",
                        "a=a"
                    ],
                    "message": "String does not match pattern ^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$: a=a",
                    "path": [ ],
                    "description": "Internal ID of person"
                }
            ],
            "in": "path",
            "message": "Invalid parameter (_id): Value failed JSON Schema validation",
            "name": "_id",
            "path": [
                "paths",
                "/persons/{_id}",
                "get",
                "parameters",
                "0"
            ]
        }
    ]

}
```


## Parámetro inválido
## Consulta sin resultados
