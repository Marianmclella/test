const express = require('express');
const app = express();
const tool = require('./utils/mail')
const query  = require('./utils/db')

app.get(`/tencent`, (req, res) => {
  console.log(req.query)
  tool.tencentSend(req.query.address).then(r=>{
    console.log(r)
    res.json(r)
  }).catch(err=>{
    console.log(err)
    res.json(err)
  })
});

app.get('/report',(req,res)=>{
  console.log(req.query)
  report(req.query).then(r=>{
    res.json(r)
  }).catch(err=>{
    res.json(err)
  })
})

function report(param){
  return new Promise((resolve,reject)=>{
      if(param.event=="click"){
          var sql = 'update pw_qq_record set click=1,url=? where message_id=?'
          var data = [param.link,param.bulkId]
      }
      else if(param.event=="delivered"){
          var sql = 'update pw_qq_record set delivered=1 where message_id=?'
          var data = [param.bulkId]
      }
      else if(param.event == "dropped"){
          var sql = 'update pw_qq_record set dropped=1 where message_id=?'
          var data = [param.bulkId]
      }
      else if(param.event == "open"){
          var sql = 'update pw_qq_record set open=1 where message_id=?'
          var data = [param.bulkId]
      }
      else if(param.event == "spamreport"){
          var sql = 'update pw_qq_record set spamreport=1 where message_id=?'
          var data = [param.bulkId]
      }else{
          var sql = 'insert into pw_qq_record (`send_msg`,`url`) values(?,?)'
          var data = [JSON.stringify(param),""]
      }
      resolve(query(sql,data))
  })
}

app.get('/404', (req, res) => {
  res.status(404).send('Not found');
});

app.get('/500', (req, res) => {
  res.status(500).send('Server Error');
});

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).send('Internal Serverless Error');
});

app.listen(8080)

module.exports = app;
