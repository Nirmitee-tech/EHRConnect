import os
import re

def fix_nextjs_imports(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Replace next/navigation imports
    content = re.sub(
        r"import { usePathname } from ['\"]next/navigation['\"]",
        "import { useLocation } from 'react-router-dom'",
        content
    )
    
    content = re.sub(
        r"import { useRouter } from ['\"]next/navigation['\"]",
        "import { useNavigate } from 'react-router-dom'",
        content
    )
    
    # Replace next/link imports
    content = re.sub(
        r"import Link from ['\"]next/link['\"]",
        "import { Link } from 'react-router-dom'",
        content
    )
    
    # Replace usePathname() with location.pathname
    if "useLocation" in content and "usePathname" in content:
        # Add location hook
        if "const location = useLocation()" not in content:
            # Find where to add it - after other hooks
            content = re.sub(
                r"(const.*?= useLocation\(\);)",
                r"\1",
                content
            )
        
        # Replace pathname variable declaration
        content = re.sub(
            r"const pathname = usePathname\(\);",
            "const location = useLocation();\n  const pathname = location.pathname;",
            content
        )
        
        # Replace standalone usePathname() calls
        content = re.sub(
            r"usePathname\(\)",
            "location.pathname",
            content
        )
    
    # Replace useRouter with useNavigate
    if "useNavigate" in content and "useRouter" in content:
        content = re.sub(
            r"const router = useRouter\(\);",
            "const navigate = useNavigate();",
            content
        )
        content = re.sub(
            r"router\.push\(([^)]+)\)",
            r"navigate(\1)",
            content
        )
        content = re.sub(
            r"router\.replace\(([^)]+)\)",
            r"navigate(\1, { replace: true })",
            content
        )
        content = re.sub(
            r"router\.back\(\)",
            r"navigate(-1)",
            content
        )
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed: {filepath}")

# Process all files
files_to_fix = [
    'src/components/forms/facility-form.tsx',
    'src/components/layout/authenticated-layout.tsx',
    'src/components/layout/admin-sidebar.tsx',
    'src/components/layout/nav-item.tsx',
    'src/components/layout/healthcare-header.tsx',
    'src/components/layout/healthcare-sidebar.tsx',
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        fix_nextjs_imports(filepath)

print("Done!")
