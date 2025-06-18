import {
  Container,
  Title,
  Card,
  Group,
  Button,
  Text,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import {
  IconShoppingCart,
  IconUser,
  IconUsers,
  IconArrowRight,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const ListingPagesDemo = () => {
  const navigate = useNavigate();

  const listingPages = [
    {
      title: "Products Listing",
      description:
        "Modern product listing with advanced filtering, search, and management features",
      icon: <IconShoppingCart size={32} />,
      route: "/products",
      features: [
        "Advanced Search",
        "Stock Management",
        "Price Filtering",
        "Export Options",
      ],
    },
    {
      title: "Students Listing",
      description:
        "Comprehensive student management with class, section, and status filtering",
      icon: <IconUser size={32} />,
      route: "/students-list",
      features: [
        "Student Profiles",
        "Class Filtering",
        "Contact Management",
        "Admission Tracking",
      ],
    },
    {
      title: "Teachers Listing",
      description:
        "Professional teacher management with department and experience filtering",
      icon: <IconUsers size={32} />,
      route: "/teachers-list",
      features: [
        "Department Filtering",
        "Subject Management",
        "Experience Levels",
        "Qualification Tracking",
      ],
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack spacing="xl">
        <div>
          <Title order={1} mb="md">
            Ultra Listing Pages Demo
          </Title>
          <Text size="lg" c="dimmed">
            Explore our modern listing page implementations with advanced
            features like search, filtering, sorting, pagination, and bulk
            actions.
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
          {listingPages.map((page, index) => (
            <Card
              key={index}
              shadow="md"
              padding="lg"
              radius="md"
              withBorder
              style={{ height: "100%" }}
            >
              <Group mb="md">
                <div style={{ color: "#339af0" }}>{page.icon}</div>
                <Title order={3}>{page.title}</Title>
              </Group>

              <Text size="sm" c="dimmed" mb="md" style={{ minHeight: 60 }}>
                {page.description}
              </Text>

              <Stack spacing="xs" mb="md">
                <Text size="sm" fw={500}>
                  Features:
                </Text>
                {page.features.map((feature, featureIndex) => (
                  <Text key={featureIndex} size="xs" c="dimmed">
                    • {feature}
                  </Text>
                ))}
              </Stack>

              <Button
                variant="light"
                rightSection={<IconArrowRight size={16} />}
                onClick={() => navigate(page.route)}
                fullWidth
                mt="auto"
              >
                View Demo
              </Button>
            </Card>
          ))}
        </SimpleGrid>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            Implementation Features
          </Title>
          <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md">
            <div>
              <Text fw={500} mb="xs">
                Search & Filter
              </Text>
              <Text size="sm" c="dimmed">
                Real-time search with advanced filtering options including
                select, multiselect, and date filters.
              </Text>
            </div>
            <div>
              <Text fw={500} mb="xs">
                Sorting & Pagination
              </Text>
              <Text size="sm" c="dimmed">
                Click-to-sort columns with configurable pagination and page size
                options.
              </Text>
            </div>
            <div>
              <Text fw={500} mb="xs">
                Bulk Actions
              </Text>
              <Text size="sm" c="dimmed">
                Multi-row selection with bulk operations like delete, export,
                and custom actions.
              </Text>
            </div>
            <div>
              <Text fw={500} mb="xs">
                Export & Settings
              </Text>
              <Text size="sm" c="dimmed">
                Export data in multiple formats with column management and
                layout customization.
              </Text>
            </div>
          </SimpleGrid>
        </Card>
      </Stack>
    </Container>
  );
};

export default ListingPagesDemo;
