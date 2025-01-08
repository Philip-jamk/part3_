import mongoose from "mongoose";

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

// The code also assumes that it will be passed the password from the credentials we created in MongoDB Atlas, as a command line parameter.
// We can access the command line parameter like this:

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

//const password = "poster";

const url = `mongodb+srv://ag4373:${password}@cluster0.vdlmx.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`;
//   `mongodb+srv://ag4373:${password}@cluster0.o1opl.mongodb.net/?retryWrites=true&w=majority`
//    `mongodb+srv://ag4373:${password}@cluster0.o1opl.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.set("strictQuery", false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Contact", personSchema);

if (name && number) {
  const person = new Person({
    name: name,
    number: number,
  });

  person.save().then((result) => {
    console.log("Person saved!");
    console.log(`${person.name} ${person.number}`);
    //mongoose.connection.close();
  });
} else {
  // We could restrict our search to only include important notes like this:

  // Note.find({ important: true }).then(result => {
  //   // ...
  // })

  Person.find({}).then((result) => {
    result.forEach((person) => {
      //console.log(person); This prints the whole object
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
}
