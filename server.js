import express from "express";
import Joi from "joi";

const app = express();

const PORT = 8000;

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

app.get("/users", (req, res) => {
  console.dir(req.headers);
  console.dir(req.body);
  console.dir(req.query);

  res.send(users);
});

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

// add user req

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
