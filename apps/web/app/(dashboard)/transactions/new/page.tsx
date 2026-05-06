"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TransactionForm } from "@/components/dashboard/TransactionForm";
import { useDrugs } from "@/hooks/use-drugs";
import { usePatients } from "@/hooks/use-patients";
import { useConditions } from "@/hooks/use-conditions";
import { useCreateTransaction } from "@/hooks/use-create-transaction";
import { useSetOutcome } from "@/hooks/use-set-outcome";
import { AvatarButton } from "@/components/dashboard/AvatarButton";
import { toast } from "sonner";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function NewTransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patient_id");
  const notificationId = searchParams.get("notification_id");

  const { data: drugsData, isLoading: drugsLoading } = useDrugs();
  const { data: patientsData, isLoading: patientsLoading } = usePatients();
  const { data: conditionsData, isLoading: conditionsLoading } = useConditions();
  const createTransaction = useCreateTransaction();
  const setOutcome = useSetOutcome();

  function handleSubmit(data: Parameters<typeof createTransaction.mutate>[0]) {
    createTransaction.mutate(data, {
      onSuccess: () => {
        if (notificationId) {
          setOutcome.mutate(
            { id: notificationId, outcome: "bought" },
            {
              onSuccess: () => {
                toast.success("Transaksi tersimpan dan notifikasi selesai");
                router.push("/sales");
              },
              onError: () => {
                toast.success("Transaksi tersimpan");
                toast.error("Gagal menutup notifikasi");
                router.push("/sales");
              },
            }
          );
        } else {
          toast.success("Transaksi berhasil disimpan");
          router.push("/sales");
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  }

  const isLoading = drugsLoading || patientsLoading || conditionsLoading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Transaksi Baru</h1>
        <AvatarButton />
      </div>
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
          conditions={conditionsData?.conditions ?? []}
          preselectedPatientId={patientId ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={createTransaction.isPending || setOutcome.isPending}
        />
      )}
    </div>
  );
}
