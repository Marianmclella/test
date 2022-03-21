var tool = require('./tool')
var moment = require('moment')
var query = require('./db')
const { reject } = require('async')

var mail_html = [
'<!DOCTYPE html>'+
'<html>'+
'	<head>'+
'		<meta charset="utf-8">'+
'		<meta http-equiv="X-UA-Compatible" content="IE=edge">'+
'		<meta name="viewport" content="width=device-width, initial-scale=1">'+
'		<title></title>'+
'		<style>'+
'			body{padding: 0;margin: 0;}'+
'			a{color: white;}'+
'		</style>'+
'	</head>'+
'	<body>'+
'		<table border="0" style="width: 100%;background: #f1f1f1;font-size: 14px;">'+
'			<tr>'+
'				<td>'+
'					<table border="0" style="width: 92%;margin: 10px auto;background-color: white;padding: 5px;max-width: 500px;">'+
'						<tbody>'+
'							<tr>'+
'								<td>'+
'									<a href="https://growth-1251761650.cos.ap-guangzhou.myqcloud.com/pic.html?id={EAddr}" style="width: 100%;">'+
'										<img alt="简介" style="width: 100%;" src="https://growth-1251761650.cos.ap-guangzhou.myqcloud.com/mail.jpg"/>'+
'									</a>'+
'									<a style="background-color:#d9534f;display: flex;flex-direction: row;align-items: center;justify-content: space-around;color: white;font-weight: 800;padding: 7px 0;font-size: 14px;border-radius: 5px;" href="https://growth-1251761650.cos.ap-guangzhou.myqcloud.com/pic.html?id={EAddr}" rel="nofollow noopener" target="_blank">查看详情</a>'+
'								</td>'+
'							</tr>'+
'							<tr>'+
'								<td style="font-size: 12px;">'+
'									<p></p>'+
'									您好{UserName}!'+
'								</td>'+
'							</tr>'+
'							<tr>'+
'								<td>'+
'									<p style="font-size: 13px;font-weight: bold;">为您推荐往期优质作品：</p>'+
'								</td>'+
'							</tr>'+
'							<tr>'+
'								<td>{list}</td>'+
'							</tr>'+
'							<tr>'+
'								<td colspan="3">'+
'									<div style="width: 100%;background-color: white;padding: 15px 0;text-align: center;color: #3596b6;font-size: 10px;margin-top: 20px;">'+
'										<div>Copyright 2004-2021 All Right Reserved</div>'+
'										<div>Our mailing address is: superidol@idolspas.com</div>'+
'									</div>'+
'								</td>'+
'							</tr>'+
'						</tbody>'+
'					</table>'+
'				</td>'+
'			</tr>'+
'			<tr>'+
'				<td>'+
'					<div style="width: 100%;text-align: center;margin: 20px 0" >'+
'						<a href="https://vip-1256581243.cos.ap-beijing.myqcloud.com/quit.html?event=unsubscribe" style="padding: 5px 10px;background-color: #DFDFDF;width: 80px;font-size: 13px;border-radius: 10px;color: #717171;;">取消订阅</a>'+
'					</div>'+
'				</td>'+
'			</tr>'+
'			<tr>'+
'				<td>'+
'					<img style="display: none;" alt="h" src="https://service-2s3x4g1v-1256581243.bj.apigw.tencentcs.com/release/data/open?mail={EAddr}" />'+
'				</td>'+
'			</tr>'+
'		</table>'+
'	</body>'+
'</html>'   
]

function getMailHtml(mail,base64=false){
    var str  = mail_html[0]
    var str = str.replace("{UserName}",mail)
    var r = '我们向您发送这封电子邮件，目的是让您了解关于产品和服务的重大变化,可供试用的产品已经于'+moment().format('YYYY-MM-DD HH:mm:ss')+'更新完毕，如果有任何疑问请发送邮件至1093628993@qq.com,请勿回复此邮件'
    var str = str.replace("{random}",r)
    if(base64){
        var strToBase64 = new Buffer(str).toString('base64');
        return strToBase64
    }else{
        return str
    }
}

function getRandomNum(){
    var arr = new Array;
    var arr1 = new Array("0","1","2","3","4","5","6","7","8","9");
    var nonceStr=''
    for(var i=0;i<8;i++){
        var n = Math.floor(Math.random()*10);
        arr[i] =arr1[n] ;
        nonceStr+=arr1[n];
        // nonce_str=parseInt(nonceStr)
    }
    return nonceStr
}

function getMailTitle(){
    return new Promise((resolve,reject)=>{
        var sql = 'select * from photo_list order by rand() limit 1'
        query(sql).then(res=>{
            var item = res[0]
            var title = '最新作品' + item.title +'作者'+ item.author + ',上架时间'+ moment().format('MM月DD hh:mm')
            resolve(title)
        })
    })
}

function getRecentPhoto(){
    return new Promise((resolve,reject)=>{
        var sql = 'select * from photo_list order by rand() limit 15'
        query(sql).then(list=>{
            var li = ''
            for(var i in list){
                li = list[i].title + '作者：' + list[i].author + '<br>' + li
            }
            resolve(li)
        })
    })
}

function getMailObj(type,mail){
    var name_list = ["美图社","美丝图社","写真图集"]
    var sender_name = name_list[Math.floor((Math.random()*name_list.length))]
    return new Promise((resolve,reject)=>{
        Promise.all([getMailTitle(),getRecentPhoto()]).then(res=>{
            var title = res[0]
            var list = res[1]
            var body = getMailHtml(mail)
            var str = body.replace("{list}",list)
            var obj = {
                sender_name:sender_name,title:title,body:str
            }
            resolve(obj)
        })
    })
}

module.exports = {getMailHtml,getRandomNum,getMailObj}
