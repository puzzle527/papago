//Node.js, Express FW를 활용하여 간단한 Backend 서버 구성

//express 패키지 import
const express = require('express');

const dotenv = require('dotenv');
dotenv.config();

const app = express();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const request = require('request');

//express static 미들웨어 활용
//express한테 static 파일들의 경로가 어디에 있는지 명시
app.use(express.static("public"));

//express의 json 미들웨어 활용
app.use(express.json());

//일반적으로 /를 root 경로라고함
//root url : 127.0.0.1/
//IP주소 : 127.0.0.1, Port : 3000
//127.0.0.1의 Domain name : localhost
//http://localhost:3000
//app.get() -> 첫번째 인수로 지정한 경로로 클라이언트로부터 요청이 들어왔을 때
//두번째 인수로 작성된 콜백함수가 호출되면서 동작함
//그 콜백함수는 2개의 인수를 받음, 1)reqeust(req), 2)response(res)
app.get('/', (req, res) => {
    // res.send('응답 완료!');
    //root url, 즉 메인 페이지로 접속했을 때
    //우리가 만든 Node 서버는 papago의 메인 화면인
    //public/index.html을 응답해줘야 함
    res.sendFile("index.html");
});

//localhost:3000/detectLangs 경로로 요청했을 때
app.post('/detectLangs', (req, res) => {
    console.log('/detectLangs로 요청됨');
    //request.getParameter();
    console.log(req.body);

    //text 프로퍼티에 있는 값을 query 변수에 담고 싶고,
    //targetLanguage는 동일한 이름의 변수로 담고 싶음
    const { text:query, targetLanguage } = req.body;
    console.log(query, targetLanguage);

    //실제 papago 서버에 요청 전송, 택배를 보낼 주소
    const url ='https://openapi.naver.com/v1/papago/detectLangs';

    const options = { //택배를 보낼 물건
        url,
        form: { query },
        headers: { 
            'X-Naver-Client-Id': clientId, 
            'X-Naver-Client-Secret': clientSecret
        },
    };

    //실제 언어 감지 서비스 요청 부분
    //options 변수에 요청 전송시 필요한 데이터 및 보낼 주소 동봉
    //() => {} : 요청에 따른 응답 정보를 확인하는 부분
    request.post(options, (error, response, body) => {
        if(!error && response.statusCode === 200) { //응답이 성공적으로 완료되었을 경우
           //body를 parsing처리
           const parseData = JSON.parse(body);

           //papago 번역 url('/translate')로 redirect(요청 재지정)
           res.redirect(`translate?lang=${parseData['langCode']}&targetLanguage=${targetLanguage}&query=${query}`);
        } else { //응답이 실패했을 경우
            console.log(`error = ${response.statusCode}`);
        }
    });
});

//papgo  번역 요청 부분
app.get('/translate', (req, res) => {
    const url = 'https://openapi.naver.com/v1/papago/n2mt';
    const source = req.query.lang;
    const target = req.query.targetLanguage;
    const text = req.query.query;
    //req.query = {source, target, text};
    console.log(source, target, text);
    const options = {
        url,
        form: { source, target, text },
        headers: { 
            'X-Naver-Client-Id': clientId, 
            'X-Naver-Client-Secret': clientSecret
        },
    }

    //실제 번역 요청 전송부분
    request.post(options, (error, response, body) => {
        if(!error && response.statusCode === 200) { //응답이 성공적으로 완료되었을 경우
            res.send(body); //front에 해당하는 app.js에 papago로부터 받은 응답 데이터를 전송
         } else { //응답이 실패했을 경우 
             console.log(`error = ${response.statusCode}`);
         }
    });

});

//서버가 실행되었을 때 몇번 포트에서 실행시킬 것인지
app.listen(3000, () => console.log('http://127.0.0.1:3000/ app listening on port 3000'));

//Node.js 기반의 js파일 실행시에는 node로 시작하는 명렁어
//파일명까지 작성하면 됨
//ex) node server.js -> server.js 실행
//server.js는 express framework로 구성한 백엔드 서버 실행 코드 있음