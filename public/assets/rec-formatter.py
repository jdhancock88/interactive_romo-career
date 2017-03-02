import json
import pprint

# data file that holds the plays json from the play-scraper.py output
data_source = "/Users/johnhancock/Desktop/interactives/working/romo-career/build/static/js/test-data.json"


plays = open(data_source).read()
data = json.loads(plays)

# getting the length of the data
l = len(data)

# our function that will check if a receiver's name appears in a given list and returns
# the receiver's index position within the list, or -1 if not in the list
def find(lst, key, value):
    for i, dic in enumerate(lst):
        if dic[key] == value:
            return i
    return -1

# our receivers list will hold all the dicts for the receivers
receivers = []

# for season in our season data
for datum in data:

    # assign that season's plays list to season_plays
    season_plays = datum["plays"]

    #for each play in that season's plays
    for play in season_plays:
        # grab the name of the receiver involved in the play
        target = play["target"]
        # if there is a receiver, check if the play's touchdown key is true. if
        # it is true, add 1 to the t variable, which stands for touchdown
        if len(target) > 0:
            t = 0
            if play["touchdown"] == True:
                t = 1

            # check if the receiver is already in the receiver's list
            index = find(receivers, "receiver", target)

            # check if there was yardage gained on the play. if so, convert that
            # string to a float and assign it to yards
            if len(play["yards"]) == 0:
                yards = 0
            else:
                yards = float(play["yards"])

            # if the receiver was not in the list of receivers, create a dictionary
            # for that receiver with the data of the receivers first entry, then add that
            # receiver to the receiver's list. If he is in the list, take the stats from
            # the given play and add them to that receiver's totals
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

# the file to dump the receiver data
output_file = "/Users/johnhancock/Desktop/interactives/working/romo-career/build/static/js/rec-test-data.json"

# open the output file
qb_receivers = open(output_file, "w")

#dump the resulting receiver data
json.dump(receivers, qb_receivers)

# close the output file
qb_receivers.close()
