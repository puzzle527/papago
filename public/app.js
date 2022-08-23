//변수 네이밍 컨벤션, 도메인과 관련된 용어를 미리 정의
//source : 번역할 텍스트와 관련된 명칭
//target : 번역된 결과와 관련된 명칭

//[왼쪽 텍스트 영역, 오른쪽 텍스트 영역]
const [sourceTextArea, targetTextArea] = document.getElementsByClassName('Card__body__content');
const [sourceSelect, targetSelect] = document.getElementsByClassName('form-select');

//번역하고자 하는 언어의 타입(ko? en? ja?)
let targetLanguage = 'en'; //기본값으로 en

//어떤 언어로 번역할지 선택하는 target select박스의
//선택지의 값이 바뀔 때마다 이벤트 발생하고
//지정한 언어의 타입 값을 targetlanguage 변수에 할당, 출력
//change 이벤트 사용, select 박스가 객체가 가지고 있는 프로퍼티
targetSelect.addEventListener('change', () => {
    const targetValue = targetSelect.value;
    console.log(targetValue);
    targetLanguage = targetValue;
});

let debouncer;

sourceTextArea.addEventListener('input', (event) => {
    if(debouncer){
        clearTimeout(debouncer);
    }
    //setTimeout(callback, 지연할 시간(ms))
    //콜백함수 : 지연된 시간 후에 동작할 코드
    debouncer = setTimeout(() => {
        const text = event.target.value; //sourceTextArea의 입력한 값
        console.log(text);

        //ajax 활용하여 비동기 HTTP 요청 전송
        const xhr = new XMLHttpRequest();

        const url = '/detectLangs'; //node 서버의 특정 url 주소

        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4 && xhr.status === 200) {
                //최종적으로  papago가 번역해준 번역된 텍스트 결과를 받는 부분
                //서버의 응답 결과 확인하는 부분
                const parsedData = JSON.parse(xhr.responseText);
                const result = parsedData.message.result;

                targetTextArea.value = result.translatedText;

                const options = sourceSelect.options;

                for (let i = 0; i < options.length; i++) {
                    if(options[i].value === result.srcLangType) {
                        sourceSelect.selectedIndex = i;
                    }
                    
                }
            }
        }
        //요청 준비
        xhr.open('POST', url);

        //요청 보낼 때 동봉할 객체(object)
        const requestData = {
            text, //text: text 프로퍼티와 변수명이 동일한 경우 하나만 작성 가능
            targetLanguage,
        };

        //클라이언트가 서버에게 보내는 요청
        //데이터의 형식이 json 형식임을 명시
        xhr.setRequestHeader('Content-type', 'application/json'); //header : 제품의 설명서

        //보내기 전에 해야 할 일, JS obejct JSON으로 변환(직렬화)
        const jsonData = JSON.stringify(requestData);

        //실제 요청 전송
        xhr.send(jsonData);

    }, 3000);
})