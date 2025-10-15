// Chapter 5 Animation - Re-animates Chapter 4 path (slower)
// Shows Chapter 4 path (static) + re-animates it slower for emphasis
// Mobile-optimized and production-ready
// COMPREHENSIVE CLEANUP - Prevents residue from other chapters

function animateChapter5(map, chapter4Data, vesselMarker, config = {}) {
    const settings = {
        animationDuration: config.duration || 4500, // 1 second slower than chapter 4
        lineColor: config.lineColor || '#00ff88',
        lineWidth: config.lineWidth || 3,
        glowColor: config.glowColor || '#00ff88',
        glowWidth: config.glowWidth || 8,
        glowOpacity: config.glowOpacity || 0.35,
        vesselMoveSpeed: config.vesselMoveSpeed || 1.0,
        fadeInDuration: config.fadeInDuration || 400,
        chapter4Opacity: config.chapter4Opacity || 0.4, // Chapter 4 shows dimmer
        ...config
    };
    
    const chapter4SourceId = 'chapter5-chapter4-source';
    const chapter4LayerId = 'chapter5-chapter4-layer';
    const chapter4GlowId = 'chapter5-chapter4-glow';
    
    const chapter5SourceId = 'chapter5-progress-source';
    const chapter5LayerId = 'chapter5-progress-layer';
    const chapter5GlowId = 'chapter5-progress-glow';
    
    const chapter4Coords = chapter4Data.features[0].geometry.coordinates;
    const totalPoints = chapter4Coords.length;
    
    let animationFrameId = null;
    let progressIndex = 0;
    let startTime = null;
    let isPaused = false;
    let isStopped = false; // NEW: Track if animation is stopped
    let chapter5CleanupCallbacks = [];
    let fadeInterval = null; // NEW: Track fade interval
    let delayTimeouts = []; // NEW: Track all timeouts
    
    console.log('🎬 Chapter 5: Starting Atlantic Crossing animation');
    
    // COMPREHENSIVE CLEANUP - Prevents residue from Chapter 6 and other chapters
    const cleanup = () => {
        console.log('🧹 Chapter 5: Comprehensive cleanup starting...');
        
        // CRITICAL: Stop all activity immediately
        isStopped = true;
        
        // CRITICAL: Clear ALL timeouts immediately
        delayTimeouts.forEach(timeout => {
            if (timeout) {
                clearTimeout(timeout);
            }
        });
        delayTimeouts = [];
        console.log('  ✓ All timeouts cleared');
        
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
        
        // AGGRESSIVE POPUP REMOVAL - Remove ALL popups from previous chapters
        const popups = document.querySelectorAll('.mapboxgl-popup');
        popups.forEach(popup => {
            console.log('🗑️ Removing lingering popup from previous chapter');
            popup.remove();
        });
        
        // FORCE remove ALL Chapter 6 popups and elements
        document.querySelectorAll('.chapter6-popup').forEach(el => {
            el.remove();
            console.log('  ✓ Force removed chapter6 popup');
        });
        
        // Remove Chapter 6 specific elements
        document.querySelectorAll('.chapter6-detection-marker').forEach(el => el.remove());
        document.querySelectorAll('.sts-transfer-zone').forEach(el => el.remove());
        document.querySelectorAll('[class*="chapter6"]').forEach(el => {
            if (!el.id || el.id !== 'chapter6-styles') {
                el.remove();
            }
        });
        
        // Remove any satellite detection markers from previous chapters
        document.querySelectorAll('[class*="satellite"]').forEach(el => el.remove());
        document.querySelectorAll('[class*="detection"]').forEach(el => el.remove());
        
        // Clean up any animation-specific elements from previous chapters
        document.querySelectorAll('[class*="drift"]').forEach(el => el.remove());
        document.querySelectorAll('[class*="sts"]').forEach(el => el.remove());
        
        // CRITICAL: Remove any elements with position fixed/absolute from previous chapters
        document.querySelectorAll('[style*="position: fixed"], [style*="position: absolute"]').forEach(el => {
            // Don't remove UI elements
            if (!el.closest('#vesselInfoPanel') && 
                !el.closest('#datetimeDisplay') && 
                !el.closest('#miniMapContainer') &&
                !el.closest('.story-progress') &&
                !el.closest('.logo-container') &&
                !el.closest('.legend-bar') &&
                !el.closest('.mapboxgl-marker') &&
                el.closest('#map')) { // Only elements inside map
                console.log('🗑️ Removing lingering positioned element from previous chapter');
                el.remove();
            }
        });
        
        // Run all registered cleanup callbacks
        chapter5CleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (e) {
                console.warn('Chapter 5 cleanup callback error:', e);
            }
        });
        chapter5CleanupCallbacks = [];
        
        // Remove all chapter 5 layers
        [chapter4GlowId, chapter4LayerId, chapter5GlowId, chapter5LayerId].forEach(id => {
            if (map.getLayer(id)) {
                try {
                    map.removeLayer(id);
                } catch (e) {
                    console.warn(`Error removing layer ${id}:`, e);
                }
            }
        });
        
        // Remove sources
        if (map.getSource(chapter4SourceId)) {
            try {
                map.removeSource(chapter4SourceId);
            } catch (e) {
                console.warn(`Error removing source ${chapter4SourceId}:`, e);
            }
        }
        if (map.getSource(chapter5SourceId)) {
            try {
                map.removeSource(chapter5SourceId);
            } catch (e) {
                console.warn(`Error removing source ${chapter5SourceId}:`, e);
            }
        }
        
        // Clear state
        progressIndex = 0;
        startTime = null;
        
        console.log('✅ Chapter 5: Cleanup complete');
    };
    
    // Hide any pre-loaded chapter5 layers
    if (map.getLayer('chapter5-layer')) {
        map.setPaintProperty('chapter5-layer', 'line-opacity', 0);
    }
    if (map.getLayer('chapter5-glow')) {
        map.setPaintProperty('chapter5-glow', 'line-opacity', 0);
    }
    
    // Add Chapter 4 path (static, dimmer background)
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
            'line-color': settings.glowColor,
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
            'line-color': settings.lineColor,
            'line-width': settings.lineWidth,
            'line-opacity': 0
        }
    });
    
    // Add Chapter 5 path (re-animates same Chapter 4 data, but slower)
    const progressGeojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: [chapter4Coords[0]]
        }
    };
    
    map.addSource(chapter5SourceId, {
        type: 'geojson',
        data: progressGeojson
    });
    
    map.addLayer({
        id: chapter5GlowId,
        type: 'line',
        source: chapter5SourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': settings.glowColor,
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
            'line-color': settings.lineColor,
            'line-width': settings.lineWidth,
            'line-opacity': 0
        }
    });
    
    // Position vessel at start of Chapter 4 path
    vesselMarker.setLngLat(chapter4Coords[0]);
    
    // Fade in both paths
    let opacity = 0;
    const fadeSteps = 18;
    fadeInterval = setInterval(() => {
        // Check if stopped
        if (isStopped) {
            clearInterval(fadeInterval);
            fadeInterval = null;
            return;
        }
        
        opacity += 0.05;
        if (opacity >= 0.9) {
            opacity = 0.9;
            clearInterval(fadeInterval);
            fadeInterval = null;
        }
        
        // Chapter 4 (background) fades in dimmer
        if (map.getLayer(chapter4LayerId)) {
            map.setPaintProperty(chapter4LayerId, 'line-opacity', opacity * settings.chapter4Opacity);
        }
        if (map.getLayer(chapter4GlowId)) {
            map.setPaintProperty(chapter4GlowId, 'line-opacity', opacity * settings.chapter4Opacity * 0.5);
        }
        
        // Chapter 5 (animated) fades in normal
        if (map.getLayer(chapter5LayerId)) {
            map.setPaintProperty(chapter5LayerId, 'line-opacity', opacity);
        }
        if (map.getLayer(chapter5GlowId)) {
            map.setPaintProperty(chapter5GlowId, 'line-opacity', opacity * settings.glowOpacity);
        }
    }, settings.fadeInDuration / fadeSteps);
    
    chapter5CleanupCallbacks.push(() => {
        if (fadeInterval) clearInterval(fadeInterval);
    });
    
    // Start animation (slower)
    const startTimeout = setTimeout(() => {
        // Check if stopped before starting
        if (isStopped) return;
        
        startTime = performance.now();
        animateTrack();
    }, settings.fadeInDuration);
    
    delayTimeouts.push(startTimeout);
    
    chapter5CleanupCallbacks.push(() => {
        clearTimeout(startTimeout);
    });
    
    // Main animation function
    function animateTrack() {
        // Check if stopped
        if (isPaused || isStopped) return;
        
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / settings.animationDuration, 1);
        const targetIndex = Math.floor(progress * (totalPoints - 1));
        
        if (targetIndex > progressIndex) {
            progressIndex = targetIndex;
            
            const currentCoords = chapter4Coords.slice(0, progressIndex + 1);
            progressGeojson.geometry.coordinates = currentCoords;
            
            if (map.getSource(chapter5SourceId)) {
                map.getSource(chapter5SourceId).setData(progressGeojson);
            }
            
            const vesselIndex = Math.min(
                Math.floor(progressIndex * settings.vesselMoveSpeed), 
                totalPoints - 1
            );
            const vesselCoord = chapter4Coords[vesselIndex];
            vesselMarker.setLngLat(vesselCoord);
        }
        
        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animateTrack);
        } else {
            vesselMarker.setLngLat(chapter4Coords[chapter4Coords.length - 1]);
            progressGeojson.geometry.coordinates = chapter4Coords;
            if (map.getSource(chapter5SourceId)) {
                map.getSource(chapter5SourceId).setData(progressGeojson);
            }
            console.log('✅ Chapter 5: Animation complete');
        }
    }
    
    return {
        pause: () => { isPaused = true; },
        resume: () => {
            if (progressIndex >= totalPoints - 1 || isStopped) return;
            isPaused = false;
            startTime = performance.now() - (progressIndex / totalPoints) * settings.animationDuration;
            animateTrack();
        },
        stop: cleanup,
        reset: () => {
            cleanup();
            animateChapter5(map, chapter4Data, vesselMarker, config);
        },
        setSpeed: (speed) => {
            if (isStopped) return;
            const newDuration = 4500 / speed;
            const currentProgress = progressIndex / totalPoints;
            settings.animationDuration = newDuration;
            startTime = performance.now() - (currentProgress * newDuration);
        },
        getProgress: () => progressIndex / totalPoints,
        isComplete: () => progressIndex >= totalPoints - 1,
        isPaused: () => isPaused
    };
}