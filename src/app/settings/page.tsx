"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { ChevronRight, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function SettingsPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password) return;
    setIsDeleting(true);

    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete account.");
        return;
      }

      await logout();
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
      setDialogOpen(false);
      setPassword("");
    }
  };

  return (
    <MobileLayout title="Settings" subtitle="Configure your preferences">
      <div className="p-4 space-y-4">

        {/* Settings Menu */}
        <div className="bg-stone-50 rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <Link href="/children" className="flex items-center justify-between p-4 border-b border-stone-200 active:bg-stone-100">
            <div>
              <h3 className="font-semibold text-gray-900">Manage Children</h3>
              <p className="text-xs text-gray-600 mt-1">Add or edit child profiles</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link href="/catalogs" className="flex items-center justify-between p-4 border-b border-stone-200 active:bg-stone-100">
            <div>
              <h3 className="font-semibold text-gray-900">Behavior Catalogs</h3>
              <p className="text-xs text-gray-600 mt-1">Manage behavior definitions</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link href="/reports/export" className="flex items-center justify-between p-4 active:bg-stone-100">
            <div>
              <h3 className="font-semibold text-gray-900">Export Data</h3>
              <p className="text-xs text-gray-600 mt-1">Generate and print incident reports</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>

        {/* Data & Privacy */}
        <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Data &amp; Privacy</h3>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Encrypted
            </span>
          </div>
          <p className="text-sm text-gray-600">
            All data is stored in a secure cloud database. Sensitive fields are
            encrypted at rest with AES-256-GCM. No data is shared with third
            parties.{" "}
            <Link href="/privacy" className="text-emerald-700 underline">
              Privacy policy
            </Link>
          </p>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-200">
          <h3 className="font-semibold text-red-800 mb-1">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">
            Permanently delete your account and all associated data. This cannot
            be undone.
          </p>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setPassword(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all logged data —
              child profiles, incidents, food logs, and health logs. Enter your
              password to confirm.
            </DialogDescription>
          </DialogHeader>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            autoComplete="current-password"
          />
          <DialogFooter>
            <button
              onClick={() => { setDialogOpen(false); setPassword(""); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={!password || isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition"
            >
              {isDeleting ? "Deleting…" : "Delete Forever"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
