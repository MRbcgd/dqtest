# freem
> Get free RAM (Main Memory) space info from `free` command

Works on Linux.

*Inspired by [`sindresorhus/df`](https://github.com/sindresorhus/df)*


## Install

```
$ npm install --save freem
```


## Usage

```js
var free = require('freem');

free(function (err, list) {
	console.log(list);
	/*
	[ 
		{ 
			type: 'Mem:',
		    total: '8095596',
		    used: '7056436',
		    free: '1039160',
		    shared: '625412',
		    buffers: '261384',
		    cached: '2203688' 
		},
  		{ 
  			type: '-/+ buffers/cache:', 
  			used: '4591364', 
  			free: '3504232' 
  		},
  		{ 
  			type: 'Swap:', 
  			total: '8307708', 
  			used: '200', 
  			free: '8307508' 
  		} 
  	]
  	*/
});

free.k(function (err, data) {
	console.log(data);
	/*
	[ 
		{ 
			type: 'Mem:',
		    ... 
		},
  		{ 
  			type: '-/+ buffers/cache:', 
  			... 
  		},
  		{ 
  			type: 'Swap:', 
  			...
  		} 
  	]
  	*/
});

free.m(function (err, data) {
	console.log(data);
	/*
	[ 
		{ 
			type: 'Mem:',
		    ... 
		},
  		{ 
  			type: '-/+ buffers/cache:', 
  			... 
  		},
  		{ 
  			type: 'Swap:', 
  			...
  		} 
  	]
  	*/
});

free.g(function (err, data) {
	console.log(data);
	/*
	[ 
		{ 
			type: 'Mem:',
		    ... 
		},
  		{ 
  			type: '-/+ buffers/cache:', 
  			... 
  		},
  		{ 
  			type: 'Swap:', 
  			...
  		} 
  	]
  	*/
});
```


## API

### free(callback)

Get a list of main memory info.

#### callback(error, list)

*Required*  
Type: `function`

##### list

Type: `array`

List of `data` objects.

## License

MIT © [Jayram Singh](http://github.com/jaysingh)