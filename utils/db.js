let mysql = require('mysql')

const config = {
    connectionLimit:10,
    host:"42.193.99.217",
    user:"mark",
    password:"95101212Ma",
    database:"job",
    port:"3306",
    charset:'UTF8MB4_GENERAL_CI'
}

const pool = mysql.createPool(config)

async function query(sql,params){
    return new Promise((reslove,reject)=>{
        pool.getConnection((err,conn)=>{
            if(err){
                reject(err)
                return
            }
            conn.query(sql,params,(err,result)=>{
                conn.release()
                if(err){
                    reject(err)
                    return
                }
                reslove(result)
            })
        })
    })
}

module.exports = query