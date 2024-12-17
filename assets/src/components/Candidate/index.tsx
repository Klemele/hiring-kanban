import { Card } from '@welcome-ui/card'
import { Candidate } from '../../api'

interface CandidateCardProps {
  candidate: Candidate
  ref?: React.Ref<HTMLDivElement> | undefined
}

function CandidateCard({ candidate, ref }: CandidateCardProps) {
  return (
    <Card mb={10} ref={ref}>
      <Card.Body>{candidate.email}</Card.Body>
    </Card>
  )
}

export default CandidateCard
