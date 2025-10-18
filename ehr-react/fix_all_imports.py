import os
import re

def fix_imports(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Find all problematic import lines that incorrectly import from select.tsx
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        # Check if this is an import from select that includes non-select components
        if "from '@/components/ui/select'" in line and ('Button' in line or 'Input' in line or 'Label' in line or 'Drawer' in line or 'Sheet' in line):
            # Extract all the imports
            match = re.search(r'import\s*{\s*([^}]+)\s*}\s*from', line)
            if match:
                imports = [i.strip() for i in match.group(1).split(',')]
                
                # Categorize imports
                select_imports = [i for i in imports if 'Select' in i]
                button_imports = [i for i in imports if i == 'Button']
                input_imports = [i for i in imports if i == 'Input']
                label_imports = [i for i in imports if i == 'Label']
                drawer_imports = [i for i in imports if 'Drawer' in i or 'Sheet' in i]
                
                # Generate separate import lines
                new_import_lines = []
                if button_imports:
                    new_import_lines.append(f"import {{ {', '.join(button_imports)} }} from '@/components/ui/button';")
                if input_imports:
                    new_import_lines.append(f"import {{ {', '.join(input_imports)} }} from '@/components/ui/input';")
                if label_imports:
                    new_import_lines.append(f"import {{ {', '.join(label_imports)} }} from '@/components/ui/label';")
                if drawer_imports:
                    # Convert Drawer to Sheet
                    sheet_imports = []
                    for imp in drawer_imports:
                        if imp == 'Drawer':
                            sheet_imports.append('Sheet as Drawer')
                        elif 'Drawer' in imp:
                            sheet_imports.append(imp.replace('Drawer', 'Sheet as Drawer'))
                        else:
                            sheet_imports.append(imp)
                    new_import_lines.append(f"import {{ {', '.join(sheet_imports)} }} from '@/components/ui/sheet';")
                if select_imports:
                    new_import_lines.append(f"import {{ {', '.join(select_imports)} }} from '@/components/ui/select';")
                
                new_lines.extend(new_import_lines)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed: {filepath}")

# Process all files
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            filepath = os.path.join(root, file)
            try:
                fix_imports(filepath)
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

print("Done!")
