// students
const express = require('express');
const cors = require('cors');
const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser'); //read form data and form fields
const methodOverride = require('method-override'); //to support PUT and DELETE FROM browssers

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(methodOverride('_method'));

const mongoServerURL = "mongodb://localhost:27017";
//const mongoServerURL = "mongodb://user1:user1@ds245218.mlab.com:45218/itemdb";

//default route / - display all fall register
app.get('/', (request, response, next) => {
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");

		//read from registerdb students collection
		registerdb.collection("students").find({}).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});

});

//get one student by name - used in update and delete web pages
app.get('/students/:student_name', (request, response, next) => {

	const student_name = request.params.student_name;

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");

		console.log(student_name);
		
		//build the query filter
		// let query = {item_name:itemName};

		//read from registerdb students collection
		registerdb.collection("students").find(query).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});

});

//example of hardcoded route
app.get('/GPA', (request, response, next) => {
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");

		//read from registerdb students collection
		registerdb.collection("students").find({GPA:3.0}).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});
});

//example to used to handle many routes using request parameter
//here the request parameter is :year
app.get('/:year', (request, response, next) => {
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");
		
		let yearValue = request.params.year;
		// if (yearValue == "robots")
			// yearValue = "robot";
		// else if (categoryValue == "micros")
			 // categoryValue = "microcontroller";
		// console.log(categoryValue);
		
		//build the query filter
		let query = {year:yearValue};

		//read from registerdb items collection
		registerdb.collection("students").find(query).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});
});

//add a new student - using HTTP POST method
app.post('/students', (request, response, next) => {
	//access the form fields by the same names as in the HTML form
	const student_id = request.body.student_id;
	console.log(student_id);
	const student_name = request.body.student_name;
	const year = request.body.year;
	const GPA = request.body.GPA;
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to registerdb 
		const registerdb = db.db("registerdb");
		
		const newStudent = {student_id:student_id, student_name:student_name, year:year, GPA:GPA};
		//insert to registerdb students collection
		registerdb.collection("students").insertOne(newStudent, (err, result) => {
			if (err) {
				console.log(err.message);
			}

			if (result.insertedCount == 1) {
				//one way - return response - let client handle it
				//response.end("student " + student_name + " added successfully!");
				
				//another way - redirect to the all students page - showing student added
				response.redirect("/static/student.html");
			}
			else
				response.end("Student " + student_name + " could not be added!!");

			//response.send(JSON.stringify(newStudent));
		});

		//close the connection to the db
		db.close();
	});	
});

//update student - uisng HTTP PUT method
app.put('/students', (request, response, next) => {
	console.log("in PUT");
	const student_name = request.param('student_name');
	const year = request.param('year');
	const GPA = request.param('GPA');
	

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect
		const registerdb = db.db("registerdb");
		
		//we are updating by the student_name
		const updateFilter = {student_name:student_name};
		const updateValues = {$set:{year:year, GPA:GPA}};
		//insert from registerdb students collection
		registerdb.collection("students").updateOne(updateFilter, updateValues, (err, res) => {
			if (err) {
				console.log(err.message);
			}

			//console.log("matchcount " + res.matchedCount);
			//console.log("updatecount:" + res.modifiedCount);

			//one way 
			//const responseJSON = {updateCount:res.result.nModified};
			//response.send(JSON.stringify(responseJSON));

			//another way - redirect to all items page
			response.redirect("/static/student.html");
		});

		//close the connection to the db
		db.close();
	});	
});

//delete student by student_id
app.delete('/students', (request, response, next) => {
	const student_id = request.param('student_id');

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");
		
		//we are deleting by the student_id
		const deleteFilter = {student_id:student_id};

		//insert from registerdb students collection
		registerdb.collection("students").deleteOne(deleteFilter, (err, res) => {
			if (err) {
				console.log(err.message);
			}

			//const responseJSON = {deleteCount:res.result.n}; //n - how many docs deleted
			//response.send(JSON.stringify(responseJSON));

			if (res.deletedCount > 0) {
				response.redirect("/static/student.html");
			}
			else {
				response.send("<script>alert(\"deleted \" +student_id);</script>");
			}
		});

		//close the connection to the db
		db.close();
	});	
});


//set the route for static HTML files to /static
//actual folder containing HTML files will be public
app.use('/static', express.static('public'));

//start the web server
const port = 7979;
app.listen(port, ()=> {
	console.log("server listening on "+port);
});

