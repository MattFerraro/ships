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
	var numShips = 40;
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
			ship.dx = Math.random() * 20 - 10;
			ship.dy = Math.random() * 20 - 10;

			ship.theta = 90 * Math.PI / 180;
			ship.dtheta = 0;

			ship.health = ship.initialHealth;
			team.ships.push(ship);
		}
		globalState.teams.push(team);
	}
	return globalState;
}

function teamZeroInit(globalState) {
	// Inputs: a copy of the global state
	// Outputs: team zero's initial state, a dictionary

	// Each ship should pick a random spot near the enemy base and position
	// itself there. Pick our location by imagining a circle around the enemy
	// base, then picking a random spot on the circumference
	var radius = 100;
	var enemyTeam = globalState.teams[1];
	var extraShipVars = _.map(globalState.teams[0].ships, function() {
		var angle = Math.random() * Math.PI + Math.PI / 2;
		var x = Math.cos(angle) * radius + enemyTeam.base.position.x;
		var y = Math.sin(angle) * radius + enemyTeam.base.position.y;

		return {
			goalX: x,
			goalY: y,
			targetX: enemyTeam.base.position.x,
			targetY: enemyTeam.base.position.y,
			mode: "stopping"
		};
	});
	return {
		extraShipVars: extraShipVars
	};
}

function teamOneInit(globalState) {
	// Inputs: a copy of the global state
	// Outputs: team one's initial state, a dictionary
	return {}
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
			var thrust = command.thrust;

			// given the state of this ship's derivatives, assume constant
			// and propagate forward for a small dt
			ship.dtheta += torque * dt;
			ship.theta += ship.dtheta * dt;

			var accel = thrust / ship.mass;
			ship.dx += Math.cos(ship.theta) * accel * dt;
			ship.dy += Math.sin(ship.theta) * accel * dt;

			ship.x += ship.dx * dt;
			ship.y += ship.dy * dt;
		};
	};
}

function getCommandsTeamZero(globalState, teamZeroState) {
	// Input is (a copy of) the entire global state
	// Output is a dictionary of commands that are addressed to the ships
	// under the command of team zero

	function getTorque(theta, dtheta, goalTheta) {
		// simple PID controller to point the ship correctly
		var thetaE = goalTheta - theta;
		var thetaEt1 = goalTheta - theta + dtheta * 0.01;
		var thetaEDot = thetaEt1 - thetaE;
		var kP = 100;
		var kD = 1000;
		return thetaE * kP - thetaEDot * kD;
	}


	var team = globalState.teams[0];
	var enemyTeam = globalState.teams[1];
	var enemyBase = enemyTeam.base;
	var extraShipVars = teamZeroState.extraShipVars;

	var commands = [];
	for (var i = 0; i < team.ships.length; i++) {
		var ship = team.ships[i];
		var extraShipState = extraShipVars[i];
		var torque = 0;
		var thrust = 0;
		// Proposed controller: First: stop almost completely
		// Second: point toward where the ship needs to go
		// Third: move to the new position
		// Fourth: stop (almost) completely
		// Fifth: point towards the target

		if (extraShipState.mode == "stopping") {
			// Just stop.
			// So really just align theta with Math.atan2(dx, dy)
			// then apply negative thrust
			var goalTheta = Math.atan2(ship.dy, ship.dx);
			torque = getTorque(ship.theta, ship.dtheta, goalTheta);

			if (Math.abs(ship.theta - goalTheta) < 5 * Math.PI / 180) {
				// Only apply thrust if we're close to the heading we want
				var speed = Math.hypot(ship.dx, ship.dy);
				var kP = -10;
				thrust = speed * kP;
			}

			if (speed < .01) {
				thrust = 0;
				torque = 0;
				extraShipState.mode = "locationPointing";
			}
		}

		if (extraShipState.mode == "locationPointing") {
			var positionEx = extraShipState.goalX - ship.x;
			var positionEy = extraShipState.goalY - ship.y;
			var goalTheta = Math.atan2(positionEy, positionEx);
			torque = getTorque(ship.theta, ship.dtheta, goalTheta);

			if (Math.abs(goalTheta - ship.theta) < .001 * Math.PI / 180 && Math.abs(ship.dtheta) < 0.002) {
				thrust = 0;
				torque = 0;
				extraShipState.mode = "locationCruising";
			}
		}

		if (extraShipState.mode == "locationCruising") {
			var kP = 1;
			var kD = 2;
			var positionEx = extraShipState.goalX - ship.x;
			var positionEy = extraShipState.goalY - ship.y;
			var dist = Math.hypot(positionEx, positionEy);

			var heading = Math.atan2(positionEx, positionEy);

			// This is the dot product of the heading (thrust) vector and the error vector
			var thrustHelpsAmount = positionEx * Math.cos(ship.theta) + positionEy * Math.sin(ship.theta);

			var positionExT1 = positionEx - ship.dx * .01;
			var positionEyT1 = positionEy - ship.dy * .01;
			var distT1 = Math.hypot(positionExT1, positionEyT1);
			var distDot = distT1 - dist;

			var velocity = Math.hypot(ship.dx, ship.dy);

			var thrust = kP * thrustHelpsAmount - kD * velocity;

			if (dist < 5) {
				thrust = 0;
				torque = 0;
				extraShipState.mode = "targetPointing";
			}
		}

		if (extraShipState.mode == "targetPointing") {
			var positionEx = extraShipState.targetX - extraShipState.goalX;
			var positionEy = extraShipState.targetY - extraShipState.goalY;
			var goalTheta = Math.atan2(positionEy, positionEx);
			torque = getTorque(ship.theta, ship.dtheta, goalTheta);
		}

		commands.push({
			torque: torque,
			thrust: thrust
		});
	};
	return commands
}

function getCommandsTeamOne(globalState, teamOneState) {
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

			var headingY = Math.sin(ship.theta) * 40;
			var headingX = Math.cos(ship.theta) * 40;
			ctx.strokeStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(ship.x,ship.y);
			ctx.lineTo(ship.x + headingX, ship.y + headingY);
			ctx.stroke();
		};
	};
}
