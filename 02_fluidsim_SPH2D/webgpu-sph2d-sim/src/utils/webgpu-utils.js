// This file contains utility functions for initializing WebGPU, creating buffers, and managing shader modules.

export async function initWebGPU() {
    if (!navigator.gpu) {
        throw new Error("WebGPU not supported on this browser.");
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("No appropriate GPUAdapter found.");
    }
    const device = await adapter.requestDevice();

    return { device };
}

export function createBuffer(device, size, usage) {
    return device.createBuffer({
        size: size,
        usage: usage,
    });
}

export function createShaderModule(device, code) {
    return device.createShaderModule({ code: code });
}

export function createBindGroup(device, layout, entries) {
    return device.createBindGroup({
        layout: layout,
        entries: entries,
    });
}