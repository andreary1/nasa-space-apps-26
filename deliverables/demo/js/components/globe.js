import * as THREE from '../../vendor/three.module.js';

// Equirectangular texture: Greenwich is +X; east longitudes point toward -Z.
const photosUrl = new URL('../data/site-photos.json', import.meta.url);

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
    this.scene.add(new THREE.AmbientLight(0xeef4ff, 1.65));
    const light = new THREE.DirectionalLight(0xffffff, 2.1);
    light.position.set(-3, 5, 6);
    this.scene.add(light);
    const fill = new THREE.DirectionalLight(0xc5e7ff, .75);
    fill.position.set(4, -1, 3);
    this.scene.add(fill);
    this.geometry = new THREE.SphereGeometry(1, 96, 64);
    this.material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 7,
      specular: 0x1c2e38,
      normalScale: new THREE.Vector2(6, 6),
    });
    this.planet.add(new THREE.Mesh(this.geometry, this.material));
    this.atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      vertexShader:
        'varying vec3 vNormal; varying vec3 vPosition; void main(){vNormal=normalize(normalMatrix*normal); vec4 p=modelViewMatrix*vec4(position,1.0); vPosition=p.xyz; gl_Position=projectionMatrix*p;}',
      fragmentShader:
        'varying vec3 vNormal; varying vec3 vPosition; void main(){float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(-vPosition))),3.5);gl_FragColor=vec4(0.42,0.77,1.0,rim*0.24);}',
    });
    const atmosphere = new THREE.Mesh(this.geometry, this.atmosphereMaterial);
    atmosphere.scale.setScalar(1.026);
    this.planet.add(atmosphere);
    this.cloudMaterial = new THREE.MeshLambertMaterial({color: 0xf3f8ff, transparent: true, opacity: .22, depthWrite: false});
    const clouds = new THREE.Mesh(this.geometry, this.cloudMaterial);
    clouds.scale.setScalar(1.003); this.planet.add(clouds);
    this.textures = [];
    this.projected = new THREE.Vector3();
    this.rotationStep = new THREE.Quaternion();
    this.axis = new THREE.Vector3(0, 1, 0);
    this.onSelect = onSelect;
    this.setLocations(locations);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
  }

  setLocations(locations) {
    document.getElementById('pins').replaceChildren();
    this.pins = locations.map((location) => {
      const button = document.createElement('button');
      button.className = 'globe-pin';
      button.dataset.category = location.category;
      button.dataset.tone = location.tone || '';
      button.dataset.location = location.id;
      button.setAttribute('aria-label', `Selecionar ${location.name}`);
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `<span class="pin-badge"><svg aria-hidden="true"><use href="#i-${location.category === 'crater' ? 'crater' : 'dune'}"/></svg></span><span class="pin-photo" aria-hidden="true"></span><span class="pin-stem"></span><span class="pin-dot"></span><span class="pin-tooltip"></span>`;
      button.querySelector('.pin-tooltip').textContent = location.name;
      button.addEventListener('click', () => {
        if (!this.suppressClick) this.onSelect(location);
      });
      document.getElementById('pins').append(button);
      return {
        button,
        location,
        vector: geographicVector(location.lat, location.lon),
      };
    });
  }

  async load() {
    const loader = new THREE.TextureLoader();
    const resolution = matchMedia('(max-width: 1000px)').matches || this.renderer.capabilities.maxTextureSize < 8192 ? '2k' : '8k';
    const textures = await Promise.all(
      [`earth-day-${resolution}.jpg`, `earth-normal-${resolution}.png`, 'earth-water.jpg', 'earth-clouds.jpg'].map((file) =>
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
    const [day, normal, water, clouds] = textures;
    day.colorSpace = THREE.SRGBColorSpace;
    day.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    this.material.map = day;
    this.material.normalMap = normal;
    this.material.specularMap = water;
    normal.anisotropy = day.anisotropy;
    this.cloudMaterial.alphaMap = clouds;
    this.cloudMaterial.needsUpdate = true;
    // Retain real geographic texture detail, with the reference's pale land and blue oceans.
    this.material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float ocean = texture2D(specularMap, vSpecularMapUv).r;
        float luminance = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
        vec3 land = mix(vec3(0.48, 0.55, 0.66), vec3(0.82, 0.86, 0.93), clamp(luminance * 0.68 + 0.35, 0.0, 1.0));
        vec3 sea = mix(vec3(0.075, 0.245, 0.37), vec3(0.13, 0.36, 0.49), clamp(luminance * 2.5, 0.0, 1.0));
        diffuseColor.rgb = mix(land, sea, smoothstep(0.1, 0.65, ocean));`,
      );
    };
    this.material.needsUpdate = true;
  }

  resize() {
    const { width, height } = this.container.getBoundingClientRect();
    // Hidden views have no dimensions. Keep the last valid camera until shown.
    if (!width || !height) return;
    this.width = width;
    this.height = height;
    const radius = Math.max(1, Math.min(width * 0.455, height * 0.425));
    this.container.parentElement.style.setProperty('--globe-diameter', `${radius * 2}px`);
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
    this.pins.forEach((pin) => {
      const pressed = pin.location.id === id;
      pin.button.setAttribute('aria-pressed', String(pressed));
      if (pressed) this.showPhoto(pin);
    });
  }

  // Fotos das localidades (js/data/site-photos.json), carregadas sob demanda.
  photoData() {
    this.photos ||= fetch(photosUrl)
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null);
    return this.photos;
  }

  async showPhoto({ button, location }) {
    const photo = (await this.photoData())?.sites?.[location.id];
    const holder = button.querySelector('.pin-photo');
    if (!photo?.image || !holder || holder.childElementCount) return;
    const image = new Image();
    image.alt = '';
    image.decoding = 'async';
    image.addEventListener('load', () => holder.classList.add('is-loaded'), { once: true });
    image.addEventListener('error', () => { delete button.dataset.hasPhoto; holder.replaceChildren(); }, { once: true });
    const credit = document.createElement('span');
    credit.className = 'pin-photo-credit';
    credit.textContent = [photo.author, photo.license].filter(Boolean).join(' · ');
    holder.append(image, credit);
    button.dataset.hasPhoto = 'true';
    button.setAttribute('aria-label', `Selecionar ${location.name}. Foto: ${credit.textContent}`);
    image.src = photo.image;
  }

  render() {
    this.container.parentElement.style.setProperty('--globe-scale', this.planet.scale.x);
    for (const { button, vector } of this.pins) {
      this.projected.copy(vector).applyQuaternion(this.planet.quaternion);
      const visible = this.projected.z > 0.13 && (!this.filter || this.filter === 'all' || button.dataset.category === this.filter);
      button.hidden = !visible;
      if (!visible) continue;
      this.projected
        .multiplyScalar(this.planet.scale.x * 1.004)
        .project(this.camera);
      const x = ((this.projected.x + 1) * this.width) / 2,
        y = ((1 - this.projected.y) * this.height) / 2;
      button.style.transform = `translate(${x - 21}px, ${y - 55}px)`;
      // O pin selecionado (com a foto aberta) fica sempre por cima dos outros.
      const front = button.getAttribute('aria-pressed') === 'true' ? 1000 : 0;
      button.style.zIndex = String(front + Math.round((this.projected.z + 1) * 100));
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
    this.cloudMaterial.dispose();
    this.renderer.dispose();
  }
}
