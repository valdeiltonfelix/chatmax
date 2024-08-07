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
const logoutButton = chat.querySelector(".logout__button");
const menuButton = chat.querySelector(".menu-button");
const sidebar = chat.querySelector(".chat__sidebar");
const userList = chat.querySelector(".user__list");


const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]
window.onload = null;

        const loadChatState = () => {
            const savedChatState = localStorage.getItem('chatState');
            return savedChatState ? JSON.parse(savedChatState) : [];
        };

        const saveUserState = (user) => {
            localStorage.setItem('userState', JSON.stringify(user));
        };

        const loadUserState = () => {
            const savedUserState = localStorage.getItem('userState');
            return savedUserState ? JSON.parse(savedUserState) : null;
        };
        
        const clearUserState = () => {
            localStorage.removeItem('userState');
            localStorage.removeItem('chatState');
        };

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
     
            const messageData = JSON.parse(data);
            if (messageData.type === 'chat') {
                dadosUser={
                       userId: messageData.data.id,
                       userName: messageData.data.user,
                       userColor: messageData.data.color,
                       content: messageData.data.content
                     };
                     console.log(dadosUser);

                const { userId, userName, userColor, content } = dadosUser;
                console.log(userId, userName, userColor, content);
                const message = userId === user.id
                    ? createMessageSelfElement(content)
                    : createMessageOtherElement(content, userName, userColor);
                chatMessages.appendChild(message);
                scrollScreen();
            } else if (messageData.type == 'user_list') {
                updateUserList(messageData.users); 
            } else if(messageData.type=="logout"){
                 logautUsers(messageData);
                 clearUserState();
                 // websocket.close();
            }
        };

        const updateUserList = (users) => {
     
            const div = document.querySelector(".user__list");
            div.innerHTML="";
            users.forEach(function(data){
                if(data.data!=undefined){
                     const li = document.createElement('li');
                     li.textContent = data.data.user;
                     li.id=data.data.id;
                     li.style.color = data.data.color;
                     userList.appendChild(li);
                }
            })    
        };


         const logautUsers = (users) => {
     
            const div = document.querySelector(".user__list");
            div.innerHTML="";
            console.log(users);
            users.data.forEach(function(data){
                if(data.data!=undefined){
                     const li = document.createElement('li');
                     li.textContent = data.data.user;
                     li.id=data.data.id;
                     li.style.color = data.data.color;
                     userList.appendChild(li);
                }else{
                      console.log("-->");
                     const li = document.createElement('li');
                     li.textContent = data.user;
                     li.id=data.id;
                     li.style.color = data.color;
                     userList.appendChild(li);

                }
            })      
          
  };

// const processMessage = ({ data }) => {
//     const { userId, userName, userColor, content } = JSON.parse(data)

//     const message =
//         userId == user.id
//             ? createMessageSelfElement(content)
//             : createMessageOtherElement(content, userName, userColor)

//     chatMessages.appendChild(message)

//     scrollScreen()
// }

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
    user.color = getRandomColor()
    user.id = Math.random()

     $.ajax({
        method: "POST",
        url: "http://142.93.146.197:4041/login",
        data: { login: username, password: password,idsessao:user.id,color:user.color }
      }).done(function(){

        
        user.name = loginInput.value
        
        login.style.display = "none"
        chat.style.display = "flex"
        saveUserState(user);
         websocket = new WebSocket("ws://142.93.146.197:8085")
         websocket.onopen = function() {
            // Enviar dados do usuário para o servidor
            websocket.send(JSON.stringify({
                type: 'add_users',
                data: {
                    user: user.name,
                    id: user.id,
                    color: user.color
                }
            }));
        };

        websocket.onmessage = processMessage
      

  
      }).fail(function(respon){
            Swal.fire({

                icon: "error",
                title: "Oops...",
                text:respon.responseJSON.data.msg,
              }); 
          
        })


 
}

// window.addEventListener('load', () => {
//             const savedUser = loadUserState();
//             if (savedUser) {
//                 const  user = savedUser;
//                 login.style.display = "none";
//                 chat.style.display = "flex";
//                 websocket = new WebSocket("ws://localhost:8085");
//                 websocket.onmessage = processMessage;
//                 websocket.onopen = () => {
//                     websocket.send(JSON.stringify({ type: 'login', user }));
//                 };
//                 //initializeChat();
//              }
// });


const sendMessage = (event) => {
            event.preventDefault();
            const message = {
                type: 'chat',
                data:{id:      user.id,
                      user:    user.name,
                      color:   user.color,
                      content: chatInput.value
                }
            };
            websocket.send(JSON.stringify(message));
            chatInput.value = "";
        };

loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)



     const handleLogout = () => {
        
    
            swal.fire({
                text: "Deseja sair do chat !",
                icon: 'warning',
                // type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim',
                cancelButtonText:"Cancelar",
              }).then(function(confirm) {
                
                if(confirm.isConfirmed){
                    swal.fire(
                        'Logaut!',
                        'Logaut com sucesso do chat',
                        'success'
                      );
                      
                      //clearUserState();
                      chat.style.display = "none";
                      login.style.display = "block";

                      websocket.send(
                          JSON.stringify({
                            type: 'logout',
                            data: {
                                user: user.name,
                                id: user.id,
                                color: user.color
                            }
                         })

                        );
                      websocket.onmessage = processMessage
                      websocket.close();
                }
               

              });
}

    logoutButton.addEventListener("click", handleLogout);

      // Toggle sidebar visibility
        menuButton.addEventListener('click', () => {
            sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
        });


const form = document.getElementById('bbb');
  form.addEventListener('load', (event) => {
    event.preventDefault();
    // Enviar os dados do formulário via AJAX
    // ...
  });