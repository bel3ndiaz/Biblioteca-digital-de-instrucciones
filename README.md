# Documentación de `app.py` — Tarea 2: Impresos Múltiples

Esta aplicación Flask evalúa el **estado de una instrucción de trabajo**
según su versión y el perfil de quien la consulta. Es una versión mínima
para practicar `if/elif/else` dentro de una ruta Flask — **no** es el
prototipo empresarial completo del reto (sin base de datos, sin
autenticación real, sin carga de archivos).

## 1. Reglas de negocio y datos de prueba

| Elemento | Valor | Origen |
|---|---|---|
| Perfiles válidos | `lectura`, `edicion` | Confirmado por la ficha del reto |
| Historial de versiones por proceso | Existe | Confirmado por la ficha del reto |
| `VERSION_VIGENTE = 3` | Fija, hardcodeada | **Dato de prueba**, no confirmado por el Socio Formador. En la realidad probablemente depende de cada proceso, no es un valor único global. |

## 2. Estructura del código

```python
from flask import Flask, request

app = Flask(__name__)

VERSION_VIGENTE = 3
PERFILES_VALIDOS = ("lectura", "edicion")

@app.route("/consultar")
def consultar_instruccion():
    ...
```

- `Flask(__name__)` crea la aplicación.
- `VERSION_VIGENTE` y `PERFILES_VALIDOS` son constantes globales que centralizan
  los valores usados por la lógica, para no repetir números sueltos dentro de los `if`.
- La ruta `/consultar` es un **endpoint GET**: recibe los datos por
  *query string* (`?version=...&perfil=...`), no por formulario ni por body.

## 3. Parámetros de entrada

| Parámetro | Tipo esperado | Obligatorio | Ejemplo |
|---|---|---|---|
| `version` | Entero | Sí | `?version=3` |
| `perfil` | Texto: `lectura` o `edicion` | Sí | `&perfil=lectura` |

```python
version_texto = request.args.get("version")
perfil = request.args.get("perfil", "").strip().lower()
```

- `request.args.get("version")` devuelve `None` si el parámetro no viene en la URL.
- `perfil` se normaliza con `.strip().lower()` para que `"Lectura "` o `"LECTURA"`
  se traten igual que `"lectura"`.

## 4. Bloque 1 — Validación de formato

```python
if version_texto is None or not version_texto.isdigit():
    return "Estado: DATOS INVALIDOS. ..."

version = int(version_texto)
```

- Este `if` es independiente del resto: su único trabajo es asegurar que
  `version` sea convertible a entero **antes** de comparar nada.
- `.isdigit()` evita que `int()` truene con `ValueError` si alguien manda
  texto como `version=abc` o deja el parámetro vacío.
- Si la validación falla, la función retorna de inmediato (`return`), así que
  el resto del código nunca se ejecuta para datos inválidos.

## 5. Bloque 2 — Cadena `if/elif/else` de los estados

Una vez que `version` ya es un entero válido, se evalúa una **segunda cadena**
`if/elif/else` con este orden exacto y su razón de ser:

| Orden | Condición | Estado devuelto | Por qué va en esa posición |
|---|---|---|---|
| 1 | `version > VERSION_VIGENTE` | `VERSION NO RECONOCIDA (futura)` | Se revisa primero para que una versión futura **nunca** caiga por accidente en edición habilitada. |
| 2 | `perfil not in PERFILES_VALIDOS` | `ROL DESCONOCIDO` | Se revisa antes que los estados vigentes para que un perfil inválido tampoco reciba edición por defecto. |
| 3 | `version < VERSION_VIGENTE` | `VERSION ANTERIOR` | Aplica sin importar el perfil: una versión vieja siempre es "anterior". |
| 4 | `version == VERSION_VIGENTE and perfil == "lectura"` | `VERSION VIGENTE - CONSULTA` | Caso vigente de solo lectura. |
| 5 | `version == VERSION_VIGENTE and perfil == "edicion"` | `VERSION VIGENTE - EDICION HABILITADA` | Único caso que habilita edición, y solo llega aquí tras pasar todas las validaciones anteriores. |
| 6 | `else` | `CASO NO CONTEMPLADO` | Red de seguridad; en teoría nunca se alcanza, pero evita que la función termine sin devolver nada. |

**Por qué dos cadenas `if` separadas y no una sola:** la primera valida el
*formato* del dato (¿es un número?); la segunda evalúa el *significado* del
dato (¿qué estado le corresponde?). Mezclarlas habría obligado a convertir
`version` a entero dentro de un `elif`, lo cual no es válido en Python (el
`elif` no puede tener código intermedio entre el `if` anterior y él).

## 6. Ejecución del servidor

```python
if __name__ == "__main__":
    app.run(debug=True)
```

- `debug=True` activa el recargador automático y páginas de error detalladas;
  es útil en desarrollo, **no** se debe usar así en producción.
- Al ejecutar `python app.py`, Flask levanta un servidor local en
  `http://127.0.0.1:5000`.

## 7. Resumen de respuestas posibles

| Respuesta | Cuándo ocurre |
|---|---|
| `Estado: DATOS INVALIDOS.` | `version` ausente o no numérica |
| `Estado: VERSION NO RECONOCIDA (futura).` | `version > VERSION_VIGENTE` |
| `Estado: ROL DESCONOCIDO.` | `perfil` no es `lectura` ni `edicion` |
| `Estado: VERSION ANTERIOR.` | `version < VERSION_VIGENTE` |
| `Estado: VERSION VIGENTE - CONSULTA (solo lectura).` | `version == VERSION_VIGENTE` y `perfil == "lectura"` |
| `Estado: VERSION VIGENTE - EDICION HABILITADA.` | `version == VERSION_VIGENTE` y `perfil == "edicion"` |

## 8. Cómo probarlo rápido

```bash
pip install flask
python app.py
# En otra terminal, o en el navegador:
curl "http://127.0.0.1:5055/consultar?version=3&perfil=edicion"
```

Trabajo hecho por los integrantes 

- José Daniel Gregg: Código inicial del app.py, junto al archivo html y hoja de estilo.
- María Bleén Díaz: Código actualizado del app.py con nuevas funciones y archivo script.js
- Horacio Larios: Documentación del código y registro de los casos de prueba.
