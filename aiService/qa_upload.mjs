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

  const snap = await ui.snapshot();
  const uploadBtn = snap.match(/@(e\d+) button "Upload"/)?.[1];
  if (!uploadBtn) return { error: "no upload button", snap: snap.slice(0, 1200) };
  await ui.click(uploadBtn);
  await page.waitForTimeout(1200);

  const dlg = await ui.snapshot();
  const fileInput = page.locator('input[type=file]');
  const inputCount = await fileInput.count();
  if (inputCount === 0) return { error: "no file input in dialog", dlg: dlg.slice(0, 1500) };

  await fileInput.first().setInputFiles("C:/Users/Asus/AppData/Local/Temp/opencode/test_doc.txt");
  await page.waitForTimeout(800);

  const dlg2 = await ui.snapshot();
  const startBtn = dlg2.match(/@(e\d+) button "Start Upload"/)?.[1];
  if (!startBtn) return { error: "no start upload button", dlg2: dlg2.slice(0, 1500) };
  await ui.click(startBtn);

  // Wait for dialog to close (success) or an error toast
  await page.waitForTimeout(6000);

  const after = await ui.snapshot();
  const toastText = await page.evaluate(() => {
    const toasts = [...document.querySelectorAll('[data-sonner-toast], [role=status]')].map(t => t.textContent);
    return toasts;
  });

  return { success: !after.includes("Start Upload"), toastText, after: after.slice(0, 1200) };
}
