const options = {
	key: 'uyplD1Kxfx3Qhb93obfu70C7CAmyyePB', // ใช้ API Key ใหม่ที่เพิ่ม localhost แล้ว[span_1](start_span)[span_1](end_span)
	verbose: true,
	lat: 13.75,
	lon: 100.50,
	zoom: 6,
	overlay: 'wind'
};

windyInit(options, function(windyAPI) {
	const { map } = windyAPI;
	console.log("Windy Loaded Successfully!");

	// ควบคุมสไลเดอร์ความโปร่งใสและความสว่าง
	const windyContainer = document.getElementById('windy');
	const opacitySlider = document.getElementById('opacitySlider');
	const opacityVal = document.getElementById('opacityVal');
	const brightnessSlider = document.getElementById('brightnessSlider');
	const brightnessVal = document.getElementById('brightnessVal');

	opacitySlider.addEventListener('input', (e) => {
		const val = e.target.value;
		opacityVal.innerText = `${val}%`;
		windyContainer.style.setProperty('--windy-opacity', val / 100);
	});

	brightnessSlider.addEventListener('input', (e) => {
		const val = e.target.value;
		brightnessVal.innerText = `${val}%`;
		windyContainer.style.setProperty('--windy-brightness', val / 100);
	});
});
