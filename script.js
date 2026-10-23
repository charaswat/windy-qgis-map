// ==========================================
// 1. กำหนดค่าคอนฟิกพื้นฐาน
// ==========================================
const API_KEY = 'uypID1Kxfx3Qhb93obfu70C7CAmyyePB'; // รหัส Windy API Key
const DEFAULT_LAT = 13.75;
const DEFAULT_LON = 100.50;
const DEFAULT_ZOOM = 6;

// ระดับความกดอากาศหลัก (4 Levels)
const levels = [
    { id: '850h', name: '850 hPa (ความสูงชั้นต่ำ ~1.5 กม.)' },
    { id: '925h', name: '925 hPa (ความสูงใกล้พื้นผิว ~750 ม.)' },
    { id: '500h', name: '500 hPa (ความสูงชั้นกลาง ~5.5 กม.)' },
    { id: '200h', name: '200 hPa (ความสูงชั้นบน/Jet Stream ~12 กม.)' }
];

// รายการ 7 ซับเลเยอร์สภาพอากาศ
const subLayers = [
    { overlay: 'wind', name: 'ลม (Wind)', supportsUpper: true },
    { overlay: 'rh', name: 'ความชื้น (Humidity)', supportsUpper: true },
    { overlay: 'temp', name: 'อุณหภูมิ (Temperature)', supportsUpper: true },
    { overlay: 'rain', name: 'ฝน (Rain)', supportsUpper: false },
    { overlay: 'clouds', name: 'เมฆ (Clouds)', supportsUpper: false },
    { overlay: 'gust', name: 'ลมกระโชก (Wind Gust)', supportsUpper: false },
    { overlay: 'pressure', name: 'ความกดอากาศ (Pressure)', supportsUpper: false }
];

// เก็บ Element ของ Container แผนที่ทั้งหมดไว้ควบคุมร่วมกัน
const mapContainers = [];

// ==========================================
// 2. ฟังก์ชันสร้างการ์ด HTML และสั่งรัน Windy API (28 Maps)
// ==========================================
function initDashboard() {
    const dashboard = document.getElementById('dashboardContainer');
    if (!dashboard) return;
    dashboard.innerHTML = '';

    levels.forEach((levelObj) => {
        const section = document.createElement('section');
        section.className = 'level-section';
        section.dataset.level = levelObj.id;

        const levelTitle = document.createElement('h2');
        levelTitle.className = 'level-header';
        levelTitle.innerText = levelObj.name;
        section.appendChild(levelTitle);

        const grid = document.createElement('div');
        grid.className = 'maps-grid';

        // วนลูปสร้าง 7 ซับเลเยอร์ในการ์ดแต่ละระดับ
        subLayers.forEach((sub) => {
            const mapId = `windyMap_${levelObj.id}_${sub.overlay}`;

            const card = document.createElement('div');
            card.className = 'map-card';

            // ตรวจสอบว่าเลเยอร์นั้นรองรับความสูงชั้นบนหรือไม่ (ถ้าไม่ จะดึงค่า Surface อัตโนมัติ)
            const isUpperSupported = sub.supportsUpper;
            const targetLevel = isUpperSupported ? levelObj.id : 'surface';
            const badgeText = isUpperSupported ? levelObj.id : 'Surface (ผิวดิน)';
            const badgeClass = isUpperSupported ? 'tag' : 'tag surface-fallback';

            card.innerHTML = `
                <div class="map-card-header">
                    <span>${sub.name}</span>
                    <span class="${badgeClass}">${badgeText}</span>
                </div>
                <div id="${mapId}" class="windy-container"></div>
            `;

            grid.appendChild(card);

            // เก็บอ้างอิง div เพื่อนำไปวนลูปปรับ CSS Variables สไลเดอร์
            setTimeout(() => {
                const el = document.getElementById(mapId);
                if (el) mapContainers.push(el);
                // สั่งการ Windy API
                const options = {
                    key: API_KEY,
                    verbose: false,
                    lat: DEFAULT_LAT,
                    lon: DEFAULT_LON,
                    zoom: DEFAULT_ZOOM,
                    overlay: sub.overlay,
                    level: targetLevel,
                    container: document.getElementById(mapId)
                };
                windyInit(options, (windyAPI) => {
                });
            }, (mapContainers.length + 1) * 150);
        });
        section.appendChild(grid);
        dashboard.appendChild(section);
    });
}

// ==========================================
// 3. ระบบ Master Control (ควบคุม Opacity & Brightness รวม)
// ==========================================
const masterOpacitySlider = document.getElementById('masterOpacitySlider');
const masterOpacityVal = document.getElementById('masterOpacityVal');
const masterBrightSlider = document.getElementById('masterBrightSlider');
const masterBrightVal = document.getElementById('masterBrightVal');

if (masterOpacitySlider) {
    masterOpacitySlider.addEventListener('input', (e) => {
        const val = e.target.value;
        if (masterOpacityVal) masterOpacityVal.innerText = `${val}%`;
        document.documentElement.style.setProperty('--windy-opacity', val / 100);
    });
}

if (masterBrightSlider) {
    masterBrightSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        if (masterBrightVal) masterBrightVal.innerText = `${val}%`;
        document.documentElement.style.setProperty('--windy-brightness', val / 100);
    });
}

// ==========================================
// 4. ระบบสลับ Tab กรองแสดงเฉพาะระดับความสูง
// ==========================================
function filterLevel(selectedLevel) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }

    document.querySelectorAll('.level-section').forEach(section => {
        if (selectedLevel === 'all' || section.dataset.level === selectedLevel) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

// เริ่มต้นทำงานทันทีเมื่อเปิดหน้าเว็บ
window.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});