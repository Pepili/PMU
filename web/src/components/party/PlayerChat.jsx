import Chat from "../Chat";
import ListPlayer from "./ListPlayer";

export default function playerChat ({numberPlayer, effectifPlayer, bets, cardsData, socket, isMulti}) {
    return (
        <div className='playerChat'>
            <ListPlayer
                effectifPlayer={effectifPlayer}
                numberPlayer={numberPlayer}
                bets={bets}
                cardsData={cardsData}
            />
            {isMulti ? <Chat socket={socket}/> : null}
        </div>
    )
}