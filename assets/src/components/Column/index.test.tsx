import { expect, test } from 'vitest'

import Column from '.'
import { generateCandidates, render } from '../../test-utils'
import { Statuses } from '../../types'

const COLUMNS: Statuses[] = ['new', 'interview', 'hired', 'rejected']

test('renders column name', () => {
  const { getByText } = render(<Column name={COLUMNS[0]} candidates={[]} id={0} />)
  expect(getByText('new')).toBeInTheDocument()
})

test('renders column with candidates', () => {
  const candidates = generateCandidates(10)
  const { getByText } = render(<Column name={COLUMNS[0]} candidates={candidates} id={0} />)

  for (const candidate of candidates) {
    expect(getByText(candidate.email)).toBeInTheDocument()
  }
})
