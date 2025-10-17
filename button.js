// button.js - Professional Maritime Platform CTA Button

(function() {
    'use strict';
  
    // Button configuration
    const buttonConfig = {
      text: 'Reach out',
      url: 'https://www.synmax.com/contact-us/?hsCtaAttrib=185462734695', // Replace with your actual platform URL
      trackingEvent: 'theia_platform_cta', // For analytics
      animationDelay: 500 // Delay before button appears
    };
  
    // Inject button CSS styles
    function injectButtonStyles() {
      if (document.getElementById('maritime-button-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'maritime-button-styles';
      style.textContent = `
        /* Maritime Platform CTA Button Styles */
        .maritime-cta-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 3rem 0 2rem 0;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
  
        .maritime-cta-container.visible {
          opacity: 1;
          transform: translateY(0);
        }
  
        .maritime-cta-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(26, 128, 253, 0.1));
          border: 2px solid transparent;
          border-radius: 50px;
          color: var(--text-primary, #ffffff);
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 255, 255, 0.1);
          min-width: 280px;
          white-space: nowrap;
        }
  
        /* Animated border gradient */
        .maritime-cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 2px;
          background: linear-gradient(45deg, 
            var(--primary-glow, #00ffff), 
            var(--secondary-glow, #1a80fd), 
            var(--primary-glow, #00ffff)
          );
          background-size: 200% 200%;
          border-radius: 50px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          animation: gradient-shift 3s ease-in-out infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
  
        /* Hover glow effect */
        .maritime-cta-button::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%);
          border-radius: 50px;
          transform: translate(-50%, -50%) scale(0);
          transition: transform 0.4s ease;
          z-index: -1;
        }
  
        /* Hover states */
        .maritime-cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 45px rgba(0, 255, 255, 0.2);
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(26, 128, 253, 0.15));
        }
  
        .maritime-cta-button:hover::before {
          opacity: 1;
        }
  
        .maritime-cta-button:hover::after {
          transform: translate(-50%, -50%) scale(1.2);
        }
  
        /* Active state */
        .maritime-cta-button:active {
          transform: translateY(-1px);
        }
  
        /* Button icon */
        .maritime-cta-icon {
          margin-left: 0.75rem;
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }
  
        .maritime-cta-button:hover .maritime-cta-icon {
          transform: translateX(4px);
        }
  
        /* Loading state */
        .maritime-cta-button.loading {
          pointer-events: none;
          opacity: 0.7;
        }
  
        .maritime-cta-button.loading .maritime-cta-icon {
          animation: spin 1s linear infinite;
        }
  
        /* Gradient animation */
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
  
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
  
        /* Success animation */
        @keyframes success-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
  
        .maritime-cta-button.success {
          animation: success-pulse 0.6s ease;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.1));
        }
  
        /* Mobile optimizations */
        @media screen and (max-width: 768px) {
          .maritime-cta-container {
            margin: 2rem 0 1.5rem 0;
          }
  
          .maritime-cta-button {
            padding: 0.9rem 2rem;
            font-size: 1rem;
            min-width: 240px;
          }
  
          .maritime-cta-icon {
            margin-left: 0.5rem;
            font-size: 1.1rem;
          }
        }
  
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .maritime-cta-button {
            border: 2px solid var(--primary-glow, #00ffff);
            background: rgba(0, 0, 0, 0.8);
          }
        }
  
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .maritime-cta-button,
          .maritime-cta-button::before,
          .maritime-cta-button::after,
          .maritime-cta-icon {
            animation: none !important;
            transition-duration: 0.1s !important;
          }
        }
  
        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .maritime-cta-button {
            background: linear-gradient(135deg, rgba(0, 255, 255, 0.08), rgba(26, 128, 253, 0.08));
          }
        }
  
        /* Focus styles for accessibility */
        .maritime-cta-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.4);
        }
  
        .maritime-cta-button:focus-visible {
          outline: 2px solid var(--primary-glow, #00ffff);
          outline-offset: 2px;
        }
      `;
      
      document.head.appendChild(style);
      console.log('✅ Maritime button styles injected');
    }
  
    // Create button HTML
    function createButtonHTML() {
      return `
        <div class="maritime-cta-container" id="maritime-cta">
          <a href="${buttonConfig.url}" 
             class="maritime-cta-button" 
             id="maritime-platform-btn"
             role="button"
             aria-label="Explore SynMax Theia Maritime Intelligence Platform"
             target="_blank"
             rel="noopener noreferrer">
            <span class="maritime-cta-text">${buttonConfig.text}</span>
            <span class="maritime-cta-icon" aria-hidden="true">→</span>
          </a>
        </div>
      `;
    }
  
    // Handle button click with analytics and loading state
    function handleButtonClick(event) {
      const button = event.target.closest('.maritime-cta-button');
      if (!button) return;
  
      // Add loading state
      button.classList.add('loading');
      const icon = button.querySelector('.maritime-cta-icon');
      const originalIcon = icon.textContent;
      icon.textContent = '⟳';
  
      // Track the click event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
          event_category: 'CTA',
          event_label: buttonConfig.trackingEvent,
          transport_type: 'beacon'
        });
      }
  
      // Simulate brief loading (remove in production if instant redirect desired)
      setTimeout(() => {
        button.classList.remove('loading');
        button.classList.add('success');
        icon.textContent = '✓';
        
        // Reset after animation
        setTimeout(() => {
          button.classList.remove('success');
          icon.textContent = originalIcon;
        }, 600);
      }, 300);
  
      console.log('🚀 Maritime platform CTA clicked');
    }
  
    // Initialize button with intersection observer for animation
    function initializeButton() {
      // Find the debrief section
      const debriefSection = document.querySelector('.debrief-analysis');
      if (!debriefSection) {
        console.warn('Debrief section not found, cannot insert button');
        return;
      }
  
      // Insert button after the debrief section
      debriefSection.insertAdjacentHTML('afterend', createButtonHTML());
  
      // Get button elements
      const container = document.getElementById('maritime-cta');
      const button = document.getElementById('maritime-platform-btn');
  
      if (!container || !button) {
        console.error('Button elements not found after insertion');
        return;
      }
  
      // Add click handler
      button.addEventListener('click', handleButtonClick);
  
      // Intersection observer for reveal animation
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, buttonConfig.animationDelay);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      });
  
      observer.observe(container);
  
      // Add keyboard support
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          button.click();
        }
      });
  
      console.log('✅ Maritime platform button initialized');
    }
  
    // Initialize when DOM is ready
    function init() {
      // Inject styles first
      injectButtonStyles();
  
      // Initialize button
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeButton);
      } else {
        initializeButton();
      }
    }
  
    // Auto-initialize
    init();
  
    // Export for external use if needed
    window.MaritimeButton = {
      reinitialize: initializeButton,
      config: buttonConfig
    };
  
  })();