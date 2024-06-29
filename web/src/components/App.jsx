import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import io from 'socket.io-client';

//Components
import Header from './Header';
import LightHeader from './LightHeader';
import Footer from './Footer';
import LightFooter from "./LightFooter";
//Pages
import Welcome from '../pages/Welcome';
import ResetPassword from '../pages/ResetPassword';
import Menu from '../pages/Menu';
import CreationParty from '../pages/CreationParty';
import JoinParty from '../pages/JoinParty';
import Room from '../pages/Room';
import Party from '../pages/Party';
import Results from '../pages/Results';

// Création du contexte SocketIOContext
export const SocketIOContext = createContext();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const id = sessionStorage.getItem("id");
    const token = sessionStorage.getItem("token");
    if (id && token) {
      setIsLoggedIn(true);
    }

    if(!socket) {
      const newSocket = io(process.env.REACT_APP_PMU_API_URL, {
        // Envoyer l'ID de l'utilisateur et le token d'authentification lors de la connexion au socket
        query: {
          Authorization: `Bearer ${token}`,
          userId: id
        },
        reconnectionAttempts: 3,
        transports: ['websocket']
      });
  
      newSocket.on('connect_error', (err) => {
        console.error('Connection error:', err);
      });
  
      setSocket(newSocket);
    }    
    
    // Fermez la connexion lorsque le composant est démonté
    return () => socket.close();
  }, []);
  
  const handleLogin = (id, token) => {
    sessionStorage.setItem('id', id);
    sessionStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <SocketIOContext.Provider value={socket}>
      <Router>
        <div className='app'>
          <Routes>
            <Route path="/" element={<><LightHeader/><Welcome onLogin={handleLogin}/><LightFooter/></>}/>
            <Route path="/reset-password" element={<><LightHeader/><ResetPassword/><LightFooter/></>}/>
            <Route path="/menu" element={<><Header/><Menu/><Footer isLoggedIn={isLoggedIn} onLogout={handleLogout} /></>}/>
            <Route path="/creation" element={<><Header/><CreationParty/><Footer isLoggedIn={isLoggedIn} onLogout={handleLogout} /></>}/>
            <Route path="/join" element={<><LightHeader/><JoinParty/><Footer isLoggedIn={isLoggedIn} onLogout={handleLogout} /></>}/>
            <Route path="/room/:roomId" element={<><Header/><Room/><Footer isLoggedIn={isLoggedIn} onLogout={handleLogout} /></>}/>
            <Route path="/party" element={<><Header/><Party/><Footer isLoggedIn={isLoggedIn} onLogout={handleLogout} /></>}/>
            <Route path="/results" element={<><Header/><Results/><Footer isLoggedIn={isLoggedIn} onLogout={handleLogout} /></>}/>
          </Routes>
        </div>
      </Router>
    </SocketIOContext.Provider>
  );
}

export default App;
