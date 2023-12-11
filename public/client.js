const socket = io();
let name;
let textarea = document.querySelector('#textarea');
let messageArea = document.querySelector('.message__area');

do {
    name = prompt('Please enter your name: ');
} while (!name);

textarea.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        sendMessage(e.target.value);
    }
});

// Emit a 'join' event to notify the server that the user has joined the chat
socket.emit('join', name);

// Listen for the 'users' event to receive and log the list of connected users
socket.on('users', (users) => {
    console.log('Connected users:', users);
});

// Notify the server when the user leaves the chat
window.addEventListener('beforeunload', () => {
    socket.emit('leave', name);
});

// Function to send a chat message
function sendMessage(message) {
    let msg = {
        user: name,
        message: message.trim()
    };
    // Append the outgoing message
    appendMessage(msg, 'outgoing');
    textarea.value = '';
    scrollToBottom();
    // Send the message to the server
    socket.emit('message', msg);
}

// Function to append a message to the chat area
function appendMessage(msg, type) {
    let mainDiv = document.createElement('div');
    let className = type;
    mainDiv.classList.add(className, 'message');
    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
    `;
    mainDiv.innerHTML = markup;
    messageArea.appendChild(mainDiv);
    scrollToBottom();
}

// Receive and display messages
socket.on('message', (msg) => {
    if (msg.user === 'System') {
        // Handle system messages differently, e.g., display them in a different style
        appendSystemMessage(msg.message);
    } else {
        // Handle regular chat messages
        appendMessage(msg, 'incoming');
    }
});

// Function to append system messages to the chat area
function appendSystemMessage(message) {
    let systemMessage = document.createElement('div');
    systemMessage.classList.add('system-message', 'message');
    systemMessage.innerText = message;
    messageArea.appendChild(systemMessage);
    scrollToBottom();
}

// Function to scroll the chat area to the bottom
function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}
