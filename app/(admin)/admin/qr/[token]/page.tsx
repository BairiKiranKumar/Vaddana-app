import { QrSheet } from "@/components/ops/qr-sheet";

export default async function QrPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <QrSheet token={token} />;
}
