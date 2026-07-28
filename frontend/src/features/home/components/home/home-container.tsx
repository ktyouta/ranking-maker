import { BodyContainer } from "../body/body-container";
import { FooterContainer } from "../footer/footer-container";
import { HeaderContainer } from "../header/header-container";
import { Home } from "./home";

export const HomeContainer = () => {

    return (
        <Home>
            <HeaderContainer />
            <BodyContainer />
            <FooterContainer />
        </Home>
    );
};