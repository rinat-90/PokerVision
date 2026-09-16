export function distributePot(
  payouts: Record<string, number>,
  potAmount: number,
  winnerIds: string[]
): void {
  if (winnerIds.length === 0) {
    throw new Error(
      "Cannot distribute pot without winners"
    );
  }

  const share =
    Math.floor(
      potAmount / winnerIds.length
    );

  const remainder =
    potAmount % winnerIds.length;

  for (
    let index = 0;
    index < winnerIds.length;
    index++
  ) {
    const winnerId =
      winnerIds[index];

    if (winnerId === undefined) {
      continue;
    }

    const payout =
      share +
      (index < remainder ? 1 : 0);

    payouts[winnerId] =
      (payouts[winnerId] ?? 0) +
      payout;
  }
}