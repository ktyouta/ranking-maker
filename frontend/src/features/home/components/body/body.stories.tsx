import type { Meta, StoryObj } from '@storybook/react'
import { Body } from './body'

const meta: Meta<typeof Body> = {
    title: 'features/home/body',
    component: Body,
}

export default meta
type Story = StoryObj<typeof Body>

export const Default: Story = {
    args: {
        count: 0,
        click: () => {},
        healthStatus: 'healthy',
        healthTimestamp: '2025-01-01T00:00:00.000Z',
        isHealthLoading: false,
        isHealthError: false,
        refetchHealth: () => {},
    },
}

export const Loading: Story = {
    args: {
        count: 0,
        click: () => {},
        healthStatus: null,
        healthTimestamp: null,
        isHealthLoading: true,
        isHealthError: false,
        refetchHealth: () => {},
    },
}

export const Error: Story = {
    args: {
        count: 0,
        click: () => {},
        healthStatus: null,
        healthTimestamp: null,
        isHealthLoading: false,
        isHealthError: true,
        refetchHealth: () => {},
    },
}
