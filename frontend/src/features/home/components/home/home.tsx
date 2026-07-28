import { ReactNode } from 'react';

type Props = {
    children: ReactNode
}

export const Home = (props: Props) => {

    return (
        <div className='flex flex-col w-full h-full items-center justify-center'>
            {props.children}
        </div>
    )
};