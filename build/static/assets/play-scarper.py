import json
import pprint
import requests
from bs4 import BeautifulSoup

years = ["2006", "2007", "2008"]
weeks = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"]

# weeks = ["10"]

HEADERS = {'user-agent': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) '
                      'AppleWebKit/537.36 (KHTML, like Gecko) '
                      'Chrome/45.0.2454.101 Safari/537.36'),
       'referer': 'http://www.pro-football-reference.com/play-index/play_finder.cgi'
      }

romo = []

def get_passes(year):

    season = {
        "season_year": year,
        "plays": []
    }

    for week in weeks:

        url = "http://www.pro-football-reference.com/play-index/play_finder.cgi?request=1&super_bowl=0&match=summary_all&year_min=" + year + "&year_max=" + year + "&team_id=dal&game_type=R&game_num_min=" + week + "&game_num_max="+ week + "&week_num_min=0&week_num_max=99&quarter=1&quarter=2&quarter=3&quarter=4&quarter=5&tr_gtlt=lt&minutes=15&seconds=00&down=0&down=1&down=2&down=3&down=4&yg_gtlt=gt&is_first_down=-1&field_pos_min_field=team&field_pos_max_field=team&end_field_pos_min_field=team&end_field_pos_max_field=team&type=PASS&is_complete=-1&is_turnover=-1&turnover_type=interception&turnover_type=fumble&is_scoring=-1&score_type=touchdown&score_type=field_goal&score_type=safety&is_sack=0&include_kneels=0&no_play=0&order_by=yards&more_options=0&rush_direction=LE&rush_direction=LT&rush_direction=LG&rush_direction=M&rush_direction=RG&rush_direction=RT&rush_direction=RE&pass_location=SL&pass_location=SM&pass_location=SR&pass_location=DL&pass_location=DM&pass_location=DR"

        r = requests.get(url)
        content = BeautifulSoup(r.content, "html.parser")
        table = content.find("table", {"id": "all_plays"})
        is_game = False
        try:
            table_body = table.find("tbody")
            rows = table_body.findAll("tr")
            is_game = True
        except:
            is_game = False
            pass

        if is_game:
            for row in rows:

                th = row.find("th")
                anchor = th.find("a")
                date = anchor.string

                cells = row.findAll("td")
                result = cells[8].text
                pass_result = ""
                interception = False
                touchdown = False
                location = cells[6].text
                location = location.split(" ")
                spot = 0

                target = ""
                flag = False

                if "Tony Romo pass complete " in result:
                    target = result.split("to ")
                    try:
                        target = target[1].split(" ")
                        target = target[0] + " " + target[1]
                    except:
                        flag = True
                        pass

                if location[0] == "DAL":
                    spot = int(location[1])
                else:
                    spot = 50 + (50 - int(location[1]))

                if "Tony Romo pass complete" in result:
                    pass_result = "complete"
                elif "Tony Romo pass incomplete" in result:
                    pass_result = "incomplete"
                elif "Tony Romo spiked the ball" in result:
                    pass_result = "incomplete"

                if "touchdown" in result:
                    touchdown = True

                if "intercepted" in result:
                    touchdown = False
                    interception = True

                if "fumbles" in result:
                    touchdown = False

                if len(pass_result) > 0:

                    play = {
                        "date": date,
                        "opp": cells[1].text,
                        "quarter": cells[2].text,
                        "time": cells[3].text,
                        "detail": cells[8].text,
                        "yards": cells[9].text,
                        "result": pass_result,
                        "week": week,
                        "interception": interception,
                        "touchdown": touchdown,
                        "spot": spot,
                        "target": target,
                        "error": flag
                    }


                    season["plays"].append(play)

    romo.append(season)

for year in years:
    get_passes(year)

romo_passes = open("/Users/johnhancock/Desktop/interactives/working/romo-career/build/static/js/data.json", "w")

json.dump(romo, romo_passes)

romo_passes.close()
