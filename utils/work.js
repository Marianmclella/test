const async = require('async');
 /**
      *队列
      * @param obj ：obj对象 包含执行时间
      * @param callback ：回调函数
    */
const nodeQueue = async.queue(function (obj, callback) {
    setTimeout(function () {
        // 需要执行的代码的回调函数
        if(typeof callback==='function'){
            callback();
        }
    }, obj.time)
}, 1)

// worker数量将用完时，会调用saturated函数
nodeQueue.saturated = function() {
    console.log('all workers to be used');
}

// 当最后一个任务交给worker执行时，会调用empty函数
nodeQueue.empty = function() {
    console.log('no more tasks wating');
}

// 当所有任务都执行完时，会调用drain函数
nodeQueue.drain = function() {
    console.log('all tasks have been processed');
}

module.exports = nodeQueue;