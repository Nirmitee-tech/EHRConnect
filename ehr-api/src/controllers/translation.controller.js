const path = require('path');
const fs = require('fs').promises;

class TranslationController {
    async getTranslations(req, res) {
        try {
            const { lng, ns } = req.params;
            // Prevent directory traversal
            if (lng.includes('..') || ns.includes('..')) {
                return res.status(400).json({ error: 'Invalid path' });
            }

            const filePath = path.join(__dirname, '../data/locales', lng, `${ns}.json`);

            try {
                const data = await fs.readFile(filePath, 'utf8');
                res.json(JSON.parse(data));
            } catch (err) {
                if (err.code === 'ENOENT') {
                    // Return empty object if file not found, to avoid frontend errors
                    res.json({});
                } else {
                    throw err;
                }
            }
        } catch (error) {
            console.error('Get translations error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new TranslationController();
