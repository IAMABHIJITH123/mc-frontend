"use client";

import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

import './SoftAurora.css';

function hexToVec3(hex: string) {
    const h = hex.replace('#', '');
    return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255
    ];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uScale;
uniform float uBrightness;
uniform float uNoiseFrequency;
uniform float uNoiseAmplitude;
uniform float uBandHeight;
uniform float uBandSpread;
uniform float uOctaveDecay;
uniform float uLayerOffset;
uniform float uColorSpeed;
uniform vec2 uMouse;

// Simple 2D noise based on hash
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// 2D Noise function
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Fractional Brownian Motion for multi-layered noise
float fbm(vec2 p) {
  float v = 0.0;
  float amp = uNoiseAmplitude;
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p *= 2.0;
    amp *= uOctaveDecay;
  }
  return v;
}

void main() {
  vec2 p = vUv * uScale;
  float time = uTime * 0.5;

  // Layered movement
  float n = fbm(p + vec2(time, time * 0.5));
  float n2 = fbm(p - vec2(time * 0.3, time * 0.7) + uLayerOffset);

  // Aurora band calculation
  float band = smoothstep(0.0, uBandSpread, uBandHeight - abs(vUv.y - 0.5 + n * 0.2));
  float band2 = smoothstep(0.0, uBandSpread * 1.5, uBandHeight * 1.2 - abs(vUv.y - 0.5 + n2 * 0.3));

  // Mouse influence
  float mouseForce = smoothstep(0.5, 0.0, length(vUv - uMouse));
  band += mouseForce * 0.1;

  // Color blending
  float colorShift = sin(uTime * uColorSpeed) * 0.5 + 0.5;
  vec3 baseColor = mix(uColor1, uColor2, colorShift + n * 0.2);
  vec3 finalColor = baseColor * (band + band2 * 0.5) * uBrightness;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

interface SoftAuroraProps {
    speed?: number;
    scale?: number;
    brightness?: number;
    color1?: string;
    color2?: string;
    noiseFrequency?: number;
    noiseAmplitude?: number;
    bandHeight?: number;
    bandSpread?: number;
    octaveDecay?: number;
    layerOffset?: number;
    colorSpeed?: number;
    enableMouseInteraction?: boolean;
    mouseInfluence?: number;
}

export default function SoftAurora({
    speed = 1.0,
    scale = 1.0,
    brightness = 1.0,
    color1 = '#4c1d95',
    color2 = '#0e7490',
    noiseFrequency = 1.0,
    noiseAmplitude = 0.5,
    bandHeight = 0.2,
    bandSpread = 0.3,
    octaveDecay = 0.5,
    layerOffset = 0.1,
    colorSpeed = 1.0,
    enableMouseInteraction = true,
    mouseInfluence = 0.5
}: SoftAuroraProps = {}) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
        const gl = renderer.gl;
        container.appendChild(gl.canvas);

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: hexToVec3(color1) },
                uColor2: { value: hexToVec3(color2) },
                uScale: { value: scale },
                uBrightness: { value: brightness },
                uNoiseFrequency: { value: noiseFrequency },
                uNoiseAmplitude: { value: noiseAmplitude },
                uBandHeight: { value: bandHeight },
                uBandSpread: { value: bandSpread },
                uOctaveDecay: { value: octaveDecay },
                uLayerOffset: { value: layerOffset },
                uColorSpeed: { value: colorSpeed },
                uMouse: { value: [0.5, 0.5] }
            }
        });

        const mesh = new Mesh(gl, { geometry, program });

        function resize() {
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            renderer.setSize(width, height);
        }
        window.addEventListener('resize', resize);
        resize();

        let animationFrameId: number;
        function handleMouseMove(e: MouseEvent) {
            const rect = gl.canvas.getBoundingClientRect();
            program.uniforms.uMouse.value = [
                (e.clientX - rect.left) / rect.width,
                1.0 - (e.clientY - rect.top) / rect.height
            ];
        }

        function handleMouseLeave() {
            program.uniforms.uMouse.value = [0.5, 0.5];
        }

        if (enableMouseInteraction) {
            gl.canvas.addEventListener('mousemove', handleMouseMove);
            gl.canvas.addEventListener('mouseleave', handleMouseLeave);
        }

        function update(t: number) {
            animationFrameId = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001 * speed;
            renderer.render({ scene: mesh });
        }
        animationFrameId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
            if (enableMouseInteraction) {
                gl.canvas.removeEventListener('mousemove', handleMouseMove);
                gl.canvas.removeEventListener('mouseleave', handleMouseLeave);
            }
            if (container.contains(gl.canvas)) {
                container.removeChild(gl.canvas);
            }
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, [speed, scale, brightness, color1, color2, noiseFrequency, noiseAmplitude, bandHeight, bandSpread, octaveDecay, layerOffset, colorSpeed, enableMouseInteraction, mouseInfluence]);

    return <div ref={containerRef} className="soft-aurora-container" style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }} />;
}
