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

function showLogon() {
    $('#auth').hide();
    $('#greeting > span').empty();
    $("#greeting").prepend("<span>Nice to see you again - now you don't have to see everyone else's trains </span>");
    $('#btn-logout').show();
};

function showSignIn() {
    $('#auth').show();
    $('#greeting > span').empty();
    $('#btn-logout').hide();
};

function populateList() {
    // empty the table
    $("#train-table > tbody").empty();
    // event listener
    database.ref().on("child_added", function(childSnapshot, prevChildKey) {
        console.log(childSnapshot.val());
        // Store everything into a variable.
        var trainName = childSnapshot.val().name;
        var trainDest = childSnapshot.val().dest;
        var trainTime = (childSnapshot.val().time);
        var trainFreq = parseInt(childSnapshot.val().freq);
        var trainUser = (childSnapshot.val().user);
        // train Info
        console.log(trainName);
        console.log(trainDest);
        console.log(trainTime + typeof(trainTime));
        console.log(trainFreq + typeof(trainFreq));
        //   Calculate the frequency
        var minArrival = compDates(trainTime, trainFreq);
        console.log('minArrival ' + minArrival);
        var arrivalTime = moment().add(minArrival, 'minutes').format('HH:mm');
        // Add each train's data into the table
        var loggedUser = firebase.auth().currentUser;
        console.log('user = ' + loggedUser);

        console.log('trainUser = ' + trainUser);
        // adding a row in the html 
        if ((loggedUser == null) || (loggedUser == "") || (trainUser == loggedUser.uid)) {
            $("#train-table > tbody").prepend("<tr><td>" + trainName + "</td><td>" + trainDest + "</td><td>" +
                trainFreq + "</td><td>" + arrivalTime + "</td><td>" + minArrival + "</td>");
        };
    });
};

// Authentication

$('#btn-login').on("click", function() {
    var email = $('#email').val().trim();
    var pass = $('#password').val().trim();
    console.log('login ' + email);
    console.log('password ' + password);

    var auth = firebase.auth();
    
    console.log('auth ' + auth);
    // sign In
    var promise = auth.signInWithEmailAndPassword(email, pass)
        .then(function(result) {
            showLogon();
            console.log('uid ' + auth.currentUser.uid);
        })
        .catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            // check password
            if (errorCode === 'auth/wrong-password') {
                alert('Wrong password.');
            } else {
                alert(errorMessage);
            }
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

    // create user
    var promise = auth.createUserWithEmailAndPassword(email, pass)
        .then(function(result) {

            showLogon();
        })
        .catch(function (error) {
            console.log(error);
    });
});

$('#btn-logout').on("click", function() {
    firebase.auth().signOut();
    $('#email').val('');
    $('#password').val('');
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    showLogon();
    populateList();
  } 
  else {
    // No user is signed in.
    showSignIn();
    populateList();
  }
});

// 2. Button for adding trains
$(document).on("submit", '#train-submit', function(event) {
    event.preventDefault();
    console.log('form');

    // Grabs user input
    var trainName = $("#name-input").val().trim();
    var trainDest = $("#dest-input").val().trim();
    
    var trainFreq = $("#freq-input").val().trim();
    var trainTime = $("#time-input").val().trim();

    console.log('time = ', trainTime);
    var trainTimemom = moment(trainTime, "HH:mm");

    // save the user's id so we can match users to trains,
    var trainUser = "";
    if (!firebase.auth().currentUser == null) {
        var trainUser = firebase.auth().currentUser.uid;
    };

    console.log('time = ', trainTimemom.format('HH:mm', true));
    // validate input
    if (trainName == "" || trainDest == '' || trainTime == "" || trainFreq == "") {
        alert('please fill out all fields with valid information')
    }
    else if (!trainTimemom.isValid()) {
        console.log(' invalid at ' + moment(trainTime).invalidAt());
        alert('please fill out the time in hours and minutes - 24 hour format - (HH:mm)');
    }
    else {
        // Creates local "train schedule" object for holding train data
        // save the user's profile into Firebase so we can list trains for a specific user
        var newTrain = {
            name: trainName,
            dest: trainDest,
            time: trainTime,
            freq: trainFreq,
            user: trainUser
        };
        // Uploads train data to the database
        database.ref().push(newTrain);

        // Logs everything to console
        console.log(newTrain.name);
        console.log(newTrain.dest);
        console.log(newTrain.time);
        console.log(newTrain.freq);

        // Clears all of the text-boxes
        $("#name-input").val("");
        $("#dest-input").val("");
        $("#time-input").val("");
        $("#freq-input").val("");       
    };
});

setInterval(populateList, 60000);