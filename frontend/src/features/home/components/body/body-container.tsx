import { useBody } from "../../hooks/use-body";
import { Body } from "./body";

export const BodyContainer = () => {

    const props = useBody();

    return (
        <Body
            {...props}
        />
    );
};