import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
app.use(express.json());

const port = process.env.PORT;

interface User {
  id: string;
  username: string;
  password: string;

  // All projects this user owns by name.
  projects: Record<string, Project>;
}

interface Project {
  name: string;

  // All files in this project, by key.
  files: Record<string, string>;
}

// Registered users, by ID.
const USERS: Record<string, User> = {};

function getUserByToken(token: string | undefined): User | undefined {
  for (const user of Object.values(USERS)) {
    if (user.id === token) {
      return user;
    }
  }
  return undefined;
}

app.get("/", (req: Request, res: Response) => {
  res.send(`<pre>
    Let's build a mock backend for Vercel!
    1. Create users
    - POST /user/create
      Create a new account with a username and password
    - POST /user/login
      Login and authenticate to the server giving back an access token
    
    2. Create & list projects
    - POST /project
      Create a new project, should take a name and any other details that might be needed
    - GET /projects
      List all projects associated with a user
    - POST /project/upload
      Upload a JSON blob where each key corresponds to a filename, and the value is the file contents
    3. Preview a user's project
    - GET /{user}/{project-name}/*
      Display the contents of the file if it exists. 
    </pre>
  `);
});

app.get("/dump", (req: Request, res: Response) => {
  res.json(USERS);
});

app.post("/user/create", (req, res) => {
  const { username, password } = req.body;
  const id = Object.keys(USERS).length + 1;

  USERS[username] = {
    id: id.toString(),
    username,
    password,
    projects: {},
  };

  res.sendStatus(201);
});

app.post("/user/login", (req, res) => {
  const { username, password } = req.body;

  const claimedUser = USERS[username];

  if (claimedUser && claimedUser.password == password) {
    // Successful authentication.
    return res.status(200).json({
      token: claimedUser.id.toString(),
    });
  }

  // Failed authentication.
  res.sendStatus(401);
});

app.post("/project", (req, res) => {
  const { authorization: token } = req.headers;

  const user = getUserByToken(token);
  if (!user) {
    return res.sendStatus(401);
  }

  const { name } = req.body;
  const newProject: Project = {
    name,
    files: {},
  };
  user.projects[name] = newProject;

  return res.sendStatus(201);
});

app.get("/projects", (req, res) => {
  const { authorization: token } = req.headers;

  const user = getUserByToken(token);
  if (!user) {
    return res.sendStatus(401);
  }

  // Return all of the users projects for this user.
  return res.json(user.projects);
});

app.post("/project/:projectId/upload", (req, res) => {
  const { authorization: token } = req.headers;

  const user = getUserByToken(token);
  if (!user) {
    return res.sendStatus(401);
  }

  // Merge their uploads into the project.
  const { projectId } = req.params;
  const requestedProject = user.projects[projectId];
  if (!requestedProject) {
    return res.sendStatus(404);
  }

  const { files } = req.body;
  requestedProject.files = {
    ...requestedProject.files,
    ...files,
  };

  res.sendStatus(201);
});

app.get("/:userId/:projectId/:key", (req, res) => {
  const { authorization: token } = req.headers;

  const user = getUserByToken(token);
  if (!user) {
    return res.sendStatus(401);
  }

  // Assume that users have access to anyone else's projects.
  const { userId, projectId, key } = req.params;

  const requestedUser = USERS[userId];
  if (!requestedUser) {
    return res.sendStatus(404);
  }

  const requestedProject = requestedUser.projects[projectId];
  if (!requestedProject) {
    return res.sendStatus(404);
  }

  const requestedFile = requestedProject.files[key];
  if (!requestedFile) {
    return res.sendStatus(404);
  }

  res.json({
    content: requestedFile,
  });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
