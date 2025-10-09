// Chapter 7 - Journey Overview: Elegant Start & End Markers

function animateChapter7(map, vesselMarker) {
    console.log('🎬 Chapter 7: Creating elegant journey markers');
    
    // Clean up previous chapter elements
    document.querySelectorAll('.mapboxgl-popup').forEach(el => el.remove());
    document.querySelectorAll('[class*="chapter6"]').forEach(el => el.remove());
    console.log('✓ Cleaned up previous chapter');
    
    // Journey endpoints
    const START = [28.6416, 59.9310];  // Russia - Ust-Luga
    const END = [-75.57254, 20.79897];   // Haiti - STS site
    
    // Elegant CSS with slow heartbeat animation
    const style = document.createElement('style');
    style.id = 'ch7-elegant-style';
    style.textContent = `
        .journey-marker {
            position: relative;
            width: 50px;
            height: 50px;
        }
        
        /* Core glowing dot */
        .journey-marker-core {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background: rgba(0, 255, 136, 0.9);
            border-radius: 50%;
            box-shadow: 
                0 0 20px rgba(0, 255, 136, 0.8),
                0 0 40px rgba(0, 255, 136, 0.5),
                inset 0 0 10px rgba(0, 255, 136, 1);
            animation: heartbeat 2.5s ease-in-out infinite;
        }
        
        /* Outer pulse ring */
        .journey-marker-pulse {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            border: 2px solid rgba(0, 255, 136, 0.6);
            border-radius: 50%;
            animation: pulse-ring 2.5s ease-out infinite;
        }
        
        /* Subtle ambient glow */
        .journey-marker-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            height: 80%;
            background: radial-gradient(
                circle,
                rgba(0, 255, 136, 0.3) 0%,
                rgba(0, 255, 136, 0.1) 50%,
                transparent 100%
            );
            border-radius: 50%;
            animation: glow-pulse 2.5s ease-in-out infinite;
        }
        
        /* Heartbeat animation - slow, elegant pulse */
        @keyframes heartbeat {
            0%, 100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.9;
            }
            14% {
                transform: translate(-50%, -50%) scale(1.15);
                opacity: 1;
            }
            28% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.9;
            }
            42% {
                transform: translate(-50%, -50%) scale(1.1);
                opacity: 1;
            }
            56% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.85;
            }
        }
        
        /* Expanding pulse ring */
        @keyframes pulse-ring {
            0% {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0.8;
            }
            100% {
                transform: translate(-50%, -50%) scale(2);
                opacity: 0;
            }
        }
        
        /* Subtle glow pulse */
        @keyframes glow-pulse {
            0%, 100% {
                opacity: 0.6;
                transform: translate(-50%, -50%) scale(1);
            }
            50% {
                opacity: 0.9;
                transform: translate(-50%, -50%) scale(1.1);
            }
        }
    `;
    document.head.appendChild(style);
    console.log('✓ Elegant CSS injected');
    
    // Wait for map to be fully ready (CRITICAL for proper positioning)
    setTimeout(() => {
        console.log('Creating journey markers...');
        
        // Create START marker (Russia)
        const startEl = document.createElement('div');
        startEl.className = 'journey-marker';
        startEl.innerHTML = `
            <div class="journey-marker-glow"></div>
            <div class="journey-marker-pulse"></div>
            <div class="journey-marker-core"></div>
        `;
        
        const startMarker = new mapboxgl.Marker({
            element: startEl,
            anchor: 'center'
        }).setLngLat(START).addTo(map);
        
        console.log('✓ START marker created at Russia', START);
        
        // Create END marker (Haiti)
        const endEl = document.createElement('div');
        endEl.className = 'journey-marker';
        endEl.innerHTML = `
            <div class="journey-marker-glow"></div>
            <div class="journey-marker-pulse"></div>
            <div class="journey-marker-core"></div>
        `;
        
        const endMarker = new mapboxgl.Marker({
            element: endEl,
            anchor: 'center'
        }).setLngLat(END).addTo(map);
        
        console.log('✓ END marker created at Haiti', END);
        
        // Store for cleanup
        window.ch7Markers = { startMarker, endMarker, style };
        
    }, 500); // Critical delay for proper positioning
    
    // Show all chapter layers for journey overview
    for (let i = 1; i <= 5; i++) {
        if (map.getLayer(`chapter${i}-layer`)) {
            map.setPaintProperty(`chapter${i}-layer`, 'line-opacity', 0.75);
        }
        if (map.getLayer(`chapter${i}-glow`)) {
            map.setPaintProperty(`chapter${i}-glow`, 'line-opacity', 0.35);
        }
    }
    
    // Hide vessel2 layers
    if (map.getLayer('vessel2-layer')) {
        map.setPaintProperty('vessel2-layer', 'line-opacity', 0);
    }
    if (map.getLayer('vessel2-glow')) {
        map.setPaintProperty('vessel2-glow', 'line-opacity', 0);
    }
    
    console.log('✓ All chapter layers visible');
    console.log('✅ Chapter 7 complete - Elegant journey markers visible');
    
    // Cleanup function
    return {
        stop: () => {
            if (window.ch7Markers) {
                window.ch7Markers.startMarker.remove();
                window.ch7Markers.endMarker.remove();
                window.ch7Markers.style.remove();
                window.ch7Markers = null;
            }
            console.log('🧹 Chapter 7 markers removed');
        },
        pause: () => {},
        resume: () => {},
        reset: () => {},
        getProgress: () => 1,
        isComplete: () => true,
        isPaused: () => false
    };
}