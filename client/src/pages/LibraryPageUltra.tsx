import React, { useState, useEffect } from "react";
import {
  Container,
  Group,
  Text,
  SimpleGrid,
  Stack,
  ActionIcon,
} from "@mantine/core";
import {
  IconBooks,
  IconPlus,
  IconSearch,
  IconBookUpload,
  IconBookDownload,
  IconReportAnalytics,
  IconEye,
  IconEdit,
  IconTrash,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  UltraCard,
  UltraButton,
  UltraInput,
  UltraSelect,
  UltraTable,
  UltraTableActions,
  UltraTableBadge,
  UltraModal,
} from "../components/ui";

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: "available" | "issued" | "reserved" | "maintenance";
  copies: number;
  availableCopies: number;
  publishedYear: number;
  createdAt: string;
}

interface BookIssue {
  id: number;
  bookId: number;
  bookTitle: string;
  studentId: number;
  studentName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: "issued" | "returned" | "overdue";
  fine?: number;
}

const LibraryPageUltra: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedIssue, setSelectedIssue] = useState<BookIssue | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"books" | "issues">("books");

  // Mock data for demonstration
  useEffect(() => {
    const mockBooks: Book[] = [
      {
        id: 1,
        title: "JS: The Good Parts",
        author: "Douglas Crockford",
        isbn: "978-0596517748",
        category: "Programming",
        status: "available",
        copies: 5,
        availableCopies: 3,
        publishedYear: 2008,
        createdAt: "2024-01-15",
      },
      {
        id: 2,
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "978-0132350884",
        category: "Programming",
        status: "issued",
        copies: 3,
        availableCopies: 1,
        publishedYear: 2008,
        createdAt: "2024-01-16",
      },
      {
        id: 3,
        title: "Mathematics for Physics",
        author: "Paul Bamberg",
        isbn: "978-0521654128",
        category: "Mathematics",
        status: "available",
        copies: 2,
        availableCopies: 2,
        publishedYear: 2010,
        createdAt: "2024-01-17",
      },
    ];

    const mockIssues: BookIssue[] = [
      {
        id: 1,
        bookId: 2,
        bookTitle: "Clean Code",
        studentId: 1001,
        studentName: "John Doe",
        issueDate: "2024-01-20",
        dueDate: "2024-02-05",
        status: "issued",
      },
      {
        id: 2,
        bookId: 1,
        bookTitle: "JS: The Good Parts",
        studentId: 1002,
        studentName: "Jane Smith",
        issueDate: "2024-01-15",
        dueDate: "2024-01-30",
        returnDate: "2024-01-28",
        status: "returned",
      },
      {
        id: 3,
        bookId: 2,
        bookTitle: "Clean Code",
        studentId: 1003,
        studentName: "Bob Johnson",
        issueDate: "2024-01-10",
        dueDate: "2024-01-25",
        status: "overdue",
        fine: 50,
      },
    ];

    setBooks(mockBooks);
    setIssues(mockIssues);
  }, []);

  const handleBookSubmit = (formData: any) => {
    if (selectedBook) {
      // Update existing book
      setBooks(
        books.map((book) =>
          book.id === selectedBook.id
            ? { ...book, ...formData, id: selectedBook.id }
            : book
        )
      );
    } else {
      // Add new book
      const newBook: Book = {
        ...formData,
        id: Math.max(...books.map((b) => b.id), 0) + 1,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setBooks([...books, newBook]);
    }
    setIsBookModalOpen(false);
    setSelectedBook(null);
  };

  const handleIssueBook = (formData: any) => {
    const newIssue: BookIssue = {
      ...formData,
      id: Math.max(...issues.map((i) => i.id), 0) + 1,
      issueDate: new Date().toISOString().split("T")[0],
      status: "issued",
    };
    setIssues([...issues, newIssue]);

    // Update book available copies
    setBooks(
      books.map((book) =>
        book.id === formData.bookId
          ? { ...book, availableCopies: book.availableCopies - 1 }
          : book
      )
    );

    setIsIssueModalOpen(false);
  };

  const handleReturnBook = (issueId: number) => {
    setIssues(
      issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status: "returned",
              returnDate: new Date().toISOString().split("T")[0],
            }
          : issue
      )
    );

    const returnedIssue = issues.find((i) => i.id === issueId);
    if (returnedIssue) {
      setBooks(
        books.map((book) =>
          book.id === returnedIssue.bookId
            ? { ...book, availableCopies: book.availableCopies + 1 }
            : book
        )
      );
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);
    const matchesCategory = !filterCategory || book.category === filterCategory;
    const matchesStatus = !filterStatus || book.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
  const stats = [
    {
      title: "Total Books",
      value: books.length.toString(),
      icon: IconBooks,
      color: "blue",
    },
    {
      title: "Available Books",
      value: books.filter((b) => b.status === "available").length.toString(),
      icon: IconCheck,
      color: "green",
    },
    {
      title: "Books Issued",
      value: issues.filter((i) => i.status === "issued").length.toString(),
      icon: IconBookDownload,
      color: "yellow",
    },
    {
      title: "Overdue Books",
      value: issues.filter((i) => i.status === "overdue").length.toString(),
      icon: IconAlertCircle,
      color: "red",
    },
  ];

  return (
    <Container size="xl" className="ultra-container">
      {/* Header */}
      <UltraCard className="ultra-header-card">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text className="ultra-title">Library Management</Text>
            <Text className="ultra-subtitle">
              Manage books, issues, and library operations with advanced
              tracking
            </Text>
          </div>
          <Group>
            <UltraButton
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setSelectedBook(null);
                setIsBookModalOpen(true);
              }}
            >
              Add Book
            </UltraButton>
            <UltraButton
              variant="outline"
              leftSection={<IconBookUpload size={16} />}
              onClick={() => {
                setSelectedIssue(null);
                setIsIssueModalOpen(true);
              }}
            >
              Issue Book
            </UltraButton>
          </Group>
        </Group>
      </UltraCard>{" "}
      {/* Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} className="ultra-stats-grid">
        {stats.map((stat) => (
          <UltraCard key={stat.title} className="ultra-stat-card">
            <Group justify="space-between">
              <div>
                <Text className="ultra-stat-label">{stat.title}</Text>
                <Text className="ultra-stat-value">{stat.value}</Text>
              </div>
              <div
                className="ultra-stat-icon"
                style={{ color: `var(--mantine-color-${stat.color}-6)` }}
              >
                <stat.icon size={32} />
              </div>
            </Group>
          </UltraCard>
        ))}
      </SimpleGrid>
      {/* Filters and Search */}
      <UltraCard>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group>
              {" "}
              <UltraButton
                variant={activeTab === "books" ? "primary" : "outline"}
                onClick={() => setActiveTab("books")}
                leftSection={<IconBooks size={16} />}
              >
                Books
              </UltraButton>
              <UltraButton
                variant={activeTab === "issues" ? "primary" : "outline"}
                onClick={() => setActiveTab("issues")}
                leftSection={<IconBookDownload size={16} />}
              >
                Issues
              </UltraButton>
            </Group>
            <UltraButton
              variant="outline"
              leftSection={<IconReportAnalytics size={16} />}
            >
              Reports
            </UltraButton>
          </Group>

          <Group gap="md">
            <UltraInput
              placeholder="Search books, authors, or ISBN..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            {activeTab === "books" && (
              <>
                <UltraSelect
                  placeholder="Category"
                  data={[
                    { value: "", label: "All Categories" },
                    { value: "Programming", label: "Programming" },
                    { value: "Mathematics", label: "Mathematics" },
                    { value: "Physics", label: "Physics" },
                    { value: "Chemistry", label: "Chemistry" },
                  ]}
                  value={filterCategory}
                  onChange={(value) => setFilterCategory(value || "")}
                />
                <UltraSelect
                  placeholder="Status"
                  data={[
                    { value: "", label: "All Status" },
                    { value: "available", label: "Available" },
                    { value: "issued", label: "Issued" },
                    { value: "reserved", label: "Reserved" },
                    { value: "maintenance", label: "Maintenance" },
                  ]}
                  value={filterStatus}
                  onChange={(value) => setFilterStatus(value || "")}
                />
              </>
            )}
          </Group>
        </Stack>
      </UltraCard>{" "}
      {/* Data Table */}
      <UltraCard>
        {activeTab === "books" ? (
          <UltraTable variant="glass" hoverable>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Status</th>
                <th>Copies</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td>
                    <Text fw={500}>{book.title}</Text>
                  </td>
                  <td>
                    <Text size="sm" c="dimmed">
                      {book.author}
                    </Text>
                  </td>
                  <td>
                    <Text size="sm">{book.isbn}</Text>
                  </td>
                  <td>
                    <Text size="sm">{book.category}</Text>
                  </td>
                  <td>
                    {(() => {
                      let variant: "success" | "warning" | "info" | "error" =
                        "success";
                      if (book.status === "issued") variant = "warning";
                      else if (book.status === "reserved") variant = "info";
                      else if (book.status === "maintenance") variant = "error";

                      return (
                        <UltraTableBadge variant={variant}>
                          {book.status}
                        </UltraTableBadge>
                      );
                    })()}
                  </td>
                  <td>
                    <Text size="sm">
                      {book.availableCopies}/{book.copies}
                    </Text>
                  </td>
                  <td>
                    <UltraTableActions>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          setSelectedBook(book);
                          setIsBookModalOpen(true);
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          setSelectedBook(book);
                          setIsBookModalOpen(true);
                        }}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        color="red"
                        onClick={() => {
                          setBooks(books.filter((b) => b.id !== book.id));
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </UltraTableActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </UltraTable>
        ) : (
          <UltraTable variant="glass" hoverable>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Student</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Fine</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => (
                <tr key={issue.id}>
                  <td>
                    <Text fw={500}>{issue.bookTitle}</Text>
                  </td>
                  <td>
                    <Text size="sm" c="dimmed">
                      {issue.studentName}
                    </Text>
                  </td>
                  <td>
                    <Text size="sm">{issue.issueDate}</Text>
                  </td>
                  <td>
                    <Text size="sm">{issue.dueDate}</Text>
                  </td>
                  <td>
                    {(() => {
                      let variant: "success" | "warning" | "error" = "warning";
                      if (issue.status === "returned") variant = "success";
                      else if (issue.status === "overdue") variant = "error";

                      return (
                        <UltraTableBadge variant={variant}>
                          {issue.status}
                        </UltraTableBadge>
                      );
                    })()}
                  </td>
                  <td>
                    <Text size="sm">{issue.fine ? `₹${issue.fine}` : "-"}</Text>
                  </td>
                  <td>
                    <UltraTableActions>
                      {issue.status === "issued" && (
                        <UltraButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReturnBook(issue.id)}
                        >
                          Return
                        </UltraButton>
                      )}
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          setSelectedIssue(issue);
                          setIsIssueModalOpen(true);
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </UltraTableActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </UltraTable>
        )}
      </UltraCard>
      {/* Book Modal */}
      <UltraModal
        opened={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setSelectedBook(null);
        }}
        title={selectedBook ? "Edit Book" : "Add New Book"}
        size="lg"
      >
        <BookForm
          book={selectedBook}
          onSubmit={handleBookSubmit}
          onCancel={() => {
            setIsBookModalOpen(false);
            setSelectedBook(null);
          }}
        />
      </UltraModal>
      {/* Issue Book Modal */}
      <UltraModal
        opened={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setSelectedIssue(null);
        }}
        title={selectedIssue ? "View Issue Details" : "Issue Book"}
        size="md"
      >
        <IssueBookForm
          books={books.filter((b) => b.availableCopies > 0)}
          onSubmit={handleIssueBook}
          onCancel={() => {
            setIsIssueModalOpen(false);
            setSelectedIssue(null);
          }}
        />
      </UltraModal>
    </Container>
  );
};

// Book Form Component
const BookForm: React.FC<{
  book?: Book | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ book, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    isbn: book?.isbn || "",
    category: book?.category || "",
    status: book?.status || "available",
    copies: book?.copies || 1,
    availableCopies: book?.availableCopies || 1,
    publishedYear: book?.publishedYear || new Date().getFullYear(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <UltraInput
          label="Book Title"
          placeholder="Enter book title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <UltraInput
          label="Author"
          placeholder="Enter author name"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
        />

        <UltraInput
          label="ISBN"
          placeholder="Enter ISBN"
          value={formData.isbn}
          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          required
        />

        <UltraSelect
          label="Category"
          placeholder="Select category"
          data={[
            { value: "Programming", label: "Programming" },
            { value: "Mathematics", label: "Mathematics" },
            { value: "Physics", label: "Physics" },
            { value: "Chemistry", label: "Chemistry" },
            { value: "Biology", label: "Biology" },
            { value: "Literature", label: "Literature" },
          ]}
          value={formData.category}
          onChange={(value) =>
            setFormData({ ...formData, category: value || "" })
          }
          required
        />

        <Group grow>
          <UltraInput
            label="Total Copies"
            type="number"
            min={1}
            value={formData.copies}
            onChange={(e) =>
              setFormData({ ...formData, copies: parseInt(e.target.value) })
            }
            required
          />

          <UltraInput
            label="Published Year"
            type="number"
            min={1800}
            max={new Date().getFullYear()}
            value={formData.publishedYear}
            onChange={(e) =>
              setFormData({
                ...formData,
                publishedYear: parseInt(e.target.value),
              })
            }
            required
          />
        </Group>
        <UltraSelect
          label="Status"
          data={[
            { value: "available", label: "Available" },
            { value: "maintenance", label: "Maintenance" },
            { value: "reserved", label: "Reserved" },
          ]}
          value={formData.status}
          onChange={(value) =>
            setFormData({
              ...formData,
              status: (value as Book["status"]) || "available",
            })
          }
          required
        />

        <Group justify="flex-end" mt="md">
          <UltraButton variant="outline" onClick={onCancel}>
            Cancel
          </UltraButton>
          <UltraButton type="submit">
            {book ? "Update Book" : "Add Book"}
          </UltraButton>
        </Group>
      </Stack>
    </form>
  );
};

// Issue Book Form Component
const IssueBookForm: React.FC<{
  books: Book[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ books, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    bookId: 0,
    bookTitle: "",
    studentId: "",
    studentName: "",
    dueDate: "",
  });

  const handleBookChange = (bookId: string) => {
    const book = books.find((b) => b.id.toString() === bookId);
    setFormData({
      ...formData,
      bookId: parseInt(bookId),
      bookTitle: book?.title || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now
    onSubmit({
      ...formData,
      dueDate: dueDate.toISOString().split("T")[0],
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <UltraSelect
          label="Select Book"
          placeholder="Choose a book to issue"
          data={books.map((book) => ({
            value: book.id.toString(),
            label: `${book.title} - ${book.author} (${book.availableCopies} available)`,
          }))}
          value={formData.bookId.toString()}
          onChange={(value) => handleBookChange(value || "")}
          required
        />

        <UltraInput
          label="Student ID"
          placeholder="Enter student ID"
          value={formData.studentId}
          onChange={(e) =>
            setFormData({ ...formData, studentId: e.target.value })
          }
          required
        />

        <UltraInput
          label="Student Name"
          placeholder="Enter student name"
          value={formData.studentName}
          onChange={(e) =>
            setFormData({ ...formData, studentName: e.target.value })
          }
          required
        />

        <Group justify="flex-end" mt="md">
          <UltraButton variant="outline" onClick={onCancel}>
            Cancel
          </UltraButton>
          <UltraButton type="submit">Issue Book</UltraButton>
        </Group>
      </Stack>
    </form>
  );
};

export default LibraryPageUltra;
