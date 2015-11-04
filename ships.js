
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
			maxThrust: 100
		}
	}
	ship.image = shipyard(20, 20);

	// Copy over all the default params from the ship prototype
	for(var k in shipPrototypes[ship.class]) {
		ship[k]=shipPrototypes[ship.class][k];
	}
	ship.x = x;
	ship.y = y;
	ship.dx = 0;  // Math.random() * 20 - 10;
	ship.dy = 0;  // Math.random() * 20 - 10;

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
			size: 40
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
	return globalState;
}


function globalUpdate(globalState, dt, allCommands) {
	// Input: the global state
	// This function's job is to morph the global state to propogate the
	// physics of the simulated universe
	for (var i = globalState.teams.length - 1; i >= 0; i--) {
		var team = globalState.teams[i];
		var commands = allCommands[i];

		for (var j = team.ships.length - 1; j >= 0; j--) {
			var ship = team.ships[j];
			// get any commands addressed to this ship and apply them
			var command = commands[j];
			var torque = command.torque;
			var mainThrust = command.mainThrust;
			if (mainThrust > ship.maxThrust) {
				mainThrust = ship.maxThrust;
			}
			else if (mainThrust < -ship.maxThrust) {
				mainThrust = -ship.maxThrust;
			}

			var sideThrust = command.sideThrust;
			if (sideThrust > ship.maxThrust) {
				sideThrust = ship.maxThrust;
			}
			else if (sideThrust < -ship.maxThrust) {
				sideThrust = -ship.maxThrust;
			}

			// given the state of this ship's derivatives, assume constant
			// and propagate forward for a small dt
			ship.dtheta += torque * dt;
			ship.theta += ship.dtheta * dt;

			var mainAccel = mainThrust / ship.mass;
			var sideAccel = sideThrust / ship.mass;
			ship.dx += Math.cos(ship.theta) * mainAccel * dt - Math.sin(ship.theta) * sideAccel * dt;
			ship.dy += Math.sin(ship.theta) * mainAccel * dt + Math.cos(ship.theta) * sideAccel * dt;

			ship.x += ship.dx * dt;
			ship.y += ship.dy * dt;
		};
	};
}
