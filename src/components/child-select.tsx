"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import type { ChildProfile } from "@/types/incident";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uid } from "@/lib/id";
import { toast } from "sonner";

export function ChildSelect({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    db.children.toArray().then(setChildren);
  }, []);

  const selected = useMemo(() => children.find((c) => c.id === value), [children, value]);

  async function addChild() {
    const name = newName.trim();
    if (!name) return;
    const id = uid();
    await db.children.add({ id, name });
    const list = await db.children.toArray();
    setChildren(list);
    onChange(id);
    setAdding(false);
    setNewName("");
    toast.success("Child added");
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

