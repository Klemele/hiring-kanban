import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DragItemProps<T extends Record<string, any>> {
  data: T
  id: number
  children: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DragItem<T extends Record<string, any>>({ id, data, children }: DragItemProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, data })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  )
}

export default DragItem
