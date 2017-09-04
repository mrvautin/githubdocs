const config = require('./config/config.json');
const cli = require('cli');
var shared = require('./shared');

// parse args
let args = cli.args;
if(args.length > 0){
    args = args[0];
}

// Build docs
if(args === 'build'){
    shared.build(function(){
        console.log("[INFO] Successfully built");
        process.exit(0);
    });
}else if(args === 'serve'){
    require("./server")
}else{
    console.log("[ERROR] No option selected. Valid options are: build, serve");
}