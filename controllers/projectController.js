import Project from "../models/Project.js";
import User from "../models/User.js";

const getProjects = async (req, res) => {
    const projects = await Project.find({
        "$or": [
            { "collaborators": { $in: req.user } },
            { "creator": { $in: req.user } }
        ]
    }).select("-tasks");

    res.json(projects);
}

const newProject = async (req, res) => {
    const project = new Project(req.body);
    project.creator = req.user._id;

    try {
        const storedProjects = await project.save();
        res.json(storedProjects);
    } catch (error) {
        console.log(error);
    }

}

const getProject = async (req, res) => {
    const { id } = req.params;
    const project = await Project.findById(id)
        .populate({ path: "tasks", populate: { path: "completed", select: "name" } })
        .populate("collaborators", "name email");

    if (!project) {
        const error = new Error("Project Not Found");
        return res.status(404).json({ msg: error.message });
    };

    if (project.creator.toString() !== req.user._id.toString() &&
        !project.collaborators.some(
            collaborator => collaborator._id.toString() === req.user._id.toString())
        ) {
        const error = new Error("Invalid Action");
        return res.status(404).json({ msg: error.message });
    };

    res.json(project);
}

const editProject = async (req, res) => {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
        const error = new Error("Project Not Found");
        return res.status(404).json({ msg: error.message });
    };

    if (project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("Invalid Action");
        return res.status(404).json({ msg: error.message });
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.deadline = req.body.deadline || project.deadline;
    project.client = req.body.client || project.client;

    try {
        const storedProject = await project.save();
        res.json(storedProject);
    } catch (error) {
        console.log(error);
    };
};

const deleteProject = async (req, res) => {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
        const error = new Error("Project Not Found");
        return res.status(404).json({ msg: error.message });
    };

    if (project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("Invalid Action");
        return res.status(404).json({ msg: error.message });
    }

    try {
        await project.deleteOne();
        res.json({msg: "Deleted Project"})
    } catch (error) {
        console.log(error);
    }
}

const searchCollaborator = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-confirmed -createdAt -password -token -updatedAt -__v")

    if (!user) {
        const error = new Error("User Not Found");
        return res.status(404).json({ msg: error.message });
    }

    res.json(user);
}

const addCollaborator = async (req, res) => {
    const project = await Project.findById(req.params.id);

    // Project exists
    if (!project) {
        const error = new Error("Project not Found");
        return res.status(404).json({ msg: error.message });
    }

    // Only the creator can add collaborators
    if (project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("Invalid Action");
        return res.status(404).json({ msg: error.message });
    }

    const { email } = req.body;
    const user = await User.findOne({ email }).select("-confirmed -createdAt -password -token -updatedAt -__v")

    // User must exists
    if (!user) {
        const error = new Error("User Not Found");
        return res.status(404).json({ msg: error.message });
    }

    // The Project Creator cannot be a Collaborator
    if (project.creator.toString() === user._id.toString()) {
        const error = new Error("The Project Creator cannot be a Collaborator");
        return res.status(404).json({ msg: error.message });
    }

    // check if a collaborator exists
    if (project.collaborators.includes(user._id)) {
        const error = new Error("The User Already Exists");
        return res.status(404).json({ msg: error.message });
    }

    // now, can be add to the project
    project.collaborators.push(user._id);
    await project.save();
    res.json({ msg: "User added as Collaborator" });
    
}

const deleteCollaborator = async (req, res) => {
     const project = await Project.findById(req.params.id);

    // Project exists
    if (!project) {
        const error = new Error("Project not Found");
        return res.status(404).json({ msg: error.message });
    }

    // Only the creator can add collaborators
    if (project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("Invalid Action");
        return res.status(404).json({ msg: error.message });
    }
    
    // now, can be delete user
    project.collaborators.pull(req.body.id);
    await project.save();
    res.json({ msg: "User deleted as Collaborator" });
}

export {
    getProjects,
    newProject,
    getProject,
    editProject,
    deleteProject,
    addCollaborator,
    deleteCollaborator,
    searchCollaborator
};


