import { expect, test } from 'vitest'

import Column from '.'
import { generateCandidates, render } from '../../test-utils'
import { Statuses } from '../../types'
import CandidateList from '../CandidateList'

const COLUMNS: Statuses[] = ['new', 'interview', 'hired', 'rejected']

test('renders column name', () => {
  const { getByText } = render(
    <Column name={COLUMNS[0]} size={0}>
      <CandidateList candidates={[]} />
    </Column>
  )
  expect(getByText('new')).toBeInTheDocument()
})

test('renders column with candidates', () => {
  const candidates = generateCandidates(10)
  const { getByText } = render(
    <Column name={COLUMNS[0]} size={candidates.length}>
      <CandidateList candidates={candidates} />
    </Column>
  )

  for (const candidate of candidates) {
    expect(getByText(candidate.email)).toBeInTheDocument()
  }
})
