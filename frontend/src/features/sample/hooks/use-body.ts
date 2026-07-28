import { useState } from "react";

export const useBody = () => {

    const [count, setCount] = useState(0);

    const click = () => {
        setCount((prev) => {
            return prev + 1;
        });
    }

    return {
        count,
        click
    }
}