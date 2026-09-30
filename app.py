from flask import Flask, request, render_template

app = Flask(__name__)

# --- Dato de prueba, no regla de negocio confirmada ---
VERSION_VIGENTE = 3

# --- Perfiles validos segun la ficha del reto ---
PERFILES_VALIDOS = ("lectura", "edicion")

@app.route("/")
def inicio():
    """
    Sirve la pantalla HTML con el formulario. Esta ruta no evalua nada:
    solo entrega la pagina. 
    """
    return render_template("consultar.html")

@app.route("/consultar")
def consultar_instruccion():
    """
    Evalua el estado de una instruccion de trabajo segun su version
    y el perfil de quien la consulta.

    Parametros esperados en la URL (query string):
        version : numero entero de la version consultada. Ej: ?version=3
        perfil  : "lectura" o "edicion". Ej: &perfil=lectura
    """

    # Leemos los parametros tal como llegan (texto), sin asumir que son validos.
    version_texto = request.args.get("version")
    perfil = request.args.get("perfil", "").strip().lower()

    # 1) Primero validamos que 'version' exista y sea un numero entero.
    #    Si no se cumple, respondemos de una vez y no seguimos evaluando nada mas.
    if version_texto is None or not version_texto.isdigit():
        return (
            "Estado: DATOS INVALIDOS. "
            "El parametro 'version' es obligatorio y debe ser un numero entero "
            "(ejemplo: /consultar?version=3&perfil=lectura)."
        )

    version = int(version_texto)

    # A partir de aqui 'version' ya es un numero valido, asi que evaluamos
    # los estados con una segunda cadena if/elif/else.

    # 2) Version futura: todavia no existe. No se asume ningun permiso
    #    especial solo porque el numero sea mayor al vigente.
    if version > VERSION_VIGENTE:
        return (
            f"Estado: VERSION NO RECONOCIDA (futura). "
            f"La version {version} aun no existe. "
            f"Version vigente de prueba: {VERSION_VIGENTE}."
        )


