const options = {
	key: 'uyplD1Kxfx3Qhb93obfu70C7CAmyyePB'
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
	const brightSlider = document.getElementById('brightSlider');
	const brightVal = document.getElementById('brightVal');

	opacitySlider.addEventListener('input', (e) => {
		const val = e.target.value;
		opacityVal.innerText = `${val}%`;
		windyContainer.style.setProperty('--windy-opacity', val / 100);
	});

	brightnessSlider.addEventListener('input', (e) => {
		const val = e.target.value;
		brightVal.innerText = `${val}%`;
		windyContainer.style.setProperty('--windy-brightness', val / 100);
	});
});
