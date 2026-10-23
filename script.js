// ===================================================
// 1. ค่าคอนฟิกพื้นฐาน
// ===================================================
const API_KEY = 'uypID1Kxfx3Qhb93obfu70C7cAmyyePB'; // รหัส API Key ของคุณ
const DEFAULT_LAT = 13.75;
const DEFAULT_LON = 100.50;
const DEFAULT_ZOOM = 6;

// ระดับความสูง
const levels = [
    { id: '850h', name: '850 hPa' },
    { id: '925h', name: '925 hPa' },
    { id: '500h', name: '500 hPa' },
    { id: '200h', name: '200 hPa' }
];

// รายการ 7 เลเยอร์สภาพอากาศ
const subLayers = [
    { overlay: 'wind', name: 'ลม', supportsUpper: true },
    { overlay: 'rh', name: 'ความชื้น', supportsUpper: true },
    { overlay: 'temp', name: 'อุณหภูมิ', supportsUpper: true },
    { overlay: 'rain', name: 'ฝน', supportsUpper: false },
    { overlay: 'clouds', name: 'เมฆ', supportsUpper: false },
    { overlay: 'gust', name: 'ลมกระโชก', supportsUpper: false },
    { overlay: 'pressure', name: 'ความกดอากาศ', supportsUpper: false }
];

let currentLevel = '850h';

// กำหนดสถานะเปิด-ปิดเริ่มต้น (เปิด 'ลม' ไว้ 1 อัน)
let activeLayers = {
    'wind': true,
    'rh': false,
    'temp': false,
    'rain': false,
    'clouds': false,
    'gust': false,
    'pressure': false
};

let mapInstances = {};
let sharedMapState = { lat: DEFAULT_LAT, lon: DEFAULT_LON, zoom: DEFAULT_ZOOM };

// ===================================================
// 2. สร้างปุ่มควบคุมในบรรทัดบนสุด
// ===================================================
function initControlBar() {
    const levelGroup = document.getElementById('levelBtnGroup');
    levelGroup.innerHTML = '';
    levels.forEach(lvl => {
        const btn = document.createElement('button');
        btn.className = `level-btn ${lvl.id === currentLevel ? 'active' : ''}`;
        btn.textContent = lvl.id;
        btn.onclick = () => changeLevel(lvl.id);
        levelGroup.appendChild(btn);
    });

    const layerGroup = document.getElementById('layerBtnGroup');
    layerGroup.innerHTML = '';
    subLayers.forEach(layer => {
        const btn = document.createElement('button');
        btn.className = `layer-btn ${activeLayers[layer.overlay] ? 'active' : ''}`;
        btn.textContent = layer.name;
        btn.id = `btn-layer-${layer.overlay}`;
        btn.onclick = () => toggleLayer(layer.overlay);
        layerGroup.appendChild(btn);
    });
}

// ===================================================
// 3. จัดการเปิด-ปิด เลเยอร์แบบซ้อนทับกัน
// ===================================================
function toggleLayer(overlayId) {
    activeLayers[overlayId] = !activeLayers[overlayId];

    const btn = document.getElementById(`btn-layer-${overlayId}`);
    if (btn) {
        if (activeLayers[overlayId]) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }

    renderStackMaps();
}

function changeLevel(levelId) {
    currentLevel = levelId;
    initControlBar();
    renderStackMaps();
}

// ===================================================
// 4. เรนเดอร์แผนที่ซ้อนทับกันเต็มหน้าจอด้านล่าง
// ===================================================
function renderStackMaps() {
    const container = document.getElementById('map-fullscreen-container');
    if (!container) return;

    container.innerHTML = '';
    mapInstances = {};

    subLayers.forEach((subLayer, index) => {
        if (!activeLayers[subLayer.overlay]) return;

        const effectiveLevel = subLayer.supportsUpper ? currentLevel : 'surface';

        const paneDiv = document.createElement('div');
        paneDiv.className = 'windy-layer-pane';
        paneDiv.id = `pane-${subLayer.overlay}`;
        container.appendChild(paneDiv);

        setTimeout(() => {
            const options = {
                key: API_KEY,
                lat: sharedMapState.lat,
                lon: sharedMapState.lon,
                zoom: sharedMapState.zoom,
                overlay: subLayer.overlay,
                level: effectiveLevel
            };

            if (typeof windyInit === 'function') {
                windyInit(options, windyAPI => {
                    mapInstances[subLayer.overlay] = windyAPI;

                    const mapObj = windyAPI.map;
                    if (mapObj) {
                        mapObj.on('moveend', () => {
                            const center = mapObj.getCenter();
                            const zoom = mapObj.getZoom();
                            sharedMapState.lat = center.lat;
                            sharedMapState.lon = center.lng;
                            sharedMapState.zoom = zoom;

                            Object.keys(mapInstances).forEach(key => {
                                if (key !== subLayer.overlay && mapInstances[key] && mapInstances[key].map) {
                                    const otherMap = mapInstances[key].map;
                                    if (otherMap.getCenter().lat !== center.lat || otherMap.getZoom() !== zoom) {
                                        otherMap.setView([center.lat, center.lng], zoom, { animate: false });
                                    }
                                }
                            });
                        });
                    }
                });
            }
        }, index * 200);
    });
}

// ===================================================
// 5. ปรับความทึบและความสว่าง
// ===================================================
function updateOpacity(val) {
    const opacity = val / 100;
    document.documentElement.style.setProperty('--windy-opacity', opacity);
    const valSpan = document.getElementById('opacityVal');
    if (valSpan) valSpan.textContent = `${val}%`;
}

function updateBrightness(val) {
    const brightness = val / 100;
    document.documentElement.style.setProperty('--windy-brightness', brightness);
    const valSpan = document.getElementById('brightnessVal');
    if (valSpan) valSpan.textContent = `${val}%`;
}

// ===================================================
// 6. ฟังก์ชัน ย่อพัก / คืนค่า / ปิด หน้าต่าง
// ===================================================
function minimizeWindow() {
    // พับเก็บทั้ง Control Bar และ Map แล้วแสดงปุ่มจิ๋วมุมซ้ายล่างแทน
    document.body.classList.add('minimized');
}

function restoreWindow() {
    // ดึงหน้าต่างคืนกลับมาแสดงผลเต็มหน้าจอ
    document.body.classList.remove('minimized');
    
    // บังคับให้ Leaflet คำนวณขนาดจอใหม่ให้ถูกต้อง
    setTimeout(() => {
        Object.keys(mapInstances).forEach(key => {
            if (mapInstances[key] && mapInstances[key].map) {
                mapInstances[key].map.invalidateSize();
            }
        });
    }, 100);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function closeWindow() {
    if (window.close) {
        window.close();
    }
    document.body.style.display = 'none';
}

// เริ่มต้นทำงานเมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
    initControlBar();
    renderStackMaps();
});
