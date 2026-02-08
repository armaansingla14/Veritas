import "dotenv/config";
import fs from "fs";
import path from "path";

// Pages to scrape from City of Kingston
const KINGSTON_PAGES = [
  {
    url: "https://www.cityofkingston.ca/residents/waste-disposal",
    filename: "waste-collection.md",
    category: "waste",
    title: "Waste Collection - City of Kingston",
  },
  {
    url: "https://www.cityofkingston.ca/residents/parking",
    filename: "parking-bylaws.md",
    category: "parking",
    title: "Parking Information - City of Kingston",
  },
  {
    url: "https://www.cityofkingston.ca/residents/recreation",
    filename: "recreation-programs.md",
    category: "recreation",
    title: "Recreation Programs - City of Kingston",
  },
  {
    url: "https://www.cityofkingston.ca/city-hall/bylaws/noise",
    filename: "noise-bylaws.md",
    category: "bylaws",
    title: "Noise Bylaws - City of Kingston",
  },
  {
    url: "https://www.cityofkingston.ca/residents/report-an-issue",
    filename: "report-issues.md",
    category: "services",
    title: "Report an Issue - City of Kingston",
  },
  {
    url: "https://www.cityofkingston.ca/residents/city-services",
    filename: "city-services-faq.md",
    category: "services",
    title: "City Services FAQ - City of Kingston",
  },
  {
    url: "https://www.cityofkingston.ca/city-hall/bylaws",
    filename: "bylaws-overview.md",
    category: "bylaws",
    title: "Bylaws Overview - City of Kingston",
  },
  {
    url: "https://www.cityofkingston.ca/open-data",
    filename: "open-data.md",
    category: "data",
    title: "Open Data Portal - City of Kingston",
  },
];

// Simple HTML to text extraction (no external dependencies)
function extractTextFromHtml(html: string): string {
  // Remove scripts and styles
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");

  // Convert common elements to markdown
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n");
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n");
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n");
  text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n#### $1\n");
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "\n$1\n");
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");

  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&rsquo;/g, "'");
  text = text.replace(/&lsquo;/g, "'");
  text = text.replace(/&rdquo;/g, '"');
  text = text.replace(/&ldquo;/g, '"');
  text = text.replace(/&mdash;/g, "—");
  text = text.replace(/&ndash;/g, "–");

  // Clean up whitespace
  text = text.replace(/\n\s*\n\s*\n/g, "\n\n");
  text = text.replace(/[ \t]+/g, " ");

  return text.trim();
}

// Extract main content area from HTML
function extractMainContent(html: string): string {
  // Try to find main content containers
  const mainPatterns = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="content"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of mainPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fall back to body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

async function scrapePage(
  url: string,
  title: string
): Promise<string | null> {
  console.log(`  Fetching: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; VeritasBot/1.0; +https://veritas.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      console.error(`  Failed to fetch: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const mainContent = extractMainContent(html);
    let text = extractTextFromHtml(mainContent);

    // Add title if not present
    if (!text.startsWith("#")) {
      text = `# ${title}\n\n${text}`;
    }

    // Add source URL at the end
    text += `\n\n---\nSource: ${url}`;

    return text;
  } catch (error) {
    console.error(`  Error fetching ${url}:`, error);
    return null;
  }
}

async function scrapeKingston() {
  console.log("Kingston Data Scraper\n");
  console.log("=".repeat(50));
  console.log("Scraping City of Kingston website for real data...\n");

  const outputDir = path.join(process.cwd(), "src/data/documents");

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let successCount = 0;
  let failCount = 0;

  for (const page of KINGSTON_PAGES) {
    console.log(`\nProcessing: ${page.title}`);

    const content = await scrapePage(page.url, page.title);

    if (content) {
      const filepath = path.join(outputDir, page.filename);
      fs.writeFileSync(filepath, content, "utf-8");
      console.log(`  Saved: ${page.filename} (${content.length} chars)`);
      successCount++;
    } else {
      console.log(`  Skipped: ${page.filename} (fetch failed)`);
      failCount++;
    }

    // Be nice to the server
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n" + "=".repeat(50));
  console.log(`Scraping complete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`\nNext step: Run 'npx tsx scripts/seed-documents.ts' to regenerate embeddings`);
}

// Additional scraper for 211 Ontario (community services)
async function scrape211Ontario() {
  console.log("\nScraping 211 Ontario for Kingston services...");

  const url = "https://211ontario.ca/211-topics/";
  const content = await scrapePage(url, "Community Services - 211 Ontario");

  if (content) {
    const filepath = path.join(
      process.cwd(),
      "src/data/documents",
      "community-services-211.md"
    );
    fs.writeFileSync(filepath, content, "utf-8");
    console.log(`  Saved: community-services-211.md`);
  }
}

// Run the scraper
async function main() {
  await scrapeKingston();
  await scrape211Ontario();
}

main().catch(console.error);
