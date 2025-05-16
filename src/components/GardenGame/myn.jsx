import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const SEEDS = [
  { name: 'Carrot Seed', price: 5, color: 0xffa500 },
  { name: 'Tomato Seed', price: 8, color: 0xff6347 },
  { name: 'Corn Seed', price: 10, color: 0xffe135 },
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
  const [inventory, setInventory] = useState([]);
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
  const [userPlot, setUserPlot] = useState(null);
  const userId = getUserId();
  const [selectedInventoryIndex, setSelectedInventoryIndex] = useState(0);

  // Place this here, NOT inside useEffect!
  function closeAllShops() {
    setShowShop(false);
    setShowEggs(false);
    setShowGear(false);
    setShowBonus(false);
  }

  useEffect(() => {
    // Assign a unique plot to this user (local demo)
    const allPlots = [];
    const blockSize = 20;
    const spacing = 30;
    const startX = -spacing;
    const startZ = -spacing;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        allPlots.push({ x: startX + (i * spacing), z: startZ + (j * spacing) });
      }
    }
    let plotMap = JSON.parse(localStorage.getItem('plotMap') || '{}');
    if (!plotMap[userId]) {
      // Assign first available plot
      const taken = Object.values(plotMap);
      const available = allPlots.find(p => !taken.some(t => t.x === p.x && t.z === p.z));
      if (available) {
        plotMap[userId] = available;
        localStorage.setItem('plotMap', JSON.stringify(plotMap));
      }
    }
    setUserPlot(plotMap[userId]);
  }, [userId]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Create main green platform
    const platformGeometry = new THREE.BoxGeometry(200, 10, 200);
    const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x7cfc7c });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(0, -5, 0);  // Position below the planting blocks
    scene.add(platform);

    // Create character
    const character = new THREE.Group();
    
    // Character body
    const bodyGeometry = new THREE.BoxGeometry(2, 3, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    character.add(body);

    // Character head
    const headGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 3.5;
    head.castShadow = true;
    character.add(head);

    character.position.set(0, 0, 0);
    scene.add(character);
    characterRef.current = character;

    // Create only the four shops (as tents)
    SHOPS.forEach(({ x, z, type, label }) => {
      // Tent base
      const baseGeometry = new THREE.BoxGeometry(15, 1, 15);
      let tentColor = 0xff0000; // Red for sell shop
      if (type === 'eggs') tentColor = 0xffeb3b;
      if (type === 'gear') tentColor = 0x00c853;
      if (type === 'buy') tentColor = 0x2196f3; // Blue for buy shop
      const baseMaterial = new THREE.MeshBasicMaterial({ color: tentColor });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(x, 0, z);
      scene.add(base);
      // Tent top
      const tentGeometry = new THREE.ConeGeometry(10, 15, 4);
      const tentMaterial = new THREE.MeshBasicMaterial({ color: tentColor });
      const tent = new THREE.Mesh(tentGeometry, tentMaterial);
      tent.position.set(x, 8, z);
      tent.rotation.y = Math.PI / 4;
      scene.add(tent);
      // Add a floating label above each tent (for debug/clarity)
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0,0,256,64);
      ctx.fillStyle = '#222'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(label, 128, 44);
      const texture = new THREE.CanvasTexture(canvas);
      const labelMat = new THREE.SpriteMaterial({ map: texture });
      const labelSprite = new THREE.Sprite(labelMat);
      labelSprite.position.set(x, 18, z);
      labelSprite.scale.set(20, 5, 1);
      scene.add(labelSprite);
    });

    // Create 6 brown planting blocks in a grid
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
        block.userData = { position: `${position.x},${position.z}` };
        scene.add(block);
        plantingBlocks.push(block);
        blockPositions.current.push({ x: position.x, z: position.z });
      }
    }
    plantingBlocksRef.current = plantingBlocks;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 15);  // Position camera behind character
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Movement state
    let velocity = new THREE.Vector3(0, 0, 0);
    const moveSpeed = 0.18;
    const rotateSpeed = 0.03;
    const damping = 0.85;
    const keys = {};

    function handleKeyDown(event) {
      keys[event.key.toLowerCase()] = true;
      if (event.key.toLowerCase() === 'i') setShowInventory(v => !v);
      if (event.key.toLowerCase() === 'e') {
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

        // Handle planting and tool usage
        if (prompt && prompt.startsWith('plantblock:')) {
          const selectedItem = inventory[0];
          if (!selectedItem) return;

          if (selectedItem.name.includes('Seed')) {
            // Plant seed
            setPlantingSeed(selectedItem.name);
            console.log('Planting:', selectedItem.name);
          } else if (selectedItem.name === 'Watering Can') {
            // Water the plant
            const blockPos = prompt.split(':')[1];
            if (plants[blockPos]) {
              console.log('Watering plant at:', blockPos);
              // Add watering effect or growth boost here
            }
          } else if (selectedItem.name === 'Shovel' || selectedItem.name === 'Golden Shovel') {
            // Remove plant
            const blockPos = prompt.split(':')[1];
            if (plants[blockPos]) {
              console.log('Removing plant at:', blockPos);
              setPlants(pl => {
                const newPl = {...pl};
                delete newPl[blockPos];
                return newPl;
              });
            }
          }
        }
      }
    }
    function handleKeyUp(event) {
      keys[event.key.toLowerCase()] = false;
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Raycaster for clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(plantingBlocks);

      if (intersects.length > 0) {
        const block = intersects[0].object;
        setSelectedBlock(block.userData.position);
        
        // Highlight selected block
        plantingBlocks.forEach(b => {
          b.material.color.setHex(0x8B4513); // Reset all blocks to brown
        });
        block.material.color.setHex(0xA0522D); // Highlight selected block
      }
    }

    renderer.domElement.addEventListener('click', onMouseClick);

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      // Smooth movement
      let moveVec = new THREE.Vector3(0, 0, 0);
      if (keys['w']) {
        moveVec.x -= Math.sin(characterRef.current.rotation.y) * moveSpeed;
        moveVec.z -= Math.cos(characterRef.current.rotation.y) * moveSpeed;
      }
      if (keys['s']) {
        moveVec.x += Math.sin(characterRef.current.rotation.y) * moveSpeed;
        moveVec.z += Math.cos(characterRef.current.rotation.y) * moveSpeed;
      }
      if (keys['a']) {
        characterRef.current.rotation.y += rotateSpeed;
      }
      if (keys['d']) {
        characterRef.current.rotation.y -= rotateSpeed;
      }
      velocity.add(moveVec);
      velocity.multiplyScalar(damping);
      characterRef.current.position.add(velocity);
      // Camera follow
      const cameraOffset = new THREE.Vector3(0, 10, 15);
      cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), characterRef.current.rotation.y);
      cameraRef.current.position.copy(characterRef.current.position).add(cameraOffset);
      cameraRef.current.lookAt(characterRef.current.position);
      // Prompt logic (shops and plots)
      let foundShop = false;
      for (const shop of SHOPS) {
        const dist = Math.sqrt(
          Math.pow(characterRef.current.position.x - shop.x, 2) + Math.pow(characterRef.current.position.z - shop.z, 2)
        );
        if (dist < 15) {
          console.log('Near shop:', shop.type, 'distance:', dist);
          setPrompt(shop.type);
          foundShop = true;
          break;
        }
      }
      if (!foundShop) {
        // Only show prompt for user's plot
        if (selectedBlock && userPlot && selectedBlock === `${userPlot.x},${userPlot.z}`) {
          const [bx, bz] = selectedBlock.split(',').map(Number);
          const distToBlock = Math.sqrt(
            Math.pow(characterRef.current.position.x - bx, 2) + Math.pow(characterRef.current.position.z - bz, 2)
          );
          if (distToBlock < 15) {
            setPrompt('plantblock:' + selectedBlock);
          } else {
            setPrompt('');
            closeAllShops();
          }
        } else {
          setPrompt('');
          closeAllShops();
        }
      }
      renderer.render(scene, cameraRef.current);
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

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.domElement.removeEventListener('click', onMouseClick);
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [userPlot, selectedBlock]);

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
      setPlants(pl => ({ ...pl, [selectedBlock]: plantingSeed }));
      setInventory(inv => {
        const idx = inv.findIndex(i => i.name === plantingSeed);
        if (idx !== -1) {
          const newInv = [...inv];
          newInv.splice(idx, 1);
          return newInv;
        }
        return inv;
      });
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

  // Render overlays
  return (
    <div className="world-map" ref={mountRef} style={{ width: '100%', height: '100vh', position: 'relative' }}>
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
      {prompt && prompt.startsWith('plantblock:') && inventory.length > 0 && (
        <button 
          onClick={() => {
            const selectedItem = inventory[0];
            if (!selectedItem) return;

            if (selectedItem.name.includes('Seed')) {
              setPlantingSeed(selectedItem.name);
              console.log('Planting:', selectedItem.name);
            } else if (selectedItem.name === 'Watering Can') {
              const blockPos = prompt.split(':')[1];
              if (plants[blockPos]) {
                console.log('Watering plant at:', blockPos);
                // Add watering effect or growth boost here
              }
            } else if (selectedItem.name === 'Shovel' || selectedItem.name === 'Golden Shovel') {
              const blockPos = prompt.split(':')[1];
              if (plants[blockPos]) {
                console.log('Removing plant at:', blockPos);
                setPlants(pl => {
                  const newPl = {...pl};
                  delete newPl[blockPos];
                  return newPl;
                });
              }
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
          {inventory[0].name.includes('Seed') && (
            <>Click to plant <b>{inventory[0].name}</b></>
          )}
          {inventory[0].name === 'Watering Can' && (
            <>Click to water plant</>
          )}
          {(inventory[0].name === 'Shovel' || inventory[0].name === 'Golden Shovel') && (
            <>Click to remove plant</>
          )}
        </button>
      )}
      {prompt && prompt.startsWith('plantblock:') && inventory.length === 0 && (
        <div style={{position:'absolute',bottom:80,left:'50%',transform:'translateX(-50%)',background:'#fff8',padding:'8px 24px',borderRadius:8,fontWeight:600,zIndex:10, color: '#000'}}>No items in inventory</div>
      )}
      {/* Planted plants on blocks */}
      {Object.entries(plants).map(([pos, seed]) => {
        const [x, z] = pos.split(',').map(Number);
        const color = SEEDS.find(s=>s.name===seed)?.color || 0x00ff00;
        const isUserPlot = userPlot && pos === `${userPlot.x},${userPlot.z}`;
        return (
          <div key={pos} style={{position:'absolute',left:`calc(50% + ${(x/200)*window.innerWidth/2}px)`,top:`calc(50% + ${(z/200)*window.innerHeight/2}px)`,pointerEvents:'none'}}>
            <span style={{width:24,height:24,background:`#${color.toString(16)}`,borderRadius:12,display:'inline-block',border:isUserPlot?'3px solid #2196f3':'2px solid #fff'}}></span>
          </div>
        );
      })}
    </div>
  );
}

export default MyN;
