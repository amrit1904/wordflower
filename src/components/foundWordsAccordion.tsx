import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { FoundWordsListProps } from "./found-words-list"

export default function FoundWordsAccordion({ foundWords, totalWords, pangrams = [] }: FoundWordsListProps) {
    console.log(pangrams)
    return (
        <Accordion type="single" collapsible
        >
            <AccordionItem value="words" className="border-none rounded-md px-4 bg-secondary">
                {/* Header: only shows title */}
                <AccordionTrigger className="text-base font-medium justify-center">
                    <div className="flex items-center justify-start w-full gap-2">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            Found Words
                        </h3>
                        <div className="text-sm font-medium text-muted-foreground">
                            {foundWords.length} / {totalWords}
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent >
                    <div className="max-h-32 overflow-y-auto flex flex-wrap gap-2">
                        {[...foundWords]
                            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
                            .map((word, index) => (
                                <span
                                    key={index}
                                    className={`px-2 py-1 rounded text-sm select-none ${pangrams.includes(word)
                                            ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 border border-yellow-500 shadow-md font-bold'
                                            : 'bg-gray-200 dark:bg-gray-700 text-muted-foreground'
                                        }`}
                                >
                                    {word.toUpperCase()}
                                </span>
                            ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
