import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMode } from '../types';

interface GarlandProps {
  mode: TreeMode;
  turns?: number;
  height?: number;
  radius?: number;
}

export const Garland: React.FC<GarlandProps> = ({ mode, turns = 8, height = 12, radius = 8 }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // build spiral path along the upper cone only, pushed outside the foliage
  const outerOffset = 3.5; // stronger offset so ribbon sits clearly outside
  const { curve, tubularSegments } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 384; // even fewer segments => sparser appearance
    // Start wrapping from the upper portion of the tree using normalized height (0..1)
    const baseYNorm = 0.55; // start at 55% height up the tree
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // yNorm goes from baseYNorm .. 1.0 (normalized against total height)
      const yNorm = baseYNorm + t * (1.0 - baseYNorm);
      const y = yNorm * height;
      // Radius follows the tree's cone formula: currentRadius = maxRadius * (1 - yNorm)
      const r = radius * (1 - yNorm) + outerOffset;
      // Angle wraps according to turns
      const angle = yNorm * turns * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      pts.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return { curve, tubularSegments: segments * 2 };
  }, [turns, height, radius]);

  // material uniforms
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uProgress: { value: 0 } }), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const mat = (meshRef.current.material as any);
    if (mat && mat.uniforms) {
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      const target = mode === TreeMode.FORMED ? 1 : 0;
      // If hiding (target 0) fade quickly, otherwise reveal smoothly bottom->top
      const speed = target === 0 ? delta * 10.0 : delta * 1.0;
      mat.uniforms.uProgress.value = THREE.MathUtils.lerp(mat.uniforms.uProgress.value, target, speed);
    }
  });

  // Shader with silk-like sheen and bottom-to-top reveal using vUv.y
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPos;
    void main(){
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vViewPos = -mvPos.xyz;
      gl_Position = projectionMatrix * mvPos;
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uProgress;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPos;

    // Simple PBR-ish specular for silk sheen
    float specularTerm(vec3 N, vec3 V, float shininess) {
      vec3 L = normalize(vec3(0.3, 0.8, 0.6));
      vec3 H = normalize(L + V);
      float ndotL = max(dot(N, L), 0.0);
      float ndotH = max(dot(N, H), 0.0);
      float spec = pow(ndotH, shininess) * ndotL;
      return spec;
    }

    void main(){
      // stripe base colors (sparser stripes for silk look)
      float stripes = 6.0;
      float s = sin((vUv.y * stripes + uTime * 0.4) * 3.1415);
      float k = smoothstep(-0.2, 0.2, s);
      vec3 colA = vec3(0.85,0.18,0.25);
      vec3 colB = vec3(0.98,0.85,0.25);
      vec3 base = mix(colA, colB, k);

      // silk sheen with fresnel for edge highlight
      vec3 V = normalize(vViewPos);
      float spec = specularTerm(normalize(vNormal), V, 60.0) * 1.0;
      float fresnel = pow(1.0 - max(dot(normalize(vNormal), V), 0.0), 3.0);
      vec3 color = base + vec3(spec * 0.25) + vec3(fresnel * 0.12);

      // bottom-to-top reveal: when uProgress grows, reveal more from bottom (vUv.y)
      float reveal = smoothstep(0.0, 1.0, (vUv.y - (1.0 - uProgress)) * 6.0);

      // global alpha scaled for silk translucency and fresnel edge
      float baseAlpha = 0.9;
      float alpha = baseAlpha * reveal * clamp(uProgress*1.2, 0.0, 1.0);
      alpha *= mix(0.7, 1.0, fresnel);

      // gentle horizontal falloff to make edges softer
      float edge = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
      alpha *= edge;

      gl_FragColor = vec4(color, alpha);
    }
  `;

  return (
    <group position={[0, -5, 0]}>
      <mesh ref={meshRef} frustumCulled={false}>
        <tubeGeometry args={[curve, tubularSegments, 0.12, 12, false]} />
        {/* @ts-ignore */}
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default Garland;
