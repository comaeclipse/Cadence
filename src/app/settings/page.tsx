import Link from "next/link";
import { MobileLayout } from "@/components/mobile-layout";
import { ChevronRight } from "lucide-react";

export default function SettingsPage() {
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

          <div className="flex items-center justify-between p-4 active:bg-stone-100">
            <div>
              <h3 className="font-semibold text-gray-900">Export Data</h3>
              <p className="text-xs text-gray-600 mt-1">Coming soon</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Data Storage Info */}
        <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Data Storage</h3>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Local-First
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            All behavioral data is stored securely on your device using IndexedDB. No data is sent to external servers.
          </p>
          <div className="border-t border-stone-200 pt-3">
            <h4 className="font-medium text-sm text-gray-900 mb-2">Coming Soon:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                Cloud backup and sync
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                Export data to CSV/PDF
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                Theme customization
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                Notification preferences
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

