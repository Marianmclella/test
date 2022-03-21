var list = [
    {
        "type":"niu",
        "name_list":["延时喷雾免费试用"],
        "title":"产品试用装现在开始发放!编号:{{no}}",
        "name_list":["延时喷雾免费试用"],
        "body":""
    }
]

function getMailData(type){
    var obj = ""
    for(var i in list){
        if(list[i].type==type){
            obj = list[i]
        }
    }
    return obj
}