import React, { useState, useEffect, useContext } from 'react';
import { SocketIOContext } from '../components/App';
import Chat from './Chat';
function PopupChat({ showChat, closeChat }) {
    const socket = useContext(SocketIOContext);
    return (
        <div className={`chat-popup${showChat ? '' : ' hidden'}`}>
            {showChat  && (
                <>
                    <button className="close-btn" onClick={closeChat}>X</button>
                    <Chat socket={socket}/>
                </>
            )}
        </div>
    );
}

export default PopupChat;