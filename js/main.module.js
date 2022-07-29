{
  const vertexShader = await fetch("assets/shaders/fibre.vert.glsl")
    .then((response) => response.text())
    .catch((error) => console.error(error));

  const fragmentShader = await fetch("assets/shaders/fibre.frag.glsl")
    .then((response) => response.text())
    .catch((error) => console.error(error));

  const initialModeIndex = 0;

  AFRAME.registerShader("fibre-mode", {
    schema: {
      u_modeAtlasTexture: { type: "map", is: "uniform" },
      u_repeat: { type: "vec2", is: "uniform" },
      u_uvOffset: { type: "vec2", is: "uniform" },
      u_time: { type: "time", is: "uniform" },
    },
    vertexShader,
    fragmentShader,
  });

  AFRAME.registerComponent("update-shader", {
    schema: {
      modeIndex: { type: "int", default: initialModeIndex },
      atlasWidth: { type: "number", default: 1.0 },
      atlasHeight: { type: "number", default: 1.0 },
    },
    init() {
      // Assumed won't change
      this.atlasWidth = this.data.atlasWidth;
      this.atlasHeight = this.data.atlasHeight;

      this.el.setAttribute("material", {
        shader: "fibre-mode",
        u_modeAtlasTexture: "#modes",
        u_uvOffset: { x: 0.0, y: 0.0 },
        transparent: true,
      });
      this.el.setAttribute("material", "u_repeat", {
        x: 1.0 / this.atlasWidth,
        y: 1.0 / this.atlasHeight,
      });
    },

    update() {
      // Note, called after init
      const { modeIndex } = this.data;

      // Update texture
      const x = (modeIndex % this.atlasWidth) / this.atlasWidth;
      const y =
        (this.atlasWidth - 1.0 - Math.floor(modeIndex / this.atlasWidth)) /
        this.atlasHeight;

      this.el.setAttribute("material", "u_uvOffset", { x, y });
    },
  });

  // Get (pre-calculated) fibre parameters
  const fibreParameters = await fetch("assets/json/fibre_parameters.json")
    .then((response) => response.json())
    .catch((error) => console.error(error));

  const numModes = fibreParameters.core_wavevector.length;

  AFRAME.registerComponent("update-text", {
    schema: {
      modeIndex: { type: "int", default: initialModeIndex },
    },
    init: function () {
      // Note that this is technically the number of modes with positive ell, but
      // I doubt someone will scroll through all of the modes and wonder where the
      // negative ones are.
      this.numModes = fibreParameters.core_wavevector.length;
    },

    update: function () {
      // Note, called after init
      const { modeIndex } = this.data;

      // We're ignoring the modes with a negative azimuthal index for convenience
      const azimuthalIndex = fibreParameters.azimuthal_indices[modeIndex];
      const radialIndex = fibreParameters.radial_indices[modeIndex];

      this.el.setAttribute(
        "value",
        `ell = ${azimuthalIndex}, p = ${radialIndex}`
      );
    },
  });

  let modeIndex = 0;

  function changeMode(index) {
    modeIndex = ((index % numModes) + numModes) % numModes; // Positive modulo
    for (const attribute of ["update-text", "update-shader"]) {
      document
        .querySelector(`[${attribute}]`)
        .setAttribute(attribute, "modeIndex", modeIndex);
    }
  }

  changeMode(0);

  // Add event listeners
  const scene = document.querySelector("a-scene");
  scene.addEventListener("click", () => {
    changeMode(modeIndex + 1);
  });

  document.addEventListener("keydown", (e) => {
    switch (e.key) {
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

  scene.addEventListener("touchstart", onTouchStart);
  scene.addEventListener("touchend", onTouchEnd);

  // TODO: Refactor into touch handling standalone file
  // TODO: Support PointerEvents API
  const tolerance = 44;
  let initialX;
  let initialY;

  function onTouchStart(e) {
    e.preventDefault(); // Don't "click"
    initialX = e.changedTouches[0].screenX;
    initialY = e.changedTouches[0].screenY;
  }

  function onTouchEnd(e) {
    e.preventDefault();
    // Return if initial positions undefined
    if (initialX == undefined || initialY == undefined) {
      return;
    }

    const deltaX = e.changedTouches[0].screenX - initialX;
    const deltaY = e.changedTouches[0].screenY - initialY;

    // Enforce horizontal
    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      if (deltaX >= tolerance) {
        // Right
        changeMode(modeIndex - 1);
      } else if (deltaX <= 0) {
        // Consider taps as 'left'
        // Left
        changeMode(modeIndex + 1);
      }
    }
  }
}
