export async function triggerCloudflareDeploy(
  deployHook: string,
): Promise<void> {
  const response = await fetch(deployHook, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Cloudflare Deploy Hook returned ${response.status}`);
  }
}
