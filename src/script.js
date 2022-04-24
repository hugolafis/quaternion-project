import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as Utils from '/src/helpers/utils.js';
import { CubeReflectionMapping, DoubleSide } from 'three';

const canvas = document.querySelector('canvas.webgl')
const page = document.getElementById('page')
const fpsInfo = document.getElementById('fpsInfo');
const clock = new THREE.Clock();
let delta;
let targetQuaternion = new THREE.Quaternion();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Event listeners
window.addEventListener('resize', function (e) {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

document.getElementById('x').addEventListener('change', clampInput);
document.getElementById('y').addEventListener('change', clampInput);
document.getElementById('z').addEventListener('change', clampInput);
document.getElementById('w').addEventListener('change', clampInput);
document.getElementById('applyQuatBtn').addEventListener('click', setQuaternion);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0feff);

const hemiLight = new THREE.HemisphereLight(0xf0feff, 0x7a5527, 0.75);
const sun = new THREE.DirectionalLight(0xf0feff, 1);
sun.castShadow = true;
sun.position.set(
    5,
    25,
    15
);
sun.shadow.mapSize.width = 2048; // default
sun.shadow.mapSize.height = 2048; // default

const helper = new THREE.CameraHelper( sun.shadow.camera );

const floorGeo = new THREE.PlaneGeometry(10, 10);
const floorMat = new THREE.MeshStandardMaterial({color: 0x7a5527});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;

const cubeGeo = new THREE.BoxGeometry(1, 1);
const cubeMat = new THREE.MeshStandardMaterial({color: 0x6242a6});
const cube = new THREE.Mesh(cubeGeo, cubeMat);
cube.castShadow = true;
cube.position.y = 1.5;

const axisHelper = new THREE.AxesHelper(1.25);
cube.add(axisHelper);

const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 4;
camera.position.y = 3;
camera.rotation.x = -Math.PI / 8;

init();

function init () {
    scene.add(camera);    
    scene.add(sun);    
    //scene.add(helper);    
    scene.add(hemiLight);    
    scene.add(floor);    
    scene.add(cube);

    tick();
}

function tick () {
    delta = clock.getDelta();

    renderer.render(scene, camera);
    updateQuaternion();
    updateInfo();
    requestAnimationFrame(tick)
}

function updateInfo () {
    fpsInfo.textContent = 
        `X: ${cube.quaternion.x.toFixed(7)} \n 
        Y: ${cube.quaternion.y.toFixed(7)} \n
        Z: ${cube.quaternion.z.toFixed(7)} \n
        W: ${cube.quaternion.w.toFixed(7)} \n`;
}

function updateQuaternion() {
    cube.quaternion.slerp(targetQuaternion, delta);
}

function setQuaternion () {
    const values = {
        x: parseFloat(document.getElementById('x').value),
        y: parseFloat(document.getElementById('y').value),
        z: parseFloat(document.getElementById('z').value),
        w: parseFloat(document.getElementById('w').value),
    }

    for (const prop in values) {
        if  (isNaN(values[prop])) {
            document.getElementById(prop).value = 0;
            values[prop] = 0;
        }
    }

    targetQuaternion.set(
        values.x,
        values.y,
        values.z,
        values.w,
    )

    targetQuaternion.normalize();

    // Set our DOM elements to the normalised vals
    document.getElementById('x').value = targetQuaternion.x;
    document.getElementById('y').value = targetQuaternion.y;
    document.getElementById('z').value = targetQuaternion.z;
    document.getElementById('w').value = targetQuaternion.w;
}

function clampInput () {
    let val = parseFloat(this.value);
    if (val < 0) { 
        this.value = 0; 
    } else if (val > 1) {
        this.value = 1;
    } else {
        this.value = val;
    }
}