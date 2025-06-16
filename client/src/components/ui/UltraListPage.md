# UltraListPage Component Documentation

## Overview

The `UltraListPage` component is a comprehensive listing page component that provides a modern, feature-rich interface for displaying and managing data tables. It includes advanced features like search, filtering, sorting, pagination, bulk actions, and more.

## Features

- **Advanced Search**: Real-time search functionality across all data fields
- **Dynamic Filtering**: Multi-level filtering with different input types (select, multiselect, text, date, etc.)
- **Sortable Columns**: Click-to-sort functionality on any column
- **Pagination**: Configurable page sizes and navigation
- **Bulk Actions**: Select multiple rows and perform batch operations
- **Row Actions**: Individual row action menus
- **Export Functionality**: Export data in various formats (CSV, Excel, PDF)
- **Column Management**: Show/hide columns dynamically
- **Responsive Design**: Glassmorphism design with mobile-friendly layout
- **Empty States**: Customizable empty state with call-to-action
- **Loading States**: Built-in loading indicators
- **Breadcrumbs**: Navigation breadcrumb support

## Basic Usage

```tsx
import { UltraListPage } from "../components/ui/UltraListPage";

const MyListPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (value, row) => <Text fw={500}>{value}</Text>,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (value) => <Badge color="green">{value}</Badge>,
    },
  ];

  return (
    <UltraListPage
      title="My Data"
      data={data}
      columns={columns}
      loading={loading}
      searchable
      filterable
      exportable
      selectable
    />
  );
};
```

## Props Reference

### Required Props

| Prop      | Type       | Description                        |
| --------- | ---------- | ---------------------------------- |
| `title`   | `string`   | Page title displayed in the header |
| `data`    | `any[]`    | Array of data objects to display   |
| `columns` | `Column[]` | Column configuration array         |

### Optional Props

| Prop          | Type               | Default | Description                  |
| ------------- | ------------------ | ------- | ---------------------------- |
| `loading`     | `boolean`          | `false` | Show loading state           |
| `searchable`  | `boolean`          | `true`  | Enable search functionality  |
| `filterable`  | `boolean`          | `true`  | Enable filtering             |
| `exportable`  | `boolean`          | `true`  | Enable export options        |
| `selectable`  | `boolean`          | `false` | Enable row selection         |
| `pagination`  | `PaginationConfig` | -       | Pagination configuration     |
| `actions`     | `ActionsConfig`    | -       | Action buttons configuration |
| `filters`     | `FilterOption[]`   | `[]`    | Filter options               |
| `breadcrumbs` | `Breadcrumb[]`     | -       | Navigation breadcrumbs       |
| `emptyState`  | `EmptyStateConfig` | -       | Empty state configuration    |

## Column Configuration

### Column Interface

```tsx
interface Column {
  key: string; // Data field key
  label: string; // Column header label
  sortable?: boolean; // Enable sorting
  filterable?: boolean; // Enable filtering
  width?: string; // Column width (CSS value)
  align?: "left" | "center" | "right"; // Text alignment
  render?: (value: any, row: any) => React.ReactNode; // Custom renderer
}
```

### Examples

```tsx
// Simple text column
{
  key: 'name',
  label: 'Full Name',
  sortable: true
}

// Custom rendered column with avatar
{
  key: 'user',
  label: 'User',
  sortable: true,
  render: (value, row) => (
    <Group gap="sm">
      <Avatar src={row.photo} alt={row.name} />
      <div>
        <Text fw={500}>{row.name}</Text>
        <Text size="xs" c="dimmed">{row.email}</Text>
      </div>
    </Group>
  )
}

// Status badge column
{
  key: 'status',
  label: 'Status',
  align: 'center',
  render: (value) => (
    <Badge color={value === 'active' ? 'green' : 'red'}>
      {value}
    </Badge>
  )
}
```

## Pagination Configuration

```tsx
interface PaginationConfig {
  page: number; // Current page
  pageSize: number; // Items per page
  total: number; // Total items count
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}
```

## Actions Configuration

```tsx
interface ActionsConfig {
  create?: {
    label: string;
    onClick: () => void;
  };
  bulk?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: (selectedIds: string[]) => void;
    color?: string;
  }>;
  row?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: (row: any) => void;
    color?: string;
    show?: (row: any) => boolean;
  }>;
}
```

## Filter Options

```tsx
interface FilterOption {
  key: string;
  label: string;
  type: "select" | "multiselect" | "date" | "text" | "number";
  options?: { label: string; value: string }[];
  placeholder?: string;
}
```

### Filter Examples

```tsx
const filters = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "All", value: "all" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
  {
    key: "categories",
    label: "Categories",
    type: "multiselect",
    options: [
      { label: "Category A", value: "cat-a" },
      { label: "Category B", value: "cat-b" },
    ],
  },
  {
    key: "search",
    label: "Search Term",
    type: "text",
    placeholder: "Enter search term...",
  },
];
```

## Event Handlers

### onSearch

Called when user types in the search box.

```tsx
onSearch={(query: string) => {
  // Filter data based on query
  setSearchQuery(query);
}}
```

### onFilter

Called when filter values change.

```tsx
onFilter={(filters: Record<string, any>) => {
  // Apply filters to data
  setFilters(filters);
}}
```

### onSort

Called when user clicks on sortable column headers.

```tsx
onSort={(column: string, direction: 'asc' | 'desc') => {
  // Sort data by column and direction
  setSortConfig({ column, direction });
}}
```

### onExport

Called when user selects an export format.

```tsx
onExport={(format: string) => {
  // Export data in specified format
  exportData(format);
}}
```

## Advanced Examples

### Complete Product Listing

```tsx
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const columns = [
    {
      key: "product",
      label: "Product",
      render: (value, row) => (
        <Group gap="sm">
          <Avatar src={row.image} alt={row.name} />
          <div>
            <Text fw={500}>{row.name}</Text>
            <Text size="xs" c="dimmed">
              {row.category}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: "price",
      label: "Price",
      align: "right",
      sortable: true,
      render: (value) => <Text fw={500}>${value}</Text>,
    },
    {
      key: "stock",
      label: "Stock",
      align: "center",
      render: (value) => (
        <Badge color={value > 0 ? "green" : "red"}>
          {value > 0 ? `${value} in stock` : "Out of stock"}
        </Badge>
      ),
    },
  ];

  const filterOptions = [
    {
      key: "category",
      label: "Category",
      type: "select",
      options: [
        { label: "All Categories", value: "all" },
        { label: "Electronics", value: "electronics" },
        { label: "Clothing", value: "clothing" },
      ],
    },
  ];

  return (
    <UltraListPage
      title="Products"
      data={products}
      columns={columns}
      loading={loading}
      searchable
      filterable
      exportable
      selectable
      pagination={{
        page: currentPage,
        pageSize: pageSize,
        total: 1000,
        onPageChange: setCurrentPage,
        onPageSizeChange: setPageSize,
      }}
      actions={{
        create: {
          label: "New Product",
          onClick: () => navigate("/products/create"),
        },
        bulk: [
          {
            label: "Delete Selected",
            icon: <IconTrash size={16} />,
            onClick: (ids) => deleteProducts(ids),
            color: "red",
          },
        ],
        row: [
          {
            label: "Edit",
            icon: <IconEdit size={16} />,
            onClick: (row) => navigate(`/products/${row.id}/edit`),
          },
          {
            label: "Delete",
            icon: <IconTrash size={16} />,
            onClick: (row) => deleteProduct(row.id),
            color: "red",
          },
        ],
      }}
      filters={filterOptions}
      onSearch={(query) => setSearchQuery(query)}
      onFilter={(filters) => setFilters(filters)}
      onSort={(column, direction) => setSortConfig({ column, direction })}
      onExport={(format) => exportProducts(format)}
      emptyState={{
        title: "No products found",
        description: "Start by adding your first product",
        icon: <IconShoppingCart size={48} />,
        action: {
          label: "Add Product",
          onClick: () => navigate("/products/create"),
        },
      }}
    />
  );
};
```

## Styling

The component uses the theme context and provides several styling variants:

- **Glass morphism design** with backdrop blur effects
- **Responsive layout** that adapts to different screen sizes
- **Dark/light mode support** through theme context
- **Customizable colors** via theme configuration

## Accessibility

- **Keyboard navigation** support for all interactive elements
- **Screen reader** compatible with proper ARIA labels
- **Focus management** for modal dialogs and dropdowns
- **High contrast** support for better visibility

## Performance Tips

1. **Virtualization**: For large datasets (>1000 items), consider implementing virtual scrolling
2. **Debounced search**: Implement debouncing for search queries to reduce API calls
3. **Memoization**: Use React.memo for custom column renderers
4. **Lazy loading**: Implement server-side pagination for better performance

```tsx
const debouncedSearch = useMemo(
  () =>
    debounce((query: string) => {
      // Perform search
    }, 300),
  []
);
```

## Integration with APIs

```tsx
const useProductData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
  });

  const loadData = useCallback(async (params) => {
    setLoading(true);
    try {
      const response = await api.get("/products", { params });
      setData(response.data.items);
      setPagination({
        page: response.data.page,
        pageSize: response.data.pageSize,
        total: response.data.total,
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, pagination, loadData };
};
```

This component provides a solid foundation for building modern, feature-rich listing pages in your React applications.
