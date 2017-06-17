const ps = require('./index');


const info = ps(process.pid);//获取该进程的信息

console.log(info.cpu);//进程cpu的使用率
console.log(info.time);//使用时间
