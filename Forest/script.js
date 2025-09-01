// =====================
// Iso Farm Game (script.js)
// - draggable inventory (expandable) on left
// - cheat menu on right
// - drag items from inventory to canvas to plant
// - full save state (inventory + plants + settings)
// =====================

/* --------- DOM / Canvas --------- */
const invBar = document.getElementById("inventoryBar");
const invToggle = document.getElementById("invToggle");
const invPanel = document.getElementById("inventoryPanel");
const inventoryList = document.getElementById("inventoryList");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const addSeedBtn = document.getElementById("addSeedBtn"); // Oak Seed
const removeSeedBtn = document.getElementById("removeSeedBtn"); // Oak Seed
const addYggdrasilSeedBtn = document.getElementById("addYggdrasilSeedBtn"); // Yggdrasil Seed
const removeYggdrasilSeedBtn = document.getElementById("removeYggdrasilSeedBtn"); // Yggdrasil Seed
const addWillowSeedBtn = document.getElementById("addWillowSeedBtn"); // Willow Seed
const removeWillowSeedBtn = document.getElementById("removeWillowSeedBtn"); // Willow Seed
const addMapleSeedBtn = document.getElementById("addMapleSeedBtn"); // Maple Seed
const removeMapleSeedBtn = document.getElementById("removeMapleSeedBtn"); // Maple Seed
const addSpruceSeedBtn = document.getElementById("addSpruceSeedBtn"); // Spruce Seed
const removeSpruceSeedBtn = document.getElementById("removeSpruceSeedBtn"); // Spruce Seed
const clearSaveBtn = document.getElementById("clearSaveBtn");
const removeTreeBtn = document.getElementById("removeTreeBtn");

let bottomPanelHeightCollapsed = 40;
let bottomPanelHeightExpanded = 150;
let rightPanelWidth = 180;

/* --------- Grid settings (unchanged) --------- */
const baseTileWidth = 140;
const baseTileHeight = 70;
const gridCols = 10;
const gridRows = 10;
let tileWidth = baseTileWidth;
let tileHeight = baseTileHeight;
let gridOffsetY = 250;

/* --------- Stable coordinate system --------- */
let stableCoordinateCenter = null; // Will be set once and remain fixed

/* ITEM REGISTRY (SCALABLE) */
const ITEMS = {
  oak_seed: {
    id: "oak_seed",
    name: "Oak Seed",
    image: "assets/common_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/common_seed.png",
      seedling: "assets/common_seed.png",
      plant: "assets/sprout/01oakSprout.png",
      mature: "assets/tree/01oakTree.png"
    },
    props: { growsInto: "oak_tree" }
  },
  birch_seed: {
    id: "birch_seed",
    name: "Birch Seed",
    image: "assets/common_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/common_seed.png",
      seedling: "assets/common_seed.png",
      plant: "assets/sprout/02birchSprout.png",
      mature: "assets/tree/02birchTree.png"
    },
    props: { growsInto: "birch_tree" }
  },
  spruce_seed: {
    id: "spruce_seed",
    name: "Spruce Seed",
    image: "assets/common_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/common_seed.png",
      seedling: "assets/common_seed.png",
      plant: "assets/sprout/03spruceSprout.png",
      mature: "assets/tree/03spruceTree.png"
    },
    props: { growsInto: "spruce_tree" }
  },
  cedar_seed: {
    id: "cedar_seed",
    name: "Cedar Seed",
    image: "assets/common_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/common_seed.png",
      seedling: "assets/common_seed.png",
      plant: "assets/sprout/04cedarSprout.png",
      mature: "assets/tree/04cedarTree.png"
    },
    props: { growsInto: "cedar_tree" }
  },
  willow_seed: {
    id: "willow_seed",
    name: "Willow Seed",
    image: "assets/common_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/common_seed.png",
      seedling: "assets/common_seed.png",
      plant: "assets/sprout/05willowSprout.png",
      mature: "assets/tree/05willowTree.png"
    },
    props: { growsInto: "willow_tree" }
  },
  maple_seed: {
    id: "maple_seed",
    name: "Maple Seed",
    image: "assets/common_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/common_seed.png",
      seedling: "assets/common_seed.png",
      plant: "assets/sprout/06mapleSprout.png",
      mature: "assets/tree/06mapleTree.png"
    },
    props: { growsInto: "maple_tree" }
  },
  acacia_seed: {
    id: "acacia_seed",
    name: "Acacia Seed",
    image: "assets/common_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/common_seed.png",
      seedling: "assets/common_seed.png",
      plant: "assets/sprout/07acaciaSprout.png",
      mature: "assets/tree/07acaciaTree.png"
    },
    props: { growsInto: "acacia_tree" }
  },
  silkfloss_seed: {
    id: "silkfloss_seed",
    name: "Silk Floss Seed",
    image: "assets/rare_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/rare_seed.png",
      seedling: "assets/rare_seed.png",
      plant: "assets/sprout/08silkflossSprout.png",
      mature: "assets/tree/08silkflossTree.png"
    },
    props: { growsInto: "silkfloss_tree" }
  },
  ghostgum_seed: {
    id: "ghostgum_seed",
    name: "Ghost Gum Seed",
    image: "assets/rare_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/rare_seed.png",
      seedling: "assets/rare_seed.png",
      plant: "assets/sprout/09ghostgumSprout.png",
      mature: "assets/tree/09ghostgumTree.png"
    },
    props: { growsInto: "ghostgum_tree" }
  },
  socotradragon_seed: {
    id: "socotradragon_seed",
    name: "Socotra Dragon Seed",
    image: "assets/rare_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/rare_seed.png",
      seedling: "assets/rare_seed.png",
      plant: "assets/sprout/10socotradragonSprout.png",
      mature: "assets/tree/10socotradragonTree.png"
    },
    props: { growsInto: "socotradragon_tree" }
  },
  ginkgo_seed: {
    id: "ginkgo_seed",
    name: "Ginkgo Seed",
    image: "assets/rare_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/rare_seed.png",
      seedling: "assets/rare_seed.png",
      plant: "assets/sprout/11ginkgoSprout.png",
      mature: "assets/tree/11ginkgoTree.png"
    },
    props: { growsInto: "ginkgo_tree" }
  },
  monkeypuzzle_seed: {
    id: "monkeypuzzle_seed",
    name: "Monkey Puzzle Seed",
    image: "assets/rare_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/rare_seed.png",
      seedling: "assets/rare_seed.png",
      plant: "assets/sprout/12monkeypuzzleSprout.png",
      mature: "assets/tree/12monkeypuzzleTree.png"
    },
    props: { growsInto: "monkeypuzzle_tree" }
  },
  rainboweucalyptus_seed: {
    id: "rainboweucalyptus_seed",
    name: "Rainbow Eucalyptus Seed",
    image: "assets/goated_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/goated_seed.png",
      seedling: "assets/goated_seed.png",
      plant: "assets/sprout/13rainboweucalyptusSprout.png",
      mature: "assets/tree/13rainboweucalyptusTree.png"
    },
    props: { growsInto: "rainboweucalyptus_tree" }
  },
  baobab_seed: {
    id: "baobab_seed",
    name: "Baobab Seed",
    image: "assets/goated_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/goated_seed.png",
      seedling: "assets/goated_seed.png",
      plant: "assets/sprout/14baobabSprout.png",
      mature: "assets/tree/14baobabTree.png"
    },
    props: { growsInto: "baobab_tree" }
  },
  fertility_seed: {
    id: "fertility_seed",
    name: "Fertility Tree Seed",
    image: "assets/goated_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/goated_seed.png",
      seedling: "assets/goated_seed.png",
      plant: "assets/sprout/15fertilitySprout.png",
      mature: "assets/tree/15fertilityTree.png"
    },
    props: { growsInto: "fertility_tree" }
  },
  yggdrasil_seed: {
    id: "yggdrasil_seed",
    name: "Yggdrasil Seed",
    image: "assets/yggdrasil_seed.png",
    type: "seed",
    sprites: {
      seed: "assets/yggdrasil_seed.png",
      seedling: "assets/yggdrasil_seed.png",
      plant: "assets/sprout/16yggdrasilSprout.png",
      mature: "assets/tree/16yggdrasilTree.png"
    },
    props: { growsInto: "yggdrasil_tree" }
  },
};
/* --------- Default stage durations (expandable) --------- */
const DEFAULT_STAGE_DURATIONS = {
  // Common trees - faster growth
  oak_seed: {
    seedling: 5000, // instant for testing
    plant: 5000 // instant for testing
  },
  birch_seed: {
    seedling: 5000, // 2 minutes
    plant: 5000 // 4 minutes
  },
  spruce_seed: {
    seedling: 5000, // 2.5 minutes
    plant: 5000 // 6 minutes
  },
  cedar_seed: {
    seedling: 5000, // 2.5 minutes
    plant: 5000 // 5 minutes
  },
  willow_seed: {
    seedling: 5000, // instant for testing
    plant: 5000 // 4.17 minutes
  },
  maple_seed: {
    seedling: 5000, // 3 minutes
    plant: 5000 // 7 minutes
  },
  acacia_seed: {
    seedling: 5000, // 3.3 minutes
    plant: 5000 // 8 minutes
  },
  
  // Rare trees - slower growth
  silkfloss_seed: {
    seedling: 5000, // 5 minutes
    plant: 5000 // 10 minutes
  },
  ghostgum_seed: {
    seedling: 5000, // 6 minutes
    plant: 5000 // 12 minutes
  },
  socotradragon_seed: {
    seedling: 5000, // 7 minutes
    plant: 5000 // 14 minutes
  },
  ginkgo_seed: {
    seedling: 5000, // 8 minutes
    plant: 5000 // 15 minutes
  },
  monkeypuzzle_seed: {
    seedling: 5000, // 9 minutes
    plant: 5000 // 18 minutes
  },
  
  // Legendary trees - slowest growth
  rainboweucalyptus_seed: {
    seedling: 5000, // 10 minutes
    plant: 5000 // 20 minutes
  },
  baobab_seed: {
    seedling: 5000, // 12 minutes
    plant: 5000 // 24 minutes
  },
  fertility_seed: {
    seedling: 5000, // 15 minutes
    plant: 5000 // 30 minutes
  },
  yggdrasil_seed: {
    seedling: 5000, // 20 minutes
    plant: 5000 // 40 minutes
  },
  
  // Legacy entries for compatibility
  pine_seed: {
    seedling: 5000, // 1.5 minutes
    plant: 5000 // 7.5 minutes
  }
};
// this is a test
/* --------- Game state (persisted) --------- */
const SAVE_KEY = "isoFarm_v1";
let gameState = {
  inventory: { oak_seed: 0, pine_seed: 0, spruce_seed: 0 },
  plants: [],
  settings: { gridOffsetY },
  discoveredTrees: [] // Track which tree types have been matured (discovered)
};

/* --------- Hover state tracking --------- */
let hoveredTile = null; // { ix, iy } or null
let hoverUpdateInterval = null;

/* --------- Dragging state for inventory -> canvas --------- */
let draggingInventoryItem = null; // { itemId, clientX, clientY, element }
let pointerIdActive = null;
let inventoryDragActive = false; // true while dragging an item from the inventory

/* --------- UI state --------- */
let isInvExpanded = false;
let isMovementLocked = false; // Lock world movement when inventory is open
let isTreeRemovalMode = false; // Toggle for tree removal mode

/* --------- Preload image helper --------- */
function preloadImage(img) {
  return new Promise((resolve, reject) => {
    if (!img) return reject(new Error("No image"));
    if (img.complete && img.naturalWidth) {
      if (img.decode) img.decode().then(()=>resolve(img)).catch(()=>resolve(img));
      else resolve(img);
      return;
    }
    function onLoad(){ img.removeEventListener("load", onLoad); img.removeEventListener("error", onError); if(img.decode) img.decode().then(()=>resolve(img)).catch(()=>resolve(img)); else resolve(img); }
    function onError(e){ img.removeEventListener("load", onLoad); img.removeEventListener("error", onError); reject(e); }
    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);
  });
}

/* --------- Image loading for drag previews --------- */
const itemImages = {}; // Store preloaded images for each item type, keyed by itemId and stage

async function preloadItemImages() {
  for (const [itemId, itemData] of Object.entries(ITEMS)) {
    // Preload the main item image (e.g., for inventory display)
    if (itemData.image) {
      try {
        const img = new Image();
        img.src = itemData.image;
        await preloadImage(img);
        itemImages[itemId] = img;
      } catch (e) {
        console.warn(`Failed to load main image for ${itemId}:`, itemData.image, e);
      }
    }

    // Preload sprites for different growth stages
    if (itemData.sprites) {
      for (const [stage, spritePath] of Object.entries(itemData.sprites)) {
        try {
          const img = new Image();
          img.src = spritePath;
          await preloadImage(img);
          itemImages[`${itemId}_${stage}`] = img; // Store with a unique key like "oak_seed_seedling"
        } catch (e) {
          console.warn(`Failed to load sprite for ${itemId} stage ${stage}:`, spritePath, e);
        }
      }
    }
  }
}

/* --------- Grass texture image --------- */
const grassImage = new Image();
grassImage.src = "assets/grass.png";

/* --------- Save / Load --------- */
function saveGame(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(gameState)); }catch(e){ console.error(e); } }
function loadGame(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return;
    const loaded = JSON.parse(raw);
    if(loaded.inventory) gameState.inventory = loaded.inventory;
    if(Array.isArray(loaded.plants)) gameState.plants = loaded.plants;
    if(loaded.settings && typeof loaded.settings.gridOffsetY === "number"){
      gameState.settings.gridOffsetY = loaded.settings.gridOffsetY;
      gridOffsetY = gameState.settings.gridOffsetY;
    }
    if(Array.isArray(loaded.discoveredTrees)) gameState.discoveredTrees = loaded.discoveredTrees;
    else gameState.discoveredTrees = []; // Initialize if missing
  }catch(e){ console.warn("Load failed", e); }
}

/* --------- Inventory UI rendering (horizontal layout with pixel-perfect styling) --------- */
function updateInventoryUI(){
  inventoryList.innerHTML = "";
  // iterate ITEMS to keep it expandable and deterministic order
  Object.values(ITEMS).forEach(item=>{
    const qty = gameState.inventory[item.id] || 0;
    const el = document.createElement("div");
    el.className = "inv-item";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", `${item.name}, Quantity: ${qty}`);
    el.dataset.itemId = item.id; // Store item ID for drag feedback
    el.innerHTML = `
      <img src="${item.image}" alt="${item.name}" draggable="false" />
      <div class="name">${item.name}</div>
      <div class="qty">${qty}</div>
    `;
    // pointerdown on the item itself starts a drag from inventory
    el.addEventListener("pointerdown", (ev)=>{
      ev.preventDefault();
      if((gameState.inventory[item.id] || 0) <= 0) return; // nothing to drag
      startInventoryDrag(item.id, ev, el); // Pass the element for class toggling
    });
    // Add keyboard accessibility for dragging
    el.addEventListener("keydown", (ev) => {
      if (ev.key === " " || ev.key === "Enter") {
        ev.preventDefault();
        if((gameState.inventory[item.id] || 0) <= 0) return;
        // Simulate a drag start for keyboard users (no actual drag, just selection)
        // For a full drag-and-drop with keyboard, more complex logic would be needed.
        // For now, this just provides visual feedback.
        el.classList.add('dragging');
        // In a real scenario, you'd likely open a modal or activate a "placement" mode
        // that allows the user to select a tile with arrow keys and press enter to place.
        // For this task, we'll just add the visual cue.
        setTimeout(() => {
          el.classList.remove('dragging');
        }, 1000); // Remove feedback after a short delay
      }
    });
    inventoryList.appendChild(el);
  });
  
  // DEBUG: Log container and content dimensions for scrolling validation
  setTimeout(() => {
    const containerWidth = inventoryList.clientWidth;
    const scrollWidth = inventoryList.scrollWidth;
    const itemCount = inventoryList.children.length;
    console.log(`[DEBUG] Inventory container: ${containerWidth}px wide, content: ${scrollWidth}px wide, items: ${itemCount}, needs scroll: ${scrollWidth > containerWidth}`);
  }, 100);
  
  // redraw canvas to reflect any state change
  draw();
}

/* --------- Inventory drag logic (pointer events) --------- */
function startInventoryDrag(itemId, ev, element){
  // lifecycle debug
  console.debug("[drag:start]", { itemId, clientX: ev.clientX, clientY: ev.clientY, pointerId: ev.pointerId });
  // prevent default (avoid native drag) and capture pointer on the inventory element
  ev.preventDefault();
  pointerIdActive = ev.pointerId;
  // mark inventory drag active so in-canvas cursor won't render
  inventoryDragActive = true;
  draggingInventoryItem = { itemId, clientX: ev.clientX, clientY: ev.clientY, element, captured: false };
  element.classList.add('dragging'); // Add dragging class (visual)
  // Prefer capturing on the element we passed (robust across inner image clicks)
  try {
    if (typeof element.setPointerCapture === "function") {
      element.setPointerCapture(pointerIdActive);
      draggingInventoryItem.captured = true;
    } else if (typeof ev.target.setPointerCapture === "function") {
      ev.target.setPointerCapture(pointerIdActive);
      draggingInventoryItem.captured = true;
    }
  } catch (e) {
    console.debug("[drag:start] setPointerCapture failed", e);
  }
  // attach global move/up/cancel handlers for robustness
  window.addEventListener("pointermove", inventoryPointerMove);
  window.addEventListener("pointerup", inventoryPointerUp);
  window.addEventListener("pointercancel", inventoryPointerCancel);
  draw();
}

function inventoryPointerMove(ev){
  if(!draggingInventoryItem) return;
  if(ev.pointerId !== pointerIdActive) return;
  // update pointer coordinates used for preview
  draggingInventoryItem.clientX = ev.clientX;
  draggingInventoryItem.clientY = ev.clientY;
  // debug movement (minimal)
  console.debug("[drag:move]", { pointerId: ev.pointerId, x: ev.clientX, y: ev.clientY });
  // show drag cursor by redrawing
  draw();
}

function inventoryPointerUp(ev){
  if(!draggingInventoryItem) return;
  if(ev.pointerId !== pointerIdActive) return;
  console.debug("[drag:up]", { pointerId: ev.pointerId, clientX: ev.clientX, clientY: ev.clientY });
 
  // If pointer is over canvas, attempt to plant
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX;
  const y = ev.clientY;
  if(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom){
    // translate to canvas coordinates (account for high-DPI via canvas width/height vs CSS rect)
    const canvasX = (x - rect.left) * (canvas.width / rect.width);
    const canvasY = (y - rect.top) * (canvas.height / rect.height);
    const { ix, iy } = screenToIso(canvasX, canvasY);
    if(ix >=0 && iy >=0 && ix < gridCols && iy < gridRows){
      const success = plantAtTile(ix, iy, draggingInventoryItem.itemId);
      if(success){
        // plantAtTile already decremented inventory and saved
      } else {
        // planting failed (occupied), do nothing
      }
    }
  }
  // release pointer capture on the original element if we captured it
  try{
    if (draggingInventoryItem && draggingInventoryItem.element && typeof draggingInventoryItem.element.releasePointerCapture === "function" && draggingInventoryItem.captured) {
      draggingInventoryItem.element.releasePointerCapture(pointerIdActive);
      console.debug("[drag:up] released pointer capture on element");
    } else {
      // fallback: try release on elementFromPoint if present
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      if(el && typeof el.releasePointerCapture === "function"){
        el.releasePointerCapture(pointerIdActive);
        console.debug("[drag:up] released pointer capture via elementFromPoint");
      }
    }
  }catch(e){
    console.debug("[drag:up] releasePointerCapture failed", e);
  }
  // cleanup visuals and state
  if (draggingInventoryItem && draggingInventoryItem.element) {
    draggingInventoryItem.element.classList.remove('dragging'); // Remove dragging class
  }
  // remove global handlers
  window.removeEventListener("pointermove", inventoryPointerMove);
  window.removeEventListener("pointerup", inventoryPointerUp);
  window.removeEventListener("pointercancel", inventoryPointerCancel);
  // reset state
  draggingInventoryItem = null;
  pointerIdActive = null;
  inventoryDragActive = false;
  draw();
  saveGame();
  updateInventoryUI();
}

/* pointercancel handler: ensure cleanup if OS/browser cancels pointer */
function inventoryPointerCancel(ev){
  if(!draggingInventoryItem) return;
  if(ev.pointerId !== pointerIdActive) return;
  console.debug("[drag:cancel]", { pointerId: ev.pointerId });
  try{
    if (draggingInventoryItem && draggingInventoryItem.element && typeof draggingInventoryItem.element.releasePointerCapture === "function" && draggingInventoryItem.captured) {
      draggingInventoryItem.element.releasePointerCapture(pointerIdActive);
      console.debug("[drag:cancel] released pointer capture on element");
    }
  }catch(e){
    console.debug("[drag:cancel] releasePointerCapture failed", e);
  }
  if (draggingInventoryItem && draggingInventoryItem.element) {
    draggingInventoryItem.element.classList.remove('dragging');
  }
  window.removeEventListener("pointermove", inventoryPointerMove);
  window.removeEventListener("pointerup", inventoryPointerUp);
  window.removeEventListener("pointercancel", inventoryPointerCancel);
  draggingInventoryItem = null;
  pointerIdActive = null;
  inventoryDragActive = false;
  draw();
}

/* --------- Draggable seed cursor (original in-canvas cursor) --------- */
let seedCursor = { x: 200, y: 200, radius:12, startX:200, startY:200, isDragging:false };

/* --------- Mouse helpers and grid math --------- */
function getMousePos(evt){
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return { x:(evt.clientX - rect.left)*scaleX, y:(evt.clientY-rect.top)*scaleY };
}
function isoToScreen(ix, iy){
  // Use the current canvas center for proper centering, but maintain stability during transitions
  const centerX = canvas.width/2;
  return { x:(ix - iy) * tileWidth / 2 + centerX, y:(ix + iy) * tileHeight / 2 + gridOffsetY };
}
function screenToIso(x,y){
  const centerX = canvas.width/2;
  const cx = x - centerX;
  const cy = y - gridOffsetY;
  const ix = Math.floor((cy / tileHeight + cx / tileWidth));
  const iy = Math.floor((cy / tileHeight - cx / tileWidth));
  return { ix, iy };
}

/* --------- Drawing --------- */
function drawGroundTextures() {
  // Only draw grass texture if image is loaded
  if (!grassImage.complete || !grassImage.naturalWidth) return;
  
  for(let i = 0; i < gridCols; i++) {
    for(let j = 0; j < gridRows; j++) {
      const {x, y} = isoToScreen(i, j);
      
      // Create a diamond-shaped clipping path for the isometric tile
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + tileWidth/2, y + tileHeight/2);
      ctx.lineTo(x, y + tileHeight);
      ctx.lineTo(x - tileWidth/2, y + tileHeight/2);
      ctx.closePath();
      ctx.clip();
      
      // Draw the grass texture to fill the diamond shape
      // Scale the grass texture to fit the tile
      const textureWidth = tileWidth * 1.2; // Slight overlap to avoid gaps
      const textureHeight = tileHeight * 1.2;
      ctx.drawImage(
        grassImage,
        x - textureWidth/2,
        y - textureHeight/4,
        textureWidth,
        textureHeight
      );
      
      ctx.restore();
    }
  }
}

function drawGrid(){
  // Make grid lines more subtle - lighter color and thinner lines
  ctx.strokeStyle = "rgba(34, 139, 34, 0.3)"; // 30% opacity green
  ctx.lineWidth = 0.5;
  for(let i=0;i<gridCols;i++){
    for(let j=0;j<gridRows;j++){
      const {x,y} = isoToScreen(i,j);
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(x+tileWidth/2, y+tileHeight/2);
      ctx.lineTo(x, y+tileHeight);
      ctx.lineTo(x-tileWidth/2, y+tileHeight/2);
      ctx.closePath();
      ctx.stroke();
    }
  }
}
function getPlantStage(plant) {
  const elapsed = Date.now() - plant.plantedAt;
  const durations = DEFAULT_STAGE_DURATIONS[plant.type];
  if (!durations) return "unknown";

  if (elapsed < durations.seedling) {
    return "seedling";
  } else if (elapsed < durations.seedling + durations.plant) {
    return "plant";
  } else {
    // Mark as discovered when it reaches mature stage for first time
    if (!gameState.discoveredTrees.includes(plant.type)) {
      gameState.discoveredTrees.push(plant.type);
      saveGame(); // Save when a new tree is discovered
      console.log(`🌳 Tree discovered: ${plant.type}`);
    }
    return "mature";
  }
}

function getTimeToNextStage(plant) {
  const elapsed = Date.now() - plant.plantedAt;
  const durations = DEFAULT_STAGE_DURATIONS[plant.type];
  if (!durations) return 0;

  const currentStage = getPlantStage(plant);
  let timeToNext = 0;

  if (currentStage === "seedling") {
    timeToNext = durations.seedling - elapsed;
  } else if (currentStage === "plant") {
    timeToNext = (durations.seedling + durations.plant) - elapsed;
  } else {
    return 0; // Already mature
  }
  return Math.max(0, timeToNext);
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function drawInfoBox(x, y, plant) {
  const padding = 8;
  const lineHeight = 16;
  const boxWidth = 120;
  const boxHeight = lineHeight * 3 + padding * 2;
  
  // Position box above the plant
  const boxX = x - boxWidth/2;
  const boxY = y - boxHeight - 20;
  
  // Draw box background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.strokeStyle = 'rgba(34, 139, 34, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
  ctx.fill();
  ctx.stroke();
  
  // Draw text
  ctx.fillStyle = '#222';
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  const textX = boxX + padding;
  let textY = boxY + padding;
  
  // Plant type
  const item = ITEMS[plant.type];
  ctx.fillText(item ? item.name.replace(" Seed", " Tree") : "Unknown Tree", textX, textY);
  textY += lineHeight;
  
  // Growth stage
  const stage = getPlantStage(plant);
  ctx.fillText(stage.charAt(0).toUpperCase() + stage.slice(1), textX, textY);
  textY += lineHeight;
  
  // Time remaining
  const timeRemaining = getTimeToNextStage(plant);
  if (timeRemaining > 0) {
    ctx.fillText(`Next stage: ${formatTime(timeRemaining)}`, textX, textY);
  } else {
    ctx.fillText("Mature", textX, textY);
  }
}

function drawPlanted(){
  // Sort plants by isometric depth (back-to-front rendering)
  const sortedPlants = [...gameState.plants].sort((a, b) => {
    return (a.ix + a.iy) - (b.ix + b.iy);
  });
  
  for(const p of sortedPlants){
    const stage = getPlantStage(p);
    const item = ITEMS[p.type];
    const plantImage = itemImages[`${p.type}_${stage}`];

    let imgWidth, imgHeight, renderX, renderY;

    let groundY; // Define groundY for potential use in Yggdrasil rendering
    
    if(isYggdrasil(p.type)) {
      // Special handling for Yggdrasil - horizontal center of 2×2 area
      const centerX = p.ix + 0.5;  // Center X of 2×2 area for horizontal positioning
      const centerY = p.iy + 0.5;  // Center Y of 2×2 area for horizontal positioning
      const centerPos = isoToScreen(centerX, centerY);
      renderX = centerPos.x;
      
      // Ground anchor at bottom of bottom-right tile (ix+1, iy+1)
      const groundAnchor = isoToScreen(p.ix + 1, p.iy + 1);
      groundY = groundAnchor.y;

      // Yggdrasil special sizing - Reduced proportions but still impressive, PROPERLY GROUNDED
      if (stage === "seedling") {
        imgWidth = tileWidth * 1.2;   // Smaller width for seedling
        imgHeight = tileHeight * 2.2; // Reasonable height
      } else if (stage === "plant") {
        imgWidth = tileWidth * 1.8;   // More modest width
        imgHeight = tileHeight * 3.8; // Good height for sprout
      } else if (stage === "mature") {
        // Mature Yggdrasil - Impressive but properly proportioned and GROUNDED
        imgWidth = tileWidth * 2.8;   // Reasonable width for 2×2 footprint
        imgHeight = tileHeight * 6.0; // Tall but not overwhelming
      }
    } else {
      // Regular single-tile plant rendering
      const {x,y} = isoToScreen(p.ix, p.iy);
      renderX = x;
      renderY = y;

      // choose size by stage for regular plants
      if (stage === "seedling") {
        imgWidth = tileWidth * 0.5;
        imgHeight = tileHeight * 0.9;
      } else if (stage === "plant") {
        imgWidth = tileWidth * 1.1;
        imgHeight = tileHeight * 1.9;
      } else if (stage === "mature") {
        imgWidth = tileWidth * 1.6;
        imgHeight = tileHeight * 3.0;
      }
    }

    // Draw subtle shadow under the plant first (skip for Yggdrasil)
    if(!isYggdrasil(p.type)) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.ellipse(
        renderX,
        renderY + tileHeight/2 + Math.max(2, imgHeight * 0.05),
        imgWidth * 0.245,
        imgHeight * 0.06,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    if (plantImage && plantImage.complete && plantImage.naturalWidth) {
      // Draw sprite anchored to tile bottom-center - SPECIAL ANCHORING FOR YGGDRASIL
      if(isYggdrasil(p.type)) {
        // For Yggdrasil, anchor to ground at bottom of 2×2 area
        let yOffset = 0;
        if (stage === "mature") {
          yOffset = 80; // Push mature Yggdrasil down even further
        }
        ctx.drawImage(
          plantImage,
          renderX - imgWidth / 2,
          groundY - imgHeight + yOffset,
          imgWidth,
          imgHeight
        );
      } else {
        // Regular trees use standard anchoring
        ctx.drawImage(
          plantImage,
          renderX - imgWidth / 2,
          renderY + tileHeight - imgHeight,
          imgWidth,
          imgHeight
        );
      }
    } else {
      // Fallback: simple shape + color indicating stage
      ctx.beginPath();
      ctx.arc(renderX, renderY + tileHeight/2, Math.max(6, imgWidth * 0.18), 0, Math.PI*2);
      switch(stage) {
        case "seedling":
          ctx.fillStyle = isYggdrasil(p.type) ? "#FFD700" : "#9BE79B"; // Golden for Yggdrasil
          break;
        case "plant":
          ctx.fillStyle = isYggdrasil(p.type) ? "#DAA520" : "#2E8B57"; // Golden for Yggdrasil
          break;
        case "mature":
          ctx.fillStyle = isYggdrasil(p.type) ? "#B8860B" : "#0B6623"; // Golden for Yggdrasil
          break;
        default:
          ctx.fillStyle = isYggdrasil(p.type) ? "#FFD700" : "darkgreen";
      }
     ctx.fill();

      // small vertical marker to suggest trunk
      ctx.beginPath();
      ctx.fillStyle = "#6b4e2a";
      const trunkWidth = isYggdrasil(p.type) ? 4 : 2; // Thicker trunk for Yggdrasil
      ctx.fillRect(renderX - trunkWidth/2, renderY + tileHeight/2 - (imgHeight * 0.2), trunkWidth, imgHeight * 0.2);
    }
  }
}
function drawSeedCursor(){
  // If user is dragging an item from inventory, draw its image at that pointer
  if(draggingInventoryItem){
    const { clientX, clientY, itemId } = draggingInventoryItem;
    const rect = canvas.getBoundingClientRect();
    
    // Only draw if over canvas; otherwise draw on page so user sees it
    const drawX = clientX - rect.left;
    const drawY = clientY - rect.top;
    // use canvas scaling
    const canvasX = drawX * (canvas.width / rect.width);
    const canvasY = drawY * (canvas.height / rect.height);

    // draw item image if available from our new itemImages registry
    const item = ITEMS[itemId];
    const itemImage = itemImages[itemId];
    
    if(item && itemImage && itemImage.complete && itemImage.naturalWidth){
      ctx.drawImage(itemImage, canvasX - 16, canvasY - 16, 32, 32);
    } else {
      // fallback brown circle if image not available
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 10, 0, Math.PI*2);
      ctx.fillStyle = "brown";
      ctx.fill();
    }
    return;
  }

  // In-canvas cursor disabled - only use inventory drag functionality
  // if(!inventoryDragActive && !seedCursor.isDragging) {
  //   const hasAnySeed = Object.values(gameState.inventory).some(qty => qty > 0);
  //   if(hasAnySeed) {
  //     ctx.beginPath();
  //     ctx.arc(seedCursor.x, seedCursor.y, seedCursor.radius, 0, Math.PI*2);
  //     ctx.fillStyle = "brown";
  //     ctx.fill();
  //   }
  // }
}

/* --------- Yggdrasil helper functions --------- */
function isYggdrasil(plantType) {
  return plantType === "yggdrasil_seed";
}

function getYggdrasilOccupiedTiles(ix, iy) {
  // Yggdrasil occupies a 2×2 area with the planted tile as bottom-left
  return [
    { ix: ix, iy: iy },         // bottom-left (planted position)
    { ix: ix + 1, iy: iy },     // bottom-right
    { ix: ix, iy: iy + 1 },     // top-left
    { ix: ix + 1, iy: iy + 1 }  // top-right
  ];
}

function isAnyTileOccupied(tiles) {
  return tiles.some(tile =>
    gameState.plants.some(p => p.ix === tile.ix && p.iy === tile.iy) ||
    gameState.plants.some(p => p.occupiedTiles && p.occupiedTiles.some(ot => ot.ix === tile.ix && ot.iy === tile.iy))
  );
}

function draw(){
  ctx.fillStyle = "#eef9ee";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawGroundTextures(); // Draw grass textures first
  drawGrid(); // Then draw subtle grid lines over textures
  drawPlanted();
  drawSeedCursor();
  drawHoverInfo();
}

/* --------- Planting (multi-type) --------- */
function plantAtTile(ix, iy, itemId){
  // check inventory first
  if((gameState.inventory[itemId] || 0) <= 0) return false;
  
  if(isYggdrasil(itemId)) {
    // For Yggdrasil, check if we can place it in a 2×2 area
    // Ensure the 2×2 area fits within the grid
    if(ix + 1 >= gridCols || iy + 1 >= gridRows) return false;
    
    const occupiedTiles = getYggdrasilOccupiedTiles(ix, iy);
    
    // Check if any of the tiles are already occupied
    if(isAnyTileOccupied(occupiedTiles)) return false;
    
    // consume inventory
    gameState.inventory[itemId] = Math.max(0, (gameState.inventory[itemId]||0)-1);
    
    // Plant Yggdrasil with occupied tiles data
    gameState.plants.push({
      ix,
      iy,
      type: itemId,
      plantedAt: Date.now(),
      occupiedTiles: occupiedTiles,
      isMultiTile: true
    });
  } else {
    // Regular single-tile plant
    // prevent duplicates
    if(gameState.plants.some(p=>p.ix===ix && p.iy===iy)) return false;
    // Also check if this tile is occupied by a multi-tile plant
    if(gameState.plants.some(p => p.occupiedTiles && p.occupiedTiles.some(ot => ot.ix === ix && ot.iy === iy))) return false;
    
    // consume inventory
    gameState.inventory[itemId] = Math.max(0, (gameState.inventory[itemId]||0)-1);
    gameState.plants.push({ ix, iy, type: itemId, plantedAt: Date.now() });
  }
  
  saveGame();
  return true;
}

/* --------- Inventory toggle UI handling --------- */
invToggle.addEventListener("click", ()=>{
  isInvExpanded = !isInvExpanded;
  invBar.classList.toggle("expanded", isInvExpanded);
  invBar.classList.toggle("collapsed", !isInvExpanded);
  invPanel.classList.toggle("hidden", !isInvExpanded);
  // Lock/unlock movement when inventory opens/closes
  isMovementLocked = isInvExpanded;
  // reposition canvas bounds via resizeCanvas
  resizeCanvas();
});

/* --------- Cheat buttons --------- */
addSeedBtn.addEventListener("click", ()=>{
  gameState.inventory.oak_seed = (gameState.inventory.oak_seed||0) + 1;
  saveGame(); updateInventoryUI();
});
removeSeedBtn.addEventListener("click", ()=>{
  gameState.inventory.oak_seed = Math.max(0, (gameState.inventory.oak_seed||0)-1);
  saveGame(); updateInventoryUI();
});
addYggdrasilSeedBtn.addEventListener("click", ()=>{
  gameState.inventory.yggdrasil_seed = (gameState.inventory.yggdrasil_seed||0) + 1;
  saveGame(); updateInventoryUI();
});
removeYggdrasilSeedBtn.addEventListener("click", ()=>{
  gameState.inventory.yggdrasil_seed = Math.max(0, (gameState.inventory.yggdrasil_seed||0)-1);
  saveGame(); updateInventoryUI();
});
addWillowSeedBtn.addEventListener("click", ()=>{
  gameState.inventory.willow_seed = (gameState.inventory.willow_seed||0) + 1;
  saveGame(); updateInventoryUI();
});
removeWillowSeedBtn.addEventListener("click", ()=>{
  gameState.inventory.willow_seed = Math.max(0, (gameState.inventory.willow_seed||0)-1);
  saveGame(); updateInventoryUI();
});
addMapleSeedBtn.addEventListener("click", ()=>{
  gameState.inventory.maple_seed = (gameState.inventory.maple_seed||0) + 1;
  saveGame(); updateInventoryUI();
});
removeMapleSeedBtn.addEventListener("click", ()=>{
  gameState.inventory.maple_seed = Math.max(0, (gameState.inventory.maple_seed||0)-1);
  saveGame(); updateInventoryUI();
});
addSpruceSeedBtn.addEventListener("click", ()=>{
  gameState.inventory.spruce_seed = (gameState.inventory.spruce_seed||0) + 1;
  saveGame(); updateInventoryUI();
});
removeSpruceSeedBtn.addEventListener("click", ()=>{
  gameState.inventory.spruce_seed = Math.max(0, (gameState.inventory.spruce_seed||0)-1);
  saveGame(); updateInventoryUI();
});

clearSaveBtn.addEventListener("click", ()=>{
  localStorage.removeItem(SAVE_KEY);
  // Initialize inventory for all known items
  const initialInventory = {};
  Object.keys(ITEMS).forEach(id => { initialInventory[id] = 0; });
  gameState = { inventory: initialInventory, plants: [], settings:{ gridOffsetY } };
  saveGame(); updateInventoryUI(); draw();
});

// Tree removal mode toggle button
removeTreeBtn.addEventListener("click", ()=>{
  isTreeRemovalMode = !isTreeRemovalMode;
  removeTreeBtn.textContent = `Remove Tree Mode: ${isTreeRemovalMode ? 'ON' : 'OFF'}`;
  if (isTreeRemovalMode) {
    removeTreeBtn.style.backgroundColor = '#ff6b6b';
    removeTreeBtn.style.color = 'white';
  } else {
    removeTreeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    removeTreeBtn.style.color = '#2b4a80';
  }
  console.log(`Tree removal mode: ${isTreeRemovalMode ? 'ON' : 'OFF'}`);
});

/* --------- Canvas pointer events (with movement locking) --------- */
canvas.addEventListener("pointerdown", (ev)=>{
  // if inventory drag is active or movement is locked, ignore in-canvas pointerdown
  if(inventoryDragActive || isMovementLocked) return;
  const pos = getMousePos(ev);
  const dx = pos.x - seedCursor.x, dy = pos.y - seedCursor.y;
  if(Math.sqrt(dx*dx+dy*dy) < seedCursor.radius && (gameState.inventory.oak_seed||0) > 0){
    seedCursor.isDragging = true;
    seedCursor.offsetX = dx;
    seedCursor.offsetY = dy;
  }
});
canvas.addEventListener("pointermove", (ev)=>{
  // Allow hover info even when movement is locked
  if(!inventoryDragActive) {
    const pos = getMousePos(ev);
    const { ix, iy } = screenToIso(pos.x, pos.y);
    if(ix >= 0 && ix < gridCols && iy >= 0 && iy < gridRows) {
      hoveredTile = { ix, iy };
    } else {
      hoveredTile = null;
    }
    draw(); // refresh display
  }

  // Prevent seed cursor dragging when movement is locked
  if(seedCursor.isDragging && !isMovementLocked){
    const pos = getMousePos(ev);
    seedCursor.x = pos.x - seedCursor.offsetX;
    seedCursor.y = pos.y - seedCursor.offsetY;
    draw();
    return;
  }
});
canvas.addEventListener("pointerleave", ()=>{
  hoveredTile = null;
  if(hoverUpdateInterval) {
    clearInterval(hoverUpdateInterval);
    hoverUpdateInterval = null;
  }
  draw();
});

function drawHoverInfo(){
  if(!hoveredTile) return;
  const plant = gameState.plants.find(p => p.ix === hoveredTile.ix && p.iy === hoveredTile.iy);
  if(!plant) return;
  
  const {x,y} = isoToScreen(hoveredTile.ix, hoveredTile.iy);
  
  // Draw semi-transparent info box
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  
  const boxWidth = 120;
  const boxHeight = 60;
  const boxX = x - boxWidth/2;
  const boxY = y - boxHeight - 20;
  
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
  ctx.fill();
  ctx.stroke();
  
  // Draw text
  ctx.fillStyle = "white";
  ctx.font = "14px system-ui";
  ctx.textAlign = "center";
  const item = ITEMS[plant.type];
  const plantName = item ? item.name.replace(" Seed", " Tree") : "Unknown Tree";
  const stage = getPlantStage(plant);
  const timeToNext = getTimeToNextStage(plant);

  ctx.fillText(plantName, x, boxY + 20);
  if (timeToNext > 0) {
    ctx.fillText(`${stage.charAt(0).toUpperCase() + stage.slice(1)} (${formatTime(timeToNext)})`, x, boxY + 40);
  } else {
    ctx.fillText("Mature", x, boxY + 40);
  }
  
  // Start hover updates if needed
  if(!hoverUpdateInterval) {
    hoverUpdateInterval = setInterval(()=>{ draw(); }, 1000);
  }
  
  ctx.restore();
}

canvas.addEventListener("pointerup", (ev)=>{
  // Check if we're in tree removal mode first
  if (isTreeRemovalMode && !isMovementLocked && !inventoryDragActive) {
    const pos = getMousePos(ev);
    const { ix, iy } = screenToIso(pos.x, pos.y);
    
    if (ix >= 0 && ix < gridCols && iy >= 0 && iy < gridRows) {
      const success = removeTreeAtTile(ix, iy);
      if (success) {
        console.log(`Tree removed at tile (${ix}, ${iy}) via button mode`);
      }
    }
    return;
  }
  
  if(!seedCursor.isDragging || isMovementLocked) return;
  seedCursor.isDragging = false;
  const pos = getMousePos(ev);
  const { ix, iy } = screenToIso(pos.x,pos.y);
  if(ix>=0 && iy>=0 && ix<gridCols && iy<gridRows){
    // When dropping from the in-canvas cursor, we need to decide which seed type to plant.
    // For now, let's assume it's an oak_seed if no specific item is being dragged from inventory.
    // This part might need more sophisticated logic later if we introduce a "selected seed" concept.
    const success = plantAtTile(ix,iy,"oak_seed"); // Default to oak_seed for in-canvas drag
    if(success){
      seedCursor.x = seedCursor.startX; seedCursor.y = seedCursor.startY;
    } else {
      seedCursor.x = seedCursor.startX; seedCursor.y = seedCursor.startY;
    }
    updateInventoryUI();
    draw();
  } else {
    seedCursor.x = seedCursor.startX; seedCursor.y = seedCursor.startY;
    draw();
  }
});

/* --------- Tree removal functionality --------- */
function removeTreeAtTile(ix, iy) {
  // Find the plant at the specified tile
  let plantIndex = -1;
  let plant = null;
  
  // Check if there's a plant at this exact tile
  for (let i = 0; i < gameState.plants.length; i++) {
    const p = gameState.plants[i];
    if (p.ix === ix && p.iy === iy) {
      plantIndex = i;
      plant = p;
      break;
    }
    // Also check if this tile is occupied by a multi-tile plant (like Yggdrasil)
    if (p.occupiedTiles) {
      for (const tile of p.occupiedTiles) {
        if (tile.ix === ix && tile.iy === iy) {
          plantIndex = i;
          plant = p;
          break;
        }
      }
      if (plant) break;
    }
  }
  
  if (plantIndex === -1) return false; // No plant found
  
  // Check if this tree was mature (discovered) before removal
  const wasDiscovered = gameState.discoveredTrees.includes(plant.type);
  const currentStage = getPlantStage(plant);
  const isMature = currentStage === "mature";
  
  // Return the seed to inventory
  gameState.inventory[plant.type] = (gameState.inventory[plant.type] || 0) + 1;
  
  // Remove the plant from the game
  gameState.plants.splice(plantIndex, 1);
  
  // TreeDex behavior logic:
  // - If tree was never matured AND this was the only tree of this type, remove from discovered list
  // - If tree was matured at some point, keep it in discovered list (even if this specific tree wasn't mature)
  if (!isMature && !wasDiscovered) {
    // Check if there are any other trees of this type that might have been discovered
    const hasOtherMatureTrees = gameState.plants.some(p =>
      p.type === plant.type && getPlantStage(p) === "mature"
    );
    
    if (!hasOtherMatureTrees) {
      // Remove from discovered trees if this was the only one and it was never matured
      const discoveryIndex = gameState.discoveredTrees.indexOf(plant.type);
      if (discoveryIndex > -1) {
        gameState.discoveredTrees.splice(discoveryIndex, 1);
        console.log(`🚫 Tree undiscovered: ${plant.type} (was not mature)`);
      }
    }
  }
  
  // Save game state and update UI
  saveGame();
  updateInventoryUI();
  draw();
  
  const statusMsg = wasDiscovered || isMature ? "(TreeDex kept)" : "(TreeDex removed)";
  console.log(`Removed ${plant.type} at (${ix}, ${iy}) and returned seed to inventory ${statusMsg}`);
  return true;
}

// Add right-click functionality to remove trees (only when removal mode is ON)
canvas.addEventListener("contextmenu", (ev) => {
  ev.preventDefault(); // Always prevent default context menu
  
  // Only allow tree removal via right-click when removal mode is enabled
  if (!isTreeRemovalMode || inventoryDragActive || isMovementLocked) return;
  
  const pos = getMousePos(ev);
  const { ix, iy } = screenToIso(pos.x, pos.y);
  
  if (ix >= 0 && ix < gridCols && iy >= 0 && iy < gridRows) {
    const success = removeTreeAtTile(ix, iy);
    if (success) {
      console.log(`Tree removed at tile (${ix}, ${iy}) via right-click`);
    }
  }
});

/* --------- Resize canvas (account for bottom inventory and right panel) --------- */
function resizeCanvas(){
  const bottomH = isInvExpanded ? bottomPanelHeightExpanded : bottomPanelHeightCollapsed;
  const rightW = rightPanelWidth;
  
  // Calculate left offset for inventory with better space management
  let leftW;
  if (isInvExpanded) {
    // Ensure minimum canvas width of 400px for gameplay while giving inventory enough space
    const minCanvasWidth = 400;
    const maxInventoryWidth = window.innerWidth - rightW - minCanvasWidth;
    const inventoryWidth = Math.min(window.innerWidth * 0.45, Math.min(500, maxInventoryWidth)); // Increased to 45% and 500px
    leftW = inventoryWidth + 20;
  } else {
    leftW = 160; // collapsed buffer
  }
  
  canvas.style.left = leftW + "px";
  canvas.style.right = rightW + "px";
  canvas.style.bottom = bottomH + "px";

  // compute CSS pixel size for canvas
  const cssWidth = window.innerWidth - rightW - leftW;
  const cssHeight = window.innerHeight - bottomH;
  canvas.width = Math.max(100, Math.floor(cssWidth * devicePixelRatio));
  canvas.height = Math.max(100, Math.floor(cssHeight * devicePixelRatio));
  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";

  // scale tile sizes similar to your earlier logic
  const scaleFactor = Math.min(canvas.width / (1200*devicePixelRatio), canvas.height / (800*devicePixelRatio));
  tileWidth = baseTileWidth * Math.max(0.5, scaleFactor);
  tileHeight = baseTileHeight * Math.max(0.5, scaleFactor);
  
  // Debug logging
  console.log(`Canvas layout: leftW=${leftW}px, rightW=${rightW}px, canvasWidth=${cssWidth}px, canvasCenter=${canvas.width/2}, expanded=${isInvExpanded}`);
  draw();
}
window.addEventListener("resize", resizeCanvas);

/* --------- Boot: preload assets, load save, render UI --------- */
async function init(){
  loadGame();
  // ensure items exist in inventory map
  Object.keys(ITEMS).forEach(id => { if(!(id in gameState.inventory)) gameState.inventory[id] = gameState.inventory[id]||0; });
  
  // Preload images
  try {
    await preloadItemImages(); // Load all item images
    await preloadImage(grassImage); // Preload grass texture
  } catch(e) {
    console.warn("Image preload failed:", e);
  }
  
  updateInventoryUI();
  // Initial resize to establish stable coordinates
  resizeCanvas();
  draw();
  
  console.log("Game initialized with stable coordinate system");
}

init();

