import { useDroppable } from '@dnd-kit/core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DropContainerProps<T extends Record<string, any>> {
  data: T
  id: string
  renderItem: (
    isOver: boolean,
    setNodeRef: (element: HTMLElement | null) => void
  ) => React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropContainer<T extends Record<string, any>>({
  renderItem,
  id,
  data,
}: DropContainerProps<T>) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data,
  })

  return renderItem(isOver, setNodeRef)
}

export default DropContainer
