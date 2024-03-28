import {
    showChatList,
    renderChatBox,
    CHATLOG_PREFIX,
    SYSTEM_MESSAGE,
    renderSystemChatAdmin
} from "./chatPageUtils.js";
import {player} from "../app.js";
import {loadChatLog} from "./chatRoomUtils.js";

export function getChatLog(usersData = []) {
    /*
    * usersData : [{
    *   id: <int>,
    *   nickname: <string>,
    *   profile: <string>
    * }]
    * */
    const result = [];

    usersData.forEach(userData => {
        const localStorageLog = localStorage.getItem(CHATLOG_PREFIX + userData.id);
        let chatLog = localStorageLog ? JSON.parse(localStorageLog) : [];

        if (chatLog.length > 0) {
            userData.chatLog = chatLog[chatLog.length - 1];
            result.push(userData);
        }
    });
    return result;
}

export function getOpponent(newMsgObj) {
    let opponent = undefined;
    if (newMsgObj !== undefined || (player.getId() === newMsgObj.from_id || player.getId() === newMsgObj.to_id)) {
        opponent = player.getId() === newMsgObj.from_id? newMsgObj.to_id : newMsgObj.from_id;
    }
    return opponent;
}

export function foundChatContainer(userId, chatApp) {
    let foundContainer = undefined;
    const containers = chatApp.getApp().querySelectorAll('.chat__container');
    containers.forEach(container => {
        if (Number(container.id) === userId) {
            foundContainer = container;
        }
    })
    return foundContainer;
}

export function closedChatLog(userId, chatApp) {
    const localStorageLog = localStorage.getItem(CHATLOG_PREFIX + userId);
    let chatLog = localStorageLog ? JSON.parse(localStorageLog) : [];

    chatLog.forEach(log => {
        if (log.type === 'invite_game') {
            log.closed = true;
        }
    });

    localStorage.setItem(CHATLOG_PREFIX + userId, JSON.stringify((chatLog)));

    const chatContainer = foundChatContainer(userId, chatApp);
    if (chatContainer !== undefined) {
        loadChatLog(chatContainer, userId, chatApp);
    }
}

export function readSystemLog() {
    const localStorageLog = localStorage.getItem(SYSTEM_MESSAGE);
    let chatLog = localStorageLog ? JSON.parse(localStorageLog) : [];

    chatLog.forEach(log => log.isRead = true);

    localStorage.setItem(SYSTEM_MESSAGE, JSON.stringify((chatLog)));
}

export function readChatLog(userId) {
    const localStorageLog = localStorage.getItem(CHATLOG_PREFIX + userId);
    let chatLog = localStorageLog ? JSON.parse(localStorageLog) : [];

    chatLog.forEach(log => log.isRead = true);

    localStorage.setItem(CHATLOG_PREFIX + userId, JSON.stringify((chatLog)));
}

export function saveSystemMsg(newMsgObj) {
    const localStorageLog = localStorage.getItem(SYSTEM_MESSAGE);
    let chatLog = localStorageLog ? JSON.parse(localStorageLog) : [];

    if (chatLog.length > 0) {
        if (newMsgObj.message === 'You have successfully logged') {
            localStorage.setItem(SYSTEM_MESSAGE, JSON.stringify([newMsgObj]));
            return ;
        }
        chatLog.forEach(log => log.isRead = true);
    }
    chatLog.push(newMsgObj);

    localStorage.setItem(SYSTEM_MESSAGE, JSON.stringify(chatLog));
}

export function saveNewMsg(newMsgObj) {
    /*
    * newMsgObj: {
    *   from_id: <int>,
    *   to_id: <int>,
    *   message: <string>,
    *   time: <string>,
    *   isRead: <boolean>
    * }
    * */

    let opponent = getOpponent(newMsgObj);
    if (opponent !== undefined) {
        const localStorageLog = localStorage.getItem(CHATLOG_PREFIX + opponent);
        let chatLog = localStorageLog ? JSON.parse(localStorageLog) : [];

        if (chatLog.length > 0) {
            chatLog.forEach(log => log.isRead = true);
        }
        chatLog.push(newMsgObj);

        localStorage.setItem(CHATLOG_PREFIX + opponent, JSON.stringify(chatLog));
    }
}

export async function processSystemMessage(chatApp, messageData) {
    /*
    * messageData: {
    *   type: "system_message",
    *   to_id: <int>,
    *   message: <string>,
    *   time: <string>
    * }
    * */
    const systemChatContainer = chatApp.getApp().querySelector('.system__chat--container');

    if (systemChatContainer !== null) {
        renderSystemChatAdmin(systemChatContainer, messageData);
    } else {
        // TODO: message alert
        await Notification.requestPermission(function (result) {
            if (result === "denied")
                alert('알림이 차단된 상태입니다. 브라우저 설정에서 알림을 허용해주세요!');
        });

        messageData.isRead = false;
        saveSystemMsg(messageData);
        await showChatList(chatApp);

        // TODO: 알림 기능 체크, 아이콘 등록
        const noti = new Notification(messageData.from, {
            body: messageData.message,
            // icon: `/lib/img/novalogo_copy.png`,
        });
        setTimeout( function() { noti.close(); }, 3000);
    }
}

export async function processMessage(chatApp, messageData) {
    /*
    * messageData: {
    *   type: "chat_message",
    *   from: <string>,
    *   from_id: <int>,
    *   to_id: <int>,
    *   message: <string>,
    *   time: <string>
    * }
    * */
    const chatContainers = chatApp.getApp().querySelectorAll('.chat__container');
    let isRender = false;

    chatContainers.forEach(container => {
        if (player.getId() === messageData.from_id || Number(container.id) === messageData.from_id) {
            // TODO: message render
            renderChatBox(container, messageData, chatApp, true);
            isRender = true;
        }
    });
    if (!isRender) {
        const newToast = document.createElement('div');
        const msgTime = new Date(messageData.time);
        // TODO : fromNickname 수정
        newToast.innerHTML = routes["/chat"].chatAlertTemplate(messageData.from, messageData.message, `${msgTime.getHours()}:${msgTime.getMinutes()>10?msgTime.getMinutes():'0' + msgTime.getMinutes()}`);
        
        app.querySelector(".toast").appendChild(newToast);
        newToast.querySelector(".chat__alert--close-btn").onclick = () => {
            newToast.remove();
        }
        setTimeout( function() { newToast.remove(); }, 3000);

        messageData.isRead = false;
        saveNewMsg(messageData);
        await showChatList(chatApp);
    }
}
