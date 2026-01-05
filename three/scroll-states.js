// Scroll-Driven State Mapping Functions
// These functions map scroll progress (0-1) to specific scene states

/**
 * Get leak intensity based on scroll progress
 * 0.2-0.4: Leak appears (0→1)
 * 0.4-0.75: Full leak (1.0)
 * 0.75-0.9: Leak seals (1→0)
 * Outside: No leak (0)
 */
function getLeakIntensity(progress) {
    if (progress < 0.2) return 0;
    if (progress < 0.4) {
        // Fade in: 0.2 → 0.4
        const t = (progress - 0.2) / 0.2;
        return easeInOut(t);
    }
    if (progress < 0.75) return 1.0; // Full leak
    if (progress < 0.9) {
        // Fade out: 0.75 → 0.9
        const t = (progress - 0.75) / 0.15;
        return 1 - easeInOut(t);
    }
    return 0;
}

/**
 * Get water degradation amount (color change)
 * 0.4-0.6: Water degrades blue → brownish
 * 0.6+: Stay degraded
 */
function getWaterDegradation(progress) {
    if (progress < 0.4) return 0;
    if (progress < 0.6) {
        const t = (progress - 0.4) / 0.2;
        return easeInOut(t);
    }
    return 1.0; // Fully degraded
}

/**
 * Get water level drop amount
 * 0.4-0.6: Water level drops
 * 0.6+: Stay at dropped level
 */
function getWaterLevelDrop(progress) {
    if (progress < 0.4) return 0;
    if (progress < 0.6) {
        const t = (progress - 0.4) / 0.2;
        return easeInOut(t);
    }
    return 1.0; // Fully dropped
}

/**
 * Get sensor slide-in progress
 * 0.6-0.7: Sensors slide in
 * 0.7+: Sensors fully attached
 */
function getSensorProgress(progress) {
    if (progress < 0.6) return 0;
    if (progress < 0.7) {
        const t = (progress - 0.6) / 0.1;
        return easeInOut(t);
    }
    return 1.0; // Fully in
}

/**
 * Get dashboard visibility
 * 0.6-0.9: Dashboard visible
 * Outside: Hidden
 */
function getDashboardState(progress) {
    if (progress >= 0.6 && progress < 0.9) {
        return {
            visible: true,
            isAnalyzing: progress >= 0.7, // Amber after 0.7
            isAlert: progress < 0.7 // Red before 0.7
        };
    }
    return { visible: false, isAnalyzing: false, isAlert: false };
}

/**
 * Get camera position and target for scroll progress
 * Preserves cinematic zoom effect
 * 0-0.2: Wide view
 * 0.2-0.65: Zoom in to leak
 * 0.65+: Hold zoomed position
 * 
 * Respects CAMERA_OVERRIDE flag - does not update camera when override is active
 */
function getCameraForScroll(progress) {
    // Check if camera override is active (OrbitControls has control)
    if (window.CAMERA_OVERRIDE) {
        // Return current camera state without modifying it
        return null; // Signal that camera should not be updated
    }

    // Wide view positions
    const widePos = new THREE.Vector3(12, 11, 19);
    const wideTarget = new THREE.Vector3(0, 2, 0);

    // Close view positions (zoomed on leak) - will be set from actual crack position
    const closePos = new THREE.Vector3(); // To be filled from cameraFinalPos
    const closeTarget = new THREE.Vector3(); // To be filled from camera target during zoom

    if (progress < 0.2) {
        return { pos: widePos.clone(), target: wideTarget.clone() };
    } else if (progress < 0.65) {
        // Interpolate zoom: 0.2 → 0.65
        const zoomProgress = (progress - 0.2) / 0.45;
        const t = easeInOut(zoomProgress);

        return {
            pos: lerpVector3(widePos, closePos, t),
            target: lerpVector3(wideTarget, closeTarget, t),
            zoomProgress: t
        };
    } else {
        // Hold zoomed position
        return { pos: closePos.clone(), target: closeTarget.clone(), zoomProgress: 1 };
    }
}

/**
 * Apply camera updates from scroll state
 * Wraps all camera.position and camera.lookAt updates with CAMERA_OVERRIDE check
 */
function applyCameraFromScroll(camera, cameraState) {
    if (!window.CAMERA_OVERRIDE && cameraState) {
        camera.position.copy(cameraState.pos);
        camera.lookAt(cameraState.target);
    }
}
