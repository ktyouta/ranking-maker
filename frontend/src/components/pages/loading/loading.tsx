import { Spinner } from '../..';

export function Loading() {
    return (
        <div className="flex w-screen h-screen items-center justify-center">
            <Spinner size={48} />
        </div>
    );
}
