function teamOneInit(globalState) {
    // Inputs: a copy of the global state
    // Outputs: team one's initial state, a dictionary

    // Each ship should pick a random spot near the enemy base and position
    // itself there. Pick our location by imagining a circle around the enemy
    // base, then picking a random spot on the circumference
    var radius = 100;
    var enemyTeam = globalState.teams[0];
    var myTeam = globalState.teams[1];
    var extraShipVars = _.map(myTeam.ships, function(ship) {
        var angle = Math.random() * Math.PI - Math.PI / 2;
        var x = Math.cos(angle) * radius + enemyTeam.base.position.x;
        var y = Math.sin(angle) * radius + enemyTeam.base.position.y;

        return {
            goalX: x,
            goalY: y,
            targetX: enemyTeam.base.position.x,
            targetY: enemyTeam.base.position.y
        };
    });
    return {
        extraShipVars: extraShipVars
    };
}

function getCommandsTeamOne(globalState, teamState) {
    // Input is (a copy of) the entire global state
    // Output is a dictionary of commands that are addressed to the ships
    // under the command of team one (the blue team)

    var myTeam = globalState.teams[1];
    var enemyTeam = globalState.teams[0];
    var enemyBase = enemyTeam.base;
    var extraShipVars = teamState.extraShipVars;

    var commands = [];
    for (var i = 0; i < myTeam.ships.length; i++) {
        var ship = myTeam.ships[i];
        var extraShipState = extraShipVars[i];
        var torque = 0;
        var mainThrust = 0;
        var sideThrust = 0

        var positionErrX = extraShipState.goalX - ship.x;
        var positionErrY = extraShipState.goalY - ship.y;

        var dt = 0.0001;

        var positionErrXdt = ship.dx;
        var positionErrYdt = ship.dy;

        var KpMain = -1;
        var KdMain = 1;

        var KpSide = -.5;
        var KdSide = 1;

        mainThrust = positionErrX * KpMain + positionErrXdt * KdMain;
        sideThrust = positionErrY * KpSide + positionErrYdt * KdSide;
        // mainThrust = 0;
        // sideThrust = 0;
        commands.push({
            torque: torque,
            mainThrust: mainThrust,
            sideThrust: sideThrust,
            fireCannon: true
        });
    }
    return commands;
}
