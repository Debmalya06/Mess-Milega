"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Text,
  Box,
  Sphere,
  Cylinder,
  Plane,
  Html,
  Float,
  Sparkles,
} from "@react-three/drei"
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing"
import * as THREE from "three"

// 3D House Model Component
function HouseModel({ position = [0, 0, 0], scale = 1 }) {
  const houseRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Animate the house
  useFrame((state) => {
    if (houseRef.current) {
      houseRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      houseRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    }
  })

  return (
    <group
      ref={houseRef}
      position={position}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* House Base */}
      <Box args={[4, 3, 4]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color={hovered ? "#4F46E5" : "#E5E7EB"} roughness={0.3} metalness={0.1} />
      </Box>

      {/* Roof */}
      <Cylinder args={[0, 3, 2, 4]} position={[0, 4, 0]} rotation={[0, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#DC2626" roughness={0.8} />
      </Cylinder>

      {/* Door */}
      <Box args={[0.8, 1.8, 0.1]} position={[0, 0.9, 2.05]}>
        <meshStandardMaterial color="#92400E" />
      </Box>

      {/* Windows */}
      <Box args={[0.8, 0.8, 0.1]} position={[-1.2, 2, 2.05]}>
        <meshStandardMaterial color="#3B82F6" transparent opacity={0.7} />
      </Box>
      <Box args={[0.8, 0.8, 0.1]} position={[1.2, 2, 2.05]}>
        <meshStandardMaterial color="#3B82F6" transparent opacity={0.7} />
      </Box>

      {/* Chimney */}
      <Box args={[0.5, 1.5, 0.5]} position={[1.5, 4.75, -1]}>
        <meshStandardMaterial color="#6B7280" />
      </Box>

      {/* Garden Elements */}
      <Cylinder args={[0.3, 0.3, 1]} position={[-3, 0.5, 1]}>
        <meshStandardMaterial color="#16A34A" />
      </Cylinder>
      <Sphere args={[0.4]} position={[-3, 1.2, 1]}>
        <meshStandardMaterial color="#22C55E" />
      </Sphere>

      <Cylinder args={[0.3, 0.3, 1.2]} position={[3, 0.6, -1]}>
        <meshStandardMaterial color="#16A34A" />
      </Cylinder>
      <Sphere args={[0.5]} position={[3, 1.4, -1]}>
        <meshStandardMaterial color="#22C55E" />
      </Sphere>

      {/* Floating Info Bubbles */}
      {hovered && (
        <>
          <Html position={[-2, 3, 3]} center>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-800">Comfortable Rooms</p>
            </div>
          </Html>
          <Html position={[2, 3, 3]} center>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-800">Modern Amenities</p>
            </div>
          </Html>
          <Html position={[0, 5, 0]} center>
            <div className="bg-blue-600/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
              <p className="text-xs font-medium text-white">Your Dream PG</p>
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

// Floating Icons Component
function FloatingIcons() {
  const icons = [
    { position: [-6, 3, 2], color: "#3B82F6", text: "WiFi" },
    { position: [6, 4, -2], color: "#10B981", text: "Security" },
    { position: [-4, 6, -3], color: "#F59E0B", text: "Meals" },
    { position: [5, 2, 4], color: "#EF4444", text: "Parking" },
  ]

  return (
    <>
      {icons.map((icon, index) => (
        <Float key={index} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <group position={icon.position}>
            <Sphere args={[0.3]}>
              <meshStandardMaterial
                color={icon.color}
                emissive={icon.color}
                emissiveIntensity={0.2}
                transparent
                opacity={0.8}
              />
            </Sphere>
            <Html center>
              <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium text-gray-800 shadow-lg">
                {icon.text}
              </div>
            </Html>
          </group>
        </Float>
      ))}
    </>
  )
}

// Ground Component
function Ground() {
  return (
    <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#22C55E" roughness={0.8} metalness={0.1} />
    </Plane>
  )
}

// Animated Camera
function AnimatedCamera() {
  const cameraRef = useRef()

  useFrame((state) => {
    if (cameraRef.current) {
      cameraRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 2
      cameraRef.current.position.y = 8 + Math.sin(state.clock.elapsedTime * 0.3) * 1
      cameraRef.current.lookAt(0, 2, 0)
    }
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[8, 8, 8]} fov={60} />
}

// Main 3D Scene Component
function Scene3D() {
  return (
    <>
      <AnimatedCamera />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
        minDistance={5}
        maxDistance={20}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#3B82F6" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#F59E0B" />

      {/* Environment */}
      <Environment preset="sunset" />

      {/* Scene Objects */}
      <Ground />
      <HouseModel />
      <FloatingIcons />

      {/* Sparkles Effect */}
      <Sparkles count={50} scale={[20, 10, 20]} size={2} speed={0.4} color="#3B82F6" />

      {/* 3D Text */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text
          position={[0, 7, 0]}
          fontSize={1}
          color="#1F2937"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          Find Your Perfect PG
        </Text>
      </Float>

      {/* Post Processing Effects */}
      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.9} />
        <ToneMapping />
      </EffectComposer>
    </>
  )
}

// Main House3D Component
const House3D = ({ className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg ${className}`}
      >
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🏠</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">3D View Unavailable</h3>
          <p className="text-gray-600">Please check your browser compatibility</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg ${className}`}
      >
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading 3D Experience...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden ${className}`}>
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [8, 8, 8], fov: 60 }}
        style={{ height: "100%", width: "100%" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#f0f9ff")
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
      >
        <Scene3D />
      </Canvas>

      {/* Controls Info Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="font-semibold text-gray-900 mb-2">3D Controls</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>🖱️ Drag to rotate</p>
          <p>🔍 Scroll to zoom</p>
          <p>✨ Hover over house for info</p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-gray-900">Interactive Features:</p>
          <p>🏠 3D House Model</p>
          <p>🌟 Floating Amenities</p>
          <p>🎨 Dynamic Lighting</p>
          <p>✨ Particle Effects</p>
        </div>
      </div>
    </div>
  )
}

export default House3D
