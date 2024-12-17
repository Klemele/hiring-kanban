import { Box } from '@welcome-ui/box'
import { Flex } from '@welcome-ui/flex'
import { Text } from '@welcome-ui/text'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Candidate, updateCandidate } from '../../api'
import Kanban from '../../components/Kanban'
import { useCandidates, useJob } from '../../hooks'
import { SortedCandidates } from '../../types'

function JobShow() {
  const { jobId } = useParams()
  const { job } = useJob(jobId)
  const { candidates } = useCandidates(jobId)
  const [sortedCandidates, setSortedCandidates] = useState<SortedCandidates>({
    new: [],
    interview: [],
    hired: [],
    rejected: [],
  })
  const [candidatesToUpdate, setCandidatesToUpdate] = useState<Candidate[] | undefined>([])

  useEffect(() => {
    if (!candidates) return

    setSortedCandidates(
      candidates.reduce<SortedCandidates>(
        (acc, c: Candidate) => {
          acc[c.status] = [...(acc[c.status] || []), c].sort((a, b) => a.position - b.position)
          return acc
        },
        { new: [], interview: [], hired: [], rejected: [] }
      )
    )
  }, [candidates])

  useEffect(() => {
    async function updateCandidates() {
      if (!jobId || !candidatesToUpdate) return

      for (const candidate of candidatesToUpdate) {
        try {
          await updateCandidate(jobId, candidate)
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message)
          }
        }
      }
    }

    updateCandidates()
  }, [candidatesToUpdate, jobId])

  return (
    <>
      <Box backgroundColor="neutral-70" p={20} alignItems="center">
        <Text variant="h5" color="white" m={0}>
          {job?.name}
        </Text>
      </Box>
      <Box p={20} overflow="hidden">
        <Flex gap={10}>
          <Kanban
            sortedCandidates={sortedCandidates}
            setSortedCandidates={setSortedCandidates}
            setCandidatesToUpdate={setCandidatesToUpdate}
          />
        </Flex>
      </Box>
    </>
  )
}

export default JobShow
