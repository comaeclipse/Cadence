"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { CatalogItem } from "@/types/incident";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { uid } from "@/lib/id";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function CatalogEditor({ label, table, description }: { label: string; table: keyof typeof db; description: string }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [text, setText] = useState("");
  useEffect(() => {
    (async () => {
      // @ts-expect-error Dexie index signature
      setItems(await db[table].toArray());
    })();
  }, [table]);
  async function add() {
    const t = text.trim();
    if (!t) return;
    // @ts-expect-error Dexie index signature
    await db[table].add({ id: uid(), label: t });
    setText("");
    // @ts-expect-error Dexie index signature
    setItems(await db[table].toArray());
  }
  async function remove(id: string) {
    // @ts-expect-error Dexie index signature
    await db[table].delete(id);
    // @ts-expect-error Dexie index signature
    setItems(await db[table].toArray());
  }
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{label}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Badge variant="secondary">{items.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={`Add ${label.toLowerCase()}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <Button onClick={add}>Add</Button>
        </div>
        <div className="grid gap-2 max-h-96 overflow-y-auto">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between border-2 rounded-md px-4 py-3 text-sm bg-card hover:shadow-md transition-shadow">
              <span className="font-medium">{it.label}</span>
              <Button variant="outline" size="sm" onClick={() => remove(it.id)}>Remove</Button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-center text-muted-foreground py-8">No items yet. Add your first {label.toLowerCase()} above.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CatalogsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catalogs</h1>
        <p className="text-muted-foreground mt-1">Manage reusable items for quick incident logging</p>
      </div>

      <Tabs defaultValue="behaviors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="behaviors">Behaviors</TabsTrigger>
          <TabsTrigger value="antecedents">Antecedents</TabsTrigger>
          <TabsTrigger value="consequences">Consequences</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="behaviors">
          <CatalogEditor
            label="Behaviors"
            table="behaviors"
            description="Observable actions and topographies (e.g., hitting, yelling, eloping)"
          />
        </TabsContent>
        <TabsContent value="antecedents">
          <CatalogEditor
            label="Antecedents"
            table="antecedents"
            description="Events or conditions that occur before the behavior (triggers, setting events)"
          />
        </TabsContent>
        <TabsContent value="consequences">
          <CatalogEditor
            label="Consequences"
            table="consequences"
            description="Events that follow the behavior (what happened after)"
          />
        </TabsContent>
        <TabsContent value="interventions">
          <CatalogEditor
            label="Interventions"
            table="interventions"
            description="Strategies or actions taken in response (de-escalation, redirection, etc.)"
          />
        </TabsContent>
        <TabsContent value="locations">
          <CatalogEditor
            label="Locations"
            table="locations"
            description="Places where incidents occur (classroom, playground, home, etc.)"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
