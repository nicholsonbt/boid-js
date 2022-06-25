var BOID = {};
BOID.SETTINGS = {};

BOID.SETTINGS.DELTA_T = 0.01;
BOID.SETTINGS.BOIDS = 100;
BOID.SETTINGS.SHOW_VIEWS = true;

BOID.SETTINGS.RADIUS = [1, 1.2, 1.5];         // The size of the boid.
BOID.SETTINGS.FOV = [0, 80, 180];             // The field of view of the boid in degrees.
BOID.SETTINGS.VIEWING_DISTANCE = [5, 10, 30]; // How far ahead the boid can see.
BOID.SETTINGS.GREGARIOUSNESS = [0, 0.8, 1];   // How closely the boid will try to follow those ahead of it.
BOID.SETTINGS.SPEED = [0.1, 1.2, 1.5];        // How quickly the boid moves.
BOID.SETTINGS.BUBBLE_INNER = [0.5, 1, 1.2];   // The radius the boid tries to keep other boids out of.
BOID.SETTINGS.BUBBLE_OUTER = [1.2, 2, 5];     // The radius the boid tries to keep other boids inside of.
BOID.SETTINGS.RANDOMNESS = [0, 0.1, 0.8];     // How much the boid will move randomly (0 = no randomness, 1 = only random movement).
BOID.SETTINGS.TURINING_SPEED = [1, 1.2, 5];   // How quickly the boid can turn.

BOID.BOID_CREATION = {};

// Skewed, normally distributed, random number generators.
/**
 * Uses the Box-Muller Transform to generate 2 normally distributed random numbers with a mean of 0.
 *
 * @returns [r0, r1] Two normally distributed random numbers with a mean of 0.
 */
BOID.BOID_CREATION.RandomNormals = function() {
	let magnitude, theta, u0, u1;
	
	u0 = 0;
	u1 = 0;
	
	while (u0 === 0) u0 = Math.random();
	while (u1 === 0) u1 = Math.random();
	
	magnitude = Math.sqrt(-2.0 * Math.log(u0));
	theta = 2.0 * Math.PI * u1;
	
	return [magnitude * Math.cos(theta), magnitude * Math.sin(theta)];
}

/**
 * Uses the Box-Muller Transform and mean, sd and skew parameters to generate a skewed, normally
 * distributed, random number.
 *
 * @param {number} mean The mean of the random number to be generated.
 * @param {number} sd The standard deviation of the random number ot be generated.
 * @param {number} skew The skew of the random number to be generated.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.RandomNormalSkewed = function(mean, sd, skew=0) {
	let u0, u1, coeff;
	
	// Generate two normally distributed random numbers using Box-Muller Transform.
	[u0, u1] = this.RandomNormals();
	
	// If skew is 0, we don't need to account for any skew.
	if (skew === 0)
		return mean + sd * u0;
	
	// If skew isn't 0, calculate the correlation coefficient (coeff).
	coeff = skew / Math.sqrt(1 + skew * skew);
	
	// Use coeff to get a correlated pair of random numbers.
	u1 = coeff * u0 + Math.sqrt(1 - coeff * coeff) * u1;
	
	// Return the skewed, normally distributed, random number.
	if (u0 >= 0)
		return mean + sd * u1;
	else
		return mean + sd * -u1;
}

/**
 * Generates a skewed, normally distributed, random number between two bounds.
 *
 * @param {number} mean The mean of the random number to be generated.
 * @param {number} min The minimum value that may be returned.
 * @param {number} max The maximum value that may be returned.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.RandomValue = function(mean, min, max) {
	// Calculate the median value between minimum and maximum.
	let median = (max + min) / 2;
	
	// Calculate the offset of the mean from the median.
	let offset = median - mean;
	
	// Calculate the SD by dividing the range by 2pi.
    // From my experiments, this gives a very good SD that gives samples covering the entire range
    // but results in only ~0.1 being outside the bounds.
	let sd = (max - min) / (2 * Math.PI);
	
	// I derived this from the Fisher-Pearson coefficient of skewness.
	let skew = Math.pow(offset, 3) / Math.pow(sd, 3);
	
	// Calculate a skewed, normally distributed, random number.
	let r = BOID.BOID_CREATION.RandomNormalSkewed(mean, sd, skew);
	
	// If the number is outside the given bounds, return one that isn't.
	if (r < min || r > max)
		return this.Random(mean, sd, min, max, skew);
	
	// Return the skewed, normally distributed, random number.
	return r;
}

/**
 * Returns a random (skewed and normal) number, given the passed settings.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.GenerateSetting = function(setting) {
	let [min, mean, max] = setting;
	return this.RandomValue(mean, min, max);
}


// Individual settings generator functions:
/**
 * Returns a random (skewed and normal) number, given the radius settings.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.Radius = function() {
	return this.GenerateSetting(BOID.SETTINGS.RADIUS);
}

/**
 * Returns a random (skewed and normal) number, given the fov settings.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.Fov = function() {
	return this.GenerateSetting(BOID.SETTINGS.FOV);
}

/**
 * Returns a random (skewed and normal) number, given the viewing distance settings.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.ViewingDistance = function() {
	return this.GenerateSetting(BOID.SETTINGS.VIEWING_DISTANCE);
}

/**
 * Returns a random (skewed and normal) number, given the gregariousness settings.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.Gregariousness = function() {
	return this.GenerateSetting(BOID.SETTINGS.GREGARIOUSNESS);
}

/**
 * Returns a random (skewed and normal) number, given the speed settings.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.Speed = function() {
	return this.GenerateSetting(BOID.SETTINGS.SPEED);
}

/**
 * Returns a random (skewed and normal) number, given the inner bubble settings.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.BubbleInner = function() {
	return this.GenerateSetting(BOID.SETTINGS.BUBBLE_INNER);
}

/**
 * Returns a random (skewed and normal) number, given the outer bubble settings.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.BubbleOuter = function() {
	return this.GenerateSetting(BOID.SETTINGS.BUBBLE_OUTER);
}

/**
 * Returns a random (skewed and normal) number, given the randomness settings.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.Randomness = function() {
	return this.GenerateSetting(BOID.SETTINGS.RANDOMNESS);
}

/**
 * Returns a random (skewed and normal) number, given the turning speed settings.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.TurningSpeed = function() {
	return this.GenerateSetting(BOID.SETTINGS.TURINING_SPEED);
}



BOID.BoidArray = [];

BOID.Boid = function() {
	this.radius = this.BOID_CREATION.Radius();
	this.fov = this.BOID_CREATION.Fov();
	this.viewingDistance = this.BOID_CREATION.ViewingDistance();
	this.gregariousness = this.BOID_CREATION.Gregariousness();
	this.speed = this.BOID_CREATION.Speed();
	this.bubbleInner = this.BOID_CREATION.BubbleInner();
	this.bubbleOuter = this.BOID_CREATION.BubbleOuter();
	this.randomness = this.BOID_CREATION.Randomness();
	this.turningSpeed = this.BOID_CREATION.TurningSpeed();
}



BOID.THREE = {};

BOID.THREE.CAMERA = null;
BOID.THREE.SCENE = null;
BOID.THREE.RENDERER = null;
BOID.THREE.FOV = 70;
BOID.THREE.PLANES = { near: 0.1, far: 100 };
BOID.THREE.Z_POSITION = 10;


// BOID.THREE.Resize = function(width, height) {
// }

// BOID.THREE.NodeAnimation = function(width, height) {
// }

// BOID.THREE.Render = function() {
// }

// BOID.THREE.SetupScene = function() {
// }

// BOID.THREE.GetBoundaryForces = function(x, y, z) {
// }

// BOID.THREE.Animate = function() {
// }


// window.addEventListener('load', function(e) {
	
// });