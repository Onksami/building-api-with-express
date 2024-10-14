import express from "express";
const app = express();

const PORT = 8000;

const users = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Doe", email: "jane@example.com" },
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
  // to do gelen body icinde  name ve email i kontrol et.
  console.log("body", req.body);
  const newUser = req.body;
  const lastUserId = users[users.length - 1].id;
  newUser.id = lastUserId + 1;
  users.push(newUser);
  res.status(201).send("user created");
});

// put req. olustur id ye gore user bilgilerini degistirsin. orn.
//4 nolu user in bilgilerini degistir. id kontrolu yap ve gelen body mail
//ve name bilgilerini kontorl et. validation system

// to do , delete user by id

// to listen to  the port!

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
