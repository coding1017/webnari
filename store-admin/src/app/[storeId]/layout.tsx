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
    const client = new CommerceClient(storeId);
    const config = await client.getStoreConfig();
    storeName = config.name || storeId;
  } catch {
    // Use storeId as fallback
  }

  return (
    <StoreShell storeId={storeId} storeName={storeName}>
      {children}
    </StoreShell>
  );
}
