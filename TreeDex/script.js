// Mapping between Forest seed types and TreeDex entries
const SEED_TO_TREEDX_MAP = {
    'oak_seed': 1,
    'birch_seed': 2,
    'spruce_seed': 3,
    'cedar_seed': 4,
    'willow_seed': 5,
    'maple_seed': 6,
    'acacia_seed': 7,
    'silkfloss_seed': 8,
    'ghostgum_seed': 9,
    'socotradragon_seed': 10,
    'ginkgo_seed': 11,
    'monkeypuzzle_seed': 12,
    'rainboweucalyptus_seed': 13,
    'baobab_seed': 14,
    'fertility_seed': 15,
    'yggdrasil_seed': 16
};

// Function to check if a tree is unlocked based on Forest save data
function isTreeUnlocked(treeId) {
    try {
        // Get Forest save data
        const forestSaveKey = "isoFarm_v1";
        const forestData = JSON.parse(localStorage.getItem(forestSaveKey) || '{}');
        
        if (!forestData.plants || !Array.isArray(forestData.plants)) {
            return false;
        }
        
        // Find the corresponding seed type for this tree
        const seedType = Object.keys(SEED_TO_TREEDX_MAP).find(
            seed => SEED_TO_TREEDX_MAP[seed] === treeId
        );
        
        if (!seedType) {
            return false;
        }
        
        // Check if any plant of this type has reached mature stage
        const maturePlants = forestData.plants.filter(plant => {
            if (plant.type !== seedType) return false;
            
            // Calculate plant stage based on Forest logic
            const elapsed = Date.now() - plant.plantedAt;
            const durations = {
                seedling: 5000, // 5 seconds (matches Forest DEFAULT_STAGE_DURATIONS)
                plant: 5000     // 5 seconds
            };
            
            // Plant is mature if elapsed time exceeds both seedling and plant stages
            return elapsed >= (durations.seedling + durations.plant);
        });
        
        return maturePlants.length > 0;
    } catch (e) {
        console.warn('Error checking tree unlock status:', e);
        return false;
    }
}

// Tree data structure
const treeData = [
    {
        id: 1,
        name: "01 Oak Tree",
        scientificName: "Quercus spp.",
        nativeRange: "Northern Hemisphere",
        rarity: "Common",
        description: "Oaks are symbols of strength and endurance. With thousands of species across the globe, their acorns sustain countless animals, while their timber has supported human civilization for centuries.",
        seedImage: "assets/seed/1commonSeed.png",
        sproutImage: "assets/sprout/01oakSprout.png",
        treeImage: "assets/tree/01oakTree.png",
        get collected() { return isTreeUnlocked(1); }
    },
    {
        id: 2,
        name: "02 Birch Tree",
        scientificName: "Betula spp.",
        nativeRange: "Northern Temperate Regions",
        rarity: "Common",
        description: "Recognized by its papery white bark, the birch is one of the first trees to colonize cleared land. Its resilience and beauty make it a favorite in folklore, where it symbolizes renewal and protection.",
        seedImage: "assets/seed/1commonSeed.png",
        sproutImage: "assets/sprout/02birchSprout.png",
        treeImage: "assets/tree/02birchTree.png",
        get collected() { return isTreeUnlocked(2); }
    },
    {
        id: 3,
        name: "03 Spruce Tree",
        scientificName: "Picea spp.",
        nativeRange: "Northern Temperate and Boreal Regions",
        rarity: "Common",
        description: "With tall, conical forms and needle-like leaves, spruces dominate boreal forests. They are prized for timber, paper, and even as Christmas trees, bringing both utility and festivity.",
        seedImage: "assets/seed/1commonSeed.png",
        sproutImage: "assets/sprout/03spruceSprout.png",
        treeImage: "assets/tree/03spruceTree.png",
        get collected() { return isTreeUnlocked(3); }
    },
    {
        id: 4,
        name: "04 Cedar Tree",
        scientificName: "Cedrus spp.",
        nativeRange: "Mediterranean, Western Himalayas",
        rarity: "Common",
        description: "Cedars are evergreen conifers known for their aromatic wood, resistant to decay. Revered in ancient cultures, they were used in temples, ships, and sacred rituals.",
        seedImage: "assets/seed/1commonSeed.png",
        sproutImage: "assets/sprout/04cedarSprout.png",
        treeImage: "assets/tree/04cedarTree.png",
        get collected() { return isTreeUnlocked(4); }
    },
    {
        id: 5,
        name: "05 Willow Tree",
        scientificName: "Salix spp.",
        nativeRange: "Temperate regions worldwide",
        rarity: "Common",
        description: "Willows are fast-growing trees with sweeping branches that lean toward rivers and lakes. Their bark was the original source of aspirin, and their form embodies themes of sorrow and resilience.",
        seedImage: "assets/seed/1commonSeed.png",
        sproutImage: "assets/sprout/05willowSprout.png",
        treeImage: "assets/tree/05willowTree.png",
        get collected() { return isTreeUnlocked(5); }
    },
    {
        id: 6,
        name: "06 Maple Tree",
        scientificName: "Acer spp.",
        nativeRange: "Asia, Europe, North America",
        rarity: "Common",
        description: "Famous for brilliant fall foliage, maples are versatile trees also tapped for their sweet sap—transformed into maple syrup. They symbolize balance and endurance in many cultures.",
        seedImage: "assets/seed/1commonSeed.png",
        sproutImage: "assets/sprout/06mapleSprout.png",
        treeImage: "assets/tree/06mapleTree.png",
        get collected() { return isTreeUnlocked(6); }
    },
    {
        id: 7,
        name: "07 Acacia Tree",
        scientificName: "Acacia spp.",
        nativeRange: "Africa, Australia, Asia",
        rarity: "Common",
        description: "Acacias thrive in hot, dry landscapes, providing shade, gum, and food for wildlife. In folklore, they represent resilience and immortality, often seen as sacred trees.",
        seedImage: "assets/seed/1commonSeed.png",
        sproutImage: "assets/sprout/07acaciaSprout.png",
        treeImage: "assets/tree/07acaciaTree.png",
        get collected() { return isTreeUnlocked(7); }
    },
    {
        id: 8,
        name: "08 Silk Floss Tree",
        scientificName: "Ceiba speciosa",
        nativeRange: "South America",
        rarity: "Rare",
        description: "Known for its thorny trunk and flamboyant blossoms, the Silk Floss tree is both beautiful and intimidating. Its seeds are wrapped in silky fibers once used for stuffing pillows.",
        seedImage: "assets/seed/2rareSeed.png",
        sproutImage: "assets/sprout/08silkflossSprout.png",
        treeImage: "assets/tree/08silkflossTree.png",
        get collected() { return isTreeUnlocked(8); }
    },
    {
        id: 9,
        name: "09 Ghost Gum Tree",
        scientificName: "Corymbia aparrerinja",
        nativeRange: "Central Australia",
        rarity: "Rare",
        description: "With its smooth white bark that glows under moonlight, the Ghost Gum holds deep significance in Aboriginal Dreamtime stories. It thrives in arid landscapes where few trees survive.",
        seedImage: "assets/seed/2rareSeed.png",
        sproutImage: "assets/sprout/09ghostgumSprout.png",
        treeImage: "assets/tree/09ghostgumTree.png",
        get collected() { return isTreeUnlocked(9); }
    },
    {
        id: 10,
        name: "10 Socotra Dragon Tree",
        scientificName: "Dracaena cinnabari",
        nativeRange: "Socotra Island, Yemen",
        rarity: "Rare",
        description: "Umbrella-shaped and alien in form, it bleeds red resin called dragon's blood, used in medicine, dye, and ritual since antiquity. A true living relic of a lost world.",
        seedImage: "assets/seed/2rareSeed.png",
        sproutImage: "assets/sprout/10socotradragonSprout.png",
        treeImage: "assets/tree/10socotradragonTree.png",
        get collected() { return isTreeUnlocked(10); }
    },
    {
        id: 11,
        name: "11 Ginkgo Tree",
        scientificName: "Ginkgo biloba",
        nativeRange: "China (ancient lineage)",
        rarity: "Rare",
        description: "A true living fossil, the Ginkgo has existed for over 200 million years — unchanged since the age of the dinosaurs. But perhaps its most awe-inspiring story comes from 1945: when the atomic bomb was dropped on Hiroshima, several Ginkgo trees near the blast site miraculously survived and sprouted again. To this day, those trees still stand, symbols of resilience, rebirth, and endurance through catastrophe.",
        seedImage: "assets/seed/2rareSeed.png",
        sproutImage: "assets/sprout/11ginkgoSprout.png",
        treeImage: "assets/tree/11ginkgoTree.png",
        get collected() { return isTreeUnlocked(11); }
    },
    {
        id: 12,
        name: "12 Monkey Puzzle Tree",
        scientificName: "Araucaria araucana",
        nativeRange: "Chile, Argentina",
        rarity: "Rare",
        description: "This prehistoric-looking tree has a distinctive symmetrical shape with sharp, scale-like leaves. It's sacred to indigenous peoples and produces edible nuts called piñones.",
        seedImage: "assets/seed/2rareSeed.png",
        sproutImage: "assets/sprout/12monkeypuzzleSprout.png",
        treeImage: "assets/tree/12monkeypuzzleTree.png",
        get collected() { return isTreeUnlocked(12); }
    },
    {
        id: 13,
        name: "13 Rainbow Eucalyptus",
        scientificName: "Eucalyptus deglupta",
        nativeRange: "Philippines, Indonesia, Papua New Guinea",
        rarity: "Rare",
        description: "Its bark peels in strips, revealing layers of green, blue, orange, and purple. The Rainbow Eucalyptus is one of the most visually striking trees on Earth, a natural masterpiece of color.",
        seedImage: "assets/seed/2rareSeed.png",
        sproutImage: "assets/sprout/13rainboweucalyptusSprout.png",
        treeImage: "assets/tree/13rainboweucalyptusTree.png",
        get collected() { return isTreeUnlocked(13); }
    },
    {
        id: 14,
        name: "14 Baobab Tree",
        scientificName: "Adansonia spp.",
        nativeRange: "Africa, Madagascar, Australia",
        rarity: "Rare",
        description: "Baobabs store thousands of liters of water in their swollen trunks, sustaining life in dry savannahs. Their gnarled forms, immense age, and mythic presence earn them a place among legendary trees.",
        seedImage: "assets/seed/2rareSeed.png",
        sproutImage: "assets/sprout/14baobabSprout.png",
        treeImage: "assets/tree/14baobabTree.png",
        get collected() { return isTreeUnlocked(14); }
    },
    {
        id: 15,
        name: "15 Fertility Tree",
        scientificName: "Samanea saman",
        nativeRange: "Central & South America; spread to Asia",
        rarity: "Goated",
        description: "At the University of the Philippines Los Baños, this Monkey Pod Tree is infamous for its reputation: couples who linger beneath it often find themselves blessed with children soon after. Whether myth or coincidence, the Fertility Tree is a campus legend, binding love and lore beneath its massive shade.",
        seedImage: "assets/seed/3goatedSeed.png",
        sproutImage: "assets/sprout/15fertilitySprout.png",
        treeImage: "assets/tree/15fertilityTree.png",
        get collected() { return isTreeUnlocked(15); }
    },
    {
        id: 16,
        name: "16 Yggdrasil",
        scientificName: "???",
        nativeRange: "???",
        rarity: "Hidden",
        description: "The eternal ash of Norse mythology, Yggdrasil's roots and branches connect all worlds. Gods gather in its shade, serpents gnaw at its roots, and an eagle watches from above. Even Ragnarok cannot destroy it, for Yggdrasil embodies the very cycle of existence.",
        seedImage: "assets/seed/4hiddenSeed.png",
        sproutImage: "assets/sprout/16yggdrasilSprout.png",
        treeImage: "assets/tree/16yggdrasilTree.png",
        get collected() { return isTreeUnlocked(16); }
    }
];

// Function to populate the tree list
function populateTreeList() {
    const treeListElement = document.querySelector('.treeList');
    treeListElement.innerHTML = ''; // Clear existing content

    treeData.filter(tree => tree.rarity !== "Hidden" || tree.collected).forEach(tree => {
        const treeItem = document.createElement('div');
        treeItem.className = 'treeItem';
        if (tree.collected) {
            treeItem.textContent = tree.name;
        } else {
            treeItem.textContent = tree.id.toString().padStart(2, '0') + ' ???';
        }
        treeItem.dataset.id = tree.id;
        treeItem.addEventListener('click', () => showTreeDetails(tree.id));
        treeListElement.appendChild(treeItem);
    });
}

// Function to display tree details
function showTreeDetails(treeId) {
    const tree = treeData.find(t => t.id === treeId);
    if (!tree) return;

    if (!tree.collected) {
        // Hide upperEntry
        document.getElementById('upperEntry').style.display = 'none';
        // Add uncollected class to treeEntries
        document.querySelector('.treeEntries').classList.add('uncollected');
        // Set description to discover message
        document.getElementById('descriptionText').textContent = 'Discover this tree to find out more';
        // Clear other texts
        document.getElementById('nameText').textContent = '';
        document.getElementById('sciNameText').textContent = '';
        document.getElementById('nativeRangeText').textContent = '';
        document.getElementById('rarityText').textContent = '';
        // Clear images
        document.querySelector('.seedStage img').src = '';
        document.querySelector('.sproutStage img').src = '';
        document.querySelector('.treeStage img').src = '';
        document.querySelector('.treeProfile img').src = '';
    } else {
        // Show upperEntry
        document.getElementById('upperEntry').style.display = 'flex';
        // Remove uncollected class
        document.querySelector('.treeEntries').classList.remove('uncollected');

        // Update the tree details display
        document.getElementById('nameText').textContent = tree.name;
        document.getElementById('sciNameText').textContent = tree.scientificName;
        document.getElementById('nativeRangeText').textContent = tree.nativeRange;
        document.getElementById('rarityText').textContent = tree.rarity;

        // Update rarity class based on rarity value
        const rarityElement = document.querySelector('.rarity');
        // Remove any existing rarity-specific classes
        rarityElement.classList.remove('rarity-common', 'rarity-rare', 'rarity-goated', 'rarity-hidden');
        // Add the new rarity-specific class
        rarityElement.classList.add(`rarity-${tree.rarity.toLowerCase()}`);

        document.getElementById('descriptionText').textContent = tree.description;

        // Update images
        document.querySelector('.seedStage img').src = tree.seedImage;
        document.querySelector('.sproutStage img').src = tree.sproutImage;
        document.querySelector('.treeStage img').src = tree.treeImage;
        document.querySelector('.treeProfile img').src = tree.treeImage;

        // Update alt text
        document.querySelector('.seedStage img').alt = tree.name.split(' ')[1] + ' Seed';
        document.querySelector('.sproutStage img').alt = tree.name.split(' ')[1] + ' Sprout';
        document.querySelector('.treeStage img').alt = tree.name.split(' ')[1] + ' Tree';
        document.querySelector('.treeProfile img').alt = tree.name.split(' ')[1] + ' Tree';
    }

    // Highlight selected item in the list
    document.querySelectorAll('.treeItem').forEach(item => {
        item.classList.remove('selected');
        if (parseInt(item.dataset.id) === treeId) {
            item.classList.add('selected');
        }
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    populateTreeList();
    // Show the first tree by default
    showTreeDetails(1);
});