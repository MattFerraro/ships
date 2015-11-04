
function Ship (x, y) {
	var ship = {};
	ship.class = "default";
	var shipPrototypes = {
		default: {
			size: 10, 		// measured in pixels
			maxSpeed: 1,  	// measured in pixels/second
			initialHealth: 100,
			mass: 1,
			moment: 1,
			maxTorque: 1,
			maxMainThrust: 100,
			maxSideThrust: 20,
			timeLastCannonFire: 0,
			cannonTimeout: 1000,
			cannonSpeed: 100
		}
	}
	ship.image = shipyard(20, 20);

	// Copy over all the default params from the ship prototype
	for(var k in shipPrototypes[ship.class]) {
		ship[k]=shipPrototypes[ship.class][k];
	}
	ship.x = x;
	ship.y = y;
	ship.dx = Math.random() * 20 - 10;
	ship.dy = Math.random() * 20 - 10;

	ship.theta = 180 * Math.PI / 180;
	ship.dtheta = 0;

	ship.health = ship.initialHealth;
	return ship;
}

function Team (color, basePosition, numberOfShips) {
		var team = {};
		var x, y;
		team.color = color;
		team.base = {
			position: basePosition,
			size: 40,
			health: 1000
		};
		team.ships = [];
		for (var j = 0; j < numberOfShips; j++) {
			x = team.base.position.x;
			y = team.base.position.y + 20 * j - numberOfShips/2 * 20;
			team.ships.push(Ship(x, y));
		}
	return team;
};

function globalInit() {
	// Returns the initial global state
	var globalState = {};

	var colors = ["red", "blue"];
	var basePositions = [{x: 200, y: 350}, {x: 900, y: 350}];
	var numberOfShips = 40;
	globalState.teams = [];
	for (var i = 0; i < 2; i++) {
		globalState.teams.push(Team(colors[i], basePositions[i], numberOfShips));
	}
	globalState.bullets = [];
	return globalState;
}


function globalUpdate(globalState, dt, allCommands) {
	// Input: the global state
	// This function's job is to morph the global state to propogate the
	// physics of the simulated universe
	for (var i = globalState.teams.length - 1; i >= 0; i--) {
		var team = globalState.teams[i];
		var commands = allCommands[i];

		var currentTime = new Date().getTime();
		for (var j = team.ships.length - 1; j >= 0; j--) {
			var ship = team.ships[j];
			// get any commands addressed to this ship and apply them
			var command = commands[j];
			var torque = command.torque;
			var mainThrust = command.mainThrust;
			if (mainThrust > ship.maxMainThrust) {
				mainThrust = ship.maxMainThrust;
			}
			else if (mainThrust < -ship.maxMainThrust) {
				mainThrust = -ship.maxMainThrust;
			}

			var sideThrust = command.sideThrust;
			if (sideThrust > ship.maxSideThrust) {
				sideThrust = ship.maxSideThrust;
			}
			else if (sideThrust < -ship.maxSideThrust) {
				sideThrust = -ship.maxSideThrust;
			}

			// given the state of this ship's derivatives, assume constant
			// and propagate forward for a small dt
			ship.dtheta += torque * dt;
			ship.theta += ship.dtheta * dt;

			var mainAccel = mainThrust / ship.mass;
			var sideAccel = sideThrust / ship.mass;

			var cosTheta = Math.cos(ship.theta);
			var sinTheta = Math.sin(ship.theta);
			ship.dx += cosTheta * mainAccel * dt - sinTheta * sideAccel * dt;
			ship.dy += sinTheta * mainAccel * dt + cosTheta * sideAccel * dt;

			ship.x += ship.dx * dt;
			ship.y += ship.dy * dt;

			if (command.fireCannon) {
				if (currentTime > ship.timeLastCannonFire + ship.cannonTimeout) {
					ship.timeLastCannonFire = currentTime;

					globalState.bullets.push({
						x: ship.x,
						y: ship.y,
						dx: ship.dx + ship.cannonSpeed * cosTheta,
						dy: ship.dy + ship.cannonSpeed * sinTheta,
						age: 0
					});
				}
 			}
		};
	};

	// Handle bullet physics!
	var baseZero = globalState.teams[0].base;
	var baseOne = globalState.teams[1].base;
	_.map(globalState.bullets, function(bullet) {
		bullet.age++;
		bullet.x += bullet.dx * dt;
		bullet.y += bullet.dy * dt;

		// Handle collision of bullets against home bases
		if (bullet.x > baseZero.position.x - baseZero.size / 2 &&
			bullet.x < baseZero.position.x + baseZero.size / 2 &&
			bullet.y > baseZero.position.y - baseZero.size / 2 &&
			bullet.y < baseZero.position.y + baseZero.size / 2) {
			bullet.age = 1000000;
			baseZero.health -= 10;
		}
		if (bullet.x > baseOne.position.x - baseOne.size / 2 &&
			bullet.x < baseOne.position.x + baseOne.size / 2 &&
			bullet.y > baseOne.position.y - baseOne.size / 2 &&
			bullet.y < baseOne.position.y + baseOne.size / 2) {
			bullet.age = 1000000;
			baseOne.health -= 10;
		}
	});
	// Get rid of old bullets
	globalState.bullets = _.filter(globalState.bullets, function(bullet) {
		return bullet.age < 100;
	});

}
