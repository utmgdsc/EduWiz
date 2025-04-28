// File: components/ThreeJSBackground.tsx
'use client'
import { useParticleSystem } from '@/hooks/useParticleSystem';
import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';


interface ThreeJSBackgroundProps {
  mountRef: React.RefObject<HTMLDivElement>;
  isSearchFocused: boolean;
  hoveredElement: string | null;
}

const ThreeJSBackground: React.FC<ThreeJSBackgroundProps> = ({ 
  mountRef, 
  isSearchFocused, 
  hoveredElement 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const normalizedMousePosition = useRef(new THREE.Vector2(0, 0));
  
  // Refs to store scene objects that need to be updated
  const sceneRef = useRef<THREE.Scene | null>(null);
  const textMeshRef = useRef<THREE.Mesh | null>(null);
  const lightsRef = useRef<{
    titleLight: THREE.SpotLight;
    searchLight: THREE.SpotLight;
    accentLight1: THREE.PointLight;
    accentLight2: THREE.PointLight;
  } | null>(null);

  // Setup scene once
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000000'); // Black background
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Mouse position tracking
    const handleMouseMove = (event: MouseEvent) => {
      // Store normalized device coordinates (-1 to +1)
      normalizedMousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      normalizedMousePosition.current.y = - (event.clientY / window.innerHeight) * 2 + 1;
      
      // Update state for React components if needed
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Setup lighting
    const { lights } = setupLighting(scene);
    lightsRef.current = lights;

    // Setup raycaster
    const raycaster = new THREE.Raycaster();


    // Setup particles
    useParticleSystem(scene, camera, normalizedMousePosition.current, raycaster);

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update lighting based on interactions without re-creating the scene
      if (lightsRef.current && textMeshRef.current) {
        updateLighting(lightsRef.current, hoveredElement, isSearchFocused, textMeshRef.current);
      }
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Properly dispose of all resources
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, [mountRef]); // Only run this effect once on mount

  // Update lighting when interaction state changes
  useEffect(() => {
    if (lightsRef.current && textMeshRef.current) {
      updateLighting(lightsRef.current, hoveredElement, isSearchFocused, textMeshRef.current);
    }
  }, [hoveredElement, isSearchFocused]);

  return (
    <div ref={mountRef} className="absolute inset-0 z-0" />
  );
};

// Setup lighting function
const setupLighting = (scene: THREE.Scene) => {
  // Very minimal ambient light - just enough to see outlines
  const ambientLight = new THREE.AmbientLight(0x111111, 0.8);
  scene.add(ambientLight);

  // Create a strong but diffused point light at the top
  const mainLight = new THREE.PointLight(0xffffff, 2, 30);
  mainLight.position.set(0, 10, 5);
  scene.add(mainLight);
  
  // Add a large, soft hemisphere light with contrasting colors
  const hemiLight = new THREE.HemisphereLight(
    0x2c3e50, // Sky color - dark blue
    0x000000, // Ground color - black
    1.2       // Intensity
  );
  scene.add(hemiLight);

  // Add a dramatic purple/blue point light to the right
  const accentLight1 = new THREE.PointLight(0x7b68ee, 1.5, 20);
  accentLight1.position.set(8, -2, 3);
  scene.add(accentLight1);

  // Add a subtle red point light to the left
  const accentLight2 = new THREE.PointLight(0xff6b6b, 1, 15);
  accentLight2.position.set(-8, 0, 4);
  scene.add(accentLight2);

  // Add a light that will illuminate the title specifically
  const titleLight = new THREE.SpotLight(0xffffff, 2, 20, Math.PI / 6, 0.5, 2);
  titleLight.position.set(0, 8, 2);
  titleLight.target.position.set(0, 0, -2); // Point at the title
  scene.add(titleLight);
  scene.add(titleLight.target);

  // Add a search bar light that will be active when the search is focused
  const searchLight = new THREE.SpotLight(0x00aaff, 0, 15, Math.PI / 8, 0.5, 2);
  searchLight.position.set(0, -4, 4);
  searchLight.target.position.set(0, -2, -2);
  scene.add(searchLight);
  scene.add(searchLight.target);

  return {
    lights: {
      titleLight,
      searchLight,
      accentLight1,
      accentLight2
    }
  };
};

// Update lighting based on interactions
const updateLighting = (
  lights: {
    titleLight: THREE.SpotLight;
    searchLight: THREE.SpotLight;
    accentLight1: THREE.PointLight;
    accentLight2: THREE.PointLight;
  },
  hoveredElement: string | null, 
  isSearchFocused: boolean,
  textMesh: THREE.Mesh
) => {
  const { titleLight, searchLight, accentLight1, accentLight2 } = lights;
  
  // Title lighting effect (when hovered)
  if (hoveredElement === 'title') {
    titleLight.intensity = 3;
    titleLight.color.set(0xf5f5f5); // Bright white
    
    // Make accent lights more intense when title is hovered
    accentLight1.intensity = 2.5;
    accentLight1.color.set(0x9370db); // Brighter purple
    accentLight2.intensity = 2;
    accentLight2.color.set(0xff4500); // Brighter orange-red
    
    // Animate title if available
    textMesh.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
    textMesh.position.y = Math.sin(Date.now() * 0.002) * 0.2;
  } else {
    titleLight.intensity = 2;
    titleLight.color.set(0xffffff); // Normal white
    
    // Reset text mesh position if not hovered
    if (hoveredElement !== 'title') {
      textMesh.rotation.y = Math.sin(Date.now() * 0.0003) * 0.05;
      textMesh.position.y = Math.sin(Date.now() * 0.0005) * 0.1;
    }
  }
  
  // Search bar lighting effect
  if (isSearchFocused) {
    searchLight.intensity = 2.5;
    searchLight.color.set(0x00ccff); // Bright blue
    
    // Make accent lights more subtle to focus on search
    accentLight1.intensity = 1;
    accentLight1.position.set(8 + Math.sin(Date.now() * 0.001) * 2, -2, 3);
    
    accentLight2.intensity = 0.8;
    accentLight2.position.set(-8 + Math.sin(Date.now() * 0.001) * -2, 0, 4);
  } else {
    searchLight.intensity = 0;
    
    // Normal accent light behavior when search not focused
    if (hoveredElement !== 'title') {
      accentLight1.intensity = 1.5;
      accentLight1.color.set(0x7b68ee);
      accentLight1.position.set(8, -2, 3);
      
      accentLight2.intensity = 1;
      accentLight2.color.set(0xff6b6b);
      accentLight2.position.set(-8, 0, 4);
    }
  }
};


export default ThreeJSBackground;