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

		//read from registerdb courses collection
		registerdb.collection("courses").find({}).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});

});

//get one student by name - used in update and delete web pages
app.get('/courses/:courses_name', (request, response, next) => {

	const courses_name = request.params.courses_name;

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");

		console.log(courses_name);
		
		//build the query filter
		// let query = {item_name:itemName};

		//read from registerdb students collection
		registerdb.collection("courses").find(query).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});

});

//example of hardcoded route
app.get('/teacher', (request, response, next) => {
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");

		//read from registerdb courses collection
		registerdb.collection("courses").find({teacher:"Saifut"}).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});
});


//add a new course - using HTTP POST method
app.post('/courses', (request, response, next) => {
	//access the form fields by the same names as in the HTML form
	const courses_code = request.body.courses_code;
	console.log(coueses_code);
	const courses_name = request.body.courses_name;
	const teacher = request.body.year;
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to registerdb 
		const registerdb = db.db("registerdb");
		
		const newCourse = {courses_code:coueses_code, courses_name:courses_name, teacher:teacher};
		//insert to registerdb courses collection
		registerdb.collection("courses").insertOne(newCourses, (err, result) => {
			if (err) {
				console.log(err.message);
			}

			if (result.insertedCount == 1) {
				//one way - return response - let client handle it
				//response.end("student " + student_name + " added successfully!");
				
				//another way - redirect to the all students page - showing student added
				response.redirect("/static/course.html");
			}
			else
				response.end("Course " + courses_name + " could not be added!!");

			//response.send(JSON.stringify(newStudent));
		});

		//close the connection to the db
		db.close();
	});	
});

//update course - uisng HTTP PUT method
app.put('/courses', (request, response, next) => {
	console.log("in PUT");
	const courses_code = request.param('courses_code');
	const courses_name = request.param('courses_name');
	const teacher = request.param('teacher');
	

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect
		const registerdb = db.db("registerdb");
		
		//we are updating by the student_name
		const updateFilter = {courses_code:courses_code};
		const updateValues = {$set:{courses_name:courses_name, teacher:teacher}};
		//insert from registerdb students collection
		registerdb.collection("courses").updateOne(updateFilter, updateValues, (err, res) => {
			if (err) {
				console.log(err.message);
			}

			//console.log("matchcount " + res.matchedCount);
			//console.log("updatecount:" + res.modifiedCount);

			//one way 
			//const responseJSON = {updateCount:res.result.nModified};
			//response.send(JSON.stringify(responseJSON));

			//another way - redirect to all items page
			response.redirect("/static/course.html");
		});

		//close the connection to the db
		db.close();
	});	
});

//delete student by student_id
app.delete('/courses', (request, response, next) => {
	const coueses_code = request.param('coueses_code');

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect 
		const registerdb = db.db("registerdb");
		
		//we are deleting by the student_id
		const deleteFilter = {coueses_code:coueses_code};

		//insert from registerdb students collection
		registerdb.collection("courses").deleteOne(deleteFilter, (err, res) => {
			if (err) {
				console.log(err.message);
			}

			//const responseJSON = {deleteCount:res.result.n}; //n - how many docs deleted
			//response.send(JSON.stringify(responseJSON));

			if (res.deletedCount > 0) {
				response.redirect("/static/course.html");
			}
			else {
				response.send("<script>alert(\"deleted \" +coueses_code);</script>");
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

