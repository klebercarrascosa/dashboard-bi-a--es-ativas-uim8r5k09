import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ReactNode } from 'react'

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function ChartModal({ isOpen, onClose, title, children }: ChartModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[80vh] flex flex-col p-6">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            🔍 Visualização Expandida: {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full h-full pt-4 min-h-0">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
