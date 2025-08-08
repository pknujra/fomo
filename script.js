let timerStart = null;
let blinked = false;
let looking = false;
const EAR_THRESHOLD = 0.21;

function onResults(results) {
    const videoElement = document.getElementById("video");
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
            const elapsed = ((performance.now() - timerStart) / 1000).toFixed(2);
            timerElement.textContent = `Time: ${elapsed}s`;
        }

        if (ear < EAR_THRESHOLD && !blinked) {
            blinked = true;
            const finalTime = ((performance.now() - timerStart) / 1000).toFixed(2);
            statusElement.textContent = "😮 You blinked!";
            alert(`You blinked! Time: ${finalTime}s`);
        }
    } else {
        looking = false;
        statusElement.textContent = "Looking for your eyes...";
    }
}

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
