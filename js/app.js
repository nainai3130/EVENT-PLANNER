
const navButtons=document.querySelectorAll(".bottom-nav button");
const page=document.querySelector(".page");

function addItemsStyles(){
    if(document.getElementById("items-custom-styles"))return;
    const style=document.createElement("style");
    style.id="items-custom-styles";
    style.textContent=`
.item-add-form{display:flex;align-items:center;gap:6px}
.item-add-form input{flex:1;min-width:0}
.item-add-actions{display:flex;flex:0 0 auto;gap:5px;margin:0}
.item-timing-add-button,.item-timing-move-button,.item-delete-button{width:38px;height:38px;min-height:38px;padding:0;border:1px solid #ead7de;border-radius:10px;background:#fff7fa;color:#756b70;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .15s ease,border-color .15s ease,transform .1s ease}
.item-timing-add-button:active,.item-timing-move-button:active,.item-delete-button:active{transform:scale(.9)}
.item-timing-add-button.night:hover,.item-timing-move-button.night:hover{background:#f9eef3;border-color:#d9c2ca}
.item-timing-add-button.morning,.item-timing-move-button.morning{background:#fff8ef}
.item-timing-add-button.morning:hover,.item-timing-move-button.morning:hover{background:#fff1df;border-color:#e6c9ad}
.item-timing-add-button.selected.night{background:#e8c7d1;border-color:#d7aebb;color:#fff}
.item-timing-add-button.selected.morning{background:#f0c58f;border-color:#dfa96d;color:#fff}
.item-timing-add-button.selected .timing-icon.moon svg{fill:#fff}
.item-timing-add-button.selected .timing-icon.sun svg{stroke:#fff}
.timing-icon{width:18px;height:18px;display:block;flex:0 0 18px}
.timing-icon svg{width:100%;height:100%;display:block}
.timing-icon.moon svg{fill:#756b70}
.timing-icon.sun svg{fill:none;stroke:#d69a62;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.item-list-row{display:flex;align-items:center;gap:8px}
.item-check-label{flex:1;min-width:0;display:flex;align-items:center}
.item-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.item-row-actions{display:flex;align-items:center;gap:5px;flex:0 0 auto}
.item-timing-move-button{width:34px;height:34px;min-height:34px;border-radius:9px}
.item-delete-button{width:34px;height:34px;min-height:34px;border-radius:9px;background:#fff;border-color:#eadfe2;color:#9b858c}
.item-delete-button:hover{background:#fff3f5;border-color:#e2c3ca;color:#b56e7b}
.trash-icon{width:17px;height:17px;display:block}
.trash-icon svg{width:100%;height:100%;display:block;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.item-timing-section{margin-top:24px}
.item-timing-header{display:flex;align-items:center;gap:9px;margin-bottom:10px}
.item-timing-header h3{margin:0}
.item-timing-label{display:flex;align-items:center;gap:7px}
.item-timing-count{color:#9b8e94;font-size:12px;font-weight:400}
.item-timing-list{display:flex;flex-direction:column;gap:8px}
.item-timing-empty{padding:16px;border:1px dashed #e8dce0;border-radius:12px;color:#a3969b;font-size:13px;text-align:center;background:#fff}
.item-filter-buttons{display:flex;flex-wrap:wrap;gap:7px}
.item-filter-button{min-height:36px}
.item-bulk-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 16px}
.item-bulk-button{min-height:38px;padding:7px 10px;border:1px solid #eadde2;border-radius:11px;background:#fffafb;color:#9a858e;font-size:11px;font-weight:600;transition:background .15s ease,border-color .15s ease,transform .1s ease}
.item-bulk-button:hover{background:#fff0f4;border-color:#e8cad4}
.item-bulk-button:active{transform:scale(.98)}
.item-list-row-checked{order:2}
.item-list-row:not(.item-list-row-checked){order:1}
@media(max-width:480px){
.item-add-form{gap:5px}
.item-timing-add-button{width:36px;height:36px;min-height:36px}
.timing-icon{width:17px;height:17px;flex-basis:17px}
.item-timing-move-button,.item-delete-button{width:33px;height:33px;min-height:33px}
.item-bulk-actions{gap:6px}
.item-bulk-button{font-size:10px}
}
`;
    document.head.appendChild(style);
}
addItemsStyles();

const ITEM_TYPES={
    event:"イベント",
    hotel:"宿泊",
    walk:"徒歩",
    train:"電車",
    bus:"バス",
    taxi:"タクシー",
    car:"車",
    shinkansen:"新幹線",
    plane:"飛行機"
};

const TYPE_BY_LABEL={
    "イベント":"event",
    "宿泊":"hotel",
    "徒歩":"walk",
    "電車":"train",
    "バス":"bus",
    "タクシー":"taxi",
    "車":"car",
    "新幹線":"shinkansen",
    "飛行機":"plane"
};

const EVENTS_STORAGE_KEY="oshikatsu-events";
const OLD_EVENT_STORAGE_KEY="oshikatsu-event";

navButtons.forEach((button,index)=>{
    button.addEventListener("click",()=>{
        if(index===0){showHome();return}
        if(index===1){showEventList();return}
        if(index===2){showItemsPage();return}
        if(index===3){showHistoryPage();return}
    });
});

migrateOldEvent();
showHome();

function getEvents(){
    const saved=localStorage.getItem(EVENTS_STORAGE_KEY);
    if(!saved)return [];
    try{
        const events=JSON.parse(saved);
        if(!Array.isArray(events))return [];
        return events;
    }catch(error){
        console.error("予定データの読み込みに失敗しました。",error);
        return [];
    }
}

function saveEvents(events){
    localStorage.setItem(EVENTS_STORAGE_KEY,JSON.stringify(events));
}

function migrateOldEvent(){
    const currentEvents=localStorage.getItem(EVENTS_STORAGE_KEY);
    if(currentEvents){
        try{
            const parsed=JSON.parse(currentEvents);
            if(Array.isArray(parsed))return;
        }catch(error){
            console.warn("予定データの読み込みに失敗しました。",error);
        }
    }

    const oldEvent=localStorage.getItem(OLD_EVENT_STORAGE_KEY);
    if(!oldEvent){
        localStorage.setItem(EVENTS_STORAGE_KEY,JSON.stringify([]));
        return;
    }

    try{
        const parsed=JSON.parse(oldEvent);
        if(!parsed){
            localStorage.setItem(EVENTS_STORAGE_KEY,JSON.stringify([]));
            return;
        }

        const migratedEvent={
            id:createId(),
            version:6,
            name:parsed.name||"",
            date:parsed.date||"",
            open:parsed.open||"",
            start:parsed.start||"",
            end:parsed.end||"",
            venue:parsed.venue||"",
            seat:parsed.seat||"",
            memo:parsed.memo||"",
            timeline:Array.isArray(parsed.timeline)?parsed.timeline:[],
            createdAt:new Date().toISOString()
        };

        localStorage.setItem(EVENTS_STORAGE_KEY,JSON.stringify([migratedEvent]));
    }catch(error){
        console.error("既存予定の移行に失敗しました。",error);
        localStorage.setItem(EVENTS_STORAGE_KEY,JSON.stringify([]));
    }
}

function createId(){
    return Date.now().toString(36)+Math.random().toString(36).substring(2,9);
}

function showHome(){
    const events=getEvents();
    const today=getTodayString();

    const upcomingEvents=events.filter(event=>{
        if(!event.date)return true;
        return event.date>=today;
    }).sort(compareEvents);

    const nextEvent=upcomingEvents[0];

    if(!nextEvent){
        showEmptyHome();
        return;
    }

    page.innerHTML=`
        <h2>ホーム</h2>
        <div class="home-card">
            <div class="home-card-header">
                <div>
                    <h3>次の予定</h3>
                    <p>${formatDate(nextEvent.date)}</p>
                </div>
            </div>
            <div class="home-event-info">
                <h3>${escapeHTML(nextEvent.name)||"イベント名未入力"}</h3>
                ${nextEvent.venue?`<p>${escapeHTML(nextEvent.venue)}</p>`:""}
                ${nextEvent.seat?`<p>座席 ${escapeHTML(nextEvent.seat)}</p>`:""}
                <div class="home-event-time">
                    ${nextEvent.open?`<span>開場 ${escapeHTML(nextEvent.open)}</span>`:""}
                    ${nextEvent.start?`<span>開演 ${escapeHTML(nextEvent.start)}</span>`:""}
                    ${nextEvent.end?`<span>終演 ${escapeHTML(nextEvent.end)}</span>`:""}
                </div>
                ${nextEvent.memo?`<p>${escapeHTML(nextEvent.memo)}</p>`:""}
            </div>
        </div>
        ${createTimelineHTML(nextEvent.timeline)}
        ${createHomeItemsHTML()}
        ${createDataManagementHTML()}
    `;

    bindDataManagement();
}

function createHomeItemsHTML(){
    const items=typeof getItems==="function"?getItems():[];
    const checkedCount=items.filter(item=>item.checked).length;

    if(items.length===0){
        return`
            <div class="home-card">
                <div class="home-card-header">
                    <div>
                        <h3>持ち物</h3>
                        <p>まだ持ち物が登録されていません</p>
                    </div>
                </div>
            </div>
        `;
    }

    const sortedItems=[...items].sort((a,b)=>Number(Boolean(a.checked))-Number(Boolean(b.checked)));
    const nightItems=sortedItems.filter(item=>item.timing!=="morning");
    const morningItems=sortedItems.filter(item=>item.timing==="morning");

    return`
        <div class="home-card">
            <div class="home-card-header">
                <div>
                    <h3>持ち物</h3>
                    <p>${checkedCount} / ${items.length} 個チェック済み</p>
                </div>
            </div>
            ${createHomeItemTimingGroup("night",nightItems)}
            ${createHomeItemTimingGroup("morning",morningItems)}
        </div>
    `;
}

function createHomeItemTimingGroup(timing,items){
    if(items.length===0)return "";

    const label=timing==="morning"?"朝に入れるもの":"夜に入れるもの";

    return`
        <div class="item-timing-section">
            <div class="item-timing-header">
                <div class="item-timing-label">
                    ${createTimingIcon(timing)}
                    <h3>${label}</h3>
                </div>
            </div>
            <div class="home-items-list">
                ${items.slice(0,5).map(item=>`
                    <div class="home-item-row">
                        <span class="${item.checked?"item-checked":""}">${escapeHTML(item.name)}</span>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

function showEmptyHome(){
    page.innerHTML=`
        <h2>ホーム</h2>
        <div class="home-card">
            <div class="home-card-header">
                <div>
                    <h3>次の予定</h3>
                    <p>まだ予定がありません</p>
                </div>
            </div>
            <p>「予定」タブから予定を登録できます。</p>
        </div>
        ${createHomeItemsHTML()}
        ${createDataManagementHTML()}
    `;

    bindDataManagement();
}

function createDataManagementHTML(){
    return`
        <div class="data-management">
            <div class="data-management-title">データ管理</div>
            <div class="data-management-actions">
                <button type="button" id="backup-data-button">バックアップ</button>
                <button type="button" id="import-data-button">インポート</button>
            </div>
            <p>予定や持ち物をファイルに保存できます</p>
            <input type="file" id="import-data-input" accept=".json,application/json" hidden>
        </div>
    `;
}

function bindDataManagement(){
    const backupButton=document.getElementById("backup-data-button");
    const importButton=document.getElementById("import-data-button");
    const input=document.getElementById("import-data-input");

    if(!backupButton||!importButton||!input)return;

    backupButton.onclick=backupData;
    importButton.onclick=()=>input.click();

    input.onchange=event=>{
        const file=event.target.files&&event.target.files[0];
        if(file)importData(file);
        input.value="";
    };
}

function backupData(){
    const data={};

    Object.keys(localStorage).forEach(key=>{
        if(key.startsWith("oshikatsu-")){
            try{
                data[key]=JSON.parse(localStorage.getItem(key));
            }catch(error){
                data[key]=localStorage.getItem(key);
            }
        }
    });

    const backup={
        app:"EVENT PLANNER",
        version:1,
        exportedAt:new Date().toISOString(),
        data
    };

    const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    const date=new Date();

    const stamp=
        date.getFullYear()+
        String(date.getMonth()+1).padStart(2,"0")+
        String(date.getDate()).padStart(2,"0");

    link.href=url;
    link.download=`event-planner-backup-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    alert("バックアップを保存しました。");
}

function importData(file){
    const reader=new FileReader();

    reader.onload=()=>{
        try{
            const backup=JSON.parse(reader.result);

            if(!backup||backup.app!=="EVENT PLANNER"||!backup.data||typeof backup.data!=="object"){
                throw new Error("invalid backup");
            }

            const keys=Object.keys(backup.data);

            if(keys.length===0){
                alert("読み込めるデータがありません。");
                return;
            }

            const confirmed=confirm("バックアップのデータを読み込みますか？\n現在の予定や持ち物はバックアップの内容に置き換わります。");

            if(!confirmed)return;

            keys.forEach(key=>{
                const value=backup.data[key];

                if(typeof value==="string"){
                    localStorage.setItem(key,value);
                }else{
                    localStorage.setItem(key,JSON.stringify(value));
                }
            });

            alert("データを復元しました。");
            location.reload();
        }catch(error){
            console.error(error);
            alert("このファイルはEVENT PLANNERのバックアップとして読み込めません。");
        }
    };

    reader.onerror=()=>alert("ファイルの読み込みに失敗しました。");
    reader.readAsText(file);
}

function showEventList(){
    const events=getEvents();
    const today=getTodayString();

    const upcomingEvents=events.filter(event=>{
        if(!event.date)return true;
        return event.date>=today;
    }).sort(compareEvents);

    const pastEvents=events.filter(event=>{
        if(!event.date)return false;
        return event.date<today;
    }).sort((a,b)=>compareEvents(b,a));

    page.innerHTML=`
        <div class="page-header"><h2>予定</h2></div>

        <div class="form-section">
            <div class="section-title-row">
                <div>
                    <h3>今後の予定</h3>
                    <p>これからの予定を確認できます</p>
                </div>
            </div>

            <div id="upcoming-event-list">
                ${upcomingEvents.length>0?upcomingEvents.map(createEventListCard).join(""):`<p>予定はありません</p>`}
            </div>

            <button type="button" class="primary-button" id="new-event-button">新しい予定を登録</button>
        </div>

        <div class="form-section">
            <div class="section-title-row">
                <div>
                    <h3>過去の予定</h3>
                    <p>以前の遠征やイベントを確認できます</p>
                </div>
            </div>

            <div id="past-event-list">
                ${pastEvents.length>0?pastEvents.map(createEventListCard).join(""):`<p>過去の予定はありません</p>`}
            </div>
        </div>
    `;

    const newEventButton=document.getElementById("new-event-button");

    if(newEventButton){
        newEventButton.onclick=event=>{
            event.preventDefault();
            event.stopPropagation();
            showEventForm();
        };
    }

    document.querySelectorAll(".event-list-card").forEach(card=>{
        card.addEventListener("click",event=>{
            if(event.target.closest(".event-edit-button")||event.target.closest(".event-delete-button"))return;
            showEventDetail(card.dataset.id);
        });
    });

    document.querySelectorAll(".event-edit-button").forEach(button=>{
        button.addEventListener("click",event=>{
            event.preventDefault();
            event.stopPropagation();
            showEventForm(button.dataset.id);
        });
    });

    document.querySelectorAll(".event-delete-button").forEach(button=>{
        button.addEventListener("click",event=>{
            event.preventDefault();
            event.stopPropagation();
            deleteEvent(button.dataset.id);
        });
    });
}

function createEventListCard(event){
    return`
        <div class="event-list-card" data-id="${escapeHTML(event.id)}">
            <div class="event-list-card-main">
                <div class="event-list-card-date">${formatDate(event.date)}</div>

                <div class="event-list-card-content">
                    <strong>${escapeHTML(event.name)||"イベント名未入力"}</strong>
                    ${event.venue?`<span>${escapeHTML(event.venue)}</span>`:""}
                    ${event.seat?`<span>座席 ${escapeHTML(event.seat)}</span>`:""}
                </div>
            </div>

            <div class="event-list-card-actions">
                <button type="button" class="event-edit-button" data-id="${escapeHTML(event.id)}">編集</button>
                <button type="button" class="event-delete-button" data-id="${escapeHTML(event.id)}">削除</button>
            </div>
        </div>
    `;
}

function showEventDetail(id){
    const event=getEvents().find(item=>item.id===id);

    if(!event){
        showEventList();
        return;
    }

    page.innerHTML=`
        <div class="page-header"><h2>予定詳細</h2></div>

        <div class="home-card">
            <div class="home-event-info">
                <p>${formatDate(event.date)}</p>
                <h3>${escapeHTML(event.name)||"イベント名未入力"}</h3>
                ${event.venue?`<p>${escapeHTML(event.venue)}</p>`:""}
                ${event.seat?`<p>座席 ${escapeHTML(event.seat)}</p>`:""}

                <div class="home-event-time">
                    ${event.open?`<span>開場 ${escapeHTML(event.open)}</span>`:""}
                    ${event.start?`<span>開演 ${escapeHTML(event.start)}</span>`:""}
                    ${event.end?`<span>終演 ${escapeHTML(event.end)}</span>`:""}
                </div>

                ${event.memo?`<p>${escapeHTML(event.memo)}</p>`:""}
            </div>
        </div>

        ${createTimelineHTML(event.timeline)}

        <div class="detail-actions">
            <button type="button" class="primary-button" id="edit-event-button">編集</button>
            <button type="button" class="secondary-button danger-button" id="delete-event-button">削除</button>
            <button type="button" class="secondary-button" id="back-to-event-list">予定一覧に戻る</button>
        </div>
    `;

    document.getElementById("edit-event-button").onclick=()=>showEventForm(id);
    document.getElementById("delete-event-button").onclick=()=>deleteEvent(id);
    document.getElementById("back-to-event-list").onclick=showEventList;
}

function deleteEvent(id){
    const events=getEvents();
    const event=events.find(item=>item.id===id);

    if(!event)return;

    const eventName=event.name||"この予定";

    showEventDeleteConfirm(eventName,()=>{
        saveEvents(events.filter(item=>item.id!==id));
        showEventList();
    });
}

function showEventForm(editId=null,copiedEvent=null){
    const isEdit=Boolean(editId);
    const isCopy=Boolean(copiedEvent);
    let editEvent=null;

    if(isEdit){
        editEvent=getEvents().find(event=>event.id===editId);

        if(!editEvent){
            showEventList();
            return;
        }
    }

    if(isCopy){
        editEvent=JSON.parse(JSON.stringify(copiedEvent));
    }

    page.innerHTML=`
        <div class="page-header">
            <h2>${isEdit?"予定を編集":isCopy?"予定をコピー":"新しい予定"}</h2>
        </div>

        ${isCopy?`
            <div class="copy-notice">
                <strong>過去の予定をコピーしています</strong>
                <p>日付や内容を変更して、新しい予定として登録できます。</p>
            </div>
        `:""}

        <div class="form-section">
            <h3>イベント情報</h3>

            <div class="form-group">
                <label>イベント名</label>
                <input type="text" id="event-name" placeholder="イベント名">
            </div>

            <div class="form-group">
                <label>日付</label>
                <input type="date" id="event-date">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>開場</label>
                    <input type="time" id="event-open">
                </div>

                <div class="form-group">
                    <label>開演</label>
                    <input type="time" id="event-start">
                </div>
            </div>

            <div class="form-group">
                <label>終演</label>
                <input type="time" id="event-end">
            </div>

            <div class="form-group">
                <label>会場</label>
                <input type="text" id="event-venue" placeholder="会場">
            </div>

            <div class="form-group">
                <label>座席番号</label>
                <input type="text" id="event-seat" placeholder="例：アリーナ A5ブロック 12列 24番">
            </div>

            <div class="form-group">
                <label>メモ</label>
                <textarea id="event-memo" rows="4" placeholder="メモ"></textarea>
            </div>
        </div>

        <div class="form-section">
            <div class="section-title-row">
                <div>
                    <h3>タイムライン</h3>
                    <p>イベント・宿泊・移動を追加できます</p>
                </div>
            </div>

            <div id="timeline-list"></div>

            <button type="button" class="secondary-button" id="add-timeline-button">項目を追加</button>
        </div>

        <button type="button" class="primary-button" id="save-event-button">${isEdit?"変更を保存":"予定を登録"}</button>
        <button type="button" class="secondary-button" id="cancel-event-button">キャンセル</button>
    `;

    if(editEvent){
        document.getElementById("event-name").value=editEvent.name||"";
        document.getElementById("event-date").value=editEvent.date||"";
        document.getElementById("event-open").value=editEvent.open||"";
        document.getElementById("event-start").value=editEvent.start||"";
        document.getElementById("event-end").value=editEvent.end||"";
        document.getElementById("event-venue").value=editEvent.venue||"";
        document.getElementById("event-seat").value=editEvent.seat||"";
        document.getElementById("event-memo").value=editEvent.memo||"";

        if(Array.isArray(editEvent.timeline)){
            editEvent.timeline.forEach(timelineItem=>{
                addTimelineItem(normalizeType(timelineItem.type),timelineItem.data||{});
            });
        }
    }

    document.getElementById("add-timeline-button").onclick=showItemSelector;
    document.getElementById("save-event-button").onclick=()=>saveEvent(editId);

    document.getElementById("cancel-event-button").onclick=()=>{
        if(isEdit)showEventDetail(editId);
        else if(isCopy)showHistoryPage();
        else showEventList();
    };
}

function showHistoryPage(){
    const events=getEvents();
    const today=getTodayString();

    const pastEvents=events.filter(event=>{
        if(!event.date)return false;
        return event.date<today;
    }).sort((a,b)=>compareEvents(b,a));

    page.innerHTML=`
        <div class="page-header"><h2>過去のイベント</h2></div>

        <div class="form-section">
            <div class="section-title-row">
                <div>
                    <h3>過去のイベント</h3>
                    <p>以前の遠征やイベントをコピーできます</p>
                </div>
            </div>

            <div class="history-list">
                ${pastEvents.length>0?pastEvents.map(createHistoryCard).join(""):`
                    <div class="home-card">
                        <p>過去のイベントはまだありません。</p>
                    </div>
                `}
            </div>
        </div>
    `;

    document.querySelectorAll(".history-copy-button").forEach(button=>{
        button.onclick=event=>{
            event.preventDefault();
            event.stopPropagation();
            copyEvent(button.dataset.id);
        };
    });

    document.querySelectorAll(".history-event-card").forEach(card=>{
        card.onclick=event=>{
            if(event.target.closest(".history-copy-button"))return;
            showEventDetail(card.dataset.id);
        };
    });
}

function createHistoryCard(event){
    return`
        <div class="event-list-card history-event-card" data-id="${escapeHTML(event.id)}">
            <div class="event-list-card-main">
                <div class="event-list-card-date">${formatDate(event.date)}</div>

                <div class="event-list-card-content">
                    <strong>${escapeHTML(event.name)||"イベント名未入力"}</strong>
                    ${event.venue?`<span>${escapeHTML(event.venue)}</span>`:""}
                    ${event.seat?`<span>座席 ${escapeHTML(event.seat)}</span>`:""}
                </div>
            </div>

            <div class="event-list-card-actions">
                <button type="button" class="primary-button history-copy-button" data-id="${escapeHTML(event.id)}">この予定をコピー</button>
            </div>
        </div>
    `;
}

function copyEvent(id){
    const event=getEvents().find(item=>item.id===id);

    if(!event)return;

    const copiedEvent=JSON.parse(JSON.stringify(event));

    showEventForm(null,copiedEvent);
}

function showItemSelector(){
    const timelineList=document.getElementById("timeline-list");
    const selector=document.createElement("div");

    selector.className="action-selector";

    selector.innerHTML=`
        <div class="action-selector-header">
            <h3>何を追加しますか？</h3>
            <button type="button" class="close-selector-button">×</button>
        </div>

        <div class="action-grid">
            <button type="button" data-type="event"><span></span><small>イベント</small></button>
            <button type="button" data-type="hotel"><span></span><small>宿泊</small></button>
            <button type="button" data-type="travel"><span></span><small>移動</small></button>
        </div>
    `;

    timelineList.appendChild(selector);

    selector.querySelector(".close-selector-button").onclick=()=>selector.remove();

    selector.querySelectorAll(".action-grid button").forEach(button=>{
        button.onclick=()=>{
            const type=button.dataset.type;

            selector.remove();

            if(type==="travel")showTravelSelector();
            else addTimelineItem(type);
        };
    });
}

function showTravelSelector(){
    const timelineList=document.getElementById("timeline-list");
    const selector=document.createElement("div");

    selector.className="action-selector";

    selector.innerHTML=`
        <div class="action-selector-header">
            <h3>移動手段を選択</h3>
            <button type="button" class="close-selector-button">×</button>
        </div>

        <div class="action-grid">
            <button type="button" data-type="walk"><span></span><small>徒歩</small></button>
            <button type="button" data-type="train"><span></span><small>電車</small></button>
            <button type="button" data-type="bus"><span></span><small>バス</small></button>
            <button type="button" data-type="taxi"><span></span><small>タクシー</small></button>
            <button type="button" data-type="car"><span></span><small>車</small></button>
            <button type="button" data-type="shinkansen"><span></span><small>新幹線</small></button>
            <button type="button" data-type="plane"><span></span><small>飛行機</small></button>
        </div>
    `;

    timelineList.appendChild(selector);

    selector.querySelector(".close-selector-button").onclick=()=>selector.remove();

    selector.querySelectorAll(".action-grid button").forEach(button=>{
        button.onclick=()=>{
            const type=button.dataset.type;

            selector.remove();
            addTimelineItem(type);
        };
    });
}

function addTimelineItem(type,existingData={}){
    const timelineList=document.getElementById("timeline-list");
    const item=document.createElement("div");

    item.className="timeline-item";
    item.dataset.type=type;

    let formHTML="";

    if(type==="event"){
        formHTML=`
            <div class="form-group">
                <label>イベント名</label>
                <input type="text" class="name" placeholder="イベント名">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>開場</label>
                    <input type="time" class="open">
                </div>

                <div class="form-group">
                    <label>開演</label>
                    <input type="time" class="start">
                </div>
            </div>

            <div class="form-group">
                <label>終演</label>
                <input type="time" class="end">
            </div>

            <div class="form-group">
                <label>会場</label>
                <input type="text" class="venue" placeholder="会場">
            </div>

            <div class="form-group">
                <label>メモ</label>
                <input type="text" class="memo" placeholder="メモ">
            </div>
        `;
    }

    if(type==="hotel"){
        formHTML=`
            <div class="form-group">
                <label>宿泊施設名</label>
                <input type="text" class="name" placeholder="宿泊施設名">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>チェックイン</label>
                    <input type="time" class="checkin">
                </div>

                <div class="form-group">
                    <label>チェックアウト</label>
                    <input type="time" class="checkout">
                </div>
            </div>

            <div class="form-group">
                <label>場所</label>
                <input type="text" class="location" placeholder="場所">
            </div>

            <div class="form-group">
                <label>予約番号</label>
                <input type="text" class="reservation" placeholder="予約番号">
            </div>

            <div class="form-group">
                <label>メモ</label>
                <input type="text" class="memo" placeholder="メモ">
            </div>
        `;
    }

    if(["walk","train","bus","taxi","car"].includes(type)){
        formHTML=`
            <div class="form-row">
                <div class="form-group">
                    <label>出発時刻</label>
                    <input type="time" class="start">
                </div>

                <div class="form-group">
                    <label>到着時刻</label>
                    <input type="time" class="end">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>出発地</label>
                    <input type="text" class="from" placeholder="出発地">
                </div>

                <div class="form-group">
                    <label>到着地</label>
                    <input type="text" class="to" placeholder="到着地">
                </div>
            </div>

            <div class="form-group">
                <label>詳細</label>
                <input type="text" class="detail" placeholder="路線・便など">
            </div>

            <div class="form-group">
                <label>メモ</label>
                <input type="text" class="memo" placeholder="メモ">
            </div>
        `;
    }

    if(type==="shinkansen"){
        formHTML=`
            <div class="form-row">
                <div class="form-group">
                    <label>出発時刻</label>
                    <input type="time" class="start">
                </div>

                <div class="form-group">
                    <label>到着時刻</label>
                    <input type="time" class="end">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>出発駅</label>
                    <input type="text" class="from" placeholder="出発駅">
                </div>

                <div class="form-group">
                    <label>到着駅</label>
                    <input type="text" class="to" placeholder="到着駅">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>列車名</label>
                    <input type="text" class="detail" placeholder="列車名">
                </div>

                <div class="form-group">
                    <label>座席</label>
                    <input type="text" class="seat" placeholder="座席">
                </div>
            </div>

            <div class="form-group">
                <label>メモ</label>
                <input type="text" class="memo" placeholder="メモ">
            </div>
        `;
    }

    if(type==="plane"){
        formHTML=`
            <div class="form-row">
                <div class="form-group">
                    <label>出発時刻</label>
                    <input type="time" class="start">
                </div>

                <div class="form-group">
                    <label>到着時刻</label>
                    <input type="time" class="end">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>出発空港</label>
                    <input type="text" class="from" placeholder="出発空港">
                </div>

                <div class="form-group">
                    <label>到着空港</label>
                    <input type="text" class="to" placeholder="到着空港">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>航空会社</label>
                    <input type="text" class="airline" placeholder="航空会社">
                </div>

                <div class="form-group">
                    <label>便名</label>
                    <input type="text" class="flight" placeholder="便名">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>ターミナル</label>
                    <input type="text" class="terminal" placeholder="ターミナル">
                </div>

                <div class="form-group">
                    <label>座席</label>
                    <input type="text" class="seat" placeholder="座席">
                </div>
            </div>

            <div class="form-group">
                <label>メモ</label>
                <input type="text" class="memo" placeholder="メモ">
            </div>
        `;
    }

    item.innerHTML=`
        <div class="timeline-item-header">
            <strong>${ITEM_TYPES[type]}</strong>
            <button type="button" class="delete-timeline-button">×</button>
        </div>

        ${formHTML}
    `;

    item.querySelector(".delete-timeline-button").onclick=()=>item.remove();

    timelineList.appendChild(item);

    Object.keys(existingData).forEach(key=>{
        const input=item.querySelector(`.${key}`);
        if(input)input.value=existingData[key]||"";
    });
}

function saveEvent(editId=null){
    const timeline=Array.from(document.querySelectorAll(".timeline-item")).map(item=>{
        const data={};

        item.querySelectorAll("input").forEach(input=>{
            data[input.className]=input.value;
        });

        return{
            type:item.dataset.type,
            data
        };
    });

    const eventData={
        id:editId||createId(),
        version:6,
        name:document.getElementById("event-name").value,
        date:document.getElementById("event-date").value,
        open:document.getElementById("event-open").value,
        start:document.getElementById("event-start").value,
        end:document.getElementById("event-end").value,
        venue:document.getElementById("event-venue").value,
        seat:document.getElementById("event-seat").value,
        memo:document.getElementById("event-memo").value,
        timeline,
        createdAt:editId?(
            getEvents().find(event=>event.id===editId)?.createdAt||new Date().toISOString()
        ):new Date().toISOString()
    };

    const events=getEvents();

    showEventSaveConfirm(eventData,editId,()=>{
        if(editId){
            const index=events.findIndex(event=>event.id===editId);

            if(index!==-1){
                events[index]=eventData;
            }
        }else{
            events.push(eventData);
        }

        saveEvents(events);
        showEventDetail(eventData.id);
    });
}

function createTimelineHTML(timeline){
    if(!timeline||timeline.length===0)return "";

    const normalizedTimeline=timeline.map(normalizeTimelineItem);

    normalizedTimeline.sort((a,b)=>getSortTime(a).localeCompare(getSortTime(b)));

    let html=`
        <div class="form-section">
            <div class="section-title-row">
                <div>
                    <h3>タイムライン</h3>
                    <p>登録した予定を時系列で表示しています</p>
                </div>
            </div>

            <div class="home-timeline">
    `;

    normalizedTimeline.forEach(item=>{
        html+=createTimelineItemHTML(item);
    });

    html+=`
            </div>
        </div>
    `;

    return html;
}

function normalizeTimelineItem(item){
    const data=item.data||{};
    let type=item.type||"";

    if(TYPE_BY_LABEL[type])type=TYPE_BY_LABEL[type];

    return{
        type,
        name:data.name||data.timelineName||data.timelineEventName||data.timelineHotelName||"",
        start:data.start||data.timelineStart||"",
        end:data.end||data.timelineEnd||"",
        open:data.open||data.timelineOpen||"",
        checkin:data.checkin||data.timelineCheckin||"",
        checkout:data.checkout||data.timelineCheckout||"",
        from:data.from||data.timelineFrom||"",
        to:data.to||data.timelineTo||"",
        venue:data.venue||data.timelineVenue||"",
        location:data.location||data.timelineLocation||"",
        detail:data.detail||data.timelineDetail||"",
        seat:data.seat||data.timelineSeat||"",
        airline:data.airline||data.timelineAirline||"",
        flight:data.flight||data.timelineFlight||"",
        terminal:data.terminal||data.timelineTerminal||"",
        reservation:data.reservation||data.timelineReservation||"",
        memo:data.memo||data.timelineMemo||""
    };
}

function normalizeType(type){
    if(TYPE_BY_LABEL[type])return TYPE_BY_LABEL[type];
    return type;
}

function getSortTime(item){
    if(item.type==="hotel")return item.checkin||item.checkout||"99:99";
    return item.open||item.start||"99:99";
}

function compareEvents(a,b){
    const dateA=a.date||"9999-99-99";
    const dateB=b.date||"9999-99-99";

    return dateA.localeCompare(dateB);
}

function getTodayString(){
    const now=new Date();

    const year=now.getFullYear();
    const month=String(now.getMonth()+1).padStart(2,"0");
    const day=String(now.getDate()).padStart(2,"0");

    return`${year}-${month}-${day}`;
}

function createTimelineItemHTML(item){
    if(["walk","train","bus","taxi","car","shinkansen","plane"].includes(item.type)){
        return createTravelTimelineItemHTML(item);
    }

    if(item.type==="hotel"){
        const time=item.checkin||item.checkout||"";

        return`
            <div class="home-timeline-item home-timeline-single">
                <div class="home-timeline-time">${escapeHTML(time)}</div>

                <div class="home-timeline-line">
                    <span></span>
                </div>

                <div class="home-timeline-content">
                    <strong>${escapeHTML(item.name||"宿泊")}</strong>

                    <div class="home-timeline-details">
                        ${item.location?`<p>${escapeHTML(item.location)}</p>`:""}
                        ${item.checkin?`<span>チェックイン ${escapeHTML(item.checkin)}</span>`:""}
                        ${item.checkout?`<span>チェックアウト ${escapeHTML(item.checkout)}</span>`:""}
                        ${item.reservation?`<span>予約番号 ${escapeHTML(item.reservation)}</span>`:""}
                    </div>

                    ${item.memo?`<p class="timeline-home-memo">${escapeHTML(item.memo)}</p>`:""}
                </div>
            </div>
        `;
    }

    const time=item.start||item.open||"";

    return`
        <div class="home-timeline-item home-timeline-single">
            <div class="home-timeline-time">${escapeHTML(time)}</div>

            <div class="home-timeline-line">
                <span></span>
            </div>

            <div class="home-timeline-content">
                <strong>${escapeHTML(item.name||"イベント")}</strong>

                <div class="home-timeline-details">
                    ${item.venue?`<p>${escapeHTML(item.venue)}</p>`:""}
                    ${item.open?`<span>開場 ${escapeHTML(item.open)}</span>`:""}
                    ${item.start?`<span>開演 ${escapeHTML(item.start)}</span>`:""}
                    ${item.end?`<span>終演 ${escapeHTML(item.end)}</span>`:""}
                </div>

                ${item.memo?`<p class="timeline-home-memo">${escapeHTML(item.memo)}</p>`:""}
            </div>
        </div>
    `;
}

function createTravelTimelineItemHTML(item){
    const travelName=ITEM_TYPES[item.type]||"移動";
    const hasStart=Boolean(item.start);
    const hasEnd=Boolean(item.end);
    const from=item.from||"出発地未設定";
    const to=item.to||"到着地未設定";

    return`
        <div class="home-timeline-travel">
            <div class="home-timeline-travel-times">
                <div class="home-timeline-travel-time">${hasStart?escapeHTML(item.start):"—"}</div>
                <div class="home-timeline-travel-time">${hasEnd?escapeHTML(item.end):"—"}</div>
            </div>

            <div class="home-timeline-travel-track">
                <span class="home-timeline-travel-dot"></span>
                <span class="home-timeline-travel-connector"></span>
                <span class="home-timeline-travel-dot"></span>
            </div>

            <div class="home-timeline-travel-content">
                <div class="travel-point">
                    <strong>${escapeHTML(from)}</strong>
                    <span>出発</span>
                </div>

                <div class="travel-middle">
                    <strong>${escapeHTML(travelName)}</strong>
                    ${item.detail?`<span>${escapeHTML(item.detail)}</span>`:""}
                    ${item.airline?`<span>${escapeHTML(item.airline)}</span>`:""}
                    ${item.flight?`<span>${escapeHTML(item.flight)}</span>`:""}
                    ${item.terminal?`<span>ターミナル ${escapeHTML(item.terminal)}</span>`:""}
                    ${item.seat?`<span>座席 ${escapeHTML(item.seat)}</span>`:""}
                </div>

                <div class="travel-point">
                    <strong>${escapeHTML(to)}</strong>
                    <span>到着</span>
                </div>

                ${item.memo?`<p class="timeline-home-memo">${escapeHTML(item.memo)}</p>`:""}
            </div>
        </div>
    `;
}

function createTimingIcon(timing){
    if(timing==="morning"){
        return`
            <span class="timing-icon sun">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="4.2"></circle>
                    <path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"></path>
                </svg>
            </span>
        `;
    }

    return`
        <span class="timing-icon moon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15.8 2.8a9.5 9.5 0 1 0 5.4 17.4A9.7 9.7 0 0 1 15.8 2.8Z"></path>
            </svg>
        </span>
    `;
}

function createTrashIcon(){
    return`
        <span class="trash-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.5 7.5h15"></path>
                <path d="M9 7.5V5.8c0-.7.5-1.3 1.3-1.3h3.4c.8 0 1.3.6 1.3 1.3v1.7"></path>
                <path d="M7 7.5l.8 12.1c.1.8.7 1.4 1.5 1.4h5.4c.8 0 1.4-.6 1.5-1.4L17 7.5"></path>
                <path d="M10 11v6.5M14 11v6.5"></path>
            </svg>
        </span>
    `;
}

function showItemsPage(filter="all"){
    if(
        typeof getItems!=="function"||
        typeof addItem!=="function"||
        typeof toggleItem!=="function"||
        typeof deleteItem!=="function"||
        typeof setItemTiming!=="function"
    ){
        page.innerHTML=`
            <div class="page-header"><h2>持ち物</h2></div>
            <div class="home-card">
                <h3>読み込みエラー</h3>
                <p>持ち物機能を読み込めませんでした。</p>
            </div>
        `;
        return;
    }

    const items=getItems();
    const checkedCount=items.filter(item=>item.checked).length;

    let filteredItems=items;

    if(filter==="unchecked")filteredItems=items.filter(item=>!item.checked);
    if(filter==="checked")filteredItems=items.filter(item=>item.checked);

    const sortItems=items=>[...items].sort((a,b)=>Number(Boolean(a.checked))-Number(Boolean(b.checked)));

    const nightItems=sortItems(filteredItems.filter(item=>item.timing!=="morning"));
    const morningItems=sortItems(filteredItems.filter(item=>item.timing==="morning"));

    page.innerHTML=`
        <div class="page-header"><h2>持ち物</h2></div>

        <div class="form-section">
            <div class="section-title-row">
                <div>
                    <h3>持ち物チェック</h3>
                    <p>${checkedCount} / ${items.length} 個チェック済み</p>
                </div>
            </div>

            <div class="item-add-form">
                <input type="text" id="item-name-input" placeholder="持ち物を入力" autocomplete="off">

                <div class="item-add-actions">
                    <button type="button" class="item-timing-add-button night" id="add-night-item-button" aria-label="夜に追加">
                        ${createTimingIcon("night")}
                    </button>

                    <button type="button" class="item-timing-add-button morning" id="add-morning-item-button" aria-label="朝に追加">
                        ${createTimingIcon("morning")}
                    </button>
                </div>
            </div>

            ${items.length>0?`
                <div class="item-bulk-actions">
                    <button type="button" class="item-bulk-button" id="uncheck-all-button">全部チェック解除</button>
                    <button type="button" class="item-bulk-button" id="check-all-button">全部チェック済みにする</button>
                </div>
            `:""}

            <div class="item-filter-buttons">
                <button type="button" class="item-filter-button ${filter==="all"?"active":""}" data-filter="all">すべて</button>
                <button type="button" class="item-filter-button ${filter==="unchecked"?"active":""}" data-filter="unchecked">未チェック</button>
                <button type="button" class="item-filter-button ${filter==="checked"?"active":""}" data-filter="checked">チェック済み</button>
            </div>

            ${createItemsTimingGroup("night",nightItems)}
            ${createItemsTimingGroup("morning",morningItems)}
        </div>
    `;

    const input=document.getElementById("item-name-input");
    const nightButton=document.getElementById("add-night-item-button");
    const morningButton=document.getElementById("add-morning-item-button");

    const resetAddButtonState=()=>{
        nightButton.classList.remove("selected");
        morningButton.classList.remove("selected");
    };

    nightButton.onclick=()=>{
        nightButton.classList.add("selected");
        morningButton.classList.remove("selected");

        const success=addItem(input.value,"night");

        if(!success){
            setTimeout(()=>nightButton.classList.remove("selected"),180);
            input.focus();
            return;
        }

        input.value="";
        showItemsPage(filter);
    };

    morningButton.onclick=()=>{
        morningButton.classList.add("selected");
        nightButton.classList.remove("selected");

        const success=addItem(input.value,"morning");

        if(!success){
            setTimeout(()=>morningButton.classList.remove("selected"),180);
            input.focus();
            return;
        }

        input.value="";
        showItemsPage(filter);
    };

    input.onkeydown=event=>{
        if(event.key==="Enter")event.preventDefault();
    };

    input.addEventListener("input",resetAddButtonState);

    document.querySelectorAll(".item-filter-button").forEach(button=>{
        button.onclick=()=>showItemsPage(button.dataset.filter);
    });

    const uncheckAllButton=document.getElementById("uncheck-all-button");
    const checkAllButton=document.getElementById("check-all-button");

    if(uncheckAllButton){
        uncheckAllButton.onclick=()=>{
            const targets=getItems().filter(item=>item.checked);
            targets.forEach(item=>toggleItem(item.id));
            showItemsPage(filter);
        };
    }

    if(checkAllButton){
        checkAllButton.onclick=()=>{
            const targets=getItems().filter(item=>!item.checked);
            targets.forEach(item=>toggleItem(item.id));
            showItemsPage(filter);
        };
    }

    document.querySelectorAll(".item-check").forEach(checkbox=>{
        checkbox.onchange=()=>{
            toggleItem(checkbox.dataset.id);
            showItemsPage(filter);
        };
    });

    document.querySelectorAll(".item-timing-move-button").forEach(button=>{
        button.onclick=event=>{
            event.preventDefault();
            event.stopPropagation();

            const success=setItemTiming(button.dataset.id,button.dataset.timing);

            if(success)showItemsPage(filter);
        };
    });

    document.querySelectorAll(".item-delete-button").forEach(button=>{
        button.onclick=event=>{
            event.preventDefault();
            event.stopPropagation();

            const item=items.find(currentItem=>currentItem.id===button.dataset.id);

            if(!item)return;

            showDeleteConfirm(item.name,()=>{
                deleteItem(button.dataset.id);
                showItemsPage(filter);
            });
        };
    });
}

function createItemsTimingGroup(timing,items){
    const isMorning=timing==="morning";
    const label=isMorning?"朝に入れるもの":"夜に入れるもの";

    return`
        <div class="item-timing-section" data-timing-section="${timing}">
            <div class="item-timing-header">
                <div class="item-timing-label">
                    ${createTimingIcon(timing)}
                    <h3>${label}</h3>
                    <span class="item-timing-count">${items.length}個</span>
                </div>
            </div>

            <div class="item-timing-list">
                ${items.length>0?items.map(createItemHTML).join(""):`
                    <div class="item-timing-empty">まだありません</div>
                `}
            </div>
        </div>
    `;
}

function createItemHTML(item){
    const isMorning=item.timing==="morning";
    const moveTiming=isMorning?"night":"morning";
    const moveLabel=isMorning?"夜に入れる":"朝に入れる";

    return`
        <div class="item-list-row ${item.checked?"item-list-row-checked":""}" data-id="${escapeHTML(item.id)}">
            <label class="item-check-label">
                <input type="checkbox" class="item-check" data-id="${escapeHTML(item.id)}" ${item.checked?"checked":""}>
                <span class="${item.checked?"item-name item-checked":"item-name"}">${escapeHTML(item.name)}</span>
            </label>

            <div class="item-row-actions">
                <button type="button" class="item-timing-move-button ${moveTiming}" data-id="${escapeHTML(item.id)}" data-timing="${moveTiming}" aria-label="${moveLabel}" title="${moveLabel}">
                    ${createTimingIcon(moveTiming)}
                </button>

                <button type="button" class="item-delete-button" data-id="${escapeHTML(item.id)}" aria-label="削除" title="削除">
                    ${createTrashIcon()}
                </button>
            </div>
        </div>
    `;
}

function showDeleteConfirm(itemName,onConfirm){
    const existing=document.querySelector(".delete-confirm-overlay");

    if(existing)existing.remove();

    const overlay=document.createElement("div");

    overlay.className="delete-confirm-overlay";

    overlay.innerHTML=`
        <div class="delete-confirm-dialog" role="dialog" aria-modal="true">
            <h3>持ち物を削除しますか？</h3>
            <p>「${escapeHTML(itemName)}」を削除します。</p>
            <p class="delete-confirm-warning">この操作は元に戻せません。</p>

            <div class="delete-confirm-actions">
                <button type="button" class="secondary-button delete-cancel-button">キャンセル</button>
                <button type="button" class="primary-button delete-confirm-button">削除する</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const cancelButton=overlay.querySelector(".delete-cancel-button");
    const confirmButton=overlay.querySelector(".delete-confirm-button");

    const close=()=>{
        overlay.remove();
        document.body.style.overflow="";
    };

    cancelButton.onclick=close;

    confirmButton.onclick=()=>{
        close();
        onConfirm();
    };

    overlay.onclick=event=>{
        if(event.target===overlay)close();
    };

    document.body.style.overflow="hidden";
}

function showEventSaveConfirm(eventData,editId,onConfirm){
    const existing=document.querySelector(".delete-confirm-overlay");

    if(existing)existing.remove();

    const overlay=document.createElement("div");

    overlay.className="delete-confirm-overlay";

    const eventName=eventData.name||"イベント名未入力";

    overlay.innerHTML=`
        <div class="delete-confirm-dialog" role="dialog" aria-modal="true">
            <h3>${editId?"予定を変更しますか？":"予定を登録しますか？"}</h3>
            <p>「${escapeHTML(eventName)}」を${editId?"変更":"登録"}します。</p>

            <div class="delete-confirm-actions">
                <button type="button" class="secondary-button delete-cancel-button">キャンセル</button>
                <button type="button" class="primary-button delete-confirm-button">${editId?"変更する":"登録する"}</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const cancelButton=overlay.querySelector(".delete-cancel-button");
    const confirmButton=overlay.querySelector(".delete-confirm-button");

    const close=()=>{
        overlay.remove();
        document.body.style.overflow="";
    };

    cancelButton.onclick=close;

    confirmButton.onclick=()=>{
        close();
        onConfirm();
    };

    overlay.onclick=event=>{
        if(event.target===overlay)close();
    };

    document.body.style.overflow="hidden";
}

function showEventDeleteConfirm(eventName,onConfirm){
    const existing=document.querySelector(".delete-confirm-overlay");

    if(existing)existing.remove();

    const overlay=document.createElement("div");

    overlay.className="delete-confirm-overlay";

    overlay.innerHTML=`
        <div class="delete-confirm-dialog" role="dialog" aria-modal="true">
            <h3>予定を削除しますか？</h3>
            <p>「${escapeHTML(eventName)}」を削除します。</p>
            <p class="delete-confirm-warning">この操作は元に戻せません。</p>

            <div class="delete-confirm-actions">
                <button type="button" class="secondary-button delete-cancel-button">キャンセル</button>
                <button type="button" class="primary-button delete-confirm-button">削除する</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const cancelButton=overlay.querySelector(".delete-cancel-button");
    const confirmButton=overlay.querySelector(".delete-confirm-button");

    const close=()=>{
        overlay.remove();
        document.body.style.overflow="";
    };

    cancelButton.onclick=close;

    confirmButton.onclick=()=>{
        close();
        onConfirm();
    };

    overlay.onclick=event=>{
        if(event.target===overlay)close();
    };

    document.body.style.overflow="hidden";
}

function formatDate(dateString){
    if(!dateString)return "日付未設定";

    const date=new Date(`${dateString}T00:00:00`);

    if(Number.isNaN(date.getTime()))return dateString;

    return date.toLocaleDateString("ja-JP",{
        year:"numeric",
        month:"long",
        day:"numeric",
        weekday:"short"
    });
}

function escapeHTML(value){
    if(!value)return "";

    return String(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}
