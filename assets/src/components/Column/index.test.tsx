import { expect, test } from 'vitest'

import { Text } from '@welcome-ui/text'
import Column from '.'
import { Candidate } from '../../api'
import { generateCandidates, render } from '../../test-utils'
import { Statuses } from '../../types'
import CandidateCard from '../Candidate'
import DragItem from '../DragItem'

const COLUMNS: Statuses[] = ['new', 'interview', 'hired', 'rejected']

test('renders column name', () => {
  const { getByText } = render(
    <Column name={COLUMNS[0]} size={0}>
      <Text color="neutral-40" textAlign="center">
        No candidates
      </Text>
    </Column>
  )
  expect(getByText('new')).toBeInTheDocument()
})

test('renders column with candidates', () => {
  const candidates = generateCandidates(10)
  const { getByText } = render(
    <Column name={COLUMNS[0]} size={candidates.length}>
      {candidates.map((candidate: Candidate) => (
        <DragItem key={candidate.id} id={candidate.id} data={candidate}>
          <CandidateCard candidate={candidate} />
        </DragItem>
      ))}
    </Column>
  )

  for (const candidate of candidates) {
    expect(getByText(candidate.email)).toBeInTheDocument()
  }
})
