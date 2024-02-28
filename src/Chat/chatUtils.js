import { BACKEND, FRONTEND } from "../Public/global.js";
import { routes } from "../route.js";
import { chatSocket } from "../app.js";

export function initChatSocket() {
    chatSocket.onopen = function (e) {
        chatSocket.send(JSON.stringify({
            'token' : localStorage.getItem("token"),
        }));
    };

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        const chatFrame = document.querySelector(".chat__body--frame");
        if (data.from == `${localStorage.getItem("token")}_test_id`)
            chatFrame.innerHTML += routes["/chat"].chatBoxTemplate("message_me", data.message, data.time);
        else
            chatFrame.innerHTML += routes["/chat"].chatBoxTemplate("message_you", data.message, data.time);
    };

    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };
}

function handleInvite() {
    const targetToken = document.querySelector(".chat__header--name").innerHTML;
    const roomAddress = `${FRONTEND}/game/${crypto.randomUUID()}`;

    chatSocket.send(JSON.stringify({
        'target_nickname' : `${targetToken}_test_id`,
        'message': `${localStorage.getItem("token")}_test_id invited you to a game!\n
        ${roomAddress}`
    }));
    // 추후 식별 가능 문자열로 바꿔서 이 메시지 받으면 게임 참여하기 버튼으로 바뀌게 하기 !
    window.location.href(roomAddress);
}

function handleBlockToggle() {
    const targetToken = document.querySelector(".chat__header--name").innerHTML;
    const blockToggleBtn = document.querySelectorAll(".chat__header--btn")[1];
    const blockIcon = `<i class="bi bi-person-slash"></i>`;
    
    let methodSelected;

    if (blockToggleBtn.classList.contains("block")) {
        blockToggleBtn.classList.replace("block", "unblock");
        blockToggleBtn.innerHTML = `${blockIcon} Unblock`;
        methodSelected = 'POST';
        chatSocket.send(JSON.stringify({
            'target_nickname' : `${targetToken}_test_id`,
            'message': `${targetToken}_test_id is now blocked by ${localStorage.getItem("token")}_test_id ❤️`
        }));
    }
    else {
        blockToggleBtn.innerHTML = `${blockIcon} Block`;
        methodSelected = 'DELETE';
    }

    const data = {
      method: methodSelected,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        'target_nickname' : `${targetToken}_test_id`,
      })
    };
    
    fetch(`${BACKEND}/blockedusers/`, data); // 예외처리 필요
}

function showChatroom(tokenInput) {
    const chatModal = document.querySelector(".chat__modal");
    chatModal.style.display = "block";

    const blockIcon = `<i class="bi bi-person-slash"></i>`;

    // 이미 차단된 사람인지 체크 => 내부 창 block 버튼 unblock으로 바꾸기 위해
    fetch(`${BACKEND}/blockedusers/?target_nickname=${tokenInput}_test_id`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
    })
    .then(response => {
        if (!response.ok)
        throw new Error(`Error : ${response.status}`);
    return  response.json();
    })
    .then(data => {
        if (data.is_blocked === true) {
            const blockToggleBtn = document.querySelectorAll(".chat__header--btn")[1];
            blockToggleBtn.innerHTML = `${blockIcon} Unblock`;
            blockToggleBtn.classList.replace("block", "unblock");
        }
    });

    chatSocket.send(JSON.stringify({
        'target_nickname' : `${tokenInput}_test_id`,
        'message': `${localStorage.getItem("token")} has successfully connected to ${tokenInput}`
    }));

    chatModal.innerHTML += routes["/chat"].modalTemplate();
    document.querySelector(".chat__header--name").innerHTML = tokenInput;

    document.querySelector(".chat__header--close").onclick = function() {
		chatModal.style.display = "none";
        chatModal.innerHTML -= document.querySelector(".chat__container");
	}

    handleChatRoom();
}

function checkChatroomSearch(event) {
    const chatSearchInput = document.querySelector(".chat__search input");
    const chatroomList = document.querySelector(".chat__room--list");
    const nameAll = document.querySelectorAll(".chat__room--name");
    const chatRoomAll = document.querySelectorAll(".chat__room");
    // 추후 all 항목들 html에서 가져오지 말고 data source에서 가져오기

    if (chatSearchInput.value) {
        for (let i = 0; i < nameAll.length; i++) {
            if (nameAll[i].innerHTML === chatSearchInput.value) {
                chatroomList.innerHTML = `<div class="chat__room" role="button">
                ${chatRoomAll[i].innerHTML}
                </div>`;
            }
        }
        // chatroomList.innerHTML = `<div class="chat__search--error">
        // Nothing found for ${chatSearchInput.value}</div>`
    }
    else {
        // data source에서 전체 정보 가져와서 다시 띄우기
    }
}

export function handleChatModal() {
    const chatSearchBtn = document.querySelector(".chat__search");
    chatSearchBtn.onsubmit = function (e) {
        e.preventDefault();
    }
    chatSearchBtn.oninput = checkChatroomSearch;

    const openModalBtn = document.querySelectorAll(".chat__room");
    for (let i = 0; i < openModalBtn.length; i++) {
        openModalBtn[i].onclick = function() {
            showChatroom(openModalBtn[i].querySelector(".chat__room--name").innerText);
        }
    }
}

function handleChatRoom() {
    const chatHeaderBtns = document.querySelectorAll(".chat__header--btn");
    chatHeaderBtns[0].onclick = handleInvite;
    chatHeaderBtns[1].onclick = handleBlockToggle;

    document.querySelector('.chat__controller--text').focus();
    document.querySelector('.chat__body--text').onkeydown = function(e) {
        if (e.keyCode === 13) {  // enter, return
            document.querySelector('.chat__controller--btn').click();
        }
    };

    document.querySelector('.chat__send--btn').onclick = function(e) {
        const messageInputDom = document.querySelector('.chat__body--text');
        const targetToken = document.querySelector('.chat__header--name').innerHTML;
        const message = messageInputDom.value;
        const obj = {
            'target_nickname' : `${targetToken}_test_id`,
            'message': message
        };
        chatSocket.send(JSON.stringify(obj));
        messageInputDom.value = '';
    };
}