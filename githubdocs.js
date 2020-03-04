const cli = require('cli');
const shared = require('./shared');

// parse args
let args = cli.args;
if(args.length > 0){
    args = args[0];
}

// Build docs
if(args === 'build'){
    shared.build(() => {
        console.log('[INFO] Successfully built');
        process.exit(0);
    });
}else if(args === 'serve'){
    require('./server');
}else{
    console.log('[ERROR] No option selected. Valid options are: build, serve');
}
