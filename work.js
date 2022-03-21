var nodeQueue = require('./utils/work')

var i = 0

function go(str){
    for(var i=0;i<1000;i++){
        print(str)
    }
}

function print(str){
    nodeQueue.push({name:"time",time:1000},function(err){
        if(!err){
            console.log(str)
        }
    })
}

module.exports = go