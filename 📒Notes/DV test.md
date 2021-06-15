---
datey: '2021-05-23' 
---
[[HOME]]/[[Obsidian]]/[[Plugins]]
# Dataview tests
```dataview
list where file.day
sort file.day desc
``` 

```dataview
TASK from  #weeklynote where !completed and file.name >= date(today)
```

```
TASK from "General/Notes" where file.name <= date(today) - dur(3 day)
```