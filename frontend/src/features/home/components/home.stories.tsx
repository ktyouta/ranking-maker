import type { Meta, StoryObj } from '@storybook/react'
import { Home } from './home'

const meta: Meta<typeof Home> = {
    title: 'features/home/home',
    component: Home,
}

export default meta
type Story = StoryObj<typeof Home>

const sampleRankingList = [
    { id: '1', title: '後悔した買い物ランキング', userName: 'たろう', createdAt: '2026/08/01', itemCount: 5 },
    { id: '2', title: '好きなラーメン屋ランキング', userName: 'はなこ', createdAt: '2026/08/10', itemCount: 8 },
    { id: '3', title: '行ってよかった旅行先ランキング', userName: 'じろう', createdAt: '2026/08/15', itemCount: 3 },
]

export const Default: Story = {
    args: {
        rankingList: sampleRankingList,
    },
}

export const Empty: Story = {
    args: {
        rankingList: [],
    },
}
