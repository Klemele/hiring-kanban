import { Box } from '@welcome-ui/box'
import { Flex } from '@welcome-ui/flex'
import { Text } from '@welcome-ui/text'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Candidate } from '../../api'
import Kanban from '../../components/Kanban'
import { useJob, useSocketChannel } from '../../hooks'
import { SortedCandidates } from '../../types'

function JobShow() {
  const { jobId } = useParams()
  const { job } = useJob(jobId)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const { channel } = useSocketChannel('job', 'jobs', jobId)
  const [sortedCandidates, setSortedCandidates] = useState<SortedCandidates>({
    new: [],
    interview: [],
    hired: [],
    rejected: [],
  })
  const [candidatesToUpdate, setCandidatesToUpdate] = useState<Candidate[] | undefined>([])

  useEffect(() => {
    if (!channel) return

    channel.on('candidates_data', payload => {
      setCandidates(payload.candidates)
    })
    channel.on('candidate_updated', payload => {
      const found = candidates?.find(candidate => candidate.id === payload.candidate.id)

      if (!found) {
        setCandidates([...candidates, payload.candidate])
      } else {
        candidates.splice(candidates.indexOf(found), 1, payload.candidate)
        setCandidates([...candidates])
      }
    })
  }, [candidates, channel])

  useEffect(() => {
    if (!channel) {
      return
    }

    channel.push('get_candidates', { job_id: jobId })
  }, [jobId, channel])

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
      if (!jobId || !candidatesToUpdate || !channel) return

      const updateJobCandidate = (id: string, candidateParams: Candidate) => {
        channel.push('update_candidate', { job_id: id, candidate: candidateParams })
      }

      for (const candidate of candidatesToUpdate) {
        try {
          await updateJobCandidate(jobId, candidate)
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message)
          }
        }
      }
    }

    updateCandidates()
  }, [candidatesToUpdate, channel, jobId])

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
