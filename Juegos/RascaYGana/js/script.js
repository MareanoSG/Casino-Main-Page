let user = JSON.parse(localStorage.getItem('user'));
const betInput = document.querySelector(".bet-input");

const resultDiv = document.getElementById("result-div")
let finished = false;

let numbers;
let ticketNumbers;

let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let painting = new Image();
painting.src = "resources/ticket-paint.png";
painting.onload = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    context.drawImage(painting, 0, 0);

    //Da un random en el ticket
    numbers = []
    ticketNumbers = Array.from(document.getElementsByClassName("ticket-number"))
    ticketNumbers.forEach(element => {
        let randomNumber = Math.floor(Math.random() * 4 + 1)
        element.textContent = randomNumber
        element.style.color = getRandomColor();
        numbers.push(randomNumber) //es una funcion por ende va con parentesis
        //playScratchSound();
    });
};



let isPainting = false;
let prevX, prevY; // Previous mouse position
let canBet = true;

function scratchPaint(event) {
    canBet = false;
    if (isPainting && !finished) {
        playScratchSound()
        let radius = 50;
        let rect = canvas.getBoundingClientRect();


        if (event.type === 'mousemove') {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        } else if (event.type === 'touchmove') {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        }
        context.save(); // Save the current context state

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.clip();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.closePath();

        context.restore(); // Restore the previous context state

        // Check if the previous position is available
        if (prevX !== undefined && prevY !== undefined) {
            // Calculate the distance between the current and previous position
            const dx = x - prevX;
            const dy = y - prevY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calculate the number of steps for smoothing
            const steps = Math.ceil(distance / (radius / 2));

            // Perform line interpolation for smoother scratching
            for (let i = 0; i < steps; i++) {
                const interpX = prevX + (dx / steps) * i;
                const interpY = prevY + (dy / steps) * i;
                context.clearRect(interpX - radius / 2, interpY - radius / 2, radius, radius);
            }
        } else {
            // Clear the current position without interpolation for the first point
            context.clearRect(x - radius / 2, y - radius / 2, radius, radius);
        }

        // Update the previous position
        prevX = x;
        prevY = y;

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const pixelCount = data.length / 4;
        let clearedPixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
            // Check if the pixel is fully transparent
            if (data[i + 3] === 0) {
                clearedPixelCount++;
            }
        }

        if ((clearedPixelCount / pixelCount) * 100 < 99) return;

        finished = true;
        if (numbers.every((num) => num == numbers[0])) {
            resultDiv.innerHTML += '<img src="resources/win-img.png" alt="" id="result-img">'
            document.getElementById("my-canvas").style.display = "block";
            playWinSound();
            updateUserPoints(betInput.value)
            actualizarPuntos();
        }
        else {
            resultDiv.innerHTML += '<img src="resources/lose-img.png" alt="" id="result-img">'
            document.getElementById("my-canvas").style.display = "none";
            playLoseSound();
            updateUserPoints(-betInput.value)
            actualizarPuntos();
        }
        setTimeout(() => {
            resetGame()
        }, 3000)
    }
}

function resetGame() {
    document.getElementById("my-canvas").style.display = "none";
    finished = false
    numbers = []
    resultDiv.innerHTML = ""
    ticketNumbers.forEach(element => {
        let randomNumber = Math.floor(Math.random() * 4 + 1)
        element.textContent = randomNumber
        element.style.color = getRandomColor();
        numbers.push(randomNumber) //es una funcion por ende va con parentesis
        //playScratchSound();
    });
    let context = canvas.getContext("2d");
    let painting = new Image();
    painting.src = "resources/ticket-paint.png";
    painting.onload = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        context.drawImage(painting, 0, 0);
    };
}

canvas.addEventListener("mousedown", function (event) {
    isPainting = true;
    prevX = undefined; // Reset the previous position
    prevY = undefined;
});
canvas.addEventListener("mouseup", function (event) {
    isPainting = false;
});

canvas.addEventListener("mousemove", scratchPaint);


canvas.addEventListener("touchstart", function (event) {
    event.preventDefault(); // Prevent default touch behavior
    isPainting = true;
    prevX = undefined; // Reset the previous position
    prevY = undefined;
});

canvas.addEventListener("touchend", function (event) {
    event.preventDefault(); // Prevent default touch behavior
    isPainting = false;
});

canvas.addEventListener("touchmove", scratchPaint);



function playWinSound() {
    const winSound = document.getElementById('winSound');
    winSound.currentTime = 0; // Reinicia el audio a la posición inicial
    winSound.play();
}

function playLoseSound() {
    const loseSound = document.getElementById('loseSound');
    loseSound.currentTime = 0;
    loseSound.play();
}

function playScratchSound() {
    const scratchSound = document.getElementById('scratchSound');
    scratchSound.currentTime = 0;
    scratchSound.play();
}

function getRandomColor() {
    const colors = ["red", "orange", "yellow", "green", "black", "purple", "pink", "violet", "magenta", "lime", "hot pink", "gold", "fuchsia"];
    let color = colors[Math.floor(Math.random() * colors.length)];

    return color;
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
