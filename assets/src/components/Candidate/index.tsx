import { Card } from '@welcome-ui/card'
import { Candidate } from '../../api'

interface CandidateCardProps {
  candidate: Candidate
}

function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <Card mb={10}>
      <Card.Body>{candidate.email}</Card.Body>
    </Card>
  )
}

export default CandidateCard
