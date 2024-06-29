export default function ListPlayer ({effectifPlayer, numberPlayer, bets, cardsData}) {
    return (
        <div className='listBet'>
          <h2 className='titleBet'>LISTE DES PARIS</h2>
          <div className='pari'>
            <table>
              <caption>Nombre des joueurs: {effectifPlayer}/{numberPlayer}</caption>
              <tbody>
              {bets.map((bet, index) => {
                // Recherche de l'objet correspondant à l'horse dans cardsData
                const horseData = cardsData.find(card => card.type === bet.horse);
                // Si l'objet est trouvé, utiliser sa couleur, sinon utiliser une couleur par défaut
                const backgroundColor = horseData ? horseData.color : 'black';
                
                return (
                  <tr key={index}>
                    <th scope='row'>{bet.pseudo}</th>
                    <td>{bet.bet + ' gorgées'}</td>
                    <td className='tdHorse'><p className="pHorse" style={
                      bet.horse === "Jean-Jacques" ? 
                      {width:'94px', backgroundColor: backgroundColor} : 
                      {width:"80px", backgroundColor: backgroundColor}
                    }>
                      {bet.horse}
                    </p></td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
    )
}