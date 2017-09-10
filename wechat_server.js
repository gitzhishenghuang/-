const express=require('express');
const token=require('./token');

const app=express();


app.post('/config',token.ticket);

app.use(express.static('./public'));

app.listen((err)=>{
    console.log('服务器启动成功');
});