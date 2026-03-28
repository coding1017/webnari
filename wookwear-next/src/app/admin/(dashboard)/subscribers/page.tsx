import { createAdminClient } from "@/lib/supabase/admin";
import { EmptyState } from "@/components/admin/ui/EmptyState";

async function getSubscribers() {
  const supabase = createAdminClient();
  const { data } = (await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false })) as { data: any[] | null };
  return data ?? [];
}

export default async function AdminSubscribersPage() {
  const subscribers = await getSubscribers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-head text-2xl font-bold text-ww-white">Subscribers</h1>
          <p className="text-sm text-ww-muted mt-0.5">{subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}</p>
        </div>
        {subscribers.length > 0 && (
          <a
            href="/admin/api/export-subscribers"
            className="px-4 py-2 border border-ww-border text-ww-text hover:text-ww-white text-sm font-medium rounded-lg transition-colors"
          >
            Export CSV
          </a>
        )}
      </div>

      {subscribers.length === 0 ? (
        <EmptyState
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
          title="No subscribers yet"
          description="Newsletter subscribers will appear here as they sign up."
        />
      ) : (
        <div className="bg-ww-dark border border-ww-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ww-border">
                <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Email</th>
                <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-ww-muted uppercase px-4 py-3">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub: any) => (
                <tr key={sub.id} className="border-b border-ww-border/50 last:border-0 hover:bg-ww-surface/30">
                  <td className="px-4 py-3 text-sm text-ww-white">{sub.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${sub.unsubscribed_at ? "text-red-400" : "text-green-400"}`}>
                      {sub.unsubscribed_at ? "Unsubscribed" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ww-muted text-right">
                    {new Date(sub.subscribed_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
