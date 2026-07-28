type Props = {
    message: string,
}

export const Footer = (props: Props) => {

    return (
        <p className="text-[#888]">
            Click on the Vite and React logos to learn more {props.message}
        </p>
    )
};