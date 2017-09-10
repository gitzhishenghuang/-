const fs=require('fs');
const sha=require('sha1');
const request=require('request');
const config=require('./wxconfig');

var getTokenUrl=`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${config.CorpID}&corpsecret=${config.Secret}`;
var file='./json/cache.json';
var g;
function tokenstr(){
    request.get(getTokenUrl,function(err,response,body){
        let str=JSON.parse(body).access_token;
        g.next(str);
    })
}
function ticketstr(tokenstr){
    request.get('https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=' + tokenstr, function (error, res, body) {
        let json = JSON.parse(body);
        json.end_time = Date.now() + json.expires_in * 1000;
        let jsonstr = JSON.stringify(json);
        fs.writeFileSync(file, jsonstr);

        let ticket = json.ticket;
        let timestamp = getTimesTamp();
        let noncestr = getNonceStr();
        let url = 'http://pyhome.club/';
        let str = 'jsapi_ticket='+ticket+'&noncestr='+noncestr+'&timestamp='+timestamp+'&url='+url;
        let signature = sha(str);
        let obj = {
            //beta: true,// 必须这么写，否则在微信插件有些jsapi会有问题
            //debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: config.CorpID, // 必填，企业微信的cropID
            timestamp: timestamp, // 必填，生成签名的时间戳
            nonceStr: noncestr, // 必填，生成签名的随机串
            signature: signature// 必填，签名，见附录1
            //jsApiList: ['selectEnterpriseContact', 'openEnterpriseChat'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        };
        g.next(obj);
    });
}
exports.ticket=function(req,res,next) {
    let ticketStr=fs.readFileSync('./json/cache.json','utf-8');
    let ticketObj;
    if(ticketStr){
        ticketObj=JSON.parse(ticketStr)
    }
    if(!ticketStr||ticketObj.end_time-Date.now()<700000) {
console.log(1)
        function* gen(){
            let token=yield tokenstr();
            let ticket=yield ticketstr(token);
            res.send(ticket);
        }
        g=gen();
        g.next();
    }else{
        let ticket = ticketObj.ticket;
        console.log(2);
        let timestamp = getTimesTamp();
        let noncestr = getNonceStr();
        let url = 'http://pyhome.club/';
        let str = 'jsapi_ticket='+ticket+'&noncestr='+noncestr+'&timestamp='+timestamp+'&url='+url;
        let signature = sha(str);
        let obj = {
            //beta: true,// 必须这么写，否则在微信插件有些jsapi会有问题
            //debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: config.CorpID, // 必填，企业微信的cropID
            timestamp: timestamp, // 必填，生成签名的时间戳
            nonceStr: noncestr, // 必填，生成签名的随机串
            signature: signature// 必填，签名，见附录1
            //jsApiList: ['selectEnterpriseContact', 'openEnterpriseChat'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        };
        res.json(obj);
    }
};

function getTimesTamp() {
    return parseInt(new Date().getTime() / 1000);
}
function getNonceStr() {
    var data=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];

    var result="";
    for(var i=0;i<15;i++){
        var r=Math.floor(Math.random()*36);     //取得0-62间的随机数，目的是以此当下标取数组data里的值！
        result+=data[r];        //输出20次随机数的同时，让rrr加20次，就是20位的随机字符串了。
    }
    return result;
}