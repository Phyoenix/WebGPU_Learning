// This file contains the rendering shader code for displaying the particles on the canvas.
// It handles the vertex and fragment shaders to visualize the particles.

struct Particle {
    position: vec2<f32>,
};

@group(0) @binding(0) var<storage, read> particles: array<Particle>;

struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
    @location(0) color: vec4<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) index: u32) -> VertexOutput {
    var output: VertexOutput;
    
    let pos = particles[index].position;
    let particle_size = 0.005; 
    output.pos = vec4<f32>(pos * particle_size, 0.0, 1.0);
    output.color = vec4<f32>(0.2, 0.6, 1.0, 1.0); // Blue color
    
    return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
    return input.color;
}