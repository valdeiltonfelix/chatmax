// login elements
const login = document.querySelector(".login")
const loginForm = login.querySelector(".login__form")
const loginPassword = document.querySelector(".login__input--password");
const loginInput = login.querySelector(".login__input")

// chat elements
const chat = document.querySelector(".chat")
const chatForm = chat.querySelector(".chat__form")
const chatInput = chat.querySelector(".chat__input")
const chatMessages = chat.querySelector(".chat__messages")

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]

const user = { id: "", name: "", color: "" }

let websocket

const createMessageSelfElement = (content) => {
    const div = document.createElement("div")

    div.classList.add("message--self")
    div.innerHTML = content

    return div
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div")
    const span = document.createElement("span")

    div.classList.add("message--other")

    span.classList.add("message--sender")
    span.style.color = senderColor

    div.appendChild(span)

    span.innerHTML = sender
    div.innerHTML += content

    return div
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data)

    const message =
        userId == user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor)

    chatMessages.appendChild(message)

    scrollScreen()
}

const handleLogin = (event) => {
   var verifica=false
    event.preventDefault()
 // Verifica se o nome de usuário e a senha estão preenchidos
    if (loginInput.value.trim() === "" || loginPassword.value.trim() === "") {
        alert("Por favor, preencha seu nome de usuário e senha.");
        return;
    }

    // Verifica o nome de usuário e a senha
    const username = loginInput.value.trim();
    const password = loginPassword.value.trim();

     $.ajax({
        method: "POST",
        url: "http://142.93.146.197:3035/login",
        data: { login: username, password: password }
      }).done(function(){

        user.id = Math.random()
        user.name = loginInput.value
        user.color = getRandomColor()
        login.style.display = "none"
        chat.style.display = "flex"
        websocket = new WebSocket("ws://142.93.146.197:8085")
    //ebsocket = new WebSocket ("http://192.168.0.160:8080/APLICACAO") 
        websocket.onmessage = processMessage

      }).fail(function(respon){
            Swal.fire({

                icon: "error",
                title: "Oops...",
                text:respon.responseJSON.data.msg,
              }); 
          
        })

        window.addEventListener('load', () => {
            const savedUser = loadUserState();
            if (savedUser) {
                user = savedUser;
                login.style.display = "none";
                chat.style.display = "flex";
                websocket = new WebSocket("ws://localhost:8080");
                websocket.onmessage = processMessage;
                websocket.onopen = () => {
                    websocket.send(JSON.stringify({ type: 'login', user }));
                };
                initializeChat();
            }
        });

 
}


const sendMessage = (event) => {
    event.preventDefault()

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    }

    websocket.send(JSON.stringify(message))

    chatInput.value = ""
}

loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)
