import * as THREE from '../vendor/three.module.js';

// Equirectangular texture: Greenwich is +X; east longitudes point toward -Z.
export function geographicVector(latitude, longitude) {
  const lat = THREE.MathUtils.degToRad(latitude),
    lon = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(
    Math.cos(lat) * Math.cos(lon),
    Math.sin(lat),
    -Math.cos(lat) * Math.sin(lon),
  );
}

export class Globe {
  constructor(container, locations, onSelect) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 20);
    this.camera.position.z = 4;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    container.append(this.renderer.domElement);
    this.planet = new THREE.Group();
    this.scene.add(this.planet);
    this.planet.quaternion.setFromUnitVectors(
      geographicVector(12, -53),
      new THREE.Vector3(0, 0, 1),
    );
    this.scene.add(new THREE.AmbientLight(0xffffff, 2.0));
    const light = new THREE.DirectionalLight(0xe8f2ff, 2.5);
    light.position.set(-3, 4, 5);
    this.scene.add(light);
    this.geometry = new THREE.SphereGeometry(1, 96, 64);
    this.material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 13,
      specular: 0x66899b,
      normalScale: new THREE.Vector2(0.55, 0.55),
    });
    this.planet.add(new THREE.Mesh(this.geometry, this.material));
    this.atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      vertexShader:
        'varying vec3 vNormal; varying vec3 vPosition; void main(){vNormal=normalize(normalMatrix*normal); vec4 p=modelViewMatrix*vec4(position,1.0); vPosition=p.xyz; gl_Position=projectionMatrix*p;}',
      fragmentShader:
        'varying vec3 vNormal; varying vec3 vPosition; void main(){float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(-vPosition))),3.0);gl_FragColor=vec4(0.45,0.76,1.0,rim*0.55);}',
    });
    const atmosphere = new THREE.Mesh(this.geometry, this.atmosphereMaterial);
    atmosphere.scale.setScalar(1.022);
    this.planet.add(atmosphere);
    this.textures = [];
    this.projected = new THREE.Vector3();
    this.rotationStep = new THREE.Quaternion();
    this.axis = new THREE.Vector3(0, 1, 0);
    this.pins = locations.map((location) => {
      const button = document.createElement('button');
      button.className = 'globe-pin';
      button.dataset.category = location.category;
      button.dataset.tone = location.tone || '';
      button.dataset.location = location.id;
      button.setAttribute('aria-label', `Selecionar ${location.name}`);
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `<span class="pin-badge"><svg aria-hidden="true"><use href="#i-${location.category === 'crater' ? 'crater' : 'dune'}"/></svg></span><span class="pin-stem"></span><span class="pin-dot"></span><span class="pin-tooltip"></span>`;
      button.querySelector('.pin-tooltip').textContent = location.name;
      button.addEventListener('click', () => {
        if (!this.suppressClick) onSelect(location);
      });
      document.getElementById('pins').append(button);
      return {
        button,
        location,
        vector: geographicVector(location.lat, location.lon),
      };
    });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
  }

  async load() {
    const loader = new THREE.TextureLoader();
    const textures = await Promise.all(
      ['earth-day.jpg', 'earth-normal.jpg', 'earth-water.jpg'].map((file) =>
        loader.loadAsync(`assets/${file}`).then((texture) => {
          this.textures.push(texture);
          return texture;
        }),
      ),
    );
    if (this.disposed) {
      textures.forEach((texture) => texture.dispose());
      return;
    }
    const [day, normal, water] = textures;
    day.colorSpace = THREE.SRGBColorSpace;
    day.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    this.material.map = day;
    this.material.normalMap = normal;
    this.material.specularMap = water;
    // Retain real geographic texture detail, with the reference's pale land and blue oceans.
    this.material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float ocean = texture2D(specularMap, vSpecularMapUv).r;
        vec3 land = mix(diffuseColor.rgb, vec3(0.70, 0.76, 0.83), 0.60);
        vec3 sea = mix(vec3(0.11, 0.34, 0.52), diffuseColor.rgb, 0.12);
        diffuseColor.rgb = mix(land, sea, smoothstep(0.1, 0.65, ocean));`,
      );
    };
    this.material.needsUpdate = true;
  }

  resize() {
    const { width, height } = this.container.getBoundingClientRect();
    this.width = width;
    this.height = height;
    const radius = Math.max(1, Math.min(width * 0.455, height * 0.425));
    this.camera.left = -width / (2 * radius);
    this.camera.right = -this.camera.left;
    this.camera.top = height / (2 * radius);
    this.camera.bottom = -this.camera.top;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  rotate(dx, dy) {
    this.rotationStep.setFromAxisAngle(
      new THREE.Vector3(dy, dx, 0).normalize(),
      Math.hypot(dx, dy),
    );
    this.planet.quaternion.premultiply(this.rotationStep).normalize();
  }

  spin(angle) {
    this.rotationStep.setFromAxisAngle(this.axis, angle);
    this.planet.quaternion.premultiply(this.rotationStep).normalize();
  }

  targetFor(location) {
    // Apply the shortest arc to the current orientation; no longitude wrap jumps.
    const current = geographicVector(
      location.lat,
      location.lon,
    ).applyQuaternion(this.planet.quaternion);
    return new THREE.Quaternion()
      .setFromUnitVectors(current, new THREE.Vector3(0, 0, 1))
      .multiply(this.planet.quaternion);
  }

  select(id) {
    this.pins.forEach(({ button, location }) =>
      button.setAttribute('aria-pressed', String(location.id === id)),
    );
  }

  render() {
    for (const { button, vector } of this.pins) {
      this.projected.copy(vector).applyQuaternion(this.planet.quaternion);
      const visible = this.projected.z > 0.13;
      button.hidden = !visible;
      if (!visible) continue;
      this.projected
        .multiplyScalar(this.planet.scale.x * 1.004)
        .project(this.camera);
      const x = ((this.projected.x + 1) * this.width) / 2,
        y = ((1 - this.projected.y) * this.height) / 2;
      button.style.transform = `translate(${x - 21}px, ${y - 55}px)`;
      button.style.zIndex = String(Math.round((this.projected.z + 1) * 100));
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    this.resizeObserver.disconnect();
    this.textures.forEach((texture) => texture.dispose());
    this.geometry.dispose();
    this.material.dispose();
    this.atmosphereMaterial.dispose();
    this.renderer.dispose();
  }
}
