import Project from "../models/Project.js";
import Task from "../models/Task.js";

const addTask = async (req, res) => {
  const { project } = req.body;
  const existProject = await Project.findById(project);
 
  if (!existProject) {
    const error = new Error('Project Not Exist');
    return res.status(404).json({ msg: error.message });
  }
 
  if (existProject.creator.toString() !== req.user._id.toString()) {
    const error = new Error('You Do not Have the permissions to add tasks');
    return res.status(403).json({ msg: error.message });
  }
 
  try {
    const storedTask = await Task.create(req.body);
    existProject.tasks.push(storedTask._id);
    await existProject.save();
 
    res.json(storedTask);
  } catch (error) {
    console.log(error);
  }
};

const getTask = async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id).populate("project");

    if (!task) {
        const error = new Error("Task not Found");
        return res.status(404).json({ msg: error.message });
    };

    if (task.project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("Invalid Action");
        return res.status(403).json({ msg: error.message });
    };

    res.json(task);
};

const updateTask = async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id).populate("project");

    if (!task) {
        const error = new Error("Task not Found");
        return res.status(404).json({ msg: error.message });
    };

    if (task.project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("Invalid Action");
        return res.status(403).json({ msg: error.message });
    };

    task.name = req.body.name || task.name;
    task.description = req.body.description || task.description;
    task.deliveryDate = req.body.deliveryDate || task.deliveryDate;
    task.priority = req.body.priority || task.priority;

    try {
        const taskStored = await task.save();
        res.json(taskStored);
    } catch (error) {
        console.log(error);
    }

};

const deleteTask = async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id).populate("project");

    if (!task) {
        const error = new Error("Task not Found");
        return res.status(404).json({ msg: error.message });
    };

    if (task.project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("Invalid Action");
        return res.status(403).json({ msg: error.message });
    };

    try {
        const project = await Project.findById(task.project);
        project.tasks.pull(task._id);
        
        await Promise.allSettled([
            await project.save(),
            await task.deleteOne()
        ]);

        res.json({ msg: "Task Deleted" });
    } catch (error) {
        console.log(error);
    };
};

const changeState = async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id).populate("project");

    if (!task) {
        const error = new Error("Task not Found");
        return res.status(404).json({ msg: error.message });
    };

    if (task.project.creator.toString() !== req.user._id.toString() &&
        !task.project.collaborators.some(
            collaborator => collaborator._id.toString() === req.user._id.toString())
        ) {
        const error = new Error("Invalid Action");
        return res.status(403).json({ msg: error.message });
    };

    task.state = !task.state;
    task.completed = req.user._id;
    await task.save();

    const taskStore = await Task.findById(id)
        .populate("project")
        .populate("completed");

    res.json(taskStore);
};


export {
    addTask,
    getTask,
    updateTask,
    deleteTask,
    changeState,
};