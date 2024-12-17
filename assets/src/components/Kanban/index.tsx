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

    if (!fromColumn || !toColumn) {
      return
    }

    // Visual sorting of candidates while dragging
    setSortedCandidates(prev => {
      if (!over?.data.current || !active.data.current || active.id === over.id) return prev

      const activeCandidateIndex = active.data.current.position
      const newIndex = isDraggingOverColumn
        ? prev[toColumn].length
        : over.data.current.sortable.index

      // Drag over a column
      if (fromColumn !== toColumn) {
        return {
          ...prev,
          [fromColumn]: [...prev[fromColumn].filter(item => item.id !== active.id)],
          [toColumn]: [
            ...prev[toColumn].slice(0, newIndex),
            {
              ...sortedCandidates[fromColumn][activeCandidateIndex],
              position: newIndex,
            },
            ...prev[toColumn].slice(newIndex, prev[toColumn].length),
          ],
        }
      }
      if (fromColumn === toColumn && !isDraggingOverColumn) {
        // Drag over same column
        if (newIndex > activeCandidateIndex) {
          return {
            ...prev,
            [toColumn]: [
              ...prev[toColumn].slice(0, activeCandidateIndex),
              prev[toColumn][newIndex],
              {
                ...sortedCandidates[toColumn][activeCandidateIndex],
                position: newIndex,
              },
              ...prev[toColumn].slice(newIndex + 1, prev[toColumn].length),
            ],
          }
        }
        if (newIndex < activeCandidateIndex) {
          return {
            ...prev,
            [toColumn]: [
              ...prev[toColumn].slice(0, newIndex),
              {
                ...sortedCandidates[toColumn][activeCandidateIndex],
                position: newIndex,
              },
              ...prev[toColumn].slice(newIndex, activeCandidateIndex),
              ...prev[toColumn].slice(activeCandidateIndex + 1, prev[toColumn].length),
            ],
          }
        }
      }

      return prev
    })
  }

  function onDragStart(event: DragStartEvent) {
    const { active } = event

    setActiveCandidate(active.data.current as Candidate & SortableData)
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over?.data.current || !active.data.current?.sortable) {
      return
    }

    const fromColumn: Statuses = active.data.current.status
    const toColumn: Statuses = over.data.current.sortable.containerId

    if (!fromColumn || !toColumn || activeCandidate === null) {
      return
    }

    const candidatesToBeUpdated: Candidate[] = []
    let updatedFromColumn: Candidate[] = []
    let updatedToColumn: Candidate[] = []
    let candidateDraggedOver: Candidate | undefined

    // Case: move from one column to another
    if (fromColumn !== toColumn) {
      updatedToColumn = sortedCandidates[toColumn].reduce<Candidate[]>((acc, candidate, index) => {
        // Dragged Over candidate need to be updated afterwards to respect indexing
        if (candidate.id === activeCandidate.id) {
          candidateDraggedOver = { ...candidate, status: toColumn }

          acc.push(candidateDraggedOver)

          return acc
        }

        // Update only candidate impacted by the drag
        if (candidate.position != index) {
          const updatedCandidate = { ...candidate, position: index }

          candidatesToBeUpdated.unshift(updatedCandidate)
          acc.push(updatedCandidate)
        } else {
          acc.push(candidate)
        }

        return acc
      }, [])

      // Insert candidate impacted by the drag in the update list
      if (candidateDraggedOver) {
        candidatesToBeUpdated.push(candidateDraggedOver)
      }

      updatedFromColumn = sortedCandidates[fromColumn].reduce<Candidate[]>(
        (acc, candidate, index) => {
          // Update only candidate impacted by the drag
          if (candidate.position != index) {
            const candidateUpdated = { ...candidate, position: index }

            acc.push(candidateUpdated)
            candidatesToBeUpdated.push(candidateUpdated)

            return acc
          }

          acc.push(candidate)

          return acc
        },
        []
      )
    }

    // Case: reorder candidates in the same column
    if (fromColumn === toColumn) {
      // Need to use a modifier for indexing to preserve unique constraint candidate_status_position
      // WIll reapply correct indexing afterwards
      const modifier = sortedCandidates[toColumn].length

      updatedToColumn = sortedCandidates[toColumn].reduce<Candidate[]>((acc, candidate, index) => {
        if (candidate.id === activeCandidate.id) {
          candidateDraggedOver = {
            ...candidate,
            status: toColumn,
            position: candidate.position + modifier,
          }
        }

        // Update only candidate impacted by the drag
        if (candidate.position != index) {
          const updatedCandidate = { ...candidate, position: index + modifier }

          // Update only candidate impacted by the drag
          candidatesToBeUpdated.unshift({ ...updatedCandidate })
          acc.push(updatedCandidate)
        } else {
          acc.push(candidate)
        }

        return acc
      }, [])

      // Insert candidate impacted by the drag in the update list
      if (candidateDraggedOver) {
        candidatesToBeUpdated.push(candidateDraggedOver)
      }

      // Re-index correctly candidates in the same column
      updatedToColumn.map((candidate, index) => {
        if (candidate.position != index || candidate.id === activeCandidate.id) {
          candidate.position = index
          candidatesToBeUpdated.push(candidate)
        }

        return candidate
      })
    }

    setSortedCandidates(items => ({
      ...items,
      [toColumn]: updatedToColumn,
      ...(fromColumn !== toColumn ? { [fromColumn]: updatedFromColumn } : {}),
    }))
    setCandidatesToUpdate(candidatesToBeUpdated)
    setActiveCandidate(null)
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
