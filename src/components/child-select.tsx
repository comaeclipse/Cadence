"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChildProfile } from "@/types/incident";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ChildSelect({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch('/api/children')
      .then(res => res.json())
      .then(setChildren)
      .catch(err => {
        console.error('Error fetching children:', err);
        toast.error('Failed to load children');
      });
  }, []);

  const selected = useMemo(() => children.find((c) => c.id === value), [children, value]);

  async function addChild() {
    const name = newName.trim();
    if (!name) return;

    try {
      const response = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to add child');
      }

      const newChild = await response.json();
      const updatedChildren = await fetch('/api/children').then(res => res.json());
      setChildren(updatedChildren);
      onChange(newChild.id);
      setAdding(false);
      setNewName("");
      toast.success("Child added");
    } catch (error) {
      console.error('Error adding child:', error);
      toast.error('Failed to add child');
    }
  }

  if (adding) {
    return (
      <div className="flex gap-2">
        <Input
          placeholder="Child name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button onClick={addChild}>Save</Button>
        <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selected?.id} onValueChange={onChange}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select child" />
        </SelectTrigger>
        <SelectContent>
          {children.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
        Add child
      </Button>
    </div>
  );
}

