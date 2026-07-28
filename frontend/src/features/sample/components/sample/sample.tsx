import { ReactNode } from 'react';

type Props = {
    children: ReactNode
}

export const Sample = (props: Props) => {

    return (
        <div>
            {props.children}
        </div>
    )
};