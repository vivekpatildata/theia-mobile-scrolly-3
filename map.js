// ============================================================================
// THEIA MARITIME INTELLIGENCE - AKADEMIK GUBKIN TRACKER
// Professional Scrollytelling Experience v4.1 - FIXED
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
    vessel3Marker: null,
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
    chapter7AkademikData: null,
    chapter7EqualityData: null,
    loadedLayers: new Set(),
    activeAnimations: new Map()
};

// ============================================================================
// TIMELINE DATA
// ============================================================================
const TIMELINE_DATA = [
    { date: "AUG 30, 2025", time: "08:00 UTC", elapsed: "DAY 1", event: "Story Begins" },
    { date: "AUG 25, 2025", time: "12:00 UTC", elapsed: "DAY -146", event: "Anchorage Begins" },
    { date: "AUG 31, 2025", time: "08:00 UTC", elapsed: "DAY 1", event: "Ust-Luga Loading" },
    { date: "SEP 02, 2025", time: "14:00 UTC", elapsed: "DAY 3", event: "Baltic Transit" },
    { date: "SEP 07, 2025", time: "11:15 UTC", elapsed: "DAY 8", event: "Drift Begins" },
    { date: "SEP 15, 2025", time: "10:00 UTC", elapsed: "DAY 16", event: "Mid-Atlantic" },
    { date: "SEP 26, 2025", time: "08:00 UTC", elapsed: "DAY 27", event: "Arrives Cuba" },
    { date: "OCT 04, 2025", time: "12:00 UTC", elapsed: "DAY 35", event: "Dark STS Operation" },
    { date: "OCT 02, 2025", time: "14:00 UTC", elapsed: "DAY 33", event: "STS Complete" }
];

// ============================================================================
// CHAPTER CONFIGURATIONS
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
        showVessel2: false,
        showVessel3: false,
        showUI: false,
        showMiniMap: false,  // 🔧 Mini map control
        voyagePeriod: 'APR 5 - AUG 31'  // 🔧 EDIT YOUR DATE HERE
    },
    1: {
        name: 'Ust-Luga Loading',
        center: [28.64559, 59.93183],
        zoom: 11.97,
        pitch: 0,
        bearing: 0,
        duration: 3000,
        curve: 1.3,
        geojson: 'chapter1data.geojson',
        animate: 'animateChapter1',
        showLayers: [1],
        hideAllLayers: false,
        showLegend: true,
        showVessel2: false,
        showVessel3: false,
        showUI: true,
        showMiniMap: true,  // 🔧 Mini map control
        periodLabel: 'ANCHORAGE PERIOD',  // 🔧 CUSTOM LABEL
        voyagePeriod: '30 MAR - 31 AUG'  // 🔧 EDIT YOUR DATE HERE
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
        showVessel2: false,
        showVessel3: false,
        showUI: true,
        showMiniMap: true,  // 🔧 Mini map control
        periodLabel: 'DOCKING PERIOD',  // 🔧 CUSTOM LABEL
        voyagePeriod: '31 AUG - 02 SEP'  // 🔧 EDIT YOUR DATE HERE
    },
    3: {
        name: 'North Sea Transit',
        center: [10.26, 58.9],
        zoom: 4.2,
        pitch: 0,
        bearing: 0,
        duration: 3500,
        curve: 1.4,
        geojson: 'chapter3data.geojson',
        animate: 'animateChapter3',
        showLayers: [1, 2, 3],
        hideAllLayers: false,
        showLegend: true,
        showVessel2: false,
        showVessel3: false,
        showUI: true,
        showMiniMap: true,  // 🔧 Mini map control
        periodLabel: 'TRANSIT PERIOD',  // 🔧 CUSTOM LABEL
        voyagePeriod: '02 SEP - 06 SEP'  // 🔧 EDIT YOUR DATE HERE
    },
    4: {
        name: 'Norwegian Sea to Atlantic',
        center: [4.1689, 63.3852],
        zoom: 8.57,
        pitch: 30,
        bearing: 10,
        duration: 3500,
        curve: 1.4,
        geojson: 'chapter4data.geojson',
        animate: 'animateChapter4',
        showLayers: [1, 2, 3, 4],
        hideAllLayers: false,
        showLegend: true,
        showVessel2: false,
        showVessel3: false,
        showUI: true,
        showMiniMap: true,  // 🔧 Mini map control
        periodLabel: 'LOITERING PERIOD',  // 🔧 CUSTOM LABEL
        voyagePeriod: '07 SEP - 08 SEP'  // 🔧 EDIT YOUR DATE HERE
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
        showVessel2: false,
        showVessel3: false,
        showUI: true,
        showMiniMap: false,  // 🔧 HIDDEN - Atlantic crossing doesn't need mini map context
        periodLabel: 'TRANSIT PERIOD',  // 🔧 CUSTOM LABEL
        voyagePeriod: '09 SEP - 25 SEP'  // 🔧 EDIT YOUR DATE HERE
    },
    6: {
        name: 'Haiti Arrival - STS Transfer',
        center: [-75.56706, 20.79431],
        zoom: 12.94,
        pitch: 5,
        bearing: 2,
        duration: 3500,
        curve: 1.3,
        geojson: null,
        animate: 'animateChapter6',
        showLayers: [1, 2, 3, 4, 5],
        hideAllLayers: false,
        showLegend: true,
        showVessel2: true,
        showVessel3: false,
        showUI: true,
        showMiniMap: true,  // 🔧 Mini map control
        voyagePeriod: '25 SEP - 02 OCT'  // 🔧 EDIT YOUR DATE HERE
    },
    7: {
        name: 'Dark STS - EQUALITY',
        center: [-75.5467, 20.7875],
        zoom: 8.95,
        pitch: 1,
        bearing: 0,
        duration: 3500,
        curve: 1.3,
        geojson: null,
        animate: 'animateChapter7New',
        showLayers: [1, 2, 3, 4, 5],
        hideAllLayers: false,
        showLegend: true,
        showVessel2: false,
        showVessel3: true,
        showUI: true,
        showMiniMap: true,  // 🔧 Mini map control
        voyagePeriod: '03 OCT - 05 OCT'  // 🔧 EDIT YOUR DATE HERE
    },
    8: {
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
        showVessel2: false,
        showVessel3: false,
        showUI: false,
        showMiniMap: false,  // 🔧 Mini map control
        voyagePeriod: '28 AUG - 05 OCT'  // 🔧 EDIT YOUR DATE HERE
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
// COMPREHENSIVE CLEANUP FUNCTIONS
// ============================================================================

function cleanupAllChapterElements() {
    console.log('🧹 Starting AGGRESSIVE cleanup...');
    
    // AGGRESSIVE POPUP REMOVAL - Remove ALL popups from map
    const popups = document.querySelectorAll('.mapboxgl-popup');
    popups.forEach(popup => {
        console.log('🗑️ Removing popup:', popup);
        popup.remove();
    });
    
    // Force remove any popups that might be in the map container
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        const mapPopups = mapContainer.querySelectorAll('.mapboxgl-popup');
        mapPopups.forEach(popup => {
            console.log('🗑️ Forcing popup removal from map container');
            popup.remove();
        });
        
        // 🔥 NUCLEAR - Remove ALL images from Chapter 6 popups
        mapContainer.querySelectorAll('img').forEach(img => {
            if (!img.closest('.mapboxgl-ctrl') && 
                !img.closest('.mapboxgl-marker') &&
                !img.closest('.logo-container') &&
                (img.src.includes('image2A') || 
                 img.src.includes('image2B') || 
                 img.classList.contains('annotation-img') ||
                 img.closest('.enhanced-popup'))) {
                console.log('🔥 FORCE removing Chapter 6 popup image:', img.src);
                img.remove();
            }
        });
    }
    
    // Remove all custom elements with chapter classes
    document.querySelectorAll('[class*="chapter"]').forEach(el => {
        if (!el.id && !el.classList.contains('chapter') && !el.classList.contains('step')) {
            el.remove();
        }
    });
    
    // 🔥 AGGRESSIVE Chapter 6 cleanup
    document.querySelectorAll('.chapter6-popup').forEach(el => {
        console.log('🔥 Removing chapter6-popup');
        el.remove();
    });
    document.querySelectorAll('.blue-glow').forEach(el => {
        console.log('🔥 Removing blue-glow popup');
        el.remove();
    });
    document.querySelectorAll('.red-glow').forEach(el => {
        console.log('🔥 Removing red-glow popup');
        el.remove();
    });
    document.querySelectorAll('.enhanced-popup').forEach(el => {
        console.log('🔥 Removing enhanced-popup');
        el.remove();
    });
    
    // Clean up any satellite detection markers
    document.querySelectorAll('[class*="satellite"]').forEach(el => el.remove());
    document.querySelectorAll('[class*="detection"]').forEach(el => el.remove());
    document.querySelectorAll('.chapter6-detection-marker').forEach(el => el.remove());
    document.querySelectorAll('.sts-transfer-zone').forEach(el => el.remove());
    
    // Clean up any animation-specific elements
    document.querySelectorAll('[class*="drift"]').forEach(el => el.remove());
    document.querySelectorAll('[class*="sts"]').forEach(el => el.remove());
    document.querySelectorAll('[class*="marker"]').forEach(el => {
        // Don't remove main vessel markers
        if (!el.closest('.mapboxgl-marker')) {
            el.remove();
        }
    });
    
    // Clean up any journey markers from Chapter 8
    if (window.ch7Markers) {
        try {
            if (window.ch7Markers.startMarker) window.ch7Markers.startMarker.remove();
            if (window.ch7Markers.endMarker) window.ch7Markers.endMarker.remove();
            if (window.ch7Markers.style) window.ch7Markers.style.remove();
            window.ch7Markers = null;
        } catch (e) {
            console.warn('Cleanup warning:', e.message);
        }
    }
    
    // Remove any style elements from animations
    document.querySelectorAll('style[id*="ch"]').forEach(el => el.remove());
    document.querySelectorAll('style[id*="chapter"]').forEach(el => el.remove());
    
    // CRITICAL: Remove any elements with position fixed/absolute that might be lingering
    document.querySelectorAll('[style*="position: fixed"], [style*="position: absolute"]').forEach(el => {
        // Don't remove UI elements
        if (!el.closest('#vesselInfoPanel') && 
            !el.closest('#miniMapContainer') &&
            !el.closest('.story-progress') &&
            !el.closest('.logo-container') &&
            !el.closest('.legend-bar') &&
            !el.closest('.mapboxgl-marker') &&
            el.closest('#map')) { // Only elements inside map
            console.log('🗑️ Removing lingering positioned element');
            el.remove();
        }
    });
    
    console.log('✓ Aggressive cleanup complete');
}

function resetAllLayersOpacity() {
    console.log('🔄 Resetting all layer opacities...');
    
    // Reset chapter layers 1-5
    for (let i = 1; i <= 5; i++) {
        const layerId = `chapter${i}-layer`;
        const glowLayerId = `chapter${i}-glow`;
        
        if (STATE.map.getLayer(layerId)) {
            STATE.map.setPaintProperty(layerId, 'line-opacity', 0);
        }
        if (STATE.map.getLayer(glowLayerId)) {
            STATE.map.setPaintProperty(glowLayerId, 'line-opacity', 0);
        }
    }
    
    // Reset vessel2 layers
    if (STATE.map.getLayer('vessel2-layer')) {
        STATE.map.setPaintProperty('vessel2-layer', 'line-opacity', 0);
    }
    if (STATE.map.getLayer('vessel2-glow')) {
        STATE.map.setPaintProperty('vessel2-glow', 'line-opacity', 0);
    }
    
    // Reset Chapter 7 layers
    if (STATE.map.getLayer('chapter7-akademik-layer')) {
        STATE.map.setPaintProperty('chapter7-akademik-layer', 'line-opacity', 0);
        STATE.map.setPaintProperty('chapter7-akademik-glow', 'line-opacity', 0);
    }
    if (STATE.map.getLayer('chapter7-equality-layer')) {
        STATE.map.setPaintProperty('chapter7-equality-layer', 'line-opacity', 0);
        STATE.map.setPaintProperty('chapter7-equality-glow', 'line-opacity', 0);
    }
    
    console.log('✓ All layers reset');
}

function prepareChapter7() {
    console.log('🎬 Preparing Chapter 7 (Dark STS Operation)...');
    
    // Comprehensive cleanup
    cleanupAllChapterElements();
    
    // Reset all layer opacities
    resetAllLayersOpacity();
    
    // Stop all animations
    stopAllAnimations();
    
    // Reset Chapter 7 data sources to empty
    if (STATE.map.getSource('chapter7-akademik-source')) {
        STATE.map.getSource('chapter7-akademik-source').setData({
            type: 'FeatureCollection',
            features: []
        });
    }
    
    if (STATE.map.getSource('chapter7-equality-source')) {
        STATE.map.getSource('chapter7-equality-source').setData({
            type: 'FeatureCollection',
            features: []
        });
    }
    
    console.log('✓ Chapter 7 preparation complete');
}

function cleanupAfterChapter7() {
    console.log('🧹 Cleaning up after Chapter 7...');
    
    // Hide Chapter 7 layers immediately
    if (STATE.map.getLayer('chapter7-akademik-layer')) {
        STATE.map.setPaintProperty('chapter7-akademik-layer', 'line-opacity', 0);
        STATE.map.setPaintProperty('chapter7-akademik-glow', 'line-opacity', 0);
    }
    if (STATE.map.getLayer('chapter7-equality-layer')) {
        STATE.map.setPaintProperty('chapter7-equality-layer', 'line-opacity', 0);
        STATE.map.setPaintProperty('chapter7-equality-glow', 'line-opacity', 0);
    }
    
    // Hide vessel3 marker
    if (STATE.vessel3Marker) {
        const vessel3El = STATE.vessel3Marker.getElement();
        vessel3El.style.display = 'none';
    }
    
    // Clean up any lingering elements
    cleanupAllChapterElements();
    
    console.log('✓ Chapter 7 cleanup complete');
}

function forceCleanupChapter6() {
    console.log('🧹🧹🧹 FORCING Chapter 6 cleanup (NUCLEAR OPTION)...');
    
    // IMMEDIATE - Remove ALL Chapter 6 layers
    const chapter6Layers = [
        'chapter6-chapter4-glow', 'chapter6-chapter4-layer',
        'chapter6-chapter5-glow', 'chapter6-chapter5-layer',
        'chapter6-vessel2-glow', 'chapter6-vessel2-layer'
    ];
    
    chapter6Layers.forEach(layerId => {
        if (STATE.map.getLayer(layerId)) {
            try {
                STATE.map.setPaintProperty(layerId, 'line-opacity', 0);
            } catch (e) {
                console.warn(`Error hiding layer ${layerId}:`, e);
            }
        }
    });
    
    // IMMEDIATE - Remove ALL Chapter 6 sources
    const chapter6Sources = [
        'chapter6-chapter4-source',
        'chapter6-chapter5-source',
        'chapter6-vessel2-source'
    ];
    
    chapter6Sources.forEach(sourceId => {
        if (STATE.map.getSource(sourceId)) {
            try {
                // Don't remove source, just clear data to prevent hanging
                STATE.map.getSource(sourceId).setData({
                    type: 'FeatureCollection',
                    features: []
                });
            } catch (e) {
                console.warn(`Error clearing source ${sourceId}:`, e);
            }
        }
    });
    
    // NUCLEAR - Remove ALL popups IMMEDIATELY (synchronous)
    document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
        popup.remove();
    });
    
    // NUCLEAR - Remove ALL Chapter 6 specific elements IMMEDIATELY
    document.querySelectorAll('.chapter6-popup').forEach(el => el.remove());
    document.querySelectorAll('.chapter6-detection-marker').forEach(el => el.remove());
    document.querySelectorAll('.sts-transfer-zone').forEach(el => el.remove());
    document.querySelectorAll('.chapter6-marker-core').forEach(el => el.remove());
    document.querySelectorAll('.chapter6-marker-ring').forEach(el => el.remove());
    document.querySelectorAll('.sts-subtle-glow').forEach(el => el.remove());
    document.querySelectorAll('.sts-ring-subtle-1').forEach(el => el.remove());
    document.querySelectorAll('.sts-ring-subtle-2').forEach(el => el.remove());
    document.querySelectorAll('.sts-ring-subtle-3').forEach(el => el.remove());
    document.querySelectorAll('.sts-center-dot').forEach(el => el.remove());
    document.querySelectorAll('.enhanced-popup').forEach(el => el.remove());
    document.querySelectorAll('.blue-glow').forEach(el => el.remove());
    document.querySelectorAll('.red-glow').forEach(el => el.remove());
    
    // NUCLEAR - Remove any images that might be loaded
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.querySelectorAll('img').forEach(img => {
            // Only remove images that are NOT part of Mapbox UI
            if (!img.closest('.mapboxgl-ctrl') && 
                !img.closest('.mapboxgl-marker') &&
                (img.src.includes('image2A') || img.src.includes('image2B') || img.classList.contains('annotation-img'))) {
                console.log('🗑️🗑️🗑️ FORCE removing Chapter 6 image');
                img.remove();
            }
        });
    }
    
    // NUCLEAR - Remove any divs with background images
    if (mapContainer) {
        mapContainer.querySelectorAll('div[style*="background-image"]').forEach(div => {
            if (!div.closest('.mapboxgl-ctrl') && !div.closest('.mapboxgl-marker')) {
                div.remove();
            }
        });
    }
    
    // Hide vessel2 marker if visible
    if (STATE.vessel2Marker) {
        const vessel2El = STATE.vessel2Marker.getElement();
        vessel2El.style.display = 'none';
        vessel2El.style.opacity = '0';
    }
    
    console.log('✅✅✅ Chapter 6 NUCLEAR cleanup complete');
}

function prepareChapter6() {
    console.log('🎬 Preparing Chapter 6 (Haiti STS Transfer)...');
    
    // Comprehensive cleanup before Chapter 6
    cleanupAllChapterElements();
    
    // Reset all layer opacities
    resetAllLayersOpacity();
    
    // Stop all animations
    stopAllAnimations();
    
    console.log('✓ Chapter 6 preparation complete');
}

// ============================================================================
// RING MARKER CREATION
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
    
    if (!document.getElementById('ringPulseAnimation')) {
        const style = document.createElement('style');
        style.id = 'ringPulseAnimation';
        style.textContent = `
            @keyframes ringPulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
            }
            .vessel-ring-marker { animation: ringPulse 2s ease-in-out infinite; }
        `;
        document.head.appendChild(style);
    }
    
    return el;
}

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadChapterData() {
    console.log('📦 Loading chapter data...');
    const loadPromises = [];
    
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
    
    loadPromises.push(
        fetch('akademik_gubkin_ais_oct3_5.geojson')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                STATE.chapter7AkademikData = data;
                console.log(`✓ Chapter 7 AKADEMIK data loaded (${data.features[0].geometry.coordinates.length} points)`);
                return { chapter7Akademik: true, success: true };
            })
            .catch(error => {
                console.warn('⚠ Chapter 7 AKADEMIK data not found:', error.message);
                STATE.chapter7AkademikData = null;
                return { chapter7Akademik: true, success: false };
            })
    );
    
    loadPromises.push(
        fetch('equality_ais.geojson')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                STATE.chapter7EqualityData = data;
                console.log(`✓ Chapter 7 EQUALITY data loaded (${data.features[0].geometry.coordinates.length} points)`);
                return { chapter7Equality: true, success: true };
            })
            .catch(error => {
                console.warn('⚠ Chapter 7 EQUALITY data not found:', error.message);
                STATE.chapter7EqualityData = null;
                return { chapter7Equality: true, success: false };
            })
    );
    
    const results = await Promise.all(loadPromises);
    const successCount = results.filter(r => r.success).length;
    console.log(`✓ Data loading complete: ${successCount}/${results.length} files loaded`);
    
    return successCount > 0;
}

// ============================================================================
// MINI MAP - FIXED WITH BETTER VISIBILITY
// ============================================================================

function initMiniMap() {
    if (STATE.miniMap) return;
    
    try {
        const container = document.getElementById('miniMap');
        if (!container) {
            console.warn('Mini map container not found');
            return;
        }
        
        const parent = container.parentElement;
        parent.innerHTML = `
            <div id="miniMap" style="width: 170px; height: 130px; overflow: hidden; border-radius: 10px;"></div>
            <div class="map-label">GLOBAL POSITION</div>
        `;
        
        // Initialize at Chapter 1 location (first visible chapter)
        const initialCenter = CHAPTERS[1].center; // [28.64559, 59.93183]
        
        STATE.miniMap = new mapboxgl.Map({
            container: 'miniMap',
            style: 'mapbox://styles/mapbox/light-v11',
            center: initialCenter,
            zoom: 2.8,
            interactive: false,
            attributionControl: false,
            logoPosition: 'bottom-right',
            preserveDrawingBuffer: true
        });
        
        // Create marker with CENTERED pulse ring
        const markerEl = document.createElement('div');
        markerEl.className = 'mini-map-marker';
        markerEl.style.cssText = `
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #00ff88;
            border: 4px solid white;
            box-shadow: 0 0 25px rgba(0, 255, 136, 1), 
                        0 0 15px rgba(0, 255, 136, 1),
                        inset 0 0 10px rgba(0, 255, 136, 0.9);
            position: relative;
            z-index: 1000;
        `;
        
        // ✅ CENTERED pulse ring
        const pulseRing = document.createElement('div');
        pulseRing.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 3px solid #00ff88;
            opacity: 0.7;
            animation: miniMapPulse 2s ease-out infinite;
            pointer-events: none;
        `;
        markerEl.appendChild(pulseRing);
        
        // Add pulse animation
        if (!document.getElementById('miniMapPulseAnimation')) {
            const style = document.createElement('style');
            style.id = 'miniMapPulseAnimation';
            style.textContent = `
                @keyframes miniMapPulse {
                    0% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 0.9;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(2.5);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create and add marker immediately
        STATE.miniMarker = new mapboxgl.Marker(markerEl)
            .setLngLat(initialCenter)
            .addTo(STATE.miniMap);
        
        console.log('✓ Mini map initialized at Chapter 1 location');
    } catch (error) {
        console.error('Mini map initialization error:', error);
    }
}

function updateMiniMap(lng, lat) {
    if (!STATE.miniMarker || !STATE.miniMap) return;
    
    try {
        // Update marker position
        STATE.miniMarker.setLngLat([lng, lat]);
        
        // Dynamic zoom based on location
        let targetZoom = 1.5;
        
        // Chapter 5 - Mid-Atlantic (zoom out more to show context)
        if (lng < -40 && lng > -70 && lat > 15 && lat < 35) {
            targetZoom = 1.0; // Zoom out for mid-Atlantic crossing
        }
        else if (Math.abs(lat) < 25 && Math.abs(lng) < 30) {
            targetZoom = 2.8; // Europe/Africa region
        } else if (lng < -60 && Math.abs(lat) < 30) {
            targetZoom = 3.2; // Caribbean region
        } else if (Math.abs(lng) > 140) {
            targetZoom = 1.2; // Pacific - zoom out
        } else if (Math.abs(lat) > 60) {
            targetZoom = 1.8; // Arctic - zoom out slightly
        }
        
        // Pan to location
        STATE.miniMap.jumpTo({
            center: [lng, lat],
            zoom: targetZoom
        });
        
    } catch (error) {
        console.warn('Mini map update error:', error);
    }
}

// ============================================================================
// LAYER MANAGEMENT
// ============================================================================

function addLayerToMap(chapterNum) {
    if (STATE.loadedLayers.has(chapterNum) || !STATE.chapterData[chapterNum]) {
        return;
    }
    
    const sourceId = `chapter${chapterNum}-source`;
    const layerId = `chapter${chapterNum}-layer`;
    const glowLayerId = `chapter${chapterNum}-glow`;
    
    try {
        if (!STATE.map.getSource(sourceId)) {
            STATE.map.addSource(sourceId, {
                type: 'geojson',
                data: STATE.chapterData[chapterNum],
                lineMetrics: true
            });
        }
        
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
        if (!STATE.map.getSource('vessel2-data')) {
            STATE.map.addSource('vessel2-data', {
                type: 'geojson',
                data: STATE.vessel2Data,
                lineMetrics: true
            });
        }
        
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

function addChapter7Layers() {
    if (STATE.loadedLayers.has('chapter7')) return;
    
    try {
        // AKADEMIK GUBKIN Chapter 7 layers
        if (STATE.chapter7AkademikData) {
            if (!STATE.map.getSource('chapter7-akademik-source')) {
                STATE.map.addSource('chapter7-akademik-source', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: []
                    },
                    lineMetrics: true
                });
            }
            
            if (!STATE.map.getLayer('chapter7-akademik-glow')) {
                STATE.map.addLayer({
                    id: 'chapter7-akademik-glow',
                    type: 'line',
                    source: 'chapter7-akademik-source',
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
            
            if (!STATE.map.getLayer('chapter7-akademik-layer')) {
                STATE.map.addLayer({
                    id: 'chapter7-akademik-layer',
                    type: 'line',
                    source: 'chapter7-akademik-source',
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
        }
        
        // EQUALITY Chapter 7 layers
        if (STATE.chapter7EqualityData) {
            if (!STATE.map.getSource('chapter7-equality-source')) {
                STATE.map.addSource('chapter7-equality-source', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: []
                    },
                    lineMetrics: true
                });
            }
            
            if (!STATE.map.getLayer('chapter7-equality-glow')) {
                STATE.map.addLayer({
                    id: 'chapter7-equality-glow',
                    type: 'line',
                    source: 'chapter7-equality-source',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#ff9933',
                        'line-width': 8,
                        'line-opacity': 0,
                        'line-blur': 4
                    }
                });
            }
            
            if (!STATE.map.getLayer('chapter7-equality-layer')) {
                STATE.map.addLayer({
                    id: 'chapter7-equality-layer',
                    type: 'line',
                    source: 'chapter7-equality-source',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#ff9933',
                        'line-width': 3,
                        'line-opacity': 0
                    }
                });
            }
        }
        
        STATE.loadedLayers.add('chapter7');
        console.log('✓ Chapter 7 layers added (AKADEMIK + EQUALITY)');
    } catch (error) {
        console.error('Error adding Chapter 7 layers:', error);
    }
}

function updateLayerVisibility(layersToShow, immediate = false) {
    const duration = immediate ? 0 : 600;
    
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

function updateChapter7Visibility(show, immediate = false) {
    if (!STATE.loadedLayers.has('chapter7')) {
        addChapter7Layers();
    }
    
    const duration = immediate ? 0 : 600;
    const targetOpacity = show ? 0.75 : 0;
    const targetGlowOpacity = show ? 0.35 : 0;
    
    if (STATE.map.getLayer('chapter7-akademik-layer')) {
        if (immediate) {
            STATE.map.setPaintProperty('chapter7-akademik-layer', 'line-opacity', targetOpacity);
            STATE.map.setPaintProperty('chapter7-akademik-glow', 'line-opacity', targetGlowOpacity);
        } else {
            animateProperty('chapter7-akademik-layer', 'line-opacity', targetOpacity, duration);
            animateProperty('chapter7-akademik-glow', 'line-opacity', targetGlowOpacity, duration);
        }
    }
    
    if (STATE.map.getLayer('chapter7-equality-layer')) {
        if (immediate) {
            STATE.map.setPaintProperty('chapter7-equality-layer', 'line-opacity', targetOpacity);
            STATE.map.setPaintProperty('chapter7-equality-glow', 'line-opacity', targetGlowOpacity);
        } else {
            animateProperty('chapter7-equality-layer', 'line-opacity', targetOpacity, duration);
            animateProperty('chapter7-equality-glow', 'line-opacity', targetGlowOpacity, duration);
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
// UI UPDATE FUNCTIONS
// ============================================================================

function updateVesselPanelVisibility(show) {
    const vesselPanel = safeGetElement('vesselInfoPanel');
    
    if (vesselPanel) {
        const displayValue = show ? 'block' : 'none';
        const opacity = show ? '1' : '0';
        
        vesselPanel.style.display = displayValue;
        setTimeout(() => {
            vesselPanel.style.opacity = opacity;
        }, 10);
    }
}

function updateMiniMapVisibility(show) {
    const miniMapContainer = safeGetElement('miniMapContainer');
    
    if (miniMapContainer) {
        const displayValue = show ? 'block' : 'none';
        const opacity = show ? '1' : '0';
        
        miniMapContainer.style.display = displayValue;
        
        // When showing mini map, resize and refresh position
        if (show && STATE.miniMap) {
            requestAnimationFrame(() => {
                STATE.miniMap.resize();
                // Refresh marker position for current chapter
                if (STATE.currentChapter >= 0 && CHAPTERS[STATE.currentChapter]) {
                    const chapter = CHAPTERS[STATE.currentChapter];
                    if (STATE.miniMarker) {
                        STATE.miniMarker.setLngLat(chapter.center);
                    }
                    STATE.miniMap.jumpTo({
                        center: chapter.center,
                        zoom: STATE.miniMap.getZoom()
                    });
                }
            });
        }
        
        setTimeout(() => {
            miniMapContainer.style.opacity = opacity;
        }, 10);
    }
}

function updateUIVisibility(show) {
    // Legacy function - kept for backward compatibility
    // Now calls separate functions for vessel panel and mini map
    updateVesselPanelVisibility(show);
    updateMiniMapVisibility(show);
}

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
    
    panel.style.opacity = '0';
    
    setTimeout(() => {
        if (chapterNum === 6) {
            panel.classList.add('dual-vessel');
            
            if (elements.label1) elements.label1.textContent = 'VESSEL 1';
            if (elements.name) elements.name.innerHTML = '<span class="vessel-indicator vessel-1-indicator"></span>AKADEMIK GUBKIN';
            if (elements.imo) elements.imo.textContent = '9842190';
            
            if (elements.label2) elements.label2.textContent = 'VESSEL 2';
            if (elements.value2) {
                elements.value2.innerHTML = `
                    <span class="vessel-indicator vessel-2-indicator"></span>LOURDES
                    <span class="info-value-small" style="display: block; margin-top: 1px;">9259692</span>
                `;
            }
            
            if (elements.label3) elements.label3.textContent = 'OPERATION';
            if (elements.value3) elements.value3.textContent = 'STS TRANSFER';
        } else if (chapterNum === 7) {
            panel.classList.add('dual-vessel');
            
            if (elements.label1) elements.label1.textContent = 'VESSEL 1';
            if (elements.name) elements.name.innerHTML = '<span class="vessel-indicator vessel-1-indicator"></span>AKADEMIK GUBKIN';
            if (elements.imo) elements.imo.textContent = '9842190';
            
            if (elements.label2) elements.label2.textContent = 'VESSEL 3';
            if (elements.value2) {
                elements.value2.innerHTML = `
                    <span class="vessel-indicator vessel-3-indicator"></span>EQUALITY
                    <span class="info-value-small" style="display: block; margin-top: 1px;">9216547</span>
                `;
            }
            
            // if (elements.label3) elements.label3.textContent = 'STATUS';
            // if (elements.value3) elements.value3.textContent = 'DARK STS';
        } else {
            panel.classList.remove('dual-vessel');
            
            if (elements.label1) elements.label1.textContent = 'VESSEL / IMO';
            if (elements.name) elements.name.textContent = 'AKADEMIK GUBKIN';
            if (elements.imo) elements.imo.textContent = '9842190';
            
            // 🔧 UPDATED: Now uses chapter-specific period label and voyage period from CHAPTERS config
            const chapter = CHAPTERS[chapterNum];
            if (elements.label2) elements.label2.textContent = chapter && chapter.periodLabel ? chapter.periodLabel : 'VOYAGE PERIOD';
            if (elements.value2) elements.value2.textContent = chapter && chapter.voyagePeriod ? chapter.voyagePeriod : 'AUG 28 - OCT 5';
            
            if (elements.label3) elements.label3.textContent = 'CARGO';
            if (elements.value3) elements.value3.textContent = 'RUSSIAN CRUDE OIL';
        }
        
        panel.style.transition = 'opacity 0.4s ease';
        panel.style.opacity = '1';
    }, 200);
}

function updateLegend(chapterNum) {
    const legendBar = safeGetElement('legendBar');
    if (!legendBar) return;
    
    const chapter = CHAPTERS[chapterNum];
    
    if (chapter && chapter.showLegend && chapterNum >= 1 && chapterNum <= 7) {
        legendBar.style.display = 'flex';
        legendBar.style.opacity = '0';
        
        setTimeout(() => {
            if (chapterNum === 6) {
                legendBar.innerHTML = `
                    <div class="legend-item">
                        <span class="legend-dot ais"></span>
                        <span>AKADEMIK GUBKIN AIS Track</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-dot vessel2"></span>
                        <span>LOURDES AIS Track</span>
                    </div>
                `;
            } else if (chapterNum === 7) {
                legendBar.innerHTML = `
                    <div class="legend-item">
                        <span class="legend-dot ais"></span>
                        <span>AKADEMIK GUBKIN AIS Track</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-dot vessel3"></span>
                        <span>EQUALITY AIS Track</span>
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

function updateProgressBar(chapterNum) {
    const progressFill = safeGetElement('progressFill');
    const progressText = safeGetElement('progressText');
    
    if (!progressFill || !progressText) return;
    
    let progressValue = 0;
    let progressLabel = '';
    
    if (chapterNum === 0) {
        progressValue = 0;
        progressLabel = 'INTRODUCTION';
    } else if (chapterNum >= 1 && chapterNum <= 7) {
        progressValue = (chapterNum / 8) * 100;
        progressLabel = `CHAPTER ${chapterNum} OF 7`;
    } else if (chapterNum === 8) {
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

function updateVessel3Marker(show) {
    if (!STATE.vessel3Marker) return;
    
    const vessel3El = STATE.vessel3Marker.getElement();
    
    if (show) {
        vessel3El.style.display = 'block';
        vessel3El.style.opacity = '0';
        vessel3El.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            vessel3El.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            vessel3El.style.opacity = '1';
            vessel3El.style.transform = 'scale(1)';
        }, 100);
    } else {
        vessel3El.style.transition = 'all 0.4s ease';
        vessel3El.style.opacity = '0';
        vessel3El.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            vessel3El.style.display = 'none';
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
        if (chapterNum === 8) {
            const animation = animateFunc(
                STATE.map,
                STATE.vesselMarker
            );
            STATE.activeAnimations.set(chapterNum, animation);
        } else if (chapterNum === 7 && STATE.chapter7AkademikData && STATE.chapter7EqualityData) {
            const animation = animateFunc(
                STATE.map,
                STATE.chapter7AkademikData,
                STATE.chapter7EqualityData,
                STATE.vesselMarker,
                STATE.vessel3Marker
            );
            STATE.activeAnimations.set(chapterNum, animation);
        } else if (chapterNum === 6 && STATE.vessel2Data && STATE.chapterData[4] && STATE.chapterData[5]) {
            const animation = animateFunc(
                STATE.map,
                STATE.chapterData[4],
                STATE.chapterData[5],
                STATE.vessel2Data,
                STATE.vesselMarker,
                STATE.vessel2Marker
            );
            STATE.activeAnimations.set(chapterNum, animation);
        } else if (chapterNum === 5 && STATE.chapterData[4]) {
            const animation = animateFunc(
                STATE.map,
                STATE.chapterData[4],
                STATE.vesselMarker
            );
            STATE.activeAnimations.set(chapterNum, animation);
        } else if (chapterNum === 4 && STATE.chapterData[4]) {
            const animation = animateFunc(
                STATE.map,
                STATE.chapterData[4],
                STATE.vesselMarker
            );
            STATE.activeAnimations.set(chapterNum, animation);
        } else if (chapterNum === 3 && STATE.chapterData[3]) {
            const animation = animateFunc(
                STATE.map,
                STATE.chapterData[3],
                STATE.vesselMarker
            );
            STATE.activeAnimations.set(chapterNum, animation);
        } else if (STATE.chapterData[chapterNum]) {
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
// CHAPTER NAVIGATION - WITH CHAPTER 7 CLEANUP
// ============================================================================

function flyToChapter(chapterNum) {
    if (!CHAPTERS[chapterNum]) {
        console.warn(`Chapter ${chapterNum} not defined`);
        return;
    }
    
    if (STATE.isTransitioning && chapterNum !== STATE.currentChapter) {
        STATE.pendingChapter = chapterNum;
        console.log(`⏸ Queued chapter ${chapterNum}`);
        return;
    }
    
    if (chapterNum === STATE.currentChapter && !STATE.pendingChapter) {
        return;
    }
    
    STATE.isTransitioning = true;
    STATE.previousChapter = STATE.currentChapter;
    STATE.currentChapter = chapterNum;
    
    const chapter = CHAPTERS[chapterNum];
    console.log(`→ Transitioning to Chapter ${chapterNum}: ${chapter.name}`);
    
    // 🔥 NUCLEAR CLEANUP - IMMEDIATE execution BEFORE anything else
    // This runs SYNCHRONOUSLY to prevent any delays
    
    // CRITICAL: If leaving Chapter 6, FORCE cleanup immediately
    if (STATE.previousChapter === 6 && chapterNum !== 6) {
        forceCleanupChapter6();
    }
    
    // CRITICAL: If leaving Chapter 7, cleanup immediately
    if (STATE.previousChapter === 7 && chapterNum !== 7) {
        cleanupAfterChapter7();
    }
    
    // CRITICAL: ALWAYS cleanup on every transition to prevent lingering elements
    cleanupAllChapterElements();
    
    // CRITICAL: If entering Chapter 6, prepare immediately
    if (chapterNum === 6) {
        prepareChapter6();
    }
    
    // CRITICAL: Comprehensive cleanup when entering Chapter 7
    if (chapterNum === 7) {
        prepareChapter7();
    }
    
    // Stop all animations
    stopAllAnimations();
    
    // Update UI visibility - now with separate control for mini map
    updateVesselPanelVisibility(chapter.showUI);
    updateMiniMapVisibility(chapter.showMiniMap !== undefined ? chapter.showMiniMap : chapter.showUI);
    
    // CRITICAL: Ensure mini map is resized when becoming visible
    const shouldShowMiniMap = chapter.showMiniMap !== undefined ? chapter.showMiniMap : chapter.showUI;
    if (shouldShowMiniMap && STATE.miniMap) {
        requestAnimationFrame(() => {
            STATE.miniMap.resize();
        });
    }
    
    // Update UI elements
    updateProgressBar(chapterNum);
    updateVesselPanel(chapterNum);
    updateLegend(chapterNum);
    
    // Ensure layers are loaded
    if (!chapter.hideAllLayers) {
        ensureLayersLoaded(chapter.showLayers);
    }
    
    // Hide all chapter layers that shouldn't be visible IMMEDIATELY
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
    
    // Handle Chapter 7 layers
    if (chapterNum === 7 && !STATE.loadedLayers.has('chapter7')) {
        addChapter7Layers();
    }
    
    // Hide vessel2 IMMEDIATELY if not needed
    if (!chapter.showVessel2) {
        if (STATE.map.getLayer('vessel2-layer')) {
            STATE.map.setPaintProperty('vessel2-layer', 'line-opacity', 0);
        }
        if (STATE.map.getLayer('vessel2-glow')) {
            STATE.map.setPaintProperty('vessel2-glow', 'line-opacity', 0);
        }
        // Also hide the marker immediately
        if (STATE.vessel2Marker) {
            const vessel2El = STATE.vessel2Marker.getElement();
            vessel2El.style.display = 'none';
            vessel2El.style.opacity = '0';
        }
    }
    
    // Hide Chapter 7 layers IMMEDIATELY if not on Chapter 7
    if (chapterNum !== 7) {
        if (STATE.map.getLayer('chapter7-akademik-layer')) {
            STATE.map.setPaintProperty('chapter7-akademik-layer', 'line-opacity', 0);
            STATE.map.setPaintProperty('chapter7-akademik-glow', 'line-opacity', 0);
        }
        if (STATE.map.getLayer('chapter7-equality-layer')) {
            STATE.map.setPaintProperty('chapter7-equality-layer', 'line-opacity', 0);
            STATE.map.setPaintProperty('chapter7-equality-glow', 'line-opacity', 0);
        }
        // Also hide vessel3 marker immediately
        if (STATE.vessel3Marker) {
            const vessel3El = STATE.vessel3Marker.getElement();
            vessel3El.style.display = 'none';
            vessel3El.style.opacity = '0';
        }
    }
    
    // Camera movement
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
    
    // Layer visibility updates - now with reduced delay for faster response
    setTimeout(() => {
        if (chapter.hideAllLayers) {
            updateLayerVisibility([], false);
            updateVessel2Visibility(false, false);
            updateChapter7Visibility(false, false);
        } else {
            const layersToShow = chapter.showLayers.filter(num => num !== chapterNum);
            
            updateLayerVisibility(layersToShow, false);
            updateVessel2Visibility(chapter.showVessel2, false);
            
            if (chapterNum === 7) {
                updateChapter7Visibility(true, false);
            } else {
                updateChapter7Visibility(false, false);
            }
        }
        
        updateVessel2Marker(chapter.showVessel2);
        updateVessel3Marker(chapter.showVessel3);
    }, 100); // REDUCED from 200ms for faster cleanup
    
    // Start chapter animation - slightly delayed to ensure cleanup is complete
    if (chapter.animate) {
        setTimeout(() => {
            startChapterAnimation(chapterNum);
        }, 300);  // REDUCED from 400ms for faster transitions
    }
    
    // Mark transition complete
    setTimeout(() => {
        STATE.isTransitioning = false;
        
        if (STATE.pendingChapter !== null && STATE.pendingChapter !== STATE.currentChapter) {
            const nextChapter = STATE.pendingChapter;
            STATE.pendingChapter = null;
            console.log(`▶ Processing queued chapter ${nextChapter}`);
            flyToChapter(nextChapter);
        }
    }, chapter.duration * 0.6); // REDUCED from 0.7 for faster transitions
}

// ============================================================================
// SCROLLYTELLING INITIALIZATION
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
            
            document.querySelectorAll('.step').forEach(step => {
                step.classList.remove('is-active');
            });
            
            response.element.classList.add('is-active');
            
            flyToChapter(stepIndex);
        })
        .onStepProgress(response => {
            // Optional progress handling
        });
    
    setTimeout(() => {
        flyToChapter(0);
        STATE.isInitialized = true;
        console.log('✓ Scrollytelling initialized - 9 chapters ready (0-8)');
    }, 500);
    
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
    
    STATE.map.on('error', (e) => {
        console.error('Mapbox error:', e);
        setTimeout(() => STATE.map.resize(), 100);
    });
    
    STATE.map.on('load', async () => {
        console.log('✓ Map loaded successfully');
        
        STATE.map.setFog({
            range: [0.5, 10],
            color: '#0a1628',
            'horizon-blend': 0.1,
            'high-color': '#1a2744',
            'space-color': '#0a1628',
            'star-intensity': 0.15
        });
        
        STATE.map.resize();
        initMiniMap();
        
        STATE.map.addControl(
            new mapboxgl.NavigationControl({
                showCompass: false,
                showZoom: false,
                visualizePitch: true
            }),
            'top-right'
        );
        
        // Create vessel markers
        const vessel1El = createRingMarker('#00ff88', 24);
        STATE.vesselMarker = new mapboxgl.Marker(vessel1El)
            .setLngLat([28.64057, 59.93024666666667])
            .addTo(STATE.map);
        
        const vessel2El = createRingMarker('#eff379', 24);
        STATE.vessel2Marker = new mapboxgl.Marker(vessel2El)
            .setLngLat([-75.57254, 20.79897])
            .addTo(STATE.map);
        STATE.vessel2Marker.getElement().style.display = 'none';
        
        const vessel3El = createRingMarker('#ff9933', 24);
        STATE.vessel3Marker = new mapboxgl.Marker(vessel3El)
            .setLngLat([-75.50825714631313, 20.824164958514658])
            .addTo(STATE.map);
        STATE.vessel3Marker.getElement().style.display = 'none';
        
        console.log('✓ Vessel markers created (3 vessels)');
        
        const dataLoaded = await loadChapterData();
        
        if (dataLoaded) {
            for (let i = 1; i <= 5; i++) {
                addLayerToMap(i);
            }
            
            if (STATE.vessel2Data) {
                addVessel2Layers();
            }
            
            if (STATE.chapter7AkademikData && STATE.chapter7EqualityData) {
                addChapter7Layers();
            }
            
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
            
            initScrollytelling();
        } else {
            console.warn('⚠ Some data files missing, initializing with available data');
            initScrollytelling();
        }
    });
}

// ============================================================================
// PAGE LOAD HANDLING
// ============================================================================

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

console.log('╔═══════════════════════════════════════════════╗');
console.log('║  THEIA MARITIME INTELLIGENCE                  ║');
console.log('║  AKADEMIK GUBKIN Tracker v4.1 FIXED          ║');
console.log('║  Professional Scrollytelling Experience       ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('');
console.log('Initializing professional maritime tracking experience...');
console.log('');

initializeMap();