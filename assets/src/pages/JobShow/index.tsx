import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  SortableData,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
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
import { SortedCandidates, Statuses } from '../../types'

const COLUMNS: Statuses[] = ['new', 'interview', 'hired', 'rejected']

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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  const [activeCandidate, setActiveCandidate] = useState<(Candidate & SortableData) | null>(null)

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

  const onDragMove = (event: DragMoveEvent) => {
    const { active, over } = event

    if (!over?.data.current || !active.data.current?.sortable) {
      return
    }

    const isDraggingOverColumn = !!over.data.current.column
    const fromColumn: Statuses = active.data.current.sortable.containerId
    // Dragging over a candidate item or Dragging over a column
    const toColumn: Statuses = isDraggingOverColumn
      ? over.data.current.column
      : over.data.current.sortable.containerId

    // Prevent reording candidates when dragging over the same column as it's already handle natively
    if (!fromColumn || !toColumn || fromColumn === toColumn) {
      return
    }

    // Visual sorting of candidates while dragging
    setSortedCandidates(prev => {
      if (!over?.data.current || !active.data.current) return prev

      const toColumnCandidates = prev[toColumn]
      const activeCandidateIndex = active.data.current.position

      return {
        ...prev,
        [fromColumn]: [...prev[fromColumn].filter(item => item.id !== active.id)],
        [toColumn]: [
          ...prev[toColumn],
          {
            ...sortedCandidates[fromColumn][activeCandidateIndex],
            position: toColumnCandidates.length,
          },
        ],
      }
    })
  }

  function onDragStart(event: DragStartEvent) {
    const { active } = event

    setActiveCandidate(active.data.current as Candidate & SortableData)
  }

  // TODO: Sort in the same column
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over?.data.current || !active.data.current?.sortable) {
      return
    }

    const fromColumn: Statuses = active.data.current.status
    const toColumn: Statuses = over.data.current.sortable.containerId

    if (!fromColumn || !toColumn || activeCandidate === null) {
      return
    }

    const newActiveCandidatePosition =
      over.id !== activeCandidate.id
        ? over.data.current.position
        : // Case end of column, where the dragged element overlap itself
          sortedCandidates[toColumn].length - 1
    const candidatesToBeUpdated: Candidate[] = []

    const updatedToColumn = sortedCandidates[toColumn].reduce<Candidate[]>((acc, candidate) => {
      const updatedCandidatePosition = candidate

      if (candidate.position >= newActiveCandidatePosition && candidate.id !== activeCandidate.id) {
        updatedCandidatePosition.position += 1

        // Only update candidate impacted by the drag
        candidatesToBeUpdated.unshift({ ...updatedCandidatePosition })
      }

      // Update the position of the candidate being dragged
      if (candidate.id === activeCandidate.id) {
        updatedCandidatePosition.position = newActiveCandidatePosition
        acc.splice(newActiveCandidatePosition, 0, updatedCandidatePosition)

        return acc
      }

      acc.push(updatedCandidatePosition)
      return acc
    }, [])

    // Remove sortable props from the candidate being dragged over
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sortable: _, ...candidateDraggedOver } = activeCandidate
    candidatesToBeUpdated.push({
      ...candidateDraggedOver,
      position: newActiveCandidatePosition,
      status: toColumn as Statuses,
    })

    const updatedFromColumn = sortedCandidates[fromColumn].reduce<Candidate[]>(
      (acc, candidate, index) => {
        const updatedCandidatePosition = candidate

        if (candidate.position !== index) {
          updatedCandidatePosition.position = index

          // Only update candidate impacted by the drag
          candidatesToBeUpdated.push({ ...updatedCandidatePosition })
        }

        acc.push(updatedCandidatePosition)

        return acc
      },
      []
    )

    setActiveCandidate(null)
    setSortedCandidates(items => ({
      ...items,
      [fromColumn]: updatedFromColumn,
      [toColumn]: updatedToColumn,
    }))
    setCandidatesToUpdate(candidatesToBeUpdated)
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
          <DndContext
            onDragEnd={onDragEnd}
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
          >
            {COLUMNS.map(column => (
              <SortableContext
                items={sortedCandidates[column]}
                strategy={verticalListSortingStrategy}
                key={column}
                id={column}
              >
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
              </SortableContext>
            ))}
            <DragOverlay>
              {activeCandidate ? <CandidateCard candidate={activeCandidate} /> : null}
            </DragOverlay>
          </DndContext>
        </Flex>
      </Box>
    </>
  )
}

export default JobShow
