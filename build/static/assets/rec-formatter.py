import json
import pprint

plays = open("/Users/johnhancock/Desktop/interactives/working/romo-career/build/static/js/data.json").read()


data = json.loads(plays)

l = len(data)

def find(lst, key, value):
    for i, dic in enumerate(lst):
        if dic[key] == value:
            return i
    return -1

receivers = []
print data[0]["plays"][2]
for x in range(0, (l-1)):

    season_plays = data[x]["plays"]
    for play in season_plays:
        target = play["target"]
        print target
        if len(target) > 0:
            t = 0
            if play["touchdown"] == True:
                t = 1

            index = find(receivers, "receiver", target)
            print play
            if len(play["yards"]) == 0:
                yards = 0
            else:
                yards = float(play["yards"])
            print yards
            if index == -1:
                r = {
                    "receiver": target,
                    "catches": 1,
                    "yards": yards,
                    "touchdowns": t
                }
                receivers.append(r)
            else:
                old_yards = receivers[index]["yards"]
                new_yards = old_yards + yards
                receivers[index]["catches"] += 1
                receivers[index]["yards"]= new_yards
                receivers[index]["touchdowns"] += t

print receivers


romo_receivers = open("/Users/johnhancock/Desktop/interactives/working/romo-career/build/static/js/rec-data.json", "w")

json.dump(receivers, romo_receivers)

romo_receivers.close()
