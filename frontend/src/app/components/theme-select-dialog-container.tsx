import { SetThemeContext, ThemeContext } from './theme-provider';
import { ThemeSelectDialog } from './theme-select-dialog';

type PropsType = {
    isOpen: boolean;
    onClose: () => void;
};

export function ThemeSelectDialogContainer(props: PropsType) {

    // テーマ状態
    const theme = ThemeContext.useCtx();
    // テーマ状態(setter)
    const setTheme = SetThemeContext.useCtx();

    return (
        <ThemeSelectDialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            theme={theme}
            onSelect={setTheme}
        />
    );
}
