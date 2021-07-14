require('dotenv').config();
const { spawn } = require('child_process');

/**
 * Starts a matlab process.
 * @returns {Promise} A promise returning the process if successful
 */
const startMatlab = () =>
  new Promise((resolve, reject) => {
    const matlabProcess = spawn(process.env.MATLAB_LOCATION, ['-nodisplay', '-nosplash'], {
      cwd: `${process.env.MATLAB_CWD}`,
    });
    let errorListener;
    let stderrListener;
    let stdoutListener;
    const removeListeners = () => {
      matlabProcess.removeListener('error', errorListener);
      matlabProcess.stderr.removeListener('data', stderrListener);
      matlabProcess.stdout.removeListener('data', stdoutListener);
    };
    errorListener = err => {
      removeListeners();
      reject(err);
    };
    stderrListener = err => {
      removeListeners();
      reject(err);
    };
    stdoutListener = data => {
      if (data.toString() === '>> ') {
        removeListeners();
        resolve(matlabProcess);
      }
    };
    matlabProcess.addListener('error', errorListener);
    matlabProcess.stderr.addListener('data', stderrListener);
    matlabProcess.stdout.addListener('data', stdoutListener);
  });

/**
 * Runs the command using the matlab command line interface.
 * @param {ChildProcess} matlabProcess The matlab process to use
 * @param {String} command The command to run
 * @returns {Promise} A promise returning the stdout and stderr from matlab
 */
const runMatlabCommand = (matlabProcess, command) =>
  new Promise((resolve, reject) => {
    const stdout = [];
    const stderr = [];
    let errorListener;
    let stderrListener;
    let stdoutListener;
    const removeListeners = () => {
      matlabProcess.removeListener('error', errorListener);
      matlabProcess.stderr.removeListener('data', stderrListener);
      matlabProcess.stdout.removeListener('data', stdoutListener);
    };
    errorListener = err => {
      removeListeners();
      reject(err);
    };
    stderrListener = err => {
      stderr.push(err.toString());
    };
    stdoutListener = data => {
      if (data.toString() === '>> ') {
        removeListeners();
        resolve({ stdout, stderr });
      } else {
        stdout.push(data.toString());
      }
    };
    matlabProcess.addListener('error', errorListener);
    matlabProcess.stderr.addListener('data', stderrListener);
    matlabProcess.stdout.addListener('data', stdoutListener);
    matlabProcess.stdin.write(`${command};\n`);
  });

/**
 * Closes the matlab process.
 * @param {ChildProcess} matlabProcess The matlab process to exit
 * @returns {Promise} Promise resolving with the exit code
 */
const closeMatlab = matlabProcess =>
  new Promise((resolve, reject) => {
    const exitLitstener = code => {
      matlabProcess.removeListener('exit', exitLitstener);
      if (code === 0) {
        resolve(code);
      } else {
        reject();
      }
    };
    matlabProcess.addListener('exit', exitLitstener);
    matlabProcess.stdin.write(`exit;\n`);
  });

module.exports = {
  startMatlab,
  runMatlabCommand,
  closeMatlab,
};
