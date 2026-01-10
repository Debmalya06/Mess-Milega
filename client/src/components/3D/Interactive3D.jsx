"use client"

import { useRef, Suspense } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"

// ✅ GLB House Model Component
function HouseModel({ url = "/models/house.glb" }) {
  const group = useRef()
  
  try {
    const { scene } = useGLTF(url)
    
    return (
      <primitive 
        ref={group} 
        object={scene.clone()} 
        scale={0.5} 
        position={[0, -1, 0]}
        dispose={null}
      />
    )
  } catch (error) {
    console.warn("Failed to load GLB model:", error)
    return <FallbackHouse />
  }
}

// ✅ Fallback House (in case GLB fails to load)
function FallbackHouse() {
  const group = useRef()

  return (
    <group ref={group} position={[0, -1, 0]}>
      {/* House Base */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.4, 0.8, 4]} />
        <meshStandardMaterial color="#DC143C" />
      </mesh>
      
      {/* Door */}
      <mesh position={[0, 0.1, 1.01]}>
        <boxGeometry args={[0.3, 0.8, 0.02]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Windows */}
      <mesh position={[-0.5, 0.3, 1.01]}>
        <boxGeometry args={[0.3, 0.3, 0.02]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
      
      <mesh position={[0.5, 0.3, 1.01]}>
        <boxGeometry args={[0.3, 0.3, 0.02]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
      
      {/* Chimney */}
      <mesh position={[0.7, 1.8, -0.5]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
    </group>
  )
}

// ✅ Loading placeholder
function LoadingPlaceholder() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#FFA500" wireframe />
    </mesh>
  )
}

// ✅ Controls component that waits for camera to be ready
function Controls() {
  const { camera, gl } = useThree()
  
  return (
    <OrbitControls
      args={[camera, gl.domElement]}
      enableZoom={true}
      enableRotate={true}
      enablePan={true}
      autoRotate={true}
      autoRotateSpeed={0.5}
      minDistance={3}
      maxDistance={15}
      maxPolarAngle={Math.PI / 2}
    />
  )
}

// ✅ 3D Scene with GLB House + Proper Controls
function Scene3D() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#3B82F6" />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      
      {/* House with Suspense for loading */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <HouseModel />
      </Suspense>
      
      {/* Controls with proper camera reference */}
      <Controls />
    </>
  )
}

// ✅ Main Component: 3D House Scene with GLB support
const Interactive3D = ({ className = "" }) => {
  return (
    <div className={className} style={{ width: "100%", height: "100vh", background: "#87CEEB" }}>
      <Canvas 
        camera={{ 
          position: [5, 3, 5], 
          fov: 60,
          near: 0.1,
          far: 1000
        }} 
        style={{ height: "100%", width: "100%" }}
        gl={{ 
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: false 
        }}
        dpr={[1, 2]}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 0, 0)
        }}
      >
        <Scene3D />
      </Canvas>
    </div>
  )
}

// ✅ Preload the GLB model (optional - for better performance)
useGLTF.preload("/models/house.glb")

export default Interactive3D