import type { QuestionnaireDef } from './index';

export const questionlist1: QuestionnaireDef = {
  id: 1,
  code: 'BAARS_IV',
  name: 'Barkley Adult ADHD Rating Scale-IV',
  description: 'Comprehensive ADHD assessment for adults',
  type: 'SELF',
  category: 'ADHD Assessment',
  questions: [
    {
      id: 'q1',
      text: 'How often do you have difficulty sustaining attention?',
      options: [
        { value: '0', label: 'Never' },
        { value: '1', label: 'Rarely' },
        { value: '2', label: 'Sometimes' },
        { value: '3', label: 'Often' },
        { value: '4', label: 'Very Often' },
      ],
    },
    {
      id: 'q2',
      text: 'How often do you make careless mistakes?',
      options: [
        { value: '0', label: 'Never' },
        { value: '1', label: 'Rarely' },
        { value: '2', label: 'Sometimes' },
        { value: '3', label: 'Often' },
        { value: '4', label: 'Very Often' },
      ],
    },
    {
      id: 'q3',
      text: 'How often do you feel restless or fidgety?',
      options: [
        { value: '0', label: 'Never' },
        { value: '1', label: 'Rarely' },
        { value: '2', label: 'Sometimes' },
        { value: '3', label: 'Often' },
        { value: '4', label: 'Very Often' },
      ],
    },
    {
      id: 'q4',
      text: 'How often do you interrupt others?',
      options: [
        { value: '0', label: 'Never' },
        { value: '1', label: 'Rarely' },
        { value: '2', label: 'Sometimes' },
        { value: '3', label: 'Often' },
        { value: '4', label: 'Very Often' },
      ],
    },
    {
      id: 'q5',
      text: 'How often do you procrastinate important tasks?',
      options: [
        { value: '0', label: 'Never' },
        { value: '1', label: 'Rarely' },
        { value: '2', label: 'Sometimes' },
        { value: '3', label: 'Often' },
        { value: '4', label: 'Very Often' },
      ],
    },
  ],
};
