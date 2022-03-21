let request = require('request')

function getRecentVisitor(qq){
    var url ="https://h5.qzone.qq.com/qzone/visitor/"+qq
    var header = {
        "Host":"h5.qzone.qq.com",
        "Cookie":"qq_locale_id=2052; skey=M1ucBOTr5r; uin=o1093628993; p_skey=7dCikhDNCtc41m63CePotTvDq3stzCT7UBSmfro4sdc_; p_uin=o1093628993; pgv_pvid=4663145296; pvid=3753291240",
        "accept":"application/json",
        "x-requested-with":"XMLHttpRequest",
        "sec-fetch-mode":"cors",
        "sec-fetch-site":"same-origin",
        "accept-language":"zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
    }
    return new Promise((resolve,reject)=>{
        request.get({
            url:url,
            headers:header
        },function(error,response,body){
            if(!error){
                if(body.indexOf("showAddStranger")==-1){
                    resolve({success:true,list:[]})
                }else{
                    body = body.split('"showAddStranger"')
                    body = body[1]
                    body = body.split('</script>')
                    body = body[0]
                    body = '{"showAddStranger"'+body
                    body = body.substr(0, body.length - 1);  
                    body = JSON.parse(body)
                    try{
                        var list = body.visitorData.list
                        resolve({success:true,list:list})
                    }catch(err){
                        resolve({success:false,data:'QQ登录态过期'})
                    }
                }
            }else{
                resolve({success:false,data:error})
            }
        })
    })
}

function verify(qq){
    return new Promise((resolve,reject)=>{
        getRecentVisitor(qq).then(res=>{
            if(res.success){
                if(res.list.length==0){
                    console.log(qq + '无效')
                    resolve(false)
                }else{
                    console.log(qq + '有效')
                    resolve(true)
                }
            }else{
                reject(res)
            }
        }).catch(err=>{
            reject(err)
        })
    })
}

module.exports = {
    getRecentVisitor,verify
}


// getRecentVisitor(1785742648).then(res=>{
//     console.log(res)
// }).catch(err=>{
//     console.log(err)
// })
