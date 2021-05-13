-- Documentation for neuron.dhall: https://neuron.zettel.page/configuration
{ siteTitle = "Yaki's Dcomumentanions"
, author = Some "Yaki Kimhi"
, siteBaseUrl = Some "https://yakikim.github.io/yaki/"
-- List of color names: https://semantic-ui.com/usage/theming.html#sitewide-defaults
, theme = "grey"
-- This is used in the "edit" button
, editUrl = Some "https://github.com/Yakikim/yaki/edit/master"
, plugins = [ "neuronignore", "links", "uptree", "feed" ,"dirtree" ,"tags"]
}
