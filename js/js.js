function TimpReactie(canvasE, resultsE) {
	this.canvasElement = canvasE;
	this.resultsElement = resultsE;
	this.canvas = canvas.getContext("2d");
	this.states = [
		'start_screen',
		'game_screen',
		'end_screen',
	];
	this.currentState = 0;

	// variabile globale pentru game_screen
	// se calculeaza timpul de reactie
	this.time_start 	= null;
	this.time_end		= null;
	this.try_counter 	= 0;
	this.max_tries 		= 3;
	this.diffs			= [];
	this.results_printed = false;

	this.setup();
	this.startScreen();
	console.log(this.canvas);
	// this.events.click.call(this);	
}

TimpReactie.prototype.clear = function() {
	this.canvas.translate(0, 0);
	this.canvas.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
}

TimpReactie.prototype.nextState = function() {
	if(this.states[this.currentState] == 'start_screen') {
		// go to game_screen
		this.gameScreen();
	}
	else if(this.states[this.currentState] == 'game_screen') {
		// go to end_screen
	}

	this.currentState = (this.currentState + 1) % this.states.length;
	console.log(this.currentState);
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
			// modul de joc
			else if($this.currentState == 1) {
				// astept sa apese space
				if(event.which == 32 && $this.time_start != null) {
					$this.time_end = new Date();
					

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
	            	console.log($this.currentState);
	            	clearInterval(timer);
	            }

	        }, 800);			
		}		
	};
}


TimpReactie.prototype.gameScreen = function() {
	this.clear();
	var imageBg1 = new Image(),
		imageBg2 = new Image();

	var $this = this;
	imageBg1.src = 'images/back_game_1.jpg';
	imageBg2.src = 'images/back_game_2.jpg';
	
	imageBg1.onload = function() {
		$this.canvas.drawImage(imageBg1, 0, 0);		

		// afisez textul
		$this.canvas.font = "bold 32px Arial";
		$this.canvas.fillStyle = "#0048ab";
		$this.canvas.textAlign = "center";
		$this.canvas.fillText("1. Apasa SPACE cand patratul se coloreaza", $this.canvasElement.width() / 2, 100);	
		$this.gameScreenNewTry();		
	};
}

TimpReactie.prototype.gameScreenNewTry = function() {
	$this = this;
	// patratul
	var boxWidth = 600,
		boxHeight = 300,
		boxX = $this.canvasElement.width() / 2 - boxWidth / 2,
		boxY = 200;

	var colors = [
		"red", "cyan", "blue", "magenta", "green", "orange", "orangered", "deeppink", 
		"purple", "teal", "turquoise", "yellow", "gold", "royalblue", "navy", "lavender", "gray"
	];

	var randomNumber = function(a, b) {
		return Math.floor((Math.random() * b) + a);
	}

	var randomColor = function() {
		return colors[randomNumber(0, colors.length)];
	};

	
	$this.try_counter++;

	// patratul gol
	$this.canvas.strokeRect(boxX, boxY, boxWidth, boxHeight);

	setTimeout(function() { 
		$this.canvas.fillStyle = randomColor();
		$this.canvas.fillRect(boxX, boxY, boxWidth, boxHeight); 
		$this.time_start = new Date(); 
	}, randomNumber(1000, 3001));
}

TimpReactie.prototype.printTimeDiff = function() {
	$this = this;
	var diff = $this.time_end - $this.time_start;
	$this.diffs.push(diff);

	$this.canvas.font = "bold 24px Arial";
	$this.canvas.fillStyle = "#0048ab";
	$this.canvas.textAlign = "center";
	$this.canvas.fillText("Timp: " + diff + "ms", $this.canvasElement.width() / 2, 350);

	$this.resultsElement.append($this.try_counter + ": " + diff + " ms<br />");
}

TimpReactie.prototype.printResults = function() {
	$this = this;
	$this.results_printed = true;
	var media = 0;
	for(i = 0; i < this.diffs.length; i++) {
		media += this.diffs[i];
	}

	media = media / this.diffs.length;
	$this.resultsElement.append("----<br />");
	$this.resultsElement.append("Media: " + media + " ms<br />");
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

