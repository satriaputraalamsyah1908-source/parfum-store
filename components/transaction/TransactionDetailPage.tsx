import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTransactionDetail } from "@/lib/transactions";
import PageHeader from "@/components/ui/PageHeader";
import Receipt from "@/components/receipt/Receipt";
import ReceiptActions from "@/components/receipt/ReceiptActions";
import type { PaymentMethodKey } from "@/lib/payments";

export default async function TransactionDetailPage({ id, area }: { id: string; area: "admin" | "kasir" }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const tx = await getTransactionDetail(numId);
  if (!tx) notFound();

  // Kasir hanya boleh melihat transaksi miliknya
  if (session.user.role !== "ADMIN" && tx.userId !== Number(session.user.id)) {
    redirect("/akses-ditolak");
  }

  return (
    <>
      <div className="print:hidden">
        <PageHeader title="Struk Transaksi" description={tx.invoiceNumber} />
      </div>
      <ReceiptActions backHref={`/${area}/transactions`} />
      <Receipt
        data={{
          invoiceNumber: tx.invoiceNumber,
          createdAt: tx.createdAt,
          cashier: tx.user.name,
          member: tx.member?.name ?? null,
          items: tx.details.map((d) => ({
            name: `${d.product.brand} ${d.product.name}`,
            size: d.product.size,
            quantity: d.quantity,
            price: d.price,
            subtotal: d.subtotal,
          })),
          subtotal: tx.subtotal,
          discount: tx.discount,
          total: tx.total,
          paymentMethod: tx.paymentMethod as PaymentMethodKey,
          paymentProvider: tx.paymentProvider,
          reference: tx.payment?.reference ?? null,
          paymentAmount: tx.paymentAmount,
          changeAmount: tx.changeAmount,
        }}
      />
    </>
  );
}
