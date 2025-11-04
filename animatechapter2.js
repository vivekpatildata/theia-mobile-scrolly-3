// Chapter 2 Animation - Baltic Exit with Satellite Detection
// RESTRUCTURED: Exactly matches Chapter 1 & 3 pattern with light detection marker
// Progressive AIS track animation with satellite detection

function animateChapter2(map, geojsonData, vesselMarker, config = {}) {
    console.log('🎬 Chapter 2: Starting Baltic Exit animation...');
    
    // ============================================================================
    // CONFIGURATION SETTINGS
    // ============================================================================
    
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
    
    // ============================================================================
    // LIGHT DETECTION POINT (Single point like Chapter 1)
    // ============================================================================
    
    const detectionPoints = [
        {
            coords: [28.4263, 59.7067],
            label: 'LIGHT DETECTION',
            image: 'imageintro.png',
            popupOffset: [200, 50],  // To the right of marker
            delay: 500
        }
    ];
    
    // ============================================================================
    // SOURCE AND LAYER IDs
    // ============================================================================
    
    const sourceId = 'chapter2-progress-source';
    const layerId = 'chapter2-progress-layer';
    const glowLayerId = 'chapter2-progress-glow';
    
    // ============================================================================
    // STATE VARIABLES (Exact Chapter 1 & 3 pattern)
    // ============================================================================
    
    const coordinates = geojsonData.features[0].geometry.coordinates;
    const totalPoints = coordinates.length;
    
    let animationFrameId = null;
    let progressIndex = 0;
    let startTime = null;
    let isPaused = false;
    let detectionMarkers = [];      // Array like Chapter 1 & 3
    let detectionPopups = [];       // Array like Chapter 1 & 3
    let shownDetections = new Set(); // Set like Chapter 1 & 3
    let chapter2CleanupCallbacks = [];
    
    console.log(`  Track points: ${totalPoints}`);
    console.log(`  Light Detection at: ${detectionPoints[0].coords[1].toFixed(4)}°N, ${detectionPoints[0].coords[0].toFixed(4)}°E`);
    
    // ============================================================================
    // HIDE PRE-LOADED LAYERS
    // ============================================================================
    
    if (map.getLayer('chapter2-layer')) {
        map.setPaintProperty('chapter2-layer', 'line-opacity', 0);
    }
    if (map.getLayer('chapter2-glow')) {
        map.setPaintProperty('chapter2-glow', 'line-opacity', 0);
    }
    
    // ============================================================================
    // CSS INJECTION - EXACT CHAPTER 1 PATTERN with chapter2 naming
    // ============================================================================
    
    function injectStyles() {
        if (document.getElementById('chapter2-sat-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'chapter2-sat-styles';
        styleElement.textContent = `
            /* ============================================
               SATELLITE DETECTION MARKERS (Blue Theme)
               ============================================ */
            .chapter2-detection-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                pointer-events: none;
            }
            
            .chapter2-marker-core {
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
                animation: chapter2-marker-pulse 2s ease-in-out infinite;
            }
            
            .chapter2-marker-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 32px;
                height: 32px;
                border: 2px solid #4a9eff;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: chapter2-ring-expand 3s ease-out infinite;
            }
            
            @keyframes chapter2-marker-pulse {
                0%, 100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
                50% {
                    transform: translate(-50%, -50%) scale(1.2);
                    opacity: 0.7;
                }
            }
            
            @keyframes chapter2-ring-expand {
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
            .chapter2-popup .mapboxgl-popup-tip {
                display: none !important;
            }
            
            /* POPUP CONTAINER - SMALLER SIZE + ENHANCED GLOW */
            .chapter2-popup .mapboxgl-popup-content {
                padding: 0;
                border-radius: 8px;
                overflow: hidden;
                background: white;
                border: 2px solid rgba(74, 158, 255, 0.7);
                
                /* 🔥 ENHANCED GLOW - Same as Chapter 1 & 3 */
                box-shadow: 
                    0 0 60px rgba(74, 158, 255, 0.6),
                    0 0 120px rgba(74, 158, 255, 0.3),
                    0 0 180px rgba(74, 158, 255, 0.15);
            }
            
            /* ============================================
               SATELLITE IMAGE SIZING - MOBILE-FIRST
               📱 EXACT SAME AS CHAPTER 1 & 3
               ============================================ */
            
            /* MOBILE BASE (DEFAULT) - Optimized for phones */
            .chapter2-popup .enhanced-popup .annotation-img {
                width: 160px !important;      /* Same as Chapter 1 & 3 */
                height: 145px !important;     /* Same as Chapter 1 & 3 */
                object-fit: cover !important;
                display: block;
                border-radius: 4px;
            }
            
            /* Optional: Container styling */
            .chapter2-popup .enhanced-popup {
                position: relative;
            }
            
            /* ============================================
               SMALL MOBILE (480px and below)
               ============================================ */
            @media screen and (max-width: 480px) {
                .chapter2-popup .enhanced-popup .annotation-img {
                    width: 140px !important;
                    height: 127px !important;
                }
                
                .chapter2-detection-marker {
                    width: 36px;
                    height: 36px;
                }
                
                .chapter2-marker-core {
                    width: 14px;
                    height: 14px;
                }
                
                .chapter2-marker-ring {
                    width: 28px;
                    height: 28px;
                }
            }
            
            /* ============================================
               EXTRA SMALL MOBILE (320px and below)
               ============================================ */
            @media screen and (max-width: 320px) {
                .chapter2-popup .enhanced-popup .annotation-img {
                    width: 120px !important;
                    height: 109px !important;
                }
                
                .chapter2-detection-marker {
                    width: 32px;
                    height: 32px;
                }
                
                .chapter2-marker-core {
                    width: 12px;
                    height: 12px;
                }
                
                .chapter2-marker-ring {
                    width: 24px;
                    height: 24px;
                }
            }
            
            /* ============================================
               TABLET (768px - 1024px) - Slightly larger
               ============================================ */
            @media screen and (min-width: 481px) and (max-width: 768px) {
                .chapter2-popup .enhanced-popup .annotation-img {
                    width: 170px !important;
                    height: 155px !important;
                }
            }
            
            @media screen and (min-width: 769px) and (max-width: 1024px) {
                .chapter2-popup .enhanced-popup .annotation-img {
                    width: 190px !important;
                    height: 173px !important;
                }
            }
            
            /* ============================================
               DESKTOP (1025px and above) - Full size
               ============================================ */
            @media screen and (min-width: 1025px) {
                .chapter2-popup .enhanced-popup .annotation-img {
                    width: 210px !important;
                    height: 191px !important;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
        
        // Add to cleanup
        chapter2CleanupCallbacks.push(() => {
            const styles = document.getElementById('chapter2-sat-styles');
            if (styles) styles.remove();
        });
    }
    
    injectStyles();
    
    // ============================================================================
    // CREATE SATELLITE MARKERS - EXACT CHAPTER 1 & 3 PATTERN
    // ============================================================================
    
    function createSatelliteMarkers() {
        detectionPoints.forEach((point, index) => {
            const el = document.createElement('div');
            el.className = 'chapter2-detection-marker';
            el.innerHTML = `
                <div class="chapter2-marker-core"></div>
                <div class="chapter2-marker-ring"></div>
            `;
            
            const marker = new mapboxgl.Marker(el)
                .setLngLat(point.coords)
                .addTo(map);
            
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.6s ease';
            
            detectionMarkers.push({ marker, element: el, point, index });
            
            chapter2CleanupCallbacks.push(() => {
                marker.remove();
            });
        });
    }
    
    createSatelliteMarkers();
    
    // ============================================================================
    // SHOW DETECTION - EXACT CHAPTER 1 & 3 PATTERN
    // ============================================================================
    
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
                className: 'chapter2-popup',
                maxWidth: 'none'
            })
                .setLngLat(point.coords)
                .setHTML(popupHtml)
                .addTo(map);
            
            detectionPopups.push(popup);
            
            chapter2CleanupCallbacks.push(() => {
                popup.remove();
            });
            
            console.log('✅ Light detection shown');
        }, 400);
    }
    
    // ============================================================================
    // CHECK DETECTIONS - EXACT CHAPTER 1 & 3 PATTERN
    // ============================================================================
    
    function checkDetections(vesselCoord) {
        const tolerance = 1.0; // Same as Chapter 1 & 3
        
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
    
    // ============================================================================
    // CLEANUP - EXACT CHAPTER 1 & 3 PATTERN
    // ============================================================================
    
    const cleanup = () => {
        console.log('🧹 Chapter 2: Cleanup starting...');
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Execute all cleanup callbacks
        chapter2CleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (e) {
                console.warn('Chapter 2 cleanup callback error:', e);
            }
        });
        chapter2CleanupCallbacks = [];
        
        // Remove layers
        [glowLayerId, layerId].forEach(id => {
            if (map.getLayer(id)) map.removeLayer(id);
        });
        
        if (map.getSource(sourceId)) map.removeSource(sourceId);
        
        // Clear arrays
        detectionMarkers = [];
        detectionPopups = [];
        shownDetections.clear();
        
        console.log('✅ Chapter 2: Cleanup complete');
    };
    
    // ============================================================================
    // ADD TRACK LAYERS - EXACT CHAPTER 1 & 3 PATTERN
    // ============================================================================
    
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
    
    // ============================================================================
    // FADE IN ANIMATION - EXACT CHAPTER 1 & 3 PATTERN
    // ============================================================================
    
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
    
    // ============================================================================
    // START ANIMATION - EXACT CHAPTER 1 & 3 PATTERN
    // ============================================================================
    
    setTimeout(() => {
        startTime = performance.now();
        animateTrack();
    }, settings.fadeInDuration);
    
    // ============================================================================
    // ANIMATE TRACK - EXACT CHAPTER 1 & 3 PATTERN
    // ============================================================================
    
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
            
            // Show all detections at end - EXACT CHAPTER 1 & 3 PATTERN
            detectionPoints.forEach((_, index) => showDetection(index));
            
            console.log('✅ Chapter 2: Animation complete');
        }
    }
    
    // ============================================================================
    // RETURN OBJECT - EXACT CHAPTER 1 & 3 PATTERN
    // ============================================================================
    
    return {
        pause: () => { 
            isPaused = true; 
            console.log('⏸ Chapter 2 paused');
        },
        resume: () => {
            if (progressIndex >= totalPoints - 1) return;
            isPaused = false;
            startTime = performance.now() - (progressIndex / totalPoints) * settings.animationDuration;
            animateTrack();
            console.log('▶ Chapter 2 resumed');
        },
        stop: cleanup,
        reset: () => {
            cleanup();
            animateChapter2(map, geojsonData, vesselMarker, config);
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