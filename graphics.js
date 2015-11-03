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

	};

	for (var i = globalState.teams.length - 1; i >= 0; i--) {
		var team = globalState.teams[i];
		ctx.fillStyle = team.color;

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
