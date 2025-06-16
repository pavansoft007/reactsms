import React, { useState, useEffect, useCallback } from "react";
import { Badge, Avatar, Group, Text, ActionIcon, Menu } from "@mantine/core";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconDots,
  IconShoppingCart,
} from "@tabler/icons-react";
import { UltraListPage } from "../components/ui/UltraListPage";
import { notifications } from "@mantine/notifications";

interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  price: number;
  stock: number;
  status: "published" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const loadProducts = useCallback(async () => {
    setLoading(true);

    // Mock data - replace with actual API calls
    const mockProducts: Product[] = [
      {
        id: 1,
        name: "Urban Explorer Sneakers",
        category: "Accessories",
        image: "/api/placeholder/40/40",
        price: 83.74,
        stock: 0,
        status: "draft",
        createdAt: "2025-06-16T21:21:00Z",
        updatedAt: "2025-06-16T21:21:00Z",
      },
      {
        id: 2,
        name: "Classic Leather Loafers",
        category: "Shoes",
        image: "/api/placeholder/40/40",
        price: 97.14,
        stock: 72,
        status: "published",
        createdAt: "2025-06-15T20:21:00Z",
        updatedAt: "2025-06-15T20:21:00Z",
      },
      {
        id: 3,
        name: "Running Pro Max",
        category: "Sports",
        image: "/api/placeholder/40/40",
        price: 129.99,
        stock: 15,
        status: "published",
        createdAt: "2025-06-14T19:21:00Z",
        updatedAt: "2025-06-14T19:21:00Z",
      },
      {
        id: 4,
        name: "Casual Canvas Shoes",
        category: "Casual",
        image: "/api/placeholder/40/40",
        price: 45.5,
        stock: 3,
        status: "published",
        createdAt: "2025-06-13T18:21:00Z",
        updatedAt: "2025-06-13T18:21:00Z",
      },
      {
        id: 5,
        name: "Elite Performance Boots",
        category: "Boots",
        image: "/api/placeholder/40/40",
        price: 189.99,
        stock: 28,
        status: "draft",
        createdAt: "2025-06-12T17:21:00Z",
        updatedAt: "2025-06-12T17:21:00Z",
      },
    ];

    // Simulate API call
    setTimeout(() => {
      let filteredProducts = [...mockProducts];

      // Apply search filter
      if (searchQuery) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply filters
      if (filters.stock && filters.stock !== "all") {
        switch (filters.stock) {
          case "in-stock":
            filteredProducts = filteredProducts.filter((p) => p.stock > 5);
            break;
          case "low-stock":
            filteredProducts = filteredProducts.filter(
              (p) => p.stock > 0 && p.stock <= 5
            );
            break;
          case "out-of-stock":
            filteredProducts = filteredProducts.filter((p) => p.stock === 0);
            break;
        }
      }

      if (filters.status && filters.status !== "all") {
        filteredProducts = filteredProducts.filter(
          (p) => p.status === filters.status
        );
      }

      setProducts(filteredProducts);
      setLoading(false);
    }, 500);
  }, [searchQuery, filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, currentPage, pageSize]);

  const handleCreateProduct = () => {
    notifications.show({
      title: "Create Product",
      message: "Opening product creation form...",
      color: "blue",
    });
  };

  const handleEditProduct = (product: Product) => {
    notifications.show({
      title: "Edit Product",
      message: `Editing ${product.name}...`,
      color: "blue",
    });
  };

  const handleDeleteProduct = (product: Product) => {
    notifications.show({
      title: "Delete Product",
      message: `Deleting ${product.name}...`,
      color: "red",
    });
  };

  const handleViewProduct = (product: Product) => {
    notifications.show({
      title: "View Product",
      message: `Opening ${product.name} details...`,
      color: "green",
    });
  };

  const handleBulkDelete = (selectedIds: string[]) => {
    notifications.show({
      title: "Bulk Delete",
      message: `Deleting ${selectedIds.length} products...`,
      color: "red",
    });
  };

  const handleExport = (format: string) => {
    notifications.show({
      title: "Export",
      message: `Exporting products as ${format.toUpperCase()}...`,
      color: "blue",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      "\n" +
      date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <Badge color="red" variant="light">
          out of stock
        </Badge>
      );
    } else if (stock <= 5) {
      return (
        <Badge color="yellow" variant="light">
          {stock} in stock
        </Badge>
      );
    } else {
      return (
        <Badge color="green" variant="light">
          {stock} in stock
        </Badge>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      published: "blue",
      draft: "gray",
      archived: "red",
    };
    return (
      <Badge
        color={colors[status as keyof typeof colors]}
        variant={status === "published" ? "filled" : "light"}
        tt="capitalize"
      >
        {status}
      </Badge>
    );
  };

  const columns = [
    {
      key: "product",
      label: "Product",
      sortable: true,
      render: (value: any, row: Product) => (
        <Group gap="sm">
          <Avatar
            src={row.image}
            alt={row.name}
            size="md"
            radius="md"
            style={{ border: "1px solid #e0e0e0" }}
          />
          <div>
            <Text fw={500} size="sm" lineClamp={1}>
              {row.name}
            </Text>
            <Text size="xs" c="dimmed">
              {row.category}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: "createdAt",
      label: "Create at",
      sortable: true,
      render: (value: string) => (
        <Text size="sm" style={{ whiteSpace: "pre-line" }}>
          {formatDate(value)}
        </Text>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      align: "center" as const,
      render: (value: number) => getStockBadge(value),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      align: "right" as const,
      render: (value: number) => (
        <Text fw={500} size="sm">
          ${value.toFixed(2)}
        </Text>
      ),
    },
    {
      key: "status",
      label: "Publish",
      sortable: true,
      align: "center" as const,
      render: (value: string) => getStatusBadge(value),
    },
  ];

  const filterOptions = [
    {
      key: "stock",
      label: "Stock Status",
      type: "select" as const,
      options: [
        { label: "All Stock", value: "all" },
        { label: "In Stock", value: "in-stock" },
        { label: "Low Stock", value: "low-stock" },
        { label: "Out of Stock", value: "out-of-stock" },
      ],
    },
    {
      key: "status",
      label: "Publish Status",
      type: "select" as const,
      options: [
        { label: "All", value: "all" },
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
        { label: "Archived", value: "archived" },
      ],
    },
    {
      key: "category",
      label: "Category",
      type: "multiselect" as const,
      options: [
        { label: "Accessories", value: "accessories" },
        { label: "Shoes", value: "shoes" },
        { label: "Sports", value: "sports" },
        { label: "Casual", value: "casual" },
        { label: "Boots", value: "boots" },
      ],
    },
  ];

  return (
    <UltraListPage
      title="List"
      data={products}
      columns={columns}
      loading={loading}
      searchable
      filterable
      exportable
      selectable
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Product", href: "/products" },
        { label: "List" },
      ]}
      pagination={{
        page: currentPage,
        pageSize: pageSize,
        total: products.length * 2, // Mock total for demonstration
        onPageChange: setCurrentPage,
        onPageSizeChange: setPageSize,
      }}
      actions={{
        create: {
          label: "New product",
          onClick: handleCreateProduct,
        },
        bulk: [
          {
            label: "Delete Selected",
            icon: <IconTrash size={16} />,
            onClick: handleBulkDelete,
            color: "red",
          },
        ],
        row: [
          {
            label: "View",
            icon: <IconEye size={16} />,
            onClick: handleViewProduct,
          },
          {
            label: "Edit",
            icon: <IconEdit size={16} />,
            onClick: handleEditProduct,
          },
          {
            label: "Delete",
            icon: <IconTrash size={16} />,
            onClick: handleDeleteProduct,
            color: "red",
          },
        ],
      }}
      filters={filterOptions}
      onSearch={(query) => setSearchQuery(query)}
      onFilter={(filterValues) => setFilters(filterValues)}
      onSort={(column, direction) => {
        console.log("Sort:", column, direction);
        // Implement sorting logic
      }}
      onExport={handleExport}
      onRefresh={loadProducts}
      emptyState={{
        title: "No products found",
        description: "Get started by creating your first product.",
        icon: <IconShoppingCart size={48} stroke={1.5} color="#9ca3af" />,
        action: {
          label: "Create Product",
          onClick: handleCreateProduct,
        },
      }}
      renderRowActions={(row: Product) => (
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="subtle" size="sm">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={16} />}
              onClick={() => handleViewProduct(row)}
            >
              View Details
            </Menu.Item>
            <Menu.Item
              leftSection={<IconEdit size={16} />}
              onClick={() => handleEditProduct(row)}
            >
              Edit Product
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconTrash size={16} />}
              color="red"
              onClick={() => handleDeleteProduct(row)}
            >
              Delete Product
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    />
  );
};

export default ProductsPage;
