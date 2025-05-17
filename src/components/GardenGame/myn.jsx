import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

const SEEDS = [
  { name: 'Carrot Seed', price: 5, color: 0xffa500, growthTime: 10 },
  { name: 'Tomato Seed', price: 8, color: 0xff6347, growthTime: 15, reproduces: true },
  { name: 'Corn Seed', price: 10, color: 0xffe135, growthTime: 20, reproduces: true },
  { name: 'Ant Plant Seed', price: 15, color: 0x8B4513, growthTime: 25, reproduces: true },
];

const SHOPS = [
  { x: -80, z: -80, type: 'buy', label: 'Buy Shop' },
  { x: 80, z: 80, type: 'eggs', label: 'Eggs Shop' },
  { x: 80, z: -80, type: 'gear', label: 'Gear Shop' },
  { x: -80, z: 80, type: 'sell', label: 'Sell Shop' },
];

const EGGS = [
  { name: 'Blue Egg', price: 15, color: 0x4fc3f7 },
  { name: 'Golden Egg', price: 30, color: 0xffd700 },
];
const GEAR = [
  { name: 'Shovel', price: 20, color: 0x8d6e63 },
  { name: 'Watering Can', price: 12, color: 0x90caf9 },
];
const BONUS = [
  { name: 'Golden Shovel', price: 50, color: 0xffd700 },
  { name: 'Diamond Watering Can', price: 75, color: 0x4fc3f7 },
];

const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';

function getUserId() {
  // Use localStorage userId or random fallback
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
  }
  return userId;
}

function MyN() {
  const mountRef = useRef(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [plants, setPlants] = useState({});
  const [inventory, setInventory] = useState([
    { name: 'Carrot Seed', color: 0xffa500 },
    { name: 'Tomato Seed', color: 0xff6347 }
  ]);
  const [showInventory, setShowInventory] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showEggs, setShowEggs] = useState(false);
  const [showGear, setShowGear] = useState(false);
  const [showBonus, setShowBonus] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [coins, setCoins] = useState(20);
  const [prompt, setPrompt] = useState('');
  const [plantingSeed, setPlantingSeed] = useState(null);
  const characterRef = useRef(null);
  const cameraRef = useRef(null);
  const plantingBlocksRef = useRef([]);
  const blockPositions = useRef([]);
  const [selectedInventoryIndex, setSelectedInventoryIndex] = useState(0);
  const positionRef = useRef({ x: 0, y: 0, z: 0 });
  const rotationRef = useRef(0);

  // Add movement state variables
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const moveSpeed = 0.18;
  const rotateSpeed = 0.03;
  const damping = 0.85;
  const isMoving = useRef(false);
  const isRotating = useRef(false);
  const rotationVelocity = useRef(0);
  const rotationDamping = 0.9;

  // Add plant growth states
  const [plantGrowth, setPlantGrowth] = useState({});
  const [plantReproduction, setPlantReproduction] = useState({});

  const tomatoModelUrl = '/models/scene.gltf';
  const carrotModelUrl = '/models/crrot/carrot.zip';
  const tomatoModelRef = useRef();
  const carrotModelRef = useRef();
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const loadersRef = useRef([]);

  // Create a loading manager with better error handling
  const loadingManager = new THREE.LoadingManager();
  loadingManager.onError = (url) => {
    console.warn('Error loading:', url);
    return null;
  };

  // Add this function to handle texture loading
  function createFallbackTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const context = canvas.getContext('2d');
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.fillRect(0, 0, 2, 2);
    return new THREE.CanvasTexture(canvas);
  }

  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    sceneRef.current = scene;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create character
    const character = new THREE.Group();
    const bodyGeometry = new THREE.BoxGeometry(2, 3, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    character.add(body);

    const headGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 3.5;
    head.castShadow = true;
    character.add(head);

    // Set initial position from ref
    character.position.set(positionRef.current.x, positionRef.current.y, positionRef.current.z);
    character.rotation.y = rotationRef.current;
    scene.add(character);
    characterRef.current = character;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Movement bounds
    const bounds = {
      minX: -100,
      maxX: 100,
      minZ: -100,
      maxZ: 100
    };

    function handleKeyDown(event) {
      const key = event.key.toLowerCase();
      keys.current[key] = true;
      
      if (key === 'i') setShowInventory(v => !v);
      if (key === 'e') {
        console.log('E pressed, current prompt:', prompt);
        
        // Handle shop interactions
        if (prompt === 'buy') { 
          closeAllShops(); 
          setShowShop(true); 
          console.log('Opening Buy Shop'); 
        }
        if (prompt === 'sell') { 
          closeAllShops(); 
          setShowShop(true); 
          console.log('Opening Sell Shop'); 
        }
        if (prompt === 'eggs') { 
          closeAllShops(); 
          setShowEggs(true); 
          console.log('Opening Eggs Shop'); 
        }
        if (prompt === 'gear') { 
          closeAllShops(); 
          setShowGear(true); 
          console.log('Opening Gear Shop'); 
        }
        if (prompt === 'inventory') setShowInventory(v => !v);
        if (prompt === 'bank') setShowBank(v => !v);
      }
    }

    function handleKeyUp(event) {
      const key = event.key.toLowerCase();
      keys.current[key] = false;
      
      // Reset velocity when movement keys are released
      if (key === 'w' || key === 's') {
        velocity.current.x = 0;
        velocity.current.z = 0;
        isMoving.current = false;
      }
      if (key === 'a' || key === 'd') {
        isRotating.current = false;
        rotationVelocity.current = 0;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Create main platform
    const platformGeometry = new THREE.BoxGeometry(200, 10, 200);
    const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x7cfc7c });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(0, -5, 0);
    scene.add(platform);

    // Create shops
    SHOPS.forEach(({ x, z, type, label }) => {
      const baseGeometry = new THREE.BoxGeometry(15, 1, 15);
      let tentColor = 0xff0000;
      if (type === 'eggs') tentColor = 0xffeb3b;
      if (type === 'gear') tentColor = 0x00c853;
      if (type === 'buy') tentColor = 0x2196f3;
      const baseMaterial = new THREE.MeshBasicMaterial({ color: tentColor });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(x, 0, z);
      scene.add(base);

      const tentGeometry = new THREE.ConeGeometry(10, 15, 4);
      const tentMaterial = new THREE.MeshBasicMaterial({ color: tentColor });
      const tent = new THREE.Mesh(tentGeometry, tentMaterial);
      tent.position.set(x, 8, z);
      tent.rotation.y = Math.PI / 4;
      scene.add(tent);
    });

    // Create planting blocks
    const plantingBlocks = [];
    const blockSize = 20;
    const spacing = 30;
    const startX = -spacing;
    const startZ = -spacing;
    blockPositions.current = [];
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const blockGeometry = new THREE.BoxGeometry(blockSize, 5, blockSize);
        const blockMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const block = new THREE.Mesh(blockGeometry, blockMaterial);
        const position = {
          x: startX + (i * spacing),
          z: startZ + (j * spacing)
        };
        block.position.set(position.x, 0, position.z);
        block.userData = { position: `${position.x},${position.z}`, isPlot: true };
        scene.add(block);
        plantingBlocks.push(block);
        blockPositions.current.push({ x: position.x, z: position.z });
      }
    }
    plantingBlocksRef.current = plantingBlocks;

    // Raycaster for clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      if (!mountRef.current) return;

      const rect = mountRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(x, y);
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(scene.children, true);
      
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        // Check if we clicked on a plot
        if (clickedObject.userData.isPlot) {
          const plotPosition = clickedObject.position;
          
          // Load tomato model if not already loaded
          if (!tomatoModelRef.current) {
            console.log('Attempting to load tomato model from:', tomatoModelUrl);
            const loader = new GLTFLoader(loadingManager);
            loadersRef.current.push(loader);
            
            // Create fallback materials with textures
            const fallbackMaterials = {
              batang: new THREE.MeshStandardMaterial({ 
                color: 0x4CAF50,  // Green for stem
                roughness: 0.7,
                metalness: 0.2,
                normalScale: new THREE.Vector2(0, 0)
              }),
              daun: new THREE.MeshStandardMaterial({ 
                color: 0x81C784,  // Light green for leaves
                roughness: 0.6,
                metalness: 0.1,
                normalScale: new THREE.Vector2(0, 0)
              }),
              kembang: new THREE.MeshStandardMaterial({ 
                color: 0xFFEB3B,  // Yellow for flowers
                roughness: 0.5,
                metalness: 0.1,
                normalScale: new THREE.Vector2(0, 0)
              }),
              buah: new THREE.MeshStandardMaterial({ 
                color: 0xF44336,  // Red for tomatoes
                roughness: 0.4,
                metalness: 0.2,
                normalScale: new THREE.Vector2(0, 0)
              }),
              akar: new THREE.MeshStandardMaterial({ 
                color: 0x795548,  // Brown for roots
                roughness: 0.8,
                metalness: 0.1,
                normalScale: new THREE.Vector2(0, 0)
              }),
              tanah: new THREE.MeshStandardMaterial({ 
                color: 0x8D6E63,  // Dark brown for soil
                roughness: 0.9,
                metalness: 0.0,
                normalScale: new THREE.Vector2(0, 0)
              })
            };
            
            // Pre-process the model before loading
            loader.setResourcePath('/models/');
            loader.setCrossOrigin('anonymous');
            
            loader.load(
              tomatoModelUrl,
              (gltf) => {
                console.log('Tomato model loaded successfully');
                const model = gltf.scene;
                
                // Handle materials before traversing
                model.traverse((child) => {
                  if (child.isMesh && child.material) {
                    // Store original material properties
                    const originalColor = child.material.color;
                    const originalRoughness = child.material.roughness;
                    const originalMetalness = child.material.metalness;
                    
                    // Determine which part of the plant this mesh represents
                    const meshName = child.name.toLowerCase();
                    let fallbackMaterial = null;
                    
                    if (meshName.includes('batang')) {
                      fallbackMaterial = fallbackMaterials.batang.clone();
                    } else if (meshName.includes('daun')) {
                      fallbackMaterial = fallbackMaterials.daun.clone();
                    } else if (meshName.includes('kembang')) {
                      fallbackMaterial = fallbackMaterials.kembang.clone();
                    } else if (meshName.includes('buah')) {
                      fallbackMaterial = fallbackMaterials.buah.clone();
                    } else if (meshName.includes('akar')) {
                      fallbackMaterial = fallbackMaterials.akar.clone();
                    } else if (meshName.includes('tanah')) {
                      fallbackMaterial = fallbackMaterials.tanah.clone();
                    }
                    
                    // If we found a matching fallback material, use it
                    if (fallbackMaterial) {
                      // Preserve original material properties if they exist
                      if (originalColor) fallbackMaterial.color.copy(originalColor);
                      if (originalRoughness !== undefined) fallbackMaterial.roughness = originalRoughness;
                      if (originalMetalness !== undefined) fallbackMaterial.metalness = originalMetalness;
                      
                      // Explicitly disable normal mapping
                      fallbackMaterial.normalScale.set(0, 0);
                      fallbackMaterial.normalMap = null;
                      fallbackMaterial.normalMapType = null;
                      
                      // Ensure the material is properly configured
                      fallbackMaterial.needsUpdate = true;
                      
                      child.material = fallbackMaterial;
                    } else {
                      // Default fallback for any other parts
                      const defaultMaterial = new THREE.MeshStandardMaterial({
                        color: originalColor || 0x808080,
                        roughness: originalRoughness || 0.7,
                        metalness: originalMetalness || 0.2,
                        normalScale: new THREE.Vector2(0, 0),
                        normalMap: null,
                        normalMapType: null
                      });
                      
                      defaultMaterial.needsUpdate = true;
                      child.material = defaultMaterial;
                    }

                    // Ensure shadows are enabled
                    child.castShadow = true;
                    child.receiveShadow = true;
                  }
                });
                
                tomatoModelRef.current = model;
              },
              (xhr) => {
                console.log('Loading progress:', (xhr.loaded / xhr.total * 100) + '% loaded');
              },
              (error) => {
                console.error('Error loading model:', error);
                // Create a simple fallback model if loading fails
                const fallbackModel = new THREE.Group();
                
                // Create a simple stem
                const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
                const stemMaterial = new THREE.MeshStandardMaterial({ 
                  color: 0x4CAF50,
                  roughness: 0.7,
                  metalness: 0.2,
                  normalScale: new THREE.Vector2(0, 0),
                  normalMap: null,
                  normalMapType: null
                });
                const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                stem.position.y = 1;
                stem.castShadow = true;
                fallbackModel.add(stem);
                
                // Create simple leaves
                const leafGeometry = new THREE.ConeGeometry(0.3, 1, 8);
                const leafMaterial = new THREE.MeshStandardMaterial({ 
                  color: 0x81C784,
                  roughness: 0.6,
                  metalness: 0.1,
                  normalScale: new THREE.Vector2(0, 0),
                  normalMap: null,
                  normalMapType: null
                });
                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                leaf.position.y = 1.5;
                leaf.castShadow = true;
                fallbackModel.add(leaf);
                
                // Create simple tomato
                const tomatoGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                const tomatoMaterial = new THREE.MeshStandardMaterial({ 
                  color: 0xF44336,
                  roughness: 0.4,
                  metalness: 0.2,
                  normalScale: new THREE.Vector2(0, 0),
                  normalMap: null,
                  normalMapType: null
                });
                const tomato = new THREE.Mesh(tomatoGeometry, tomatoMaterial);
                tomato.position.y = 2;
                tomato.castShadow = true;
                fallbackModel.add(tomato);
                
                tomatoModelRef.current = fallbackModel;
              }
            );
          } else {
            // Move existing tomato model to new plot
            tomatoModelRef.current.position.copy(plotPosition);
            tomatoModelRef.current.position.y += 2.5; // Increased height
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // Animation
    function animate() {
      if (!characterRef.current || !cameraRef.current) return;

      // Movement
      if (keys.current['w']) {
        velocity.current.z = -moveSpeed;
        isMoving.current = true;
      }
      if (keys.current['s']) {
        velocity.current.z = moveSpeed;
        isMoving.current = true;
      }
      if (keys.current['a']) {
        rotationVelocity.current = rotateSpeed;
        isRotating.current = true;
      }
      if (keys.current['d']) {
        rotationVelocity.current = -rotateSpeed;
        isRotating.current = true;
      }

      // Apply movement
      if (isMoving.current) {
        characterRef.current.position.x += velocity.current.x;
        characterRef.current.position.z += velocity.current.z;
        velocity.current.multiplyScalar(damping);
      }

      // Apply rotation
      if (isRotating.current) {
        characterRef.current.rotation.y += rotationVelocity.current;
        rotationVelocity.current *= rotationDamping;
      }

      // Update camera position
      const cameraOffset = new THREE.Vector3(0, 5, 10);
      cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), characterRef.current.rotation.y);
      cameraRef.current.position.copy(characterRef.current.position).add(cameraOffset);
      cameraRef.current.lookAt(characterRef.current.position);

      requestAnimationFrame(animate);
    }
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Add plant growth timer
    const growthInterval = setInterval(() => {
      setPlantGrowth(prev => {
        const newGrowth = { ...prev };
        Object.entries(plants).forEach(([pos, plantType]) => {
          if (!newGrowth[pos]) {
            newGrowth[pos] = 0;
          }
          newGrowth[pos] += 1;
          
          // Check for reproduction
          const seed = SEEDS.find(s => s.name === plantType);
          if (seed?.reproduces && newGrowth[pos] >= seed.growthTime * 2) {
            setPlantReproduction(prev => {
              const newRep = { ...prev };
              if (!newRep[pos]) {
                newRep[pos] = true;
                // Add new seed to inventory
                setInventory(inv => [...inv, { name: plantType, color: seed.color }]);
              }
              return newRep;
            });
          }
        });
        return newGrowth;
      });
    }, 1000);

    // Cleanup function
    return () => {
      // Remove event listeners
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.domElement.removeEventListener('click', onMouseClick);
      
      // Dispose of all geometries and materials
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      // Dispose of renderer
      renderer.dispose();
      
      // Remove the canvas
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }

      // Clear the scene
      scene.clear();
      
      // Clear intervals
      clearInterval(growthInterval);

      // Clear model refs
      tomatoModelRef.current = null;
      carrotModelRef.current = null;

      // Cleanup loaders
      loadersRef.current = [];
    };
  }, []); // Empty dependency array to ensure effect only runs once

  // Separate effect for model loading
  useEffect(() => {
    if (!sceneRef.current) return;

    // Load the models once
    if (!tomatoModelRef.current) {
      console.log('Attempting to load tomato model from:', tomatoModelUrl);
      const loader = new GLTFLoader(loadingManager);
      loadersRef.current.push(loader);
      
      // Create fallback materials with textures
      const fallbackMaterials = {
        batang: new THREE.MeshStandardMaterial({ 
          color: 0x4CAF50,  // Green for stem
          roughness: 0.7,
          metalness: 0.2,
          normalScale: new THREE.Vector2(0, 0)
        }),
        daun: new THREE.MeshStandardMaterial({ 
          color: 0x81C784,  // Light green for leaves
          roughness: 0.6,
          metalness: 0.1,
          normalScale: new THREE.Vector2(0, 0)
        }),
        kembang: new THREE.MeshStandardMaterial({ 
          color: 0xFFEB3B,  // Yellow for flowers
          roughness: 0.5,
          metalness: 0.1,
          normalScale: new THREE.Vector2(0, 0)
        }),
        buah: new THREE.MeshStandardMaterial({ 
          color: 0xF44336,  // Red for tomatoes
          roughness: 0.4,
          metalness: 0.2,
          normalScale: new THREE.Vector2(0, 0)
        }),
        akar: new THREE.MeshStandardMaterial({ 
          color: 0x795548,  // Brown for roots
          roughness: 0.8,
          metalness: 0.1,
          normalScale: new THREE.Vector2(0, 0)
        }),
        tanah: new THREE.MeshStandardMaterial({ 
          color: 0x8D6E63,  // Dark brown for soil
          roughness: 0.9,
          metalness: 0.0,
          normalScale: new THREE.Vector2(0, 0)
        })
      };

      // Pre-process the model before loading
      loader.setResourcePath('/models/');
      loader.setCrossOrigin('anonymous');
      
      loader.load(
        tomatoModelUrl,
        (gltf) => {
          console.log('Tomato model loaded successfully');
          const model = gltf.scene;
          
          // Handle materials before traversing
          model.traverse((child) => {
            if (child.isMesh && child.material) {
              // Store original material properties
              const originalColor = child.material.color;
              const originalRoughness = child.material.roughness;
              const originalMetalness = child.material.metalness;
              
              // Determine which part of the plant this mesh represents
              const meshName = child.name.toLowerCase();
              let fallbackMaterial = null;
              
              if (meshName.includes('batang')) {
                fallbackMaterial = fallbackMaterials.batang.clone();
              } else if (meshName.includes('daun')) {
                fallbackMaterial = fallbackMaterials.daun.clone();
              } else if (meshName.includes('kembang')) {
                fallbackMaterial = fallbackMaterials.kembang.clone();
              } else if (meshName.includes('buah')) {
                fallbackMaterial = fallbackMaterials.buah.clone();
              } else if (meshName.includes('akar')) {
                fallbackMaterial = fallbackMaterials.akar.clone();
              } else if (meshName.includes('tanah')) {
                fallbackMaterial = fallbackMaterials.tanah.clone();
              }
              
              // If we found a matching fallback material, use it
              if (fallbackMaterial) {
                // Preserve original material properties if they exist
                if (originalColor) fallbackMaterial.color.copy(originalColor);
                if (originalRoughness !== undefined) fallbackMaterial.roughness = originalRoughness;
                if (originalMetalness !== undefined) fallbackMaterial.metalness = originalMetalness;
                
                // Explicitly disable normal mapping
                fallbackMaterial.normalScale.set(0, 0);
                fallbackMaterial.normalMap = null;
                fallbackMaterial.normalMapType = null;
                
                // Ensure the material is properly configured
                fallbackMaterial.needsUpdate = true;
                
                child.material = fallbackMaterial;
              } else {
                // Default fallback for any other parts
                const defaultMaterial = new THREE.MeshStandardMaterial({
                  color: originalColor || 0x808080,
                  roughness: originalRoughness || 0.7,
                  metalness: originalMetalness || 0.2,
                  normalScale: new THREE.Vector2(0, 0),
                  normalMap: null,
                  normalMapType: null
                });
                
                defaultMaterial.needsUpdate = true;
                child.material = defaultMaterial;
              }

              // Ensure shadows are enabled
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          tomatoModelRef.current = model;
        },
        (xhr) => {
          console.log('Loading progress:', (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('Error loading model:', error);
          // Create a simple fallback model if loading fails
          const fallbackModel = new THREE.Group();
          
          // Create a simple stem
          const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
          const stemMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4CAF50,
            roughness: 0.7,
            metalness: 0.2,
            normalScale: new THREE.Vector2(0, 0),
            normalMap: null,
            normalMapType: null
          });
          const stem = new THREE.Mesh(stemGeometry, stemMaterial);
          stem.position.y = 1;
          stem.castShadow = true;
          fallbackModel.add(stem);
          
          // Create simple leaves
          const leafGeometry = new THREE.ConeGeometry(0.3, 1, 8);
          const leafMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x81C784,
            roughness: 0.6,
            metalness: 0.1,
            normalScale: new THREE.Vector2(0, 0),
            normalMap: null,
            normalMapType: null
          });
          const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
          leaf.position.y = 1.5;
          leaf.castShadow = true;
          fallbackModel.add(leaf);
          
          // Create simple tomato
          const tomatoGeometry = new THREE.SphereGeometry(0.3, 16, 16);
          const tomatoMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xF44336,
            roughness: 0.4,
            metalness: 0.2,
            normalScale: new THREE.Vector2(0, 0),
            normalMap: null,
            normalMapType: null
          });
          const tomato = new THREE.Mesh(tomatoGeometry, tomatoMaterial);
          tomato.position.y = 2;
          tomato.castShadow = true;
          fallbackModel.add(tomato);
          
          tomatoModelRef.current = fallbackModel;
        }
      );
    }

    // For now, let's use a simple carrot geometry instead of the model
    if (!carrotModelRef.current) {
      console.log('Creating simple carrot geometry');
      const carrotGroup = new THREE.Group();
      
      // Create carrot body
      const carrotGeometry = new THREE.ConeGeometry(0.5, 2, 8);
      const carrotMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
      const carrotBody = new THREE.Mesh(carrotGeometry, carrotMaterial);
      carrotBody.rotation.x = Math.PI;
      carrotBody.position.y = 1;
      carrotGroup.add(carrotBody);

      // Create carrot top
      const topGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
      const topMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
      const carrotTop = new THREE.Mesh(topGeometry, topMaterial);
      carrotTop.position.y = 2;
      carrotGroup.add(carrotTop);

      carrotModelRef.current = carrotGroup;
    }

    return () => {
      // Cleanup loaders
      loadersRef.current = [];
    };
  }, [sceneRef.current]); // Only run when scene is created

  // Shop buy handler
  function handleBuy(seed) {
    if (coins >= seed.price) {
      setCoins(c => c - seed.price);
      setInventory(inv => [...inv, { name: seed.name, color: seed.color }]);
    }
  }

  // Planting handler
  useEffect(() => {
    if (plantingSeed && selectedBlock) {
      if (!plants[selectedBlock]) {
        setPlants(pl => ({ ...pl, [selectedBlock]: plantingSeed }));
        setPlantGrowth(pl => ({ ...pl, [selectedBlock]: 0 }));
        setInventory(inv => {
          const idx = inv.findIndex(i => i.name === plantingSeed);
          if (idx !== -1) {
            const newInv = [...inv];
            newInv.splice(idx, 1);
            return newInv;
          }
          return inv;
        });
      }
      setPlantingSeed(null);
    }
  }, [plantingSeed, selectedBlock]);

  // Add this function to handle inventory item selection
  function selectInventoryItem(index) {
    setSelectedInventoryIndex(index);
    // Move the selected item to the front of the inventory
    setInventory(inv => {
      const newInv = [...inv];
      const [selected] = newInv.splice(index, 1);
      return [selected, ...newInv];
    });
  }

  // Add this function to create plant meshes
  function createPlantMesh(plantType, growthStage) {
    const group = new THREE.Group();

    try {
      if (plantType.includes('Tomato') && tomatoModelRef.current) {
        console.log('Creating tomato plant');
        const tomato = tomatoModelRef.current.clone();
        tomato.scale.set(2, 2, 2);
        group.add(tomato);
        return group;
      } else if (plantType.includes('Carrot') && carrotModelRef.current) {
        console.log('Creating carrot plant');
        const carrot = carrotModelRef.current.clone();
        carrot.scale.set(2, 2, 2);
        group.add(carrot);
        return group;
      }
    } catch (error) {
      console.error('Error creating plant mesh:', error);
    }

    // Fallback to basic geometry if model loading failed
    if (plantType.includes('Carrot')) {
      const stem = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
      const stemMesh = new THREE.Mesh(stem, new THREE.MeshBasicMaterial({ color: 0x228B22 }));
      stemMesh.position.y = 1;
      group.add(stemMesh);

      const leaves = new THREE.ConeGeometry(0.5, 1, 8);
      const leavesMesh = new THREE.Mesh(leaves, new THREE.MeshBasicMaterial({ color: 0x228B22 }));
      leavesMesh.position.y = 2;
      group.add(leavesMesh);

      if (growthStage === 'mature') {
        const carrot = new THREE.ConeGeometry(0.3, 1, 8);
        const carrotMesh = new THREE.Mesh(carrot, new THREE.MeshBasicMaterial({ color: 0xffa500 }));
        carrotMesh.position.y = 0.5;
        carrotMesh.rotation.x = Math.PI;
        group.add(carrotMesh);
      }
    } else if (plantType.includes('Corn')) {
      // Corn plant
      const stem = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
      const stemMesh = new THREE.Mesh(stem, new THREE.MeshBasicMaterial({ color: 0x228B22 }));
      stemMesh.position.y = 1.5;
      group.add(stemMesh);

      const leaves = new THREE.BoxGeometry(0.5, 2, 0.1);
      const leavesMesh = new THREE.Mesh(leaves, new THREE.MeshBasicMaterial({ color: 0x228B22 }));
      leavesMesh.position.y = 1.5;
      leavesMesh.rotation.z = Math.PI / 4;
      group.add(leavesMesh);

      if (growthStage === 'mature') {
        const corn = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8);
        const cornMesh = new THREE.Mesh(corn, new THREE.MeshBasicMaterial({ color: 0xffe135 }));
        cornMesh.position.y = 2.5;
        group.add(cornMesh);
      }
    } else if (plantType.includes('Ant Plant')) {
      // Ant Plant
      const stem = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8);
      const stemMesh = new THREE.Mesh(stem, new THREE.MeshBasicMaterial({ color: 0x8B4513 }));
      stemMesh.position.y = 1.25;
      group.add(stemMesh);

      // Ant plant leaves (trap-like structures)
      const leafGeometry = new THREE.ConeGeometry(0.4, 1, 8);
      const leafMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
      
      // Add multiple leaves in a circular pattern
      for (let i = 0; i < 6; i++) {
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.y = 1.5;
        leaf.rotation.x = Math.PI / 3; // Angle the leaves outward
        leaf.rotation.y = (i * Math.PI) / 3; // Space leaves evenly
        group.add(leaf);
      }

      if (growthStage === 'mature') {
        // Add ant-like structures when mature
        const antGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const antMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        // Add multiple ants
        for (let i = 0; i < 3; i++) {
          const ant = new THREE.Mesh(antGeometry, antMaterial);
          ant.position.y = 2 + (i * 0.3);
          ant.position.x = Math.sin(i * Math.PI / 2) * 0.3;
          ant.position.z = Math.cos(i * Math.PI / 2) * 0.3;
          group.add(ant);
        }
      }
    }

    return group;
  }

  // Place this here, NOT inside useEffect!
  function closeAllShops() {
    setShowShop(false);
    setShowEggs(false);
    setShowGear(false);
    setShowBonus(false);
  }

  // Render overlays
  return (
    <div className="world-map" ref={mountRef} style={{ 
      width: '100%', 
      height: '100vh', 
      position: 'relative',
      display: 'block',
      overflow: 'hidden',
      backgroundColor: '#87CEEB'
    }}>
      {/* Inventory UI */}
      {showInventory && (
        <div style={{
          position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 24, minWidth: 320, zIndex: 10,
          boxShadow: '0 4px 32px #0002',
          color: '#000'
        }}>
          <h3 style={{marginTop:0, color: '#000'}}>Inventory</h3>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {inventory.length === 0 && <span style={{color: '#000'}}>No items</span>}
            {inventory.map((item, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  selectInventoryItem(i);
                }}
                style={{
                  background: selectedInventoryIndex === i ? '#e3f2fd' : '#eee',
                  border: selectedInventoryIndex === i ? '2px solid #2196f3' : '2px solid transparent',
                  borderRadius: 8,
                  padding: 8,
                  minWidth: 80,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  color: '#000'
                }}
              >
                <span style={{
                  width: 16,
                  height: 16,
                  background: `#${item.color.toString(16)}`,
                  borderRadius: 4,
                  display: 'inline-block'
                }}></span>
                {item.name}
              </button>
            ))}
          </div>
          <div style={{marginTop:12, color: '#000'}}>Coins: <b>{coins}</b></div>
        </div>
      )}
      {/* Shop UI */}
      {showShop && (
        <div style={{
          position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.98)', borderRadius: 16, padding: 24, minWidth: 320, zIndex: 10,
          boxShadow: '0 4px 32px #0002',
          color: '#000'
        }}>
          <h3 style={{marginTop:0, color: '#000'}}>{prompt === 'buy' ? 'Buy Shop' : 'Sell Shop'}</h3>
          {prompt === 'buy' && (
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              {SEEDS.map((seed, i) => (
                <div key={i} style={{background:'#eee',borderRadius:8,padding:8,minWidth:100,display:'flex',alignItems:'center',gap:8,justifyContent:'space-between', color: '#000'}}>
                  <span style={{width:16,height:16,background:`#${seed.color.toString(16)}`,borderRadius:4,display:'inline-block'}}></span>
                  {seed.name}
                  <button disabled={coins<seed.price} onClick={()=>handleBuy(seed)} style={{marginLeft:8, color: '#000'}}>Buy ({seed.price})</button>
                </div>
              ))}
            </div>
          )}
          {prompt === 'sell' && (
            <div style={{marginTop:16, color: '#000'}}>
              <h4 style={{color: '#000'}}>Sell Plants</h4>
              {Object.entries(plants).length === 0 && <div style={{color: '#000'}}>No plants to sell</div>}
              {Object.entries(plants).map(([pos, seed], i) => (
                <div key={i} style={{marginBottom:8, color: '#000'}}>
                  {seed} <button onClick={()=>{
                    setCoins(c=>c+5);
                    setPlants(pl=>{
                      const newPl = {...pl};
                      delete newPl[pos];
                      return newPl;
                    });
                  }} style={{color: '#000'}}>Sell (+5)</button>
                </div>
              ))}
            </div>
          )}
          <div style={{marginTop:12, color: '#000'}}>Coins: <b>{coins}</b></div>
        </div>
      )}
      {/* Eggs Shop UI */}
      {showEggs && (
        <div style={{
          position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.98)', borderRadius: 16, padding: 24, minWidth: 320, zIndex: 10,
          boxShadow: '0 4px 32px #0002',
          color: '#000'
        }}>
          <h3 style={{marginTop:0, color: '#000'}}>Eggs Shop</h3>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {EGGS.map((item, i) => (
              <div key={i} style={{background:'#eee',borderRadius:8,padding:8,minWidth:100,display:'flex',alignItems:'center',gap:8,justifyContent:'space-between', color: '#000'}}>
                <span style={{width:16,height:16,background:`#${item.color.toString(16)}`,borderRadius:4,display:'inline-block'}}></span>
                {item.name}
                <button disabled={coins<item.price} onClick={()=>{
                  setCoins(c=>c-item.price);
                  setInventory(inv=>[...inv, { name: item.name, color: item.color }]);
                }} style={{marginLeft:8, color: '#000'}}>Buy ({item.price})</button>
              </div>
            ))}
          </div>
          <div style={{marginTop:12, color: '#000'}}>Coins: <b>{coins}</b></div>
        </div>
      )}
      {/* Gear Shop UI */}
      {showGear && (
        <div style={{
          position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.98)', borderRadius: 16, padding: 24, minWidth: 320, zIndex: 10,
          boxShadow: '0 4px 32px #0002',
          color: '#000'
        }}>
          <h3 style={{marginTop:0, color: '#000'}}>Gear Shop</h3>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {GEAR.map((item, i) => (
              <div key={i} style={{background:'#eee',borderRadius:8,padding:8,minWidth:100,display:'flex',alignItems:'center',gap:8,justifyContent:'space-between', color: '#000'}}>
                <span style={{width:16,height:16,background:`#${item.color.toString(16)}`,borderRadius:4,display:'inline-block'}}></span>
                {item.name}
                <button disabled={coins<item.price} onClick={()=>{
                  setCoins(c=>c-item.price);
                  setInventory(inv=>[...inv, { name: item.name, color: item.color }]);
                }} style={{marginLeft:8, color: '#000'}}>Buy ({item.price})</button>
              </div>
            ))}
          </div>
          <div style={{marginTop:12, color: '#000'}}>Coins: <b>{coins}</b></div>
        </div>
      )}
      {/* Bonus Shop UI */}
      {showBonus && (
        <div style={{
          position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.98)', borderRadius: 16, padding: 24, minWidth: 320, zIndex: 10,
          boxShadow: '0 4px 32px #0002',
          color: '#000'
        }}>
          <h3 style={{marginTop:0, color: '#000'}}>Bonus Shop</h3>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {BONUS.map((item, i) => (
              <div key={i} style={{background:'#eee',borderRadius:8,padding:8,minWidth:100,display:'flex',alignItems:'center',gap:8,justifyContent:'space-between', color: '#000'}}>
                <span style={{width:16,height:16,background:`#${item.color.toString(16)}`,borderRadius:4,display:'inline-block'}}></span>
                {item.name}
                <button disabled={coins<item.price} onClick={()=>{
                  setCoins(c=>c-item.price);
                  setInventory(inv=>[...inv, { name: item.name, color: item.color }]);
                }} style={{marginLeft:8, color: '#000'}}>Buy ({item.price})</button>
              </div>
            ))}
          </div>
          <div style={{marginTop:12, color: '#000'}}>Coins: <b>{coins}</b></div>
        </div>
      )}
      {/* Bank UI */}
      {showBank && (
        <div style={{
          position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.98)', borderRadius: 16, padding: 24, minWidth: 320, zIndex: 10,
          boxShadow: '0 4px 32px #0002',
          color: '#000'
        }}>
          <h3 style={{marginTop:0, color: '#000'}}>Bank</h3>
          <div style={{marginBottom:12, color: '#000'}}>Coins: <b>{coins}</b></div>
          <button onClick={()=>setCoins(c=>c+10)} style={{marginRight:8, color: '#000'}}>Deposit +10</button>
          <button onClick={()=>setCoins(c=>Math.max(0,c-10))} style={{color: '#000'}}>Withdraw -10</button>
        </div>
      )}
      {/* Prompts for shops */}
      {prompt === 'buy' && !showShop && (
        <button 
          onClick={() => {
            closeAllShops();
            setShowShop(true);
            console.log('Opening Buy Shop');
          }}
          style={{
            position:'absolute',
            bottom:80,
            left:'50%',
            transform:'translateX(-50%)',
            background:'#fff8',
            padding:'8px 24px',
            borderRadius:8,
            fontWeight:600,
            zIndex:10,
            border:'2px solid #2196f3',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            gap:8,
            color: '#000'
          }}
        >
          Click to open Buy Shop
        </button>
      )}
      {prompt === 'sell' && !showShop && (
        <button 
          onClick={() => {
            closeAllShops();
            setShowShop(true);
            console.log('Opening Sell Shop');
          }}
          style={{
            position:'absolute',
            bottom:80,
            left:'50%',
            transform:'translateX(-50%)',
            background:'#fff8',
            padding:'8px 24px',
            borderRadius:8,
            fontWeight:600,
            zIndex:10,
            border:'2px solid #ff0000',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            gap:8,
            color: '#000'
          }}
        >
          Click to open Sell Shop
        </button>
      )}
      {prompt === 'eggs' && !showEggs && (
        <button 
          onClick={() => {
            closeAllShops();
            setShowEggs(true);
            console.log('Opening Eggs Shop');
          }}
          style={{
            position:'absolute',
            bottom:80,
            left:'50%',
            transform:'translateX(-50%)',
            background:'#fff8',
            padding:'8px 24px',
            borderRadius:8,
            fontWeight:600,
            zIndex:10,
            border:'2px solid #ffeb3b',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            gap:8,
            color: '#000'
          }}
        >
          Click to open Eggs Shop
        </button>
      )}
      {prompt === 'gear' && !showGear && (
        <button 
          onClick={() => {
            closeAllShops();
            setShowGear(true);
            console.log('Opening Gear Shop');
          }}
          style={{
            position:'absolute',
            bottom:80,
            left:'50%',
            transform:'translateX(-50%)',
            background:'#fff8',
            padding:'8px 24px',
            borderRadius:8,
            fontWeight:600,
            zIndex:10,
            border:'2px solid #00c853',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            gap:8,
            color: '#000'
          }}
        >
          Click to open Gear Shop
        </button>
      )}
      {prompt && prompt.startsWith('plantblock:') && (
        <button 
          onClick={() => {
            const blockPos = prompt.split(':')[1];
            if (!plants[blockPos]) {
              // Use the selected inventory item
              const selectedItem = inventory[selectedInventoryIndex];
              if (selectedItem && selectedItem.name.includes('Seed')) {
                // Remove the seed from inventory first
                setInventory(inv => {
                  const newInv = [...inv];
                  newInv.splice(selectedInventoryIndex, 1);
                  return newInv;
                });
                // Then plant it
                setPlants(pl => ({ ...pl, [blockPos]: selectedItem.name }));
                setPlantGrowth(pl => ({ ...pl, [blockPos]: 0 }));
                console.log('Planting:', selectedItem.name);
              } else {
                console.log('Select a seed in your inventory to plant.');
              }
            } else {
              console.log('Block already has a plant');
            }
          }}
          style={{
            position:'absolute',
            bottom:80,
            left:'50%',
            transform:'translateX(-50%)',
            background:'#fff8',
            padding:'8px 24px',
            borderRadius:8,
            fontWeight:600,
            zIndex:10,
            border:'2px solid #4CAF50',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            gap:8,
            color: '#000'
          }}
        >
          {inventory[selectedInventoryIndex] && inventory[selectedInventoryIndex].name.includes('Seed') ? (
            <>Click to plant <b>{inventory[selectedInventoryIndex].name}</b></>
          ) : (
            <>Select a seed in your inventory to plant</>
          )}
        </button>
      )}
    </div>
  );
}

export default MyN;
