// Chapter 3 Animation - Mobile-Optimized for LinkedIn
// Optimized for phone screens with enhanced glow and no popup tip

function animateChapter3(map, geojsonData, vesselMarker, config = {}) {
    const settings = {
        animationDuration: config.duration || 3000,
        lineColor: config.lineColor || '#00ff88',
        lineWidth: config.lineWidth || 3,
        glowColor: config.glowColor || '#00ff88',
        glowWidth: config.glowWidth || 8,
        vesselMoveSpeed: config.vesselMoveSpeed || 1.0,
        fadeInDuration: config.fadeInDuration || 400,
        ...config
    };
    
    // Satellite detection points with simplified popup structure
    const detectionPoints = [
        {
            coords: [13.8009, 54.9989],
            label: 'DETECTION 1',
            image: 'image1A.png',
            popupOffset: [140, 100],
            delay: 500
        },
        {
            coords: [4.8654, 58.3243],
            label: 'DETECTION 2', 
            image: 'image1B.png',
            popupOffset: [120, -50],
            delay: 1000
        }
    ];
    
    const sourceId = 'chapter3-progress-source';
    const layerId = 'chapter3-progress-layer';
    const glowLayerId = 'chapter3-progress-glow';
    
    const coordinates = geojsonData.features[0].geometry.coordinates;
    const totalPoints = coordinates.length;
    
    let animationFrameId = null;
    let progressIndex = 0;
    let startTime = null;
    let isPaused = false;
    let detectionMarkers = [];
    let detectionPopups = [];
    let shownDetections = new Set();
    let chapter3CleanupCallbacks = [];
    
    // Hide pre-loaded chapter3 layers
    if (map.getLayer('chapter3-layer')) {
        map.setPaintProperty('chapter3-layer', 'line-opacity', 0);
    }
    if (map.getLayer('chapter3-glow')) {
        map.setPaintProperty('chapter3-glow', 'line-opacity', 0);
    }
    
    // Inject CSS - MOBILE-FIRST with no tip and enhanced glow
    function injectStyles() {
        if (document.getElementById('chapter3-sat-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'chapter3-sat-styles';
        styleElement.textContent = `
            /* ============================================
               SATELLITE DETECTION MARKERS (Blue Theme)
               ============================================ */
            .sat-detection-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                pointer-events: none;
            }
            
            .sat-marker-core {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 16px;
                height: 16px;
                transform: translate(-50%, -50%);
                background: #4a9eff;
                border-radius: 50%;
                box-shadow: 
                    0 0 20px rgba(74, 158, 255, 0.8),
                    0 0 40px rgba(74, 158, 255, 0.4);
                animation: sat-marker-pulse 2s ease-in-out infinite;
            }
            
            .sat-marker-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 32px;
                height: 32px;
                border: 2px solid #4a9eff;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: sat-ring-expand 3s ease-out infinite;
            }
            
            @keyframes sat-marker-pulse {
                0%, 100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
                50% {
                    transform: translate(-50%, -50%) scale(1.2);
                    opacity: 0.7;
                }
            }
            
            @keyframes sat-ring-expand {
                0% {
                    transform: translate(-50%, -50%) scale(0.8);
                    opacity: 0.8;
                }
                100% {
                    transform: translate(-50%, -50%) scale(2.5);
                    opacity: 0;
                }
            }
            
            /* ============================================
               SATELLITE POPUP STYLES (White Background)
               ⚠️ REDUCED SIZE - MOBILE OPTIMIZED
               ⚠️ NO TIP - HIDDEN
               ⚠️ ENHANCED GLOW - STRONGER BLUE
               ============================================ */
            
            /* HIDE THE WHITE TIP/ARROW */
            .chapter3-popup .mapboxgl-popup-tip {
                display: none !important;
            }
            
            /* POPUP CONTAINER - SMALLER SIZE + ENHANCED GLOW */
            .chapter3-popup .mapboxgl-popup-content {
                padding: 0;
                border-radius: 8px;
                overflow: hidden;
                background: white;
                border: 2px solid rgba(74, 158, 255, 0.7);
                
                /* 🔥 ENHANCED GLOW - Increased from 40px to 60px and 80px to 120px */
                box-shadow: 
                    0 0 60px rgba(74, 158, 255, 0.6),
                    0 0 120px rgba(74, 158, 255, 0.3),
                    0 0 180px rgba(74, 158, 255, 0.15);
            }
            
            /* ============================================
               SATELLITE IMAGE SIZING - MOBILE-FIRST
               📱 REDUCED BY ~30% FROM ORIGINAL
               ============================================ */
            
            /* MOBILE BASE (DEFAULT) - Optimized for phones */
            .chapter3-popup .enhanced-popup .annotation-img {
                width: 160px !important;      /* ⬇️ Reduced from 240px */
                height: 145px !important;     /* ⬇️ Reduced from 220px */
                object-fit: cover !important;
                display: block;
                border-radius: 4px;
            }
            
            /* Optional: Container styling */
            .chapter3-popup .enhanced-popup {
                position: relative;
            }
            
            /* ============================================
               SMALL MOBILE (480px and below)
               ============================================ */
            @media screen and (max-width: 480px) {
                .chapter3-popup .enhanced-popup .annotation-img {
                    width: 140px !important;    /* Even smaller for small phones */
                    height: 127px !important;
                }
                
                .sat-detection-marker {
                    width: 36px;
                    height: 36px;
                }
                
                .sat-marker-core {
                    width: 14px;
                    height: 14px;
                }
                
                .sat-marker-ring {
                    width: 28px;
                    height: 28px;
                }
            }
            
            /* ============================================
               EXTRA SMALL MOBILE (320px and below)
               ============================================ */
            @media screen and (max-width: 320px) {
                .chapter3-popup .enhanced-popup .annotation-img {
                    width: 120px !important;    /* Minimum usable size */
                    height: 109px !important;
                }
                
                .sat-detection-marker {
                    width: 32px;
                    height: 32px;
                }
                
                .sat-marker-core {
                    width: 12px;
                    height: 12px;
                }
                
                .sat-marker-ring {
                    width: 24px;
                    height: 24px;
                }
            }
            
            /* ============================================
               TABLET (768px - 1024px) - Slightly larger
               ============================================ */
            @media screen and (min-width: 481px) and (max-width: 768px) {
                .chapter3-popup .enhanced-popup .annotation-img {
                    width: 170px !important;
                    height: 155px !important;
                }
            }
            
            @media screen and (min-width: 769px) and (max-width: 1024px) {
                .chapter3-popup .enhanced-popup .annotation-img {
                    width: 190px !important;
                    height: 173px !important;
                }
                
                .sat-detection-marker {
                    width: 38px;
                    height: 38px;
                }
            }
            
            /* ============================================
               DESKTOP (1025px and above) - Full size
               ============================================ */
            @media screen and (min-width: 1025px) {
                .chapter3-popup .enhanced-popup .annotation-img {
                    width: 200px !important;    /* Still reduced from original 240px */
                    height: 200px !important;   /* Still reduced from original 220px */
                }
                
                .sat-detection-marker {
                    width: 40px;
                    height: 40px;
                }
                
                .sat-marker-core {
                    width: 16px;
                    height: 16px;
                }
                
                .sat-marker-ring {
                    width: 32px;
                    height: 32px;
                }
            }
            
            /* ============================================
               POPUP OVERFLOW PREVENTION
               ============================================ */
            .chapter3-popup .mapboxgl-popup-content {
                max-width: 95vw;
                max-height: 80vh;
                overflow: auto;
            }
            
            @media screen and (max-width: 320px) {
                .chapter3-popup .mapboxgl-popup-content {
                    max-width: 98vw;
                    max-height: 75vh;
                }
            }
        `;
        document.head.appendChild(styleElement);
        
        // Add cleanup callback
        chapter3CleanupCallbacks.push(() => {
            if (styleElement && styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
        });
    }
    
    injectStyles();
    
    // Create satellite detection markers (following proven pattern)
    function createSatelliteMarkers() {
        detectionPoints.forEach((point, index) => {
            // Create marker element (blue blinking dot)
            const el = document.createElement('div');
            el.className = 'sat-detection-marker';
            el.innerHTML = `
                <div class="sat-marker-core"></div>
                <div class="sat-marker-ring"></div>
            `;
            
            // Add marker to map
            const marker = new mapboxgl.Marker(el)
                .setLngLat(point.coords)
                .addTo(map);
            
            // Initially hidden
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.6s ease';
            
            detectionMarkers.push({ marker, element: el, point, index });
            
            // Add cleanup callback
            chapter3CleanupCallbacks.push(() => {
                marker.remove();
            });
        });
    }
    
    createSatelliteMarkers();
    
    // Show detection with satellite imagery popup (proven pattern)
    function showDetection(index) {
        if (shownDetections.has(index)) return;
        shownDetections.add(index);
        
        const markerData = detectionMarkers[index];
        if (!markerData) return;
        
        const point = markerData.point;
        
        // Show marker with animation
        markerData.element.style.opacity = '1';
        
        // Add popup after brief delay (following successful pattern)
        setTimeout(() => {
            // Create clean popup HTML - IMAGE ONLY, NO LABELS
            const popupHtml = `
                <div class="enhanced-popup">
                    <img src="${point.image}" class="annotation-img" alt="${point.label}">
                </div>
            `;
            
            // Create Mapbox popup (proven method)
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: point.popupOffset,
                className: 'chapter3-popup',
                maxWidth: 'none'
            })
                .setLngLat(point.coords)
                .setHTML(popupHtml)
                .addTo(map);
            
            detectionPopups.push(popup);
            
            // Add cleanup callback
            chapter3CleanupCallbacks.push(() => {
                popup.remove();
            });
        }, 400);
    }
    
    // Check if vessel near detection point
    function checkDetections(vesselCoord) {
        const tolerance = 1.0;
        
        detectionPoints.forEach((point, index) => {
            if (shownDetections.has(index)) return;
            
            const distance = Math.sqrt(
                Math.pow(vesselCoord[1] - point.coords[1], 2) + 
                Math.pow(vesselCoord[0] - point.coords[0], 2)
            );
            
            if (distance < tolerance) {
                showDetection(index);
            }
        });
    }
    
    // Cleanup function
    const cleanup = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Execute all cleanup callbacks
        chapter3CleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (e) {
                console.warn('Chapter 3 cleanup callback error:', e);
            }
        });
        chapter3CleanupCallbacks = [];
        
        // Remove layers
        [glowLayerId, layerId].forEach(id => {
            if (map.getLayer(id)) map.removeLayer(id);
        });
        
        if (map.getSource(sourceId)) map.removeSource(sourceId);
        
        // Clear arrays
        detectionMarkers = [];
        detectionPopups = [];
        shownDetections.clear();
    };
    
    // Add track layers
    const progressGeojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: [coordinates[0]]
        }
    };
    
    map.addSource(sourceId, {
        type: 'geojson',
        data: progressGeojson
    });
    
    map.addLayer({
        id: glowLayerId,
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': settings.glowColor,
            'line-width': settings.glowWidth,
            'line-opacity': 0,
            'line-blur': 4
        }
    });
    
    map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': settings.lineColor,
            'line-width': settings.lineWidth,
            'line-opacity': 0
        }
    });
    
    vesselMarker.setLngLat(coordinates[0]);
    
    // Fade in animation
    let opacity = 0;
    const fadeInterval = setInterval(() => {
        opacity += 0.05;
        if (opacity >= 0.9) {
            opacity = 0.9;
            clearInterval(fadeInterval);
        }
        if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, 'line-opacity', opacity);
        }
        if (map.getLayer(glowLayerId)) {
            map.setPaintProperty(glowLayerId, 'line-opacity', opacity * 0.35);
        }
    }, settings.fadeInDuration / 18);
    
    // Start animation
    setTimeout(() => {
        startTime = performance.now();
        animateTrack();
    }, settings.fadeInDuration);
    
    // Animate track
    function animateTrack() {
        if (isPaused) return;
        
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / settings.animationDuration, 1);
        const targetIndex = Math.floor(progress * (totalPoints - 1));
        
        if (targetIndex > progressIndex) {
            progressIndex = targetIndex;
            
            const currentCoords = coordinates.slice(0, progressIndex + 1);
            progressGeojson.geometry.coordinates = currentCoords;
            
            if (map.getSource(sourceId)) {
                map.getSource(sourceId).setData(progressGeojson);
            }
            
            const vesselIndex = Math.min(
                Math.floor(progressIndex * settings.vesselMoveSpeed), 
                totalPoints - 1
            );
            const vesselCoord = coordinates[vesselIndex];
            vesselMarker.setLngLat(vesselCoord);
            
            checkDetections(vesselCoord);
        }
        
        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animateTrack);
        } else {
            vesselMarker.setLngLat(coordinates[coordinates.length - 1]);
            progressGeojson.geometry.coordinates = coordinates;
            if (map.getSource(sourceId)) {
                map.getSource(sourceId).setData(progressGeojson);
            }
            
            // Show all detections at end
            detectionPoints.forEach((_, index) => showDetection(index));
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
            animateChapter3(map, geojsonData, vesselMarker, config);
        },
        setSpeed: (speed) => {
            const newDuration = 3000 / speed;
            const currentProgress = progressIndex / totalPoints;
            settings.animationDuration = newDuration;
            startTime = performance.now() - (currentProgress * newDuration);
        },
        getProgress: () => progressIndex / totalPoints,
        isComplete: () => progressIndex >= totalPoints - 1
    };
}