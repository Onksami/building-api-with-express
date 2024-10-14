import http from "http";

// Sample array of books
let books = [
  { id: 1, title: "1984", author: "George Orwell" },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee" },
  { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
];
// Utility function to parse request body (for PUT requests)
const getRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
};
// Create an HTTP server
const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split("/");
  const id = parseInt(urlParts[2], 10); // Extract book id from URL if present
  // GET /books/:id - Retrieve a book by its id
  if (req.method === "GET" && urlParts[1] === "books" && !isNaN(id)) {
    const book = books.find((b) => b.id === id);
    if (book) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(book));
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Book not found\n");
    }
    // PUT /books/:id - Update book title by its id
  } else if (req.method === "PUT" && urlParts[1] === "books" && !isNaN(id)) {
    try {
      const body = await getRequestBody(req); // Get request body (JSON)
      const book = books.find((b) => b.id === id);
      if (book) {
        if (body.title) {
          book.title = body.title;
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(book));
        } else {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end('Missing "title" in request body\n');
        }
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Book not found\n");
      }
    } catch (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Invalid request body\n");
    }
  } else {
    // Handle routes not found
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(" not found\n");
  }
});
// Define the port number to listen on
const PORT = 8002;
// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
