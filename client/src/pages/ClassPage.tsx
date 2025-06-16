import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Button,
  Table,
  TextInput,
  Group,
  LoadingOverlay,
  Tabs,
  Stack,
  Select,
  Text,
  MultiSelect,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconList,
  IconSchool,
  IconNews,
  IconLink,
} from "@tabler/icons-react";
import api from "../api/config";

interface ClassType {
  id: number;
  name: string;
  branch_id: number;
  numeric_name?: number;
  rank_order?: number;
  is_active?: boolean;
  sections?: SectionType[];
}

interface SectionType {
  id: number;
  name: string;
  branch_id: number;
  capacity?: number;
  is_active?: boolean;
  classes?: ClassType[];
}

interface Branch {
  id: number;
  name: string;
}

interface ClassSectionAllocation {
  id: number;
  class_id: number;
  section_id: number;
  className?: string;
  sectionName?: string;
}

const ClassPage: React.FC = () => {
  // State
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allocations, setAllocations] = useState<ClassSectionAllocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [mainTab, setMainTab] = useState<string>("class");
  const [classTab, setClassTab] = useState<string>("list");
  const [sectionTab, setSectionTab] = useState<string>("list");
  const [allocTab, setAllocTab] = useState<string>("list");
  const [editingClass, setEditingClass] = useState<ClassType | null>(null);
  const [editingSection, setEditingSection] = useState<SectionType | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Form states
  const classForm = useForm({
    initialValues: {
      name: "",
      branch_id: "",
      numeric_name: "",
      rank_order: "",
      is_active: true,
    },
    validate: {
      name: (value: string) =>
        !value || value.trim().length === 0
          ? "Class name is required"
          : null,
      branch_id: (value: string) =>
        !value || value.trim().length === 0
          ? "Branch ID is required"
          : null,
    },
  });

  const sectionForm = useForm({
    initialValues: {
      name: "",
      branch_id: "",
      capacity: "",
      is_active: true,
    },
    validate: {
      name: (value: string) =>
        !value || value.trim().length === 0
          ? "Section name is required"
          : null,
      branch_id: (value: string) =>
        !value || value.trim().length === 0
          ? "Branch ID is required"
          : null,
    },
  });
  
  const allocForm = useForm({
    initialValues: {
      class_id: "",
      section_id: "",
    },
    validate: {
      class_id: (value: string) =>
        !value || value.trim().length === 0
          ? "Class is required"
          : null,
      section_id: (value: string) =>
        !value || value.trim().length === 0
          ? "Section is required"
          : null,
    },
  });

  // API Calls
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/classes");
      setClasses(res.data.data || []);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch classes",
        color: "red",
      });
    }
    setLoading(false);
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/sections");
      setSections(res.data.data || []);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch sections",
        color: "red",
      });
    }
    setLoading(false);
  };
  
  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/sections-allocation");
      setAllocations(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch allocations:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
    fetchSections();
    fetchBranches();
    fetchAllocations();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await api.get("/api/branches");
      setBranches(response.data.data || []);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch branches",
        color: "red",
      });
    }
  };

  // Handle adding a new section directly from class form
  const handleAddSection = async () => {
    if (!newSectionName.trim() || !classForm.values.branch_id) return;
    try {
      const res = await api.post("/api/sections", {
        name: newSectionName,
        branch_id: classForm.values.branch_id,
      });
      setSections([...sections, res.data.data]);
      setSelectedSectionIds([
        ...selectedSectionIds,
        res.data.data.id.toString(),
      ]);
      setNewSectionName("");
      notifications.show({
        title: "Section Created",
        message: res.data.data.name,
        color: "green",
      });
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed to create section",
        color: "red",
      });
    }
  };

  // Form Handlers
  const handleClassSubmit = async (values: typeof classForm.values) => {
    try {
      setValidationErrors([]);

      // Format values for API
      const formattedValues = {
        ...values,
        numeric_name: values.numeric_name ? parseInt(values.numeric_name) : null,
        rank_order: values.rank_order ? parseInt(values.rank_order) : null,
      };

      if (editingClass) {
        await api.put(`/api/classes/${editingClass.id}`, formattedValues);
        notifications.show({
          title: "Success",
          message: "Class updated",
          color: "green",
        });
      } else {
        await api.post("/api/classes", formattedValues);
        notifications.show({
          title: "Success",
          message: "Class created",
          color: "green",
        });
      }

      resetClassForm();
      fetchClasses();
      setClassTab("list");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map((e: any) =>
          `${e.field}: ${e.message}`
        );
        setValidationErrors(errorMessages);
      } else {
        setValidationErrors([err.response?.data?.message || "Failed"]);
      }
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed",
        color: "red",
      });
    }
  };

  const handleSectionSubmit = async (values: typeof sectionForm.values) => {
    try {
      setValidationErrors([]);

      // Format values for API
      const formattedValues = {
        ...values,
        capacity: values.capacity ? parseInt(values.capacity) : null,
      };

      if (editingSection) {
        await api.put(`/api/sections/${editingSection.id}`, formattedValues);
        notifications.show({
          title: "Success",
          message: "Section updated",
          color: "green",
        });
      } else {
        await api.post("/api/sections", formattedValues);
        notifications.show({
          title: "Success",
          message: "Section created",
          color: "green",
        });
      }

      resetSectionForm();
      fetchSections();
      setSectionTab("list");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map((e: any) => 
          `${e.field}: ${e.message}`
        );
        setValidationErrors(errorMessages);
      } else {
        setValidationErrors([err.response?.data?.message || "Failed"]);
      }
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed",
        color: "red",
      });
    }
  };
  
  const handleAllocationSubmit = async (values: typeof allocForm.values) => {
    try {
      setValidationErrors([]);
      
      await api.post("/api/sections-allocation", {
        class_id: parseInt(values.class_id),
        section_id: parseInt(values.section_id)
      });
      
      notifications.show({
        title: "Success",
        message: "Section assigned to class successfully",
        color: "green",
      });
      
      allocForm.reset();
      fetchAllocations();
      fetchClasses();
      fetchSections();
      setAllocTab("list");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map((e: any) => 
          `${e.field}: ${e.message}`
        );
        setValidationErrors(errorMessages);
      } else {
        setValidationErrors([err.response?.data?.message || "Failed"]);
      }
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed",
        color: "red",
      });
    }
  };

  // Reset Form Functions
  const resetClassForm = () => {
    classForm.reset();
    setEditingClass(null);
    setValidationErrors([]);
  };

  const resetSectionForm = () => {
    sectionForm.reset();
    setEditingSection(null);
    setValidationErrors([]);
  };

  // Edit Handlers
  const handleEditClass = (cls: ClassType) => {
    setEditingClass(cls);
    classForm.setValues({
      ...cls,
      branch_id: cls.branch_id?.toString() || "",
      numeric_name: cls.numeric_name?.toString() || "",
      rank_order: cls.rank_order?.toString() || "",
    });

    // Set selected sections if any
    if (cls.sections) {
      setSelectedSectionIds(cls.sections.map((s) => s.id.toString()));
    } else {
      setSelectedSectionIds([]);
    }

    setClassTab("create");
  };

  const handleEditSection = (section: SectionType) => {
    setEditingSection(section);
    sectionForm.setValues({
      ...section,
      branch_id: section.branch_id?.toString() || "",
      capacity: section.capacity?.toString() || "",
    });

    // Set selected class if any
    if (section.classes && section.classes.length > 0) {
      setSelectedClassId(section.classes[0].id.toString());
    } else {
      setSelectedClassId("");
    }

    setSectionTab("create");
  };

  // Delete Handlers
  const handleDeleteClass = async (id: number) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      await api.delete(`/api/classes/${id}`);
      notifications.show({
        title: "Deleted",
        message: "Class deleted",
        color: "green",
      });
      fetchClasses();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to delete",
        color: "red",
      });
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (!window.confirm("Delete this section?")) return;
    try {
      await api.delete(`/api/sections/${id}`);
      notifications.show({
        title: "Deleted",
        message: "Section deleted",
        color: "green",
      });
      fetchSections();
      fetchClasses(); // Refresh classes to update section assignments
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to delete",
        color: "red",
      });
    }
  };
  
  const handleDeleteAllocation = async (classId: number, sectionId: number) => {
    if (!window.confirm("Remove this assignment?")) return;
    try {
      await api.delete(`/api/sections-allocation/${classId}/${sectionId}`);
      notifications.show({
        title: "Success",
        message: "Assignment removed",
        color: "green",
      });
      fetchAllocations();
      fetchClasses();
      fetchSections();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to remove assignment",
        color: "red",
      });
    }
  };

  return (
    <Container size="xl" py="md">
      <Paper shadow="sm" p="md" radius="md">
        <div style={{ position: "relative" }}>
          <LoadingOverlay visible={loading} />
          
          <Tabs value={mainTab} onChange={(value) => setMainTab(value || "class")}>
            <Tabs.List>
              <Tabs.Tab
                value="class"
                leftSection={<IconSchool size={16} />}
              >
                Classes
              </Tabs.Tab>
              <Tabs.Tab
                value="section"
                leftSection={<IconNews size={16} />}
              >
                Sections
              </Tabs.Tab>
              <Tabs.Tab
                value="assign"
                leftSection={<IconLink size={16} />}
              >
                Assign
              </Tabs.Tab>
            </Tabs.List>

            {/* CLASSES TAB */}
            <Tabs.Panel value="class" pt="xs">
              <Tabs value={classTab} onChange={(value) => setClassTab(value || "list")}>
                <Tabs.List>
                  <Tabs.Tab
                    value="list"
                    leftSection={<IconList size={16} />}
                  >
                    Class List
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="create"
                    leftSection={<IconPlus size={16} />}
                  >
                    {editingClass ? "Edit Class" : "Create Class"}
                  </Tabs.Tab>
                </Tabs.List>

                {/* CLASS LIST */}
                <Tabs.Panel value="list" pt="xs">
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      onClick={() => {
                        setClassTab("create");
                        resetClassForm();
                      }}
                      leftSection={<IconPlus size={16} />}
                      mb="md"
                    >
                      Add Class
                    </Button>
                    
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>SL</Table.Th>
                          <Table.Th>Name</Table.Th>
                          <Table.Th>Branch</Table.Th>
                          <Table.Th>Numeric Name</Table.Th>
                          <Table.Th>Rank Order</Table.Th>
                          <Table.Th>Action</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {classes.map((cls, idx) => (
                          <Table.Tr key={cls.id}>
                            <Table.Td>{idx + 1}</Table.Td>
                            <Table.Td>{cls.name}</Table.Td>
                            <Table.Td>{branches.find((b) => b.id === cls.branch_id)?.name || cls.branch_id}</Table.Td>
                            <Table.Td>{cls.numeric_name || "-"}</Table.Td>
                            <Table.Td>{cls.rank_order || "-"}</Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <Button
                                  size="xs"
                                  onClick={() => handleEditClass(cls)}
                                  leftSection={<IconEdit size={16} />}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="xs"
                                  color="red"
                                  onClick={() => handleDeleteClass(cls.id)}
                                  leftSection={<IconTrash size={16} />}
                                >
                                  Delete
                                </Button>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                    
                    {classes.length === 0 && !loading && (
                      <Text ta="center" py="xl" c="dimmed">
                        No classes found. Click "Add Class" to add your first class.
                      </Text>
                    )}
                  </div>
                </Tabs.Panel>

                {/* CREATE/EDIT CLASS */}
                <Tabs.Panel value="create" pt="xs">
                  {validationErrors.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      {validationErrors.map((error, index) => (
                        <Text key={index} c="red" size="sm">
                          • {error}
                        </Text>
                      ))}
                    </div>
                  )}
                  
                  <form onSubmit={classForm.onSubmit(handleClassSubmit)}>
                    <Stack>
                      <TextInput
                        label="Class Name"
                        placeholder="Enter class name"
                        required
                        {...classForm.getInputProps("name")}
                      />
                      
                      <Select
                        label="Branch"
                        placeholder="Select branch"
                        required
                        data={branches.map((b) => ({ value: b.id.toString(), label: b.name }))
                        }
                        {...classForm.getInputProps("branch_id")}
                        value={classForm.values.branch_id}
                        onChange={(v) => classForm.setFieldValue("branch_id", v || "")}
                      />
                      
                      <TextInput
                        label="Numeric Name"
                        placeholder="Enter numeric name (e.g. 1, 2, 3)"
                        {...classForm.getInputProps("numeric_name")}
                      />
                      
                      <TextInput
                        label="Rank Order"
                        placeholder="Enter rank order"
                        {...classForm.getInputProps("rank_order")}
                      />
                      
                      <Select
                        label="Active"
                        data={[
                          { value: "true", label: "Yes" },
                          { value: "false", label: "No" },
                        ]}
                        {...classForm.getInputProps("is_active")}
                        value={classForm.values.is_active ? "true" : "false"}
                        onChange={(v) => classForm.setFieldValue("is_active", v === "true")}
                      />
                      
                      <Group justify="flex-start" mt="lg">
                        <Button
                          type="submit"
                          leftSection={<IconPlus size={16} />}
                          loading={loading}
                        >
                          {editingClass ? "Update Class" : "Save Class"}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            resetClassForm();
                            setClassTab("list");
                          }}
                        >
                          Cancel
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Tabs.Panel>
              </Tabs>
            </Tabs.Panel>

            {/* SECTIONS TAB */}
            <Tabs.Panel value="section" pt="xs">
              <Tabs value={sectionTab} onChange={(value) => setSectionTab(value || "list")}>
                <Tabs.List>
                  <Tabs.Tab
                    value="list"
                    leftSection={<IconList size={16} />}
                  >
                    Section List
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="create"
                    leftSection={<IconPlus size={16} />}
                  >
                    {editingSection ? "Edit Section" : "Create Section"}
                  </Tabs.Tab>
                </Tabs.List>

                {/* SECTION LIST */}
                <Tabs.Panel value="list" pt="xs">
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      onClick={() => {
                        setSectionTab("create");
                        resetSectionForm();
                      }}
                      leftSection={<IconPlus size={16} />}
                      mb="md"
                    >
                      Add Section
                    </Button>
                    
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>SL</Table.Th>
                          <Table.Th>Name</Table.Th>
                          <Table.Th>Branch</Table.Th>
                          <Table.Th>Capacity</Table.Th>
                          <Table.Th>Action</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {sections.map((section, idx) => (
                          <Table.Tr key={section.id}>
                            <Table.Td>{idx + 1}</Table.Td>
                            <Table.Td>{section.name}</Table.Td>
                            <Table.Td>{branches.find((b) => b.id === section.branch_id)?.name || section.branch_id}</Table.Td>
                            <Table.Td>{section.capacity || "-"}</Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <Button
                                  size="xs"
                                  onClick={() => handleEditSection(section)}
                                  leftSection={<IconEdit size={16} />}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="xs"
                                  color="red"
                                  onClick={() => handleDeleteSection(section.id)}
                                  leftSection={<IconTrash size={16} />}
                                >
                                  Delete
                                </Button>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                    
                    {sections.length === 0 && !loading && (
                      <Text ta="center" py="xl" c="dimmed">
                        No sections found. Click "Add Section" to add your first section.
                      </Text>
                    )}
                  </div>
                </Tabs.Panel>

                {/* CREATE/EDIT SECTION */}
                <Tabs.Panel value="create" pt="xs">
                  {validationErrors.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      {validationErrors.map((error, index) => (
                        <Text key={index} c="red" size="sm">
                          • {error}
                        </Text>
                      ))}
                    </div>
                  )}
                  
                  <form onSubmit={sectionForm.onSubmit(handleSectionSubmit)}>
                    <Stack>
                      <TextInput
                        label="Section Name"
                        placeholder="Enter section name"
                        required
                        {...sectionForm.getInputProps("name")}
                      />
                      
                      <Select
                        label="Branch"
                        placeholder="Select branch"
                        required
                        data={branches.map((b) => ({ value: b.id.toString(), label: b.name }))
                        }
                        {...sectionForm.getInputProps("branch_id")}
                        value={sectionForm.values.branch_id}
                        onChange={(v) => sectionForm.setFieldValue("branch_id", v || "")}
                      />
                      
                      <TextInput
                        label="Capacity"
                        placeholder="Enter capacity"
                        {...sectionForm.getInputProps("capacity")}
                      />
                      
                      <Select
                        label="Active"
                        data={[
                          { value: "true", label: "Yes" },
                          { value: "false", label: "No" },
                        ]}
                        {...sectionForm.getInputProps("is_active")}
                        value={sectionForm.values.is_active ? "true" : "false"}
                        onChange={(v) => sectionForm.setFieldValue("is_active", v === "true")}
                      />
                      
                      <Group justify="flex-start" mt="lg">
                        <Button
                          type="submit"
                          leftSection={<IconPlus size={16} />}
                          loading={loading}
                        >
                          {editingSection ? "Update Section" : "Save Section"}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            resetSectionForm();
                            setSectionTab("list");
                          }}
                        >
                          Cancel
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Tabs.Panel>
              </Tabs>
            </Tabs.Panel>

            {/* ASSIGN TAB */}
            <Tabs.Panel value="assign" pt="xs">
              <Tabs value={allocTab} onChange={(value) => setAllocTab(value || "list")}>
                <Tabs.List>
                  <Tabs.Tab
                    value="list"
                    leftSection={<IconList size={16} />}
                  >
                    Assignment List
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="create"
                    leftSection={<IconPlus size={16} />}
                  >
                    Assign Section to Class
                  </Tabs.Tab>
                </Tabs.List>

                {/* ALLOCATION LIST */}
                <Tabs.Panel value="list" pt="xs">
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      onClick={() => {
                        setAllocTab("create");
                        allocForm.reset();
                      }}
                      leftSection={<IconPlus size={16} />}
                      mb="md"
                    >
                      Add Assignment
                    </Button>
                    
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>SL</Table.Th>
                          <Table.Th>Class</Table.Th>
                          <Table.Th>Section</Table.Th>
                          <Table.Th>Action</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {allocations.map((allocation, idx) => (
                          <Table.Tr key={`${allocation.class_id}-${allocation.section_id}`}>
                            <Table.Td>{idx + 1}</Table.Td>
                            <Table.Td>{allocation.class?.name || `Class ${allocation.class_id}`}</Table.Td>
                            <Table.Td>{allocation.section?.name || `Section ${allocation.section_id}`}</Table.Td>
                            <Table.Td>
                              <Button
                                size="xs"
                                color="red"
                                onClick={() => handleDeleteAllocation(allocation.class_id, allocation.section_id)}
                                leftSection={<IconTrash size={16} />}
                              >
                                Delete
                              </Button>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                    
                    {allocations.length === 0 && !loading && (
                      <Text ta="center" py="xl" c="dimmed">
                        No assignments found. Click "Add Assignment" to assign sections to classes.
                      </Text>
                    )}
                  </div>
                </Tabs.Panel>

                {/* CREATE ALLOCATION */}
                <Tabs.Panel value="create" pt="xs">
                  {validationErrors.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      {validationErrors.map((error, index) => (
                        <Text key={index} c="red" size="sm">
                          • {error}
                        </Text>
                      ))}
                    </div>
                  )}
                  
                  <form onSubmit={allocForm.onSubmit(handleAllocationSubmit)}>
                    <Stack>
                      <Select
                        label="Class"
                        placeholder="Select class"
                        required
                        data={classes.map((c) => ({ value: c.id.toString(), label: c.name }))}
                        {...allocForm.getInputProps("class_id")}
                      />
                      
                      <Select
                        label="Section"
                        placeholder="Select section"
                        required
                        data={sections.map((s) => ({ value: s.id.toString(), label: s.name }))}
                        {...allocForm.getInputProps("section_id")}
                      />
                      
                      <Group justify="flex-start" mt="lg">
                        <Button
                          type="submit"
                          leftSection={<IconPlus size={16} />}
                          loading={loading}
                        >
                          Assign
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            allocForm.reset();
                            setAllocTab("list");
                          }}
                        >
                          Cancel
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Tabs.Panel>
              </Tabs>
            </Tabs.Panel>
          </Tabs>
        </div>
      </Paper>
    </Container>
  );
};

export default ClassPage;
