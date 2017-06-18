'use strict';
var childProcess = require('child_process');

function run(args, cb) {
	childProcess.execFile('free', args, function (err, stdout) {
		if (err) {
			cb(err);
			return;
		}

		cb(null, stdout.trim().split('\n').slice(1).map(function (el) {
			var cl = el.split(/\s+(?=[\d\/])/);
			switch(cl[0]) {
				case "Mem:":
				    return {
				    	type: "Mem:",
						total: cl[1],
						used: cl[2],
						free: cl[3],
						shared: cl[4],
						buffers: cl[5],
						cached: cl[6]
					};
				    break;
				case "-/+ buffers/cache:":
				    return {
				    	type: "-/+ buffers/cache:",
						used: cl[1],
						free: cl[2]
					};
				    break;
				case "Swap:":
				    return {
				    	type: "Swap:",
						total: cl[1],
						used: cl[2],
						free: cl[3]
					};
				    break;
			}
			
		}));
	});
};

var free = module.exports = function (cb) {
	run([], cb);
};

free.m = function (cb) {
	run(['-m'], cb);
};

free.k = function (cb) {
	run(['-k'], cb);
};

free.g = function (cb) {
	run(['-g'], cb);
};