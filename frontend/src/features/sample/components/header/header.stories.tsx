import type { Meta, StoryObj } from '@storybook/react'
import { Header } from './header'

const meta: Meta<typeof Header> = {
    title: 'features/sample/header',
    component: Header,
}

export default meta
type Story = StoryObj<typeof Header>


const HeaderWithState = () => {

    return (
        <Header
            message="Header message"
        />
    )
}

export const Default: Story = {
    render: () => <HeaderWithState />,
}
