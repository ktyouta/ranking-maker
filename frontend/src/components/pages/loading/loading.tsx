import { cn } from '@/utils/cn';
import { Spinner } from '../..';

type PropsType = {
    className?: string;
}

export function Loading(props: PropsType) {
    return (
        <div className={cn("flex w-screen h-screen items-center justify-center", props.className)}>
            <Spinner size={48} />
        </div>
    );
}
