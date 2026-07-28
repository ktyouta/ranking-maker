import React from 'react';
import reactLogo from '../../../../assets/react.svg';
import viteLogo from '/vite.svg';

type Props = {
    message: string,
}

export const Header = (props: Props) => {

    return (
        <React.Fragment>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img
                        src={viteLogo}
                        className="h-[6em] p-[1.5em] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
                        alt="Vite logo"
                    />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img
                        src={reactLogo}
                        className="h-[6em] p-[1.5em] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] motion-safe:animate-[spin_20s_linear_infinite]"
                        alt="React logo"
                    />
                </a>
            </div>
            <h1>Vite + React {props.message}</h1>
        </React.Fragment>
    )
};