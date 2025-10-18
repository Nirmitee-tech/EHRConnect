#!/bin/bash

# Fix all @nirmitee.io/design-system imports to use local components

# Replace individual component imports
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e "s|from '@nirmitee.io/design-system'|from '@/components/ui'|g" \
  -e "s|import { Button }|import { Button }|g" \
  -e "s|import { Badge }|import { Badge }|g" \
  -e "s|import { Input }|import { Input }|g" \
  -e "s|import { Label }|import { Label }|g" \
  -e "s|import { Card }|import { Card }|g" \
  {} +

# Fix Drawer imports to use Sheet
find src -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/components/ui/*" -exec sed -i '' \
  -e "s|import { Drawer,|import { Sheet as Drawer,|g" \
  -e "s|DrawerContent|SheetContent as DrawerContent|g" \
  -e "s|DrawerHeader|SheetHeader as DrawerHeader|g" \
  -e "s|DrawerTitle|SheetTitle as DrawerTitle|g" \
  {} +

# Fix specific multi-import cases
find src -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/components/ui/*" -exec perl -i -pe '
  s/import \{ ([^}]*?)Drawer([^}]*?) \} from .*design-system.*$/
    my $pre = $1; my $post = $2;
    $pre =~ s\/,\s*$//; 
    $post =~ s\/^\s*,//;
    my @parts;
    push @parts, $pre if $pre =~ \/\S\/;
    push @parts, "Sheet as Drawer, SheetContent as DrawerContent, SheetHeader as DrawerHeader, SheetTitle as DrawerTitle";
    push @parts, $post if $post =~ \/\S\/;
    "import { " . join(", ", @parts) . " } from '\@\/components\/ui'"
  /ex' {} +

echo "Fixed design-system imports"
