{
	// Get (pre-calculated) fibre parameters
	const fibreParameters = await fetch("assets/json/fibre_parameters.json")
		.then((response) => response.json())
		.catch((error) => console.error(error));

	// Note that this is technically the number of modes with positive ell, but
	// I doubt someone will scroll through all of the modes and wonder where the
	// negative ones are.
	const numModes = fibreParameters.core_wavevector.length;

	let azimuthalIndex = 0;
	let radialIndex = 0;

	// From texture
	const atlasWidth = 12;
	const atlasHeight = 12;

	let modeIndex = 0;

	const fibrePlane = document.querySelector('#fibre-plane');
	const modeText = document.querySelector('#mode-text');

	function changeMode(index) {
		// Clip to num modes
		modeIndex = ((index % numModes) + numModes) % numModes; // Positive modulo

		// We're ignoring the modes with a negative azimuthal index for convenience
		azimuthalIndex = fibreParameters.azimuthal_indices[modeIndex];
		radialIndex = fibreParameters.radial_indices[modeIndex];

		// Set ell, p as text in the scene.
		modeText.setAttribute('value', `ell = ${azimuthalIndex}, p = ${radialIndex}`);

		// Convert the linear index of the mode into 2D texture co-ordinates
		const offsetX = modeIndex % atlasWidth;
		const offsetY = (atlasWidth - 1) - Math.floor(modeIndex / atlasWidth);
		fibrePlane.object3DMap.mesh.material.uniforms.u_uvOffset.value = new THREE.Vector2(offsetX / atlasWidth, offsetY / atlasHeight);
		fibrePlane.object3DMap.mesh.material.needsUpdate = true;
	}

	// Start off at mode 0
	changeMode(0);

	// Add event listeners
	const scene = document.querySelector('a-scene');
	scene.addEventListener('click', () => { changeMode(modeIndex + 1); });

	document.addEventListener('keydown', (event) => {
		switch (event.key) {
			case "ArrowLeft":
			case "ArrowUp":
				changeMode(modeIndex - 1);
				break;
			case "ArrowRight":
			case "ArrowDown":
				changeMode(modeIndex + 1);
				break;
		}
	});
}