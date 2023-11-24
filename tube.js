import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Tube {
    constructor(scene, height, top, bottom, tunnelHeight) {
        this.scene = scene;
        this.height = height;
        this.top = top;
        this.bottom = bottom;
        this.tunnelHeight = tunnelHeight;
        this.lowerTube = null;
        this.upperTube = null;
    }

    create(camera) {
        const loader = new GLTFLoader();

        loader.load('models/bird/tube.gltf', (gltf) => {
            this.lowerTube = gltf.scene.clone();
            this.upperTube = gltf.scene.clone();

            // Позиционируем нижний блок
            this.lowerTube.position.set(0, 0, camera.position.z + 200);
            this.lowerTube.scale.set(5, 5, 5); // Масштабируйте под свои нужды
            this.scene.add(this.lowerTube);

            // Позиционируем верхний блок
            this.upperTube.position.set(0, this.top, camera.position.z + 200);
            this.upperTube.scale.set(5, 5, 5); // Масштабируйте под свои нужды
            this.upperTube.rotateZ(Math.PI)
            this.scene.add(this.upperTube);
        });
    }

    remove() {
        if (this.lowerTube) {
            this.scene.remove(this.lowerTube);
            this.lowerTube.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            this.lowerTube = null;
        }

        if (this.upperTube) {
            this.scene.remove(this.upperTube);
            this.upperTube.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            this.upperTube = null;
        }
    }

    setPositionZ(coordinateZ) {
        if (this.lowerTube) {
            this.lowerTube.position.z = coordinateZ;
        }
        if (this.upperTube) {
            this.upperTube.position.z = coordinateZ;
        }
    }

    getPosition() {
        return(this.lowerTube.position);
    }
}

export default Tube;