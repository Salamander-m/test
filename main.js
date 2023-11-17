import * as THREE from 'three';
import "./style.css"
import gsap from "gsap";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as PHY from "./phy.js";
// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color('white');
const gradientTexture = new THREE.TextureLoader().load("vivid-blurred-colorful-background.jpg");
scene.background = gradientTexture;

// Sphere 2
const sizeSPHERE = PHY.sphereConfig.size;
const geometry2 = new THREE.SphereGeometry(sizeSPHERE[0]);
const material2 = new THREE.MeshStandardMaterial({
    color: '#a64444',
    roughness: 0.2,
    metalness: 0.3,
})
const sphere = new THREE.Mesh(geometry2, material2);
sphere.position.set(10, 0, 0);
scene.add(sphere);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

// Создаем вспомогательные оси
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

// Lights
const lightTOP = new THREE.HemisphereLight(0xffffff);
lightTOP.position.set(0, 40, 30);
scene.add(lightTOP);
// Camera
const camera = new THREE.PerspectiveCamera(
    50, 
    sizes.width / sizes.height, 
    0.1, 
    1000
);
camera.position.z = -40;
camera.position.x = -40;
camera.position.y = 0;
scene.add(camera);

// Renderer
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(2);
renderer.render(scene, camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enablePan = false;
controls.enableZoom = false;
// controls.autoRotate = true;
// controls.autoRotateSpeed = 5;


// Resize
window.addEventListener('resize', () => {
    // Update Sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    // Update Camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
})


let loadedGLTF;
const loader = new GLTFLoader().setPath('models/bird/');

loader.load('bird.gltf', (gltf) => {
    console.log('loaded');
    gltf.scene.traverse(child => {
        console.log(child.name);
        child.castShadow = true;
    });

    gltf.scene.scale.set(2, 2, 2);
    gltf.scene.position.set(10, 10, 10);
    scene.add(gltf.scene);
    loadedGLTF = gltf;
});

// TimeLine
const tl = gsap.timeline({defaults: {duration: 1 } });
tl.fromTo(sphere.scale, { z: 0, x: 0, y: 0}, {z: 1, x: 1, y: 1});
tl.fromTo("nav", { y: "-100%"}, { y: "0%"});

// Mouse Animation
let mouseDown = false;
let rgb = [];
window.addEventListener('mousedown', () => { 
    mouseDown = true; // for mouse move
    if (loadedGLTF) {
        PHY.sphereJump(loadedGLTF.scene); // jump
    }
})
window.addEventListener('mouseup', () => { mouseDown = false; })

window.addEventListener('mousemove', (e) => {
})

const loop = () => {
    controls.update();
    PHY.updatePhysics();
    if (loadedGLTF) {
        PHY.updatePosition(loadedGLTF.scene);
        PHY.updateSphereRotation(loadedGLTF.scene);
        controls.target.set(loadedGLTF.scene.position.x, loadedGLTF.scene.position.y, loadedGLTF.scene.position.z);
        camera.position.z += 0.1;
    }

    renderer.render(scene,camera);
    window.requestAnimationFrame(loop);
}
loop();

