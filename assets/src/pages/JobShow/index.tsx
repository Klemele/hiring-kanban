import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { Box } from '@welcome-ui/box'
import { Flex } from '@welcome-ui/flex'
import { Text } from '@welcome-ui/text'
import { useEffect, useState } from 'react'
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
  const [sortedCandidates, setSortedCandidates] = useState<SortedCandidates>({
    new: [],
    interview: [],
    hired: [],
    rejected: [],
  })

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

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over?.data.current || !active.data.current) return
    const currentCandidate: Candidate = active.data.current.candidate
    const fromColumn: Statuses = currentCandidate.status
    const toColumn: Statuses = over.data.current.column
    const updatedCandidate = {
      ...currentCandidate,
      status: toColumn,
      position: sortedCandidates[toColumn].length,
    }

    if (fromColumn !== toColumn) {
      const candidatesToUpdate: Candidate[] = []
      const updatedFromColumn = sortedCandidates[fromColumn].reduce<Candidate[]>(
        (acc, candidate) => {
          if (candidate.id !== currentCandidate.id) {
            if (candidate.position > currentCandidate.position) {
              const candidateToUpdate = { ...candidate, position: candidate.position - 1 }

              candidatesToUpdate.push(candidateToUpdate)
              acc.push(candidateToUpdate)
            } else {
              acc.push(candidate)
            }
          }
          return acc
        },
        []
      )
      const updatedToColumn = [...sortedCandidates[toColumn], updatedCandidate]

      setSortedCandidates({
        ...sortedCandidates,
        [fromColumn]: updatedFromColumn,
        [toColumn]: updatedToColumn,
      })
    }
  }

  return (
    <>
      <Box backgroundColor="neutral-70" p={20} alignItems="center">
        <Text variant="h5" color="white" m={0}>
          {job?.name}
        </Text>
      </Box>

      <Box p={20} overflow="hidden">
        <Flex gap={10}>
          <DndContext onDragEnd={onDragEnd}>
            {COLUMNS.map((column, index) => (
              <Column name={column} candidates={sortedCandidates[column]} id={index} key={column} />
            ))}
          </DndContext>
        </Flex>
      </Box>
    </>
  )
}

export default JobShow
