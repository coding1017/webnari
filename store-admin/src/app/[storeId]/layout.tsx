import StoreShell from "@/components/StoreShell";
import { CommerceClient } from "@/lib/commerce";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  let storeName = storeId;
  try {
    const res = await fetch(`https://webnari.io/commerce/api/store/config`, {
      headers: { 'X-Store-ID': storeId },
      cache: 'no-store',
    });
    if (res.ok) {
      const config = await res.json();
      storeName = config.name || storeId;
    }
  } catch {
    // Use storeId as fallback
  }

  return (
    <StoreShell storeId={storeId} storeName={storeName}>
      {children}
    </StoreShell>
  );
}
