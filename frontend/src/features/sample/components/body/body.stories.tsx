import type { Meta, StoryObj } from '@storybook/react'
import { Body } from './body'

const meta: Meta<typeof Body> = {
    title: 'features/sample/body',
    component: Body,
}

export default meta
type Story = StoryObj<typeof Body>

export const Default: Story = {
    args: {
        count: 0,
        click: () => {},
    },
}
