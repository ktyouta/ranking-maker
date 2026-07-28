import { BodyContainer } from "../body/body-container";
import { FooterContainer } from "../footer/footer-container";
import { HeaderContainer } from "../header/header-container";
import { Sample } from "./sample";

export const SampleContainer = () => {

    return (
        <Sample>
            <HeaderContainer />
            <BodyContainer />
            <FooterContainer />
        </Sample>
    );
};