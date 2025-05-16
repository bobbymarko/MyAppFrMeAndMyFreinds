import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import './GardenGame.css';

const STANDS = {
  shop: { x: 6, z: 0, label: 'Shop', color: 0xffd700 },
  sell: { x: -6, z: 0, label: 'Sell', color: 0x4caf50 },
  eggs: { x: 0, z: 6, label: 'Eggs', color: 0xff6b6b },
};
const STAND_RADIUS = 2;
const MAP_MIN = -19.5;
const MAP_MAX = 19.5;
const SHOP_ITEMS = [
  { id: 'carrot', name: 'Carrot Seed', price: 5, type: 'seed', color: '#ffb347' },
  { id: 'strawberry', name: 'Strawberry Seed', price: 10, type: 'seed', color: '#ff6b81' },
  { id: 'tomato', name: 'Tomato Seed', price: 15, type: 'seed', color: '#ff6347' },
  { id: 'pumpkin', name: 'Pumpkin Seed', price: 20, type: 'seed', color: '#ffae42' },
];
const EGG_ITEMS = [
  { id: 'egg1', name: 'Basic Egg', price: 25, type: 'egg', color: '#fffbe6' },
  { id: 'egg2', name: 'Golden Egg', price: 100, type: 'egg', color: '#ffd700' },
];
const PLOT_GRID_SIZE = 5;
const PLOT_SPACING = 2.5;

const getPlotKey = (i, j) => `${i},${j}`;

function getRandomPosition() {
  return {
    x: Math.random() * (MAP_MAX - MAP_MIN - 4) + MAP_MIN + 2,
    z: Math.random() * (MAP_MAX - MAP_MIN - 4) + MAP_MIN + 2,
  };
}

function randomWeight() {
  return (Math.random() * 0.5 + 0.2).toFixed(2);
}
function randomTags() {
  const tags = ["Wet", "Frozen", "Chilled", "Moonlit"];
  const n = Math.random() < 0.5 ? 0 : 1 + Math.floor(Math.random() * 2);
  let arr = [];
  for (let i = 0; i < n; ++i) arr.push(tags[Math.floor(Math.random() * tags.length)]);
  return arr;
}

function addBlockyTree(scene, x, z) {
  const trunkGeometry = new THREE.CylinderGeometry(0.25, 0.25, 2, 6);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8d5524 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.set(x, 1, z);
  trunk.castShadow = true;
  scene.add(trunk);
  const leafGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
  const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
  leaves.position.set(x, 2.2, z);
  leaves.castShadow = true;
  scene.add(leaves);
}

function addBlockyBush(scene, x, z) {
  const bushGeometry = new THREE.BoxGeometry(1.2, 0.7, 1.2);
  const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x2ecc40 });
  const bush = new THREE.Mesh(bushGeometry, bushMaterial);
  bush.position.set(x, 0.35, z);
  bush.castShadow = true;
  scene.add(bush);
}

function addBlockyBamboo(scene, x, z) {
  for (let i = 0; i < 3; i++) {
    const bambooGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2.5 + Math.random(), 6);
    const bambooMaterial = new THREE.MeshStandardMaterial({ color: 0x7fff00 });
    const bamboo = new THREE.Mesh(bambooGeometry, bambooMaterial);
    bamboo.position.set(x + (Math.random() - 0.5) * 0.5, 1.25 + Math.random() * 0.5, z + (Math.random() - 0.5) * 0.5);
    bamboo.castShadow = true;
    scene.add(bamboo);
    const leafGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.set(bamboo.position.x, bamboo.position.y + 1.2, bamboo.position.z);
    scene.add(leaf);
  }
}

function addBlockyFruit(scene, x, z, color = 0xff6347) {
  const fruitGeometry = new THREE.SphereGeometry(0.25, 12, 12);
  const fruitMaterial = new THREE.MeshStandardMaterial({ color });
  const fruit = new THREE.Mesh(fruitGeometry, fruitMaterial);
  fruit.position.set(x, 1.7, z);
  fruit.castShadow = true;
  scene.add(fruit);
}

const GardenGame = () => {
  const mountRef = useRef(null);
  const [coins, setCoins] = useState(100);
  const [shopOpen, setShopOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [eggsOpen, setEggsOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [eggs, setEggs] = useState([]);
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0, z: 0 });
  const [canOpen, setCanOpen] = useState({ shop: false, sell: false, eggs: false });
  const [selectedInventoryIdx, setSelectedInventoryIdx] = useState(null);
  const [plots, setPlots] = useState(() => {
    const obj = {};
    for (let i = 0; i < PLOT_GRID_SIZE; i++) {
      for (let j = 0; j < PLOT_GRID_SIZE; j++) {
        obj[getPlotKey(i, j)] = null;
      }
    }
    return obj;
  });
  const [hoveredPlot, setHoveredPlot] = useState(null);
  const [collectible, setCollectible] = useState(() => ({ ...getRandomPosition(), id: Date.now() }));
  const [showInventory, setShowInventory] = useState(false);
  const [search, setSearch] = useState("");
  const sceneRef = useRef(null);
  const characterRef = useRef(null);
  const plotMeshesRef = useRef({});
  const [canCollect, setCanCollect] = useState(false);

  const getNearestStand = () => {
    let nearest = null;
    let minDist = Infinity;
    Object.entries(STANDS).forEach(([key, stand]) => {
      if (canOpen[key]) {
        const dist = Math.sqrt((characterPosition.x - stand.x) ** 2 + (characterPosition.z - stand.z) ** 2);
        if (dist < minDist) {
          minDist = dist;
          nearest = key;
        }
      }
    });
    return nearest;
  };

  useEffect(() => {
    if (!mountRef.current) return;
    // Clear previous scene
    if (sceneRef.current) {
      while (sceneRef.current.children.length > 0) {
        sceneRef.current.remove(sceneRef.current.children[0]);
      }
    }
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7cfc7c); // Roblox green baseplate
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, 10);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    // Baseplate grid
    for (let x = -20; x <= 20; x += 2) {
      for (let z = -20; z <= 20; z += 2) {
        const tileGeometry = new THREE.BoxGeometry(2, 0.2, 2);
        const tileMaterial = new THREE.MeshStandardMaterial({ color: 0x7cfc7c });
        const tile = new THREE.Mesh(tileGeometry, tileMaterial);
        tile.position.set(x, -0.1, z);
        tile.castShadow = false;
        tile.receiveShadow = true;
        scene.add(tile);
      }
    }
    // Blocky trees
    for (let i = 0; i < 7; i++) {
      addBlockyTree(scene, -10 + i * 3, 10 + (i % 2) * 2);
      addBlockyTree(scene, 10 - i * 3, -10 - (i % 2) * 2);
    }
    // Blocky bushes
    for (let i = 0; i < 6; i++) {
      addBlockyBush(scene, -8 + i * 3, 5);
      addBlockyBush(scene, 8 - i * 3, -5);
    }
    // Blocky bamboo
    for (let i = 0; i < 5; i++) {
      addBlockyBamboo(scene, -12 + i * 6, 0);
    }
    // Blocky fruit
    for (let i = 0; i < 8; i++) {
      addBlockyFruit(scene, -10 + i * 2.5, 7, 0xff6347);
    }
    // Plots
    plotMeshesRef.current = {};
    const plotStartX = -((PLOT_GRID_SIZE - 1) * PLOT_SPACING) / 2;
    const plotStartZ = -((PLOT_GRID_SIZE - 1) * PLOT_SPACING) / 2;
    for (let i = 0; i < PLOT_GRID_SIZE; i++) {
      for (let j = 0; j < PLOT_GRID_SIZE; j++) {
        const plotKey = getPlotKey(i, j);
        const plotGeometry = new THREE.BoxGeometry(2, 0.1, 2);
        const plotMaterial = new THREE.MeshStandardMaterial({ color: hoveredPlot === plotKey ? 0xffd700 : plots[plotKey] ? 0x8bc34a : 0xf7c873 });
        const plot = new THREE.Mesh(plotGeometry, plotMaterial);
        plot.position.set(plotStartX + i * PLOT_SPACING, 0.05, plotStartZ + j * PLOT_SPACING);
        plot.castShadow = false;
        plot.receiveShadow = true;
        plotMeshesRef.current[plotKey] = plot;
        scene.add(plot);
        if (plots[plotKey]) {
          const plantColor = plots[plotKey].color || '#8bc34a';
          const plantGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
          const plantMaterial = new THREE.MeshStandardMaterial({ color: plantColor });
          const plant = new THREE.Mesh(plantGeometry, plantMaterial);
          plant.position.set(plot.position.x, 0.6, plot.position.z);
          scene.add(plant);
        }
      }
    }
    Object.entries(STANDS).forEach(([key, stand]) => {
      const tableGeometry = new THREE.BoxGeometry(2, 0.3, 1);
      const tableMaterial = new THREE.MeshStandardMaterial({ color: stand.color });
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.set(stand.x, 0.15, stand.z);
      table.castShadow = true;
      scene.add(table);
      const signGeometry = new THREE.BoxGeometry(1.6, 0.4, 0.2);
      const signMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const sign = new THREE.Mesh(signGeometry, signMaterial);
      sign.position.set(stand.x, 0.7, stand.z);
      scene.add(sign);
    });
    // Collectible item (fruit)
    let collectibleMesh = null;
    if (collectible) {
      const fruitGeometry = new THREE.SphereGeometry(0.35, 18, 18);
      const fruitMaterial = new THREE.MeshStandardMaterial({ color: 0xff6347 });
      collectibleMesh = new THREE.Mesh(fruitGeometry, fruitMaterial);
      collectibleMesh.position.set(collectible.x, 0.35, collectible.z);
      collectibleMesh.castShadow = true;
      scene.add(collectibleMesh);
    }
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1, 0);
    body.castShadow = true;
    scene.add(body);
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffe0a3 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 2.1, 0);
    head.castShadow = true;
    scene.add(head);
    const character = new THREE.Group();
    character.add(body);
    character.add(head);
    character.position.set(characterPosition.x, 0, characterPosition.z);
    scene.add(character);
    characterRef.current = character;
    let velocity = { x: 0, y: 0, z: 0 };
    let onGround = true;
    const keys = {};
    const handleKeyDown = (e) => { keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const handleE = (e) => {
      if (e.key.toLowerCase() === 'e') {
        if (canCollect) {
          setInventory((prev) => [
            ...prev,
            { id: 'fruit-' + Date.now(), name: 'Fruit', type: 'fruit', color: '#ff6347', tags: randomTags(), weight: randomWeight() },
          ]);
          setCollectible({ ...getRandomPosition(), id: Date.now() });
          setCanCollect(false);
          return;
        }
        const nearest = getNearestStand();
        if (nearest === 'shop') {
          setShopOpen((open) => !open);
          setSellOpen(false);
          setEggsOpen(false);
        } else if (nearest === 'sell') {
          setSellOpen((open) => !open);
          setShopOpen(false);
          setEggsOpen(false);
        } else if (nearest === 'eggs') {
          setEggsOpen((open) => !open);
          setShopOpen(false);
          setSellOpen(false);
        }
      }
      if (e.key === 'i' || e.key === 'I') {
        setShowInventory((v) => !v);
      }
      if (e.key === 'Escape') {
        setShowInventory(false);
      }
    };
    window.addEventListener('keydown', handleE);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function onMouseMove(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(plotMeshesRef.current));
      if (intersects.length > 0) {
        const plot = intersects[0].object;
        for (const [key, mesh] of Object.entries(plotMeshesRef.current)) {
          if (mesh === plot) {
            setHoveredPlot(key);
            return;
          }
        }
      } else {
        setHoveredPlot(null);
      }
    }
    function onClick(event) {
      if (selectedInventoryIdx !== null && hoveredPlot && !plots[hoveredPlot]) {
        const selectedItem = inventory[selectedInventoryIdx];
        if (selectedItem && selectedItem.type === 'seed') {
          setPlots((prev) => ({ ...prev, [hoveredPlot]: selectedItem }));
          setInventory((prev) => prev.filter((_, idx) => idx !== selectedInventoryIdx));
          setSelectedInventoryIdx(null);
        }
      }
    }
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
    function animate() {
      requestAnimationFrame(animate);
      let moveX = 0, moveZ = 0;
      const speed = 0.15;
      if (keys['w']) moveZ -= speed;
      if (keys['s']) moveZ += speed;
      if (keys['a']) moveX -= speed;
      if (keys['d']) moveX += speed;
      if (keys[' '] && onGround) {
        velocity.y = 0.25;
        onGround = false;
      }
      velocity.y -= 0.01;
      let newX = character.position.x + moveX;
      let newY = character.position.y + velocity.y;
      let newZ = character.position.z + moveZ;
      if (newY <= 0) {
        newY = 0;
        velocity.y = 0;
        onGround = true;
      }
      newX = Math.max(MAP_MIN, Math.min(MAP_MAX, newX));
      newZ = Math.max(MAP_MIN, Math.min(MAP_MAX, newZ));
      character.position.set(newX, newY, newZ);
      camera.position.set(newX, newY + 2.5, newZ + 10);
      camera.lookAt(newX, newY + 1, newZ);
      const canOpenObj = {};
      Object.entries(STANDS).forEach(([key, stand]) => {
        const dist = Math.sqrt((newX - stand.x) ** 2 + (newZ - stand.z) ** 2);
        canOpenObj[key] = dist < STAND_RADIUS;
      });
      setCanOpen(canOpenObj);
      if (collectible) {
        const dist = Math.sqrt((newX - collectible.x) ** 2 + (newZ - collectible.z) ** 2);
        if (dist < 1.1) {
          setCanCollect(true);
        } else {
          setCanCollect(false);
        }
      }
      renderer.render(scene, camera);
    }
    animate();
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleE);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
    // eslint-disable-next-line
  }, []);

  const handleBuy = (item) => {
    if (coins >= item.price) {
      setCoins(coins - item.price);
      setInventory([...inventory, item]);
    }
  };
  const handleSell = () => {
    const sellable = inventory.filter((item) => item.type === 'fruit');
    if (sellable.length > 0) {
      setCoins(coins + 10 * sellable.length);
      setInventory(inventory.filter((item) => item.type !== 'fruit'));
    }
  };
  const handleBuyEgg = (item) => {
    if (coins >= item.price) {
      setCoins(coins - item.price);
      setEggs([...eggs, item]);
    }
  };

  // Inventory search and grid
  const filteredInventory = inventory.filter(item => {
    if (!search.trim()) return true;
    return item.name.toLowerCase().includes(search.trim().toLowerCase()) || (item.tags && item.tags.join(' ').toLowerCase().includes(search.trim().toLowerCase()));
  });

  return (
    <div className="garden-game">
      <div className="garden-game-inner">
        <div className="game-header">
          <div className="game-stats">
            <div className="coins">💰 {coins}</div>
          </div>
        </div>
        <div className="game-content">
          <div className="garden-3d" ref={mountRef}>
            <div className="crosshair">+</div>
            {canCollect && (
              <div className="collect-prompt"><span className="collect-key">E</span> Collect</div>
            )}
            {canOpen.shop && !shopOpen && (
              <button className="open-shop-btn" style={{bottom: '120px'}} onClick={() => setShopOpen(true)}>
                Open Shop (E)
              </button>
            )}
            {shopOpen && (
              <div className="shop-panel" style={{bottom: 'auto', top: '50%'}}>
                <div className="shop-title">Shop Stand</div>
                <button className="close-shop-btn" onClick={() => setShopOpen(false)}>X</button>
                <div className="shop-items">
                  {SHOP_ITEMS.map(item => (
                    <button
                      key={item.id}
                      className="shop-item-btn"
                      disabled={coins < item.price}
                      onClick={() => handleBuy(item)}
                    >
                      {item.name} - ${item.price}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {canOpen.sell && !sellOpen && (
              <button className="open-shop-btn" style={{bottom: '70px'}} onClick={() => setSellOpen(true)}>
                Open Sell (E)
              </button>
            )}
            {sellOpen && (
              <div className="shop-panel" style={{bottom: 'auto', top: '50%'}}>
                <div className="shop-title">Sell Stand</div>
                <button className="close-shop-btn" onClick={() => setSellOpen(false)}>X</button>
                <div className="shop-items">
                  {inventory.filter((item) => item.type === 'fruit').length > 0 ? (
                    <button className="shop-item-btn" onClick={handleSell}>
                      Sell All ({inventory.filter((item) => item.type === 'fruit').length})
                    </button>
                  ) : (
                    <div style={{color:'#888',textAlign:'center'}}>No fruit to sell</div>
                  )}
                </div>
              </div>
            )}
            {canOpen.eggs && !eggsOpen && (
              <button className="open-shop-btn" style={{bottom: '20px'}} onClick={() => setEggsOpen(true)}>
                Open Eggs (E)
              </button>
            )}
            {eggsOpen && (
              <div className="shop-panel" style={{bottom: 'auto', top: '50%'}}>
                <div className="shop-title">Egg Stand</div>
                <button className="close-shop-btn" onClick={() => setEggsOpen(false)}>X</button>
                <div className="shop-items">
                  {EGG_ITEMS.map(item => (
                    <button
                      key={item.id}
                      className="shop-item-btn"
                      disabled={coins < item.price}
                      onClick={() => handleBuyEgg(item)}
                    >
                      {item.name} - ${item.price}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Centered Inventory Panel */}
            {showInventory && (
              <div className="center-inventory-panel">
                <div className="center-inventory-header">
                  <input
                    className="center-inventory-search"
                    placeholder="Search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="center-inventory-grid">
                  {filteredInventory.length === 0 && <div className="center-inventory-empty">No items</div>}
                  {filteredInventory.map((item, idx) => (
                    <div className="center-inventory-card" key={item.id} style={{borderColor: item.color || '#ffd700'}}>
                      <div className="center-inventory-tags">
                        {item.tags && item.tags.map((tag, i) => (
                          <span className="center-inventory-tag" key={i}>[{tag}]</span>
                        ))}
                      </div>
                      <div className="center-inventory-name">{item.name}</div>
                      {item.weight && <div className="center-inventory-weight">[{item.weight}kg]</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Inventory Panel (bottom left, for planting) */}
            {!showInventory && (
              <div className="inventory-panel">
                <div className="inventory-title">Inventory</div>
                <div className="inventory-items-list">
                  {inventory.length === 0 && <div className="inventory-empty">Empty</div>}
                  {inventory.map((item, idx) => (
                    <div
                      className={"inventory-item" + (selectedInventoryIdx === idx ? " selected" : "")}
                      key={idx}
                      style={{background: selectedInventoryIdx === idx ? '#ffd700' : '#fff', color: selectedInventoryIdx === idx ? '#fff' : '#222', borderColor: item.color || '#ffd700'}}
                      onClick={() => setSelectedInventoryIdx(idx)}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="controls-help">WASD to move, Space to jump, E to open/close stands or collect, I to open inventory. Collect fruit, click inventory to select, then click a plot to plant.</div>
      </div>
    </div>
  );
};

export default GardenGame; 