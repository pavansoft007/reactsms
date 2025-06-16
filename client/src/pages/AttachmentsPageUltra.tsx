import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Group,
  Badge,
  Loader,
  Center,
  Avatar,
  Stack,
} from "@mantine/core";
import {
  IconPaperclip,
  IconPlus,
  IconSearch,
  IconEdit,
  IconDownload,
  IconFile,
  IconImage,
  IconFileText,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
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
import api from "../api/config";
import { useTheme } from "../context/ThemeContext";
import { useAcademicYear } from "../context/AcademicYearContext";

interface Attachment {
  id: number;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
  download_count: number;
  is_public: boolean;
  category: string;
  session_id: number;
}

interface Category {
  value: string;
  label: string;
}

const AttachmentsPageUltra: React.FC = () => {
  const { theme } = useTheme();
  const { academicYear } = useAcademicYear();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<Attachment | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    is_public: true,
  });

  const categories: Category[] = [
    { value: "documents", label: "Documents" },
    { value: "images", label: "Images" },
    { value: "videos", label: "Videos" },
    { value: "assignments", label: "Assignments" },
    { value: "reports", label: "Reports" },
    { value: "certificates", label: "Certificates" },
    { value: "others", label: "Others" },
  ];
  useEffect(() => {
    if (academicYear) {
      fetchAttachments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicYear]);

  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const params = academicYear?.id ? `?session_id=${academicYear.id}` : "";
      const response = await api.get(`/attachments${params}`);
      if (response.data.success) {
        setAttachments(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching attachments:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch attachments",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !editingAttachment) {
      notifications.show({
        title: "Error",
        message: "Please select a file to upload",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("is_public", formData.is_public.toString());
      formDataToSend.append("session_id", academicYear?.id?.toString() || "");

      if (selectedFile) {
        formDataToSend.append("file", selectedFile);
      }

      const url = editingAttachment
        ? `/attachments/${editingAttachment.id}`
        : "/attachments";
      const method = editingAttachment ? "put" : "post";

      const response = await api[method](url, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: `Attachment ${
            editingAttachment ? "updated" : "uploaded"
          } successfully`,
          color: "green",
        });
        setModalOpen(false);
        resetForm();
        fetchAttachments();
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Operation failed",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (attachment: Attachment) => {
    setEditingAttachment(attachment);
    setFormData({
      title: attachment.title,
      description: attachment.description || "",
      category: attachment.category,
      is_public: attachment.is_public,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this attachment?"))
      return;

    setLoading(true);
    try {
      const response = await api.delete(`/attachments/${id}`);
      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: "Attachment deleted successfully",
          color: "green",
        });
        fetchAttachments();
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to delete attachment",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const response = await api.get(`/attachments/${attachment.id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      notifications.show({
        title: "Success",
        message: "File downloaded successfully",
        color: "green",
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: "Failed to download file",
        color: "red",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      is_public: true,
    });
    setSelectedFile(null);
    setEditingAttachment(null);
  };

  const handleAddNew = () => {
    resetForm();
    setModalOpen(true);
  };

  // Filter attachments based on search and filters
  const filteredAttachments = attachments.filter((attachment) => {
    const matchesSearch =
      attachment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attachment.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attachment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || attachment.category === categoryFilter;
    const matchesType =
      typeFilter === "all" || attachment.file_type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <IconImage size={20} />;
    if (mimeType.includes("pdf")) return <IconFileText size={20} />;
    return <IconFile size={20} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Calculate stats
  const totalSize = attachments.reduce((sum, att) => sum + att.file_size, 0);
  const publicFiles = attachments.filter((att) => att.is_public).length;
  const totalDownloads = attachments.reduce(
    (sum, att) => sum + att.download_count,
    0
  );

  return (
    <Container size="xl" className="ultra-container">
      {/* Header */}
      <UltraCard className="mb-6">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title
              order={2}
              className="ultra-gradient-text"
              style={{ fontSize: "2rem", fontWeight: 700 }}
            >
              Attachments Management
            </Title>
            <Text c="dimmed" size="lg" mt="xs">
              Manage documents, files, and media attachments
            </Text>
            {academicYear && (
              <Badge variant="light" color="blue" mt="sm">
                Academic Year: {academicYear.school_year}
              </Badge>
            )}
          </div>
          <UltraButton
            leftSection={<IconPlus size={20} />}
            onClick={handleAddNew}
            size="lg"
            className="pulse-button"
          >
            Upload File
          </UltraButton>
        </Group>
      </UltraCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-blue-500/20 text-blue-400 mb-4">
            <IconPaperclip size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {filteredAttachments.length}
          </Text>
          <Text c="dimmed" size="sm">
            Total Files
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-green-500/20 text-green-400 mb-4">
            <IconFile size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {formatFileSize(totalSize)}
          </Text>
          <Text c="dimmed" size="sm">
            Total Size
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-orange-500/20 text-orange-400 mb-4">
            <IconImage size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {publicFiles}
          </Text>
          <Text c="dimmed" size="sm">
            Public Files
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-purple-500/20 text-purple-400 mb-4">
            <IconDownload size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {totalDownloads}
          </Text>
          <Text c="dimmed" size="sm">
            Downloads
          </Text>
        </UltraCard>
      </div>

      {/* Filters */}
      <UltraCard className="mb-6">
        <Group gap="md">
          <UltraInput
            placeholder="Search files..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <UltraSelect
            placeholder="Category"
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value || "all")}
            data={[{ value: "all", label: "All Categories" }, ...categories]}
            style={{ minWidth: 150 }}
          />
          <UltraSelect
            placeholder="File Type"
            value={typeFilter}
            onChange={(value) => setTypeFilter(value || "all")}
            data={[
              { value: "all", label: "All Types" },
              ...Array.from(
                new Set(attachments.map((att) => att.file_type))
              ).map((type) => ({
                value: type,
                label: type.toUpperCase(),
              })),
            ]}
            style={{ minWidth: 120 }}
          />
        </Group>
      </UltraCard>

      {/* Attachments Table */}
      <UltraCard>
        {loading ? (
          <Center h={200}>
            <Loader size="lg" />
          </Center>
        ) : (
          <UltraTable variant="glass" hoverable>
            <thead>
              <tr>
                <th>File</th>
                <th>Category</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Downloads</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttachments.map((attachment) => (
                <tr key={attachment.id}>
                  <td>
                    <Group gap="sm">
                      <Avatar
                        radius="xl"
                        size="md"
                        style={{
                          border: `2px solid ${theme.colors.primary}22`,
                        }}
                      >
                        {getFileIcon(attachment.mime_type)}
                      </Avatar>
                      <Stack gap={2}>
                        <Text fw={500} c={theme.text.primary}>
                          {attachment.title}
                        </Text>
                        <Text size="sm" c={theme.text.muted}>
                          {attachment.file_name}
                        </Text>
                      </Stack>
                    </Group>
                  </td>
                  <td>
                    <Badge variant="light" color="blue" size="sm">
                      {attachment.category}
                    </Badge>
                  </td>
                  <td>
                    <Text size="sm" c={theme.text.primary}>
                      {formatFileSize(attachment.file_size)}
                    </Text>
                  </td>
                  <td>
                    <Text size="sm" c={theme.text.primary}>
                      {attachment.uploaded_by}
                    </Text>
                  </td>
                  <td>
                    <Text size="sm" c={theme.text.primary}>
                      {new Date(attachment.uploaded_at).toLocaleDateString()}
                    </Text>
                  </td>
                  <td>
                    <Badge variant="light" color="green" size="sm">
                      {attachment.download_count}
                    </Badge>
                  </td>
                  <td>
                    <UltraTableBadge
                      variant={attachment.is_public ? "success" : "warning"}
                    >
                      {attachment.is_public ? "Public" : "Private"}
                    </UltraTableBadge>
                  </td>
                  <td>
                    <UltraTableActions>
                      <UltraButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(attachment)}
                      >
                        <IconDownload size={16} />
                      </UltraButton>
                      <UltraButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(attachment)}
                      >
                        <IconEdit size={16} />
                      </UltraButton>
                      <UltraButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(attachment.id)}
                      >
                        <IconPaperclip size={16} />
                      </UltraButton>
                    </UltraTableActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </UltraTable>
        )}
      </UltraCard>

      {/* Add/Edit Modal */}
      <UltraModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAttachment ? "Edit Attachment" : "Upload New File"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {!editingAttachment && (
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Select File
                </Text>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: "8px",
                    backgroundColor: theme.bg.input,
                    color: theme.text.primary,
                  }}
                  required={!editingAttachment}
                />
              </div>
            )}

            <UltraInput
              label="Title"
              placeholder="Enter file title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />

            <UltraInput
              label="Description"
              placeholder="Enter file description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />

            <UltraSelect
              label="Category"
              placeholder="Select category"
              value={formData.category}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value || "" }))
              }
              data={categories}
              required
            />

            <UltraSelect
              label="Visibility"
              value={formData.is_public ? "public" : "private"}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  is_public: value === "public",
                }))
              }
              data={[
                { value: "public", label: "Public (Visible to all)" },
                { value: "private", label: "Private (Restricted access)" },
              ]}
              required
            />
          </div>

          <Group justify="flex-end" mt="xl">
            <UltraButton
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </UltraButton>
            <UltraButton
              variant="primary"
              loading={loading}
              leftSection={
                editingAttachment ? (
                  <IconEdit size={16} />
                ) : (
                  <IconPlus size={16} />
                )
              }
              onClick={handleSubmit}
            >
              {editingAttachment ? "Update File" : "Upload File"}
            </UltraButton>
          </Group>
        </form>
      </UltraModal>
    </Container>
  );
};

export default AttachmentsPageUltra;
