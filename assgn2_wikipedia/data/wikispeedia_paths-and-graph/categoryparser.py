#!usr/bin python

import csv, json

cats = {}
members = {}
# itemlinks = []
categoryNames = set()
categorylinks = {}
realLinks = []

full_names = {}
full_data = {}


with open('categories.tsv') as categories:
    reader = csv.reader(categories, delimiter='\t')
    for line in reader:
        if not (len(line) and len(line[0]) and line[0][0] != "#"): continue

        name = line[0]
        members[name] = []
        cat = line[1].split('.')
        curr = cats
        currName = ""
        for sub in cat:
            if sub not in curr:
                curr[sub] = {}
            curr = curr[sub]
            currName += "." + sub
            categoryNames.add(currName)
            members[name].append(currName)

        full_names[name] = line[1] + "." + name
        full_data[name] = { "name" : full_names[name], "imports" : []}


# print sorted(list(categoryNames))
with open('links.tsv') as links:
    reader = csv.reader(links, delimiter='\t')
    for line in reader:
        if not (len(line) and len(line[0]) and line[0][0] != "#"): continue

        source = line[0]
        target = line[1]


        if not (source in members and target in members): continue
        for cat_src in members[source]:
            if cat_src not in categorylinks: categorylinks[cat_src] = {}
            for cat_tar in members[target]:
                if cat_tar == cat_src: continue
                if cat_tar not in categorylinks[cat_src]:
                    categorylinks[cat_src][cat_tar] = 0
                categorylinks[cat_src][cat_tar] += 1

        full_data[source]["imports"].append(full_names[target])




for cat in categorylinks:
    for cat2 in categorylinks[cat]:
        realLinks.append({"source" : cat, "target" : cat2, "value" : categorylinks[cat][cat2]})


connections = [full_data[name] for name in full_data]





with open('output.json', "w") as out:
    data = {
        "cat_hierarchy" : cats,
        "members" : members,
        "categories" : list({"id" : k} for k in categoryNames),
        "links" : realLinks,
        "articles" : list({"id" : k} for k in members),
        "connections" : connections
    }
    out.write(json.dumps(data, indent=4, separators=(',', ': ')))


