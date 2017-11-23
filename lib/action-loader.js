const { readdirSync } = require("fs");

/**
 * Generates an object where properties are filenames and values are exported 
 * functions from within provided folder path.
 * @param { string } folderPath
 * @returns { [string]: Function }
 */
module.exports = folderPath =>
  readdirSync(folderPath)
    .filter(filename => filename !== "index.js")
    .map(filename => filename.substr(0, filename.length - 3))
    .reduce((actions, name) => {
      actions[name] = require(`${folderPath}/${name}.js`);
      return actions;
    }, {});
