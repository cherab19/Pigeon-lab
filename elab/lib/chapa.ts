import { prisma } from "@/lib/prisma";

export async function applySeatTopup(txRef: string) {
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.paymentTransaction.findUnique({
      where: { txRef }
    });

    if (!transaction) {
      return { success: false, error: "transaction_not_found" };
    }

    if (transaction.appliedAt) {
      return { success: true, already_applied: true };
    }

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    // Update subscription seats
    await tx.schoolSubscription.update({
      where: { schoolId: transaction.schoolId },
      data: {
        teacherSeats: { increment: transaction.teacherSeats },
        studentSeats: { increment: transaction.studentSeats },
        status: "active",
        activatedAt: { set: new Date() },
        currentPeriodStart: { set: currentPeriodStart },
        currentPeriodEnd: { set: currentPeriodEnd },
      }
    });

    // Mark transaction as successful
    await tx.paymentTransaction.update({
      where: { txRef },
      data: {
        status: "success",
        appliedAt: new Date(),
      }
    });

    return { success: true, school_id: transaction.schoolId };
  });
}
