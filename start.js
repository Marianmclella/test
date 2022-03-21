let query = require('./utils/db')
let request = require('request')
var nodeQueue = require('./utils/work')
const log4js = require('log4js')

log4js.configure({
    appenders: {
        production: {
            type: 'dateFile',
            filename: 'log/collect.log',
            alwaysIncludePattern: true,
            keepFileExt: true,
            daysToKeep: 30,
        }
    },
    categories: {
        default: { appenders: [ 'production' ], level: 'debug' }
    }
});

var logger = log4js.getLogger();

var city = "北京"

function getRecentVisitor(qq){
    var url ="https://service-fdvem1on-1256581243.sh.apigw.tencentcs.com/release/qzone?qq="+qq
    return new Promise((resolve,reject)=>{
        request.get({
            url:url
        },function(error,response,body){
            if(error){
                reject(error)
            }else{
                try{
                    body = JSON.parse(body)
                }catch(e){
                    body = {success:false,msg:'请求数据失败'}
                }
                resolve(body)
            }
        })
    })
}

// getRecentVisitor(2308383144).then(res=>{
//     console.log(res)
// })

function collect(){
    var sql = 'SELECT * FROM qq_list_1 WHERE city=? AND statue=2 '
    query(sql,city).then(list=>{
        var work = []
        for(var i in list){
            work.push(getRecentVisitor(list[i].target_qq))
        }
        Promise.all(work).then(list=>{
            console.log(list.length)
            logger.info('请求完成',list.length)
            var work = []
            for(var i in list){
                if(!list[i].success){
                    console.log('请求失败')
                }else{
                    work.push(collectList(list[i]))
                    // console.log('请求成功')   
                }
            }
            Promise.all(work).then(res=>{
                console.log(res.length)
                logger.info('采集完成',res.length)
                collect()
            }).catch(err=>{
                console.log(err)
            })
        })
    })
}

function collectList(item){
    return new Promise((resolve,reject)=>{
        if(item.success && item.list.length>0){
            var list = item.list
            var work = []
            for(var i in list){
                work.push(collectQQ(list[i]))
            }
            Promise.all(work).then(res=>{
                resolve(res)
            }).catch(err=>{
                reject(err)
            })
        }else{
            resolve({msg:'qq采集无效'})
        }
    })
    
}

function collectQQ(item){
    return new Promise((resolve,reject)=>{
        nodeQueue.push({name:'query',time:200},function(err){
            if(!err){
                if(item.nick.indexOf('同城')>-1 || item.nick.indexOf('同城')>-1 || item.nick.indexOf('会所')>-1 || item.nick.indexOf('资源')>-1 || item.nick.indexOf('按摩')>-1 || item.nick.indexOf('上门')>-1 || item.nick.indexOf('WWW')>-1 ){
                    resolve({msg:'昵称违规',success:false})
                }else{
                    var sql = 'select * from pw_qq_record where qq=?'
                    query(sql,item.uin).then(res=>{
                        if(res.length==0){
                            var sql = 'insert into pw_qq_record (`qq`,`nickname`,`city`,`visite_time`) values(?,?,?,?)'
                            query(sql,[item.uin,item.nick,city,item.time]).then(res=>{
                                console.log('采集成功，qq:',item.uin,'，城市：',city)
                                resolve({success:true,msg:"采集成功"})
                            }).catch(err=>{
                                console.log(err)
                                query(sql,[item.uin,item.time,'']).then(res=>{
                                    console.log('采集成功，qq:',item.uin,'，城市：',city)
                                    resolve({success:true,msg:"采集成功"})
                                })
                            })
                        }else{
                            var sql = 'update pw_qq_record set visite_time=? where qq=?'
                            query(sql,[item.time,item.uin]).then(res=>{
                                console.log('repeat,qq:',item.uin)
                                resolve({success:true,msg:"更新成功"})
                            })
                        }
                    })
                }
            }
        })
    })
}


collect()
