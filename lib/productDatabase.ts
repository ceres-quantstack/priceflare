// Comprehensive product database with 500+ products organized by category

export interface ProductSuggestion {
  name: string;
  category: string;
}

export const PRODUCT_CATEGORIES = {
  smartphones: [
    "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14", "iPhone 13", "iPhone SE 3rd Gen",
    "Samsung Galaxy S24 Ultra", "Samsung Galaxy S24+", "Samsung Galaxy S24", "Samsung Galaxy S23 Ultra", "Samsung Galaxy S23+", "Samsung Galaxy S23", "Samsung Galaxy S23 FE", "Samsung Galaxy A54", "Samsung Galaxy A34", "Samsung Galaxy Z Fold 5", "Samsung Galaxy Z Flip 5",
    "Google Pixel 8 Pro", "Google Pixel 8", "Google Pixel 8a", "Google Pixel 7a", "Google Pixel 7 Pro", "Google Pixel 7",
    "OnePlus 12", "OnePlus 11", "OnePlus Open", "OnePlus Nord N30", "Motorola Edge+", "Motorola Razr+", "Motorola Edge 30 Pro",
    "Xiaomi 14 Pro", "Xiaomi 13T Pro", "Nothing Phone 2", "ASUS ROG Phone 7", "Sony Xperia 1 V",
  ],
  laptops: [
    "MacBook Pro 16-inch M3 Max", "MacBook Pro 14-inch M3 Pro", "MacBook Pro 14-inch M3", "MacBook Air 15-inch M3", "MacBook Air 13-inch M3", "MacBook Air 13-inch M2",
    "Dell XPS 17", "Dell XPS 15", "Dell XPS 13 Plus", "Dell XPS 13", "Dell Inspiron 16", "Dell Inspiron 15", "Dell Latitude 9440", "Dell Latitude 7440", "Dell G16 Gaming",
    "HP Spectre x360 16", "HP Spectre x360 14", "HP Envy x360 15", "HP Envy 17", "HP Pavilion Plus 14", "HP Pavilion 15", "HP EliteBook 840", "HP Omen 17", "HP Victus 15",
    "Lenovo ThinkPad X1 Carbon Gen 11", "Lenovo ThinkPad X1 Yoga", "Lenovo ThinkPad P1", "Lenovo Yoga 9i", "Lenovo Yoga 7i", "Lenovo IdeaPad Pro 5i", "Lenovo Legion Pro 7i", "Lenovo Legion 5 Pro",
    "ASUS ROG Zephyrus G16", "ASUS ROG Strix Scar 18", "ASUS ZenBook Pro 14", "ASUS ZenBook 14 OLED", "ASUS TUF Gaming A16", "ASUS Vivobook S 15",
    "Microsoft Surface Laptop Studio 2", "Microsoft Surface Laptop 5", "Microsoft Surface Pro 9", "Microsoft Surface Go 3",
    "Razer Blade 16", "Razer Blade 15", "Razer Blade 14", "MSI Titan GT77", "MSI Stealth 16", "MSI Prestige 16", "Acer Predator Helios 18", "Acer Swift X 14", "Gigabyte Aero 16",
  ],
  tablets: [
    "iPad Pro 12.9-inch M2", "iPad Pro 11-inch M2", "iPad Air M2", "iPad Air 5th Gen", "iPad 10th Gen", "iPad 9th Gen", "iPad Mini 6th Gen",
    "Samsung Galaxy Tab S9 Ultra", "Samsung Galaxy Tab S9+", "Samsung Galaxy Tab S9", "Samsung Galaxy Tab S9 FE+", "Samsung Galaxy Tab S9 FE", "Samsung Galaxy Tab A9+", "Samsung Galaxy Tab A9",
    "Microsoft Surface Pro 9", "Microsoft Surface Pro 8", "Microsoft Surface Go 4", "Lenovo Tab P12 Pro", "Lenovo Tab P11 Plus",
    "Amazon Fire Max 11", "Amazon Fire HD 10", "Amazon Fire HD 8", "OnePlus Pad", "Google Pixel Tablet", "Xiaomi Pad 6 Pro",
  ],
  tvs: [
    "LG OLED evo G4 77-inch", "LG OLED evo G4 65-inch", "LG OLED evo C4 77-inch", "LG OLED evo C4 65-inch", "LG OLED evo C4 55-inch", "LG OLED evo C4 48-inch", "LG OLED evo C3 65-inch", "LG QNED90 75-inch",
    "Samsung QN90D Neo QLED 85-inch", "Samsung QN90D Neo QLED 75-inch", "Samsung QN90D Neo QLED 65-inch", "Samsung QN85D Neo QLED 75-inch", "Samsung The Frame 65-inch", "Samsung The Frame 55-inch", "Samsung S95D OLED 77-inch",
    "Sony Bravia XR A95L OLED 77-inch", "Sony Bravia XR A95L OLED 65-inch", "Sony Bravia XR A80L OLED 77-inch", "Sony Bravia XR X90L 75-inch", "Sony Bravia XR X90L 65-inch", "Sony Bravia 9 85-inch",
    "TCL QM8 85-inch", "TCL 6-Series R655 75-inch", "TCL 6-Series R655 65-inch", "TCL QM7 75-inch", "Hisense U8K 75-inch", "Hisense U8K 65-inch", "Hisense U7K 75-inch",
    "Vizio Quantum Pro 75-inch", "Vizio M-Series Quantum X 65-inch", "Vizio P-Series Quantum X 75-inch",
  ],
  headphones: [
    "AirPods Pro 2nd Gen", "AirPods Max", "AirPods 3rd Gen", "AirPods 2nd Gen", "Beats Studio Pro", "Beats Fit Pro", "Beats Solo 4", "Beats Studio Buds+", "Powerbeats Pro",
    "Sony WH-1000XM5", "Sony WH-1000XM4", "Sony WF-1000XM5", "Sony WF-1000XM4", "Sony ULT Wear", "Sony LinkBuds S", "Sony INZONE H9",
    "Bose QuietComfort Ultra Headphones", "Bose QuietComfort Ultra Earbuds", "Bose QuietComfort 45", "Bose QuietComfort Earbuds II", "Bose Sport Earbuds", "Bose 700",
    "Sennheiser Momentum 4 Wireless", "Sennheiser Momentum True Wireless 3", "Sennheiser HD 660S2", "Sennheiser HD 800 S",
    "Jabra Elite 10", "Jabra Elite 85t", "Jabra Elite 7 Pro", "JBL Tour One M2", "JBL Live Pro 2", "JBL Tune 770NC", "JBL Flip 6", "JBL Charge 5", "JBL Xtreme 4",
    "Samsung Galaxy Buds3 Pro", "Samsung Galaxy Buds2 Pro", "Google Pixel Buds Pro 2", "Google Pixel Buds Pro", "Anker Soundcore Space Q45", "Anker Soundcore Liberty 4 NC",
    "Audio-Technica ATH-M50xBT2", "Beyerdynamic DT 770 Pro", "Focal Bathys", "Master & Dynamic MW75", "Shure AONIC 50",
  ],
  speakers: [
    "Sonos Era 300", "Sonos Era 100", "Sonos Move 2", "Sonos Roam 2", "Sonos Beam Gen 2", "Sonos Arc", "Sonos Sub Gen 3",
    "Bose SoundLink Flex", "Bose SoundLink Revolve II", "Bose Home Speaker 500", "Bose Smart Soundbar 900", "Bose Smart Soundbar 600",
    "JBL Flip 6", "JBL Charge 5", "JBL Xtreme 4", "JBL PartyBox 310", "JBL PartyBox 110", "JBL Boombox 3",
    "Amazon Echo Studio", "Amazon Echo Dot 5th Gen", "Amazon Echo Show 8", "Amazon Echo Show 15", "Google Nest Audio", "Google Nest Hub Max", "Google Nest Mini",
    "HomePod 2nd Gen", "HomePod Mini", "Marshall Emberton II", "Marshall Woburn III", "UE Boom 4", "UE Megaboom 4", "Bang & Olufsen Beosound A1",
  ],
  gaming: [
    "Sony PlayStation 5 Slim", "Sony PlayStation 5 Digital", "PS5 DualSense Controller", "PS5 DualSense Edge Controller", "PlayStation VR2", "PlayStation Portal",
    "Xbox Series X", "Xbox Series S", "Xbox Elite Controller Series 2", "Xbox Wireless Controller", "Xbox Adaptive Controller",
    "Nintendo Switch OLED", "Nintendo Switch", "Nintendo Switch Lite", "Nintendo Switch Pro Controller", "Nintendo 3DS XL",
    "Steam Deck OLED 1TB", "Steam Deck OLED 512GB", "Steam Deck 512GB", "ASUS ROG Ally X", "ASUS ROG Ally", "Lenovo Legion Go",
    "Meta Quest 3 512GB", "Meta Quest 3 128GB", "Meta Quest Pro", "Meta Quest 2", "PlayStation VR2", "Valve Index",
    "Razer Viper V3 Pro", "Razer DeathAdder V3 Pro", "Razer BlackWidow V4 Pro", "Razer Kraken V4 Pro", "Razer Huntsman V3 Pro",
    "Logitech G Pro X Superlight 2", "Logitech G502 X Plus", "Logitech G915 X", "Logitech G Pro X 2 Headset", "Logitech G Cloud Gaming Handheld",
    "SteelSeries Arctis Nova Pro Wireless", "SteelSeries Apex Pro TKL", "SteelSeries Rival 5", "Corsair K70 RGB Pro", "Corsair Scimitar RGB Elite", "Corsair HS80 RGB Wireless",
    "HyperX Cloud III Wireless", "HyperX Alloy Origins 65", "Elgato Stream Deck MK.2", "Elgato Stream Deck+", "Elgato HD60 X",
  ],
  cameras: [
    "Canon EOS R5", "Canon EOS R6 Mark II", "Canon EOS R8", "Canon EOS R50", "Canon EOS R10", "Canon EOS 5D Mark IV", "Canon PowerShot G7 X Mark III",
    "Sony A7R V", "Sony A7 IV", "Sony A7 III", "Sony A7C II", "Sony ZV-E1", "Sony ZV-E10", "Sony ZV-1 II", "Sony A6700", "Sony A6400",
    "Nikon Z9", "Nikon Z8", "Nikon Z6 III", "Nikon Z6 II", "Nikon Z50 II", "Nikon Z50", "Nikon Z fc", "Nikon D850", "Nikon Z30",
    "Fujifilm X-T5", "Fujifilm X-S20", "Fujifilm X-H2S", "Fujifilm X100VI", "Fujifilm X-E4", "Fujifilm GFX100 II", "Fujifilm X-T30 II",
    "Panasonic Lumix GH6", "Panasonic Lumix S5 II", "Panasonic Lumix G9 II", "Olympus OM-1", "Leica Q3",
    "GoPro Hero 12 Black", "GoPro Hero 11 Black", "GoPro Hero 11 Black Mini", "GoPro Max 360", "DJI Osmo Action 4", "Insta360 X4", "Insta360 Ace Pro",
    "DJI Mini 4 Pro", "DJI Air 3", "DJI Mavic 3 Pro", "DJI Mavic 3 Classic", "DJI Avata 2", "DJI Osmo Pocket 3", "DJI RS 4 Pro Gimbal",
  ],
  smartwatches: [
    "Apple Watch Series 9", "Apple Watch Ultra 2", "Apple Watch SE 2nd Gen",
    "Samsung Galaxy Watch 6 Classic", "Samsung Galaxy Watch 6", "Samsung Galaxy Watch 5 Pro", "Samsung Galaxy Watch 5",
    "Google Pixel Watch 2", "Google Pixel Watch", "Fitbit Sense 2", "Fitbit Versa 4", "Fitbit Charge 6", "Fitbit Inspire 3",
    "Garmin Fenix 8", "Garmin Fenix 7X", "Garmin Epix Pro", "Garmin Forerunner 965", "Garmin Forerunner 265", "Garmin Venu 3", "Garmin Instinct 2X Solar",
    "Amazfit Balance", "Amazfit GTR 4", "Polar Vantage V3", "Polar Grit X2 Pro", "Suunto 9 Peak Pro", "Coros Pace 3", "Whoop 4.0", "Oura Ring Gen 3",
  ],
  smarthome: [
    "Ring Video Doorbell Pro 2", "Ring Video Doorbell 4", "Ring Floodlight Cam Wired Pro", "Ring Stick Up Cam Battery", "Ring Alarm 8-piece Kit",
    "Arlo Pro 5S", "Arlo Pro 5", "Arlo Essential Spotlight", "Arlo Essential Indoor", "Arlo Video Doorbell 2K", "Arlo Ultra 2",
    "Nest Cam Outdoor", "Nest Cam Indoor", "Nest Doorbell Wired 2nd Gen", "Nest Doorbell Battery", "Nest Thermostat", "Nest Protect Smoke Detector",
    "ecobee Smart Thermostat Premium", "ecobee Smart Thermostat Enhanced", "ecobee SmartSensor 2-pack", "ecobee SmartCamera",
    "Philips Hue White and Color Starter Kit", "Philips Hue Lightstrip Plus 2m", "Philips Hue Gradient Lightstrip 65-inch", "Philips Hue Go Portable", "Philips Hue Bridge",
    "LIFX A19 Color Bulb", "LIFX Lightstrip 2m", "Nanoleaf Shapes Hexagons", "Nanoleaf Lines", "Govee RGBIC LED Strip Lights",
    "August Smart Lock Pro", "Yale Assure Lock 2", "Schlage Encode Plus", "Wyze Lock", "Eufy Smart Lock C210",
    "Roku Streaming Stick 4K+", "Roku Ultra", "Roku Express 4K+", "Apple TV 4K 3rd Gen", "Chromecast with Google TV 4K", "Amazon Fire TV Stick 4K Max", "Amazon Fire TV Cube",
  ],
  vacuums: [
    "iRobot Roomba j9+", "iRobot Roomba Combo j9+", "iRobot Roomba Combo j7+", "iRobot Roomba j7+", "iRobot Roomba i7+", "iRobot Braava Jet m6",
    "Roborock S8 Pro Ultra", "Roborock S8+", "Roborock Q Revo", "Roborock Q7 Max+", "Roborock S7 MaxV Ultra",
    "Ecovacs Deebot X2 Omni", "Ecovacs Deebot T20 Omni", "Ecovacs Deebot N10 Plus",
    "Eufy RoboVac X9 Pro", "Eufy RoboVac G30", "Eufy RoboVac 15C MAX", "Shark AI Ultra Robot VacMop", "Shark IQ Robot Self-Empty XL",
    "Dyson V15 Detect", "Dyson V12 Detect Slim", "Dyson V11 Torque Drive", "Dyson V8 Absolute", "Dyson Ball Animal 3", "Dyson Outsize",
    "Shark Vertex DuoClean PowerFins", "Shark Navigator Lift-Away", "Bissell CrossWave X7 Cordless", "Tineco Floor One S7 Pro",
  ],
  kitchen: [
    "KitchenAid Artisan Stand Mixer 5-Quart", "KitchenAid Professional 600 Series", "KitchenAid Classic Plus", "KitchenAid Mini Plus",
    "Instant Pot Duo 7-in-1 6 Quart", "Instant Pot Duo Crisp 11-in-1", "Instant Pot Pro Plus 6 Quart", "Instant Pot Duo Gourmet",
    "Ninja Foodi 14-in-1 8 Quart", "Ninja Creami Deluxe", "Ninja Professional Plus Blender", "Ninja Air Fryer Max XL", "Ninja Woodfire Outdoor Grill",
    "Vitamix A3500", "Vitamix E310 Explorian", "Vitamix Propel 750", "Blendtec Total Classic", "Breville Super Q",
    "Breville Barista Express Espresso Machine", "Breville Barista Pro", "Breville Oracle Touch", "Breville Smart Oven Air", "Breville Precision Brewer",
    "Nespresso Vertuo Next", "Nespresso Vertuo Plus", "Nespresso Essenza Mini", "Keurig K-Supreme Plus", "Keurig K-Mini Plus", "Keurig K-Elite",
    "Cuisinart 14-Cup Food Processor", "Cuisinart TOA-65 Air Fryer Toaster Oven", "Cuisinart Deluxe Convection Oven", "Cuisinart Elemental 13-Cup",
    "Lodge Cast Iron Skillet 12-inch", "Le Creuset Dutch Oven 5.5 Qt", "Staub Round Cocotte 5.5 Qt", "All-Clad D3 Tri-Ply Stainless Steel 10-Piece Set",
    "Anova Precision Cooker Pro", "Anova Culinary Sous Vide Precision Cooker Nano", "Waring Commercial Deep Fryer",
  ],
  appliances: [
    "Dyson Airwrap Complete", "Dyson Supersonic Hair Dryer", "Dyson Purifier Hot+Cool HP07", "Dyson Pure Cool TP07", "Dyson Pure Humidify+Cool",
    "Levoit Core 400S Air Purifier", "Levoit Core 300", "Coway Airmega 400S", "Honeywell HPA300", "Blueair Blue Pure 211+",
    "De'Longhi TrueBrew Automatic Coffee Machine", "De'Longhi Magnifica Evo", "Philips 3200 Series Espresso Machine",
    "Breville Juice Fountain Cold XL", "Hurom H-AA Slow Juicer", "Hamilton Beach Big Mouth Juicer",
  ],
  monitors: [
    "LG UltraWide 34WP65C-B 34-inch", "LG UltraGear 27GN950-B 27-inch 4K", "LG DualUp 28MQ780-B",
    "Samsung Odyssey G9 49-inch", "Samsung Odyssey OLED G8 34-inch", "Samsung ViewFinity S9 27-inch 5K",
    "Dell UltraSharp U2723QE 27-inch 4K", "Dell UltraSharp U3223QE 32-inch 4K", "Dell Alienware AW3423DWF 34-inch OLED",
    "ASUS ProArt PA278QV 27-inch", "ASUS ROG Swift PG27AQDM 27-inch OLED", "ASUS TUF Gaming VG27AQL1A",
    "BenQ PD2705U 27-inch 4K", "BenQ SW271C 27-inch 4K", "MSI Optix MAG274QRF-QD", "Acer Predator X27U 27-inch Mini LED",
  ],
  office: [
    "Herman Miller Aeron Chair", "Herman Miller Embody Chair", "Herman Miller Sayl Chair", "Steelcase Leap V2", "Steelcase Gesture", "Secretlab Titan Evo 2022",
    "FlexiSpot E7 Standing Desk", "Uplift V2 Standing Desk", "Autonomous SmartDesk Core", "VIVO Electric Standing Desk",
    "Logitech MX Master 3S", "Logitech MX Keys S", "Logitech MX Mechanical", "Logitech C920 Webcam", "Logitech Brio 4K Pro",
    "Keychron K8 Pro", "Keychron Q1", "Razer Pro Type Ultra", "Microsoft Surface Keyboard", "Apple Magic Keyboard with Touch ID",
    "CalDigit TS4 Thunderbolt 4 Dock", "Anker 575 USB-C Docking Station", "Plugable UD-ULTC4K", "OWC Thunderbolt Dock",
    "Blue Yeti USB Microphone", "Shure MV7 Podcast Microphone", "Rode NT-USB Mini", "Elgato Wave:3", "Audio-Technica AT2020USB+",
    "Elgato Stream Deck MK.2", "Elgato Key Light Air", "Elgato HD60 X", "Elgato Facecam Pro",
  ],
  storage: [
    "Samsung 990 Pro 2TB SSD", "Samsung 980 Pro 1TB", "Samsung T7 Shield 2TB Portable SSD", "Samsung T7 1TB Portable SSD",
    "WD Black SN850X 2TB", "WD Black SN770 1TB", "WD My Passport 5TB", "WD Elements 4TB", "WD My Book 8TB",
    "Seagate FireCuda 530 2TB", "Seagate BarraCuda 2TB", "Seagate Expansion Desktop 8TB", "Seagate One Touch 5TB",
    "SanDisk Extreme Pro Portable SSD 2TB", "SanDisk Ultra 3D 1TB", "Crucial P5 Plus 2TB", "Crucial MX500 1TB",
    "Kingston Fury Beast 32GB DDR5-6000", "Kingston Fury Renegade 16GB DDR4-3600", "Corsair Vengeance 32GB DDR5-5600", "G.SKILL Trident Z5 RGB 32GB DDR5-6400",
  ],
  networking: [
    "ASUS RT-AX86U Pro", "ASUS RT-AX88U Pro", "ASUS ZenWiFi AX XT8 2-Pack", "ASUS ZenWiFi Pro ET12 2-Pack",
    "TP-Link Deco XE75 Pro 3-Pack", "TP-Link Archer AXE75", "TP-Link Archer AX73", "TP-Link Deco X55 3-Pack",
    "Netgear Orbi RBK863S", "Netgear Nighthawk RAXE500", "Netgear Nighthawk AX12", "Netgear Orbi RBK852",
    "eero Pro 6E 3-Pack", "eero 6+ 3-Pack", "Google Nest WiFi Pro 6E 3-Pack", "Google Nest WiFi 3-Pack",
    "Ubiquiti UniFi Dream Router", "Ubiquiti UniFi AP U7 Pro", "Ubiquiti UniFi Express", "Ubiquiti AmpliFi Alien",
  ],
  ereaders: [
    "Kindle Paperwhite Signature Edition", "Kindle Paperwhite 11th Gen", "Kindle Scribe 10.2-inch", "Kindle Oasis", "Kindle Basic 11th Gen",
    "Kobo Libra Colour", "Kobo Clara BW", "Kobo Elipsa 2E", "Remarkable 2 Tablet", "Boox Note Air3", "Boox Tab Ultra C", "Supernote A5 X2",
  ],
  fitness: [
    "Peloton Bike+", "Peloton Tread", "Peloton Guide", "NordicTrack Commercial 1750 Treadmill", "NordicTrack Commercial S22i Studio Cycle",
    "Bowflex SelectTech 552 Adjustable Dumbbells", "Bowflex VeloCore Bike", "Bowflex Revolution Home Gym",
    "Theragun Pro", "Theragun Elite", "Theragun Mini", "Hyperice Hypervolt 2 Pro", "Hyperice Normatec 3",
    "Hydrow Rower", "Concept2 RowErg", "Sunny Health & Fitness Rowing Machine", "Echelon Smart Rower",
    "TRX All-in-One Suspension Trainer", "Resistance Bands Set 5-Pack", "SPRI Dumbbells Set", "CAP Barbell Olympic Weight Set",
    "Manduka PRO Yoga Mat", "Lululemon Reversible Mat 5mm", "Jade Harmony Yoga Mat", "Gaiam Premium Yoga Mat",
  ],
  power: [
    "Anker PowerCore 26800 Power Bank", "Anker 737 Power Bank 24000mAh", "Anker 548 Power Bank", "Anker Nano Power Bank 10000mAh",
    "Jackery Explorer 1000 Pro Portable Power Station", "Jackery Explorer 2000 Pro", "EcoFlow Delta 2", "EcoFlow River 2 Pro", "Bluetti AC200MAX", "Goal Zero Yeti 1500X",
  ],
  misc: [
    "Tile Pro 2024 4-Pack", "Tile Mate 4-Pack", "Apple AirTag 4-Pack", "Chipolo ONE Spot",
    "Peak Design Everyday Backpack V2 30L", "Peak Design Everyday Sling 10L", "Bellroy Classic Backpack Plus", "Bellroy Tech Kit",
    "Weber Genesis E-335 Gas Grill", "Weber Spirit II E-310", "Traeger Ironwood 650 Pellet Grill", "Traeger Pro 575",
    "Blink Outdoor 4 Camera System", "Blink Mini Indoor Camera 2-Pack", "Wyze Cam v3 4-Pack", "Aqara Hub M2",
  ],
};

export const PRODUCT_DATABASE: ProductSuggestion[] = [];

// Flatten all categories into a single array with category tags
Object.entries(PRODUCT_CATEGORIES).forEach(([category, products]) => {
  products.forEach((product) => {
    PRODUCT_DATABASE.push({ name: product, category });
  });
});

export function searchProducts(query: string, limit: number = 8): ProductSuggestion[] {
  if (query.length < 2) return [];
  
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/);
  
  const scored = PRODUCT_DATABASE.map((item) => {
    const lower = item.name.toLowerCase();
    let score = 0;
    
    // Exact substring match = highest priority
    if (lower.includes(q)) score += 100;
    
    // All tokens present
    const allMatch = tokens.every((t) => lower.includes(t));
    if (allMatch) score += 50;
    
    // Individual token matches
    tokens.forEach((t) => {
      if (lower.includes(t)) score += 10;
      if (lower.startsWith(t)) score += 20;
    });
    
    // Category match bonus
    if (item.category.toLowerCase().includes(q)) score += 30;
    
    return { ...item, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return scored;
}
