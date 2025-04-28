import * as THREE from 'three';
import { FontLoader } from 'three-stdlib';
import { TextGeometry } from 'three-stdlib';

export const setupText = (scene: THREE.Scene): THREE.Mesh | null => {
  let textMesh: THREE.Mesh | null = null;

  // Load font for 3D text
  const fontLoader = new FontLoader();
  fontLoader.load('/fonts/helvetiker_bold.typeface.json', (font) => {
    const textGeometry = new TextGeometry('EduWiz', {
      font: font,
      size: 3.2,
      height: 0.3, // Slightly thicker
      curveSegments: 16, // Higher quality curves
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.07,
      bevelOffset: 0,
    });
    
    textGeometry.computeBoundingBox();
    const centerOffset = -0.5 * (
      (textGeometry.boundingBox?.max.x || 0) - 
      (textGeometry.boundingBox?.min.x || 0)
    );
    
    // DRAMATIC METALLIC TEXT MATERIAL WITH REACTIVE PROPERTIES
    const textMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      metalness: 0.85,
      roughness: 0.12,
      emissive: 0x222222,
      emissiveIntensity: 0.2,
      envMapIntensity: 1.2
    });
    
    const mesh = new THREE.Mesh(textGeometry, textMaterial);
    mesh.position.x = centerOffset;
    mesh.position.y = 0;
    mesh.position.z = -2;
    mesh.rotation.x = 0.1;
    scene.add(mesh);
    
    // Store reference to text mesh for animation
    textMesh = mesh;
  });

  return textMesh;
};

export const useTextGeometry = setupText;
