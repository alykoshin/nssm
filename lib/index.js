'use strict';

const Commands = require('./commands');
const Aliases = require('./aliases.json');
const Errors = require('./errors.json');

function Nssm(name, options) {
  if (!(this instanceof Nssm)) {
    return new Nssm(name, options);
  }

  if (!name) {
    throw new Error(Errors.emptyName);
  }

  let internalOptions = options || {};
  let PromiseLibrary = internalOptions.promise || global.Promise;

  internalOptions.nssmExe = internalOptions.nssmExe || 'nssm';

  // for each available command add method to Nssm object
  Commands.list.forEach((command) => {
    this[command] = function CommandWrapper() {
      let args = [].slice.call(arguments);

      if (command === 'set' && ((args.length > 2) || (args[args.length - 1] !== 'function' && args.length === 2))) {
        let parameter = args[0].toLowerCase(); // i.e. 'start'
        let value = args[1].toLowerCase(); // i.e. 'auto'
        let parameterAliases = Aliases[parameter]; // i.e. { auto: 'SERVICE_AUTO_START', ... }
        let replacement = parameterAliases && parameterAliases[value]; // i.e. 'auto' -> 'SERVICE_AUTO_START'

        args[1] = replacement ? replacement : args[1];
      }

      return Commands.exec(PromiseLibrary, internalOptions.nssmExe, name, command, args);
    };
  });
}

module.exports = Nssm;
