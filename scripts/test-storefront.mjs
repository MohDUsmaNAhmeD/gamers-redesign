import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium, expect } from "@playwright/test";
try {
  process.loadEnvFile(".env");
} catch {}
const api = {};
for (const name of ["catalog", "cart", "orders", "newsletter"])
  api[name] = (await import("../api/" + name + ".js")).default;
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) {
      const handler = api[url.pathname.split("/")[2]];
      if (!handler) {
        res.writeHead(404);
        res.end();
        return;
      }
      req.query = Object.fromEntries(url.searchParams);
      let body = "";
      for await (const chunk of req) body += chunk;
      req.body = body ? JSON.parse(body) : {};
      res.status = (n) => {
        res.statusCode = n;
        return res;
      };
      res.json = (v) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(v));
        return res;
      };
      await handler(req, res);
      return;
    }
    const target = path.join(
      process.cwd(),
      "dist",
      url.pathname === "/" ? "index.html" : url.pathname,
    );
    let file;
    try {
      file = await fs.readFile(target);
    } catch {
      file = await fs.readFile("dist/index.html");
      res.setHeader("Content-Type", "text/html");
    }
    if (!res.hasHeader("Content-Type"))
      res.setHeader(
        "Content-Type",
        mime[path.extname(target)] || "application/octet-stream",
      );
    res.end(file);
  } catch (e) {
    console.error("TEST SERVER ERROR", e.message);
    res.writeHead(500);
    res.end("Test server error");
  }
});
await new Promise((resolve) => server.listen(4175, "127.0.0.1", resolve));
let browser;
const testCartIds = [];
try {
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
  });
  const errors = [];
  page.on("pageerror", (error) => {
    errors.push(error.message);
    console.log("BROWSER ERROR:", error.message);
  });
  await page.goto("http://127.0.0.1:4175", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(4800);
  await page
    .locator(".chest-intro")
    .waitFor({ state: "detached", timeout: 12000 });
  await page.locator(".product-card").first().waitFor({ timeout: 30000 });
  await page.screenshot({ path: "/tmp/nexus-desktop.png", fullPage: true });
  console.log(
    "Home: products",
    await page.locator(".product-card").count(),
    "categories",
    await page.locator(".category-card").count(),
  );
  console.log(
    "Desktop horizontal overflow",
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  );
  await page
    .getByRole("button", {
      name: "Add PlayStation 5 Slim to cart",
      exact: true,
    })
    .click();
  await page.waitForResponse(
    (r) => r.url().includes("/api/cart?id=") && r.request().method() === "GET",
  );
  const cartId = await page.evaluate(() => localStorage.getItem("nexus_cart"));
  testCartIds.push(cartId);
  await page
    .getByRole("button", { name: "Open cart, 1 items", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Increase quantity of PlayStation 5 Slim",
      exact: true,
    })
    .click();
  await page.waitForResponse(
    (r) => r.url().includes("/api/cart?id=") && r.request().method() === "GET",
  );
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Open cart, 2 items", exact: true })
    .waitFor();
  console.log("Cart addition, quantity, persistence: PASS");
  await page
    .getByRole("button", {
      name: "Save DualSense Wireless Controller",
      exact: true,
    })
    .click();
  await page.waitForResponse(
    (r) => r.url().includes("/api/cart?id=") && r.request().method() === "GET",
  );
  await page
    .getByRole("button", { name: "Wishlist, 1 items", exact: true })
    .click();
  await page.locator(".saved-grid .product-card").waitFor();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  console.log("Wishlist: PASS");
  await page.getByRole("button", { name: "Find your next upgrade" }).click();
  await page
    .getByRole("textbox", { name: "Search all products" })
    .fill("Razer");
  await page.locator(".search-result").waitFor();
  console.log(
    "Instant search count",
    await page.locator(".search-result").count(),
  );
  await page.locator(".search-result").click();
  await page.locator(".detail-info h1").waitFor();
  await page
    .getByRole("button", { name: "Specifications", exact: true })
    .click();
  await page.locator(".spec-grid").waitFor();
  await page
    .getByRole("button", { name: "View product image 2", exact: true })
    .click();
  await page.screenshot({ path: "/tmp/nexus-product.png", fullPage: true });
  console.log("Product gallery and specifications: PASS");
  await page.goto("http://127.0.0.1:4175/shop", { waitUntil: "networkidle" });
  await page
    .locator(".category-filter")
    .filter({ hasText: "Headsets" })
    .click();
  await page.waitForTimeout(250);
  console.log(
    "Headset filter count",
    await page.locator(".catalog-grid .product-card").count(),
  );
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator('.catalog-grid .product-card')).toHaveCount(8);
  await page
    .getByRole("combobox", { name: "Sort products" })
    .selectOption("price-low");
  await expect(page.locator('.catalog-grid .product-name').first()).toHaveText('NEXUS Charging Station');
  console.log(
    "Lowest price first:",
    await page.locator(".catalog-grid .product-name").first().textContent(),
  );
  await page
    .getByRole("button", { name: "Open cart, 2 items", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Decrease quantity of PlayStation 5 Slim",
      exact: true,
    })
    .click();
  await page.waitForResponse(
    (r) => r.url().includes("/api/cart?id=") && r.request().method() === "GET",
  );
  await page
    .getByRole("button", { name: "Continue to checkout", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Full name", exact: true })
    .fill("NEXUS Test");
  await page
    .getByRole("dialog")
    .getByRole("textbox", { name: "Email address", exact: true })
    .fill("nexus-test@example.com");
  await page
    .getByRole("textbox", { name: "Delivery address", exact: true })
    .fill("123 Test Street, Test City, 00000, Demo");
  await page
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  await page.locator(".order-success").waitFor({ timeout: 30000 });
  console.log(
    "Checkout success",
    await page.locator(".order-number").textContent(),
  );
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page
    .getByRole("button", { name: "Open cart, 0 items", exact: true })
    .waitFor();
  await page.goto("http://127.0.0.1:4175", { waitUntil: "networkidle" });
  await page
    .getByRole("textbox", { name: "Email address", exact: true })
    .fill("nexus-test@example.com");
  await page
    .getByRole("button", { name: "Subscribe to newsletter", exact: true })
    .click();
  await page.waitForResponse(
    (r) =>
      r.url().includes("/api/newsletter?email=") &&
      r.request().method() === "GET",
  );
  console.log("Newsletter: PASS");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4175", { waitUntil: "networkidle" });
  await page.screenshot({ path: "/tmp/nexus-mobile.png", fullPage: true });
  console.log(
    "Mobile horizontal overflow",
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  );
  await page
    .getByRole("button", { name: "Toggle mobile navigation", exact: true })
    .click();
  await page
    .locator(".mobile-nav")
    .getByRole("link", { name: "Headsets", exact: true })
    .click();
  await page.locator(".catalog-grid .product-card").waitFor();
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.locator(".filters-open").waitFor();
  await page.screenshot({
    path: "/tmp/nexus-mobile-filters.png",
    fullPage: true,
  });
  console.log("Mobile navigation and filters: PASS");
  await page.goto('http://127.0.0.1:4175', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('button', { name: 'Show console collection', exact: true }).click();
  await expect(page.locator('.hero h1')).toContainText('A NEW ERA.');
  await page.getByRole('button', { name: 'Show headset collection', exact: true }).click();
  await expect(page.locator('.hero h1')).toContainText('SOUND ON.');
  await page.getByRole('button', { name: 'Show setup collection', exact: true }).click();
  console.log('Hero collections: PASS');
  await page.setViewportSize({ width: 960, height: 740 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('button', { name: 'Replay the experience', exact: true }).click();
  await page.locator('.intro-canvas canvas').waitFor();
  await page.mouse.wheel(0, -30);
  await page.waitForTimeout(1600);
  await page.mouse.wheel(0, 380);
  await page.waitForTimeout(1300);
  const open = Number(await page.locator('.intro-canvas').getAttribute('data-progress'));
  await page.screenshot({ path: '/tmp/nexus-chest.png' });
  await page.mouse.wheel(0, -270);
  await page.waitForTimeout(1000);
  const closed = Number(await page.locator('.intro-canvas').getAttribute('data-progress'));
  expect(closed).toBeLessThan(open);
  console.log('3D chest scroll reversal: PASS', { open, closed });
  await page.getByRole('button', { name: 'Skip intro', exact: true }).click();
  await page.locator('.chest-intro').waitFor({ state: 'detached' });
  await page.mouse.wheel(0, -230);
  await page.locator('.chest-intro').waitFor();
  console.log('Upward scroll reconnects chest: PASS');
  await page.getByRole('button', { name: 'Skip intro', exact: true }).click();
  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto('http://127.0.0.1:4175', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await reducedPage.locator('.hero').waitFor();
  await expect(reducedPage.locator('.chest-intro')).toHaveCount(0);
  await reduced.close();
  console.log('Reduced motion: PASS');
  expect(errors).toEqual([]);
  console.log("Browser errors:", JSON.stringify(errors));
} finally {
  if (browser) await browser.close();
  const supabase = (await import("../api/db-client.js")).default;
  for (const id of testCartIds) {
    await supabase.from("nexus_orders").delete().eq("cart_id", id);
    await supabase.from("nexus_carts").delete().eq("id", id);
  }
  await supabase
    .from("nexus_subscribers")
    .delete()
    .eq("email", "nexus-test@example.com");
  await new Promise((resolve) => server.close(resolve));
}
