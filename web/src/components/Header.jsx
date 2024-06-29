import React, {useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { faMessage } from '@fortawesome/free-regular-svg-icons';
import Rules from './Rules';
import PopupChat from './PopupChat';
import {useMediaQuery} from 'react-responsive';

function Header() {
    /* const imgUser = sessionStorage.getItem('imgUser'); */
    const pseudo = /* sessionStorage.getItem('pseudo') */"Pepili";
    const [showRulesPopup, setShowRulesPopup] = useState(false);
    const [showChatPopup, setShowChatPopup] = useState(false);
    const isSmallScreen = useMediaQuery({ query: '(max-width: 1120px)' });
    const toggleRulesPopup = () => {
        setShowRulesPopup(!showRulesPopup);
    }
    const togglesChatPop = () => {
        setShowChatPopup(!showChatPopup);
    }

    return (
        <header className='header'>
            {isSmallScreen ? (
                <>
                    <button className='chatButton' onClick={togglesChatPop}><FontAwesomeIcon icon={faMessage} /></button>
                    <button className='rulesButton' onClick={toggleRulesPopup}>
                        <FontAwesomeIcon icon={faBook} className='iconRules'/>
                    </button>
                    {showRulesPopup && <Rules showPopup={showRulesPopup} closePopup={() => setShowRulesPopup(false)} />}
                    {showChatPopup && <PopupChat showChat={showChatPopup} closeChat={() => setShowChatPopup(false)} />}
                </>
            ) : (
            <>
                <button className='elementUser'>
                    <img src='/media/profil.png' alt="profil"/>
                    <p>{pseudo}</p>
                </button>
                <img src="/media/logo.png" alt="logo" className='logo'/>
                <button className='rulesButton' onClick={toggleRulesPopup}>
                    <FontAwesomeIcon icon={faBook} className='iconRules'/>
                    <span className='txtButton'>Règles du jeu</span>
                </button>
                {showRulesPopup && <Rules showPopup={showRulesPopup} closePopup={() => setShowRulesPopup(false)} />}
            </>
            )}
        </header>
    );
}

export default Header;