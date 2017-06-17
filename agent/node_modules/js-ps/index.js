const {exec, execSync} = require('child_process');
const debug = require('debug')('js-ps');
/**
 * ps{'user','pid','cpu','mem','vsz','rss','tt','stat','started', 'time'};
 */
const _info_title = ['user','pid','cpu','mem','vsz','rss','tt','stat','started', 'time'];

const ps = module.exports = function(...agrs){
    return ps.get(...agrs);
}
ps.get = (...agrs)=>{
    let method;
    const [_, callback] = handleAgrs(agrs);
    method = (typeof agrs[0] === 'number') ? 'getOne' : 'getMany';
    return callback ? ps[method](...agrs) : ps[`${method}Sync`](...agrs);
}
ps.getOne = (...pid/*, callback*/)=>{
    const [_pid, callback] = handleAgrs(pid);
    const command = formatCommand(_pid || process.pid);
    if(!callback) return psFormat(psExecSync(command)[0]);;

    psExec(command,(err, data)=>{
        if(err) return callback(err);
        callback(null, psFormat(data[0]));
    });
},

ps.getMany = (...pid/*, callback*/)=>{
    let _ps = {};
    const [_pid, callback] = handleAgrs(pid);
    const command = (_pid instanceof Array) ? formatCommand(_pid) : '';
    if(!callback) return forData(psExecSync(command));
    psExec(command,(err, data)=>{
        if(err) return callback(err);
        callback(null,forData(data));
    });
}

ps.getOneSync = (pid = process.pid)=>{
    return psFormat(psExecSync(formatCommand(pid))[0]);
}

ps.getManySync = (pid)=>{
    const data = psExecSync((pid instanceof Array) ? formatCommand(pid) : '');
    return forData(data);
}

function formatCommand(pid){
    pid = pid instanceof Array 
            ? pid.map(val => `\\\\s${val}\\\\s`).join('\\\\\\|')
            : `\\\\s${pid}\\\\s`;
    return  `| grep ${pid} | grep -v 'grep '`;
}

function psExec(command,callback){
    debug(`command: ps aux ${command}`);
    exec(`ps aux ${command}`, (err, data)=>{
        debug(`data: ${data}`);
        callback(err, data.replace(/\n/g,"|").replace(/\s+/g," ").split('|').map(val => val.split(' ')));
    });
};

function psExecSync(command){
    let _data;
    debug(`command:  ps aux  ${command}`);
    try{
        _data = execSync(`ps aux ${command}`).toString();
    }catch(e){
        throw new Error(e);
    }
    debug(`data: ${_data}`);
    return _data.replace(/\n/g,"|").replace(/\s+/g," ").split('|').map(val => val.split(' '));
}

function psFormat(data){
    let _ps = Object.create(null);
    debug(`data: ${data}`);
    _info_title.forEach((val,index) =>{ 
        _ps[val] = data[index];
    });
    return _ps;
}

function handleAgrs(agrs){
    let pid,callback;
    if(agrs.length === 2){
        return (typeof agrs[0] != 'function' && typeof agrs[1] === 'function') ? agrs : ['',null];
    }else if(agrs.length === 1){
        if(typeof agrs[0] === 'function'){
            callback = agrs[0];
            pid = '';
        }else{
            callback = null;
            pid = agrs[0];
        }
    }
    debug(`pid: ${pid};callback:${callback}`);
    return [pid,callback];
} 

function forData(data){
    let _ps = {};
    data.pop();
    for(let i = 0, len = data.length; i < len; i++){
        _ps[data[i][1]] = psFormat(data[i]);
    }
    return _ps;
}