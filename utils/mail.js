var request = require('request')
const Core = require('@alicloud/pop-core');
const tencentcloud = require("tencentcloud-sdk-nodejs");
const SesClient = tencentcloud.ses.v20201002.Client;
var tool = require('./mailobj')
const moment = require('moment');

// https://www.mail-verifier.com/do/api/

function verifyMail(mail){
  return new Promise((resolve,reject)=>{
    var url = "https://www.mail-verifier.com/do/api/?key=14E62B7B0A24FEE53EDD4BA337B4DF24&verify="+mail
    request.get({
        url:url,
        json:true
    },function(error,response,body){
        if(error){
          resolve(false)
        }else{
          try{
            if(body.code==1){
              resolve(true)
            }else{
              resolve(false)
            }
          }catch(err){
            console.log(err)
            resolve(false)
          }
        }
    })
  })
}

async function alisend(mail,type,sender){
    // var client = new Core({
    //     accessKeyId: 'LTAI4G6MWiudEur3LwFrHVjF',
    //     accessKeySecret: 'ijHKVnFozYkyJjRn7uytqaHU1uuVVV',
    //     endpoint: 'https://dm.aliyuncs.com',
    //     apiVersion: '2015-11-23'
    // });
    mail = mail.replace(/\s/g, "")
    console.log(mail)
    // return
    var client = new Core({
        accessKeyId: 'LTAI5tNGGCrwCfDZanqf1ACB',
        accessKeySecret: 'YR8P5ZDNCGmVSvb6fn20H76VNZYmxB',
        endpoint: 'https://dm.aliyuncs.com',
        apiVersion: '2015-11-23'
    });
    var mailobj = tool.getMailObj(type,mail)
    // console.log(mailobj)
    var params = {
        "RegionId": "cn-hangzhou",
        "AccountName": sender,
        "AddressType": "0",
        "ReplyToAddress": "false",
        "ToAddress": mail,
        "Subject": mailobj.title,
        "HtmlBody": mailobj.body,
        "FromAlias": mailobj.sender_name,
        "ClickTrace":1
    }
    var requestOption = {
        method: 'POST'
    };
    return new Promise((resolve,reject)=>{
      verifyMail(mail).then(usable=>{
        // console.log(usable)
        if(!usable){
          resolve({success:false,data:'邮箱无效'})
        }else{
          client.request('SingleSendMail', params, requestOption).then((result) => {
              // console.log(result)
              if(result.RequestId&&result.EnvId){
                  // console.log(result)
                  resolve({'msg':'发送成功',success:true,data:JSON.stringify(result)})
              }else{
                console.log(result)
                resolve({'msg':'发送失败',success:false,data:JSON.stringify(result)})
              }
          }, (ex) => {
              console.log(ex)
              resolve({'msg':'发送失败',success:false,data:JSON.stringify(ex)})
          })
        }
      })
    })
}

var sender_list = ["vct@markmra1995.asia","xrt@markmra1995.online","mark@woshinibaba.today"]

const clientConfig = {
  credential: {
    secretId: "AKIDB0Yq2z1kSu1rSQttsa0DBE6i6E5flV8a",
    secretKey: "XGoNl1yf8QVUYNuJ4e17LhlY6NN8fyTh",
  },
  region: "ap-hongkong",
  profile: {
    httpProfile: {
      endpoint: "ses.tencentcloudapi.com",
    },
  },
};

async function tencentSend(mail){
    return new Promise((resolve,reject)=>{
          const client = new SesClient(clientConfig);
          var sender = sender_list[Math.floor((Math.random()*sender_list.length))]
          var name_list = ["北京上门按摩"]
          var sender_name = name_list[Math.floor((Math.random()*name_list.length))]
          var FromEmailAddress = sender_name + " <"+sender+">" 
          var mail_param = {
            "UserName": mail
          }
          console.log(mail_param)
          const params = {
              "FromEmailAddress": FromEmailAddress,
              "Destination": [mail],
              "Template": {
                "TemplateID": 20198,
                "TemplateData": JSON.stringify(mail_param)
              },
              "Subject": "1万份体验装正在发放！发送批次:"+tool.getRandomNum()
          };
          verifyMail(mail).then(usable=>{
            if(usable){
              client.SendEmail(params).then(
                (data) => {
                  console.log(data);
                  if(!data.Error){
                    resolve({success:true,data:data})
                  }else{
                    resolve({success:false,data:data})
                  }
                },
                (err) => {
                  console.error("error", err);
                  reject({msg:JSON.stringify(err)})
                }
              )
            }else{
              resolve({success:false,msg:'邮箱地址不可用'})
            }
          })
    }) 
}

async function getSendMailStatus(param){
  return new Promise((resolve,reject)=>{
    const client = new SesClient(clientConfig);
    const params = {
        "MessageId": param.message_id,
        "RequestDate": param.date,
        "Offset": 0,
        "Limit": 100
    };
    client.GetSendEmailStatus(params).then(
      (data) => {
        // console.log(data);
        resolve(data)
      },
      (err) => {
        console.error("error", err);
        reject(err)
      }
    );
  })
}

module.exports = {
  alisend,verifyMail,tencentSend,getSendMailStatus
}