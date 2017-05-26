/* global firebase moment */
// Steps to complete:
// 1. Initialize Firebase
// 2. Create button for adding new trains - then update the html + update the database
// 3. Create a way to retrieve trains from the train database.
// 4. Create a way to calculate the months worked. Using difference between time and current time.
//    Then use moment.js formatting to set difference in months.
// 5. Calculate Total billed
// 1. Initialize Firebase


// Initialize Firebase
var config = {
    apiKey: "AIzaSyBT-YKaepYVYB0gXq2WF6encDhQQsasYC4",
    authDomain: "trainschedule-f6b5c.firebaseapp.com",
    databaseURL: "https://trainschedule-f6b5c.firebaseio.com",
    projectId: "trainschedule-f6b5c",
    storageBucket: "trainschedule-f6b5c.appspot.com",
    messagingSenderId: "910305987237"
};

firebase.initializeApp(config);

var database = firebase.database();

function compDates(startTime, freq) {
    var convertedTime = moment(startTime, 'HH:mm').subtract(1, 'days');
    var minDiff = moment().diff(moment(convertedTime), "minutes");
    console.log('minDiff ' + minDiff);
    var minArrival = freq - (minDiff % freq);
    return minArrival;
};



console.log('START');

// Authentication

$('#btn-login').on("click", function() {
    var email = $('#email').val().trim();
    var pass = $('#password').val().trim();
    console.log('login ' + email);
    console.log('password ' + password);

    var auth = firebase.auth();
    
    console.log('auth ' + auth);
//     // sign In
    var promise = auth.signInWithEmailAndPassword(email, pass)
        .then(function(result) {

        })
        .catch(function (error) {
            console.log(error);
        });
});

$('#btn-signup').on("click", function() {
    var email = $('#email').val().trim();
    var pass = $('#password').val().trim();
    console.log('login ' + email);
    console.log('password ' + password);

    var auth = firebase.auth();
    
    console.log('auth ' + auth);
//     // sign In
    var promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(function (error) {
        console.log(error);
    });
});

populateList();
// 2. Button for adding trains
$(document).on("submit", '#train-submit', function(event) {
    event.preventDefault();
    console.log('form');

//     // Grabs user input
    var trainName = $("#name-input").val().trim();
    var trainDest = $("#dest-input").val().trim();
    
    var trainFreq = $("#freq-input").val().trim();
    var trainTime = $("#time-input").val().trim();
    console.log('time = ', trainTime);
    var trainTimemom = moment(trainTime, "HH:mm");

    console.log('time = ', trainTimemom.format('HH:mm'));
//     // validate input
    if (trainName == "" || trainDest == '' || trainTime == "" || trainFreq == "") {
        alert('please fill out all fields with valid information')
    }
    else if (!trainTimemom.isValid()) {
        console.log(' invalid at ' + moment(trainTime).invalidAt());
        alert('please fill out the time in hours and minutes - 24 hour format - (HH:mm)');
    }
    else {
//     // Creates local "train schedule" object for holding train data
        var newTrain = {
            name: trainName,
            dest: trainDest,
            time: trainTime,
            freq: trainFreq
        };
//         // Uploads train data to the database
        database.ref().push(newTrain);
//         // var x = Object.key();
//         // database.ref(x).name = "pippo";
//         // Logs everything to console
        console.log(newTrain.name);
        console.log(newTrain.dest);
        console.log(newTrain.time);
        console.log(newTrain.freq);
//         // Alert
        alert("train successfully added");
//         // Clears all of the text-boxes
        $("#name-input").val("");
        $("#dest-input").val("");
        $("#time-input").val("");
        $("#freq-input").val("");       
    };
});
// // 3. Create Firebase event for adding train to the database and a row in the html when a user adds an entry
function populateList() {
    $("#train-table > tbody").empty();
    database.ref().on("child_added", function(childSnapshot, prevChildKey) {
    console.log(childSnapshot.val());
    // Store everything into a variable.
    var trainName = childSnapshot.val().name;
    var trainDest = childSnapshot.val().dest;
    var trainTime = (childSnapshot.val().time);
    // var trainHour = parseInt(trainTime.slice(0, 2));
    // var trainMin = parseInt(trainTime.slice(3));
    var trainFreq = parseInt(childSnapshot.val().freq);
//     // train Info
    console.log(trainName);
    console.log(trainDest);
    console.log(trainTime + typeof(trainTime));
    // console.log(trainHour + typeof(trainHour));
    // console.log(trainMin + typeof(trainMin));
    console.log(trainFreq + typeof(trainFreq));
//     // Prettify the train time
//     // var trainTime = moment.unix(trainTime).format("hh:mm");
//     // // Calculate the months worked using hardcore math
//     // // To calculate the months worked
//     // var trainMonths = moment().diff(moment.unix(trainTime, "X"), "minutes");
//     // console.log(trainMonths);
//   Calculate the frequency


    var minArrival = compDates(trainTime, trainFreq);
    console.log('minArrival ' + minArrival);
    var arrivalTime = moment().add(minArrival, 'minutes').format('HH:mm');
    // Add each train's data into the table
    $("#train-table > tbody").prepend("<tr><td>" + trainName + "</td><td>" + trainDest + "</td><td>" +
        trainFreq + "</td><td>" + arrivalTime + "</td><td>" + minArrival + "</td>");
    
    });
};

setInterval(populateList, 60000);

// Example Time Math
// -----------------------------------------------------------------------------
// Assume train time date of January 1, 2015
// Assume current date is March 1, 2016
// We know that this is 15 months.
// Now we will create code in moment.js to confirm that any atttraint we use mets this test case
