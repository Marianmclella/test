const query = require('../utils/db')
const mail = require('../utils/mail')
var nodeQueue = require('../utils/work')

function randomWord(randomFlag, min, max) {
    let str = "",
    range = min,
    arr = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z','0', '1', '2', '3', '4', '5', '6', '7', '8', '9',];
    
    if (randomFlag) {
        range = Math.round(Math.random() * (max - min)) + min;// 任意长度
    }
    for (let i = 0; i < range; i++) {
        pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
    }
    return str;
}

function handle(){
    var sql = 'select * from photo_list'
    query(sql).then(list=>{
        for(var i in list){
            u(list[i])
            // break
        }
    })
}

function u(item){
    console.log(item.title)
    var title = item.title
    var str = title.split('-')
    if(str.length>1){
        var author =  str[0]
        title = str[1]
        var sql = 'update photo_list set author=?,title=? where id=?'
        query(sql,[author,title,item.id]).then(res=>{
            console.log('s',item.id)
        })
    }
}

handle()