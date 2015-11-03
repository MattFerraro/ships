
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
			maxTorque: 1
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

	ship.theta = 45 * Math.PI / 180;
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
	var basePositions = [{x: 100, y: 350}, {x: 600, y: 350}];
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
			var sideThrust = command.sideThrust;

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

function drawRotatedImage(context, image, x, y, angle) {
 	var TO_RADIANS = Math.PI/180;

	// save the current co-ordinate system
	// before we screw with it
	context.save();

	// move to the middle of where we want to draw our image
	context.translate(x, y);

	// rotate around that point, converting our
	// angle from degrees to radians
	context.rotate(angle * TO_RADIANS);

	// draw it up and to the left by half the width
	// and height of the image
	context.drawImage(image, -(image.width/2), -(image.height/2));

	// and restore the co-ords to how they were when we began
	context.restore();
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
			var headingY = Math.sin(ship.theta) * 40;
			var headingX = Math.cos(ship.theta) * 40;
			// if the ship has a bitmap, fill with that
			if (ship.image) {
				ctx.save();
				ctx.translate(ship.x - 10, ship.y - 10);
				ctx.rotate(ship.theta + Math.PI/2);
				ctx.drawImage(ship.image, -10, -10);
				//ctx.rotate(-1*ship.theta);
				//ctx.translate(-1*ship.x, -1*ship.y);
				ctx.restore();
			} else {
				ctx.fillRect(ship.x - ship.size / 2, ship.y - ship.size / 2, ship.size, ship.size);

				ctx.strokeStyle = "#FFFFFF";
				ctx.beginPath();
				ctx.moveTo(ship.x,ship.y);
				ctx.lineTo(ship.x + headingX, ship.y + headingY);
				ctx.stroke();
			}
		};
	};
}
