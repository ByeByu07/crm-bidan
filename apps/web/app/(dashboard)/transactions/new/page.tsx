"use client";

import { useRouter } from "next/navigation";
import { TransactionForm } from "@/components/dashboard/TransactionForm";
import { useDrugs } from "@/hooks/use-drugs";
import { usePatients } from "@/hooks/use-patients";
import { useCreateTransaction } from "@/hooks/use-create-transaction";
import { toast } from "sonner";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function NewTransactionPage() {
  const router = useRouter();
  const { data: drugsData, isLoading: drugsLoading } = useDrugs();
  const { data: patientsData, isLoading: patientsLoading } = usePatients();
  const createTransaction = useCreateTransaction();

  function handleSubmit(data: Parameters<typeof createTransaction.mutate>[0]) {
    createTransaction.mutate(data, {
      onSuccess: () => {
        toast.success("Transaksi berhasil disimpan");
        router.push("/sales");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  }

  const isLoading = drugsLoading || patientsLoading;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Transaksi Baru</h1>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-32" />
          <Skeleton className="h-10" />
        </div>
      ) : (
        <TransactionForm
          patients={patientsData?.patients ?? []}
          drugs={drugsData?.drugs ?? []}
          onSubmit={handleSubmit}
          isSubmitting={createTransaction.isPending}
        />
      )}
    </div>
  );
}
