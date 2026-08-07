const fs = require('fs');
const path = require('path');

const DATASET_DIR = 'C:\\Users\\Admin\\Desktop\\YCCE\\DATASET';
const FALLBACK_DATASET_DIR = path.resolve(__dirname, '..', '..', 'datasetss');
const OUTPUT_FILE = path.resolve(__dirname, '..', 'categories.json');

const CATEGORY_PRESETS = {
    'abandoned-vehicles': { id: 'abandoned-vehicles', title: 'Abandoned Vehicles' },
    'alley-lights-out': { id: 'alley-lights-out', title: 'Alley Lights Out' },
    'garbage-carts': { id: 'garbage-carts', title: 'Garbage Carts' },
    'graffiti-removal': { id: 'graffiti-removal', title: 'Graffiti Removal' },
    'pot-holes-reported': { id: 'pot-holes', title: 'Potholes & Road Damage' },
    'rodent-baiting': { id: 'rodent-baiting', title: 'Rodent Baiting' },
    'sanitation-code-complaints': { id: 'sanitation-code-complaints', title: 'Sanitation Code Complaints' },
    'street-lights-all-out': { id: 'street-lights-all-out', title: 'Street Lights All Out' },
    'street-lights-one-out': { id: 'street-lights-one-out', title: 'Street Lights One Out' },
    'tree-debris': { id: 'tree-debris', title: 'Tree Debris' },
    'tree-trims': { id: 'tree-trims', title: 'Tree Trims' },
    'vacant-and-abandoned-buildings-reported': {
        id: 'vacant-and-abandoned-buildings',
        title: 'Vacant & Abandoned Buildings'
    }
};

function main() {
    const sourceDir = pickSourceDirectory();
    const csvFiles = fs
        .readdirSync(sourceDir)
        .filter((file) => /^311-service-requests-.*\.csv$/i.test(file))
        .sort((a, b) => a.localeCompare(b));

    const categories = csvFiles.map((file) => buildCategoryEntry(sourceDir, file));

    fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(categories, null, 2)}\n`, 'utf8');
    console.log(`Wrote ${categories.length} categories to ${OUTPUT_FILE}`);
}

function pickSourceDirectory() {
    if (fs.existsSync(DATASET_DIR)) {
        return DATASET_DIR;
    }

    if (fs.existsSync(FALLBACK_DATASET_DIR)) {
        return FALLBACK_DATASET_DIR;
    }

    throw new Error(`Dataset directory not found. Checked ${DATASET_DIR} and ${FALLBACK_DATASET_DIR}.`);
}

function buildCategoryEntry(sourceDir, csvFile) {
    const slug = csvFile.replace(/^311-service-requests-/i, '').replace(/\.csv$/i, '');
    const preset = CATEGORY_PRESETS[slug] || {};
    const metadata = readMetadata(sourceDir, slug);
    const title = preset.title || titleFromSlug(slug);
    const description = buildDescription(metadata, title, csvFile);

    return {
        id: preset.id || slug,
        title,
        sourceFile: csvFile,
        department: 'Nagpur Municipal Corporation',
        description
    };
}

function readMetadata(sourceDir, slug) {
    const metadataPath = path.join(sourceDir, `socrata_metadata_311-service-requests-${slug}.json`);
    if (!fs.existsSync(metadataPath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    } catch (error) {
        console.warn(`Skipping unreadable metadata file: ${metadataPath}`);
        return null;
    }
}

function buildDescription(metadata, title, csvFile) {
    const baseSummary = extractSummary(metadata);
    if (baseSummary) {
        return `${baseSummary} Source dataset: ${csvFile}.`;
    }

    return `${title} requests derived from ${csvFile}.`;
}

function extractSummary(metadata) {
    if (!metadata || typeof metadata.description !== 'string') {
        return '';
    }

    const firstParagraph = metadata.description
        .split(/\n\s*\n/)
        .map((part) => part.trim())
        .find(Boolean);

    if (!firstParagraph) {
        return '';
    }

    const match = firstParagraph.match(/^.*?[.!?](?:\s|$)/);
    return (match ? match[0] : firstParagraph).trim();
}

function titleFromSlug(slug) {
    return slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());
}

main();
