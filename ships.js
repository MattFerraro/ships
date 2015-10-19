var shipPrototypes = {
	default: {
		size: 10, 		// measured in pixels
		maxSpeed: 1,  	// measured in pixels/second
		initialHealth: 100,
		mass: 1,
		moment: 1,
		maxTorque: 1
	}
}

function globalInit() {
	// Returns the initial global state
	var globalState = {};

	var colors = ["red", "blue"];
	var basePositions = [{x: 100, y: 350}, {x: 600, y: 350}];
	var numShips = 10;
	globalState.teams = [];
	for (var i = 0; i < 2; i++) {
		var team = {};
		team.color = colors[i];
		team.base = {
			position: basePositions[i],
			size: 40
		};
		team.ships = [];
		for (var j = 0; j < numShips; j++) {
			var ship = {};
			ship.class = "default";
			// Copy over all the default params from the ship prototype
			for(var k in shipPrototypes[ship.class]) {
				ship[k]=shipPrototypes[ship.class][k];
			}
			ship.x = team.base.position.x;
			ship.y = team.base.position.y + 20 * j - numShips/2 * 20;
			ship.speed = 0;

			ship.theta = 90 * Math.PI / 180;
			ship.dtheta = 0;

			ship.health = ship.initialHealth;
			team.ships.push(ship);
		}
		globalState.teams.push(team);
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
			// var thrust = command.thrust;
			var torque = command.torque;

			ship.dtheta += torque * dt;
			ship.theta += ship.dtheta * dt;

			// given the state of this ship's derivatives, assume constant
			// and propagate forward for a small dt
			var dx = Math.cos(ship.theta) * ship.speed;
			var dy = Math.sin(ship.theta) * ship.speed;
			ship.x += dx * dt;
			ship.y += dy * dt;
		};
	};
}

function getCommandsTeamZero(globalState) {
	// Input is (a copy of) the entire global state
	// Output is a dictionary of commands that are addressed to the ships
	// under the command of team zero
	var team = globalState.teams[0];
	var enemyTeam = globalState.teams[1];
	var enemyBase = enemyTeam.base;

	var commands = [];
	for (var i = 0; i < team.ships.length; i++) {
		var ship = team.ships[i];
		var baseDx = enemyBase.position.x - ship.x;
		var baseDy = enemyBase.position.y - ship.y;
		var goalHeading = Math.atan2(baseDy, baseDx);
		var eHeading = goalHeading - ship.theta;
		// If we just kept moving with our current dtheta, what would happen
		// to our theta error?
		var eHeadingF = goalHeading - ship.theta + ship.dtheta * .01;
		// the derivative of the error
		var deHeading = eHeadingF - eHeading;

		var kP = 100;
		var kD = 1000;

		commands.push({
			torque: eHeading * kP - deHeading * kD, // simple PID control
			thrust: 0
		});
	};
	return commands
}

function getCommandsTeamOne(globalState) {
	// Input is (a copy of) the entire global state
	// Output is a dictionary of commands that are addressed to the ships
	// under the command of team one
	var team = globalState.teams[1];
	var enemyTeam = globalState.teams[0];
	var enemyBase = enemyTeam.base;

	var commands = [];
	for (var i = 0; i < team.ships.length; i++) {
		commands.push({
			torque: .1,
			thrust: 0
		});
	};
	return commands;
}

function globalDraw(canvas, globalState) {
	var ctx=canvas.getContext("2d");

	// clear the screen
	ctx.fillStyle="#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// console.log(globalState);
	// draw the teams
	for (var i = globalState.teams.length - 1; i >= 0; i--) {
		var team = globalState.teams[i];
		ctx.fillStyle = team.color;

		// draw the home base
		var base = team.base;
		ctx.fillRect(base.position.x - base.size / 2, team.base.position.y - base.size / 2, base.size, base.size);

		// draw each ship
		for (var j = team.ships.length - 1; j >= 0; j--) {
			var ship = team.ships[j];
			ctx.fillRect(ship.x - ship.size / 2, ship.y - ship.size / 2, ship.size, ship.size);

			var headingY = Math.sin(ship.theta) * 10;
			var headingX = Math.cos(ship.theta) * 10;
			ctx.strokeStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(ship.x,ship.y);
			ctx.lineTo(ship.x + headingX, ship.y + headingY);
			ctx.stroke();
		};
	};
}
