import * as THREE from 'three';

export const setupLighting = (scene: THREE.Scene) => {
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

  // Function to update lighting based on interactions
  const updateLighting = (
    hoveredElement: string | null, 
    isSearchFocused: boolean,
    textMesh: THREE.Mesh | null
  ) => {
    // Title lighting effect (when hovered or animated)
    if (hoveredElement === 'title') {
      titleLight.intensity = 3;
      titleLight.color.set(0xf5f5f5); // Bright white
      
      // Make accent lights more intense when title is hovered
      accentLight1.intensity = 2.5;
      accentLight1.color.set(0x9370db); // Brighter purple
      accentLight2.intensity = 2;
      accentLight2.color.set(0xff4500); // Brighter orange-red
      
      // Animate title if available
      if (textMesh) {
        textMesh.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
        textMesh.position.y = Math.sin(Date.now() * 0.002) * 0.2;
      }
    } else {
      titleLight.intensity = 2;
      titleLight.color.set(0xffffff); // Normal white
      
      // Reset text mesh position if not hovered
      if (textMesh && hoveredElement !== 'title') {
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

  return {
    ambientLight,
    mainLight,
    hemiLight,
    accentLight1,
    accentLight2,
    titleLight,
    searchLight,
    updateLighting
  };
};

export const useLighting = setupLighting;
