import * as React from "react"
import { Command as CommandPrimitive } from "@radix-ui/react-command"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive ref={ref} className={className} {...props} />
))
Command.displayName = CommandPrimitive.displayName

export const CommandInput = CommandPrimitive.Input
export const CommandList = CommandPrimitive.List
export const CommandItem = CommandPrimitive.Item
export const CommandEmpty = CommandPrimitive.Empty
export { Command }
