"use client";

import * as React from "react";
import { X, ChevronsUpDown, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface MultiSelectOption {
  id: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  onCreateNew?: (label: string) => Promise<MultiSelectOption>;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  emptyMessage = "No items found.",
  className,
  onCreateNew,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const selectedOptions = options.filter((option) => selected.includes(option.id));

  const handleToggle = (optionId: string) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter((id) => id !== optionId));
    } else {
      onChange([...selected, optionId]);
    }
  };

  const handleRemove = (optionId: string) => {
    onChange(selected.filter((id) => id !== optionId));
  };

  const handleCreateNew = async () => {
    if (!onCreateNew || !searchValue.trim()) return;

    setIsCreating(true);
    try {
      const newOption = await onCreateNew(searchValue.trim());
      onChange([...selected, newOption.id]);
      setSearchValue("");
      toast.success(`Created "${newOption.label}"`);
    } catch (error) {
      console.error("Error creating new item:", error);
      toast.error("Failed to create new item");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const showCreateOption =
    onCreateNew &&
    searchValue.trim() &&
    !filteredOptions.some((opt) => opt.label.toLowerCase() === searchValue.toLowerCase());

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 px-3 py-2"
          >
            {selectedOptions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map((option) => (
                  <Badge key={option.id} variant="secondary" className="mr-1">
                    {option.label}
                    <button
                      type="button"
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(option.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {showCreateOption ? (
                  <div className="py-6 text-center text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateNew}
                      disabled={isCreating}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create &quot;{searchValue}&quot;
                    </Button>
                  </div>
                ) : (
                  emptyMessage
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = selected.includes(option.id);
                  return (
                    <CommandItem
                      key={option.id}
                      onSelect={() => handleToggle(option.id)}
                      className="cursor-pointer"
                    >
                      <Checkbox
                        checked={isSelected}
                        className="mr-2"
                        onCheckedChange={() => handleToggle(option.id)}
                      />
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
