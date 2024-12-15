import { useDraggable } from '@dnd-kit/core'
import { Card } from '@welcome-ui/card'
import { Candidate } from '../../api'

interface CandidateCardProps {
  candidate: Candidate
  id: number
}

function CandidateCard({ candidate, id }: CandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: {
      candidate,
    },
  })
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <Card mb={10} ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card.Body>{candidate.email}</Card.Body>
    </Card>
  )
}

export default CandidateCard
