import { Box } from '@welcome-ui/box'
import { Flex } from '@welcome-ui/flex'
import { Text } from '@welcome-ui/text'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Candidate } from '../../api'
import Column from '../../components/Column'
import { useCandidates, useJob } from '../../hooks'

type Statuses = 'new' | 'interview' | 'hired' | 'rejected'
const COLUMNS: Statuses[] = ['new', 'interview', 'hired', 'rejected']

interface SortedCandidates {
  new: Candidate[]
  interview: Candidate[]
  hired: Candidate[]
  rejected: Candidate[]
}

function JobShow() {
  const { jobId } = useParams()
  const { job } = useJob(jobId)
  const { candidates } = useCandidates(jobId)

  const sortedCandidates = useMemo(() => {
    if (!candidates) return { new: [], interview: [], hired: [], rejected: [] }

    return candidates.reduce<SortedCandidates>(
      (acc, c: Candidate) => {
        acc[c.status] = [...(acc[c.status] || []), c].sort((a, b) => a.position - b.position)
        return acc
      },
      { new: [], interview: [], hired: [], rejected: [] }
    )
  }, [candidates])

  return (
    <>
      <Box backgroundColor="neutral-70" p={20} alignItems="center">
        <Text variant="h5" color="white" m={0}>
          {job?.name}
        </Text>
      </Box>

      <Box p={20}>
        <Flex gap={10}>
          {COLUMNS.map(column => (
            <Column name={column} candidates={sortedCandidates[column]} key={column} />
          ))}
        </Flex>
      </Box>
    </>
  )
}

export default JobShow
