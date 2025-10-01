# 2D Smoothed Particle Hydrodynamics (SPH) Simulation using WebGPU

This project implements a 2D Smoothed Particle Hydrodynamics (SPH) simulation using WebGPU. The simulation visualizes fluid dynamics by modeling particles and their interactions based on the SPH algorithm.

## Project Structure

```
webgpu-sph2d-sim
├── src
│   ├── index.html          # Main HTML document for rendering the simulation
│   ├── main.js             # Entry point of the application
│   ├── sph
│   │   ├── sphCompute.wgsl # Compute shader for SPH simulation
│   │   └── sphRender.wgsl  # Rendering shader for visualizing particles
│   └── utils
│       └── webgpu-utils.js # Utility functions for WebGPU
├── package.json            # npm configuration file
└── README.md               # Project documentation
```

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd webgpu-sph2d-sim
   ```

2. **Install Dependencies**
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Open the Project**
   Open `src/index.html` in a web browser that supports WebGPU (e.g., Chrome with WebGPU enabled).

4. **Run the Simulation**
   The simulation should start automatically upon loading the HTML file. You will see particles representing fluid dynamics rendered on the canvas.

## Overview of SPH Simulation

The SPH simulation is based on the following principles:

- **Particles**: The fluid is represented by a set of particles, each with properties such as position, velocity, and density.
- **Kernel Function**: A smoothing kernel is used to compute interactions between particles based on their distance.
- **Compute Shader**: The compute shader (`sphCompute.wgsl`) updates the properties of particles based on their interactions.
- **Rendering Shader**: The rendering shader (`sphRender.wgsl`) visualizes the particles on the canvas.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.