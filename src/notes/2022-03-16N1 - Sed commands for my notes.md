---
layout: mynote
cssclasses: ltr
tags: [sed, bash, devops, head, unix,shell, script] 
created: 2022-03-16 12:33
modified: 2022-03-16 12:33
type: document
title: 2022-03-16N1 - Sed commands for my notes
---
Week Of: [[2022-03-13]]
[[2022-03-16]]

[[home]]/

## החלפת שורת ה- Link
לא מעודכן
````ad-code
```shell
for i in $(find . -type f -maxdepth 7 -mindepth 1 -printf "%p\n"); do 
sed -i '1 s/UTF-8/Windows-1255/g' $i; 
done;
```
````

### החלפת Bash  ב bash
```bash
while read p; do   sed -i 's/"^[```]+Bash"/"```bash"/g' "$p"; done < findresults.txt
```

### replace entire line start with string 
```ad-note
-i is for commiting the replace. In case you just want to see the content as it supposed to be after the change run the command without the "-i"
```
```bash
sed -i 's/^link: [[][[].*/layout: dafyomi/g' "2022-02-08DY - Moed Katan 27.md"
```
##### run this for full directory
-type f is for not including the directories
```bash
find ./ -type f -exec sed -i 's/^link: [[][[].*/layout: dafyomi/g' {} \;
```


### Replace the first line and add layout
#### collecting the filenames

for those of the firstline ="---"
```bash
for file in * ; do
if [[ $(head -1 "$file") == '---'* ]]; then
   echo "$file" 
fi
done > txttoupdate.txt;
```

for those of the second line ="---"
```bash
for file in * ; do
if [[ $(sed -n '2p' "$file" ) == '---'* ]]; then
   echo "$file"
fi
done > txttoupdate2.txt;
```
#### replace

```bash
while read p; do   
sed -i '1 s/---/---\nlayout: mynote/g' "$p"; 
done < txttoupdate.txt
 
```
```bash
while read p; do   
sed -i '1s/.*/---/' "$p"; 
done < txttoupdate2.txt
```
```bash
while read p; do   
sed -i '2s/---/layout: mynote/' "$p"; 
done < txttoupdate2.txt
```

those remains:
```bash
for file in * ; do
if [[ $(sed -n '1p' "$file" ) != '---'* ]]; then
   echo "$file"
fi
done
```

## docker run

```bash
docker run --mount type=bind,src=${pwd}/MyObsidian/menu,dst=/app/src/menu,readonly --mount type=bind,src=${pwd}/MyObsidian/notes,dst=/app/src/notes,readonly --mount type=bind,src=${pwd}/MySite/src/posts,dst=/app/src/posts,readonly --name myserver -p 8080:8080 -p 8081:8081 obsidian_11ty
```