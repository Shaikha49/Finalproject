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
//const mongoServerURL = "mongodb://user1:user1@ds245218.mlab.com:45218/registerdb";

//default route / - display all fall register
app.get('/', (request, response, next) => {
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");

		//read from registerdb students collection
		registerdb.collection("summerregister").find({}).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});

});

//get one student by name - used in update and delete web pages
app.get('/summerregister/:student_id', (request, response, next) => {

	const student_id = request.params.student_id;

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");

		console.log(student_id);
		
		//build the query filter
		// let query = {item_name:itemName};

		//read from registerdb students collection
		registerdb.collection("summerregister").find(query).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});

});

//example of hardcoded route
app.get('/course_id', (request, response, next) => {
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");

		//read from registerdb students collection
		registerdb.collection("summerregister").find({course_id:"CIA 3303"}).toArray((err, itemsArray) => {
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
app.get('/:day', (request, response, next) => {
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");
		
		let dayValue = request.params.day;
		 if (dayValue == "sunday")
			 dayValue = "Sun-Tue";
		 else if (timeValue == "12")
			  timeValue = "12:00-2:00";
		 console.log(timeValue);
		
		//build the query filter
		let query = {day:dayValue};

		//read from registerdb items collection
		registerdb.collection("summerregister").find(query).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});
});
//      *****************       <<-- HERE -->>       ****************      \\
//add a new student - using HTTP POST method
app.post('/summerregister', (request, response, next) => {
	//access the form fields by the same names as in the HTML form
	const students_id = request.body.students_id;
	console.log(student_id);
	const student_name = request.body.student_name;
	const course_id = request.body.cpurse_id;
	const time = request.body.time;
	const day = request.body.day;
	const bulding = request.body.bulding;
	
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to registerdb 
		const registerdb = db.db("registerdb");
		
		const newStudent = {student_id:student_id, student_name:student_name, course_id:course_id, time:time, day:day, bulding:bulding};
		//insert to registerdb students collection
		registerdb.collection("summerregister").insertOne(newstudent, (err, result) => {
			if (err) {
				console.log(err.message);
			}

			if (result.insertedCount == 1) {
				//one way - return response - let client handle it
				//response.end("student " + student_name + " added successfully!");
				
				//another way - redirect to the all students page - showing student added
				response.redirect("/static/summerregister.html");
			}
			else
				response.end("This course could not be added!!");

			//response.send(JSON.stringify(newStudent));
		});

		//close the connection to the db
		db.close();
	});	
});

//update student - uisng HTTP PUT method
app.put('/summerregister', (request, response, next) => {
	console.log("in PUT");
	const student_id = request.param('student_id');
	const student_name = request.param('student_name');
	const course_id = request.param('course_id');
	const time = request.param('time');
	const day = request.param('day');
	const bulding = request.param('bulding');
	

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect
		const registerdb = db.db("registerdb");
		
		//we are updating by the student_name
		const updateFilter = {student_id:student_id};
		const updateValues = {$set:{student_name:student_name, course_id:course_id, time:time, day:day, bulding:bulding}};
		//insert from registerdb students collection
		registerdb.collection("summerregister").updateOne(updateFilter, updateValues, (err, res) => {
			if (err) {
				console.log(err.message);
			}

			//console.log("matchcount " + res.matchedCount);
			//console.log("updatecount:" + res.modifiedCount);

			//one way 
			//const responseJSON = {updateCount:res.result.nModified};
			//response.send(JSON.stringify(responseJSON));

			//another way - redirect to all items page
			response.redirect("/static/summerregister.html");
		});

		//close the connection to the db
		db.close();
	});	
});

//delete student by student_id
app.delete('/summerregister', (request, response, next) => {
	const student_id = request.param('student_id');

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");
		
		//we are deleting by the student_id
		const deleteFilter = {student_id:student_id};

		//insert from registerdb students collection
		registerdb.collection("summerregister").deleteOne(deleteFilter, (err, res) => {
			if (err) {
				console.log(err.message);
			}

			//const responseJSON = {deleteCount:res.result.n}; //n - how many docs deleted
			//response.send(JSON.stringify(responseJSON));

			if (res.deletedCount > 0) {
				response.redirect("/static/summerregister.html");
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

