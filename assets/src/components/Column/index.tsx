import { Badge } from '@welcome-ui/badge'
import { Box } from '@welcome-ui/box'
import { Flex } from '@welcome-ui/flex'
import { Text } from '@welcome-ui/text'

interface ColumnProps {
  name: string
  isOver?: boolean
  size: number
  children: React.ReactNode
  ref?: React.Ref<HTMLDivElement> | undefined
}

function Column({ name, size, isOver, children, ref }: ColumnProps) {
  return (
    <Box
      w={300}
      border={1}
      backgroundColor={isOver ? 'yellow-20' : 'white'}
      borderColor="neutral-30"
      borderRadius="md"
      overflow="true"
      ref={ref}
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
        <Badge>{size}</Badge>
      </Flex>
      <Flex direction="column" p={10} pb={0}>
        {children}
      </Flex>
    </Box>
  )
}

export default Column
