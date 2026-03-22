import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
            record_video_dir="/tmp/file_attachments/video"
        )
        page = context.new_page()

        print("Navigating to homepage...")
        page.goto("http://localhost:3000")
        page.wait_for_timeout(2000)

        # Take a screenshot of the hero section
        page.screenshot(path="/tmp/file_attachments/hero.png")
        print("Hero screenshot saved.")

        # Scroll down to features section
        page.evaluate("window.scrollBy(0, 800)")
        page.wait_for_timeout(1000)
        page.screenshot(path="/tmp/file_attachments/features.png")
        print("Features screenshot saved.")

        # Scroll to how-it-works
        page.evaluate("window.scrollBy(0, 800)")
        page.wait_for_timeout(1000)
        page.screenshot(path="/tmp/file_attachments/how_it_works.png")
        print("How it works screenshot saved.")

        # Scroll to pricing
        page.evaluate("window.scrollBy(0, 800)")
        page.wait_for_timeout(1000)
        page.screenshot(path="/tmp/file_attachments/pricing.png")
        print("Pricing screenshot saved.")

        page.wait_for_timeout(1000)

        context.close()
        browser.close()
        print("Verification script finished.")

if __name__ == "__main__":
    run()
