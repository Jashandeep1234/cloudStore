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
  await page.evaluate((s) => {
    localStorage.setItem("cloudstore-auth", JSON.stringify({ state: s, version: 0 }));
  }, state);

  await page.goto("http://localhost:5173/drive");
  await page.waitForTimeout(2500);

  const full = await ui.snapshot({ full: true });
  return { full: full.slice(0, 4000) };
}
