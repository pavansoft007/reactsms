import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Group, 
  Text, 
  Breadcrumbs, 
  Anchor,
  Stack,
  Checkbox,
  Menu,
  ActionIcon,
  Button,
  Badge,
  Avatar,
  Divider,
  Pagination,
  Center,
  MultiSelect,
  Modal
} from '@mantine/core';
import { 
  IconPlus,
  IconSearch,
  IconColumns,
  IconFilter,
  IconDownload,
  IconSettings,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconChevronDown,
  IconCalendar,
  IconUser,
  IconMail,
  IconPhone,
  IconSchool
} from '@tabler/icons-react';
import { 
  UltraCard, 
  UltraButton, 
  UltraInput, 
  UltraSelect, 
  UltraTable, 
  UltraTableActions, 
  UltraTableBadge, 
  UltraModal
} from '../components/ui';

interface ListItem {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending' | 'draft' | 'published';
  createdAt: string;
  avatar?: string;
  [key: string]: any;
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  visible: boolean;
}

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface EnhancedListPageProps {
  title: string;
  breadcrumbs: { title: string; href?: string }[];
  items: ListItem[];
  columns: Column[];
  filters: FilterOption[];
  onAdd?: () => void;
  onEdit?: (item: ListItem) => void;
  onDelete?: (item: ListItem) => void;
  onExport?: (selectedIds: number[]) => void;
  loading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  searchPlaceholder?: string;
  addButtonText?: string;
}

const EnhancedListPage: React.FC<EnhancedListPageProps> = ({
  title,
  breadcrumbs,
  items,
  columns: initialColumns,
  filters,
  onAdd,
  onEdit,
  onDelete,
  onExport,
  loading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  searchPlaceholder = "Search...",
  addButtonText = "New item"
}) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [columns, setColumns] = useState(initialColumns);
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

  // Filter items based on search and active filters
  const filteredItems = items.filter(item => {
    // Search filter
    if (searchQuery) {
      const searchableFields = ['name', 'email', 'phone'];
      const matchesSearch = searchableFields.some(field => 
        item[field]?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (!matchesSearch) return false;
    }

    // Active filters
    for (const [filterKey, filterValues] of Object.entries(activeFilters)) {
      if (filterValues.length > 0 && !filterValues.includes(item[filterKey])) {
        return false;
      }
    }

    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleFilterChange = (filterKey: string, values: string[]) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: values
    }));
  };

  const handleColumnToggle = (columnKey: string) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'published':
        return 'green';
      case 'pending':
      case 'draft':
        return 'yellow';
      case 'inactive':
        return 'red';
      default:
        return 'gray';
    }
  };

  const visibleColumns = columns.filter(col => col.visible);
  const isAllSelected = selectedItems.length === filteredItems.length && filteredItems.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < filteredItems.length;

  return (
    <Container size="xl" className="ultra-container">
      {/* Header with Breadcrumbs */}
      <UltraCard className="ultra-header-card" p="md">
        <Stack gap="md">
          {/* Breadcrumbs */}
          <Breadcrumbs separator="›">
            {breadcrumbs.map((item, index) => (
              <Anchor 
                key={index} 
                href={item.href} 
                size="sm"
                c={index === breadcrumbs.length - 1 ? 'dimmed' : undefined}
                fw={index === breadcrumbs.length - 1 ? 500 : 400}
              >
                {item.title}
              </Anchor>
            ))}
          </Breadcrumbs>

          {/* Title and Action Button */}
          <Group justify="space-between" align="center">
            <Text className="ultra-title" size="xl" fw={600}>
              {title}
            </Text>
            
            {onAdd && (
              <UltraButton
                leftSection={<IconPlus size={16} />}
                onClick={onAdd}
                size="sm"
              >
                {addButtonText}
              </UltraButton>
            )}
          </Group>
        </Stack>
      </UltraCard>

      {/* Filters and Controls Bar */}
      <UltraCard p="md">
        <Group justify="space-between" align="center">
          {/* Left side - Filters */}
          <Group gap="md">
            {filters.map(filter => (
              <Menu key={filter.key} position="bottom-start">
                <Menu.Target>
                  <Button
                    variant="outline"
                    size="sm"
                    rightSection={<IconChevronDown size={14} />}
                    color={activeFilters[filter.key]?.length > 0 ? 'blue' : 'gray'}
                  >
                    {filter.label}
                    {activeFilters[filter.key]?.length > 0 && (
                      <Badge size="xs" ml="xs" color="blue">
                        {activeFilters[filter.key].length}
                      </Badge>
                    )}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <MultiSelect
                    data={filter.options}
                    value={activeFilters[filter.key] || []}
                    onChange={(values) => handleFilterChange(filter.key, values)}
                    placeholder={`Select ${filter.label.toLowerCase()}`}
                    searchable
                    clearable
                    w={200}
                  />
                </Menu.Dropdown>
              </Menu>
            ))}
          </Group>

          {/* Search */}
          <UltraInput
            placeholder={searchPlaceholder}
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            w={300}
          />

          {/* Right side - Controls */}
          <Group gap="xs">
            {/* Columns */}
            <Button
              variant="outline"
              size="sm"
              leftSection={<IconColumns size={16} />}
              onClick={() => setColumnsModalOpen(true)}
            >
              Columns
            </Button>

            {/* Filters */}
            <Button
              variant="outline"
              size="sm"
              leftSection={<IconFilter size={16} />}
              color={Object.values(activeFilters).some(arr => arr.length > 0) ? 'blue' : 'gray'}
            >
              Filters
              {Object.values(activeFilters).reduce((acc, arr) => acc + arr.length, 0) > 0 && (
                <Badge size="xs" ml="xs" color="blue">
                  {Object.values(activeFilters).reduce((acc, arr) => acc + arr.length, 0)}
                </Badge>
              )}
            </Button>

            {/* Export */}
            <Button
              variant="outline"
              size="sm"
              leftSection={<IconDownload size={16} />}
              onClick={() => onExport?.(selectedItems)}
              disabled={selectedItems.length === 0}
            >
              Export
            </Button>

            {/* Settings */}
            <Menu opened={settingsMenuOpen} onClose={() => setSettingsMenuOpen(false)}>
              <Menu.Target>
                <ActionIcon 
                  variant="outline" 
                  size="md"
                  onClick={() => setSettingsMenuOpen(true)}
                >
                  <IconSettings size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item icon={<IconColumns size={14} />}>
                  Customize columns
                </Menu.Item>
                <Menu.Item icon={<IconDownload size={14} />}>
                  Export options
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item icon={<IconSettings size={14} />}>
                  Settings
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </UltraCard>

      {/* Selection Info */}
      {selectedItems.length > 0 && (
        <UltraCard p="sm" bg="blue.0">
          <Group justify="space-between">
            <Text size="sm" c="blue.7">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </Text>
            <Group gap="xs">
              <Button size="xs" variant="outline" color="blue">
                Bulk edit
              </Button>
              <Button size="xs" variant="outline" color="red">
                Delete selected
              </Button>
              <Button 
                size="xs" 
                variant="subtle" 
                onClick={() => setSelectedItems([])}
              >
                Clear selection
              </Button>
            </Group>
          </Group>
        </UltraCard>
      )}

      {/* Data Table */}
      <UltraCard>
        <UltraTable variant="glass" hoverable>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                />
              </th>
              {visibleColumns.map(column => (
                <th key={column.key} style={{ width: column.width }}>
                  {column.label}
                </th>
              ))}
              <th style={{ width: '80px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => handleSelectItem(item.id, e.currentTarget.checked)}
                  />
                </td>
                {visibleColumns.map(column => (
                  <td key={column.key}>
                    {column.key === 'name' && item.avatar ? (
                      <Group gap="sm">
                        <Avatar src={item.avatar} size="sm" radius="xl">
                          {item.name?.charAt(0)}
                        </Avatar>
                        <div>
                          <Text fw={500} size="sm">{item.name}</Text>
                          {item.email && (
                            <Text size="xs" c="dimmed">{item.email}</Text>
                          )}
                        </div>
                      </Group>
                    ) : column.key === 'status' ? (
                      <Badge 
                        color={getStatusColor(item.status)} 
                        variant="light"
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    ) : column.key === 'createdAt' ? (
                      <div>
                        <Text size="sm">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </Text>
                      </div>
                    ) : (
                      <Text size="sm">{item[column.key]}</Text>
                    )}
                  </td>
                ))}
                <td>
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" size="sm">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item 
                        icon={<IconEye size={14} />}
                        onClick={() => console.log('View', item)}
                      >
                        View
                      </Menu.Item>
                      <Menu.Item 
                        icon={<IconEdit size={14} />}
                        onClick={() => onEdit?.(item)}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item 
                        icon={<IconTrash size={14} />}
                        color="red"
                        onClick={() => onDelete?.(item)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </UltraTable>

        {/* Pagination */}
        {totalPages > 1 && (
          <>
            <Divider my="md" />
            <Center>
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={onPageChange}
                size="sm"
              />
            </Center>
          </>
        )}
      </UltraCard>

      {/* Column Management Modal */}
      <Modal
        opened={columnsModalOpen}
        onClose={() => setColumnsModalOpen(false)}
        title="Manage Columns"
        size="sm"
      >
        <Stack>
          {columns.map(column => (
            <Group key={column.key} justify="space-between">
              <Text size="sm">{column.label}</Text>
              <Checkbox
                checked={column.visible}
                onChange={() => handleColumnToggle(column.key)}
              />
            </Group>
          ))}
        </Stack>
      </Modal>
    </Container>
  );
};

export default EnhancedListPage;
