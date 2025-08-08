// Calculate Eye Aspect Ratio (EAR)
function calcEAR(eye) {
    const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
    return (dist(eye[1], eye[5]) + dist(eye[2], eye[4])) /
           (2.0 * dist(eye[0], eye[3]));
}

// Extract eye landmarks from MediaPipe FaceMesh results
function getEyeLandmarks(landmarks) {
    const leftEyeIdx = [33, 160, 158, 133, 153, 144];
    const rightEyeIdx = [362, 385, 387, 263, 373, 380];

    const leftEye = leftEyeIdx.map(i => landmarks[i]);
    const rightEye = rightEyeIdx.map(i => landmarks[i]);

    return { leftEye, rightEye };
}

