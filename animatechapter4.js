// Chapter 4 Animation - 27-Hour Drift with Satellite Detection
// RESTRUCTURED: Exactly matches Chapter 1, 2 & 3 pattern with light detection marker
// Progressive AIS track animation with satellite detection

function animateChapter4(map, geojsonData, vesselMarker, config = {}) {
    console.log('🎬 Chapter 4: Starting 27-Hour Drift animation...');
    
    // ============================================================================
    // CONFIGURATION SETTINGS
    // ============================================================================
    
    const settings = {
        animationDuration: config.duration || 3500,
        lineColor: config.lineColor || '#00ff88',
        lineWidth: config.lineWidth || 3,
        glowColor: config.glowColor || '#00ff88',
        glowWidth: config.glowWidth || 8,
        glowOpacity: config.glowOpacity || 0.35,
        vesselMoveSpeed: config.vesselMoveSpeed || 1.0,
        fadeInDuration: config.fadeInDuration || 400,
        ...config
    };
    
    // ============================================================================
    // LIGHT DETECTION POINT (Single point like Chapters 1 & 2)
    // ============================================================================
    
    const detectionPoints = [
        {
            coords: [4.2588, 63.4259],
            label: 'LIGHT DETECTION',
            image: 'image4.png',
            popupOffset: [200, 120],  // To the right of marker
            delay: 500
        }
    ];
    
    // ============================================================================
    // SOURCE AND LAYER IDs
    // ============================================================================
    
    const sourceId = 'chapter4-progress-source';
    const layerId = 'chapter4-progress-layer';
    const glowLayerId = 'chapter4-progress-glow';
    
    // ============================================================================
    // STATE VARIABLES (Exact Chapter 1, 2 & 3 pattern)
    // ============================================================================
    
    const coordinates = geojsonData.features[0].geometry.coordinates;
    const totalPoints = coordinates.length;
    
    let animationFrameId = null;
    let progressIndex = 0;
    let startTime = null;
    let isPaused = false;
    let detectionMarkers = [];      // Array like Chapters 1, 2 & 3
    let detectionPopups = [];       // Array like Chapters 1, 2 & 3
    let shownDetections = new Set(); // Set like Chapters 1, 2 & 3
    let chapter4CleanupCallbacks = [];
    
    console.log(`  Track points: ${totalPoints}`);
    console.log(`  Light Detection at: ${detectionPoints[0].coords[1].toFixed(4)}°N, ${detectionPoints[0].coords[0].toFixed(4)}°E`);
    
    // ============================================================================
    // HIDE PRE-LOADED LAYERS
    // ============================================================================
    
    if (map.getLayer('chapter4-layer')) {
        map.setPaintProperty('chapter4-layer', 'line-opacity', 0);
    }
    if (map.getLayer('chapter4-glow')) {
        map.setPaintProperty('chapter4-glow', 'line-opacity', 0);
    }
    
    // ============================================================================
    // CSS INJECTION - EXACT CHAPTER 1, 2 & 3 PATTERN with chapter4 naming
    // ============================================================================
    
    function injectStyles() {
        if (document.getElementById('chapter4-sat-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'chapter4-sat-styles';
        styleElement.textContent = `
            /* ============================================
               SATELLITE DETECTION MARKERS (Blue Theme)
               ============================================ */
            .chapter4-detection-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                pointer-events: none;
            }
            
            .chapter4-marker-core {
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
                animation: chapter4-marker-pulse 2s ease-in-out infinite;
            }
            
            .chapter4-marker-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 32px;
                height: 32px;
                border: 2px solid #4a9eff;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: chapter4-ring-expand 3s ease-out infinite;
            }
            
            @keyframes chapter4-marker-pulse {
                0%, 100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
                50% {
                    transform: translate(-50%, -50%) scale(1.2);
                    opacity: 0.7;
                }
            }
            
            @keyframes chapter4-ring-expand {
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
            .chapter4-popup .mapboxgl-popup-tip {
                display: none !important;
            }
            
            /* POPUP CONTAINER - SMALLER SIZE + ENHANCED GLOW */
            .chapter4-popup .mapboxgl-popup-content {
                padding: 0;
                border-radius: 8px;
                overflow: hidden;
                background: white;
                border: 2px solid rgba(74, 158, 255, 0.7);
                
                /* 🔥 ENHANCED GLOW - Same as Chapters 1, 2 & 3 */
                box-shadow: 
                    0 0 60px rgba(74, 158, 255, 0.6),
                    0 0 120px rgba(74, 158, 255, 0.3),
                    0 0 180px rgba(74, 158, 255, 0.15);
            }
            
            /* ============================================
               SATELLITE IMAGE SIZING - MOBILE-FIRST
               📱 EXACT SAME AS CHAPTERS 1, 2 & 3
               ============================================ */
            
            /* MOBILE BASE (DEFAULT) - Optimized for phones */
            .chapter4-popup .enhanced-popup .annotation-img {
                width: 160px !important;      /* Same as Chapters 1, 2 & 3 */
                height: 145px !important;     /* Same as Chapters 1, 2 & 3 */
                object-fit: fit !important;
                display: block;
                border-radius: 4px;
            }
            
            /* Optional: Container styling */
            .chapter4-popup .enhanced-popup {
                position: relative;
            }
            
            /* ============================================
               SMALL MOBILE (480px and below)
               ============================================ */
            @media screen and (max-width: 480px) {
                .chapter4-popup .enhanced-popup .annotation-img {
                    width: 140px !important;
                    height: 127px !important;
                }
                
                .chapter4-detection-marker {
                    width: 36px;
                    height: 36px;
                }
                
                .chapter4-marker-core {
                    width: 14px;
                    height: 14px;
                }
                
                .chapter4-marker-ring {
                    width: 28px;
                    height: 28px;
                }
            }
            
            /* ============================================
               EXTRA SMALL MOBILE (320px and below)
               ============================================ */
            @media screen and (max-width: 320px) {
                .chapter4-popup .enhanced-popup .annotation-img {
                    width: 120px !important;
                    height: 109px !important;
                }
                
                .chapter4-detection-marker {
                    width: 32px;
                    height: 32px;
                }
                
                .chapter4-marker-core {
                    width: 12px;
                    height: 12px;
                }
                
                .chapter4-marker-ring {
                    width: 24px;
                    height: 24px;
                }
            }
            
            /* ============================================
               TABLET (768px - 1024px) - Slightly larger
               ============================================ */
            @media screen and (min-width: 481px) and (max-width: 768px) {
                .chapter4-popup .enhanced-popup .annotation-img {
                    width: 170px !important;
                    height: 155px !important;
                }
            }
            
            @media screen and (min-width: 769px) and (max-width: 1024px) {
                .chapter4-popup .enhanced-popup .annotation-img {
                    width: 190px !important;
                    height: 173px !important;
                }
            }
            
            /* ============================================
               DESKTOP (1025px and above) - Full size
               ============================================ */
            @media screen and (min-width: 1025px) {
                .chapter4-popup .enhanced-popup .annotation-img {
                    width: 210px !important;
                    height: 210px !important;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
        
        // Add to cleanup
        chapter4CleanupCallbacks.push(() => {
            const styles = document.getElementById('chapter4-sat-styles');
            if (styles) styles.remove();
        });
    }
    
    injectStyles();
    
    // ============================================================================
    // CREATE SATELLITE MARKERS - EXACT CHAPTERS 1, 2 & 3 PATTERN
    // ============================================================================
    
    function createSatelliteMarkers() {
        detectionPoints.forEach((point, index) => {
            const el = document.createElement('div');
            el.className = 'chapter4-detection-marker';
            el.innerHTML = `
                <div class="chapter4-marker-core"></div>
                <div class="chapter4-marker-ring"></div>
            `;
            
            const marker = new mapboxgl.Marker(el)
                .setLngLat(point.coords)
                .addTo(map);
            
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.6s ease';
            
            detectionMarkers.push({ marker, element: el, point, index });
            
            chapter4CleanupCallbacks.push(() => {
                marker.remove();
            });
        });
    }
    
    createSatelliteMarkers();
    
    // ============================================================================
    // SHOW DETECTION - EXACT CHAPTERS 1, 2 & 3 PATTERN
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
                className: 'chapter4-popup',
                maxWidth: 'none'
            })
                .setLngLat(point.coords)
                .setHTML(popupHtml)
                .addTo(map);
            
            detectionPopups.push(popup);
            
            chapter4CleanupCallbacks.push(() => {
                popup.remove();
            });
            
            console.log('✅ Light detection shown');
        }, 400);
    }
    
    // ============================================================================
    // CHECK DETECTIONS - EXACT CHAPTERS 1, 2 & 3 PATTERN
    // ============================================================================
    
    function checkDetections(vesselCoord) {
        const tolerance = 1.0; // Same as Chapters 1, 2 & 3
        
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
    // CLEANUP - EXACT CHAPTERS 1, 2 & 3 PATTERN
    // ============================================================================
    
    const cleanup = () => {
        console.log('🧹 Chapter 4: Cleanup starting...');
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Execute all cleanup callbacks
        chapter4CleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (e) {
                console.warn('Chapter 4 cleanup callback error:', e);
            }
        });
        chapter4CleanupCallbacks = [];
        
        // Remove layers
        [glowLayerId, layerId].forEach(id => {
            if (map.getLayer(id)) map.removeLayer(id);
        });
        
        if (map.getSource(sourceId)) map.removeSource(sourceId);
        
        // Clear arrays
        detectionMarkers = [];
        detectionPopups = [];
        shownDetections.clear();
        
        console.log('✅ Chapter 4: Cleanup complete');
    };
    
    // ============================================================================
    // ADD TRACK LAYERS - EXACT CHAPTERS 1, 2 & 3 PATTERN
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
    // FADE IN ANIMATION - EXACT CHAPTERS 1, 2 & 3 PATTERN
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
            map.setPaintProperty(glowLayerId, 'line-opacity', opacity * settings.glowOpacity);
        }
    }, settings.fadeInDuration / 18);
    
    chapter4CleanupCallbacks.push(() => {
        clearInterval(fadeInterval);
    });
    
    // ============================================================================
    // START ANIMATION - EXACT CHAPTERS 1, 2 & 3 PATTERN
    // ============================================================================
    
    setTimeout(() => {
        startTime = performance.now();
        animateTrack();
    }, settings.fadeInDuration);
    
    // ============================================================================
    // ANIMATE TRACK - EXACT CHAPTERS 1, 2 & 3 PATTERN
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
            
            // Show all detections at end - EXACT CHAPTERS 1, 2 & 3 PATTERN
            detectionPoints.forEach((_, index) => showDetection(index));
            
            console.log('✅ Chapter 4: Animation complete');
        }
    }
    
    // ============================================================================
    // RETURN OBJECT - EXACT CHAPTERS 1, 2 & 3 PATTERN
    // ============================================================================
    
    return {
        pause: () => { 
            isPaused = true; 
            console.log('⏸ Chapter 4 paused');
        },
        resume: () => {
            if (progressIndex >= totalPoints - 1) return;
            isPaused = false;
            startTime = performance.now() - (progressIndex / totalPoints) * settings.animationDuration;
            animateTrack();
            console.log('▶ Chapter 4 resumed');
        },
        stop: cleanup,
        reset: () => {
            cleanup();
            animateChapter4(map, geojsonData, vesselMarker, config);
        },
        setSpeed: (speed) => {
            const newDuration = 3500 / speed;
            const currentProgress = progressIndex / totalPoints;
            settings.animationDuration = newDuration;
            startTime = performance.now() - (currentProgress * newDuration);
        },
        getProgress: () => progressIndex / totalPoints,
        isComplete: () => progressIndex >= totalPoints - 1,
        isPaused: () => isPaused
    };
}