'use strict';


$(function() {

    // 2 jQuery objects: 
    // 1 input button tagged with "introv" class; 1 input button tagged with "extrov" class

    let introv = $('.introv');
    let extrov = $('.extrov');

    // Add event listeners to both input buttons

    introv.on("click", introvHandler);
    extrov.on("click", extrovHandler);
    

    // keep count of how many times user selected the introvert choice
    // keep count of how many times user selected the extrovert choice

    let intrTotal = 0;
    let extrTotal = 0;


    // 2 arrays of images: 1 set for introvert imgs, 1 set for extrovert images

    let intrImages = ["door-closed.jpeg","alone-time.jpg", "small-signature.jpeg","bodylanguage-closed.png",
    "selfie-angle-above.jpg","heavy-metal.jpg","polite-dining.jpeg", "speed-slow.png"];
    let extrImages = ["door-open.jpeg","bromances.jpg","large-signature.jpg", "bodylanguage-open.png", 
    "selfie-angle-below.jpg","disco.jpg","messy-eater.jpg","speed-fast.png"];


    // 1 array of behaviors (descriptions of the choice, which will populate the table of feedback)

    let behaviors = ["Drinks coffee like ", "Leaves door like ", "Recharges like ", "Handwriting like ", 
    "Sits like ", "Takes selfies like ", "Musical taste of ", "Eats like ", "Drives like "];
    

    // create counter to keep track of round #; 
    // used to: display the next set of images, populate the table, & end the quiz by disabling input buttons

    let roundNum = 0;


    // create an object to store the user's name, overall score, and personality type as properties

    let user = {
        name: '', 
        score: 0,
        persType: ''
    };
    


    // When user clicks an input button tagged with "introv" class, this function triggers and:
    // Increments introvert score 
    // Increments round counter
    // Both input buttons refresh with next round of images
    // After 9th round, quiz is over so input buttons are disabled, and submitButton is enabled

    function introvHandler(evnt) {
        roundNum ++;
        intrTotal ++;
        if (roundNum === 9) {
            $(evnt.target).attr('disabled', 'disabled');
            $(evnt.target.parentElement.nextElementSibling.children[0]).attr('disabled', 'disabled');
            submitButton.attr('disabled', false);
            return;
        };
        evnt.target.parentElement.children[1].src = intrImages[roundNum-1];
        evnt.target.parentElement.nextElementSibling.children[1].src = extrImages[roundNum-1]; 
    };

    // When user clicks an input tagged with "extrov" class, this function triggers to:
    // Increment extrovert score 
    // Increment round counter
    // Both input buttons refresh with next round of images
    // After 9th round, quiz is over so input buttons are disabled

    function extrovHandler(evnt) {
        roundNum ++;
        extrTotal ++;
        if (roundNum === 9) {
            $(evnt.target).attr('disabled', 'disabled');
            $(evnt.target.parentElement.previousElementSibling.children[0]).attr('disabled', 'disabled');
            submitButton.attr('disabled', false);
            return;
        };
        evnt.target.parentElement.children[1].src = extrImages[roundNum-1];
        evnt.target.parentElement.previousElementSibling.children[1].src = intrImages[roundNum-1];
    };


    // An overall score is derived from the 2 running totals. 
    // This becomes the "score" property of the user object

    function overallScore() {
        user.score = extrTotal - intrTotal;
        return extrTotal - intrTotal;
    };



    // 2 jQuery objects to display results in 2 ways : 1. written and 2. symbols

    let resultsDiv = $('#user-results');
    let resultsSymbol = $('#results-symbol');

    // meter will increase toward extroversion or decrease toward introversion with each user selection

    let meter = $('#meter');


    // Create collection of ALL input buttons, using class "radio", because 
    // the following modifications occur with all input selections, regardless of (introv/extrov) choice: 
    // 1. Meter is updated (sliding toward introversion or direction)
    // 2. Table row is added to show both the behavior and the observed personality type for that behavior

    let anyInputButton = $('.radio');
    anyInputButton.on("click", allModifications);

    function allModifications(evnt) {
        
        meter.val(overallScore());

        let observed;
        if ($(evnt.target).hasClass("introv")) {
            observed = " introvert";
        } else {
            observed = " extrovert";
        };
        $('table').append('<tr><td>' + behaviors[roundNum-1] + '</td><td>' + " " + observed + '</td></tr>');
    };


    // event listener for submitButton
    // clicking submitButton submits user's name, stores it in "name" property of user object, and
    // triggers giveResults() function for final results

    let submitButton = $('#submit-button');
    submitButton.on("click", function(evnt){
        evnt.preventDefault();
        user.name = $('#user-name').val();
        giveResults();
    });


    function giveResults(){

        // Ajax request to load all 3 descriptions (for the three personality types)

        let request = $.ajax({
            method: 'GET',
            url: 'personality.json',
            dataType: 'json',
        });


        request.done(function(data) {

            // 1 description is picked, according to user's score. 
            // This description becomes "persType" property of user object

            if(user.score > 3) {
                user.persType = data.extrovert;
            } else if(user.score > -4){
                user.persType = data.ambivert;
            } else {
                user.persType = data.introvert;
            };


            // final results display on page: Name, score, and personality type

            resultsDiv.text(user.name + ", your overall score is " + user.score + ". You are " 
            + intrTotal + " parts introvert and " + extrTotal + " parts extrovert. Overall... " 
            + user.persType + ".      TL;DR: here is your personality in symbols:");


            // party hats display for extrovert type ; bookworms display for introvert type
            // number of symbols reflects magnitude (Score)
            // Change background color to blue for introverts ; to hot pink for extroverts

            resultsSymbol.empty();
            if(user.score > 0) {
                $('body').css("background", "rgb(255, 58, 127)");
                for (let i=0; i < user.score; i++) {
                    resultsSymbol.append('<img src="party-hat.png"/>');
                };
            } else if(user.score < 0) {
                $('body').css("background", "rgb(146, 196, 244)");
                for (let i=0; i > user.score; i--) {
                    resultsSymbol.append('<img src="bookworm.png"/>');
                };  
            };
        });


        request.fail(function(response){
            console.log('ERROR B/C' + response.statusText);
        });

    };

});
