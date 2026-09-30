const form = document.getElementById("consulta-form");
const boton = form.querySelector("button");
const resultado = document.getElementById("resultado");
const badge = document.getElementById("resultado-badge");
const explicacion = document.getElementById("resultado-explicacion");
const crudo = document.getElementById("resultado-crudo");

// Reglas en el mismo orden de prioridad que usa app.py, para que la
// tarjeta nunca contradiga lo que decidió el backend.
const REGLAS = [
  {
    contiene: "DATOS INVALIDOS",
    tipo: "err",
    etiqueta: "Datos inválidos",
    explicacion: "El valor de la versión no es un número válido. Escribe solo números enteros, por ejemplo 2 o 3.",
  },
  {
    contiene: "VERSION NO RECONOCIDA",
    tipo: "err",
    etiqueta: "Versión futura",
    explicacion: "Esa versión todavía no existe: es un número mayor que la versión vigente de prueba.",
  },
  {
    contiene: "ROL DESCONOCIDO",
    tipo: "err",
    etiqueta: "Rol desconocido",
    explicacion: "El perfil ingresado no está permitido. Usa 'Solo lectura' o 'Edición'.",
  },
  {
    contiene: "VERSION ANTERIOR",
    tipo: "warn",
    etiqueta: "Versión anterior",
    explicacion: "Esta versión ya fue reemplazada por una más reciente. Consulta la versión vigente.",
  },
  {
    contiene: "EDICION HABILITADA",
    tipo: "ok",
    etiqueta: "Vigente · Edición",
    explicacion: "Esta es la versión vigente y tu perfil permite editarla.",
  },
  {
    contiene: "CONSULTA",
    tipo: "ok",
    etiqueta: "Vigente · Lectura",
    explicacion: "Esta es la versión vigente. Puedes consultarla, pero no editarla con este perfil.",
  },
];

function interpretar(textoBackend) {
  const texto = textoBackend.toUpperCase();
  for (const regla of REGLAS) {
    if (texto.includes(regla.contiene)) return regla;
  }
  return {
    tipo: "warn",
    etiqueta: "Estado no identificado",
    explicacion: "El servidor respondió algo que esta pantalla no sabe interpretar todavía. Revisa el texto completo abajo.",
  };
}

function mostrarResultado({ tipo, etiqueta, explicacion: texto }, crudoTexto) {
  resultado.hidden = false;
  resultado.dataset.tipo = tipo;
  badge.textContent = etiqueta;
  explicacion.textContent = texto;
  crudo.textContent = crudoTexto;
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const version = document.getElementById("version").value.trim();
  const perfil = document.getElementById("perfil").value;

  if (version === "" || perfil === "") {
    mostrarResultado(
      { tipo: "err", etiqueta: "Faltan datos", explicacion: "Completa la versión y selecciona un perfil antes de consultar." },
      ""
    );
    return;
  }

  boton.disabled = true;
  boton.textContent = "Consultando...";

  try {
    const params = new URLSearchParams({ version, perfil });
    const respuesta = await fetch(`/consultar?${params.toString()}`);
    if (!respuesta.ok) throw new Error(`El servidor respondió con el código ${respuesta.status}.`);
    const texto = await respuesta.text();
    mostrarResultado(interpretar(texto), texto);
  } catch (error) {
    mostrarResultado(
      {
        tipo: "err",
        etiqueta: "Sin conexión",
        explicacion: "No se pudo conectar con el servidor. Revisa que app.py esté corriendo.",
      },
      String(error)
    );
  } finally {
    boton.disabled = false;
    boton.textContent = "Consultar instrucción";
  }
});