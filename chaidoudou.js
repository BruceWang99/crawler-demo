
const superagent = require('superagent');
const COUNT = 200 // 批量处理商品数量
const productPageSize = 300
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxNzUyMTc1MTY4NCIsImlhdCI6MTY0MTg4MjI3OH0.cSFtrnHeabsSk6nkyyhPo8AeYt1yM9PebDs0x4uy6F0'

// https://app.chaiduoduo.top/cddSrv/logout 
// GET /cddSrv/logout HTTP/1.1
// Host: app.chaiduoduo.top
// Content-Type: application/json
// Accept-Encoding: gzip, deflate, br
// Connection: keep-alive
// Accept: */*
// User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 chaiduoduo
// Referer: https://app.chaiduoduo.top/index.html?ver=1641882035.894040
// token: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxNzUyMTc1MTY4NCIsImlhdCI6MTY0MTI4NTQ0NX0.4iwn8y2YcPInwBtquZsbMOAjivEdB5jsZ0BJsaoFlo8
// Accept-Language: zh-CN,zh-Hans;q=0.9

// https://app.chaiduoduo.top/cddSrv/sms/send
// {
// 	"body": {
// 		"phone": "17521751684",
// 		"digest": "71762fcd545194151a4562f8d440cf9e"
// 	},
// 	"head": {
// 		"channel": 0
// 	}
// }


// https://app.chaiduoduo.top/cddSrv/login/phone
// {
// 	"head": {
// 		"channel": 0,
// 		"ip": "210.13.127.73"
// 	},
// 	"body": {
// 		"deviceId": "EA0C954C-D37B-45EA-8CB8-C735FF351ED0",
// 		"digest": "64a9e4c719649505e659c07ace6da9d4",
// 		"mobile": "",
// 		"phone": "17521751684",
// 		"inviteCode": "",
// 		"smsCode": "526935"
// 	}
// }



function request({
   url = '',
   method = 'post',
   body =  {}
}) {
   return new Promise((resolve, reject)=>{
      superagent[method](url)
      .send(body)
      .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 chaiduoduo')
      .set('Accept', '*/*')
      .set('Accept-Encoding', 'gzip, deflate, br')
      .set('Origin', 'https://app.chaiduoduo.top')
      .set('Content-Type', 'application/json')
      .set('Host', 'app.chaiduoduo.top')
      .set('Accept-Language', 'zh-CN,zh-Hans;q=0.9')
      .set('token', TOKEN)
      .end((err, res) => {
         if(err){
            reject(err)
         } else {
            resolve(JSON.parse(res.text))
         }
      });
   })
}
// 获取商品列表
function getProductList(params) {
   return request({
      url: 'https://app.chaiduoduo.top/cddSrv/product/getProductList',
      body: {"body":{"pageSize": productPageSize,"pageNum":1,"sortType":5},"head":{"channel":0}}
   })
}
// 添加拆单栏
function addUserTaskCar(id) {
   let params = {
      body: {
         productId: id
      },
      head: {
         channel: 0
      }
   }
   return request({
      url: 'https://app.chaiduoduo.top/cddSrv/userTaskCar/addUserTaskCar',
      body: JSON.stringify(params)
   })
}

async function batchAddCar () {
   let count = 0
   console.error('开始执行批量添加拆单栏');
   try{
      const { body: { total, list } } = await getProductList()
      console.log('执行完成搜索列表');
      cur(list)
      console.log(total);
   }catch(err){
      console.log(err);
   }
   async function cur(list) {
      if(count > COUNT){
         console.log(`已完成${COUNT}个商品添加`);
         return
      } 
      try{
         if(list.length){
            setTimeout(async ()=>{
               const item = list.shift()
               const {head:{ status, respCode, respMsg }} = await addUserTaskCar(item.productId)
               if(status === 0) {
                  count++
               }
               console.log(`${respMsg}: 当前处理过的商品数量:${count}`);
               if(respCode !== 'TP003'){ // 您已超出个人等级可拆商品的种类上限
                  cur(list)
               }               
            }, 1000)
         } 
      } catch(err){
         console.log(err);
      }
   }
}

batchAddCar()
