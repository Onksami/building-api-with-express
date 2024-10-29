import express from "express";
import pkg from "joi";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();

const PORT = 8000;

const Joi = pkg;
const { version } = pkg;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
      description: "A simple user API",
    },
  },
  apis: ["./server.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//  a schema for the request body
const userSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
});

// a schema for id , it must be an integer.
const idSchema = Joi.number().integer().min(1).required();

const users = [
  { id: 1, name: "Sam", email: "sam@example.com" },
  { id: 2, name: "Jane", email: "jane@example.com" },
  { id: 3, name: "Malin", email: "malin@example.com" },
  { id: 4, name: "Therese", email: "therese@example.com" },
  { id: 5, name: "Anneli", email: "anneli@example.com" },
  { id: 6, name: "Nejiba", email: "nejiba@example.com" },
];

app.use(express.json());

// test request
app.get("/", (req, res) => {
  res.send("Hej Hej!");
});

// get req.

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 *       400:
 *         description: something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 */

app.get("/users", (req, res) => {
  console.dir(req.headers);
  console.dir(req.body);
  console.dir(req.query);

  res.send(users);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User id is needed
 *     responses:
 *       200:
 *         description: A single user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: User not found
 */

app.get("/users/:id", (req, res) => {
  console.dir(req.params);
  const id = Number(req.params.id);
  console.log("id", id);

  if (isNaN(id)) {
    res.status(400).send({
      message: "Id must be a number",
      success: false,
    });
    return;
  }

  const user = users.find((user) => user.id === id);
  console.log("user", user);
  if (user) {
    res.send(user);
  } else {
    res.status(400).send({
      message: "user not found",
      success: false,
    });
  }
});

// post req.

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Add a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input
 */

app.post("/users", (req, res) => {
  const { error } = userSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  console.log("Post req. body", req.body);
  const newUser = req.body;
  const lastUserId = users[users.length - 1].id;
  newUser.id = lastUserId + 1;
  users.push(newUser);
  res.status(201).send("user created");
});

// put req

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid ID or input
 */

app.put("/users/:id", (req, res) => {
  const { error: idError } = idSchema.validate(req.params.id);
  if (idError) {
    return res
      .status(400)
      .json({ error: `Invalid ID: ${idError.details[0].message}` });
  }

  const { error: bodyError } = userSchema.validate(req.body);
  if (bodyError) {
    return res.status(400).json({ error: bodyError.details[0].message }); // joi library error message
  }

  const userId = parseInt(req.params.id); //finding user id

  const { name, email } = req.body;

  const userIndex = users.findIndex((user) => user.id === userId); // finding user

  if (userIndex === -1) {
    return res.status(400).json({ error: "User not found" });
  }

  users[userIndex].name = name || users[userIndex].name;
  users[userIndex].email = email || users[userIndex].email;

  res
    .status(200)
    .json({ message: "User updated successfully", user: users[userIndex] });
});

// delete req
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: User not found
 */

app.delete("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    return res.status(400).json({ error: "user not found." });
  }
  console.log("before", users.length);

  users.splice(userIndex, 1);

  console.log("after", users.length);

  res.status(200).json({ message: "user deleted succesfully" });
});

// to listen to  the port!

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
