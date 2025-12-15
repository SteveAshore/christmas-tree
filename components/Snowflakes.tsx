import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMode } from '../types';

interface SnowflakesProps {
  mode: TreeMode;
  count: number;
}

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;

  attribute vec3 aChaosPos; // sphere scatter positions
  attribute vec2 aFallXZ; // x,z starting plane positions
  attribute float aFallStartY; // starting Y for fall
  attribute float aSpeed;
  attribute float aRandom;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // Falling behavior (looping)
    float speed = aSpeed * 0.3 + 0.2; // generally slower
    float t = mod(uTime * speed + aRandom * 10.0, 1.0);
    float fallDistance = 16.0; // shorter per loop for gentle fall
    float yFall = aFallStartY - t * fallDistance;

    // small, subtle sway
    float swayX = sin(uTime * (0.3 + aRandom)) * 0.2 * (1.0 - t);
    float swayZ = cos(uTime * (0.25 + aRandom)) * 0.2 * (1.0 - t);

    vec3 fallPos = vec3(aFallXZ.x + swayX, yFall, aFallXZ.y + swayZ);

    // Mix between chaos sphere and falling behavior depending on progress
    vec3 pos = mix(aChaosPos, fallPos, uProgress);

    // Slight jitter for depth
    pos += vec3(sin(aRandom * 10.0 + uTime) * 0.02);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation and subtle variation (tamer sizes)
    gl_PointSize = (1.5 + aRandom * 1.5) * (120.0 / -mvPosition.z);

    vAlpha = 0.6 - aRandom * 0.4;
    vColor = vec3(1.0, 1.0, 1.0);
  }
`;

const fragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.6);
    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

export const Snowflakes: React.FC<SnowflakesProps> = ({ mode, count }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { chaosPositions, fallXZ, fallStartY, speeds, randoms } = useMemo(() => {
    const chaos = new Float32Array(count * 3);
    const fxz = new Float32Array(count * 2);
    const fsy = new Float32Array(count);
    const sp = new Float32Array(count);
    const rnd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Chaos: Random point inside a larger volume (more even distribution)
      const maxRadius = 30;
      const radius = 8 + Math.cbrt(Math.random()) * (maxRadius - 8);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      chaos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      chaos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      chaos[i * 3 + 2] = radius * Math.cos(phi);

      // Fall plane XZ (spread wider around the tree)
      const maxXZ = 18; // increase horizontal spread
      fxz[i * 2] = (Math.random() - 0.5) * maxXZ * 2.0;
      fxz[i * 2 + 1] = (Math.random() - 0.5) * maxXZ * 2.0;

      // Start Y above tree (higher variation)
      fsy[i] = 14 + Math.random() * 10;

      // Slower falling speeds for gentle snowfall
      sp[i] = 0.1 + Math.random() * 0.5;
      rnd[i] = Math.random();
    }

    return {
      chaosPositions: chaos,
      fallXZ: fxz,
      fallStartY: fsy,
      speeds: sp,
      randoms: rnd
    };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 }
  }), []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      const target = mode === TreeMode.FORMED ? 1 : 0;
      // smooth progress
      mat.uniforms.uProgress.value = THREE.MathUtils.lerp(mat.uniforms.uProgress.value, target, delta * 1.5);
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aChaosPos"
          count={count}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aFallXZ"
          count={count}
          array={fallXZ}
          itemSize={2}
        />
        <bufferAttribute
          attach="attributes-aFallStartY"
          count={count}
          array={fallStartY}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          count={count}
          array={speeds}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      {/* @ts-ignore */}
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Snowflakes;
