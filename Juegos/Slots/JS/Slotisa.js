const betInput = document.querySelector(".bet-input");
let canClick = true; // Variable de control para habilitar o deshabilitar el clic

let user = JSON.parse(localStorage.getItem('user'));

const iconos = [];

const image1 = "imagenes/bell.png";
iconos.push(image1);

const image2 = "imagenes/diamond.png";
iconos.push(image2);

const image3 = "imagenes/siete.png";
iconos.push(image3);

const inicio = document.getElementById("inicio");

const gif1 = document.getElementById("gif1");
const gif2 = document.getElementById("gif2");
const gif3 = document.getElementById("gif3");


const boton = document.getElementById("boton");
const palancaAbajo = document.getElementById("palancaAbajo")

window.addEventListener('resize', function () {
  var ventanaAncho = window.innerWidth;
  var imagen = document.getElementById('boton');

  if (ventanaAncho < 800) {
    imagen.src = './imagenes/tirar.png';
  } else {
    imagen.src = './imagenes/Palanca-Arriba.png';
  }
});

boton.addEventListener("mousedown", function () {
  inicio.style.display = "flex";
  boton.style.display = "none";
  palancaAbajo.style.display = "block";
  tirada();

  const audioPalanca = document.getElementById("audioPalanca");
  audioPalanca.play();
});

palancaAbajo.addEventListener("mouseup", function () {
  boton.style.display = "block"
  palancaAbajo.style.display = "none"
});

const audioJackpot = document.getElementById("audio-jackpot");

function tirada() {
  if (!canClick) {
    return; // Si no se puede hacer clic, sal de la función
  }
  gif1.style.display = "inline"
  gif2.style.display = "inline"
  gif3.style.display = "inline"

  audioJackpot.play();

  const random1 = Math.floor(Math.random() * iconos.length);
  const random2 = Math.floor(Math.random() * iconos.length);
  const random3 = Math.floor(Math.random() * iconos.length);

  const randomIconos1 = iconos[random1];
  const randomIconos2 = iconos[random2];
  const randomIconos3 = iconos[random3];

  const imagen1 = document.querySelector(".imagen1");
  imagen1.style.display = "none";

  const imagen2 = document.querySelector(".imagen2");
  imagen2.style.display = "none";

  const imagen3 = document.querySelector(".imagen3");
  imagen3.style.display = "none";

  setTimeout(function () {
    imagen1.src = randomIconos1;
    gif1.style.display = "none";
    imagen1.style.display = "inline"
  }, 1000);

  setTimeout(function () {
    imagen2.src = randomIconos2;
    gif2.style.display = "none";
    imagen2.style.display = "inline"
  }, 3000);

  setTimeout(function () {
    imagen3.src = randomIconos3;
    gif3.style.display = "none";
    imagen3.style.display = "inline"
  }, 5000);

  console.log(imagen1);
  console.log(imagen2);
  console.log(imagen3);

  const audioGanaste = document.getElementById("audio-ganaste");
  const audioPerdiste = document.getElementById("audio-perdiste");
  const mensajeContainer = document.getElementById("mensajeContainer");
  mensajeContainer.innerHTML = "";

  setTimeout(function () {
    if (randomIconos1 == randomIconos2 && randomIconos2 == randomIconos3) {
      const mensaje = document.createElement("p");
      mensaje.classList.add("ganaste");
      mensaje.textContent = "¡Ganaste!";
      mensajeContainer.appendChild(mensaje);
      updateUserPoints(betInput.value)
      actualizarPuntos();

      audioGanaste.play();

      setTimeout(function () {
        mensajeContainer.removeChild(mensaje);
      }, 4000)
    }
    else {
      const mensaje = document.createElement("p");
      mensaje.classList.add("perdiste");
      mensaje.textContent = "¡Intentalo de nuevo!";
      mensajeContainer.appendChild(mensaje);
      updateUserPoints(-betInput.value)
      actualizarPuntos();

      
      audioPerdiste.play();
      setTimeout(function () {
        mensajeContainer.removeChild(mensaje);
      }, 4000)
    }
  }, 5300);

  // Deshabilita el clic durante 5 segundos
  canClick = false;
  setTimeout(function () {
    canClick = true; // Habilita el clic nuevamente después de 5 segundos
  }, 3000); // 5000 milisegundos (5 segundos)
}

function instrucciones() {
  var textoInstrucciones = document.getElementById('texto-instrucciones');
  if (textoInstrucciones.style.display === 'none') {
    textoInstrucciones.style.display = 'block';
  } else {
    textoInstrucciones.style.display = 'none';
  }
}

// Function to update user points using fetch
async function updateUserPoints(pointsToAddOrSubtract) {
  const apiUrl = "http://localhost/server/";
  const requestOptions = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: user.id,
      points: pointsToAddOrSubtract,
    }),
  };

  try {
    response = await fetch(apiUrl, requestOptions)

    if (response.ok) {
      // Points updated successfully
      console.log("Points updated successfully");
      const id = user.id;
      const points = await getUserPoints(id);
      user = { id, points };
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      // Handle the error here
      console.error("Error updating points");
    }
  }
  catch (error) {
    // Handle network or other errors
    console.error("Error updating points:", error);
  }
}

async function getUserPoints(username) {
  const apiUrl = `http://localhost/server/?username=${username}`;

  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      return data.points;
    } else {
      // Handle the error here
      console.error("Error getting user points");
      return null;
    }
  } catch (error) {
    // Handle network or other errors
    console.error("Error getting user points:", error);
    throw error;
  }
}

actualizarPuntos();
async function actualizarPuntos() {
  try {
    const puntos = await getUserPoints(user.id);
    document.getElementById("ptstotales__text").textContent = 'Puntos: ' + puntos;
  } catch (error) {
    console.error("Error al obtener los puntos:", error);
  }
}
