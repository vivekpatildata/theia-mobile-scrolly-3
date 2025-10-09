// ============================================================================
// THEIA MARITIME INTELLIGENCE - AKADEMIK GUBKIN TRACKER
// Professional Scrollytelling Experience v3.0
// ============================================================================

mapboxgl.accessToken = 'pk.eyJ1Ijoidml2ZWtwYXRpbDE3IiwiYSI6ImNseHV4bzJoMzFycXgybG9tN3ptZXd1d2QifQ.wbdQPBUeYDHlbwnmgHHI9g';

// ============================================================================
// GLOBAL STATE MANAGEMENT
// ============================================================================
const STATE = {
    map: null,
    miniMap: null,
    vesselMarker: null,
    vessel2Marker: null,
    miniMarker: null,
    scroller: null,
    currentChapter: -1,
    previousChapter: -1,
    isTransitioning: false,
    pendingChapter: null,
    isMobile: window.innerWidth <= 768,
    isInitialized: false,
    layersReady: false,
    chapterData: {},
    vessel2Data: null,
    loadedLayers: new Set(),
    activeAnimations: new Map()
};

// ============================================================================
// TIMELINE DATA - Matches voyage progression
// ============================================================================
const TIMELINE_DATA = [
    { date: "AUG 30, 2025", time: "08:00 UTC", elapsed: "DAY 1", event: "Story Begins" },
    { date: "APR 05, 2025", time: "12:00 UTC", elapsed: "DAY -146", event: "Anchorage Begins" },
    { date: "AUG 30, 2025", time: "08:00 UTC", elapsed: "DAY 1", event: "Ust-Luga Loading" },
    { date: "SEP 02, 2025", time: "14:00 UTC", elapsed: "DAY 3", event: "Baltic Transit" },
    { date: "SEP 07, 2025", time: "11:15 UTC", elapsed: "DAY 8", event: "Drift Begins" },
    { date: "SEP 15, 2025", time: "10:00 UTC", elapsed: "DAY 16", event: "Mid-Atlantic" },
    { date: "SEP 26, 2025", time: "08:00 UTC", elapsed: "DAY 27", event: "Arrives Cuba" },
    { date: "OCT 02, 2025", time: "14:00 UTC", elapsed: "DAY 33", event: "STS Complete" }
];

// ============================================================================
// CHAPTER CONFIGURATIONS - Enhanced with better easing
// ============================================================================
const CHAPTERS = {
    0: {
        name: 'Introduction',
        center: [-10, 40],
        zoom: 2.5,
        pitch: 0,
        bearing: 0,
        duration: 3000,
        curve: 1.2,
        geojson: null,
        animate: null,
        showLayers: [],
        hideAllLayers: true,
        showLegend: false,
        showVessel2: false
    },
    1: {
        name: 'Ust-Luga Loading',
        center: [28.64559, 59.93183],
        zoom: 12.97,
        pitch: 0,
        bearing: 0,
        duration: 3000,
        curve: 1.3,
        geojson: 'chapter1data.geojson',
        animate: 'animateChapter1',
        showLayers: [1],
        hideAllLayers: false,
        showLegend: true,
        showVessel2: false
    },
    2: {
        name: 'Baltic Exit',
        center: [28.43531, 59.71218],
        zoom: 12.24,
        pitch: 0,
        bearing: 0,
        duration: 3000,
        curve: 1.3,
        geojson: 'chapter2data.geojson',
        animate: 'animateChapter2',
        showLayers: [1, 2],
        hideAllLayers: false,
        showLegend: true,
        showVessel2: false
    },
    3: {
        name: 'North Sea Transit',
        center: [12.73, 59.16],
        zoom: 3.99,
        pitch: 0,
        bearing: 0,
        duration: 3500,
        curve: 1.4,
        geojson: 'chapter3data.geojson',
        animate: 'animateChapter3',
        showLayers: [1, 2, 3],
        hideAllLayers: false,
        showLegend: true,
        showVessel2: false
    },
    4: {
        name: 'Norwegian Sea to Atlantic',
        center: [4.1689, 63.3852],
        zoom: 9.57,
        pitch: 30,
        bearing: 10,
        duration: 3500,
        curve: 1.4,
        geojson: 'chapter4data.geojson',
        animate: 'animateChapter4',
        showLayers: [1, 2, 3, 4],
        hideAllLayers: false,
        showLegend: true,
        showVessel2: false
    },
    5: {
        name: 'Mid-Atlantic to Haiti',
        center: [-53.23, 23.58],
        zoom: 3.36,
        pitch: 0,
        bearing: 23.2,
        duration: 3500,
        curve: 1.5,
        geojson: 'chapter5data.geojson',
        animate: 'animateChapter5',
        showLayers: [1, 2, 3, 4, 5],
        hideAllLayers: false,
        showLegend: true,
        showVessel2: false
    },
    6: {
        name: 'Haiti Arrival - STS Transfer',
        center: [-75.57254, 20.79897],
        zoom: 13,
        pitch: 5,
        bearing: 2,
        duration: 3500,
        curve: 1.3,
        geojson: null, // Not needed, animateChapter6 handles data
        animate: 'animateChapter6',
        showLayers: [1, 2, 3, 4, 5],
        hideAllLayers: false,
        showLegend: true,
        showVessel2: true
    },
    7: {
        name: 'Key Findings',
        center: [-36.76, 49.33],
        zoom: 2,
        pitch: 0,
        bearing: 8.4,
        duration: 3000,
        curve: 1.2,
        geojson: null,
        animate: 'animateChapter7',
        showLayers: [1, 2, 3, 4, 5],
        hideAllLayers: false,
        showLegend: false,
        showVessel2: false
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function checkMobile() {
    STATE.isMobile = window.innerWidth <= 768;
    return STATE.isMobile;
}

function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) console.warn(`Element ${id} not found`);
    return element;
}

// ============================================================================
// RING MARKER CREATION - Enhanced animation
// ============================================================================

function createRingMarker(color, size = 24) {
    const el = document.createElement('div');
    el.className = 'vessel-ring-marker';
    el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid ${color};
        background: transparent;
        box-shadow: 0 0 20px ${color}, inset 0 0 10px ${color};
        position: relative;
    `;
    
    // Add inner glow
    const innerGlow = document.createElement('div');
    innerGlow.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${color};
        box-shadow: 0 0 10px ${color};
    `;
    el.appendChild(innerGlow);
    
    // Add CSS animation if not already added
    if (!document.getElementById('ringPulseAnimation')) {
        const style = document.createElement('style');
        style.id = 'ringPulseAnimation';
        style.textContent = `
            @keyframes ringPulse {
                0%, 100% {
                    opacity: 1;
                    transform: scale(1);
                }
                50% {
                    opacity: 0.5;
                    transform: scale(1.2);
                }
            }
            .vessel-ring-marker {
                animation: ringPulse 2s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
    }
    
    return el;
}

// ============================================================================
// DATA LOADING - Enhanced with better error handling
// ============================================================================

async function loadChapterData() {
    console.log('📦 Loading chapter data...');
    const loadPromises = [];
    
    // Load chapter data files (1-5)
    for (let i = 1; i <= 5; i++) {
        loadPromises.push(
            fetch(`chapter${i}data.geojson`)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    STATE.chapterData[i] = data;
                    console.log(`✓ Chapter ${i} data loaded (${data.features[0].geometry.coordinates.length} points)`);
                    return { chapter: i, success: true };
                })
                .catch(error => {
                    console.warn(`⚠ Chapter ${i} data not found:`, error.message);
                    STATE.chapterData[i] = null;
                    return { chapter: i, success: false };
                })
        );
    }
    
    // Load vessel2 data
    loadPromises.push(
        fetch('vessel2.geojson')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                STATE.vessel2Data = data;
                console.log(`✓ Vessel2 (LOURDES) data loaded (${data.features[0].geometry.coordinates.length} points)`);
                return { vessel2: true, success: true };
            })
            .catch(error => {
                console.warn('⚠ Vessel2 data not found:', error.message);
                STATE.vessel2Data = null;
                return { vessel2: true, success: false };
            })
    );
    
    const results = await Promise.all(loadPromises);
    const successCount = results.filter(r => r.success).length;
    console.log(`✓ Data loading complete: ${successCount}/${results.length} files loaded`);
    
    return successCount > 0;
}

// ============================================================================
// MINI MAP - Enhanced with larger size and light style
// ============================================================================

function initMiniMap() {
    if (STATE.miniMap) return;
    
    try {
        const container = document.getElementById('miniMap');
        if (!container) {
            console.warn('Mini map container not found');
            return;
        }
        
        // Clear and recreate container to ensure clean slate
        const parent = container.parentElement;
        parent.innerHTML = `
            <div id="miniMap" style="width: 170px; height: 90px; overflow: hidden;"></div>
            <div class="map-label">GLOBAL POSITION</div>
        `;
        
        // Create mini map with light style for better readability
        STATE.miniMap = new mapboxgl.Map({
            container: 'miniMap',
            style: 'mapbox://styles/mapbox/light-v11', // Light style for better readability
            center: [0, 30],
            zoom: 0.8,
            interactive: false,
            attributionControl: false,
            logoPosition: 'bottom-right',
            preserveDrawingBuffer: true
        });
        
        // Ensure map resizes properly
        STATE.miniMap.on('load', () => {
            STATE.miniMap.resize();
        });
        
        // Create enhanced marker
        const markerEl = document.createElement('div');
        markerEl.style.cssText = `
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #00ff88;
            border: 2px solid white;
            box-shadow: 0 0 15px rgba(0, 255, 136, 0.9), 0 0 5px rgba(0, 255, 136, 1);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        STATE.miniMarker = new mapboxgl.Marker(markerEl)
            .setLngLat([0, 30])
            .addTo(STATE.miniMap);
        
        console.log('✓ Enhanced mini map initialized (light style, improved visibility)');
    } catch (error) {
        console.error('Mini map initialization error:', error);
    }
}

function updateMiniMap(lng, lat) {
    if (!STATE.miniMarker || !STATE.miniMap) return;
    
    try {
        STATE.miniMarker.setLngLat([lng, lat]);
        STATE.miniMap.easeTo({
            center: [lng, lat],
            duration: 1200,
            easing: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        });
    } catch (error) {
        console.warn('Mini map update error:', error);
    }
}

// ============================================================================
// LAYER MANAGEMENT - Enhanced with better persistence
// ============================================================================

function addLayerToMap(chapterNum) {
    if (STATE.loadedLayers.has(chapterNum) || !STATE.chapterData[chapterNum]) {
        return;
    }
    
    const sourceId = `chapter${chapterNum}-source`;
    const layerId = `chapter${chapterNum}-layer`;
    const glowLayerId = `chapter${chapterNum}-glow`;
    
    try {
        // Add source
        if (!STATE.map.getSource(sourceId)) {
            STATE.map.addSource(sourceId, {
                type: 'geojson',
                data: STATE.chapterData[chapterNum],
                lineMetrics: true
            });
        }
        
        // Add glow layer (background)
        if (!STATE.map.getLayer(glowLayerId)) {
            STATE.map.addLayer({
                id: glowLayerId,
                type: 'line',
                source: sourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#00ff88',
                    'line-width': 8,
                    'line-opacity': 0,
                    'line-blur': 4
                }
            });
        }
        
        // Add main layer (foreground)
        if (!STATE.map.getLayer(layerId)) {
            STATE.map.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#00ff88',
                    'line-width': 3,
                    'line-opacity': 0
                }
            });
        }
        
        STATE.loadedLayers.add(chapterNum);
        console.log(`✓ Chapter ${chapterNum} layers added`);
    } catch (error) {
        console.error(`Error adding chapter ${chapterNum} layers:`, error);
    }
}

function ensureLayersLoaded(chapters) {
    chapters.forEach(chapterNum => {
        if (!STATE.loadedLayers.has(chapterNum)) {
            addLayerToMap(chapterNum);
        }
    });
}

function addVessel2Layers() {
    if (!STATE.vessel2Data || STATE.loadedLayers.has('vessel2')) return;
    
    try {
        // Add source
        if (!STATE.map.getSource('vessel2-data')) {
            STATE.map.addSource('vessel2-data', {
                type: 'geojson',
                data: STATE.vessel2Data,
                lineMetrics: true
            });
        }
        
        // Add glow layer
        if (!STATE.map.getLayer('vessel2-glow')) {
            STATE.map.addLayer({
                id: 'vessel2-glow',
                type: 'line',
                source: 'vessel2-data',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#eff379',
                    'line-width': 8,
                    'line-opacity': 0,
                    'line-blur': 4
                }
            });
        }
        
        // Add main layer
        if (!STATE.map.getLayer('vessel2-layer')) {
            STATE.map.addLayer({
                id: 'vessel2-layer',
                type: 'line',
                source: 'vessel2-data',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#eff379',
                    'line-width': 3,
                    'line-opacity': 0
                }
            });
        }
        
        STATE.loadedLayers.add('vessel2');
        console.log('✓ Vessel2 (LOURDES) layers added');
    } catch (error) {
        console.error('Error adding vessel2 layers:', error);
    }
}

function updateLayerVisibility(layersToShow, immediate = false) {
    const duration = immediate ? 0 : 600;
    
    // Update main vessel layers (1-5)
    for (let i = 1; i <= 5; i++) {
        const layerId = `chapter${i}-layer`;
        const glowLayerId = `chapter${i}-glow`;
        
        if (STATE.map.getLayer(layerId)) {
            const shouldShow = layersToShow.includes(i);
            const targetOpacity = shouldShow ? 0.5 : 0;
            const targetGlowOpacity = shouldShow ? 0.15 : 0;
            
            if (immediate) {
                STATE.map.setPaintProperty(layerId, 'line-opacity', targetOpacity);
                STATE.map.setPaintProperty(glowLayerId, 'line-opacity', targetGlowOpacity);
            } else {
                animateProperty(layerId, 'line-opacity', targetOpacity, duration);
                animateProperty(glowLayerId, 'line-opacity', targetGlowOpacity, duration);
            }
        }
    }
}

function updateVessel2Visibility(show, immediate = false) {
    if (!STATE.loadedLayers.has('vessel2')) {
        addVessel2Layers();
    }
    
    if (STATE.map.getLayer('vessel2-layer') && STATE.map.getLayer('vessel2-glow')) {
        const duration = immediate ? 0 : 600;
        const targetOpacity = show ? 0.5 : 0;
        const targetGlowOpacity = show ? 0.15 : 0;
        
        if (immediate) {
            STATE.map.setPaintProperty('vessel2-layer', 'line-opacity', targetOpacity);
            STATE.map.setPaintProperty('vessel2-glow', 'line-opacity', targetGlowOpacity);
        } else {
            animateProperty('vessel2-layer', 'line-opacity', targetOpacity, duration);
            animateProperty('vessel2-glow', 'line-opacity', targetGlowOpacity, duration);
        }
    }
}

function animateProperty(layerId, property, targetValue, duration) {
    if (!STATE.map.getLayer(layerId)) return;
    
    const startValue = STATE.map.getPaintProperty(layerId, property) || 0;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        const currentValue = startValue + (targetValue - startValue) * eased;
        
        try {
            STATE.map.setPaintProperty(layerId, property, currentValue);
        } catch (error) {
            console.warn(`Animation error for ${layerId}:`, error);
            return;
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// ============================================================================
// UI UPDATE FUNCTIONS - Enhanced
// ============================================================================

function updateVesselPanel(chapterNum) {
    const panel = safeGetElement('vesselInfoPanel');
    if (!panel) return;
    
    const elements = {
        label1: safeGetElement('infoLabel1'),
        name: safeGetElement('vesselName'),
        imo: safeGetElement('vesselIMO'),
        label2: safeGetElement('infoLabel2'),
        value2: safeGetElement('infoValue2'),
        label3: safeGetElement('infoLabel3'),
        value3: safeGetElement('infoValue3')
    };
    
    // Fade out
    panel.style.opacity = '0';
    
    setTimeout(() => {
        if (chapterNum === 6) {
            // Chapter 6: Dual vessel display
            panel.classList.add('dual-vessel');
            
            if (elements.label1) elements.label1.textContent = 'VESSEL 1';
            if (elements.name) elements.name.innerHTML = '<span class="vessel-indicator vessel-1-indicator"></span>AKADEMIK GUBKIN';
            if (elements.imo) elements.imo.textContent = '9842190';
            
            if (elements.label2) elements.label2.textContent = 'VESSEL 2';
            if (elements.value2) elements.value2.innerHTML = '<span class="vessel-indicator vessel-2-indicator"></span>LOURDES / 9259692';
            
            if (elements.label3) elements.label3.textContent = 'OPERATION';
            if (elements.value3) elements.value3.textContent = 'STS TRANSFER';
        } else {
            // Default: Single vessel display
            panel.classList.remove('dual-vessel');
            
            if (elements.label1) elements.label1.textContent = 'VESSEL / IMO';
            if (elements.name) elements.name.textContent = 'AKADEMIK GUBKIN';
            if (elements.imo) elements.imo.textContent = '9842190';
            
            if (elements.label2) elements.label2.textContent = 'VOYAGE PERIOD';
            if (elements.value2) elements.value2.textContent = 'AUG 30 - OCT 2';
            
            if (elements.label3) elements.label3.textContent = 'CARGO';
            if (elements.value3) elements.value3.textContent = 'RUSSIAN CRUDE';
        }
        
        // Fade in
        panel.style.transition = 'opacity 0.4s ease';
        panel.style.opacity = '1';
    }, 200);
}

function updateLegend(chapterNum) {
    const legendBar = document.querySelector('.legend-bar');
    if (!legendBar) return;
    
    if (chapterNum >= 1 && chapterNum <= 6) {
        legendBar.style.display = 'flex';
        legendBar.style.opacity = '0';
        
        setTimeout(() => {
            if (chapterNum === 6) {
                legendBar.innerHTML = `
                    <div class="legend-item">
                        <span class="legend-dot ais"></span>
                        <span>AKADEMIK GUBKIN</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-dot vessel2"></span>
                        <span>LOURDES</span>
                    </div>
                `;
            } else {
                legendBar.innerHTML = `
                    <div class="legend-item">
                        <span class="legend-dot ais"></span>
                        <span>AKADEMIK GUBKIN AIS Track</span>
                    </div>
                `;
            }
            
            legendBar.style.transition = 'opacity 0.4s ease';
            legendBar.style.opacity = '1';
        }, 100);
    } else {
        legendBar.style.opacity = '0';
        setTimeout(() => {
            legendBar.style.display = 'none';
        }, 400);
    }
}

function updateDateTime(index) {
    const data = TIMELINE_DATA[index];
    if (!data) return;
    
    const dateEl = safeGetElement('currentDate');
    const timeEl = safeGetElement('currentTime');
    const elapsedEl = safeGetElement('elapsedTime');
    
    if (!dateEl || !timeEl || !elapsedEl) return;
    
    const elements = [dateEl, timeEl, elapsedEl];
    
    // Fade out
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-5px)';
        el.style.transition = 'all 0.3s ease';
    });
    
    // Update content
    setTimeout(() => {
        dateEl.textContent = data.date;
        timeEl.textContent = data.time;
        elapsedEl.textContent = data.elapsed;
        
        // Staggered fade in
        elements.forEach((el, i) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, i * 80);
        });
    }, 300);
}

function updateProgressBar(chapterNum) {
    const progressFill = safeGetElement('progressFill');
    const progressText = safeGetElement('progressText');
    
    if (!progressFill || !progressText) return;
    
    let progressValue = 0;
    let progressLabel = '';
    
    if (chapterNum === 0) {
        progressValue = 0;
        progressLabel = 'INTRODUCTION';
    } else if (chapterNum >= 1 && chapterNum <= 6) {
        progressValue = (chapterNum / 7) * 100;
        progressLabel = `CHAPTER ${chapterNum} OF 6`;
    } else if (chapterNum === 7) {
        progressValue = 100;
        progressLabel = 'KEY FINDINGS';
    }
    
    progressFill.style.width = progressValue + '%';
    progressText.style.opacity = '0';
    
    setTimeout(() => {
        progressText.textContent = progressLabel;
        progressText.style.transition = 'opacity 0.3s ease';
        progressText.style.opacity = '1';
    }, 150);
}

// ============================================================================
// VESSEL MARKER MANAGEMENT
// ============================================================================

function updateVessel2Marker(show) {
    if (!STATE.vessel2Marker) return;
    
    const vessel2El = STATE.vessel2Marker.getElement();
    
    if (show) {
        vessel2El.style.display = 'block';
        vessel2El.style.opacity = '0';
        vessel2El.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            vessel2El.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            vessel2El.style.opacity = '1';
            vessel2El.style.transform = 'scale(1)';
        }, 100);
    } else {
        vessel2El.style.transition = 'all 0.4s ease';
        vessel2El.style.opacity = '0';
        vessel2El.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            vessel2El.style.display = 'none';
        }, 400);
    }
}

// ============================================================================
// ANIMATION MANAGEMENT
// ============================================================================

function stopAllAnimations() {
    STATE.activeAnimations.forEach((animation, key) => {
        if (animation && typeof animation.stop === 'function') {
            animation.stop();
        }
    });
    STATE.activeAnimations.clear();
}

function startChapterAnimation(chapterNum) {
    const chapter = CHAPTERS[chapterNum];
    if (!chapter.animate) return;
    
    const animateFunc = window[chapter.animate];
    if (typeof animateFunc !== 'function') {
        console.warn(`Animation function ${chapter.animate} not found`);
        return;
    }
    
    try {
        if (chapterNum === 7) {
            // Chapter 7: Journey overview with endpoint markers
            const animation = animateFunc(
                STATE.map,
                STATE.vesselMarker
            );
            STATE.activeAnimations.set(chapterNum, animation);
        } else if (chapterNum === 6 && STATE.vessel2Data && STATE.chapterData[4] && STATE.chapterData[5]) {
            // Chapter 6: Chapter 4 + Chapter 5 + Vessel 2
            const animation = animateFunc(
                STATE.map,
                STATE.chapterData[4],  // Chapter 4 data (static background)
                STATE.chapterData[5],  // Chapter 5 data (animate this)
                STATE.vessel2Data,     // Vessel 2 data (animate this)
                STATE.vesselMarker,
                STATE.vessel2Marker
            );
            STATE.activeAnimations.set(chapterNum, animation);
        } else if (chapterNum === 5 && STATE.chapterData[4]) {
            // Chapter 5: Re-animate Chapter 4 slower
            const animation = animateFunc(
                STATE.map,
                STATE.chapterData[4],
                STATE.vesselMarker
            );
            STATE.activeAnimations.set(chapterNum, animation);
        } else if (chapterNum === 4 && STATE.chapterData[4]) {
            // Chapter 4: Normal animation
            const animation = animateFunc(
                STATE.map,
                STATE.chapterData[4],
                STATE.vesselMarker
            );
            STATE.activeAnimations.set(chapterNum, animation);
        } else if (chapterNum === 3 && STATE.chapterData[3]) {
            // Chapter 3: With satellite detection
            const animation = animateFunc(
                STATE.map,
                STATE.chapterData[3],
                STATE.vesselMarker
            );
            STATE.activeAnimations.set(chapterNum, animation);
        } else if (STATE.chapterData[chapterNum]) {
            // Other chapters: Standard animation
            const animation = animateFunc(
                STATE.map,
                STATE.chapterData[chapterNum],
                STATE.vesselMarker
            );
            STATE.activeAnimations.set(chapterNum, animation);
        }
        
        console.log(`🎬 Animation started for chapter ${chapterNum}`);
    } catch (error) {
        console.error(`Animation error for chapter ${chapterNum}:`, error);
    }
}
// ============================================================================
// CHAPTER NAVIGATION - Enhanced with better state management
// ============================================================================

// ============================================================================
// CHAPTER NAVIGATION - Enhanced with explicit layer management
// ============================================================================
// Layer Visibility Strategy:
// - Chapter 0 (Introduction): No layers visible (hideAllLayers: true)
// - Chapter 1 (Ust-Luga): Only chapter1 layers visible
// - Chapter 2 (Baltic Exit): chapter1 + chapter2 layers visible
// - Chapter 3 (North Sea): chapter1 + chapter2 + chapter3 layers visible
// - Chapter 4 (Norwegian Sea): chapter1-4 layers visible
// - Chapter 5 (Mid-Atlantic): chapter1-5 layers visible
// - Chapter 6 (Haiti STS): chapter1-5 + vessel2 layers visible
// - Chapter 7 (Findings): All layers remain visible
// 
// Implementation: Explicitly hide all layers not in showLayers to prevent
// "ghost" layers from appearing during chapter transitions
// ============================================================================

function flyToChapter(chapterNum) {
    if (!CHAPTERS[chapterNum]) {
        console.warn(`Chapter ${chapterNum} not defined`);
        return;
    }
    
    // Handle fast scrolling - queue chapter if transitioning
    if (STATE.isTransitioning && chapterNum !== STATE.currentChapter) {
        STATE.pendingChapter = chapterNum;
        console.log(`⏸ Queued chapter ${chapterNum}`);
        return;
    }
    
    // Prevent redundant transitions
    if (chapterNum === STATE.currentChapter && !STATE.pendingChapter) {
        return;
    }
    
    STATE.isTransitioning = true;
    STATE.previousChapter = STATE.currentChapter;
    STATE.currentChapter = chapterNum;
    
    const chapter = CHAPTERS[chapterNum];
    console.log(`→ Transitioning to Chapter ${chapterNum}: ${chapter.name}`);
    
    // Stop any running animations
    stopAllAnimations();
    
    // Update UI immediately for responsive feel
    updateProgressBar(chapterNum);
    updateDateTime(chapterNum);
    updateVesselPanel(chapterNum);
    updateLegend(chapterNum);
    
    // Ensure layers are loaded before showing
    if (!chapter.hideAllLayers) {
        ensureLayersLoaded(chapter.showLayers);
    }
    
    // CRITICAL: Explicitly hide all chapter layers that shouldn't be visible
    // This prevents "ghost" layers from appearing when switching chapters
    for (let i = 1; i <= 5; i++) {
        if (!chapter.showLayers.includes(i)) {
            const layerId = `chapter${i}-layer`;
            const glowLayerId = `chapter${i}-glow`;
            if (STATE.map.getLayer(layerId)) {
                STATE.map.setPaintProperty(layerId, 'line-opacity', 0);
            }
            if (STATE.map.getLayer(glowLayerId)) {
                STATE.map.setPaintProperty(glowLayerId, 'line-opacity', 0);
            }
        }
    }
    
    // Handle vessel2 layers
    if (chapter.showVessel2 && !STATE.loadedLayers.has('vessel2')) {
        addVessel2Layers();
    }
    
    // Hide vessel2 if not needed for this chapter
    if (!chapter.showVessel2) {
        if (STATE.map.getLayer('vessel2-layer')) {
            STATE.map.setPaintProperty('vessel2-layer', 'line-opacity', 0);
        }
        if (STATE.map.getLayer('vessel2-glow')) {
            STATE.map.setPaintProperty('vessel2-glow', 'line-opacity', 0);
        }
    }
    
    // Camera movement with enhanced easing
    STATE.map.flyTo({
        center: chapter.center,
        zoom: chapter.zoom,
        pitch: chapter.pitch,
        bearing: chapter.bearing,
        duration: chapter.duration,
        curve: chapter.curve,
        easing: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        essential: true
    });
    
    // Update mini map
    updateMiniMap(chapter.center[0], chapter.center[1]);
    
    // Layer visibility updates - staggered for smooth transition
    setTimeout(() => {
        if (chapter.hideAllLayers) {
            updateLayerVisibility([], false);
            updateVessel2Visibility(false, false);
        } else {
            // For chapters with animations, don't show pre-loaded layers
            // Let the animation handle visibility instead
            const layersToShow = chapter.showLayers.filter(num => num !== chapterNum);
            
            // Show previous chapter layers, but not current chapter (animation handles it)
            updateLayerVisibility(layersToShow, false);
            updateVessel2Visibility(chapter.showVessel2, false);
        }
        
        // Update vessel2 marker
        updateVessel2Marker(chapter.showVessel2);
    }, 200);
    
    // Start chapter animation after layers are visible
    if (chapter.animate) {
        setTimeout(() => {
            startChapterAnimation(chapterNum);
        }, 600);
    }
    
    // Mark transition complete
    setTimeout(() => {
        STATE.isTransitioning = false;
        
        // Process pending chapter
        if (STATE.pendingChapter !== null && STATE.pendingChapter !== STATE.currentChapter) {
            const nextChapter = STATE.pendingChapter;
            STATE.pendingChapter = null;
            console.log(`▶ Processing queued chapter ${nextChapter}`);
            flyToChapter(nextChapter);
        }
    }, chapter.duration * 0.7);
}

// ============================================================================
// SCROLLYTELLING INITIALIZATION - Enhanced
// ============================================================================

function initScrollytelling() {
    if (typeof scrollama === 'undefined') {
        console.error('❌ Scrollama library not loaded');
        return;
    }
    
    STATE.scroller = scrollama();
    
    STATE.scroller
        .setup({
            step: '.step',
            offset: 0.5,
            debug: false,
            progress: true
        })
        .onStepEnter(response => {
            const stepIndex = parseInt(response.element.dataset.step);
            
            // Remove active class from all steps
            document.querySelectorAll('.step').forEach(step => {
                step.classList.remove('is-active');
            });
            
            // Add active class to current step
            response.element.classList.add('is-active');
            
            // Navigate to chapter
            flyToChapter(stepIndex);
        })
        .onStepProgress(response => {
            // Optional: Use progress for smooth transitions
            // Can be used for parallax effects or progressive reveals
        });
    
    // Initialize at introduction
    setTimeout(() => {
        flyToChapter(0);
        STATE.isInitialized = true;
        console.log('✓ Scrollytelling initialized - 8 chapters ready');
    }, 500);
    
    // Handle resize with debouncing
    const handleResize = debounce(() => {
        try {
            checkMobile();
            STATE.map.resize();
            if (STATE.miniMap) STATE.miniMap.resize();
            STATE.scroller.resize();
            console.log(`✓ Resized for ${STATE.isMobile ? 'mobile' : 'desktop'}`);
        } catch (error) {
            console.error('Resize error:', error);
        }
    }, 250);
    
    window.addEventListener('resize', handleResize);
    
    // Ensure we start at the top on page load/refresh
    window.scrollTo(0, 0);
}

// ============================================================================
// MAP INITIALIZATION
// ============================================================================

function initializeMap() {
    console.log('🗺️ Initializing main map...');
    
    STATE.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-20, 60],
        zoom: 10,
        pitch: 0,
        bearing: 0,
        interactive: false,
        antialias: true,
        fadeDuration: 300
    });
    // STATE.map.on('load', () => {
    //     // Soft ocean tint (balanced light/dark)
    //     STATE.map.addLayer({
    //       id: 'ocean-tint',
    //       type: 'background',
    //       paint: {
    //         'background-color': '#244B5A',
    //         'background-opacity': 0.1
    //       }
    //     });
      
    //     // Smooth atmosphere without stars
    //     STATE.map.setFog({
    //       range: [0.5, 10],
    //       color: 'rgba(80, 130, 150, 0.25)',      // gentle aqua tone
    //       'high-color': 'rgba(180, 220, 235, 0.1)', // soft fade near horizon
    //       'space-color': 'rgba(5, 10, 20, 1)',      // deep backdrop
    //       'star-intensity': 0                      // ✨ disables stars
    //     });
      
    //     // Optional: refine sky to remove visible sparkle or glare
    //     STATE.map.addLayer({
    //       id: 'sky',
    //       type: 'sky',
    //       paint: {
    //         'sky-type': 'atmosphere',
    //         'sky-atmosphere-color': 'rgba(120, 170, 190, 0.4)', // subtle blue
    //         'sky-atmosphere-halo-color': 'rgba(255, 255, 255, 0.05)',
    //         'sky-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1]
    //       }
    //     });
    //   });
      
      
    
    // Error handling
    STATE.map.on('error', (e) => {
        console.error('Mapbox error:', e);
        setTimeout(() => STATE.map.resize(), 100);
    });
    
    // Map load handler
    STATE.map.on('load', async () => {
        console.log('✓ Map loaded successfully');
        
        // Add fog for depth (professional touch)
        STATE.map.setFog({
            range: [0.5, 10],
            color: '#0a1628',
            'horizon-blend': 0.1,
            'high-color': '#1a2744',
            'space-color': '#0a1628',
            'star-intensity': 0.15
        });
        
        // Resize to ensure proper rendering
        setTimeout(() => STATE.map.resize(), 100);
        
        // Initialize mini map
        setTimeout(() => initMiniMap(), 300);
        
        // Add controls (subtle positioning)
        STATE.map.addControl(
            new mapboxgl.NavigationControl({
                showCompass: false,
                showZoom: false,
                visualizePitch: true
            }),
            'top-right'
        );
        
        STATE.map.addControl(
            new mapboxgl.ScaleControl({
                maxWidth: 100,
                unit: 'nautical'
            }),
            'bottom-left'
        );
        
        // Create vessel markers
        const vessel1El = createRingMarker('#00ff88', 24);
        STATE.vesselMarker = new mapboxgl.Marker(vessel1El)
            .setLngLat([28.64057, 59.93024666666667])
            .addTo(STATE.map);
        
        const vessel2El = createRingMarker('#ff3366', 24);
        STATE.vessel2Marker = new mapboxgl.Marker(vessel2El)
            .setLngLat([-75.57254, 20.79897])
            .addTo(STATE.map);
        STATE.vessel2Marker.getElement().style.display = 'none';
        
        console.log('✓ Vessel markers created');
        
        // Load all chapter data
        const dataLoaded = await loadChapterData();
        
        if (dataLoaded) {
            // Pre-load all layers for smooth transitions
            for (let i = 1; i <= 5; i++) {
                addLayerToMap(i);
            }
            
            // Add vessel2 source and layers
            if (STATE.vessel2Data) {
                addVessel2Layers();
            }
            
            // Add destination marker
            if (STATE.chapterData[5]) {
                const finalCoords = STATE.chapterData[5].features[0].geometry.coordinates;
                const destinationCoord = finalCoords[finalCoords.length - 1];
                
                STATE.map.addSource('destination', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: destinationCoord
                        }
                    }
                });
                
                STATE.map.addLayer({
                    id: 'destination-pulse',
                    type: 'circle',
                    source: 'destination',
                    paint: {
                        'circle-radius': 50,
                        'circle-color': '#ff9933',
                        'circle-opacity': 0,
                        'circle-stroke-width': 3,
                        'circle-stroke-color': '#ff9933',
                        'circle-stroke-opacity': 0
                    }
                });
                
                console.log('✓ Destination marker added');
            }
            
            STATE.layersReady = true;
            console.log('✓ All layers pre-loaded for smooth transitions');
            
            // Initialize scrollytelling
            initScrollytelling();
        } else {
            console.warn('⚠ Some data files missing, initializing with available data');
            initScrollytelling();
        }
    });
}

// ============================================================================
// PAGE LOAD HANDLING - Ensure fresh start on refresh
// ============================================================================

// Force scroll to top on page load/refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

window.addEventListener('load', () => {
    window.scrollTo(0, 0);
    console.log('✓ Page loaded - scroll position reset');
});

// ============================================================================
// STARTUP
// ============================================================================

console.log('╔═══════════════════════════════════════════╗');
console.log('║  THEIA MARITIME INTELLIGENCE            ║');
console.log('║  AKADEMIK GUBKIN Tracker v3.0           ║');
console.log('║  Professional Scrollytelling Experience  ║');
console.log('╚═══════════════════════════════════════════╝');
console.log('');
console.log('Initializing professional maritime tracking experience...');
console.log('');

// Initialize the application
initializeMap();