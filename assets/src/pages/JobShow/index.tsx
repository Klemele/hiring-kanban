import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { Box } from '@welcome-ui/box'
import { Flex } from '@welcome-ui/flex'
import { Text } from '@welcome-ui/text'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Candidate, updateCandidate } from '../../api'
import CandidateCard from '../../components/Candidate'
import Column from '../../components/Column'
import DragItem from '../../components/DragItem'
import DropContainer from '../../components/DropContainer'
import { useCandidates, useJob } from '../../hooks'
import { Statuses } from '../../types'

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

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over?.data.current || !active.data.current) return
    const currentCandidate: Candidate = active.data.current as Candidate
    const fromColumn: Statuses = currentCandidate.status
    const toColumn: Statuses = over.data.current.column
    const updatedCandidate = {
      ...currentCandidate,
      status: toColumn,
      position: sortedCandidates[toColumn].length,
    }

    if (fromColumn !== toColumn) {
      const candidatesToBeUpdated: Candidate[] = []
      const updatedFromColumn = sortedCandidates[fromColumn].reduce<Candidate[]>(
        (acc, candidate) => {
          if (candidate.id !== currentCandidate.id) {
            if (candidate.position > currentCandidate.position) {
              const candidateToUpdate = { ...candidate, position: candidate.position - 1 }

              candidatesToBeUpdated.push(candidateToUpdate)
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
      setCandidatesToUpdate([updatedCandidate, ...candidatesToBeUpdated])
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
            {COLUMNS.map(column => (
              <DropContainer
                id={column}
                data={{ column }}
                renderItem={(isOver, setNodeRef) => (
                  <Column
                    name={column}
                    size={sortedCandidates[column].length}
                    isOver={isOver}
                    ref={setNodeRef}
                  >
                    {sortedCandidates[column].length === 0 ? (
                      <Text color="neutral-40" textAlign="center">
                        No candidates
                      </Text>
                    ) : (
                      sortedCandidates[column].map((candidate: Candidate) => (
                        <DragItem key={candidate.id} id={candidate.id} data={candidate}>
                          <CandidateCard candidate={candidate} />
                        </DragItem>
                      ))
                    )}
                  </Column>
                )}
                key={column}
              />
            ))}
          </DndContext>
        </Flex>
      </Box>
    </>
  )
}

export default JobShow
