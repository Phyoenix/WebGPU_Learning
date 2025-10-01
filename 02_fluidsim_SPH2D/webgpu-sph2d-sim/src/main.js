// This file is the entry point of the application. It initializes WebGPU, sets up the SPH simulation parameters, creates buffers for particle data, and manages the rendering loop.

let device, particleBuffer, numParticles, uniformBuffer, uniformBindGroup;
let particleRadius = 0.01; // 初始半径（裁剪空间）
let particleColor = [0.2, 0.6, 1.0, 1.0]; // 初始颜色

function updateUniformBuffer() {
    // radius: float32, color: float32[4]
    const uniformData = new Float32Array([particleRadius, ...particleColor]);
    device.queue.writeBuffer(uniformBuffer, 0, uniformData.buffer);
}

function hexToRGBA(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [
        ((bigint >> 16) & 255) / 255,
        ((bigint >> 8) & 255) / 255,
        (bigint & 255) / 255,
        1.0
    ];
}

function generateParticles() {
    const initialParticleData = new Float32Array(numParticles * 2);
    const centerX = 0, centerY = 0;
    const radius = 200;
    for (let i = 0; i < numParticles; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const r = Math.sqrt(Math.random()) * radius;
        const dx = (Math.random() - 0.5) * 10;
        const dy = (Math.random() - 0.5) * 10;
        let x = centerX + r * Math.cos(theta) + dx;
        let y = centerY + r * Math.sin(theta) + dy;
        x = x / 400;
        y = y / 400;
        initialParticleData[i * 2 + 0] = x;
        initialParticleData[i * 2 + 1] = y;
    }
    device.queue.writeBuffer(particleBuffer, 0, initialParticleData);
}

async function main() {
    const webgpu = await initWebGPU();
    device = webgpu.device;
    numParticles = 4096;
    const particleStructSize = 2 * 4;
    const particleBufferSize = numParticles * particleStructSize;

    particleBuffer = device.createBuffer({
        size: particleBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
    });

    // uniform: radius(float) + color(vec4)
    uniformBuffer = device.createBuffer({
        size: 4 * 5,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    updateUniformBuffer();

    generateParticles();

    const renderPipeline = createRenderPipeline(device, webgpu.format);
    const particleBindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: particleBuffer } },
            { binding: 1, resource: { buffer: uniformBuffer } }
        ]
    });

    function frame() {
        const commandEncoder = device.createCommandEncoder();
        const textureView = webgpu.context.getCurrentTexture().createView();

        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.1, g: 0.1, b: 0.15, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
        });

        renderPass.setPipeline(renderPipeline);
        renderPass.setBindGroup(0, particleBindGroup);
        renderPass.draw(6, numParticles, 0, 0); // 6为六边形顶点数
        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

function createRenderPipeline(device, format) {
    const wgslCode = `
        struct Particle {
            position: vec2<f32>,
        };
        @group(0) @binding(0) var<storage, read> particles: array<Particle>;
        struct Uniforms {
            radius: f32,
            color: vec4<f32>,
        };
        @group(0) @binding(1) var<uniform> uniforms: Uniforms;

        struct VertexOutput {
            @builtin(position) pos: vec4<f32>,
            @location(0) color: vec4<f32>,
        };

        @vertex
        fn vs_main(
            @builtin(vertex_index) vid : u32,
            @builtin(instance_index) iid : u32
        ) -> VertexOutput {
            // 以正六边形近似圆
            var circle = array<vec2<f32>, 6>(
                vec2<f32>(0.0, 1.0),
                vec2<f32>(0.866, 0.5),
                vec2<f32>(0.866, -0.5),
                vec2<f32>(0.0, -1.0),
                vec2<f32>(-0.866, -0.5),
                vec2<f32>(-0.866, 0.5)
            );
            let center = particles[iid].position;
            let local = circle[vid] * uniforms.radius;
            var output: VertexOutput;
            output.pos = vec4<f32>(center + local, 0.0, 1.0);
            output.color = uniforms.color;
            return output;
        }

        @fragment
        fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
            return input.color;
        }
    `;

    const shaderModule = device.createShaderModule({ code: wgslCode });

    return device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
            buffers: [],
        },
        fragment: {
            module: shaderModule,
            entryPoint: 'fs_main',
            targets: [{ format: format }],
        },
        primitive: {
            topology: 'triangle-fan',
        },
    });
}

// 供按钮调用
window.restartSimulation = function() {
    generateParticles();
};

document.getElementById('restart-btn').onclick = window.restartSimulation;

// 半径滑块
const radiusSlider = document.getElementById('radius-slider');
const radiusValue = document.getElementById('radius-value');
radiusSlider.oninput = function() {
    // 0.01 ~ 0.05 映射
    particleRadius = parseFloat(radiusSlider.value) / 800;
    radiusValue.textContent = radiusSlider.value;
    updateUniformBuffer();
};

// 颜色选择器
const colorPicker = document.getElementById('color-picker');
colorPicker.oninput = function() {
    particleColor = hexToRGBA(colorPicker.value);
    updateUniformBuffer();
};

main().catch(err => console.error(err));

#webgpu-canvas {
    width: 800px;
    height: 800px;
    min-width: 800px;
    min-height: 800px;
    max-width: 800px;
    max-height: 800px;
    aspect-ratio: 1/1;
    display: block;
    background: #222;
}

const canvas = document.getElementById('webgpu-canvas');
canvas.width = 800;
canvas.height = 800;