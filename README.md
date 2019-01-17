# memory-game
Simple online game to train your memory. 

Served by Express, rendered via Pug, powered by some vanilla JS scripts on the front. 

There was this game when i was a kid, where you need to find identical pairs hidden under blocks. 
You only see two blocks open at once, so you need to memorize correct positions to advance.
Decided to make each block-open action a server request so that the user doesn't have the data available to him,
to avoid temptation to cheat, i guess? who would do that anyway. Now there is a slight lag between click and
block open, gotta do something about that.

Well, anyway, enjoy the game

Update: added 2 player mode!
