# AKADEMIK GUBKIN Scrollytelling - Mobile Maritime Intelligence

## 🚢 Project Overview
Mobile-first scrollytelling experience tracking the AKADEMIK GUBKIN (IMO: 9842190) vessel's sanctioned oil transport from Russia to Cuba. Designed specifically for LinkedIn video capture and social media engagement.

## 📱 Mobile Optimization Features

### Screen Compatibility
- Optimized for iPhone 14 Pro/Pro Max
- Android compatibility (Samsung Galaxy S22/S23)
- Viewport: 390x844px (iPhone 14 Pro)
- Touch-friendly navigation
- Smooth scroll performance

### Visual Design
- Dark theme for dramatic effect
- High contrast for outdoor visibility
- Glassmorphic cards with backdrop blur
- Gradient accents (#3b82f6 → #8b5cf6)
- Minimal text, maximum visual impact

## 🗺️ Story Structure

### Chapter Breakdown
1. **Title Screen**: Hook with "SHADOW VOYAGE" branding
2. **Baltic Origin**: Loading at Primorsk Terminal
3. **Going Dark**: 72-hour AIS blackout
4. **SAR Detection**: Satellite imagery capture
5. **Caribbean Approach**: AIS reactivation
6. **STS Transfer**: Live monitoring near Cuba
7. **Intelligence Summary**: Key findings & CTA

## 🛠️ Technical Implementation

### Setup Instructions

1. **Add Mapbox Token**
   ```javascript
   // In map.js, line 2
   mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN_HERE';
   ```

2. **Install Dependencies**
   - Mapbox GL JS v2.15.0
   - Scrollama v3.2.0
   - No build process required (CDN links)

3. **Customize Vessel Data**
   - Edit `vesselData.js` for different vessels
   - Update coordinates in route arrays
   - Modify event timeline

### Recording for LinkedIn

1. **Screen Recording Setup**
   - Use iPhone native screen recorder
   - Or QuickTime on Mac with iPhone connected
   - Chrome DevTools device emulation (390x844)

2. **Recording Tips**
   - Scroll smoothly, pause at each chapter
   - Total duration: 45-60 seconds
   - Export as MP4, 1080x1920 (9:16 ratio)

3. **LinkedIn Optimization**
   - Add captions for silent autoplay
   - Use hashtags: #MaritimeIntelligence #Shipping #OSINT
   - Post during peak hours (Tue-Thu, 8-10am)

## 🎨 Styling Customization

### Brand Colors
```css
--primary-blue: #3b82f6;
--primary-purple: #8b5cf6;
--danger-red: #ef4444;
--success-green: #22c55e;
--warning-orange: #fb923c;
```

### Animation Timings
- Card fade-in: 600ms cubic-bezier
- Map fly-to: 3500ms average
- Progress bar: 300ms ease
- Pulse effects: 2s infinite

## 📊 Metrics & Analytics

### Engagement Tracking
- Scroll depth percentage
- Time per chapter
- Interaction points (if made interactive)
- Share/save analytics

### Performance Targets
- First paint: <1.5s
- Time to interactive: <3s
- Smooth 60fps scrolling
- Total bundle: <500KB

## 🚀 Future Enhancements

### Version 2.0 Ideas
1. **Interactive Elements**
   - Tap to reveal vessel details
   - Swipe between multiple vessels
   - Real-time AIS feed integration

2. **AR Features**
   - 3D vessel models
   - Volumetric cargo visualization
   - Route projection in AR space

3. **Data Layers**
   - Weather overlay
   - Port congestion heat maps
   - Historical route patterns
   - Sanctions database integration

4. **Social Features**
   - Share specific chapters
   - Embed in reports
   - Collaborative annotations

## 📈 Content Strategy

### Story Templates
1. **Sanctions Evasion**: Like AKADEMIK GUBKIN
2. **Port Congestion**: Real-time bottlenecks
3. **Fleet Analysis**: Company-wide movements
4. **Incident Response**: Groundings, collisions
5. **Trade Flow**: Commodity route changes

### Publishing Cadence
- Weekly: Major incident stories
- Bi-weekly: Market analysis scrollies
- Monthly: Deep-dive investigations

## 🔧 Troubleshooting

### Common Issues
1. **Map not loading**: Check Mapbox token
2. **Jerky scroll**: Reduce animation complexity
3. **Cards not fading**: Check Scrollama offset
4. **Mobile performance**: Disable map interactions

## 📝 Notes for LinkedIn Strategy

### Engagement Tactics
- Start with shocking stat or visual
- Use "BREAKING" or "EXCLUSIVE" sparingly
- End with clear CTA to Theia platform
- Reply to comments with additional intel
- Cross-post to Twitter with thread

### Metrics to Track
- Views in first hour
- Engagement rate (likes/comments/shares)
- Profile visits from post
- Demo requests generated

## 🤝 Credits

Created for SynMax Intelligence - Theia Platform
Tracking sanctioned vessels with satellite & AIS fusion

---

*For internal use only. Contains sensitive vessel tracking methodologies.*
