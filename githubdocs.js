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
        console.log("Successfully built");
        process.exit(0);
    });
}