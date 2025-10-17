"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { CatalogItem } from "@/types/incident";
import { uid } from "@/lib/id";
import { Plus, X } from "lucide-react";

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
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-stone-50">{label}</h3>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-stone-50 text-emerald-800">
            {items.length} items
          </span>
        </div>
        <p className="text-xs text-stone-200 mb-3">{description}</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Add ${label.toLowerCase()}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            className="flex-1 px-4 py-3 border border-emerald-600 bg-stone-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-50 text-sm"
          />
          <button
            onClick={add}
            className="bg-stone-50 text-emerald-800 rounded-lg px-4 py-3 font-semibold flex items-center gap-2 active:bg-stone-100 transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200 flex items-center justify-between">
            <span className="font-medium text-gray-900">{it.label}</span>
            <button
              onClick={() => remove(it.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="bg-stone-50 rounded-xl p-8 shadow-sm border border-stone-200 text-center">
            <p className="text-sm text-gray-600">No items yet. Add your first {label.toLowerCase()} above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { MobileLayout } from "@/components/mobile-layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function CatalogsPage() {
  return (
    <MobileLayout title="Behavior Catalogs" subtitle="Manage reusable items for quick logging">
      <div className="p-4">
        <Tabs defaultValue="behaviors" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-stone-50 border border-stone-200">
            <TabsTrigger value="behaviors" className="text-xs">Behaviors</TabsTrigger>
            <TabsTrigger value="antecedents" className="text-xs">Antecedents</TabsTrigger>
            <TabsTrigger value="locations" className="text-xs">Locations</TabsTrigger>
          </TabsList>

          <TabsContent value="behaviors">
            <CatalogEditor
              label="Behaviors"
              table="behaviors"
              description="Observable actions (hitting, yelling, eloping)"
            />
          </TabsContent>
          <TabsContent value="antecedents">
            <CatalogEditor
              label="Antecedents"
              table="antecedents"
              description="Events that occur before the behavior"
            />
          </TabsContent>
          <TabsContent value="locations">
            <CatalogEditor
              label="Locations"
              table="locations"
              description="Places where incidents occur"
            />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
