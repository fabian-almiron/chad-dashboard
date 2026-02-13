'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const vertexShader = `
vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float pnoise(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep);
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

uniform float u_time;
uniform float u_intensity;
uniform float u_speed;

void main() {
  float noise = u_intensity * pnoise(position + u_time * u_speed, vec3(10.));
  vec3 newPosition = position + normal * noise;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`

const fragmentShader = `
uniform vec3 u_color;
uniform float u_opacity;
void main() {
    gl_FragColor = vec4(u_color, u_opacity);
}
`

interface NetworkBlobVisualizationProps {
  networkActivity?: number;
  className?: string;
}

export default function NetworkBlobVisualization({
  networkActivity = 0,
  className = ""
}: NetworkBlobVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const uniformsRef = useRef<{
    u_time: { value: number };
    u_intensity: { value: number };
    u_speed: { value: number };
    u_color: { value: THREE.Color };
    u_opacity: { value: number };
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 10)

    const uniforms = {
      u_time: { value: 0.0 },
      u_intensity: { value: 0.4 },
      u_speed: { value: 0.8 },
      u_color: { value: new THREE.Color(0x00ffaa) },
      u_opacity: { value: 0.85 },
    }
    uniformsRef.current = uniforms

    const mat = new THREE.ShaderMaterial({
      wireframe: true,
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    })

    const geo = new THREE.IcosahedronGeometry(3, 30)
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    const clock = new THREE.Clock()
    function animate() {
      const elapsed = clock.getElapsedTime()
      uniforms.u_time.value = elapsed
      mesh.rotation.y = elapsed * 0.08
      mesh.rotation.x = elapsed * 0.04
      renderer.render(scene, camera)
    }

    renderer.setAnimationLoop(animate)

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      renderer.setAnimationLoop(null)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    if (!uniformsRef.current) return
    const t = networkActivity / 100
    // intensity: calm at low usage, aggressive at high
    uniformsRef.current.u_intensity.value = 0.2 + t * 1.3
    // speed: faster animation with more activity
    uniformsRef.current.u_speed.value = 0.4 + t * 1.6
    // color shift: green -> cyan -> white-hot
    const color = new THREE.Color()
    if (t < 0.5) {
      color.lerpColors(new THREE.Color(0x00ffaa), new THREE.Color(0x00ddff), t * 2)
    } else {
      color.lerpColors(new THREE.Color(0x00ddff), new THREE.Color(0xffffff), (t - 0.5) * 2)
    }
    uniformsRef.current.u_color.value = color
  }, [networkActivity])

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`} />
  )
}
