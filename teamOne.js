function teamOneInit(globalState) {
    // Inputs: a copy of the global state
    // Outputs: team one's initial state, a dictionary
    return {}
}

function getCommandsTeamOne(globalState, teamOneState) {
    // Input is (a copy of) the entire global state
    // Output is a dictionary of commands that are addressed to the ships
    // under the command of team one (the blue team)

    return _.map(globalState.teams[1].ships, function (ship) {
        return {torque: 0.0, mainThrust: 10, sideThrust: 0}
    });
}
