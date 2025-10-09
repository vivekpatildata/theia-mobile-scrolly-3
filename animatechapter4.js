// Chapter 4 Animation - 27-Hour Drift to Atlantic
// Progressive linestring animation showing vessel drift pattern
// Mobile-optimized and production-ready

function animateChapter4(map, geojsonData, vesselMarker, config = {}) {
    // Configuration with sensible defaults
    const settings = {
        animationDuration: config.duration || 3500,  // Slightly slower for drift feel
        lineColor: config.lineColor || '#00ff88',
        lineWidth: config.lineWidth || 3,
        glowColor: config.glowColor || '#00ff88',
        glowWidth: config.glowWidth || 8,
        glowOpacity: config.glowOpacity || 0.35,
        vesselMoveSpeed: config.vesselMoveSpeed || 1.0,
        fadeInDuration: config.fadeInDuration || 400,
        ...config
    };
    
    const sourceId = 'chapter4-progress-source';
    const layerId = 'chapter4-progress-layer';
    const glowLayerId = 'chapter4-progress-glow';
    
    const coordinates = geojsonData.features[0].geometry.coordinates;
    const totalPoints = coordinates.length;
    
    let animationFrameId = null;
    let progressIndex = 0;
    let startTime = null;
    let isPaused = false;
    let chapter4CleanupCallbacks = [];
    
    // Hide pre-loaded chapter4 layers if they exist
    if (map.getLayer('chapter4-layer')) {
        map.setPaintProperty('chapter4-layer', 'line-opacity', 0);
    }
    if (map.getLayer('chapter4-glow')) {
        map.setPaintProperty('chapter4-glow', 'line-opacity', 0);
    }
    
    // Cleanup function
    const cleanup = () => {
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
            if (map.getLayer(id)) {
                map.removeLayer(id);
            }
        });
        
        // Remove source
        if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
        }
    };
    
    // Create progress geojson (starts with just first point)
    const progressGeojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: [coordinates[0]]
        }
    };
    
    // Add source
    map.addSource(sourceId, {
        type: 'geojson',
        data: progressGeojson
    });
    
    // Add glow layer (underneath main line)
    map.addLayer({
        id: glowLayerId,
        type: 'line',
        source: sourceId,
        layout: { 
            'line-join': 'round', 
            'line-cap': 'round' 
        },
        paint: {
            'line-color': settings.glowColor,
            'line-width': settings.glowWidth,
            'line-opacity': 0,
            'line-blur': 4
        }
    });
    
    // Add main line layer
    map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: { 
            'line-join': 'round', 
            'line-cap': 'round' 
        },
        paint: {
            'line-color': settings.lineColor,
            'line-width': settings.lineWidth,
            'line-opacity': 0
        }
    });
    
    // Position vessel at start
    vesselMarker.setLngLat(coordinates[0]);
    
    // Fade in animation
    let opacity = 0;
    const fadeSteps = 18;
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
    }, settings.fadeInDuration / fadeSteps);
    
    // Add cleanup for fade interval
    chapter4CleanupCallbacks.push(() => {
        clearInterval(fadeInterval);
    });
    
    // Start animation after fade-in
    setTimeout(() => {
        startTime = performance.now();
        animateTrack();
    }, settings.fadeInDuration);
    
    // Main animation function
    function animateTrack() {
        if (isPaused) return;
        
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / settings.animationDuration, 1);
        
        // Calculate target index based on progress
        const targetIndex = Math.floor(progress * (totalPoints - 1));
        
        // Update line if we've progressed
        if (targetIndex > progressIndex) {
            progressIndex = targetIndex;
            
            // Update the line
            const currentCoords = coordinates.slice(0, progressIndex + 1);
            progressGeojson.geometry.coordinates = currentCoords;
            
            if (map.getSource(sourceId)) {
                map.getSource(sourceId).setData(progressGeojson);
            }
            
            // Update vessel position
            const vesselIndex = Math.min(
                Math.floor(progressIndex * settings.vesselMoveSpeed), 
                totalPoints - 1
            );
            const vesselCoord = coordinates[vesselIndex];
            vesselMarker.setLngLat(vesselCoord);
        }
        
        // Continue animation or finish
        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animateTrack);
        } else {
            // Ensure vessel is at final position
            vesselMarker.setLngLat(coordinates[coordinates.length - 1]);
            
            // Ensure line is complete
            progressGeojson.geometry.coordinates = coordinates;
            if (map.getSource(sourceId)) {
                map.getSource(sourceId).setData(progressGeojson);
            }
        }
    }
    
    // Return control interface
    return {
        /**
         * Pause the animation
         */
        pause: () => {
            isPaused = true;
        },
        
        /**
         * Resume the animation
         */
        resume: () => {
            if (progressIndex >= totalPoints - 1) return;
            isPaused = false;
            startTime = performance.now() - (progressIndex / totalPoints) * settings.animationDuration;
            animateTrack();
        },
        
        /**
         * Stop and cleanup the animation
         */
        stop: cleanup,
        
        /**
         * Reset and restart the animation
         */
        reset: () => {
            cleanup();
            animateChapter4(map, geojsonData, vesselMarker, config);
        },
        
        /**
         * Change animation speed
         * @param {number} speed - Speed multiplier (e.g., 2.0 for 2x speed)
         */
        setSpeed: (speed) => {
            const newDuration = 3500 / speed;
            const currentProgress = progressIndex / totalPoints;
            settings.animationDuration = newDuration;
            startTime = performance.now() - (currentProgress * newDuration);
        },
        
        /**
         * Get current animation progress
         * @returns {number} Progress from 0 to 1
         */
        getProgress: () => {
            return progressIndex / totalPoints;
        },
        
        /**
         * Check if animation is complete
         * @returns {boolean}
         */
        isComplete: () => {
            return progressIndex >= totalPoints - 1;
        },
        
        /**
         * Check if animation is paused
         * @returns {boolean}
         */
        isPaused: () => {
            return isPaused;
        }
    };
}