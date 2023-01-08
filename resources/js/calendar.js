import '@fullcalendar/core/vdom'; // for Vite
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from 'axios';
// idがcalendarのDOMを取得
var calendarEl = document.getElementById("calendar");

let click = 0;
let oneClickTimer;
// カレンダーの設定
let calendar = new Calendar(calendarEl, {
    plugins: [interactionPlugin, dayGridPlugin],

    // 最初に表示させる形式
    initialView: "dayGridMonth",

    // ヘッダーの設定（左/中央/右）
    headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "",
    },
   selectable: true,  // 複数日選択可能
    select: function (info) {  // 選択時の処理
        const eventName = prompt("イベントを入力してください");
        // 入力された時に実行される
        
        if (eventName) {
            axios
                .post('/calendar', {
                    start_date: info.start.valueOf(),
                    end_date: info.end.valueOf(),
                    title: eventName,
                })
                .then(() => {
                    // イベントの追加
                    calendar.addEvent({
                        title: eventName,
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
            // 略
        } else if (click === 2) {
            clearTimeout(oneClickTimer);  // クリック1回時の処理を削除
            click = 0;

            // 削除処理
            if(!confirm('イベントを削除しますか？')) return false;

            const id = info.event._def.publicId;
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
calendar.render();
