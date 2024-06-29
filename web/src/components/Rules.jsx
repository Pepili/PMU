import React, { useState, useEffect } from 'react';

function Rules({ showPopup, closePopup }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [gameData, setGameData] = useState(null);

    useEffect(() => {
        const data = [
            {
                "text": "Chaque joueur doit parier jusqu’à 10 gorgées sur un cheval.",
                "gameplayImg": "/media/rules1.png"
            },
            {
                "text": "Une fois tous les paris lancés, le maître de jeu peut annoncer le départ.",
                "gameplayImg": "/media/rules2.png"
            },
            {
                "text": "Le maître de jeu retourne une par une les cartes de la pioche présentent sur le plateau. A chacune d’elle, il fait avancer d’un niveau le cheval correspondant à la couleur tirée.",
                "gameplayImg": "/media/rules3.png"
            },
            {
                "text": "Lorsque tous les chevaux ont dépassé un niveau, la carte alignée à celui-ci sera retournée par le maître de jeu. Le cheval ayant la couleur correspondant à la carte retournée reculera d’un niveau.",
                "gameplayImg": "/media/rules4.png"
            },
            {
                "text": "La partie continue ainsi jusqu’à qu’un cheval dépasse la ligne d’arrivée, il sera alors déclaré vainqueur.",
                "gameplayImg": "/media/rules5.png"
            },
            {
                "text": "Les joueurs ayant pariés sur le cheval vainqueur pourront distribuer leur gorgée, quand aux autres, ils devront boire leur pari. ",
                "gameplayImg": "/media/rules6.png"
            }
        ];
        setGameData(data);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide === gameData.length - 1 ? 0 : prevSlide + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide === 0 ? gameData.length - 1 : prevSlide - 1));
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <div className={`rules-popup${showPopup ? '' : ' hidden'}`}>
            {showPopup && gameData && (
                <>
                    <button className="close-btn" onClick={closePopup}>X</button>
                    <div className="carousel">
                        <button className="prev-btn" onClick={prevSlide}>{'<'}</button>
                        <h2 className='titleSlides'>Règles du jeu</h2>
                        <div className="slides-container">
                            {gameData.map((rule, index) => (
                                <div key={index} className={`slide ${currentSlide === index ? 'active' : ''}`}>
                                    {currentSlide === index && (
                                        <>
                                            <img src={rule.gameplayImg} alt={`Slide ${index + 1}`} className='imgRules' />
                                            <p className='textRules'>{rule.text}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                            <div className="indicators-container">
                                {gameData.map((rule, index) => (
                                    <button key={index} onClick={() => goToSlide(index)} className={`indicator ${currentSlide === index ? 'active' : ''}`} />
                                ))}
                            </div>
                        </div>
                        <button className="next-btn" onClick={nextSlide}>{'>'}</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Rules;
