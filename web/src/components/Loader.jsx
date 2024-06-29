import React from 'react';
import classNames from 'classnames';

function Loader({divResult, msgLoader}) {

    return (
        <div className={classNames('Loader', divResult)}>
            <div className='borderGif'>
                <img src="/media/horse.gif" alt="description of gif" />
            </div>
            <p>{msgLoader}</p>
        </div>
    );
}

export default Loader;