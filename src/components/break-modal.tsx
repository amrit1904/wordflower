import { BREAK_THRESHOLD, formatTime } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { DialogHeader, DialogFooter } from "./ui/dialog"

type BreakModalProps = {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    breakTimer: number
    setTimeSinceWord: (timer: number) => void
}

export function BreakModal({ isOpen, setIsOpen, breakTimer, setTimeSinceWord }: BreakModalProps) {
    return (
        <Dialog open={isOpen}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Take a break!</DialogTitle>
                    <DialogDescription>
                        You&apos;ve been playing for a while. Take a short break and come back refreshed!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 ">
                    <div className="text-4xl font-mono font-bold tabular-nums">
                        {formatTime(breakTimer)}
                    </div>

                    <button
                        disabled={breakTimer > 0}
                        onClick={() => {
                            setIsOpen(false)
                            setTimeSinceWord(BREAK_THRESHOLD) // Reset the inactivity timer
                        }}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
                    >
                        {breakTimer > 0 ? 'Please wait...' : 'Resume Game'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}