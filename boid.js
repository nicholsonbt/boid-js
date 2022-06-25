var BOID = {};
BOID.SETTINGS = {};

BOID.SETTINGS.DELTA_T = 0.01;
BOID.SETTINGS.BOIDS = 100;
BOID.SETTINGS.BOID_RADIUS = 2;

BOID.SETTINGS.VIEWING = {};            // All boid settings to do with (simulated) vision.
BOID.SETTINGS.VIEWING.FOV = [0, 80, 180];        // The field of view of the boid in degrees.
BOID.SETTINGS.VIEWING.DISTANCE = [0, 5, 100];    // How far ahead the boid can see.
BOID.SETTINGS.VIEWING.CERTAINTY = [0, 0.8, 1]; // How closely the boid will try to follow those ahead of it.

BOID.SETTINGS.MOVEMENT = {};
BOID.SETTINGS.MOVEMENT.SPEED = [0.1, 1, 100];
BOID.SETTINGS.MOVEMENT.BUBBLE = [0.1, 1, 10];
BOID.SETTINGS.MOVEMENT.RANDOMNESS = 0.1;
BOID.SETTINGS.MOVEMENT.TURINING_SPEED = 0.2;

BOID.SETTINGS.INDIVIDUALITY = {};                 // All boid settings to do with how similarly boids will behave
BOID.SETTINGS.INDIVIDUALITY.FOV_SD = 0.1;         // Standard deviation of a boids field of view.
BOID.SETTINGS.INDIVIDUALITY.DISTANCE_SD = 0.1;    // Standard deviation of a boids maximum viewing distance
BOID.SETTINGS.INDIVIDUALITY.CERTAINTY_SD = 0.1;   // Standard deviation of a boids confidence in other boids.
BOID.SETTINGS.INDIVIDUALITY.BOID_RADIUS_SD = 0.1; // Standard deviation of a boids size.

BOID.Boid = function() {
	this.radius
}

BOID.BOID_CREATION = {};


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
	[u0, u1] = BOID.BOID_CREATION.RandomNormals();
	
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
 * @param {number} sd The standard deviation of the random number ot be generated.
 * @param {number} min The minimum value that may be returned.
 * @param {number} max The maximum value that may be returned.
 * @param {number} skew The skew of the random number to be generated.
 *
 * @returns A random number.
 */
BOID.BOID_CREATION.Random = function(mean, sd, min, max, skew=0) {
	// Calculate a skewed, normally distributed, random number.
	let r = BOID.BOID_CREATION.RandomNormalSkewed(mean, sd, skew);
	
	// If the number is outside the given bounds, return one that isn't.
	if (r < min || r > max)
		return BOID.BOID_CREATION.Random(mean, sd, min, max, skew);
	
	// Return the skewed, normally distributed, random number.
	return r;
}

// BOID.BOID_CREATION.Radius() {
	
// }
