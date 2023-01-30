import '@fullcalendar/core/vdom'; // for Vite
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import axios from 'axios';
// idがcalendarのDOMを取得
var calendarEl = document.getElementById("calendar");

if(calendarEl) {
let click = 0;
let oneClickTimer;
// カレンダーの設定
let calendar = new Calendar(calendarEl, {
    plugins: [interactionPlugin, dayGridPlugin,timeGridPlugin, listPlugin],

    // 最初に表示させる形式
    initialView: "dayGridMonth",
    
    // ヘッダーの設定（左/中央/右）
    headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,listWeek",
    },
   selectable: true,  // 複数日選択可能
    select: function (info) {  // 選択時の処理
        const eventName = prompt("イベントを入力してください");
        const eventdesc = prompt("詳細を入力してください");
        // 入力された時に実行される
        console.log(info.end.valueOf(),eventName);
        console.log(info.end.valueOf(),eventdesc);
        if (eventName) {
            axios
                .post('/calendar', {
                    start_date: info.start.valueOf(),
                    end_date: info.end.valueOf(),
                    title: eventName,
                    body:eventdesc,
                })
                .then((response) => {
                    console.log(response.data);
                    // イベントの追加
                    calendar.addEvent({
                        id: response.data.id,
                        title: eventName,
                        description:eventdesc,
                        start: info.start,
                        end: info.end,
                        allDay: true,
                    });
                })
                .catch(() => {
                    // バリデーションエラーなど
                    alert("登録に失敗しました");
                });
        }
    },
    events: function (info, successCallback, failureCallback) {
        console.log(info.start.valueOf());
        axios
            .post("/calendar/event", {
                start_date: info.start.valueOf(),
                end_date: info.end.valueOf(),
            })
            .then(response => {
                // 追加したイベントを削除
                calendar.removeAllEvents();
                // カレンダーに読み込み
                successCallback(response.data);
            })
            .catch(() => {
                // バリデーションエラーなど
                alert("取得に失敗しました");
            });
    },
    eventDrop: function(info) {
    const id = info.event._def.publicId;  // イベントのDBに登録されているidを取得
    axios
        .post(`/calendar/${id}`, {
            start_date: info.event._instance.range.start.valueOf(),
            end_date: info.event._instance.range.end.valueOf(),
        })
        .then(() => {
            alert("登録に成功しました！");
        })
        .catch(() => {
            // バリデーションエラーなど
            alert("登録に失敗しました");
        });
},
 eventClick: function(info) {
        click++;
        if (click === 1) {
            //  alert('Event: ' + info.event.title);
            //  alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
            //  alert('View: ' + info.view.type);
            console.log(info.event);
            document.getElementById("title").value=info.event.title;
            // document.getElementById("body").value=info.event.extendedProps.description;
            let text = document.getElementById('body').textContent; 
            document.getElementById('body').textContent = info.event.extendedProps.description;
            document.getElementById("easyModal").style.display="block";
            
        } else if (click === 2) {
            clearTimeout(oneClickTimer);  // クリック1回時の処理を削除
            click = 0;

            // 削除処理
            if(!confirm('イベントを削除しますか？')) return false;

            const id = info.event._def.publicId;
            console.log(id);
            axios
                .post(`/calendar/${id}/delete`)
                .then(() => {
                    info.event.remove();  // カレンダーからイベントを削除
                    alert("削除に成功しました！");
                })
                .catch(() => {
                    alert("削除に失敗しました");
                });
        }
        
    },
});
// const buttonOpen = document.getElementById('modalOpen');
const modal = document.getElementById('easyModal');
// const buttonClose = document.getElementsByClassName('modalClose')[0];

// ボタンがクリックされた時
// buttonOpen.addEventListener('click', modalOpen);
// function modalOpen() {
//   modal.style.display = 'block';
// }

// // バツ印がクリックされた時
// buttonClose.addEventListener('click', modalClose);
// function modalClose() {
//   modal.style.display = 'none';
// }

// // モーダルコンテンツ以外がクリックされた時
addEventListener('click', outsideClose);
function outsideClose(e) {
  if (e.target == modal) {
    modal.style.display = 'none';
  }
  }
calendar.render();
}