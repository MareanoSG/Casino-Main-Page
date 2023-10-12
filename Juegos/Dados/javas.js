function MostrarInstrucciones() {
  document.getElementById("myModal").style.display = "flex";
  document.getElementById("myModal").classList.add("modal-active");
}
function closeModal() {
  document.getElementById("myModal").style.display = "none";
  document.getElementById("myModal").classList.remove("modal-active");
}
// Función para abrir el modal
function openBet() {
  document.getElementById("myBetModal").style.display = "flex";
  document.getElementById("myBetModal").classList.add("modal-active");
}

// Función para cerrar el modal
async function closeBet() {
  if (parseInt(betInput.value) > parseInt(await getUserPoints(user.id))) {
    alert("No puedes apostar tanto");
    return;
  }
  document.getElementById("myBetModal").style.display = "none";
  document.getElementById("myBetModal").classList.remove("modal-active");
}

let dineroDisponibleElement = document.getElementById('dineroDisponible');
let apuestaElement = document.getElementById('apuesta');
const usDadoElement = document.getElementById('usDado');
const resultElement = document.getElementById('result');
const botDado1Element = document.getElementById('botDado1');
const botDado2Element = document.getElementById('botDado2');
const instrucciones = document.getElementById('instrucciones');
let butn = 1;

const betInput = document.querySelector(".bet-input");

let user = JSON.parse(localStorage.getItem('user'));

function tirarDados() {
  const usDado = parseInt(usDadoElement.value);
  if (usDado > 12 || usDado < 2) {
    alert("Por favor introduzca un número acorde a los dados")
    return;
  }

  const dado1 = Math.floor(Math.random() * 6) + 1;
  document.querySelector("img.img1").setAttribute("src", "images/dice" + dado1 + ".png");

  const dado2 = Math.floor(Math.random() * 6) + 1;
  document.querySelector("img.img2").setAttribute("src", "images/dice" + dado2 + ".png");

  const total = dado1 + dado2;

  if (total == usDado) {
    document.getElementById("victoria").play();
    updateUserPoints(betInput.value)
    resultElement.textContent = '¡Has ganado!';
    actualizarPuntos();
  }
  else {
    document.getElementById("derrota").play();
    updateUserPoints(-betInput.value)
    resultElement.textContent = 'Has perdido.';
    actualizarPuntos();
  }
  actualizarPuntos();

}

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
