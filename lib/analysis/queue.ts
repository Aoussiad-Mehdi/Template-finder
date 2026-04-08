const running = new Set<string>();

export async function runJob(id: string, work: () => Promise<void>) {
  if (running.has(id)) return;
  running.add(id);
  try {
    await work();
  } finally {
    running.delete(id);
  }
}
