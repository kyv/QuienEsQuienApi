# Mensajes de error

Cuando la API no puede devolver resultados, devuelve un conjunto vacío pero el status sigue siendo success.

La API devuelve un mensaje de error cuando no pudo procesar la consulta.

Hay un límite máximo de 5 segundos a las consultas a la base de datos. Las consultas realizadas sobre campos sin índice normalmente exceden este límite y generan mensajes de error.

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
