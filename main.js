import * as THREE from 'three';
import "./style.css"
import gsap from "gsap";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as PHY from "./phy.js";
import { Tube as Tube } from "/tube.js";

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color('white');
const gradientTexture = new THREE.TextureLoader().load("vivid-blurred-colorful-background.jpg");
scene.background = gradientTexture;

// Sphere
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

// GROUND
const GROUNDgeometry = new THREE.BoxGeometry(30, 30, 600);
const GROUNDmaterial = new THREE.MeshStandardMaterial({
    color: '#00ffff',
    roughness: 0.1
})
const GROUND = new THREE.Mesh(GROUNDgeometry, GROUNDmaterial);
GROUND.position.set(0, -50, 0);
scene.add(GROUND);

// SKY
const SKYgeometry = new THREE.BoxGeometry(30, 30, 600);
const SKYmaterial = new THREE.MeshStandardMaterial({
    color: '#00ffff',
    roughness: 0.1
})
const SKY = new THREE.Mesh(GROUNDgeometry, GROUNDmaterial);
SKY.position.set(0, 100, 0);
scene.add(SKY);

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
camera.position.z = -140;
camera.position.x = -140;
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
controls.enableRotate = false;
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
    gltf.scene.position.set(0, -10, 0);
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
        loadedGLTF.scene.traverse(child => {
            if (child.name == 'leftWind' || child.name == 'rightWind') {
                const pos = PHY.getSphereRotation();
                child.quaternion.set(pos.x, pos.y, pos.z, pos.w);
            }
        })
    }
})
window.addEventListener('keydown', (e) => {
    if (e.key == ' ' || e.key == 'ArrowUp') {
        if (loadedGLTF) {
            PHY.sphereJump(loadedGLTF.scene); // jump
        }
    }
})
window.addEventListener('mouseup', () => { mouseDown = false; })



// ------------- Инициализация игры -------------

const top = 75;
const bottom = -30;
const height = top - bottom;
const tunnelHeight = height * 0.4;

const tubes = [];
const initialZ = camera.position.z + 10;

const createTube = () => {
    const newTube = new Tube(scene, height, top, bottom, tunnelHeight);
    newTube.create(camera, () => {
        newTube.setPosition(initialZ + tubes.length * 10);
        tubes.push(newTube);

        if (tubes.length < 5) {
            createTube(); // Рекурсивно создаем следующую трубу
        }
    });
};

const initializeTubes = () => {
    createTube();
};

initializeTubes();

const updateTubes = () => {
    const firstTubeZ = tubes[0].lowerTube.position.z;
    if (camera.position.z > firstTubeZ) {
        const removedTube = tubes.shift();
        removedTube.remove();

        const lastTubeZ = tubes[tubes.length - 1].lowerTube.position.z; 
        const newTubeZ = lastTubeZ + 10;

        const newTube = new Tube(scene, height, top, bottom, tunnelHeight);
        newTube.create(camera);
        newTube.setPosition(newTubeZ);
        tubes.push(newTube);
    }
}

const loop = () => {
    controls.update();
    PHY.updatePhysics();
    if (loadedGLTF) {
        PHY.updatePosition(loadedGLTF.scene);
        loadedGLTF.scene.traverse(child => {
            if (child.name == 'leftWind' || child.name == 'rightWind') {
                const pos = PHY.getSphereRotation();
                child.quaternion.set(pos.x, pos.y, pos.z, pos.w);
            }
        })
        // PHY.updateSphereRotation(loadedGLTF.scene);
        controls.target.set(loadedGLTF.scene.position.x, 23, loadedGLTF.scene.position.z);
        camera.position.z = loadedGLTF.scene.position.z;
        GROUND.position.z = camera.position.z;
        SKY.position.z = camera.position.z;
        updateTubes();
    }

    renderer.render(scene,camera);
    window.requestAnimationFrame(loop);
}
loop();