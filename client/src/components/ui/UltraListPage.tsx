import {   useState , Fragment , ReactNode } from 'react';
import {
  Container,
  Paper,
  Group,
  TextInput,
  Select,
  ActionIcon,
  Menu,
  Text,
  Checkbox,
  Pagination,
  Modal,
  ScrollArea,
  Switch,
  Tooltip,
  MultiSelect,
  Table,
  Stack,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconColumns,
  IconDownload,
  IconDots,
  IconRefresh,
  IconArrowUp,
  IconArrowDown,
  IconChevronDown,
} from "@tabler/icons-react";
import { useTheme } from "../../context/ThemeContext";
import UltraTable from "./UltraTable";
import UltraButton from "./UltraButton";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any) => ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

interface FilterOption {
  key: string;
  label: string;
  type: "select" | "multiselect" | "date" | "text" | "number";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface UltraListPageProps {
  title: string;
  data: any[];
  columns: Column[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  actions?: {
    create?: {
      label: string;
      onClick: () => void;
    };
    bulk?: Array<{
      label: string;
      icon: ReactNode;
      onClick: (selectedIds: string[]) => void;
      color?: string;
    }>;
    row?: Array<{
      label: string;
      icon: ReactNode;
      onClick: (row: any) => void;
      color?: string;
      show?: (row: any) => boolean;
    }>;
  };
  filters?: FilterOption[];
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  onExport?: (format: string) => void;
  onRefresh?: () => void;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  renderRowActions?: (row: any) => ReactNode;
  emptyState?: {
    title: string;
    description: string;
    icon?: ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

export const UltraListPage = ({
  title,
  data,
  columns,
  loading = false,
  searchable = true,
  filterable = true,
  exportable = true,
  selectable = false,
  pagination,
  actions,
  filters = [],
  onSearch,
  onFilter,
  onSort,
  onExport,
  onRefresh,
  breadcrumbs,
  renderRowActions,
  emptyState,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((col) => col.key)
  );
  const [filtersOpened, setFiltersOpened] = useState(false);
  const [columnsOpened, setColumnsOpened] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleFilter = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilter?.(newFilters);
  };

  const handleSort = (column: string) => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(data.map((row) => row.id.toString()));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const renderBreadcrumbs = () => {
    if (!breadcrumbs) return null;

    return (
      <Group gap="xs" mb="md">
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={`breadcrumb-${crumb.label}-${index}`}>
            {" "}
            <Text
              size="sm"
              c={
                index === breadcrumbs.length - 1
                  ? "dimmed"
                  : theme.colors?.primary?.[6] ?? "blue"
              }
              style={{
                cursor: crumb.href ? "pointer" : "default",
                fontWeight: index === breadcrumbs.length - 1 ? 500 : 400,
              }}
            >
              {crumb.label}
            </Text>
            {index < breadcrumbs.length - 1 && (
              <Text size="sm" c="dimmed">
                •
              </Text>
            )}
          </Fragment>
        ))}
      </Group>
    );
  };

  const renderHeader = () => (
    <Paper
      p="xl"
      radius="lg"
      style={{
        background: theme.glassmorphism?.primary || theme.bg.elevated,
        backdropFilter: "blur(12px)",
        border: `1px solid ${theme.border}`,
      }}
    >
      {renderBreadcrumbs()}

      <Group justify="space-between" align="center" mb="lg">
        <Text size="xl" fw={600} c={theme.text.primary}>
          {title}
        </Text>

        <Group gap="sm">
          {onRefresh && (
            <Tooltip label="Refresh">
              <ActionIcon
                variant="light"
                size="lg"
                onClick={onRefresh}
                style={{ borderRadius: "8px" }}
              >
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
          )}

          {actions?.create && (
            <UltraButton
              variant="primary"
              leftSection={<IconPlus size={18} />}
              onClick={actions.create.onClick}
            >
              {actions.create.label}
            </UltraButton>
          )}
        </Group>
      </Group>

      <Group justify="space-between" align="center">
        <Group gap="sm" style={{ flex: 1 }}>
          {searchable && (
            <TextInput
              placeholder="Search..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ minWidth: 300 }}
              radius="md"
            />
          )}

          {filterable && filters.length > 0 && (
            <Select
              placeholder="Stock"
              data={[
                { label: "All Stock", value: "all" },
                { label: "In Stock", value: "in-stock" },
                { label: "Out of Stock", value: "out-of-stock" },
                { label: "Low Stock", value: "low-stock" },
              ]}
              leftSection={<IconChevronDown size={16} />}
              style={{ minWidth: 150 }}
              radius="md"
            />
          )}

          {filterable && (
            <Select
              placeholder="Publish"
              data={[
                { label: "All", value: "all" },
                { label: "Published", value: "published" },
                { label: "Draft", value: "draft" },
                { label: "Archived", value: "archived" },
              ]}
              leftSection={<IconChevronDown size={16} />}
              style={{ minWidth: 150 }}
              radius="md"
            />
          )}
        </Group>

        <Group gap="sm">
          <Tooltip label="Columns">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => setColumnsOpened(true)}
              style={{ borderRadius: "8px" }}
            >
              <IconColumns size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Filters">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => setFiltersOpened(true)}
              style={{ borderRadius: "8px" }}
            >
              <IconFilter size={18} />
            </ActionIcon>
          </Tooltip>

          {exportable && (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Tooltip label="Export">
                  <ActionIcon
                    variant="light"
                    size="lg"
                    style={{ borderRadius: "8px" }}
                  >
                    <IconDownload size={18} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => onExport?.("csv")}>
                  Export as CSV
                </Menu.Item>
                <Menu.Item onClick={() => onExport?.("excel")}>
                  Export as Excel
                </Menu.Item>
                <Menu.Item onClick={() => onExport?.("pdf")}>
                  Export as PDF
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>

      {/* Bulk Actions */}
      {selectable && selectedRows.length > 0 && (
        <Group
          mt="md"
          p="sm"
          style={{
            background: theme.glassmorphism?.secondary || theme.bg.secondary,
            borderRadius: "8px",
            border: `1px solid ${theme.border}`,
          }}
        >
          <Text size="sm" fw={500}>
            {selectedRows.length} item{selectedRows.length > 1 ? "s" : ""}{" "}
            selected
          </Text>
          <Group gap="xs">
            {" "}
            {actions?.bulk?.map((action, index) => (
              <UltraButton
                key={`bulk-${action.label}-${index}`}
                variant="secondary"
                size="xs"
                leftSection={action.icon}
                onClick={() => action.onClick(selectedRows)}
              >
                {action.label}
              </UltraButton>
            ))}
          </Group>
        </Group>
      )}
    </Paper>
  );

  const renderTableHeader = () => (
    <Table.Thead>
      <Table.Tr>
        {selectable && (
          <Table.Th style={{ width: 50 }}>
            <Checkbox
              checked={selectedRows.length === data.length && data.length > 0}
              indeterminate={
                selectedRows.length > 0 && selectedRows.length < data.length
              }
              onChange={(e) => handleSelectAll(e.currentTarget.checked)}
            />
          </Table.Th>
        )}

        {columns
          .filter((col) => visibleColumns.includes(col.key))
          .map((column) => (
            <Table.Th
              key={column.key}
              style={{
                width: column.width,
                textAlign: column.align ?? "left",
                cursor: column.sortable ? "pointer" : "default",
              }}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <Group
                gap="xs"
                justify={column.align === "center" ? "center" : "flex-start"}
              >
                <Text fw={600} size="sm" c={theme.text.secondary}>
                  {column.label}
                </Text>
                {column.sortable &&
                  sortColumn === column.key &&
                  (sortDirection === "asc" ? (
                    <IconArrowUp size={14} />
                  ) : (
                    <IconArrowDown size={14} />
                  ))}
              </Group>
            </Table.Th>
          ))}

        {(actions?.row || renderRowActions) && (
          <Table.Th style={{ width: 80, textAlign: "right" }}>
            <Text fw={600} size="sm" c={theme.text.secondary}>
              Actions
            </Text>
          </Table.Th>
        )}
      </Table.Tr>
    </Table.Thead>
  );

  const renderTableBody = () => (
    <Table.Tbody>
      {data.map((row, index) => (
        <Table.Tr key={row.id ?? `row-${index}`}>
          {selectable && (
            <Table.Td>
              <Checkbox
                checked={selectedRows.includes(row.id?.toString())}
                onChange={(e) =>
                  handleSelectRow(row.id?.toString(), e.currentTarget.checked)
                }
              />
            </Table.Td>
          )}

          {columns
            .filter((col) => visibleColumns.includes(col.key))
            .map((column) => (
              <Table.Td
                key={column.key}
                style={{ textAlign: column.align ?? "left" }}
              >
                {column.render
                  ? column.render(row[column.key], row)
                  : row[column.key]}
              </Table.Td>
            ))}

          {(actions?.row || renderRowActions) && (
            <Table.Td style={{ textAlign: "right" }}>
              {renderRowActions ? (
                renderRowActions(row)
              ) : (
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon variant="subtle" size="sm">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {" "}
                    {actions?.row?.map((action, actionIndex) =>
                      action.show ? (
                        action.show(row) && (
                          <Menu.Item
                            key={`${action.label}-${row.id ?? actionIndex}`}
                            leftSection={action.icon}
                            color={action.color}
                            onClick={() => action.onClick(row)}
                          >
                            {action.label}
                          </Menu.Item>
                        )
                      ) : (
                        <Menu.Item
                          key={`${action.label}-${row.id ?? actionIndex}`}
                          leftSection={action.icon}
                          color={action.color}
                          onClick={() => action.onClick(row)}
                        >
                          {action.label}
                        </Menu.Item>
                      )
                    )}
                  </Menu.Dropdown>
                </Menu>
              )}
            </Table.Td>
          )}
        </Table.Tr>
      ))}
    </Table.Tbody>
  );

  const renderEmptyState = () => {
    if (!emptyState) return null;

    return (
      <Stack align="center" gap="md" py={60}>
        {emptyState.icon}
        <Stack align="center" gap="xs">
          <Text fw={600} size="lg" c={theme.text.primary}>
            {emptyState.title}
          </Text>
          <Text size="sm" c={theme.text.secondary} ta="center">
            {emptyState.description}
          </Text>
        </Stack>
        {emptyState.action && (
          <UltraButton onClick={emptyState.action.onClick}>
            {emptyState.action.label}
          </UltraButton>
        )}
      </Stack>
    );
  };

  return (
    <Container size="xl" py="xl">
      {renderHeader()}

      <Paper
        mt="xl"
        radius="lg"
        style={{
          background: theme.glassmorphism?.primary || theme.bg.elevated,
          backdropFilter: "blur(12px)",
          border: `1px solid ${theme.border}`,
          overflow: "hidden",
        }}
      >
        {data.length === 0 && !loading ? (
          renderEmptyState()
        ) : (
          <>
            <ScrollArea>
              <UltraTable variant="glass" striped hoverable>
                {renderTableHeader()}
                {renderTableBody()}
              </UltraTable>
            </ScrollArea>

            {pagination && data.length > 0 && (
              <Group
                justify="space-between"
                p="md"
                style={{
                  borderTop: `1px solid ${theme.border}`,
                  background:
                    theme.glassmorphism?.secondary || theme.bg.secondary,
                }}
              >
                <Text size="sm" c={theme.text.secondary}>
                  Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.pageSize,
                    pagination.total
                  )}{" "}
                  of {pagination.total} results
                </Text>

                <Group gap="sm">
                  {pagination.onPageSizeChange && (
                    <Group gap="xs">
                      <Text size="sm" c={theme.text.secondary}>
                        Rows per page:
                      </Text>
                      <Select
                        size="xs"
                        data={["10", "25", "50", "100"]}
                        value={pagination.pageSize.toString()}
                        onChange={(value) =>
                          pagination.onPageSizeChange?.(parseInt(value ?? "10"))
                        }
                        style={{ width: 80 }}
                      />
                    </Group>
                  )}

                  <Pagination
                    value={pagination.page}
                    onChange={pagination.onPageChange}
                    total={Math.ceil(pagination.total / pagination.pageSize)}
                    size="sm"
                    radius="md"
                  />
                </Group>
              </Group>
            )}
          </>
        )}
      </Paper>

      {/* Column Settings Modal */}
      <Modal
        opened={columnsOpened}
        onClose={() => setColumnsOpened(false)}
        title="Manage Columns"
        size="sm"
      >
        <Stack gap="xs">
          {columns.map((column) => (
            <Group key={column.key} justify="space-between">
              <Text size="sm">{column.label}</Text>
              <Switch
                checked={visibleColumns.includes(column.key)}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    setVisibleColumns((prev) => [...prev, column.key]);
                  } else {
                    setVisibleColumns((prev) =>
                      prev.filter((col) => col !== column.key)
                    );
                  }
                }}
              />
            </Group>
          ))}
        </Stack>
      </Modal>

      {/* Filters Modal */}
      <Modal
        opened={filtersOpened}
        onClose={() => setFiltersOpened(false)}
        title="Advanced Filters"
        size="md"
      >
        <Stack gap="md">
          {filters.map((filter) => (
            <div key={filter.key}>
              <Text size="sm" fw={500} mb="xs">
                {filter.label}
              </Text>
              {filter.type === "select" && (
                <Select
                  placeholder={filter.placeholder}
                  data={filter.options || []}
                  value={filterValues[filter.key]}
                  onChange={(value) => handleFilter(filter.key, value)}
                />
              )}
              {filter.type === "multiselect" && (
                <MultiSelect
                  placeholder={filter.placeholder}
                  data={filter.options || []}
                  value={filterValues[filter.key] ?? []}
                  onChange={(value) => handleFilter(filter.key, value)}
                />
              )}
              {filter.type === "text" && (
                <TextInput
                  placeholder={filter.placeholder}
                  value={filterValues[filter.key] ?? ""}
                  onChange={(e) => handleFilter(filter.key, e.target.value)}
                />
              )}
            </div>
          ))}

          <Group justify="flex-end" mt="md">
            <UltraButton
              variant="secondary"
              onClick={() => {
                setFilterValues({});
                onFilter?.({});
              }}
            >
              Clear All
            </UltraButton>
            <UltraButton onClick={() => setFiltersOpened(false)}>
              Apply Filters
            </UltraButton>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default UltraListPage;
