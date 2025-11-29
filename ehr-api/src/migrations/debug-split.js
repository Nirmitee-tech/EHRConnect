const fs = require('fs');
const path = require('path');

/**
 * Debug script to test SQL splitting
 */
function splitSQLStatements(sql) {
    const statements = [];
    let current = '';
    let inFunction = false;
    let dollarQuoteTag = null;
    let parenDepth = 0;

    const lines = sql.split('\n');

    for (let line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and comments at the start of a statement
        if (!current && (trimmed === '' || trimmed.startsWith('--'))) {
            continue;
        }

        // Check for dollar-quoted strings (used in functions)
        const dollarMatches = line.match(/\$([a-zA-Z_]*)\$/g);
        if (dollarMatches) {
            for (const match of dollarMatches) {
                if (!dollarQuoteTag) {
                    dollarQuoteTag = match;
                    inFunction = true;
                } else if (match === dollarQuoteTag) {
                    dollarQuoteTag = null;
                    inFunction = false;
                }
            }
        }

        // Track parentheses depth (only when not in a function)
        if (!inFunction) {
            for (const char of line) {
                if (char === '(') parenDepth++;
                if (char === ')') parenDepth--;
            }
        }

        current += line + '\n';

        // If we're not in a function, parentheses are balanced, and line ends with semicolon
        if (!inFunction && parenDepth === 0 && trimmed.endsWith(';')) {
            statements.push(current.trim());
            current = '';
        }
    }

    // Add any remaining content
    if (current.trim()) {
        statements.push(current.trim());
    }

    return statements.filter(s => s.length > 0 && !s.match(/^--/));
}

const schemaPath = path.resolve(__dirname, '../database/schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

const statements = splitSQLStatements(schemaSql);

console.log(`Total statements: ${statements.length}`);
console.log('\n=== Statement 87 ===');
console.log(statements[86]);
console.log('\n=== Statement 88 ===');
console.log(statements[87]);
console.log('\n=== Statement 89 ===');
console.log(statements[88]);
