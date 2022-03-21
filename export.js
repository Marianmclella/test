let query = require('./utils/db')
let request = require('request')
var nodeQueue = require('./utils/work')
const mail = require('./utils/mail')
let log4js = require('log4js')
const fs = require('fs')
const moment = require('moment')


// function exportMail(){
//     var sql = "select a.* from pw_qq_record a right join ("+
//         "select max(id) id from pw_qq_record group by qq) b on b.id = a.id "+
//         " where a.id is not null AND visite_time>1635846720 AND delivered is NULL and `status` is NULL  ORDER BY visite_time DESC LIMIT 1000"
//     query(sql).then(list=>{
//         console.log(list.length)
//         for(var i in list){
//             verify(list[i])
//         }
//     })
// }

// exportMail()

function exportMail(){
    var sql = 'select * from qq_visitor_beijing order by visite_time desc limit 800'
    query(sql).then(list=>{
        // verify(list[])
        // console.log(list)
        for(var i in list){
            verify(list[i])
            // break
        }
    })
}

function verify(item){
    nodeQueue.push({name:'send',time:50},function(err){
        if(!err){
            mail.verifyMail(item.qq+"@qq.com").then(res=>{
                if(res){
                    // writeTxt(item)
                    var no = 'ali-0113-800'
                    var sql = 'insert into mail_send_list (`mail`,`no`,`visite_time`) values (?,?,?)'
                    var sql2 = 'update qq_visitor_beijing set `status`=1 where qq=?'
                    Promise.all([query(sql,[item.qq,no,item.visite_time]),query(sql2,item.qq)]).then(res=>{
                        console.log('有效邮件')
                        writeTxt()
                    })
                }else{
                    var sql = 'update qq_visitor_beijing set `status`=-1 where qq=?'
                    query(sql,item.qq).then(res=>{
                        console.log('无效邮件')
                    })
                }
            })
        }
    })
}

num=0

function x(){
    var sql = 'select * from mail_send_list'
    query(sql).then(list=>{
        for(var i in list){
            writeTxt(list[i])
        }
    })
}

x()

function writeTxt(item){
    try {
        var content = item.mail+'@qq.com,'+item.mail+','+moment((moment().unix()+604800)*1000).format('YYYY-MM-DD HH:mm:ss')+',sir,1990/1/1,13800000000\n'
        // var content = item.qq+'@qq.com'+'\n'
        fs.writeFileSync(moment().format("MM-DD")+'.txt', content,{flag:"a+"})
        console.log(item.mail,'success! 第',num,'条记录')
        num++
    } catch (err) {
        console.error(err)
    }
}

