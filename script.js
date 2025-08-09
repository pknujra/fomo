

let timerStart = null;
let blinked = false;
let looking = false;
let gameRunning = false;
let highscore = parseFloat(localStorage.getItem("highscore")) || 0;

const EAR_THRESHOLD = 0.21;

function updateScores(lastScore) {
    document.getElementById("lastscore").textContent = `Last Score: ${lastScore.toFixed(2)}s`;

    if (lastScore > highscore) {
        highscore = lastScore;
        localStorage.setItem("highscore", highscore);
    }
    document.getElementById("highscore").textContent = `Highscore: ${highscore.toFixed(2)}s`;
}

function onResults(results) {
    if (!gameRunning) return;

    const timerElement = document.getElementById("timer");
    const statusElement = document.getElementById("status");

    if (results.multiFaceLandmarks.length > 0) {
        looking = true;
        statusElement.textContent = "Eye contact detected!";

        const landmarks = results.multiFaceLandmarks[0];
        const { leftEye, rightEye } = getEyeLandmarks(landmarks);

        const ear = (calcEAR(leftEye) + calcEAR(rightEye)) / 2.0;

        if (!timerStart) {
            timerStart = performance.now();
        }

        if (!blinked) {
            const elapsed = ((performance.now() - timerStart) / 1000);
            timerElement.textContent = `Time: ${elapsed.toFixed(2)}s`;
        }

        if (ear < EAR_THRESHOLD && !blinked) {
            blinked = true;
            const finalTime = ((performance.now() - timerStart) / 1000);
            statusElement.textContent = "😮 You blinked!";
            updateScores(finalTime);
            alert(`You blinked! Time: ${finalTime.toFixed(2)}s`);
            gameRunning = false;
        }
    } else {
        looking = false;
        statusElement.textContent = "Looking for your eyes...";
    }
}

// Eye animation movement
document.addEventListener("mousemove", e => {
    const eyes = document.querySelectorAll(".pupil");
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;

    eyes.forEach(pupil => {
        pupil.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
    });
});

// Start button
document.getElementById("startBtn").addEventListener("click", () => {
    blinked = false;
    timerStart = null;
    gameRunning = true;
    document.getElementById("timer").textContent = "Time: 0.00s";
    document.getElementById("status").textContent = "Looking for your eyes...";
});

// Video toggle
document.getElementById("toggleVideo").addEventListener("change", e => {
    const video = document.getElementById("video");
    video.style.display = e.target.checked ? "block" : "none";
});

document.getElementById("highscore").textContent = `Highscore: ${highscore.toFixed(2)}s`;

const faceMesh = new FaceMesh({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true });
faceMesh.onResults(onResults);

const videoElement = document.getElementById("video");
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480
});
camera.start();
