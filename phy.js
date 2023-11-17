import "./oimo.js";

// WORLD
const world = new OIMO.World({ 
    timestep: 1 / 30, 
    iterations: 8, 
    broadphase: 2, // 1: brute force, 2: sweep and prune, 3: volume tree
    worldscale: 0.5, // scale full world
    random: true, // randomize sample
    info: false, // calculate statistic or not
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

let sphere = world.add(sphereConfig);

const updatePosition = (obj) => {
    const position = sphere.getPosition();
    sphere.position.z += 0.1;
    // if out of height
    if (position.y < -40) {
        // Remove the sphere from the world
        world.remove(sphere);

        // Create a new sphere configuration with the desired initial position
        const newBodyConfig = {
            type: 'sphere',
            size: [3, 3, 3],
            pos: [0, 35, 0],  // New initial position
            move: true, // allow movement
            density: 0.1, // density of the object
            friction: 0.2, // friction
            restitution: 0.6, // bounciness
        };

        // Add the new sphere to the world
        const newBody = world.add(newBodyConfig);

        // Use the new sphere for future updates
        sphere = newBody;
    }

    obj.position.set(position.x, position.y, sphere.position.z);
    return position;
}

const updateSphereRotation = (obj) => {
    const rotation = sphere.getQuaternion();
    obj.quaternion.set(0, 0, 0, 0);
    return rotation;
}

const sphereJump = (obj) => {
    console.log("JUMP")
    const position = new OIMO.Vec3(0, 0, 0);
    const force = new OIMO.Vec3(0, 2225, 0);
    sphere.applyImpulse(position, force);
    const newPosition = sphere.getPosition();
    obj.position.set(newPosition.x, newPosition.y, newPosition.z);
};

const updatePhysics = () => {
    world.step();
}

export { world, sphereConfig, updatePosition, updateSphereRotation, updatePhysics, sphereJump };