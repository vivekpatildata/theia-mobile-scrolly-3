// Chapter 7 - Dual Vessel Animation: AKADEMIK GUBKIN + EQUALITY
// OPTIMIZED & RESTRUCTURED: Following Chapter 6 pattern with STS detection
// Context: AKADEMIK GUBKIN conducted STS on Oct 4th with EQUALITY (IMO: 9216547)
// EQUALITY ran dark (AIS off from Oct 3 20:28 UTC to Oct 5 14:25 UTC)
// Detection: STS operation detected at 20.7978°N, 75.5943°W

function animateChapter7New(map, akademikData, equalityData, vesselMarker, vessel3Marker, config = {}) {
    console.log('🎬 Chapter 7: Starting DARK STS OPERATION animation...');
    
    // ============================================================================
    // CONFIGURATION SETTINGS
    // ============================================================================
    
    const settings = {
        animationDuration: config.duration || 6000, // 6 seconds total - ORIGINAL
        akademikDuration: config.akademikDuration || 5000, // ORIGINAL
        equalityDuration: config.equalityDuration || 6000, // ORIGINAL
        vessel1Color: config.vessel1Color || '#00ff88',
        vessel3Color: config.vessel3Color || '#ff6b9d',
        lineWidth: config.lineWidth || 3,
        glowWidth: config.glowWidth || 8,
        glowOpacity: config.glowOpacity || 0.35,
        fadeInDuration: config.fadeInDuration || 300, // ORIGINAL
        initialDelay: config.initialDelay || 100, // ORIGINAL
        ...config
    };
    
    // ============================================================================
    // SOURCE AND LAYER IDs
    // ============================================================================
    
    const akademikSourceId = 'chapter7-akademik-source';
    const akademikLayerId = 'chapter7-akademik-layer';
    const akademikGlowId = 'chapter7-akademik-glow';
    
    const equalitySourceId = 'chapter7-equality-source';
    const equalityLayerId = 'chapter7-equality-layer';
    const equalityGlowId = 'chapter7-equality-glow';
    
    // ============================================================================
    // DETECTION POINT - STS LOCATION
    // ============================================================================
    
    const stsLocation = [-75.5943, 20.7978];
    const detectionPoint = {
        coords: stsLocation,
        label: 'DARK STS OPERATION',
        image: 'image3A.png', // Placeholder satellite image
        popupOffset: [120, -50],
        markerColor: '#cc0000',
        glowColor: '#cc0000',
        isDark: true
    };
    
    // ============================================================================
    // STATE VARIABLES
    // ============================================================================
    
    const akademikCoords = akademikData.features[0].geometry.coordinates;
    const equalityCoords = equalityData.features[0].geometry.coordinates;
    
    let animationFrameId = null;
    let isPaused = false;
    let isStopped = false;
    let startTime = null;
    let chapter7CleanupCallbacks = [];
    let stsMarker = null;
    let detectionMarker = null;
    let detectionPopup = null;
    let shownDetection = false;
    let popupDelayTimeout = null; // NEW: Track popup delay timeout
    
    console.log(`  AKADEMIK GUBKIN points: ${akademikCoords.length}`);
    console.log(`  EQUALITY points: ${equalityCoords.length}`);
    console.log(`  STS Detection at: ${stsLocation[1].toFixed(4)}°N, ${Math.abs(stsLocation[0]).toFixed(4)}°W`);
    
    // ============================================================================
    // CSS INJECTION - MATCHING CHAPTER 6 STYLES
    // ============================================================================
    
    function injectStyles() {
        if (document.getElementById('chapter7-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'chapter7-styles';
        styleElement.textContent = `
            .chapter7-detection-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                pointer-events: none;
            }
            
            .chapter7-marker-core {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 14px;
                height: 14px;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                animation: chapter7-marker-pulse 2s ease-in-out infinite;
            }
            
            .chapter7-marker-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 32px;
                height: 32px;
                border: 2px solid;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: chapter7-ring-expand 3s ease-out infinite;
            }
            
            @keyframes chapter7-marker-pulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
            }
            
            @keyframes chapter7-ring-expand {
                0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
            }
            
            .sts-dark-zone {
                position: absolute;
                transform: translate(-50%, -50%);
                width: 120px;
                height: 120px;
                pointer-events: none;
            }
            
            .sts-dark-glow {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100%;
                height: 100%;
                transform: translate(-50%, -50%);
                background: radial-gradient(circle, rgba(204, 0, 0, 0.2) 0%, rgba(204, 0, 0, 0.12) 40%, transparent 70%);
                border-radius: 50%;
                animation: sts-dark-pulse 4s ease-in-out infinite;
            }
            
            .sts-dark-ring-1 {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 60px;
                height: 60px;
                border: 1px solid rgba(204, 0, 0, 0.35);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: sts-dark-ring-1 5s ease-out infinite;
            }
            
            .sts-dark-ring-2 {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 80px;
                height: 80px;
                border: 1px solid rgba(204, 0, 0, 0.25);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: sts-dark-ring-2 5s ease-out infinite 1s;
            }
            
            .sts-dark-ring-3 {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100px;
                height: 100px;
                border: 1px solid rgba(204, 0, 0, 0.18);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: sts-dark-ring-3 5s ease-out infinite 2s;
            }
            
            .sts-dark-center-dot {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 8px;
                height: 8px;
                transform: translate(-50%, -50%);
                background: rgba(204, 0, 0, 0.5);
                border-radius: 50%;
                box-shadow: 0 0 15px rgba(204, 0, 0, 0.4);
                animation: sts-dark-dot-breathe 3s ease-in-out infinite;
            }
            
            @keyframes sts-dark-pulse {
                0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
                50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.05); }
            }
            
            @keyframes sts-dark-ring-1 {
                0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5; }
                100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
            }
            
            @keyframes sts-dark-ring-2 {
                0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.4; }
                100% { transform: translate(-50%, -50%) scale(1.9); opacity: 0; }
            }
            
            @keyframes sts-dark-ring-3 {
                0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.3; }
                100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }
            
            @keyframes sts-dark-dot-breathe {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.9; }
            }
            
            .chapter7-popup .mapboxgl-popup-content {
                padding: 0;
                border-radius: 8px;
                overflow: hidden;
                background: white;
                border: 2px solid;
            }
            
            .chapter7-popup .mapboxgl-popup-tip {
                display: none !important;
            }
            
            .chapter7-popup.dark-glow .mapboxgl-popup-content {
                border-color: rgba(204, 0, 0, 0.7);
                box-shadow: 0 0 80px rgba(204, 0, 0, 0.7), 0 0 150px rgba(204, 0, 0, 0.4), 0 0 220px rgba(204, 0, 0, 0.2);
            }
            
            .chapter7-popup .enhanced-popup .annotation-img {
                width: 160px !important;
                height: 160px !important;
                object-fit: cover !important;
                display: block;
                border-radius: 4px;
            }
            
            .chapter7-popup .enhanced-popup {
                position: relative;
            }
            
            @media screen and (max-width: 768px) {
                .chapter7-popup .enhanced-popup .annotation-img {
                    width: 145px !important;
                    height: 152px !important;
                }
                .chapter7-detection-marker { width: 36px; height: 36px; }
                .sts-dark-zone { width: 100px; height: 100px; }
                .sts-dark-ring-1 { width: 50px; height: 50px; }
                .sts-dark-ring-2 { width: 70px; height: 70px; }
                .sts-dark-ring-3 { width: 85px; height: 85px; }
            }
            
            @media screen and (max-width: 480px) {
                .chapter7-popup .enhanced-popup .annotation-img {
                    width: 130px !important;
                    height: 118px !important;
                }
                .chapter7-detection-marker { width: 32px; height: 32px; }
                .sts-dark-zone { width: 80px; height: 80px; }
                .sts-dark-center-dot { width: 6px; height: 6px; }
            }
            
            @media screen and (min-width: 769px) {
                .chapter7-popup .enhanced-popup .annotation-img {
                    width: 180px !important;
                    height: 180px !important;
                }
            }
        `;
        document.head.appendChild(styleElement);
        
        chapter7CleanupCallbacks.push(() => {
            if (styleElement && styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
        });
    }
    
    injectStyles();
    
    // ============================================================================
    // COMPREHENSIVE CLEANUP FUNCTION
    // ============================================================================
    
    const cleanup = () => {
        console.log('🧹 Chapter 7: Comprehensive cleanup starting...');
        
        // CRITICAL: Stop all activity immediately
        isStopped = true;
        
        // CRITICAL: Clear popup delay timeout immediately
        if (popupDelayTimeout) {
            clearTimeout(popupDelayTimeout);
            popupDelayTimeout = null;
            console.log('  ✓ Popup delay timeout cleared');
        }
        
        // Stop animation
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Remove popup IMMEDIATELY - this prevents carryover
        if (detectionPopup) {
            try {
                detectionPopup.remove();
                console.log('  ✓ Popup removed');
            } catch (e) {
                console.warn('Error removing popup:', e);
            }
            detectionPopup = null;
        }
        
        // FORCE remove ALL Chapter 7 popups from DOM
        document.querySelectorAll('.chapter7-popup').forEach(el => {
            el.remove();
            console.log('  ✓ Force removed popup from DOM');
        });
        
        // Remove ALL mapbox popups that might be lingering
        document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
            // Only remove if it's a chapter7 popup
            if (popup.classList.contains('chapter7-popup') || 
                popup.querySelector('.enhanced-popup')) {
                popup.remove();
                console.log('  ✓ Force removed mapbox popup');
            }
        });
        
        // Remove detection marker
        if (detectionMarker) {
            try {
                detectionMarker.remove();
            } catch (e) {
                console.warn('Error removing detection marker:', e);
            }
            detectionMarker = null;
        }
        
        // Remove STS marker
        if (stsMarker) {
            try {
                stsMarker.remove();
            } catch (e) {
                console.warn('Error removing STS marker:', e);
            }
            stsMarker = null;
        }
        
        // Hide Chapter 7 layers
        if (map.getLayer(akademikLayerId)) {
            map.setPaintProperty(akademikLayerId, 'line-opacity', 0);
            map.setPaintProperty(akademikGlowId, 'line-opacity', 0);
        }
        if (map.getLayer(equalityLayerId)) {
            map.setPaintProperty(equalityLayerId, 'line-opacity', 0);
            map.setPaintProperty(equalityGlowId, 'line-opacity', 0);
        }
        
        // Remove all chapter7 DOM elements
        document.querySelectorAll('.chapter7-detection-marker').forEach(el => el.remove());
        document.querySelectorAll('.sts-dark-zone').forEach(el => el.remove());
        document.querySelectorAll('[class*="chapter7"]').forEach(el => {
            if (!el.id || el.id !== 'chapter7-styles') {
                el.remove();
            }
        });
        
        // Run all registered cleanup callbacks
        chapter7CleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (e) {
                console.warn('Chapter 7 cleanup callback error:', e);
            }
        });
        chapter7CleanupCallbacks = [];
        
        // Clear state
        shownDetection = false;
        startTime = null;
        
        console.log('✅ Chapter 7: Cleanup complete');
    };
    
    // ============================================================================
    // DETECTION MARKER CREATION
    // ============================================================================
    
    function createDetectionMarker() {
        const el = document.createElement('div');
        el.className = 'chapter7-detection-marker';
        el.innerHTML = `
            <div class="chapter7-marker-core" style="background: ${detectionPoint.markerColor}; box-shadow: 0 0 20px ${detectionPoint.markerColor};"></div>
            <div class="chapter7-marker-ring" style="border-color: ${detectionPoint.markerColor};"></div>
        `;
        
        const marker = new mapboxgl.Marker(el)
            .setLngLat(detectionPoint.coords)
            .addTo(map);
        
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.4s ease';
        
        detectionMarker = marker;
        
        chapter7CleanupCallbacks.push(() => {
            marker.remove();
        });
        
        return marker;
    }
    
    // ============================================================================
    // STS ZONE MARKER CREATION
    // ============================================================================
    
    function createSTSZone() {
        if (stsMarker) return;
        
        const el = document.createElement('div');
        el.className = 'sts-dark-zone';
        el.innerHTML = `
            <div class="sts-dark-glow"></div>
            <div class="sts-dark-ring-1"></div>
            <div class="sts-dark-ring-2"></div>
            <div class="sts-dark-ring-3"></div>
            <div class="sts-dark-center-dot"></div>
        `;
        
        stsMarker = new mapboxgl.Marker(el)
            .setLngLat(stsLocation)
            .addTo(map);
        
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.6s ease';
        
        setTimeout(() => {
            el.style.opacity = '1';
        }, 200);
        
        chapter7CleanupCallbacks.push(() => {
            if (stsMarker) {
                stsMarker.remove();
            }
        });
        
        console.log('✅ STS dark zone marker created');
    }
    
    // ============================================================================
    // SHOW DETECTION WITH POPUP - IMAGE ONLY, NO LABELS
    // DELAYED BY 2 SECONDS TO PREVENT FAST SCROLL CARRYOVER
    // ============================================================================
    
    function showDetection() {
        if (shownDetection) return;
        shownDetection = true;
        
        // Create detection marker if not exists
        if (!detectionMarker) {
            createDetectionMarker();
        }
        
        // Show marker
        const markerEl = detectionMarker.getElement();
        markerEl.style.opacity = '1';
        
        // CRITICAL: 3-SECOND DELAY before showing popup
        // This prevents popup from carrying over during fast scrolls
        popupDelayTimeout = setTimeout(() => {
            // Double-check we haven't been cleaned up
            if (isStopped || !detectionMarker) {
                console.log('  ⚠️ Popup cancelled - chapter changed');
                return;
            }
            
            const popupClass = 'chapter7-popup dark-glow';
            const popupHtml = `
                <div class="enhanced-popup">
                    <img src="${detectionPoint.image}" class="annotation-img" alt="${detectionPoint.label}">
                </div>
            `;
            
            detectionPopup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: detectionPoint.popupOffset,
                className: popupClass,
                maxWidth: 'none'
            })
                .setLngLat(detectionPoint.coords)
                .setHTML(popupHtml)
                .addTo(map);
            
            chapter7CleanupCallbacks.push(() => {
                if (detectionPopup) {
                    detectionPopup.remove();
                }
            });
            
            console.log('✅ Dark STS detection popup shown (after 3s delay)');
        }, 3000); // 3-SECOND DELAY
        
        // Register cleanup for the timeout
        chapter7CleanupCallbacks.push(() => {
            if (popupDelayTimeout) {
                clearTimeout(popupDelayTimeout);
                popupDelayTimeout = null;
            }
        });
        
        console.log('✅ Dark STS detection marker shown (popup delayed 2s)');
    }
    
    // ============================================================================
    // ANIMATION SETUP
    // ============================================================================
    
    // Initialize layers with zero opacity
    if (map.getLayer(akademikLayerId)) {
        map.setPaintProperty(akademikLayerId, 'line-opacity', 0);
        map.setPaintProperty(akademikGlowId, 'line-opacity', 0);
    }
    
    if (map.getLayer(equalityLayerId)) {
        map.setPaintProperty(equalityLayerId, 'line-opacity', 0);
        map.setPaintProperty(equalityGlowId, 'line-opacity', 0);
    }
    
    // Fade in layers
    setTimeout(() => {
        if (map.getLayer(akademikLayerId)) {
            animateLayerOpacity(akademikLayerId, 0.75, settings.fadeInDuration);
            animateLayerOpacity(akademikGlowId, 0.35, settings.fadeInDuration);
        }
        if (map.getLayer(equalityLayerId)) {
            animateLayerOpacity(equalityLayerId, 0.75, settings.fadeInDuration);
            animateLayerOpacity(equalityGlowId, 0.35, settings.fadeInDuration);
        }
    }, settings.initialDelay);
    
    function animateLayerOpacity(layerId, targetOpacity, duration) {
        const startOpacity = map.getPaintProperty(layerId, 'line-opacity') || 0;
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            const currentOpacity = startOpacity + (targetOpacity - startOpacity) * eased;
            
            try {
                map.setPaintProperty(layerId, 'line-opacity', currentOpacity);
            } catch (e) {
                return;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // ============================================================================
    // MAIN ANIMATION LOOP
    // ============================================================================
    
    function animate(timestamp) {
        if (isStopped) return;
        if (isPaused) {
            animationFrameId = requestAnimationFrame(animate);
            return;
        }
        
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        // AKADEMIK GUBKIN animation
        const akademikProgress = Math.min(elapsed / settings.akademikDuration, 1);
        const akademikIndex = Math.floor(akademikProgress * (akademikCoords.length - 1));
        
        if (akademikIndex < akademikCoords.length) {
            const currentCoord = akademikCoords[akademikIndex];
            
            // Update AKADEMIK GUBKIN marker
            vesselMarker.setLngLat(currentCoord);
            
            // Update AKADEMIK GUBKIN layer
            const akademikAnimatedCoords = akademikCoords.slice(0, akademikIndex + 1);
            const akademikAnimatedLine = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: akademikAnimatedCoords
                }
            };
            
            if (map.getSource(akademikSourceId)) {
                map.getSource(akademikSourceId).setData(akademikAnimatedLine);
            }
        }
        
        // EQUALITY animation
        const equalityProgress = Math.min(elapsed / settings.equalityDuration, 1);
        const equalityIndex = Math.floor(equalityProgress * (equalityCoords.length - 1));
        
        if (equalityIndex < equalityCoords.length) {
            const currentCoord = equalityCoords[equalityIndex];
            
            // Update EQUALITY marker
            vessel3Marker.setLngLat(currentCoord);
            
            // Update EQUALITY layer
            const equalityAnimatedCoords = equalityCoords.slice(0, equalityIndex + 1);
            const equalityAnimatedLine = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: equalityAnimatedCoords
                }
            };
            
            if (map.getSource(equalitySourceId)) {
                map.getSource(equalitySourceId).setData(equalityAnimatedLine);
            }
        }
        
        // Show detection marker at 40% progress
        if (elapsed >= settings.animationDuration * 0.4 && !shownDetection) {
            showDetection();
        }
        
        // Show STS zone at 60% progress
        if (elapsed >= settings.animationDuration * 0.6 && !stsMarker) {
            createSTSZone();
        }
        
        // Continue animation if not complete
        if (elapsed < settings.animationDuration) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            // Ensure all elements are shown at completion
            if (!shownDetection) showDetection();
            if (!stsMarker) createSTSZone();
            console.log('✅ Chapter 7 animation complete');
        }
    }
    
    // Start animation
    setTimeout(() => {
        if (!isStopped) {
            animationFrameId = requestAnimationFrame(animate);
            console.log('▶️ Animation started');
        }
    }, settings.initialDelay);
    
    // ============================================================================
    // CONTROL FUNCTIONS & RETURN OBJECT
    // ============================================================================
    
    return {
        stop: cleanup,
        pause: () => {
            isPaused = true;
            console.log('⏸ Chapter 7 animation paused');
        },
        resume: () => {
            isPaused = false;
            console.log('▶ Chapter 7 animation resumed');
        },
        reset: () => {
            isStopped = false;
            isPaused = false;
            startTime = null;
            shownDetection = false;
            console.log('🔄 Chapter 7 animation reset');
        },
        getProgress: () => {
            if (!startTime) return 0;
            const elapsed = performance.now() - startTime;
            return Math.min(elapsed / settings.animationDuration, 1);
        },
        isComplete: () => {
            if (!startTime) return false;
            const elapsed = performance.now() - startTime;
            return elapsed >= settings.animationDuration;
        },
        isPaused: () => isPaused
    };
}