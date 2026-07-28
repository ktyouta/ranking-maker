import type { Meta, StoryObj } from '@storybook/react'
import { Footer } from '../footer/footer'
import { Header } from '../header/header'
import { Body } from '../body/body'
import { Home } from './home'

const meta: Meta<typeof Home> = {
    title: 'features/home/home',
    component: Home,
}

export default meta
type Story = StoryObj<typeof Home>


export const Default: Story = {
    render: () => {
        return (
            <Home>
                <Header message="Header message" />
                <Body
                    count={0}
                    click={() => {}}
                    healthStatus="healthy"
                    healthTimestamp="2025-01-01T00:00:00.000Z"
                    isHealthLoading={false}
                    isHealthError={false}
                    refetchHealth={() => {}}
                />
                <Footer message="footer message" />
            </Home>
        )
    },
}

export const Custom: Story = {
    render: () => {
        return (
            <Home>
                <div>
                    message
                </div>
            </Home>
        )
    },
}
