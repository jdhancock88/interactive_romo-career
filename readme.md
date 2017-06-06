# What this is
This is an interactive tour of Tony Romo's career, though by switching out the data and some small customization to the scrapers, you could create these data visualizations for any quarterback. View the published project [here](https://interactives.dallasnews.com/2017/romo-career/).

# How does it work
In the `build > static > assets` directory there are two scrapers, the `play-scraper.py` and the `rec-formatter.py` files that pull and format the data.

### Play-scraper
`play-scraper` is the backbone of the scraping portion of the project. It uses [Pro Football Reference's](http://www.pro-football-reference.com) play index tool to go year-by-year, game-by-game and grab the results of each passing play for the supplied player name, formatting them into a list of dictionary that contain the season year and a list of plays for that year.

### Rec-formatter
`rec-formatter` is fed the results of `play-scraper,` creating a list of dictionaries for each receiver that appears in the `play-scraper` data.

# Pit falls in the data
Play index data is not always the most accurate. For example, in the Tony Romo data set, there were a couple of problems I encounted, some specific to the data set and others more generally related to the site output.

##### Missing player names
Within the play index results, the player that caught the pass from Romo isn't listed separately, but instead, is listed as part of the detail of the play result. In a little over a dozen instances, Roy Williams name wasn't included, but instead, was missing altogether or was replaced with what looked like a badly formatted variable name. It took some comparing of the data set to other play-by-play sources such as ESPN or the NFL to ferret out who was missing.

##### Incomplete play details
Play index details only lists the person who initially caught the ball and where he was tackled or lost possession of the ball. However, in some instances, details of what happened after that player caught the ball that would impact final numbers were not included (for example, yardage lost or gained by other players due to laterals, yardage lost due to fumbling the ball and possession changes or recoveries at a different yardage marker).

The first step in discovering these issues was checking the total receiving yards, receptions and touchdowns of all the of the individual receivers in the rec-formatter data against the quarterback's career numbers. Once discrepencies were found, I had to search season by season and game by game to find where the yardage was off, and then go over those games play-by-play to find the offending play and adjust the data manually to account for the missing data.

##### Badly formatted html
Once the urls for the play index are scraped, the resulting content is passed through the python library Beautiful Soup. In one instance, one of the table rows had an orphaned closing anchor tag. Beautiful Soup didn't know what to make of it, and it closed out the entire html content, leaving some play detail table rows unscrapable.

You'll notice in the particular scraper for Romo, I had figured out which year and game was breaking, and wrote an `if/else` function to account for the error.
