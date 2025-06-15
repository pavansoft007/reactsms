# Role Permission Select All Feature

## Overview

Added comprehensive "Select All" functionality to the Role Permission management system, allowing administrators to efficiently manage permissions across modules and globally.

## Features Added

### 1. Global Select All

- **Location**: Top row of the permission table
- **Function**: Select/deselect all permissions of a specific type across all modules
- **Visual**:
  - Blue icon (IconSelectAll) with "Select All Permissions" label
  - Larger checkboxes (size="md") for prominence
  - Different colors for each permission type (View=blue, Add=green, Edit=orange, Delete=red)

### 2. Module-Level Select All

- **Location**: Each module/category header row
- **Function**: Select/deselect all permissions of a specific type within a single module
- **Visual**:
  - Checkboxes in each permission column of the category header
  - Color-coded to match permission types
  - Integrated with existing expand/collapse functionality

### 3. Smart State Management

- **Checked State**: All items selected
- **Indeterminate State**: Some but not all items selected
- **Unchecked State**: No items selected

### 4. User Experience Enhancements

- **Tooltips**: Hover descriptions for all select-all checkboxes
- **Click Prevention**: Category checkboxes don't trigger expand/collapse
- **Visual Hierarchy**: Clear distinction between global, module, and individual permissions

## Implementation Details

### New Functions Added

```typescript
// Handle selecting all permissions for a specific module/category
const handleCategorySelectAll = (category: string, permissionType: string) => {
  // Toggle all permissions of specified type for all features in category
};

// Handle global select all for all modules
const handleGlobalSelectAll = (permissionType: string) => {
  // Toggle all permissions of specified type across entire system
};

// Check if all permissions in a category are selected
const isCategoryPermissionSelected = (
  category: string,
  permissionType: string
) => {
  // Returns true if all features in category have this permission enabled
};

// Check if category has mixed permission states (indeterminate)
const isCategoryPermissionIndeterminate = (
  category: string,
  permissionType: string
) => {
  // Returns true if some but not all features have this permission enabled
};

// Global permission state checkers
const isGlobalPermissionSelected = (permissionType: string) => {
  // Returns true if all permissions of this type are enabled globally
};

const isGlobalPermissionIndeterminate = (permissionType: string) => {
  // Returns true if some but not all permissions of this type are enabled
};
```

### UI Structure

```
┌─ Global Select All Row ─────────────────┐
│ 🔲 Select All | [✓] View [✓] Add [□] Edit [□] Delete │
├─ Separator ─────────────────────────────┤
├─ Dashboard Category ────────────────────┤
│ 📂 Dashboard (7) | [□] View [□] Add [□] Edit [□] Delete │
│   ├─ Monthly Income Chart               │
│   ├─ Annual Fees Chart                  │
│   └─ ...                               │
├─ Student Management ────────────────────┤
│ 📂 Student Mgmt (5) | [✓] View [□] Add [□] Edit [□] Delete │
│   ├─ Student                           │
│   ├─ Multiple Import                   │
│   └─ ...                              │
└─────────────────────────────────────────┘
```

## Benefits

1. **Efficiency**: Quickly assign permissions to entire modules or globally
2. **Clarity**: Visual feedback shows current selection state
3. **Flexibility**: Mix and match permissions at different levels
4. **User-Friendly**: Tooltips guide administrators through the process
5. **Consistent**: Follows standard checkbox patterns (checked/indeterminate/unchecked)

## Usage Scenarios

### Scenario 1: New Role Setup

1. Select a role from dropdown
2. Use global "Select All" for View permissions (most common baseline)
3. Use module-level select for specific operational permissions
4. Fine-tune individual feature permissions as needed

### Scenario 2: Department-Specific Permissions

1. Use Academic module select-all for Teacher roles
2. Use Student Management select-all for Registrar roles
3. Use Fee Management select-all for Accountant roles

### Scenario 3: Permission Audit

1. Visual indicators show which modules have full/partial permissions
2. Indeterminate states highlight areas needing review
3. Global view provides system-wide permission overview

## Technical Notes

- All select-all functions preserve existing individual permission states when toggling
- State management uses immutable updates for React optimization
- Click event propagation stopped on category checkboxes to prevent expand/collapse
- Tooltip positioning automatically handled by Mantine components
- Color consistency maintained across all permission types

## Future Enhancements

1. **Permission Templates**: Save common permission sets as templates
2. **Bulk Role Assignment**: Apply permission patterns to multiple roles
3. **Permission History**: Track permission changes over time
4. **Role Comparison**: Side-by-side permission comparison between roles
