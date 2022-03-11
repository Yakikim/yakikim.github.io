import requests
import pandas as pd
import codecs

from requests.auth import HTTPBasicAuth
my_headers = HTTPBasicAuth('yakiki@openu.ac.il','qmycoyt4oh3nfsemaszzgfahwb7idrgaqbrj2lfbxipydw6hakfa')

response = requests.get("http://tfs1:8080/tfs/Codesafe/Oracle%20APEX/_apis/work/teamsettings/iterations?api-version=4.1", auth=my_headers)

dftext = response.json()
df = pd.DataFrame(dftext['value'])

iterationid = df['id'][0]
response = requests.get("http://tfs1:8080/tfs/Codesafe/Oracle%20APEX/_apis/work/teamsettings/iterations/" + iterationid +"/workitems?api-version=4.1-preview.1", auth=my_headers)
dftext = response.json()

ids = str()
for x in dftext['workItemRelations'] :
    ids = ids + str(x['target']['id']) + ","
ids = ids[:-1]
response = requests.get("http://tfs1:8080/tfs/Codesafe/Oracle%20APEX/_apis/wit/workitems/?ids=" + str(ids), auth=my_headers)
restext = response.json()['value']
wit_list = []
for wit_info in restext:
    wit_list.append([int(wit_info['id']), wit_info['url'], wit_info['fields']['System.State'], wit_info['fields']['System.Title'] ,wit_info['fields']['System.WorkItemType'] , wit_info['fields']])

wit_df = pd.DataFrame(data =wit_list, columns=['id', 'url', 'State' ,'Title', 'Type' ,'fields'] )
baseFilePath = "C:/Users/yakiki.OPENU/Main/OP/GitREPOS/github/MyObsidian/📒Notes/"
filePath =  input('Type the file in /Notes:')
fullPath = baseFilePath + filePath + ".md"
myfile = codecs.open(fullPath, "a", "utf-8")
myfile.writelines('\n\n## This Week\'s Work Items \n')
myfile.write('| Type | ID | Title | State |\n')
myfile.write('| -- | -- | -- | -- |\n')
for ind, row in wit_df.iterrows():
    if row['State'] != 'Closed' :
        myfile.write('| '+ row['Type']+ ' |  '+  str(row['id']) + ' |['+ row['Title'] +']('+ row['url'] +" ) | "+ row['State']+ '|\n')
myfile.writelines('\n')
for ind, row in wit_df.iterrows():
    myfile.write ('- [ ] #task Type "'+ row['Type']+'" ID '+ str(row['id']) +' Title[['+ row['url'] +'|'+ row['Title'] +"]]\n") if row['State'] != 'Closed' else ' '

myfile.close()