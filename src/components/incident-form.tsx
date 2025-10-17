"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { uid } from "@/lib/id";
import type { Incident } from "@/types/incident";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ChildSelect } from "./child-select";

const schema = z.object({
  childId: z.string().min(1, "Select or add a child"),
  timestamp: z.string().min(1),
  behaviorText: z.string().min(1, "Describe the behavior"),
  intensity: z.number().min(1).max(5),
  durationSec: z.string().optional(),
  latencySec: z.string().optional(),
  functionHypothesis: z.enum(["escape", "attention", "tangible", "sensory", "unknown"]),
  locationText: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function IncidentForm({ onSaved }: { onSaved?: (incident: Incident) => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      childId: "",
      timestamp: new Date().toISOString(),
      behaviorText: "",
      intensity: 3,
      functionHypothesis: "unknown",
      locationText: "",
      notes: "",
    },
  });

  const [childId, setChildId] = useState("");
  useEffect(() => {
    if (childId) form.setValue("childId", childId, { shouldValidate: true });
  }, [childId, form]);

  async function onSubmit(values: FormValues) {
    const data: Incident = {
      id: uid(),
      childId: values.childId,
      timestamp: values.timestamp,
      behaviorText: values.behaviorText,
      intensity: values.intensity as 1 | 2 | 3 | 4 | 5,
      durationSec: values.durationSec ? Number(values.durationSec) : undefined,
      latencySec: values.latencySec ? Number(values.latencySec) : undefined,
      functionHypothesis: values.functionHypothesis,
      locationText: values.locationText,
      notes: values.notes,
    };
    await db.incidents.add(data);
    toast.success("Incident saved");
    form.reset({
      ...form.getValues(),
      behaviorText: "",
      notes: "",
      timestamp: new Date().toISOString(),
    });
    onSaved?.(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="childId"
          render={() => (
            <FormItem>
              <FormLabel>Child</FormLabel>
              <FormControl>
                <ChildSelect value={childId} onChange={setChildId} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="timestamp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" value={toLocalInput(field.value)} onChange={(e) => field.onChange(fromLocalInput(e.target.value))} />
                </FormControl>
                <FormDescription>Adjust if logging after the fact.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="functionHypothesis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Function (hypothesis)</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select function" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="escape">Escape</SelectItem>
                    <SelectItem value="attention">Attention</SelectItem>
                    <SelectItem value="tangible">Tangible</SelectItem>
                    <SelectItem value="sensory">Sensory</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="behaviorText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Behavior (topography)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., yelling, hitting, throwing objects" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="intensity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intensity: {field.value}</FormLabel>
                <FormControl>
                  <Slider min={1} max={5} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                </FormControl>
                <FormDescription>1=low, 5=high</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationSec"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (sec)</FormLabel>
                <FormControl>
                  <Input inputMode="numeric" placeholder="0" value={field.value ?? ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="latencySec"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latency (sec)</FormLabel>
                <FormControl>
                  <Input inputMode="numeric" placeholder="0" value={field.value ?? ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="locationText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., kitchen, school bus" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Antecedents, consequences, interventions, context..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
        </div>
      </form>
    </Form>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInput(local: string) {
  const d = new Date(local);
  const off = d.getTimezoneOffset();
  const utc = new Date(d.getTime() + off * 60_000);
  return utc.toISOString();
}
