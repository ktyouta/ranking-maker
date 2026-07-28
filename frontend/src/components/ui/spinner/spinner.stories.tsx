import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
    title: 'components/ui/spinner',
    component: Spinner,
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'number',
            description: 'スピナーのサイズ（px）',
        },
    },
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
    args: {},
};

export const Small: Story = {
    args: {
        size: 16,
    },
};

export const Large: Story = {
    args: {
        size: 48,
    },
};

export const Custom: Story = {
    args: {
        size: 64,
    },
};
