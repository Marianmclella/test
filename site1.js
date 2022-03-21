let query = require('./utils/db')
let request = require('request')
var nodeQueue = require('./utils/work')
const mail = require('./utils/mail')
const moment = require('moment')

var sender = "yahoo@petstar6.com"
// var sender = "browser@yohoos.com"
// var sender = "yoyo@markma.top"
// var sender = "mark@gouzilaile.com"

var i = 0

function start(){
    if(i<200){
        var sql = 'select * from qq_visitor_shanghai where `status` is null and delivered is null order by visite_time desc limit 1'
        query(sql).then(list=>{
            console.log(list)
            if(list.length>0){
                var sql = 'update qq_visitor_shanghai set `status`=1 where id = ?'
                query(sql,list[0].id).then(res=>{
                    if(res.affectedRows==1){
                        console.log(list[0].qq,list[0].id)
                        sendMailByAli(list[0].qq,list[0].id).then(res=>{
                            console.log(res)
                            i++
                            start()
                        }).catch(err=>{
                            console.log(err)
                            start()
                        })
                    }else{
                        setTimeout(function(){
                            start()
                        },20000)
                    }
                })
            }else{
                setTimeout(function(){
                    start()
                },20000)
            }
        })
    }
}

function sendMailByTencent(qq,id){
    nodeQueue.push({name:'send',time:20000},function(err){
        if(!err){
            mail.tencentSend(qq+"@qq.com").then(res=>{
                if(res.success){
                    console.log("发送邮件成功!邮件地址:",qq,"@qq.com，投递结果:",JSON.stringify(res.data))
                    var sql = 'update qq_visitor_shanghai set delivered=1,send_msg=?,message_id=? where id=?'
                    query(sql,[JSON.stringify(res.data),res.data.MessageId,id])
                }else{
                    console.log("发送邮件失败!邮件地址:",qq,"@qq.com，投递结果:",JSON.stringify(res.data))
                    var sql = 'update qq_visitor_shanghai set delivered=-1,send_msg=? where id=?'
                    query(sql,[JSON.stringify(res.data),id])
                }
            }).catch(err=>{
                console.log(err)
                console.log("发送邮件错误!邮件地址:",qq,"@qq.com，投递结果:",JSON.stringify(res.data))
                var sql = 'update qq_visitor_shanghai set delivered=-1,send_msg=? where id=?'
                query(sql,[JSON.stringify(err),id])
            })
        }
    })
}

function sendMailByAli(qq,id){
    return new Promise((resolve,reject)=>{
        nodeQueue.push({name:'send',time:200},function(err){
            if(!err){
                var type = 'zlj'
                mail.alisend(qq+"@qq.com",type,sender).then(res=>{
                    if(res.success){
                        console.log("发送邮件成功!邮件地址:",qq,"@qq.com，投递结果:",res.data)
                        var sql = 'update qq_visitor_shanghai set delivered=1,send_msg=?,sender=?,deliver_time=?,type=? where id=?'
                        query(sql,[res.data,sender,moment().unix(),type,id]).then(res=>{
                            resolve({success:true})
                        })
                    }else{
                        console.log("发送邮件失败!邮件地址:",qq,"@qq.com，投递结果:",res.data)
                        var sql = 'update qq_visitor_shanghai set delivered=-1,send_msg=?,sender=?,deliver_time=?,type=? where id=?'
                        query(sql,[res.data,sender,moment().unix(),type,id]).then(r=>{
                            resolve({success:false,msg:res.data})
                        })
                    }
                }).catch(err=>{
                    console.log(err)
                    console.log("发送邮件错误!邮件地址:",qq,"@qq.com，投递结果:",res.data)
                    var sql = 'update qq_visitor_shanghai set delivered=-1,send_msg=?,sender=?,deliver_time=?,type=? where id=?'
                    query(sql,[err,sender,moment().unix(),type,id]).then(r=>{
                        resolve({success:false,msg:err})
                    })
                })
            }else{
                resolve({msg:'队列出错'})
            }
        })
    })
}

sendMailByAli(2782798008,30231)
