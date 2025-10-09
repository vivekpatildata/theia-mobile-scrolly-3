// Chapter 5 Animation - Re-animates Chapter 4 path (slower)
// Shows Chapter 4 path (static) + re-animates it slower for emphasis
// Mobile-optimized and production-ready

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
    let chapter5CleanupCallbacks = [];
    
    // Hide any pre-loaded chapter5 layers
    if (map.getLayer('chapter5-layer')) {
        map.setPaintProperty('chapter5-layer', 'line-opacity', 0);
    }
    if (map.getLayer('chapter5-glow')) {
        map.setPaintProperty('chapter5-glow', 'line-opacity', 0);
    }
    
    // Cleanup function
    const cleanup = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
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
            if (map.getLayer(id)) map.removeLayer(id);
        });
        
        // Remove sources
        if (map.getSource(chapter4SourceId)) map.removeSource(chapter4SourceId);
        if (map.getSource(chapter5SourceId)) map.removeSource(chapter5SourceId);
    };
    
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
    const fadeInterval = setInterval(() => {
        opacity += 0.05;
        if (opacity >= 0.9) {
            opacity = 0.9;
            clearInterval(fadeInterval);
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
        clearInterval(fadeInterval);
    });
    
    // Start animation (slower)
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
            animateChapter5(map, chapter4Data, vesselMarker, config);
        },
        setSpeed: (speed) => {
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