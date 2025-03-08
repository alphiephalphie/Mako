# Mako Art Generator

A generative art application that creates beautiful flow field visualizations using Three.js. Create, customize, and export unique artworks with various styles and configurations.

## Features

- **Flow Field Generation**: Create mesmerizing flow field patterns with customizable parameters
- **Multiple Art Styles**: Choose from various movement styles including:
  - Free Movement
  - Orthogonal (90° Turns)
  - Diagonal (45° Angles)
  - Spiral Tendency
  - Vine Growth
  - DNA Helix
  - Crystal Growth
  - Liquid Flow

- **Real-time Controls**:
  - Adjust line width, count, and speed
  - Modify turn frequency and movement patterns
  - Control trail effects and fade options
  - Save and load custom configurations

- **Export Options**:
  - Save as high-resolution PNG images
  - Record animations as MP4/WebM
  - Multiple resolution presets up to 8K
  - Various aspect ratio options

- **Field Manipulators**:
  - Gravity Wells
  - Repulsors
  - Vortexes
  - Turbulence Zones
  - Freeze Zones
  - Respawn Points
  - Critical Mass Explosions

- **Color Palettes**:
  - Original
  - Sunset
  - Ocean
  - Forest
  - Neon
  - Patriotic
  - And more...

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alphiephalphie/Mako.git
   cd Mako
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```

4. Open in your browser:
   ```
   http://localhost:3000
   ```

## Usage

1. **Basic Controls**:
   - ▶️ Play/Pause: Start or stop the art generation
   - 🕒 Recording: Click to cycle through recording durations
   - ✎ New: Create new artwork with current settings
   - ⤓ Save: Export current artwork as PNG

2. **Customization**:
   - Adjust resolution and aspect ratio
   - Select color palettes and movement styles
   - Modify line properties and behaviors
   - Add and position field manipulators

3. **Configuration Management**:
   - Save current settings as named configurations
   - Load previously saved configurations
   - Delete unwanted configurations

## Progressive Web App

Mako is available as a Progressive Web App (PWA), offering:
- Offline functionality
- Install to home screen
- Native app-like experience
- Automatic updates

## Technical Details

- Built with Three.js for WebGL rendering
- Node.js/Express backend for file handling
- HTML5 Canvas for high-resolution exports
- Service Workers for PWA functionality

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Three.js for the powerful 3D rendering capabilities
- Flow field algorithms inspired by various generative art techniques
- Color palettes curated for artistic expression