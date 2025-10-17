"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { ChildProfile } from "@/types/incident";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { uid } from "@/lib/id";
import { toast } from "sonner";

export default function ChildrenPage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [name, setName] = useState("");

  async function refresh() {
    setChildren(await db.children.toArray());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function add() {
    const n = name.trim();
    if (!n) return;
    await db.children.add({ id: uid(), name: n });
    setName("");
    toast.success("Child added");
    refresh();
  }

  async function remove(id: string) {
    await db.children.delete(id);
    toast.success("Child removed");
    refresh();
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Children</h1>
          <p className="text-muted-foreground mt-1">Manage child profiles for incident tracking</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {children.length} {children.length === 1 ? 'Child' : 'Children'}
        </Badge>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle>Add New Child</CardTitle>
          <CardDescription>Create a profile to start tracking behavioral incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Child's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <Button onClick={add} size="default">Add Child</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {children.length === 0 && (
          <Card className="border-2 shadow-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No children added yet. Add a child profile to begin logging incidents.</p>
            </CardContent>
          </Card>
        )}
        {children.map((c) => (
          <Card key={c.id} className="border-2 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">{c.name[0].toUpperCase()}</span>
                </div>
                <div className="font-medium text-lg">{c.name}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => remove(c.id)}>Remove</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

