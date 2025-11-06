// Chapter 6 Animation - Haiti Arrival & Ship-to-Ship Transfer
// OPTIMIZED: Faster timings + comprehensive cleanup for fast scrolling
// Shows Chapter 4 (static) + animates Chapter 5 + animates Vessel 2 (LOURDES)

function animateChapter6(map, chapter4Data, chapter5Data, vessel2Data, vesselMarker, vessel2Marker, config = {}) {
    const settings = {
        animationDuration: config.duration || 3200, // Faster: 4000 → 3200
        vessel1Color: config.vessel1Color || '#00ff88',
        vessel2Color: config.vessel2Color || '#ff3366',
        lineWidth: config.lineWidth || 3,
        glowWidth: config.glowWidth || 8,
        glowOpacity: config.glowOpacity || 0.35,
        vesselMoveSpeed: config.vesselMoveSpeed || 1.0,
        fadeInDuration: config.fadeInDuration || 250, // Faster: 400 → 250
        chapter4Opacity: config.chapter4Opacity || 0.3,
        initialDelay: config.initialDelay || 600, // Much faster: 1800 → 600
        ...config
    };
    
    // Source and layer IDs
    const chapter4SourceId = 'chapter6-chapter4-source';
    const chapter4LayerId = 'chapter6-chapter4-layer';
    const chapter4GlowId = 'chapter6-chapter4-glow';
    
    const chapter5SourceId = 'chapter6-chapter5-source';
    const chapter5LayerId = 'chapter6-chapter5-layer';
    const chapter5GlowId = 'chapter6-chapter5-glow';
    
    const vessel2SourceId = 'chapter6-vessel2-source';
    const vessel2LayerId = 'chapter6-vessel2-layer';
    const vessel2GlowId = 'chapter6-vessel2-glow';
    
    // Satellite detection points
    const detectionPoints = [
        {
            coords: [-75.5608, 20.7831],
            label: 'LIGHT DETECTION',
            image: 'image2A.png',
            popupOffset: [120, 150],
            markerColor: '#4a9eff',
            glowColor: '#4a9eff'
        },
        {
            coords: [-75.5948, 20.7992],
            label: 'STS TRANSFER',
            image: 'image2B.png',
            popupOffset: [0, -30],
            markerColor: '#cc0000',
            glowColor: '#cc0000',
            isSTS: true
        }
    ];
    
    const chapter4Coords = chapter4Data.features[0].geometry.coordinates;
    const chapter5Coords = chapter5Data.features[0].geometry.coordinates;
    const vessel2Coords = vessel2Data.features[0].geometry.coordinates;
    const totalPoints = Math.max(chapter5Coords.length, vessel2Coords.length);
    
    const stsLocation = [-75.5948, 20.7992];
    
    let animationFrameId = null;
    let progressIndex = 0;
    let startTime = null;
    let isPaused = false;
    let isStopped = false; // NEW: Track if animation is stopped
    let chapter6CleanupCallbacks = [];
    let detectionMarkers = [];
    let detectionPopups = [];
    let shownDetections = new Set();
    let stsMarker = null;
    let fadeInterval = null;
    let popupTimeouts = []; // NEW: Track all popup delay timeouts
    
    console.log('🎬 Chapter 6: Starting Haiti STS animation (fast mode)');
    
    // Hide pre-loaded chapter6 layers
    if (map.getLayer('chapter6-layer')) {
        map.setPaintProperty('chapter6-layer', 'line-opacity', 0);
    }
    
    // Inject CSS for markers and STS visualization
    function injectStyles() {
        if (document.getElementById('chapter6-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'chapter6-styles';
        styleElement.textContent = `
            .chapter6-detection-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                pointer-events: none;
            }
            
            .chapter6-marker-core {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 14px;
                height: 14px;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                animation: chapter6-marker-pulse 2s ease-in-out infinite;
            }
            
            .chapter6-marker-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 32px;
                height: 32px;
                border: 2px solid;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: chapter6-ring-expand 3s ease-out infinite;
            }
            
            @keyframes chapter6-marker-pulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
            }
            
            @keyframes chapter6-ring-expand {
                0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
            }
            
            .sts-transfer-zone {
                position: absolute;
                transform: translate(-50%, -50%);
                width: 120px;
                height: 120px;
                pointer-events: none;
            }
            
            .sts-subtle-glow {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100%;
                height: 100%;
                transform: translate(-50%, -50%);
                background: radial-gradient(circle, rgba(204, 170, 68, 0.15) 0%, rgba(204, 170, 68, 0.08) 40%, transparent 70%);
                border-radius: 50%;
                animation: sts-subtle-pulse 4s ease-in-out infinite;
            }
            
            .sts-ring-subtle-1 {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 60px;
                height: 60px;
                border: 1px solid rgba(204, 170, 68, 0.25);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: sts-ring-gentle-1 5s ease-out infinite;
            }
            
            .sts-ring-subtle-2 {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 80px;
                height: 80px;
                border: 1px solid rgba(204, 170, 68, 0.18);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: sts-ring-gentle-2 5s ease-out infinite 1s;
            }
            
            .sts-ring-subtle-3 {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100px;
                height: 100px;
                border: 1px solid rgba(204, 170, 68, 0.12);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: sts-ring-gentle-3 5s ease-out infinite 2s;
            }
            
            .sts-center-dot {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 8px;
                height: 8px;
                transform: translate(-50%, -50%);
                background: rgba(204, 170, 68, 0.4);
                border-radius: 50%;
                box-shadow: 0 0 15px rgba(204, 170, 68, 0.3);
                animation: sts-dot-breathe 3s ease-in-out infinite;
            }
            
            @keyframes sts-subtle-pulse {
                0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
                50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
            }
            
            @keyframes sts-ring-gentle-1 {
                0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.4; }
                100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
            }
            
            @keyframes sts-ring-gentle-2 {
                0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.3; }
                100% { transform: translate(-50%, -50%) scale(1.9); opacity: 0; }
            }
            
            @keyframes sts-ring-gentle-3 {
                0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.25; }
                100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }
            
            @keyframes sts-dot-breathe {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
            }
            
            .chapter6-popup .mapboxgl-popup-content {
                padding: 0;
                border-radius: 8px;
                overflow: hidden;
                background: white;
                border: 2px solid;
            }
            
            .chapter6-popup .mapboxgl-popup-tip {
                display: none !important;
            }
            
            .chapter6-popup.blue-glow .mapboxgl-popup-content {
                border-color: rgba(74, 158, 255, 0.7);
                box-shadow: 0 0 80px rgba(74, 158, 255, 0.7), 0 0 150px rgba(74, 158, 255, 0.4), 0 0 220px rgba(74, 158, 255, 0.2);
            }
            
            .chapter6-popup.red-glow .mapboxgl-popup-content {
                border-color: rgba(204, 0, 0, 0.7);
                box-shadow: 0 0 80px rgba(204, 0, 0, 0.7), 0 0 150px rgba(204, 0, 0, 0.4), 0 0 220px rgba(204, 0, 0, 0.2);
            }
            
            .chapter6-popup .enhanced-popup .annotation-img {
                width: 160px !important;
                height: 160px !important;
                object-fit: contain !important;  /* 🔧 FIX: Changed from cover to contain */
                display: block;
                border-radius: 4px;
                image-rendering: -webkit-optimize-contrast;  /* 🔧 FIX: Better quality on webkit */
                image-rendering: crisp-edges;  /* 🔧 FIX: Sharp edges */
                backface-visibility: hidden;  /* 🔧 FIX: Prevent rendering issues */
                transform: translateZ(0);  /* 🔧 FIX: Hardware acceleration */
                -webkit-backface-visibility: hidden;  /* 🔧 FIX: Safari support */
            }
            
            .chapter6-popup .enhanced-popup {
                position: relative;
            }
            
            @media screen and (max-width: 768px) {
                .chapter6-popup .enhanced-popup .annotation-img {
                    width: 145px !important;
                    height: 152px !important;
                    /* 🔧 FIX: Maintain quality on tablet */
                    object-fit: contain !important;
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                    backface-visibility: hidden;
                    transform: translateZ(0);
                }
                .chapter6-detection-marker { width: 36px; height: 36px; }
                .sts-transfer-zone { width: 100px; height: 100px; }
                .sts-ring-subtle-1 { width: 50px; height: 50px; }
                .sts-ring-subtle-2 { width: 70px; height: 70px; }
                .sts-ring-subtle-3 { width: 85px; height: 85px; }
            }
            
            @media screen and (max-width: 480px) {
                .chapter6-popup .enhanced-popup .annotation-img {
                    width: 130px !important;
                    height: 118px !important;
                    /* 🔧 FIX: Maintain quality on mobile */
                    object-fit: contain !important;
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                    backface-visibility: hidden;
                    transform: translateZ(0);
                }
                .chapter6-detection-marker { width: 32px; height: 32px; }
                .sts-transfer-zone { width: 80px; height: 80px; }
                .sts-center-dot { width: 6px; height: 6px; }
            }
            
            @media screen and (min-width: 769px) {
                .chapter6-popup .enhanced-popup .annotation-img {
                    width: 180px !important;
                    height: 180px !important;
                    /* 🔧 FIX: Maintain quality on desktop */
                    object-fit: contain !important;
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                    backface-visibility: hidden;
                    transform: translateZ(0);
                }
            }
        `;
        document.head.appendChild(styleElement);
        
        chapter6CleanupCallbacks.push(() => {
            if (styleElement && styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
        });
    }
    
    injectStyles();
    
    // COMPREHENSIVE CLEANUP - Prevents residue when fast scrolling
    const cleanup = () => {
        console.log('🧹 Chapter 6: Comprehensive cleanup starting...');
        
        // CRITICAL: Stop all activity immediately
        isStopped = true;
        
        // CRITICAL: Clear ALL popup delay timeouts immediately
        popupTimeouts.forEach(timeout => {
            if (timeout) {
                clearTimeout(timeout);
            }
        });
        popupTimeouts = [];
        console.log('  ✓ All popup timeouts cleared');
        
        // Stop animation
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Stop fade interval
        if (fadeInterval) {
            clearInterval(fadeInterval);
            fadeInterval = null;
        }
        
        // Remove all popups from state
        detectionPopups.forEach(popup => {
            try {
                popup.remove();
            } catch (e) {
                console.warn('Error removing popup:', e);
            }
        });
        detectionPopups = [];
        
        // FORCE remove ALL Chapter 6 popups from DOM
        document.querySelectorAll('.chapter6-popup').forEach(el => {
            el.remove();
            console.log('  ✓ Force removed chapter6 popup from DOM');
        });
        
        // FORCE remove ALL mapbox popups that might be lingering
        document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
            // Only remove if it's a chapter6 popup
            if (popup.classList.contains('chapter6-popup') || 
                popup.classList.contains('blue-glow') ||
                popup.classList.contains('red-glow') ||
                popup.querySelector('.enhanced-popup')) {
                popup.remove();
                console.log('  ✓ Force removed mapbox popup');
            }
        });
        
        // Remove all detection markers
        detectionMarkers.forEach(({ marker }) => {
            try {
                marker.remove();
            } catch (e) {
                console.warn('Error removing detection marker:', e);
            }
        });
        detectionMarkers = [];
        
        // Remove STS marker
        if (stsMarker) {
            try {
                stsMarker.remove();
            } catch (e) {
                console.warn('Error removing STS marker:', e);
            }
            stsMarker = null;
        }
        
        // Remove ALL map layers
        const layersToRemove = [
            chapter4GlowId, chapter4LayerId,
            chapter5GlowId, chapter5LayerId,
            vessel2GlowId, vessel2LayerId
        ];
        
        layersToRemove.forEach(id => {
            if (map.getLayer(id)) {
                try {
                    map.removeLayer(id);
                } catch (e) {
                    console.warn(`Error removing layer ${id}:`, e);
                }
            }
        });
        
        // Remove ALL sources
        const sourcesToRemove = [chapter4SourceId, chapter5SourceId, vessel2SourceId];
        
        sourcesToRemove.forEach(id => {
            if (map.getSource(id)) {
                try {
                    map.removeSource(id);
                } catch (e) {
                    console.warn(`Error removing source ${id}:`, e);
                }
            }
        });
        
        // Remove all chapter6 DOM elements
        document.querySelectorAll('.chapter6-detection-marker').forEach(el => el.remove());
        document.querySelectorAll('.sts-transfer-zone').forEach(el => el.remove());
        document.querySelectorAll('[class*="chapter6"]').forEach(el => {
            if (!el.id || el.id !== 'chapter6-styles') {
                el.remove();
            }
        });
        
        // Run all registered cleanup callbacks
        chapter6CleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (e) {
                console.warn('Chapter 6 cleanup callback error:', e);
            }
        });
        chapter6CleanupCallbacks = [];
        
        // Clear state
        shownDetections.clear();
        progressIndex = 0;
        startTime = null;
        
        console.log('✅ Chapter 6: Cleanup complete');
    };
    
    // Create satellite detection markers
    function createSatelliteMarkers() {
        detectionPoints.forEach((point, index) => {
            const el = document.createElement('div');
            el.className = 'chapter6-detection-marker';
            el.innerHTML = `
                <div class="chapter6-marker-core" style="background: ${point.markerColor}; box-shadow: 0 0 20px ${point.markerColor};"></div>
                <div class="chapter6-marker-ring" style="border-color: ${point.markerColor};"></div>
            `;
            
            const marker = new mapboxgl.Marker(el)
                .setLngLat(point.coords)
                .addTo(map);
            
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.4s ease'; // Faster: 0.6s → 0.4s
            
            detectionMarkers.push({ marker, element: el, point, index });
            
            chapter6CleanupCallbacks.push(() => {
                marker.remove();
            });
        });
    }
    
    createSatelliteMarkers();
    
    // Show detection with popup (faster) - IMAGE ONLY, NO LABELS
    function showDetection(index) {
        if (shownDetections.has(index)) return;
        shownDetections.add(index);
        
        const markerData = detectionMarkers[index];
        if (!markerData) return;
        
        const point = markerData.point;
        markerData.element.style.opacity = '1';
        
        setTimeout(() => {
            const popupClass = point.isSTS ? 'chapter6-popup red-glow' : 'chapter6-popup blue-glow';
            const popupHtml = `
                <div class="enhanced-popup">
                    <img src="${point.image}" class="annotation-img" alt="${point.label}">
                </div>
            `;
            
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: point.popupOffset,
                className: popupClass,
                maxWidth: 'none'
            })
                .setLngLat(point.coords)
                .setHTML(popupHtml)
                .addTo(map);
            
            detectionPopups.push(popup);
            
            chapter6CleanupCallbacks.push(() => {
                popup.remove();
            });
        }, 250); // Faster: 400ms → 250ms
    }
    
    // Create STS transfer zone marker (faster)
    function createSTSZone() {
        if (stsMarker) return;
        
        const el = document.createElement('div');
        el.className = 'sts-transfer-zone';
        el.innerHTML = `
            <div class="sts-subtle-glow"></div>
            <div class="sts-ring-subtle-1"></div>
            <div class="sts-ring-subtle-2"></div>
            <div class="sts-ring-subtle-3"></div>
            <div class="sts-center-dot"></div>
        `;
        
        stsMarker = new mapboxgl.Marker(el)
            .setLngLat(stsLocation)
            .addTo(map);
        
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.6s ease'; // Faster: 1s → 0.6s
        
        setTimeout(() => {
            el.style.opacity = '1';
        }, 200); // Faster: 300ms → 200ms
        
        chapter6CleanupCallbacks.push(() => {
            if (stsMarker) {
                stsMarker.remove();
            }
        });
    }
    
    // Add Chapter 4 path (static, dimmer)
    map.addSource(chapter4SourceId, {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: chapter4Coords
            }
        }
    });
    
    map.addLayer({
        id: chapter4GlowId,
        type: 'line',
        source: chapter4SourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': settings.vessel1Color,
            'line-width': settings.glowWidth,
            'line-opacity': 0,
            'line-blur': 4
        }
    });
    
    map.addLayer({
        id: chapter4LayerId,
        type: 'line',
        source: chapter4SourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': settings.vessel1Color,
            'line-width': settings.lineWidth,
            'line-opacity': 0
        }
    });
    
    // Add Chapter 5 path (progressive animation)
    const chapter5Geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: [chapter5Coords[0]]
        }
    };
    
    map.addSource(chapter5SourceId, {
        type: 'geojson',
        data: chapter5Geojson
    });
    
    map.addLayer({
        id: chapter5GlowId,
        type: 'line',
        source: chapter5SourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': settings.vessel1Color,
            'line-width': settings.glowWidth,
            'line-opacity': 0,
            'line-blur': 4
        }
    });
    
    map.addLayer({
        id: chapter5LayerId,
        type: 'line',
        source: chapter5SourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': settings.vessel1Color,
            'line-width': settings.lineWidth,
            'line-opacity': 0
        }
    });
    
    // Add Vessel 2 path (progressive animation)
    const vessel2Geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: [vessel2Coords[0]]
        }
    };
    
    map.addSource(vessel2SourceId, {
        type: 'geojson',
        data: vessel2Geojson
    });
    
    map.addLayer({
        id: vessel2GlowId,
        type: 'line',
        source: vessel2SourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': settings.vessel2Color,
            'line-width': settings.glowWidth,
            'line-opacity': 0,
            'line-blur': 4
        }
    });
    
    map.addLayer({
        id: vessel2LayerId,
        type: 'line',
        source: vessel2SourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': settings.vessel2Color,
            'line-width': settings.lineWidth,
            'line-opacity': 0
        }
    });
    
    // Position vessels at start
    vesselMarker.setLngLat(chapter5Coords[0]);
    vessel2Marker.setLngLat(vessel2Coords[0]);
    
    // START ANIMATION (faster delay)
    setTimeout(() => {
        // Fade in all paths (faster)
        let opacity = 0;
        const fadeSteps = 15; // Fewer steps: 18 → 15
        fadeInterval = setInterval(() => {
            opacity += 0.06; // Faster increment: 0.05 → 0.06
            if (opacity >= 0.9) {
                opacity = 0.9;
                clearInterval(fadeInterval);
                fadeInterval = null;
            }
            
            // Chapter 4 (background) dimmer
            if (map.getLayer(chapter4LayerId)) {
                map.setPaintProperty(chapter4LayerId, 'line-opacity', opacity * settings.chapter4Opacity);
            }
            if (map.getLayer(chapter4GlowId)) {
                map.setPaintProperty(chapter4GlowId, 'line-opacity', opacity * settings.chapter4Opacity * 0.5);
            }
            
            // Chapter 5 (animated) normal
            if (map.getLayer(chapter5LayerId)) {
                map.setPaintProperty(chapter5LayerId, 'line-opacity', opacity);
            }
            if (map.getLayer(chapter5GlowId)) {
                map.setPaintProperty(chapter5GlowId, 'line-opacity', opacity * settings.glowOpacity);
            }
            
            // Vessel 2 (animated) normal
            if (map.getLayer(vessel2LayerId)) {
                map.setPaintProperty(vessel2LayerId, 'line-opacity', opacity);
            }
            if (map.getLayer(vessel2GlowId)) {
                map.setPaintProperty(vessel2GlowId, 'line-opacity', opacity * settings.glowOpacity);
            }
        }, settings.fadeInDuration / fadeSteps);
        
        chapter6CleanupCallbacks.push(() => {
            if (fadeInterval) clearInterval(fadeInterval);
        });
        
        // Start animation after fade-in
        setTimeout(() => {
            startTime = performance.now();
            animateTrack();
        }, settings.fadeInDuration);
        
    }, settings.initialDelay); // Faster: 1800ms → 600ms
    
    // Main animation function (faster triggers)
    function animateTrack() {
        if (isPaused) return;
        
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / settings.animationDuration, 1);
        
        // Show detection markers FASTER
        if (progress >= 0.15 && !shownDetections.has(0)) { // Earlier: 0.25 → 0.15
            showDetection(0);
        }
        if (progress >= 0.35 && !shownDetections.has(1)) { // Earlier: 0.5 → 0.35
            showDetection(1);
        }
        
        // Show STS zone FASTER
        if (progress >= 0.55 && !stsMarker) { // Earlier: 0.7 → 0.55
            createSTSZone();
        }
        
        const targetIndex = Math.floor(progress * (totalPoints - 1));
        
        if (targetIndex > progressIndex) {
            progressIndex = targetIndex;
            
            // Update Chapter 5 path
            const chapter5Index = Math.min(progressIndex, chapter5Coords.length - 1);
            const currentChapter5Coords = chapter5Coords.slice(0, chapter5Index + 1);
            chapter5Geojson.geometry.coordinates = currentChapter5Coords;
            
            if (map.getSource(chapter5SourceId)) {
                map.getSource(chapter5SourceId).setData(chapter5Geojson);
            }
            
            // Update Vessel 2 path
            const vessel2Index = Math.min(progressIndex, vessel2Coords.length - 1);
            const currentVessel2Coords = vessel2Coords.slice(0, vessel2Index + 1);
            vessel2Geojson.geometry.coordinates = currentVessel2Coords;
            
            if (map.getSource(vessel2SourceId)) {
                map.getSource(vessel2SourceId).setData(vessel2Geojson);
            }
            
            // Update vessel positions
            const vessel1Index = Math.min(
                Math.floor(chapter5Index * settings.vesselMoveSpeed),
                chapter5Coords.length - 1
            );
            vesselMarker.setLngLat(chapter5Coords[vessel1Index]);
            
            const vessel2MoveIndex = Math.min(
                Math.floor(vessel2Index * settings.vesselMoveSpeed),
                vessel2Coords.length - 1
            );
            vessel2Marker.setLngLat(vessel2Coords[vessel2MoveIndex]);
        }
        
        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animateTrack);
        } else {
            // Final positions
            vesselMarker.setLngLat(chapter5Coords[chapter5Coords.length - 1]);
            vessel2Marker.setLngLat(vessel2Coords[vessel2Coords.length - 1]);
            
            chapter5Geojson.geometry.coordinates = chapter5Coords;
            vessel2Geojson.geometry.coordinates = vessel2Coords;
            
            if (map.getSource(chapter5SourceId)) {
                map.getSource(chapter5SourceId).setData(chapter5Geojson);
            }
            if (map.getSource(vessel2SourceId)) {
                map.getSource(vessel2SourceId).setData(vessel2Geojson);
            }
            
            // Show all detections
            detectionPoints.forEach((_, index) => showDetection(index));
            
            // Ensure STS zone is visible
            if (!stsMarker) {
                createSTSZone();
            }
            
            console.log('✅ Chapter 6: Animation complete');
        }
    }
    
    return {
        pause: () => { isPaused = true; },
        resume: () => {
            if (progressIndex >= totalPoints - 1) return;
            isPaused = false;
            startTime = performance.now() - (progressIndex / totalPoints) * settings.animationDuration;
            animateTrack();
        },
        stop: cleanup,
        reset: () => {
            cleanup();
            animateChapter6(map, chapter4Data, chapter5Data, vessel2Data, vesselMarker, vessel2Marker, config);
        },
        setSpeed: (speed) => {
            const newDuration = 3200 / speed;
            const currentProgress = progressIndex / totalPoints;
            settings.animationDuration = newDuration;
            startTime = performance.now() - (currentProgress * newDuration);
        },
        getProgress: () => progressIndex / totalPoints,
        isComplete: () => progressIndex >= totalPoints - 1,
        isPaused: () => isPaused
    };
}