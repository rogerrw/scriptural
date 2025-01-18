import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Combobox } from '@/component-library/combobox';

export default {
  title: 'Components/Combobox',
  component: Combobox,
} as Meta;

const Template: StoryFn<typeof Combobox> = () => <Combobox />;

export const Default = Template.bind({});
