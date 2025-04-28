import * as THREE from 'three';


// Canvas texture generator for math equations
const generateMathTexture = (equation: string, size = 256) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  // Clear canvas with transparency
  ctx.clearRect(0, 0, size, size);
  
  // Set text properties
  ctx.fillStyle = 'white';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw text in the center
  ctx.fillText(equation, size / 2, size / 2);
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.premultiplyAlpha = true;
  return texture;
};

export const setupParticles = (
  scene: THREE.Scene, 
  camera: THREE.Camera,
  normalizedMousePosition: THREE.Vector2,
  raycaster: THREE.Raycaster
) => {
  // Math equations to use as particles
  const mathEquations = [
    'E=mc²',
    'F=ma',
    'e^iπ+1=0',
    'a²+b²=c²',
    'PV=nRT'
  ];
  
  // Create textures from math equations
  const mathTextures: THREE.Texture[] = [];
  mathEquations.forEach(equation => {
    const texture = generateMathTexture(equation);
    if (texture) mathTextures.push(texture);
  });

  // Load SVG textures for shape particles
  const textureLoader = new THREE.TextureLoader();
  const svgFiles = [
    '/icons/circle.svg',
    '/icons/plane.svg',
    '/icons/right_arrow.svg',
    '/icons/scribble.svg',
    '/icons/square.svg',
    '/icons/triangle.svg'
  ];
  
  const shapeTextures: THREE.Texture[] = [];
  const loadShapeTextures = async () => {
    for (const svgPath of svgFiles) {
      try {
        const texture = await textureLoader.loadAsync(svgPath);
        texture.premultiplyAlpha = true;
        shapeTextures.push(texture);
      } catch (error) {
        console.error(`Failed to load texture: ${svgPath}`, error);
      }
    }
    createParticleSystem();
  };

  // Create particle system
  const createParticleSystem = () => {
    // Number of particles for each type
    const shapesPerType = 8;
    const mathsPerType = 6;
    const particleGroups: THREE.Points[] = [];
    
    // Create particle groups for shape textures
    const selectedShapeTextures = [
      shapeTextures[0], // circle
      shapeTextures[4], // square
      shapeTextures[5]  // triangle
    ];
    
    // Process shape particles
    selectedShapeTextures.forEach((texture) => {
      const particleGroup = createParticleGroup(
        scene, texture, shapesPerType, 'shape'
      );
      particleGroups.push(particleGroup);
    });
    
    // Process math equation particles
    mathTextures.forEach((texture) => {
      const particleGroup = createParticleGroup(
        scene, texture, mathsPerType, 'math'
      );
      particleGroups.push(particleGroup);
    });
    
    // Animation function for particles
    const animateParticles = () => {
      // Update raycaster with mouse position
      raycaster.setFromCamera(normalizedMousePosition, camera);
      
      // Create a plane at z=-15 (middle of our particles)
      const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 15);
      
      // Get mouse position in 3D space
      const mouse3D = new THREE.Vector3();
      raycaster.ray.intersectPlane(mousePlane, mouse3D);
      
      updateParticles(particleGroups, camera, normalizedMousePosition);
      
      requestAnimationFrame(animateParticles);
    };
    
    // Start animation
    animateParticles();
  };
  
  // Start loading SVG textures
  loadShapeTextures();
};

// Create a particle group with the specified texture and parameters
const createParticleGroup = (
  scene: THREE.Scene,
  texture: THREE.Texture,
  particleCount: number,
  type: 'shape' | 'math'
) => {
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);
  const particleOpacities = new Float32Array(particleCount);
  const particleRotations = new Float32Array(particleCount);
  
  // Size multiplier for math equations to make them slightly bigger
  const sizeMultiplier = type === 'math' ? 1.2 : 1.0;
  
  for (let i = 0; i < particleCount; i++) {
    // WIDE DISTRIBUTION - particles spread far out
    particlePositions[i * 3] = (Math.random() - 0.5) * 30;     // X: -15 to 15
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 24; // Y: -12 to 12
    particlePositions[i * 3 + 2] = Math.random() * 20 - 25;    // Z: -25 to -5
    
    // FIXED SIZE - no pulsing
    particleSizes[i] = (Math.random() * 1.5 + 1.8) * sizeMultiplier;
    
    // Start with zero opacity - will be controlled by mouse distance
    particleOpacities[i] = 0;
    
    // Random rotation
    particleRotations[i] = Math.random() * Math.PI * 2;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
  particleGeometry.setAttribute('opacity', new THREE.BufferAttribute(particleOpacities, 1));
  particleGeometry.setAttribute('rotation', new THREE.BufferAttribute(particleRotations, 1));
  
  // Create custom properties for animation
  const targetPositions = Array.from({ length: particleCount }, () => {
    return new THREE.Vector3(
      (Math.random() - 0.5) * 30, // Wider X range
      (Math.random() - 0.5) * 24, // Wider Y range
      Math.random() * 20 - 25     // Deeper Z range
    );
  });
  
  const speeds = Array.from({ length: particleCount }, () => Math.random() * 0.0002 + 0.00005);
  
  // Create material
  const particleMaterial = createParticleMaterial(texture);

  // Create points object
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  
  // Store animation data
  (particles as any).targetPositions = targetPositions;
  (particles as any).speeds = speeds;
  (particles as any).initialPositions = Array.from({ length: particleCount }, (_, i) => {
    return new THREE.Vector3(
      particlePositions[i * 3],
      particlePositions[i * 3 + 1],
      particlePositions[i * 3 + 2]
    );
  });
  (particles as any).animationProgress = Array(particleCount).fill(0);
  
  return particles;
};

// Create shader material for particles
const createParticleMaterial = (texture: THREE.Texture) => {
  // White color for all particles
  const colorTint = new THREE.Color(0xffffff);

  return new THREE.ShaderMaterial({
    uniforms: {
      diffuseTexture: { value: texture },
      colorTint: { value: colorTint }
    },
    vertexShader: `
      attribute float size;
      attribute float opacity;
      attribute float rotation;
      varying float vOpacity;
      varying float vRotation;
      void main() {
        vOpacity = opacity;
        vRotation = rotation;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (350.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D diffuseTexture;
      uniform vec3 colorTint;
      varying float vOpacity;
      varying float vRotation;
      void main() {
        float mid = 0.5;
        vec2 rotated = vec2(
          cos(vRotation) * (gl_PointCoord.x - mid) + sin(vRotation) * (gl_PointCoord.y - mid) + mid,
          cos(vRotation) * (gl_PointCoord.y - mid) - sin(vRotation) * (gl_PointCoord.x - mid) + mid
        );
        vec4 texColor = texture2D(diffuseTexture, rotated);
        gl_FragColor = vec4(colorTint, vOpacity) * texColor;
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
};

// Update particles each frame
const updateParticles = (
  particleGroups: THREE.Points[],
  camera: THREE.Camera,
  normalizedMousePosition: THREE.Vector2
) => {
  particleGroups.forEach((particleGroup) => {
    const geometry = particleGroup.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const rotations = geometry.attributes.rotation.array as Float32Array;
    const opacities = geometry.attributes.opacity.array as Float32Array;
    
    const targetPositions = (particleGroup as any).targetPositions;
    const initialPositions = (particleGroup as any).initialPositions;
    const speeds = (particleGroup as any).speeds;
    const progress = (particleGroup as any).animationProgress;
    
    for (let i = 0; i < positions.length / 3; i++) {
      // Extremely slow, smooth movement using lerp
      progress[i] += speeds[i];
      
      // When we reach or exceed 1, we need a new target
      if (progress[i] >= 1.0) {
        // Save current position as new initial
        initialPositions[i].set(
          positions[i * 3],
          positions[i * 3 + 1],
          positions[i * 3 + 2]
        );
        
        // Create new target with wider distribution
        targetPositions[i].set(
          (Math.random() - 0.5) * 30, // Wider X range
          (Math.random() - 0.5) * 24, // Wider Y range
          Math.random() * 20 - 25     // Deeper Z range
        );
        
        // Reset progress
        progress[i] = 0;
      }
      
      // Linear interpolation between initial and target positions
      positions[i * 3] = initialPositions[i].x + (targetPositions[i].x - initialPositions[i].x) * progress[i];
      positions[i * 3 + 1] = initialPositions[i].y + (targetPositions[i].y - initialPositions[i].y) * progress[i];
      positions[i * 3 + 2] = initialPositions[i].z + (targetPositions[i].z - initialPositions[i].z) * progress[i];
      
      // Slow constant rotation without pulsing
      rotations[i] += 0.0003;
      
      // Calculate distance from mouse to this particle
      const particlePos = new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      
      // Project particle into screen space for accurate distance calculation
      const particleScreenPos = particlePos.clone();
      particleScreenPos.project(camera);
      
      // Calculate distance from mouse in normalized coordinates
      const distance = Math.sqrt(
        Math.pow(particleScreenPos.x - normalizedMousePosition.x, 2) + 
        Math.pow(particleScreenPos.y - normalizedMousePosition.y, 2)
      );
      
      // Set opacity based on distance (closer = more visible)
      const spotlightRadius = 0.7;
      opacities[i] = Math.max(0, 0.8 * (1 - Math.min(1, distance / spotlightRadius)));
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.rotation.needsUpdate = true;
    geometry.attributes.opacity.needsUpdate = true;
  });
};

export const useParticleSystem = setupParticles;
