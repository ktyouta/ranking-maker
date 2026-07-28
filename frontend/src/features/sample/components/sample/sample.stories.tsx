import type { Meta, StoryObj } from '@storybook/react'
import { Body } from '../body/body'
import { Sample } from './sample'

const meta: Meta<typeof Sample> = {
    title: 'features/sample/sample',
    component: Sample,
}

export default meta
type Story = StoryObj<typeof Sample>

export const Default: Story = {
    render: () => {
        return (
            <Sample>
                <Body
                    count={0}
                    click={() => {}}
                />
            </Sample>
        )
    },
}

export const Custom: Story = {
    render: () => {
        return (
            <Sample>
                <div>
                    message
                </div>
            </Sample>
        )
    },
}
