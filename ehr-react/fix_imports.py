import os
import re
from pathlib import Path

# Replacement patterns
replacements = [
    (r"import { Button } from '@nirmitee\.io/design-system'", "import { Button } from '@/components/ui/button'"),
    (r"import { Badge } from '@nirmitee\.io/design-system'", "import { Badge } from '@/components/ui/badge'"),
    (r"import { Button, Badge } from '@nirmitee\.io/design-system'", "import { Button } from '@/components/ui/button';\nimport { Badge } from '@/components/ui/badge'"),
    (r"import { Card } from '@nirmitee\.io/design-system'", "import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'"),
    (r"import { Input } from '@nirmitee\.io/design-system'", "import { Input } from '@/components/ui/input'"),
    (r"import { Label } from '@nirmitee\.io/design-system'", "import { Label } from '@/components/ui/label'"),
    (r"import { Input, Label } from '@nirmitee\.io/design-system'", "import { Input } from '@/components/ui/input';\nimport { Label } from '@/components/ui/label'"),
]

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed: {filepath}")

# Process all .tsx and .ts files except in components/ui
for root, dirs, files in os.walk('src'):
    if 'components/ui' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            fix_file(os.path.join(root, file))

print("Done!")
