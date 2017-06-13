#!/usr/bin/env node

"use strict";

const fs = require("fs");
const uglify = require("uglify-es");

const code = fs.readFileSync("DelegateProxy.js", "utf8");

// get the module name
const modName = code.match(/export function ([^\(]+)\(/)[1];
const amdPrefix = `define("${modName}", [], function () { `;

const amdCode = amdPrefix + code.replace(/export /, "return ") + "});";
const nodejsCode = code.replace(/export /, "module.exports = ");

const amdMini = uglify.minify(amdCode, {
    compress: false,
    mangle: false,
    output: {
        beautify: true,
        // preamble: "/* uglified */"
    }
});
const nodeMini = uglify.minify(nodejsCode, {
    compress: false,
    mangle: false,
    output: {
        beautify: true,
        // preamble: "/* uglified */"
    }
});


fs.writeFileSync("amd/DelegateProxy.js", amdMini.code);
fs.writeFileSync("nodejs/DelegateProxy.js", nodeMini.code);
