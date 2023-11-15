import "./oimo.js";

// WORLD
const world = new OIMO.World({ 
    timestep: 1 / 30, 
    iterations: 8, 
    broadphase: 3, // 1: brute force, 2: sweep and prune, 3: volume tree
    worldscale: 0.5, // scale full world
    random: true, // randomize sample
    info: false, // calculate statistic or not
    gravity: [0, -1, 0],
});

// Create a physics sphere using oimo.js
const sphereConfig = {
    type: 'sphere',
    size: [3, 3, 3], // radius, height, depth (for spheres, only radius is used)
    pos: [0, 20, 0], // initial position
    move: true, // allow movement
    density: 0.1, // density of the object
    friction: 0.2, // friction
    restitution: 0.6, // bounciness
};

// Create a physics sphere using oimo.js
const boxConfig = {
    type: 'box',
    size: [16, 16, 64], // radius, height, depth (for spheres, only radius is used)
    pos: [10, 0, 0], // initial position
    rot: [1, 0, 0],
    move: true, // allow movement
    density: 1, // density of the object
    friction: 0.2, // friction
    restitution: 0.6, // bounciness
};

let sphere = world.add(sphereConfig);
let box = world.add(boxConfig);

const updatePosition = (obj) => {
    const position = sphere.getPosition();
    const newPosition = new OIMO.Vec3(0, 0, 0);
    box.setPosition(newPosition);
    const contact = world.getContact( sphere, box );
    if (contact && contact.touching === true) {
        world.remove(sphere);
        console.log(contact);
    }

    // if out of height
    if (position.y < -40) {
        // Remove the sphere from the world
        world.remove(sphere);

        // Create a new sphere configuration with the desired initial position
        const newBodyConfig = {
            type: 'sphere',
            size: [3, 3, 3],
            pos: [5, 35, 0],  // New initial position
            move: true,
            density: 1,
            friction: 0.2,
            restitution: 0.2,
        };

        // Add the new sphere to the world
        const newBody = world.add(newBodyConfig);

        // Use the new sphere for future updates
        sphere = newBody;
    }

    obj.position.set(position.x, position.y, position.z);
    return position;
}

const updateBoxRotation = (obj) => {
    const rotation = box.getQuaternion();
    obj.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    return rotation;
}

const updateSphereRotation = (obj) => {
    const rotation = sphere.getQuaternion();
    obj.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    return rotation;
}

const sphereJump = (obj) => {
    const position = new OIMO.Vec3(0, 0, 0);
    const force = new OIMO.Vec3(0, 1225, 0);
    sphere.applyImpulse(position, force);
    obj.position.set(position.x, position.y, position.z);
};

const updatePhysics = () => {
    world.step();
}

export { world, sphereConfig, boxConfig, updatePosition, updateBoxRotation, updateSphereRotation, updatePhysics, sphereJump };