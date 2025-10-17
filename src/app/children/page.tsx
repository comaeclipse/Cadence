"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { ChildProfile } from "@/types/incident";
import { MobileLayout } from "@/components/mobile-layout";
import { uid } from "@/lib/id";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

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
    <MobileLayout title="Manage Children" subtitle="Child profiles for incident tracking">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Children</h2>
          <span className="text-sm text-gray-600">
            {children.length} {children.length === 1 ? 'Child' : 'Children'}
          </span>
        </div>

        {/* Add New Child */}
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-stone-50 mb-3">Add New Child</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Child's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

        {/* Children List */}
        <div className="space-y-3">
          {children.length === 0 && (
            <div className="bg-stone-50 rounded-xl p-8 shadow-sm border border-stone-200 text-center">
              <p className="text-gray-600">No children added yet. Add a child profile to begin logging incidents.</p>
            </div>
          )}
          {children.map((c) => (
            <div key={c.id} className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-emerald-700">{c.name[0].toUpperCase()}</span>
                  </div>
                  <div className="font-semibold text-gray-900">{c.name}</div>
                </div>
                <button
                  onClick={() => remove(c.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}

