export default async function run(page, ui) {
  const ACCESS = "eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJBVVRIU0VSVklDRSIsInN1YiI6InRlc3R1c2VyMjAyNkBleGFtcGxlLmNvbSIsImp0aSI6IjA4ZWRmODUyLWI0NjYtNGQ5Ny05MjRjLTVmY2NhOTZhODY5YiIsInR5cGUiOiJhY2Nlc3MiLCJ1c2VySWQiOjQsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzg2MDM0MjM5LCJleHAiOjE3ODYwMzUxMzl9.ggkjoyp5LN4caaXNU9_22gbA0xVep3hRUB_REAOeo2AkhOKvRc7SU28oyerJSWJZ-nPc0Ruc6Ue_PrhDm0YS6g";
  const REFRESH = "eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJBVVRIU0VSVklDRSIsInN1YiI6InRlc3R1c2VyMjAyNkBleGFtcGxlLmNvbSIsImp0aSI6IjI2MDNhMjEwLTA1OTgtNGNhOC04OWYzLTcwZTlkYmRiMDcxNyIsInR5cGUiOiJyZWZyZXNoIiwidXNlcklkIjo0LCJpYXQiOjE3ODYwMzQyMzksImV4cCI6MTc4NjYzOTAzOX0.e7y40ojp5p7rkeD2SklQWoXNSa4okDC1IpMfsbHsoUxyy60vy3msmVT2QNv6zxWIFA9nUJmMnqqDRA2pxHfQlg";
  const state = {
    user: { id: 4, uuid: "6b211f77-f727-4ea4-8eb6-b853c0ec26ae", name: "Test User", email: "testuser2026@example.com", role: "USER", provider: "LOCAL" },
    accessToken: ACCESS,
    refreshToken: REFRESH,
    isAuthenticated: true,
  };

  await page.goto("http://localhost:5173/");
  await page.evaluate((s) => { localStorage.setItem("cloudstore-auth", JSON.stringify({ state: s, version: 0 })); }, state);
  await page.goto("http://localhost:5173/drive");
  await page.waitForTimeout(2500);

  // Find the card containing heading "go.png", click its 3-dot menu button
  const heading = page.getByRole("heading", { name: "go.png" }).first();
  const card = heading.locator("xpath=ancestor::div[contains(@class,'group')][1]");
  const menuBtn = card.locator("button").first();
  await menuBtn.click();
  await page.waitForTimeout(800);

  const menu = await ui.snapshot();
  const analyzeItem = menu.match(/@(e\d+) menuitem "Analyze with AI"/)?.[1];
  if (!analyzeItem) return { error: "no Analyze menu item", menu: menu.slice(0, 1500) };

  await ui.click(analyzeItem);
  await page.waitForTimeout(1000);
  const mid = await ui.snapshot();
  const analyzing = mid.match(/Analyzing/)?.[0] ?? "no 'Analyzing' indicator";

  // Wait for dialog (AI Analysis) to appear (max ~70s)
  let dialogFound = false;
  let final = "";
  try {
    await page.waitForSelector("h2:has-text('AI Analysis'), [role=dialog]", { timeout: 70000 });
    dialogFound = true;
  } catch (e) { /* timeout */ }

  await page.waitForTimeout(1500);
  if (dialogFound) {
    final = await ui.snapshot({ full: true });
  } else {
    final = await ui.snapshot();
  }

  return { analyzing, dialogFound, final: final.slice(0, 3500) };
}
