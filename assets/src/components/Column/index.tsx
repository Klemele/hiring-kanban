import { useDroppable } from '@dnd-kit/core'
import { Badge } from '@welcome-ui/badge'
import { Box } from '@welcome-ui/box'
import { Flex } from '@welcome-ui/flex'
import { Text } from '@welcome-ui/text'
import { Candidate } from '../../api'
import CandidateCard from '../Candidate'

interface ColumnProps {
  name: string
  candidates: Candidate[]
  id: number
}

function Column({ name, candidates, id }: ColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      column: name,
    },
  })

  return (
    <Box
      ref={setNodeRef}
      w={300}
      border={1}
      backgroundColor={isOver ? 'yellow-20' : 'white'}
      borderColor="neutral-30"
      borderRadius="md"
      overflow="true"
    >
      <Flex
        p={10}
        borderBottom={1}
        borderColor="neutral-30"
        alignItems="center"
        justify="space-between"
      >
        <Text color="black" m={0} textTransform="capitalize">
          {name}
        </Text>
        <Badge>{candidates.length}</Badge>
      </Flex>
      <Flex direction="column" p={10} pb={0}>
        {candidates.map((candidate: Candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} id={candidate.id} />
        ))}
      </Flex>
    </Box>
  )
}

export default Column