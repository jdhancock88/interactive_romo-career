import json
import pprint
import requests
from bs4 import BeautifulSoup
from datetime import datetime


# the path of the file where the data will utimately live.
data_file = "/Users/johnhancock/Desktop/interactives/working/romo-career/build/static/js/test-data.json"

# the years and weeks we want to scape, replace the years list with the years a particular
# quarterback played with a particular team

years = ["2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016"]
weeks = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"]

# the team id that corresponds to the team we're searching
team = "dal"

# the player we're searching for
player = "Tony Romo"

# the list that will eventually hold all our data
qb = []

# function that gets our data for each year
def get_passes(year):

    # the season dictionary that gets created for each season and appended to the qb list
    season = {
        "season_year": year,
        "plays": []
    }

    # for every week in this season, return the content for the url that corresponds to that
    # given week in the given year for the given team. This url includes regular season and
    # playoff games. If you wnat something different, you may need to find the URL you need
    # via pro-football-reference's play index tool
    for week in weeks:

        url = "http://www.pro-football-reference.com/play-index/play_finder.cgi?request=1&super_bowl=0&match=summary_all&year_min=" + year + "&year_max=" + year + "&team_id=" + team + "&game_type=E&game_num_min=" + week + "&game_num_max="+ week + "&week_num_min=0&week_num_max=99&quarter=1&quarter=2&quarter=3&quarter=4&quarter=5&tr_gtlt=lt&minutes=15&seconds=00&down=0&down=1&down=2&down=3&down=4&yg_gtlt=gt&is_first_down=-1&field_pos_min_field=team&field_pos_max_field=team&end_field_pos_min_field=team&end_field_pos_max_field=team&type=PASS&is_complete=-1&is_turnover=-1&turnover_type=interception&turnover_type=fumble&is_scoring=-1&score_type=touchdown&score_type=field_goal&score_type=safety&is_sack=0&include_kneels=0&no_play=0&order_by=yards&more_options=0&rush_direction=LE&rush_direction=LT&rush_direction=LG&rush_direction=M&rush_direction=RG&rush_direction=RT&rush_direction=RE&pass_location=SL&pass_location=SM&pass_location=SR&pass_location=DL&pass_location=DM&pass_location=DR"


        # the result of the url requests
        r = requests.get(url)

        # the content parsed back using BeautifulSoup
        content = BeautifulSoup(r.content, "html.parser")

        # find the table with the id "all_plays", which holds each play that matches our criteria
        # for the given week, season, team
        table = content.find("table", {"id": "all_plays"})

        # this is lightswitch to see if a game exists at that url. For example, some years
        # don't have games in weeks above 17 (playoff weeks)
        is_game = False

        # try to find a tbody tag within our table.
        try:
            table_body = table.find("tbody")

            # due to some incorrect html parsing in the romo data set, we have to find
            # all the rows in the content for week 1 of 2015. else, we're just find
            # rows in the table_body content
            if year == "2015" and week == "1":
                rows = content.findAll("tr")
            else:
                rows = table_body.findAll("tr")

            # if we find a tbody within the table, we flip is_game to true
            is_game = True
        except:
            is_game = False
            pass

        # if we have a game for the week/year
        if is_game:

            # find all the table cells for each row within the rows list
            for row in rows:
                cells = row.findAll("td")
                # we check that we have at least eight cells (a check to make sure we're looking
                # at a play row, and we check for the player name in the details, so we're only
                # formatting data that contains our player
                if len(cells) > 8 and player in cells[8].text:

                    # the date in each row is listed in a th tag. Find that tag,
                    # the anchor tag, then the string within that anchor tag, and set that
                    # as the date
                    th = row.find("th")
                    anchor = th.find("a")
                    date = anchor.string

                    # pull out the result of the play
                    result = cells[8].text

                    # set up a variable that will hold whether the result was complete or incomplete
                    pass_result = ""

                    # set up interception and touchdown flags that we'll change based on the result
                    interception = False
                    touchdown = False

                    # create a location variable that will determine which side of the field the
                    # ball is on, and a spot variable to hold the yardline
                    location = cells[6].text
                    location = location.split(" ")
                    spot = 0

                    # pull the time of the play and replace the ":" with ".", so we can
                    # convert that time to a number and sort the plays within the quarter they
                    # happened
                    sort_time = cells[3].text.replace(":", ".")
                    sort_time = float(sort_time)

                    # will pull the name of the receiver on completed passes for the target variable
                    target = ""

                    # flag will be a variable that tells us if there's an error in the details where
                    # a player's name is not present
                    flag = False

                    # check if the string "Player Name pass complete " is in the result string.
                    # if it is, split the string at the word "to "
                    if "{} pass complete ".format(player) in result:
                        target = result.split("to ")
                        # try spliting the second element in target at the space, then constructing the player
                        # name by the resulting sides of that split
                        try:
                            target = target[1].split(" ")
                            target = target[0] + " " + target[1]
                        # if there's no player name there to split, set flat to true and move on. This
                        # will help us know which plays are missing receiver names later one for error checking
                        except:
                            flag = True
                            pass

                    # next, we're going to figure out the spot of the ball. if the first item in the location
                    # list is the team we're searching for, then we know we're on dallas side of the field and  element
                    # can take the second in the list as the spot of the ball
                    if location[0] == team.upper():
                        spot = int(location[1])
                    # else, if location[0] is not tea we're focusing on, we know the spot is on the other end of the field
                    # we get teh spot by subtracting the location yard line from 50, then adding 50 to the remainder.
                    else:
                        spot = 50 + (50 - int(location[1]))

                    # figure out the result of the play based on the format of the result string
                    if "{} pass complete".format(player) in result:
                        pass_result = "complete"
                    elif "{} pass incomplete".format(player) in result:
                        pass_result = "incomplete"
                    elif "{} spiked the ball".format(player) in result:
                        pass_result = "incomplete"

                    # chceck if touchdown is in the result and flip the touchdown flag
                    if "touchdown" in result:
                        touchdown = True

                    # if intercepted in the result, set touchdown to false and interception to true
                    # we set touchdown to false because sometimes interceptions are returned for touchdowns
                    if "intercepted" in result:
                        touchdown = False
                        interception = True

                    # likewise with fumbles. if the ball is fumbled, our qb doesn't get credit for the td
                    if "fumbles" in result:
                        touchdown = False

                    # in some instances, the yardage cell is missing. If it is, mark yards as error so we
                    # can manually double check and correct later
                    try:
                        yards = cells[9].text
                    except:
                        yards = "error"
                        pass

                    # if pass_result has a length, we know there was a pass attempt. create a dict for that
                    # attempt and append it to that season's plays list
                    if len(pass_result) > 0:
                        play = {
                            "date": date,
                            "season": year,
                            "opp": cells[1].text,
                            "quarter": int(cells[2].text),
                            "time": cells[3].text,
                            "detail": cells[8].text,
                            "yards": yards,
                            "result": pass_result,
                            "week": int(week),
                            "interception": interception,
                            "touchdown": touchdown,
                            "spot": spot,
                            "target": target,
                            "error": flag,
                            "sort_time": sort_time
                        }

                        season["plays"].append(play)

    #append that season to the qb list
    qb.append(season)

# run the function to get the pass attempts for each year in the years list
for year in years:
    get_passes(year)

# open the file where the data will be dumped
qb_passes = open(data_file, "w")

# dump the data
json.dump(qb, qb_passes)

# close the file
qb_passes.close()
