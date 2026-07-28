import { useState } from 'react';

export function useSwitch() {

    //フラグ
    const [flag, setFlag] = useState(false);

    //フラグオン
    function on() {
        setFlag(true);
    }

    //フラグオフ
    function off() {
        setFlag(false);
    }

    return { flag, on, off }
}