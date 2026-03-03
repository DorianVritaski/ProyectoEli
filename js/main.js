import {
  db,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc
} from "./firebase.js";

const checkbox = document.getElementById('abrir-regalo');
const galeria = document.getElementById('galeria');
const formulario = document.getElementById('formulario');
const formRecuerdo = document.getElementById('form-recuerdo');
const gridGaleria = document.getElementById('grid-galeria');

// Elementos del Modal
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalMensaje = document.getElementById('modal-mensaje');
const modalFecha = document.getElementById('modal-fecha');
const btnCerrarModal = document.querySelector('.cerrar-modal');

// Elementos del Modal de Edición
const editModal = document.getElementById('edit-modal');
const formEditarRecuerdo = document.getElementById('form-editar-recuerdo');
const editId = document.getElementById('edit-id');
const editMensaje = document.getElementById('edit-mensaje');
const editFecha = document.getElementById('edit-fecha');
const btnCerrarEditModal = editModal.querySelector('.cerrar-modal');

// ☁️ CONFIGURACIÓN CLOUDINARY
const CLOUD_NAME = "dpoyzxlri"; // Ej: "dxyz123"
const UPLOAD_PRESET = "recuerdos_preset";  // Ej: "recuerdos_preset" (Debe ser Unsigned)

checkbox.addEventListener('change', () => {
  if (checkbox.checked) {
    galeria.classList.remove('oculto');
    formulario.classList.remove('oculto');
    cargarRecuerdos();
  }
});

async function cargarRecuerdos() {
  gridGaleria.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "recuerdos"));

  querySnapshot.forEach((doc) => {
    crearPolaroid(doc.data(), doc.id);
  });
}

function crearPolaroid(recuerdo, id) {
  const polaroid = document.createElement('div');
  polaroid.className = 'polaroid';
  polaroid.setAttribute('data-id', id);

  polaroid.innerHTML = `
    <div class="contenido-polaroid">
      <div class="foto">
        <img src="${recuerdo.imgUrl}" alt="recuerdo">
      </div>
      <div class="info">
        <p class="mensaje">${recuerdo.mensaje}</p>
        <span class="fecha">${recuerdo.fecha}</span>
      </div>
    </div>
    <div class="acciones">
      <button class="btn-editar" title="Editar">✏️</button>
      <button class="btn-eliminar" title="Eliminar">🗑️</button>
    </div>
  `;

  // Evento para abrir el modal al hacer clic en el contenido
  polaroid.querySelector('.contenido-polaroid').addEventListener('click', () => {
    abrirModal(recuerdo);
  });

  // Evento para eliminar
  polaroid.querySelector('.btn-eliminar').addEventListener('click', async (e) => {
    e.stopPropagation(); // Evita que se abra el modal de la imagen
    const confirmar = confirm("¿Estás seguro de que quieres eliminar este recuerdo?");
    if (confirmar) {
      await eliminarRecuerdo(id);
      polaroid.remove(); // Elimina el elemento del DOM para un feedback instantáneo
    }
  });

  // Evento para editar
  polaroid.querySelector('.btn-editar').addEventListener('click', (e) => {
    e.stopPropagation(); // Evita que se abra el modal de la imagen
    abrirModalEdicion(id, recuerdo);
  });

  gridGaleria.appendChild(polaroid);
}

formRecuerdo.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btnSubmit = formRecuerdo.querySelector('button[type="submit"]');
  const textoOriginal = btnSubmit.innerText;

  btnSubmit.disabled = true;
  btnSubmit.innerText = "Subiendo... ⏳";

  const file = document.getElementById('foto').files[0];
  const mensaje = document.getElementById('mensaje').value;
  const fecha = document.getElementById('fecha').value;

  if (!file) {
    btnSubmit.disabled = false;
    btnSubmit.innerText = textoOriginal;
    return;
  }

  try {
    // 1. Subir imagen a Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    console.log("Subiendo a Cloudinary...");
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error("Error al subir la imagen a Cloudinary");
    }

    const data = await response.json();
    const imgUrl = data.secure_url; // URL segura de la imagen
    console.log("Imagen subida:", imgUrl);

    console.log("Guardando datos en Firestore...");
    await addDoc(collection(db, "recuerdos"), {
      imgUrl,
      mensaje,
      fecha
    });

    formRecuerdo.reset();
    await cargarRecuerdos();
    alert("¡Recuerdo agregado con éxito! 💖");

  } catch (error) {
    console.error("Error al subir recuerdo:", error);
    alert("Error al subir: " + error.message);
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerText = textoOriginal;
  }
});

// 🖼️ Lógica del Modal
function abrirModal(recuerdo) {
  modalImg.src = recuerdo.imgUrl;
  modalMensaje.textContent = recuerdo.mensaje;
  modalFecha.textContent = recuerdo.fecha;
  modal.classList.remove('oculto');
}

btnCerrarModal.addEventListener('click', () => {
  modal.classList.add('oculto');
});

// Cerrar al hacer clic fuera de la imagen (en el fondo oscuro)
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('oculto');
  }
});

// 🗑️ Lógica de Eliminar
async function eliminarRecuerdo(id) {
  try {
    await deleteDoc(doc(db, "recuerdos", id));
    console.log("Recuerdo eliminado de Firestore con éxito.");
  } catch (error) {
    console.error("Error al eliminar el recuerdo:", error);
    alert("No se pudo eliminar el recuerdo.");
  }
}

// ✏️ Lógica de Editar
function abrirModalEdicion(id, recuerdo) {
  editId.value = id;
  editMensaje.value = recuerdo.mensaje;
  editFecha.value = recuerdo.fecha;
  editModal.classList.remove('oculto');
}

// Event listener para el formulario de edición
formEditarRecuerdo.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editId.value;
  const btnGuardar = formEditarRecuerdo.querySelector('button');
  const textoOriginal = btnGuardar.innerText;

  btnGuardar.disabled = true;
  btnGuardar.innerText = "Guardando...";

  const nuevosDatos = {
    mensaje: editMensaje.value,
    fecha: editFecha.value,
  };

  try {
    const docRef = doc(db, "recuerdos", id);
    await updateDoc(docRef, nuevosDatos);
    
    editModal.classList.add('oculto');
    await cargarRecuerdos(); // Recarga la galería para mostrar los cambios
    alert("Recuerdo actualizado con éxito.");
  } catch (error) {
    console.error("Error al actualizar:", error);
    alert("No se pudo actualizar el recuerdo.");
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.innerText = textoOriginal;
  }
});

// Cerrar modal de edición
btnCerrarEditModal.addEventListener('click', () => {
  editModal.classList.add('oculto');
});

editModal.addEventListener('click', (e) => {
  if (e.target === editModal) {
    editModal.classList.add('oculto');
  }
});
