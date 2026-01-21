import type { QuestionnaireDef } from './index';

export const questionlist2: QuestionnaireDef = {
  id: 3,
  code: 'SNAP_IV',
  name: 'SNAP-IV (Informant)',
  description: 'Parent/Teacher/Informant rating scale',
  type: 'OTHER',
  category: 'ADHD Assessment',
  respondents: ['Mom', 'Dad', 'Cousin', 'Sibling', 'Teacher'],
  questions: [
    {
      id: 'q1',
      text: 'Often fails to give close attention to details.',
      options: [
        { value: '0', label: 'Not at all' },
        { value: '1', label: 'Just a little' },
        { value: '2', label: 'Quite a bit' },
        { value: '3', label: 'Very much' },
      ],
    },
    {
      id: 'q2',
      text: 'Often has difficulty sustaining attention in tasks.',
      options: [
        { value: '0', label: 'Not at all' },
        { value: '1', label: 'Just a little' },
        { value: '2', label: 'Quite a bit' },
        { value: '3', label: 'Very much' },
      ],
    },
    {
      id: 'q3',
      text: 'Often fidgets with hands or feet.',
      options: [
        { value: '0', label: 'Not at all' },
        { value: '1', label: 'Just a little' },
        { value: '2', label: 'Quite a bit' },
        { value: '3', label: 'Very much' },
      ],
    },
    {
      id: 'q4',
      text: 'Often interrupts or intrudes on others.',
      options: [
        { value: '0', label: 'Not at all' },
        { value: '1', label: 'Just a little' },
        { value: '2', label: 'Quite a bit' },
        { value: '3', label: 'Very much' },
      ],
    },
    {
      id: 'q5',
      text: 'Often avoids or dislikes tasks requiring sustained effort.',
      options: [
        { value: '0', label: 'Not at all' },
        { value: '1', label: 'Just a little' },
        { value: '2', label: 'Quite a bit' },
        { value: '3', label: 'Very much' },
      ],
    },
  ],
};
