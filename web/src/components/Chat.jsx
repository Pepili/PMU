import React, { useEffect, useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useSnackbar } from "notistack";
const idUser = sessionStorage.getItem('id');
const token = sessionStorage.getItem('token');
const idRound = sessionStorage.getItem("idRound");

const Chat = ({ socket }) => {
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState(0);
  const [allMessages, setAllMessages] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const roomFetch = async () => {
    try {
      const roomParty = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/round/${idRound}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const roomResponse = await roomParty.json();
      setRoom(roomResponse.roomId);

      const allMessagesFetch = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/room/messages/${roomResponse.roomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const allMessagesResponse = await allMessagesFetch.json();
      setAllMessages(allMessagesResponse.messages);
    } catch (error) {
      console.error('Error fetching room or messages:', error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('chat message', (msg) => {
        if (msg.user_id !== Number(idUser)) {
          setAllMessages((prevMessages) => {
            if (Array.isArray(prevMessages)) {
              return [...prevMessages, msg];
            } else {
              return [msg];
            }
          });
        }
      });
  
      return () => {
        socket.off('chat message');
      };
    }
  }, [socket]);

  useEffect(() => {
    const chatWindow = document.querySelector('.windowChat');
    const lastMessage = chatWindow?.lastElementChild;
    if (lastMessage) {
      lastMessage.scrollIntoView();
    }
  }, [allMessages]);

  const handleSendMessage = async () => {
    if (message) {
      try {
        const messageFetch = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            content: message,
            roomId: room,
            userId: Number(idUser)
          })
        });
        const messageResponse = await messageFetch.json();
        if(messageResponse.errorCode) {
          switch (messageResponse.errorCode) {
              case 4000:
                console.log("probleme format message et/ou id");
                  break;
              case 4001:
                console.log('Problème serveur...');
                break;
              default:
                  enqueueSnackbar("Une erreur inconnue est survenue", {
                  variant: "error",
                  });
              };
          return;
          };

        const now = new Date();
        const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
        const newMessage = {
          message_id: messageResponse.messageId,
          content: message,
          sending_date: formattedDate,
          room_id: room,
          user_id: Number(idUser),
        };

        socket.emit('chat message', {roomId: room, data: newMessage});
        setAllMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  useEffect(() => {
    roomFetch();
  }, []);

  return (
    <div className='componentChat'>
      <div className='divChat'>
        <h2>CHAT</h2>
        <div className='allChat'>
          <div className='windowChat'>
            {Array.isArray(allMessages) && allMessages.map((msg, index) => (
              <div 
                key={index}
                className={msg.user_id === Number(idUser) ? 'msgUser' : 'otherMsg'}  
              >
                <div className='imgPseudoChat' style={{backgroundImage: "url(/media/image4.png)"}}></div>
                <p>{msg.content}</p>
              </div>
            ))}
          </div>
          <div className='sendMessage'>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Pour éviter un saut de ligne inutile
                  handleSendMessage();
                }
              }}
              placeholder="Ecrire ici..."
              className='inputMessage'
              maxLength={400}
            />
            <button onClick={handleSendMessage}><FontAwesomeIcon icon={faPaperPlane} /></button>
          </div>
        </div>
      </div>        
    </div>
  );
};

export default Chat;