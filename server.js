const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost/tms', {
});

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    dueDate: Date,
    priority: String,
    category: String,
    completed: Boolean,
});

const Task = mongoose.model('Task', taskSchema);

app.use(bodyParser.json());
app.use(express.static('public')); // assuming 'public' is the directory where your app.js file is located
app.use(express.static(__dirname));


// Define your API endpoints here

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/api/tasks', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
  // Get all tasks
// ... (your existing code)

app.get('/api/tasks', async (req, res) => {
    try {
        const { priority, completed, category, search } = req.query;
        let filters = {};

        // Add filters if provided
        if (priority) filters.priority = priority;

        // Handle completion filter
        if (completed && completed !== 'All') {
            filters.completed = completed === 'Completed';
        }

        if (category) filters.category = category;

        let tasks = await Task.find(filters);

        // Handle search query
        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
            tasks = tasks.filter(task => task.title.match(searchRegex));
        }

        res.json(tasks);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// ... (your existing code)

app.delete('/api/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const deletedTask = await Task.findByIdAndDelete(taskId);
    
    if (!deletedTask) {
        return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', deletedTask });
    } catch (error) {
        res.status(500).send(error.message);
    }
});
app.put('/api/tasks/:taskId/complete', async (req, res) => {
    try {
        const { taskId } = req.params;
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { completed: true },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// app.listen(PORT,'192.168.0.196', () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
