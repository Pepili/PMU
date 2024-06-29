import React, {useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import Rules from './Rules';
import {useMediaQuery} from 'react-responsive';

function LightHeader() {
    const isSmallScreen = useMediaQuery({ query: '(max-width: 1120px)' });
    const [showRulesPopup, setShowRulesPopup] = useState(false);
    const toggleRulesPopup = () => {
        setShowRulesPopup(!showRulesPopup);
    }
    return (
        <header className='lightHeader'>
             {isSmallScreen ? (
                <>
                    <img src="/media/logo.png" alt="logo" className='light_logo'/>
                    <button className='rulesButton' onClick={toggleRulesPopup}>
                        <FontAwesomeIcon icon={faBook} className='iconRules'/>
                    </button>
                    {showRulesPopup && <Rules showPopup={showRulesPopup} closePopup={() => setShowRulesPopup(false)} />}
                </>
             ) : (
                <>
                    <img src="/media/logo.png" alt="logo" className='light_logo'/>
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

export default LightHeader;