import { Text } from '@welcome-ui/text'
import { Candidate } from '../../api'
import CandidateCard from '../Candidate'
import DragItem from '../DragItem'

interface CandidateListProps {
  candidates: Candidate[]
}

function CandidateList({ candidates }: CandidateListProps) {
  return candidates.length === 0 ? (
    <Text color="neutral-40" textAlign="center">
      No candidates
    </Text>
  ) : (
    candidates.map((candidate: Candidate) => (
      <DragItem key={candidate.id} id={candidate.id} data={candidate}>
        <CandidateCard candidate={candidate} />
      </DragItem>
    ))
  )
}

export default CandidateList
