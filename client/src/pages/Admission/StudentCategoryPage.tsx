import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Button, 
    TextField, 
    Modal,
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel 
} from '@mui/material';

const API_URL = 'http://localhost:3001/api/admission/categories'; // Adjust if your backend runs on a different port
const BRANCH_API_URL = 'http://localhost:3001/api/branches'; // Assuming you have a branches API

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function StudentCategoryPage() {
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id: null, name: '', branch_id: '' });
    const [formError, setFormError] = useState('');

    const fetchCategories = async () => {
        try {
            const response = await axios.get(API_URL, { headers: { 'x-access-token': localStorage.getItem('token') } });
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            // Handle error (e.g., show a notification to the user)
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await axios.get(BRANCH_API_URL, { headers: { 'x-access-token': localStorage.getItem('token') } });
            setBranches(response.data);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchBranches();
    }, []);

    const handleOpen = (category = null) => {
        setFormError('');
        if (category) {
            setIsEditMode(true);
            setCurrentCategory({ id: category._id, name: category.name, branch_id: category.branch?._id || '' });
        } else {
            setIsEditMode(false);
            setCurrentCategory({ id: null, name: '', branch_id: '' });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setIsEditMode(false);
        setCurrentCategory({ id: null, name: '', branch_id: '' });
        setFormError('');
    };

    const handleChange = (e) => {
        setCurrentCategory({ ...currentCategory, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!currentCategory.name.trim() || !currentCategory.branch_id) {
            setFormError('Category name and branch are required.');
            return;
        }

        const payload = { name: currentCategory.name, branch_id: currentCategory.branch_id };
        const headers = { 'x-access-token': localStorage.getItem('token') };

        try {
            if (isEditMode) {
                await axios.put(`${API_URL}/${currentCategory.id}`, payload, { headers });
            } else {
                await axios.post(API_URL, payload, { headers });
            }
            fetchCategories();
            handleClose();
        } catch (error) {
            console.error("Error saving category:", error.response ? error.response.data : error.message);
            setFormError(error.response?.data?.message || 'Failed to save category.');
            // Handle error (e.g., show a notification to the user)
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await axios.delete(`${API_URL}/${id}`, { headers: { 'x-access-token': localStorage.getItem('token') } });
                fetchCategories();
            } catch (error) {
                console.error("Error deleting category:", error);
                // Handle error
            }
        }
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Student Categories
            </Typography>
            <Button variant="contained" color="primary" onClick={() => handleOpen()} style={{ marginBottom: '20px' }}>
                Add Category
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {isEditMode ? 'Edit Category' : 'Add New Category'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel id="branch-select-label">Branch</InputLabel>
                            <Select
                                labelId="branch-select-label"
                                id="branch_id"
                                name="branch_id"
                                value={currentCategory.branch_id}
                                label="Branch"
                                onChange={handleChange}
                            >
                                {branches.map((branch) => (
                                    <MenuItem key={branch._id} value={branch._id}>
                                        {branch.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField 
                            label="Category Name" 
                            name="name"
                            value={currentCategory.name} 
                            onChange={handleChange} 
                            fullWidth 
                            margin="normal" 
                            required
                        />
                        {formError && <Typography color="error">{formError}</Typography>}
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <Button onClick={handleClose} style={{ marginRight: '10px' }}>Cancel</Button>
                            <Button type="submit" variant="contained" color="primary">
                                {isEditMode ? 'Update' : 'Save'}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Modal>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Branch</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.length > 0 ? categories.map((category) => (
                            <TableRow key={category._id}>
                                <TableCell>{category._id}</TableCell>
                                <TableCell>{category.branch ? category.branch.name : 'N/A'}</TableCell>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleOpen(category)} color="primary" style={{ marginRight: '10px' }}>Edit</Button>
                                    <Button onClick={() => handleDelete(category._id)} color="secondary">Delete</Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No categories found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default StudentCategoryPage;
