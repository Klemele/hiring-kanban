import { useDraggable } from '@dnd-kit/core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DragItemProps<T extends Record<string, any>> {
  data: T
  id: number
  children: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DragItem<T extends Record<string, any>>({ id, data, children }: DragItemProps<T>) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data,
  })
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  )
}

export default DragItem
