// Chapter 2 Animation - Baltic Exit
// Progressive AIS track animation - Chapter 1 visible, Chapter 2 animates

function animateChapter2(map, geojsonData, vesselMarker, config = {}) {
    // Configuration with defaults
    const settings = {
        animationDuration: config.duration || 3000, // 3 seconds to draw full track
        lineColor: config.lineColor || '#00ff88',
        lineWidth: config.lineWidth || 3,
        glowColor: config.glowColor || '#00ff88',
        glowWidth: config.glowWidth || 8,
        vesselMoveSpeed: config.vesselMoveSpeed || 1.0,
        fadeInDuration: config.fadeInDuration || 400,
        ...config
    };
    
    const sourceId = 'chapter2-progress-source';
    const layerId = 'chapter2-progress-layer';
    const glowLayerId = 'chapter2-progress-glow';
    
    // Get coordinates from GeoJSON
    const coordinates = geojsonData.features[0].geometry.coordinates;
    const totalPoints = coordinates.length;
    
    // Animation state
    let animationFrameId = null;
    let progressIndex = 0;
    let startTime = null;
    let isPaused = false;
    
    // CRITICAL: Hide pre-loaded chapter2 layers IMMEDIATELY (before anything else)
    // This prevents the flash of already-plotted data
    // Chapter 1 layers remain visible (handled by map.js)
    if (map.getLayer('chapter2-layer')) {
        map.setPaintProperty('chapter2-layer', 'line-opacity', 0);
    }
    if (map.getLayer('chapter2-glow')) {
        map.setPaintProperty('chapter2-glow', 'line-opacity', 0);
    }
    
    // Cleanup function
    const cleanup = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        [glowLayerId, layerId].forEach(id => {
            if (map.getLayer(id)) map.removeLayer(id);
        });
        
        if (map.getSource(sourceId)) map.removeSource(sourceId);
        
        // Do NOT restore pre-loaded layers - they stay hidden
    };
    
    // Initial cleanup
    cleanup();
    
    // Add progress source (starts with single point - nothing visible yet)
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
    
    // Add glow layer (starts invisible)
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
            'line-opacity': 0,  // Start at 0
            'line-blur': 4
        }
    });
    
    // Add main track layer (starts invisible)
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
            'line-opacity': 0  // Start at 0
        }
    });
    
    // Position vessel at start of Chapter 2
    vesselMarker.setLngLat(coordinates[0]);
    
    // Fade in layers quickly, then start animation
    fadeInLayers();
    
    setTimeout(() => {
        startTime = performance.now();
        animateTrack();
    }, settings.fadeInDuration);
    
    // Fade in animation
    function fadeInLayers() {
        let opacity = 0;
        const fadeInterval = setInterval(() => {
            opacity += 0.05;
            if (opacity >= 0.9) {
                opacity = 0.9;
                clearInterval(fadeInterval);
            }
            map.setPaintProperty(layerId, 'line-opacity', opacity);
            map.setPaintProperty(glowLayerId, 'line-opacity', opacity * 0.35);
        }, settings.fadeInDuration / 18);
    }
    
    // Main animation loop
    function animateTrack() {
        if (isPaused) return;
        
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / settings.animationDuration, 1);
        
        // Calculate current point index based on progress
        const targetIndex = Math.floor(progress * (totalPoints - 1));
        
        // Update progress if we've moved to next point
        if (targetIndex > progressIndex) {
            progressIndex = targetIndex;
            
            // Update the animated line - THIS is what makes it draw progressively
            const currentCoords = coordinates.slice(0, progressIndex + 1);
            progressGeojson.geometry.coordinates = currentCoords;
            map.getSource(sourceId).setData(progressGeojson);
            
            // Move vessel marker
            const vesselIndex = Math.min(
                Math.floor(progressIndex * settings.vesselMoveSpeed), 
                totalPoints - 1
            );
            vesselMarker.setLngLat(coordinates[vesselIndex]);
        }
        
        // Continue animation or complete
        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animateTrack);
        } else {
            onAnimationComplete();
        }
    }
    
    // Animation completion
    function onAnimationComplete() {
        // Ensure vessel is at final position
        vesselMarker.setLngLat(coordinates[coordinates.length - 1]);
        
        // Show full track
        progressGeojson.geometry.coordinates = coordinates;
        map.getSource(sourceId).setData(progressGeojson);
    }
    
    // Return control object
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