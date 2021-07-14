const { startMatlab, runMatlabCommand, closeMatlab } = require("./matlab");

// Don't forget to set environment variables
startMatlab().then(async (process) => {
    let output = await runMatlabCommand(process, " a = 3 + 4; fprintf(1, \"%f\", [a])");
    console.log(output);
    closeMatlab(process);
})