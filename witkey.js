
const superagent = require('superagent');
// 程序员客栈网站接口
superagent.post('https://jishuin.proginn.com/api/recruit/search')
.type('form')
.send({ page: 1})
.send({ pageSize: 10})
.send({ keyword: ''})
.end((err, res) => {
   console.log(JSON.parse(res.text).data.list);
});