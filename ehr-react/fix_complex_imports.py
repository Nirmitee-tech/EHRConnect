import os
import re

def fix_complex_imports(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Handle imports with Select
    content = re.sub(
        r"import { (.*?Select.*?) } from '@nirmitee\.io/design-system'",
        r"import { \1 } from '@/components/ui/select'",
        content
    )
    
    # Handle imports with Drawer - replace with Sheet
    drawer_pattern = r"import { ([^}]*?)Drawer([^}]*?) } from '@nirmitee\.io/design-system'"
    def replace_drawer(match):
        imports = match.group(0)
        # Extract all imports
        parts = []
        if 'Drawer,' in imports or imports.endswith('Drawer '):
            parts.append('Sheet as Drawer')
        if 'DrawerContent' in imports:
            parts.append('SheetContent as DrawerContent')
        if 'DrawerHeader' in imports:
            parts.append('SheetHeader as DrawerHeader')
        if 'DrawerTitle' in imports:
            parts.append('SheetTitle as DrawerTitle')
        
        # Also extract non-Drawer imports
        other_imports = []
        for imp in ['Button', 'Input', 'Label', 'Select', 'SelectContent', 'SelectItem', 'SelectTrigger', 'SelectValue']:
            if imp in imports:
                other_imports.append(imp)
        
        # Generate new imports
        new_imports = []
        if parts:
            new_imports.append(f"import {{ {', '.join(parts)} }} from '@/components/ui/sheet'")
        if other_imports:
            # Group by component type
            if any(x in other_imports for x in ['Select', 'SelectContent', 'SelectItem', 'SelectTrigger', 'SelectValue']):
                select_parts = [x for x in other_imports if 'Select' in x]
                new_imports.append(f"import {{ {', '.join(select_parts)} }} from '@/components/ui/select'")
                other_imports = [x for x in other_imports if 'Select' not in x]
            
            for imp in other_imports:
                new_imports.append(f"import {{ {imp} }} from '@/components/ui/{imp.lower()}'")
        
        return ';\n'.join(new_imports) if new_imports else match.group(0)
    
    content = re.sub(drawer_pattern, replace_drawer, content)
    
    # Fix any remaining @nirmitee.io/design-system imports with Select
    if '@nirmitee.io/design-system' in content and 'Select' in content:
        # Extract and replace Select-related imports
        content = re.sub(
            r"import { (.*?), (Select.*?) } from '@nirmitee\.io/design-system'",
            lambda m: f"import {{ {m.group(1)} }} from '@/components/ui'; import {{ {m.group(2)} }} from '@/components/ui/select'",
            content
        )
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed complex: {filepath}")

# Process all files
for root, dirs, files in os.walk('src'):
    if 'components/ui' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            filepath = os.path.join(root, file)
            if '@nirmitee.io/design-system' in open(filepath).read():
                fix_complex_imports(filepath)

print("Done with complex imports!")
