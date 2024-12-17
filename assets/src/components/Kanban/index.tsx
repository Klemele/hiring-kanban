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
import { useState } from 'react'
import { Candidate } from '../../api'
import { SortedCandidates, Statuses } from '../../types'
import CandidateCard from '../Candidate'
import CandidateList from '../CandidateList'
import Column from '../Column'
import DropContainer from '../DropContainer'

const COLUMNS: Statuses[] = ['new', 'interview', 'hired', 'rejected']

interface KanbanProps {
  sortedCandidates: SortedCandidates
  setSortedCandidates: React.Dispatch<React.SetStateAction<SortedCandidates>>
  setCandidatesToUpdate: React.Dispatch<React.SetStateAction<Candidate[] | undefined>>
}

function Kanban({ sortedCandidates, setSortedCandidates, setCandidatesToUpdate }: KanbanProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  const [activeCandidate, setActiveCandidate] = useState<(Candidate & SortableData) | null>(null)

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
                <CandidateList candidates={sortedCandidates[column]} />
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
  )
}

export default Kanban
