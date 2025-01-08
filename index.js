//import http from "http";
import express from "express";
const app = express();
// Importing Mogan
import morgan from "morgan";
import cors from "cors";

import Person from "./models/phonebook.js";

import dotenv from "dotenv";
dotenv.config();

let persons = [];

//Middleware is used like this:
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(express.json()); // Middleware to parse JSON
app.use(requestLogger);
app.use(express.static("dist"));
app.use(cors());
// Use morgan middleware with the 'tiny' configuration
app.use(morgan("tiny"));

//Searching for a record my ID
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })

    .catch((error) => next(error));
});

// Updating a record
//Start
app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});
//End

//Adding record on the Database
//Start
app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({ error: "content missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// app.get("/", (request, response) => {
//   response.send("<h1>Hello World!</h1>");
// });
app.get("/", (request, response) => {
  response.sendFile("index.html", { root: "dist" });
});

// Adding a response for Info page
app.get("/info", (request, response) => {
  const phonebookcount = Person.length;
  const timeofRequest = new Date();

  response.send(
    `<br>Phonebook has info for ${phonebookcount} people </br>
      <p>${timeofRequest}</p>`
  );
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
