Array.prototype.shuffle = function() {
	// Fisher-Yates shuffle
	var m = this.length, t, i;
	while (m) {
		i = Math.floor(Math.random() * m--);
		t = this[m];
		this[m] = this[i];
		this[i] = t;
	}
};

function TimpReactie(canvasE, resultsE) {
	this.canvasElement = canvasE;
	this.resultsElement = resultsE;
	this.canvas = canvas.getContext("2d");
	this.states = [
		'start_screen',
		'game_screen',
		'color_match', 
		'end_screen',
	];
	this.currentState = 0;

	// variabile globale pentru game_screen
	// se calculeaza timpul de reactie
	this.time_start 	= null;
	this.time_end		= null;
	this.try_counter 	= 0;
	this.max_tries 		= 5;
	this.diffs			= [];
	this.results_printed = false;
	this.space_pressed = false;
	this.enter_pressed = false;
	this.color_match_started = false;
	this.medii          = [];
	this.colorID        = -1;
	this.nameID			= -1;
	this.time_penalty   = 2000;
	this.correct_matches = 0;
	this.colors1 = [ "deeppink", "orange", "purple", "deepskyblue", "gold", "crimson", 
					"forestgreen", "lawngreen", "cornflowerblue" ];
	this.colors2 = ["crimson", "deepskyblue", "gold", "orangered", "forestgreen", "black", "purple"];
	this.names = ["ROSU", "ALBASTRU", "GALBEN", "PORTOCALIU", "VERDE", "NEGRU", "VIOLET"];

	this.setup();
	this.startScreen();
	//console.log(this.canvas);
	// this.events.click.call(this);	
}

TimpReactie.prototype.clear = function() {
	this.canvas.translate(0, 0);
	this.canvas.clearRect(0, 0, this.canvasElement.width(), this.canvasElement.height());
}

TimpReactie.prototype.nextState = function() {
	if(this.states[this.currentState] == 'start_screen') {
		// go to game_screen
		this.gameScreen();
	}
	else if(this.states[this.currentState] == 'game_screen') {
		this.colorMatch();
	}
	else if(this.states[this.currentState] == 'color_match') {
		// go to end game
	}

	this.currentState = (this.currentState + 1) % this.states.length;
	//console.log(this.currentState);
}

TimpReactie.prototype.setup = function() {
	// canvas never has keyboard focus
	$this = this;

	$(window).bind({
		keypress: function(event) {    
		   	// console.log($this);
	    	if($this.currentState == 0) {
	    		if(event.which == 13) {
					$this.nextState();
				}
			}
			else if ($this.currentState == 1 && $this.try_counter >= $this.max_tries && event.which == 13) {
				$this.nextState();
			}
			// modul de joc
			else if($this.currentState == 1) {
				// astept sa apese space
				if(event.which == 32 && $this.time_start != null && !$this.space_pressed) {
					$this.time_end = new Date();
					$this.space_pressed = true;

					if($this.try_counter >= $this.max_tries && !$this.results_printed) {
						$this.printTimeDiff();
						$this.printResults();
					}
					else if($this.try_counter < $this.max_tries) {
						$this.printTimeDiff();
						$this.gameScreenNewTry();
					}
				}
			}
	    	else if($this.currentState == 2 && !$this.color_match_started && event.which == 13) {
	    		$this.color_match_started = true;
	    		$this.colorMatchTry();
	    	}
	    	else if($this.currentState == 2) {
	    		if(event.which == 13 || event.which == 32 && $this.time_start != null && !$this.space_pressed && !$this.enter_pressed) {
	    			$this.time_end = new Date();
					$this.space_pressed = true;
					$this.enter_pressed = true;

					if($this.try_counter >= $this.max_tries && !$this.results_printed) {
						if(($this.colorID == $this.nameID && event.which == 13) || ($this.colorID != $this.nameID && event.which == 32))  
							$this.printTimeDiff(false);
						else if(($this.colorID == $this.nameID && event.which == 32) || ($this.colorID != $this.nameID && event.which == 13))
							$this.printTimeDiff(true);
						$this.printResults(true);
					}
					else if($this.try_counter < $this.max_tries) {
						if(($this.colorID == $this.nameID && event.which == 13) || ($this.colorID != $this.nameID && event.which == 32))  
							$this.printTimeDiff(false);
						else if(($this.colorID == $this.nameID && event.which == 32) || ($this.colorID != $this.nameID && event.which == 13))
							$this.printTimeDiff(true);
						$this.colorMatchTry();
					}
	    		}
	    	}
		}
	});
}

TimpReactie.prototype.startScreen = function() {
	this.clear();
	var imageBg = new Image(),
		imageBgNoText = new Image();

	var $this = this;
	imageBg.src = 'images/start_screen.png';
	imageBgNoText.src = 'images/start_screen_2.png';

	imageBg.onload = function() {
		imageBgNoText.onload = function() {
			var on = true,
	        timer = setInterval(function() {
	        	if($this.currentState != 0)
	        		return;

	            if(on) 
	                $this.canvas.drawImage(imageBg, 0, 0);
	          	else 
	                $this.canvas.drawImage(imageBgNoText, 0, 0);
	    
	            on = !on;  

	            if($this.currentState != 0) {
	            	//console.log($this.currentState);
	            	clearInterval(timer);
	            }

	        }, 800);			
		}		
	};
}

TimpReactie.prototype.gameScreen = function() {
	this.clear();
	this.colors1.shuffle();
	var imageBg1 = new Image();

	var $this = this;
	imageBg1.src = 'images/back_game_1.jpg';
	
	imageBg1.onload = function() {
		$this.canvas.drawImage(imageBg1, 0, 0);		

		// afisez textul
		$this.canvas.font = "bold 28px Comic Sans MS";
		$this.canvas.fillStyle = "aliceblue";
		$this.canvas.textAlign = "center";
		$this.canvas.fillText("Apasa SPACE cand cercul se coloreaza", $this.canvasElement.width() / 2, 50);	
		$this.canvas.fillText("(5 incercari)", $this.canvasElement.width() / 2, 85);	
		$this.gameScreenNewTry();		
	};
}

TimpReactie.prototype.gameScreenNewTry = function() {
	$this = this;

	// cercul
	var circleRadius = 100,
		circleX = $this.canvasElement.width() / 2,
		circleY = $this.canvasElement.height() / 2;

	var randomNumber = function(a, b) {
		return Math.floor((Math.random() * b) + a);
	}

	var nextColor = function() {
		return $this.colors1[$this.try_counter];
	};

	$this.try_counter++;

	setTimeout(function() {
		$this.canvas.fillStyle = nextColor();
		$this.canvas.beginPath();
		$this.canvas.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
		$this.canvas.fill(); 
		$this.time_start = new Date(); 
		$this.space_pressed = false;
	}, randomNumber(1500, 2001));
}

TimpReactie.prototype.colorMatch = function() {
	// Clear Data
	this.clear();
	this.diffs = [];
	this.enter_pressed = false;
	this.space_pressed = false;
	this.try_counter = 0;
	this.results_printed = false;
	$("#myResults").empty();

	// afisez textul
	this.canvas.font = "bold 18px Comic Sans MS";
	this.canvas.fillStyle = "black";
	this.canvas.textAlign = "center";
	this.canvas.fillText("Apasa SPACE daca culoarea corespunde cu numele, altfel apasa ENTER.", this.canvasElement.width() / 2, 50);	
	this.canvas.fillText("Pentru fiecare greseala vei fi penalizat cu " + $this.time_penalty + " ms!", this.canvasElement.width() / 2, 85);
	this.canvas.fillText("Apasa ENTER ca sa incepi jocul.", this.canvasElement.width() / 2, 120);
}

TimpReactie.prototype.colorMatchTry = function() {
	// Special Clear for Text
	this.canvas.fillStyle = "white";
	this.canvas.fillRect(0, 0, this.canvasElement.width(), this.canvasElement.height());
	
	var randomNumber = function(a, b) {
		return Math.floor((Math.random() * b) + a);
	}

	this.colorID = randomNumber(0, this.colors2.length);
	this.nameID = randomNumber(0, this.names.length);

	this.try_counter++;

	$this = this;
	setTimeout(function() {
		$this.canvas.font = "bold 34px Comic Sans MS";
		
		$this.canvas.fillStyle = $this.colors2[$this.colorID];
		// Mareste probabilitatea de a avea un match
		if(randomNumber(0, 101) < 40) {
			$this.nameID = $this.colorID;
		}
		console.log($this.colorID + " " + $this.nameID);
		$this.canvas.textAlign = "center";
		$this.canvas.fillText($this.names[$this.nameID], $this.canvasElement.width() / 2, $this.canvasElement.height() / 2);
		$this.time_start = new Date(); 
		$this.space_pressed = false;
		$this.enter_pressed = false;
	}, randomNumber(1000, 2001));
}

TimpReactie.prototype.printTimeDiff = function(isColorMatch) {
	$this = this;
	var diff = $this.time_end - $this.time_start;
	$this.canvas.font = "bold 24px Arial";
	$this.canvas.textAlign = "center";
	
	if(typeof(isColorMatch)==='undefined') {
		$this.diffs.push(diff);
		$this.canvas.fillStyle = "WhiteSmoke";
		$this.canvas.fillText("Timp: " + diff + " ms", $this.canvasElement.width() / 2, 220);
		$this.resultsElement.append($this.try_counter + ": " + diff + " ms<br />");
	}
	else if (isColorMatch) {
		$this.correct_matches++;
		$this.diffs.push(diff);
		$this.resultsElement.append($this.try_counter + ": " + diff + " ms <span style='color:green;'>[CORECT]</span><br />");
	}
	else {
		$this.diffs.push($this.time_penalty);
		$this.resultsElement.append($this.try_counter + ": " + $this.time_penalty + " ms <span style='color:red;'>[GRESIT]</span><br />");
	}
}

TimpReactie.prototype.printResults = function(isColorMatch) {
	$this = this;
	$this.results_printed = true;
	var media = 0;
	for(i = 0; i < this.diffs.length; i++) {
		media += this.diffs[i];
	}

	media = media / this.diffs.length;
	$this.medii.push(media);
	$this.resultsElement.append("----<br />");
	
	if(typeof(isColorMatch) === typeof(true)) {
		$this.canvas.fillStyle = "DarkBlue";
		$this.canvas.fillText("Ai avut " + $this.correct_matches + " potriviri corecte!", $this.canvasElement.width() / 2, 300);
		$this.resultsElement.append("Media 1: " + $this.medii[0] + " ms<br />");
		$this.resultsElement.append("Media 2: " + $this.medii[1] + " ms<br />");
	}
	else {
		$this.canvas.fillStyle = "white";
		$this.canvas.fillText("Apasa ENTER ca sa treci la urmatorul nivel.", $this.canvasElement.width() / 2, 370);
		$this.resultsElement.append("Media: " + media + " ms<br />");
	}
}

// DOM Manipulations
TimpReactie.prototype.events = {
	click: function() {
		var self = this;

		//alert("clicks");
	},

	keypress: function() {
		alert()
	}
};

